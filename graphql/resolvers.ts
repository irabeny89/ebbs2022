import { randomBytes } from "crypto";
import config from "../config";
import { verify, JwtPayload } from "jsonwebtoken";
import type {
  ChangePasswordVariableType,
  GraphContextType,
  UserLoginVariableType,
  UserPayloadType,
  UserRegisterVariableType,
} from "types";
import {
  authUser,
  comparePassword,
  getHashedPassword,
  handleError,
  setCookie,
} from "../utils";
import {
  AuthenticationError,
  UserInputError,
  ValidationError,
  ApolloError,
} from "apollo-server-micro";
import {
  createTransport,
  createTestAccount,
  getTestMessageUrl,
} from "nodemailer";

const {
  environmentVariable: {
    jwtRefreshSecret,
    ebbsEmailHost,
    ebbsUsername,
    ebbsPassword,
  },
  appData: { generalErrorMessage, title: ebbsTitle, passCodeDuration, abbr },
} = config;

const resolvers = {
  Query: {
    hello: () => "world!",
    logout: (_: any, __: any, { res }: GraphContextType) => (
      setCookie(res, "token", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: true,
        secure: process.env.NODE_ENV == "production" ? true : false,
        path: "/api/graphql",
      }),
      "Logged out successfully."
    ),
    login: async (
      _: any,
      { email, password }: UserLoginVariableType,
      { UserModel, ServiceModel, res }: GraphContextType
    ) => {
      try {
        // find user
        const user = await UserModel.findOne({ email })
          .select("password salt username serviceId")
          .lean()
          .exec();
        // throw error if user does not exist
        handleError(!user, AuthenticationError, "Authentication failed!");
        // if user exist validate password
        // then authenticate user & return token
        return (
          (await comparePassword(user?.password!, password, user?.salt!)) &&
          authUser(
            {
              audience: "USER",
              id: user?._id?.toString()!,
              username: user?.username!,
              serviceId: (
                await ServiceModel.findOne({ owner: user?._id })
                  .select("_id")
                  .lean()
                  .exec()
              )?._id?.toString(),
            },
            res
          ).accessToken
        );
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    refreshToken: async (
      _: any,
      __: any,
      {
        req: {
          cookies: { token },
        },
        res,
      }: GraphContextType
    ) => {
      try {
        // verify refresh token
        const { aud, sub, username } = verify(
          token,
          jwtRefreshSecret
        ) as JwtPayload & UserPayloadType;
        // re-auth user & return token
        return authUser(
          {
            id: sub!,
            audience: aud as "ADMIN" | "USER",
            username,
          },
          res
        ).accessToken;
      } catch (error) {
        // log error for more
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    service: async (
      _: any,
      { serviceId }: { serviceId: string },
      { ServiceModel }: GraphContextType
    ) => {
      try {
        return await ServiceModel.findById(serviceId).lean().exec();
      } catch (error) {
        handleError(error, Error, generalErrorMessage);
      }
    },
  },
  Mutation: {
    userRegister: async (
      _: any,
      {
        userRegisterInput: { email, password, username, ...serviceData },
      }: UserRegisterVariableType,
      { UserModel, ServiceModel, res }: GraphContextType
    ) => {
      try {
        // if user exist throw error or password length < 8
        handleError(
          await UserModel.findOne({ email }).select("email").lean().exec(),
          AuthenticationError,
          "User already exist"
        ),
          handleError(
            password.length < 8,
            UserInputError,
            "Password should be 8 or more characters"
          );
        // else create user
        const { id, username: _username } = (
          await UserModel.create([
            { email, username, ...(await getHashedPassword(password)) },
          ])
        )[0];
        // create service for user
        // return access token
        return authUser(
          {
            audience: "USER",
            id,
            username: _username,
            serviceId: (
              await ServiceModel.create([{ ...serviceData, owner: id }])
            )[0].id,
          },
          res
        ).accessToken;
      } catch (error: any) {
        // NOTE: log error to debug
        ["ValidationError", "UserInputError"].includes(error.name) &&
          handleError(
            error,
            ValidationError,
            "Validate your inputs. " + generalErrorMessage
          );
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    requestPassCode: async (
      _: any,
      { email }: { email: string },
      { UserModel }: GraphContextType
    ) => {
      try {
        // handle error if user is not found
        handleError(
          !(await UserModel.findOne({ email }).select("_id").lean().exec()),
          UserInputError,
          "User not found."
        );
        // generate pass code
        const passCode = randomBytes(16).toString("hex");
        // ethereal test account
        const testAccount =
            process.env.NODE_ENV !== "production"
              ? await createTestAccount()
              : { user: "", pass: "" },
          // send pass code to user email
          info = await createTransport({
            host: ebbsEmailHost,
            secure: process.env.NODE_ENV === "production",
            auth: {
              user:
                process.env.NODE_ENV === "production"
                  ? ebbsUsername
                  : testAccount.user,
              pass:
                process.env.NODE_ENV === "production"
                  ? ebbsPassword
                  : testAccount.pass,
            },
          }).sendMail({
            from: `${ebbsTitle}`,
            to: email,
            subject: `${abbr} Pass Code`,
            html: `<h1>${ebbsTitle}</h1>
          <h2>Pass Code: ${passCode}</h2>
          <p>It expires in ${passCodeDuration} minutes</p>`,
          });
        // log infoonse from email
        process.env.NODE_ENV === "development" &&
          (console.log(info), console.log(getTestMessageUrl(info)));
        // update user with passcode & expires in 15 minutes
        await UserModel.findOneAndUpdate(
          { email },
          {
            $set: {
              passCode,
              codeStart: new Date(),
              codeEnd: Date.now() + 9e5,
            },
          }
        )
          .select("_id")
          .lean()
          .exec();
        return "Passcode sent to your email successfully";
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, UserInputError, generalErrorMessage);
      }
    },
    changePassword: async (
      _: any,
      { newPassword, passCode }: ChangePasswordVariableType,
      { UserModel }: GraphContextType
    ) => {
      try {
        // find by passcode
        const user = await UserModel.findOne({ passCode })
          .select("codeEnd")
          .lean()
          .exec();
        // throw error if user is not found or cod eexpires
        handleError(
          !user || user?.codeEnd < new Date(),
          UserInputError,
          "Wrong or expired passcode. Try again."
        );
        // if user exist
        await UserModel.findByIdAndUpdate(user?._id, {
          $set: { ...(await getHashedPassword(newPassword)) },
        });
        return "Password changed successfully.";
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, UserInputError, generalErrorMessage);
      }
    },
  },
};

export default resolvers;
