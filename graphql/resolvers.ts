import { randomBytes } from "crypto";
import config from "../config";
import { verify, JwtPayload } from "jsonwebtoken";
import type {
  ChangePasswordVariableType,
  CommentType,
  CursorConnectionType,
  GraphContextType,
  OrderType,
  PagingInputType,
  ProductCategoryType,
  ProductType,
  ServiceType,
  ServiceUpdateVariableType,
  ServiceVertexType,
  UserLoginVariableType,
  UserPayloadType,
  UserRegisterVariableType,
} from "types";
import {
  authUser,
  comparePassword,
  getAuthPayload,
  getCursorConnection,
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

const {
  environmentVariable: { jwtRefreshSecret },
  appData: {
    generalErrorMessage,
    title: ebbsTitle,
    passCodeDuration,
    abbr,
    maxProductAllowed,
  },
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
        const { aud, sub, username, serviceId } = verify(
          token,
          jwtRefreshSecret
        ) as JwtPayload & UserPayloadType;
        // re-auth user & return token
        return authUser(
          {
            id: sub!,
            audience: aud as "ADMIN" | "USER",
            username,
            serviceId,
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
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
  },
  Mutation: {
    register: async (
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
      { UserModel, sendEmail }: GraphContextType
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
        // send email and log link for test account
        console.log(
          `test email link: ${
            (
              await sendEmail({
                from: `${ebbsTitle}`,
                to: email,
                subject: `${abbr} Pass Code`,
                html: `<h1>${ebbsTitle}</h1>
        <h2>Pass Code: ${passCode}</h2>
        <p>It expires in ${passCodeDuration} minutes</p>`,
              })
            ).testAccountMessageUrl
          }`
        );
        // update user document with passcode; it expires in 15 minutes
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
    myServiceUpdate: async (
      _: any,
      { args: serviceUpdate }: Record<"args", ServiceUpdateVariableType>,
      {
        ServiceModel,
        LikeModel,
        ProductModel,
        OrderModel,
        CommentModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ) => {
      try {
        // get service id or throw error
        const { serviceId } = getAuthPayload(authorization!);
        // list of service happy clients
        const happyClients =
            (
              await LikeModel.findOne({ selection: serviceId })
                .select("happyClients")
                .lean()
                .exec()
            )?.happyClients ?? [],
          products = await ProductModel.find().select("category").lean().exec(),
          // reduce list to deduplicated category list
          categories = products.reduce(
            (prev: ProductCategoryType[], { category }) =>
              prev.includes(category) ? prev : prev.concat(category),
            []
          );
        // update service if no error
        return {
          ...(await ServiceModel.findByIdAndUpdate(serviceId, {
            $set: serviceUpdate,
          })
            .lean()
            .exec()),
          likeCount: happyClients.length,
          happyClients,
          categories,
          maxProduct: maxProductAllowed,
          orderCount: (await OrderModel.find().select("_id").lean().exec())
            .length,
          productCount: products.length,
          commentCount: (await CommentModel.find().select("_id").lean().exec())
            .length,
        };
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
  },
  UserService: {
    products: async (
      parent: ServiceType,
      { args }: Record<"args", PagingInputType>,
      { ProductModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection<ProductType>({
          list:
            (await ProductModel.find({ provider: parent._id }).lean().exec()) ??
            [],
          ...args,
        });
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    comments: async (
      parent: ServiceType,
      { args }: Record<"args", PagingInputType>,
      { CommentModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection<CommentType>({
          list:
            (await CommentModel.find({ topic: parent._id }).lean().exec()) ??
            [],
          ...args,
        });
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    orders: async (
      parent: ServiceType,
      { args }: Record<"args", PagingInputType>,
      { OrderModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection<OrderType>({
          list:
            (await OrderModel.find({ provider: parent._id }).lean().exec()) ??
            [],
          ...args,
        });
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
  },
};

export default resolvers;
