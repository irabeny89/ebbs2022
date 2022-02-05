import { randomBytes } from "crypto";
import config from "../config";
import { verify, JwtPayload } from "jsonwebtoken";
import type {
  ChangePasswordVariableType,
  CommentType,
  CursorConnectionType,
  GraphContextType,
  NewProductVariableType,
  OrderType,
  PagingInputType,
  ProductCategoryType,
  ProductType,
  ProductVertexType,
  ServiceType,
  ServiceUpdateVariableType,
  ServiceVertexType,
  StatusType,
  UserLoginVariableType,
  UserPayloadType,
  UserRegisterVariableType,
  UserType,
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
    services: async (
      _: any,
      { args }: Record<"args", PagingInputType>,
      { ServiceModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection({
          list: await ServiceModel.find().lean().exec(),
          ...args,
        });
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    products: async (
      _: any,
      { args }: Record<"args", PagingInputType>,
      { ProductModel, OrderModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection<
          Omit<ProductVertexType, "createdAt"> & {
            createdAt: Date | string;
            saleCount: number;
          }
        >({
          list:
            (await Promise.all(
              (
                await ProductModel.find().lean().exec()
              ).map(async (item) => ({
                ...item,
                saleCount:
                  (
                    await OrderModel.findById(item._id)
                      .$where("status == SHIPPED")
                      .select("_id")
                      .lean()
                      .exec()
                  )?.length ?? 0,
              }))
            )) ?? [],
          ...args,
        });
      } catch (error) {
        console.log("====================================");
        console.log(error);
        console.log("====================================");
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    myOrders: async (
      _: any,
      { args }: Record<"args", PagingInputType>,
      {
        OrderModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ) => {
      try {
        return getCursorConnection({
          list: await OrderModel.find({
            provider: getAuthPayload(authorization!).serviceId,
          })
            .lean()
            .exec(),
          ...args,
        });
      } catch (error) {
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    myRequests: async (
      _: any,
      { args }: Record<"args", PagingInputType>,
      {
        OrderModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ) => {
      try {
        return getCursorConnection({
          list: await OrderModel.find({
            client: getAuthPayload(authorization!).serviceId,
          })
            .lean()
            .exec(),
          ...args,
        });
      } catch (error) {
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    me: async (
      _: any,
      __: any,
      {
        req: {
          headers: { authorization },
        },
        UserModel,
      }: GraphContextType
    ) => {
      try {
        return await UserModel.findById(getAuthPayload(authorization!).sub)
          .lean()
          .exec();
      } catch (error) {
        // NOTE: log to debug
        handleError(error, AuthenticationError, generalErrorMessage);
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
    ): Promise<string | undefined> => {
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
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        await ServiceModel.findByIdAndUpdate(
          getAuthPayload(authorization!).serviceId,
          {
            $set: serviceUpdate,
          }
        )
          .select("_id")
          .lean()
          .exec();
        return "Service updated successfully";
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    newProduct: async (
      _: any,
      { args }: Record<"args", Omit<ProductType, "provider">>,
      {
        ProductModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        // validate request auth
        // create product & return id
        return (
          await ProductModel.create({
            ...args,
            provider: getAuthPayload(authorization!).serviceId,
          })
        ).id;
      } catch (error) {
        // NOTE: log to debug
        handleError(error, UserInputError, generalErrorMessage);
      }
    },
    deleteMyProduct: async (
      _: any,
      { productId }: Record<"productId", string>,
      {
        ProductModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        // check permission before delete
        getAuthPayload(authorization!);
        await ProductModel.findByIdAndDelete(productId)
          .select("_id")
          .lean()
          .exec();
        return "Product deleted successfully";
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    myCommentPost: async (
      _: any,
      args: Record<"serviceId" | "post", string>,
      {
        CommentModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        // check permission or throw error
        await CommentModel.create([
          {
            topic: args.serviceId,
            post: args.post,
            poster: getAuthPayload(authorization!).sub,
          },
        ]);
        return "Comment posted successfully";
      } catch (error) {
        // NOTE: log to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    myFavService: async (
      _: any,
      args: { serviceId: string; isFav: boolean },
      {
        ServiceModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<boolean | undefined> => {
      try {
        const { sub } = getAuthPayload(authorization!);
        await ServiceModel.findByIdAndUpdate(
          args.serviceId,
          args.isFav
            ? {
                $addToSet: { happyClients: sub },
              }
            : { $pull: { happyClients: sub } }
        )
          .select("_id")
          .lean()
          .exec();
        return args.isFav;
      } catch (error) {
        // NOTE: log to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    serviceOrder: async (
      _: any,
      {
        args,
      }: Record<
        "args",
        Pick<
          OrderType,
          "items" | "phone" | "state" | "address" | "nearestBusStop"
        >
      >,
      {
        OrderModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        // check user permission
        getAuthPayload(authorization!);
        await OrderModel.create(args);
        return "Order created successfully";
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
    orderStatus: async (
      _: any,
      {
        args: { orderId, status, deliveryDate },
      }: {
        args: {
          orderId: string;
          status: "CANCELED" | "SHIPPED";
          deliveryDate: string;
        };
      },
      {
        OrderModel,
        req: {
          headers: { authorization },
        },
      }: GraphContextType
    ): Promise<string | undefined> => {
      try {
        // check user permission
        getAuthPayload(authorization!);
        await OrderModel.findByIdAndUpdate(orderId, {
          $set: { status, deliveryDate },
        })
          .select("_id")
          .lean()
          .exec();
        return status;
      } catch (error) {
        // NOTE: log to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
  },
  User: {
    username: async (
      parent: UserType,
      _: any,
      { UserModel }: GraphContextType
    ) => {
      try {
        return (
          await UserModel.findById(parent._id).select("username").lean().exec()
        )?.username;
      } catch (error) {
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    requests: async (
      parent: UserType,
      { args }: Record<"args", PagingInputType>,
      { OrderModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection({
          list: await OrderModel.find({
            client: parent._id,
          })
            .lean()
            .exec(),
          ...args,
        });
      } catch (error) {
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    service: async (
      _: any,
      __: any,
      {
        req: {
          headers: { authorization },
        },
        ServiceModel,
      }: GraphContextType
    ) => {
      try {
        return await ServiceModel.findById(
          getAuthPayload(authorization!).serviceId
        )
          .lean()
          .exec();
      } catch (error) {
        // NOTE: log to debug
        handleError(error, AuthenticationError, generalErrorMessage);
      }
    },
  },
  UserService: {
    title: async (
      parent: ServiceType,
      _: any,
      { ServiceModel }: GraphContextType
    ) => {
      try {
        return (
          await ServiceModel.findById(parent._id).select("title").lean().exec()
        )?.title;
      } catch (error) {
        // NOTE: log to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    products: async (
      parent: ServiceType,
      { args }: Record<"args", PagingInputType>,
      { ProductModel, OrderModel }: GraphContextType
    ) => {
      try {
        return getCursorConnection<
          Omit<ProductVertexType, "createdAt"> & {
            createdAt: Date | string;
            saleCount: number;
          }
        >({
          list:
            (await Promise.all(
              (
                await ProductModel.find({ provider: parent._id }).lean().exec()
              ).map(async (item) => ({
                ...item,
                saleCount:
                  (
                    await OrderModel.findById(item._id)
                      .$where("status == SHIPPED")
                      .select("_id")
                      .lean()
                      .exec()
                  )?.length ?? 0,
              }))
            )) ?? [],
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
    categories: async (
      { _id }: ServiceType,
      _: any,
      { ProductModel }: GraphContextType
    ) => {
      try {
        return (
          await ProductModel.find({ provider: _id })
            .select("category")
            .lean()
            .exec()
        ).reduce(
          (prev: ProductCategoryType[], { category }) =>
            prev.includes(category) ? prev : [...prev, category],
          []
        );
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    commentCount: async (
      { _id }: ServiceType,
      _: any,
      { CommentModel }: GraphContextType
    ) => {
      try {
        return (
          await CommentModel.find({ topic: _id }).select("_id").lean().exec()
        ).length;
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    productCount: async (
      { _id }: ServiceType,
      _: any,
      { ProductModel }: GraphContextType
    ) => {
      try {
        return (
          await ProductModel.find({ provider: _id }).select("_id").lean().exec()
        ).length;
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    orderCount: async (
      { _id }: ServiceType,
      _: any,
      { OrderModel }: GraphContextType
    ) => {
      try {
        return (
          await OrderModel.find({ provider: _id }).select("_id").lean().exec()
        ).length;
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
    likeCount: async (
      { _id }: ServiceType,
      _: any,
      { LikeModel }: GraphContextType
    ) => {
      try {
        return (
          await LikeModel.find({ selection: _id }).select("_id").lean().exec()
        ).length;
      } catch (error) {
        // NOTE: log error to debug
        handleError(error, Error, generalErrorMessage);
      }
    },
  },
};

export default resolvers;
