import { randomBytes } from "crypto";
import config from "../config";
import { verify, JwtPayload } from "jsonwebtoken";
import type {
  ChangePasswordVariableType,
  CommentType,
  GraphContextType,
  OrderType,
  PagingInputType,
  ProductCategoryType,
  ProductType,
  ProductVertexType,
  ServiceType,
  ServiceUpdateVariableType,
  UserLoginVariableType,
  UserPayloadType,
  RegisterVariableType,
  UserType,
  OrderStatsType,
  StatusType,
  PassCodeDataType,
} from "types";
import {
  authUser,
  comparePassword,
  devErrorLogger,
  getAuthPayload,
  getCursorConnection,
  getHash,
  getHashedPassword,
  handleError,
  setCookie,
  verifyPassCodeData,
} from "../utils";
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
  ApolloError,
  ApolloServer,
  gql,
} from "apollo-server-micro";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import UserModel from "mongoose/models/userModel";
import ServiceModel from "mongoose/models/serviceModel";
import ProductModel from "mongoose/models/productModel";
import CommentModel from "mongoose/models/commentModel";
import LikeModel from "mongoose/models/likeModel";
import OrderModel from "mongoose/models/orderModel";
import dbConnection from "mongoose/mongodb";
import { sendEmail } from "../utils";

const {
  environmentVariable: { jwtRefreshSecret },
  appData: {
    generalErrorMessage,
    title: ebbsTitle,
    passCodeDuration,
    abbr,
    maxProductAllowed,
    constants: { COOKIE_PASSCODE, COOKIE_CLEAR_OPTIONS },
  },
} = config;

export const getOrderItemStats = (orderItems: any[]): OrderStatsType =>
  orderItems.reduce(
    (prev, { status }) => ({ ...prev, [status]: ++prev[status] }),
    {
      PENDING: 0,
      CANCELED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
    }
  );

const apolloServer = new ApolloServer({
  typeDefs: gql`
    # -- query --
    type Query {
      "Hello world test"
      hello: String!
      "refresh auth token"
      refreshToken: String!
      "fields of a single service by id"
      service(serviceId: ID!): UserService
      "list of all service nodes"
      services(args: PagingInput!): ServiceConnection!
      "list of all product nodes"
      products(args: PagingInput!): ProductConnection!
      "list of products belonging to an authorized & authenticated user"
      myProducts(args: PagingInput!): ProductConnection!
      "list of orders belonging to an authorized & authenticated user"
      myOrders(args: PagingInput!): OrderConnection!
      "list of my requests belonging to an authorized & authenticated user"
      myRequests(args: PagingInput!): OrderConnection!
      "user login"
      login(email: String!, password: String!): String!
      "log user out"
      logout: String!
      "user profile data"
      me: User
      "request passcode to change password"
      requestPassCode(email: String!): String!
    }
    # -- mutation --
    type Mutation {
      "register new user"
      register(registerInput: RegisterInput!): String!
      "resetPassword with passcode"
      changePassword(passCode: String!, newPassword: String!): String!
      "like a service using the service ID and select action"
      myFavService(serviceId: ID!, isFav: Boolean!): Boolean!
      "send purchase request; creates new order"
      serviceOrder(args: ServiceOrderInput!): String!
      "set order status; updates order status"
      updateOrderItemStatus(args: OrderItemStatusInput!): String!
      "new product creation"
      newProduct(args: NewProductInput!): String!
      "delete product by an authorized user"
      deleteMyProduct(productId: ID!): String!
      "as an authorized user post comment on a service using it id"
      myCommentPost(serviceId: ID!, post: String!): String!
      "update service by an authorized user"
      myServiceUpdate(args: MyServiceUpdateInput!): String!
      "set the order delivery date"
      setOrderDeliveryDate(orderId: ID!, deliveryDate: String!): String!
    }

    # -- inputs --
    input OrderItemStatusInput {
      status: StatusOptions!
      itemId: ID!
    }

    input ServiceOrderInput {
      items: [OrderItemInput!]!
      phone: String!
      state: String!
      address: String!
      nearestBusStop: String!
    }

    input OrderItemInput {
      productId: ID!
      providerId: ID!
      providerTitle: String!
      name: String!
      price: Float!
      quantity: Int!
      cost: Float!
    }

    input UserPasswordChangeInput {
      newPassword: String!
      oldPassword: String!
    }

    input NewProductInput {
      name: String!
      description: String!
      images: [String]!
      video: String
      category: CategoryOption!
      tags: [String]
      price: Float!
    }

    input RegisterInput {
      username: String!
      email: String!
      password: String!
      title: String
      logo: String
      description: String
      state: String
    }

    input MyServiceUpdateInput {
      logo: String
      description: String
      state: String
      title: String
    }

    input UserUpdateInput {
      "user phone number"
      phone: String
      "resident state"
      state: String
      "resident country"
      country: String
      "business logo"
      logo: String
      "business description"
      description: String
      "business label"
      label: String
    }

    input PagingInput {
      # forward paging count
      first: Int
      # forward paging after this cursor eg endCursor
      after: String
      # backward paging count
      last: Int
      # backward paging befor this cursor eg startCursor"
      before: String
      # search text
      search: String
    }
    # -- enumerations --
    enum CategoryOption {
      WEARS
      ELECTRICALS
      VEHICLES
      ELECTRONICS
      FOOD_DRUGS
    }

    enum StatusOptions {
      PENDING
      SHIPPED
      DELIVERED
      CANCELED
    }

    enum RequestStatusOption {
      DELIVERED
      CANCELED
    }

    enum OrderStatusOption {
      CANCELED
      SHIPPED
    }

    enum AudienceOptions {
      ADMIN
      USER
    }
    # -- paging object types --
    # the pagination object
    type PageInfo {
      "the start cursor of a list"
      startCursor: String!
      "the end cursor of a list"
      endCursor: String!
      "the next page indicator when moving forward in a list"
      hasNextPage: Boolean!
      "the previous page indicator when moving backwards in a list"
      hasPreviousPage: Boolean!
    }

    type CommentConnection {
      edges: [CommentEdge!]!
      pageInfo: PageInfo!
    }

    type CommentEdge {
      cursor: String!
      node: ServiceComment!
    }

    type OrderConnection {
      edges: [OrderEdge!]!
      pageInfo: PageInfo!
    }

    type OrderEdge {
      cursor: String!
      node: ServiceOrder!
    }

    type ProductConnection {
      edges: [ProductEdge!]!
      pageInfo: PageInfo!
    }

    type ProductEdge {
      cursor: String!
      node: ServiceProduct!
    }

    type UserConnection {
      edges: [UserEdge!]!
      pageInfo: PageInfo!
    }

    type UserEdge {
      cursor: String!
      node: User!
    }

    type ServiceEdge {
      cursor: String!
      node: UserService!
    }

    type ServiceConnection {
      edges: [ServiceEdge!]!
      pageInfo: PageInfo!
    }

    type SearchPayload {
      products(args: PagingInput!): ProductConnection!
      services(args: PagingInput!): ServiceConnection!
    }
    # -- vertices/nodes --
    # user object type
    type User {
      _id: ID!
      "the user's alias"
      username: String!
      "the user's email"
      email: String!
      "user products requests"
      requests(args: PagingInput!): OrderConnection!
      "total number of user request"
      requestCount: Int!
      "the user's service"
      service: UserService
      "product creation date"
      createdAt: String!
      "product modification date"
      updatedAt: String!
    }
    # service object type
    type UserService {
      _id: ID
      "the service name"
      title: String
      "the service logo"
      logo: String
      "service description"
      description: String
      "service home state"
      state: String
      "number of likes for the service"
      likeCount: Int
      "number of users who likes the service"
      happyClients: [ID!]
      "list of service products"
      products(args: PagingInput!): ProductConnection!
      "comments from clients"
      comments(args: PagingInput!): CommentConnection!
      "service orders from clients"
      orders(args: PagingInput!): OrderConnection!
      "all product categories"
      categories: [CategoryOption]
      "max product allowed per service"
      maxProduct: Int
      "the total number of orders per service"
      orderCount: Int
      "the total number of products per service"
      productCount: Int
      "the total number of comments per service"
      commentCount: Int
      "product creation date"
      createdAt: String
      "product modification date"
      updatedAt: String
    }
    # comment object type
    type ServiceComment {
      _id: ID!
      "the service commented on"
      topic: UserService!
      "the client who posted the comment"
      poster: User!
      "the comment post"
      post: String!
      "product creation date"
      createdAt: String!
      "product modification date"
      updatedAt: String!
    }
    # product object type
    type ServiceProduct {
      _id: ID!
      "the product name"
      name: String!
      "the product description"
      description: String!
      "the product category"
      category: CategoryOption!
      "the product images"
      images: [String!]!
      "the product video clip - optional"
      video: String
      "the related names for the product"
      tags: [String]!
      "the product price"
      price: Float!
      "the product sales count"
      saleCount: Int!
      "the service the product belongs to"
      provider: UserService!
      "product creation date"
      createdAt: String!
      "product modification date"
      updatedAt: String!
    }
    # order item object type
    type OrderItem {
      "order item object id"
      _id: ID!
      "The product ID"
      productId: ID!
      "The service provider ID; the product owner"
      providerId: ID!
      "The provider/service name/title"
      providerTitle: String!
      "The ordered product name"
      name: String!
      "The ordered product price at the time"
      price: Float!
      "The quantity ordered per item"
      quantity: Int!
      "The cost of the item(s) - price * quantity"
      cost: Float!
      "The item delivery status - delivered, pending, canceled or shipped"
      status: StatusOptions!
    }
    # order stats object type
    type OrderStats {
      "Total number of pending item statuses within an order"
      PENDING: Int!
      "Total number of canceled item statuses within an order"
      CANCELED: Int!
      "Total number of shipped item statuses within an order"
      SHIPPED: Int!
      "Total number of delivered item statuses within an order"
      DELIVERED: Int!
    }
    # order object type
    type ServiceOrder {
      _id: ID!
      "the user who placed the order"
      client: User!
      "aggregated count of order statuses"
      orderStats: OrderStats!
      "The items ordered by the client"
      items: [OrderItem!]!
      "The client phone number to call"
      phone: String!
      "The client home state"
      state: String!
      "The client address"
      address: String!
      "The client nearest bus stop"
      nearestBusStop: String!
      "The delivery date specified by the service provider"
      deliveryDate: String
      "the items total cost"
      totalCost: Float!
      "product creation date"
      createdAt: String!
      "product modification date"
      updatedAt: String!
    }
  `,
  resolvers: {
    Query: {
      hello: () => "world!",
      logout: (_: any, __: any, { res }: GraphContextType) => (
        setCookie(res, "token", "", {
          maxAge: 0,
          httpOnly: true,
          sameSite: true,
          secure: process.env.NODE_ENV == "production" ? true : false,
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
          devErrorLogger(error);
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
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      requestPassCode: async (
        _: any,
        { email }: { email: string },
        { sendEmail, res }: GraphContextType
      ) => {
        try {
          // generate pass code
          const passCode = randomBytes(8).toString("hex");
          // store hash in user cookie
          setCookie(
            res,
            COOKIE_PASSCODE,
            {
              email,
              hashedPassCode: getHash(passCode),
            },
            {
              maxAge: passCodeDuration * 60,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            }
          );
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

          return "Passcode sent to your email successfully";
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, ApolloError, generalErrorMessage);
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
          devErrorLogger(error);
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
          devErrorLogger(error);
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
          // NOTE: log error to debug
          devErrorLogger(error);
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
          devErrorLogger(error);
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
          devErrorLogger(error);
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
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
    },
    Mutation: {
      register: async (
        _: any,
        {
          registerInput: { passCode, password, username, ...serviceData },
        }: RegisterVariableType,
        { UserModel, ServiceModel, res, req: { cookies } }: GraphContextType
      ) => {
        try {
          // verify & get email from cookies
          const { passCodeData } = cookies as unknown as Record<
              "passCodeData",
              PassCodeDataType
            >,
            email = verifyPassCodeData(passCodeData, passCode);
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
          // clear passCodeData from cookies since it is no more needed
          // create service for user
          // return access token
          return (
            setCookie(res, COOKIE_PASSCODE, "", COOKIE_CLEAR_OPTIONS),
            authUser(
              {
                audience: "USER",
                id,
                username: _username,
                serviceId: (
                  await ServiceModel.create([{ ...serviceData, owner: id }])
                )[0].id,
              },
              res
            ).accessToken
          );
        } catch (error: any) {
          // NOTE: log error to debug
          ["ForbiddenError"].includes(error.name) &&
            handleError(
              error,
              ForbiddenError,
              "Something happened. Get a new passcode and try again."
            );
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      changePassword: async (
        _: any,
        { newPassword, passCode }: ChangePasswordVariableType,
        { UserModel, req: { cookies }, res }: GraphContextType
      ): Promise<string | undefined> => {
        try {
          // throws error if passCodeData is undefined.
          // if no error then update the user password
          // clear passcode data from cookies
          // return successful message
          return (
            await UserModel.findOneAndUpdate(
              // @ts-ignore
              { email: verifyPassCodeData(cookies.passCodeData, passCode) },
              {
                $set: { password: newPassword },
              }
            )
              .select("_id")
              .lean()
              .exec(),
            setCookie(res, COOKIE_PASSCODE, COOKIE_CLEAR_OPTIONS),
            "Password changed successfully."
          );
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(
            error,
            ForbiddenError,
            "Failed! Get a new passcode and try again."
          );
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
          devErrorLogger(error);
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
          const { serviceId } = getAuthPayload(authorization!);
          // throw error if user has no service profile
          if (!serviceId)
            throw new ForbiddenError("Create service before adding product!");
          // throw error if user products is over max allowed
          if (
            (
              await ProductModel.find({
                provider: serviceId,
              })
                .select("_id")
                .lean()
                .exec()
            ).length <= maxProductAllowed
          )
            // create product & return id
            return (
              await ProductModel.create({
                ...args,
                provider: serviceId,
              })
            ).id;
          else
            throw new ForbiddenError(
              "You have maximum products allowed. Kindly upgrade to add more products."
            );
        } catch (error: any) {
          // NOTE: log to debug
          devErrorLogger(error);
          handleError(error.code === 11000, UserInputError, "Product name already exist.")
          handleError(error, AuthenticationError, generalErrorMessage);
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
          res
        }: GraphContextType
      ): Promise<string | undefined> => {
        try {
          // check permission before delete
          getAuthPayload(authorization!);
          await ProductModel.findByIdAndDelete(productId)
            .select("_id")
            .lean()
            .exec();
            // regenerate static home page
            res.unstable_revalidate("/")
          return "Product deleted successfully";
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
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
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      myFavService: async (
        _: any,
        args: { serviceId: string; isFav: boolean },
        {
          LikeModel,
          req: {
            headers: { authorization },
          },
        }: GraphContextType
      ): Promise<boolean | undefined> => {
        try {
          const { sub } = getAuthPayload(authorization!);
          await LikeModel.findOneAndUpdate(
            { selection: args.serviceId },
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
          devErrorLogger(error);
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
          const { sub } = getAuthPayload(authorization!);
          await OrderModel.create({
            ...args,
            client: sub,
            totalCost: args.items.reduce((prev, item) => prev + item.cost, 0),
          });
          return "Order created successfully";
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      updateOrderItemStatus: async (
        _: any,
        {
          args: { status, itemId },
        }: {
          args: {
            itemId: string;
            status: StatusType;
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
          await OrderModel.findOneAndUpdate(
            { "items._id": itemId },
            {
              $set: {
                items: (
                  await OrderModel.findOne({ "items._id": itemId })
                    .select("items")
                    .lean()
                    .exec()
                )?.items.map((item) =>
                  item._id?.toString() === itemId
                    ? {
                        ...item,
                        status,
                      }
                    : item
                ),
              },
            }
          )
            .select("_id")
            .lean()
            .exec();

          return `status is now ${status}`;
        } catch (error) {
          // NOTE: log to debug
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      setOrderDeliveryDate: async (
        _: any,
        { orderId, deliveryDate }: Record<"deliveryDate" | "orderId", string>,
        {
          OrderModel,
          req: {
            headers: { authorization },
          },
        }: GraphContextType
      ) => {
        try {
          // check permission
          getAuthPayload(authorization!);
          // update order delivery date
          await OrderModel.findByIdAndUpdate(orderId, {
            $set: { deliveryDate },
          });
          // return confirmation string
          return "Delivery date has been set successfully";
        } catch (error) {
          // NOTE: log to debug error
          devErrorLogger(error);
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
            await UserModel.findById(parent._id)
              .select("username")
              .lean()
              .exec()
          )?.username;
        } catch (error) {
          // NOTE: log to debug
          devErrorLogger(error);
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
          devErrorLogger(error);
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
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
      requestCount: async (
        parent: UserType,
        _: any,
        { OrderModel }: GraphContextType
      ) => {
        try {
          return (
            await OrderModel.find({ client: parent._id })
              .select("_id")
              .lean()
              .exec()
          ).length;
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
        }
      },
    },
    UserService: {
      happyClients: async (
        parent: ServiceType,
        __: any,
        { LikeModel }: GraphContextType
      ) => {
        try {
          return (
            await LikeModel.findOne({
              selection: parent._id,
            })
              .select("happyClients")
              .lean()
              .exec()
          )?.happyClients!;
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, AuthenticationError, generalErrorMessage);
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
                  await ProductModel.find({ provider: parent._id })
                    .lean()
                    .exec()
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
          devErrorLogger(error);
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
          devErrorLogger(error);
          handleError(error, Error, generalErrorMessage);
        }
      },
      orders: async (
        { _id }: ServiceType,
        { args }: Record<"args", PagingInputType>,
        { OrderModel }: GraphContextType
      ) => {
        try {
          return getCursorConnection<OrderType>({
            list:
              (await OrderModel.find({ "items.providerId": _id })
                .populate("client")
                .lean()
                .exec()) ?? [],
            ...args,
          });
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
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
          devErrorLogger(error);
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
          devErrorLogger(error);
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
            await ProductModel.find({ provider: _id })
              .select("_id")
              .lean()
              .exec()
          ).length;
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
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
            await OrderModel.find({ "items.providerId": _id })
              .select("_id")
              .lean()
              .exec()
          ).length;
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, Error, generalErrorMessage);
        }
      },
      likeCount: async (
        parent: ServiceType,
        _: any,
        { LikeModel }: GraphContextType
      ) => {
        try {
          return (
            await LikeModel.findOne({ selection: parent._id })
              .select("happyClients")
              .lean()
              .exec()
          )?.happyClients.length;
        } catch (error) {
          // NOTE: log error to debug
          devErrorLogger(error);
          handleError(error, Error, generalErrorMessage);
        }
      },
    },
    ServiceOrder: {
      orderStats: ({ items }: OrderType) => getOrderItemStats(items),
    },
  },
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
  context: async ({
    req,
    res,
  }: Pick<GraphContextType, "req" | "res">): Promise<GraphContextType> => {
    await dbConnection();
    return {
      req,
      res,
      UserModel,
      CommentModel,
      OrderModel,
      ProductModel,
      ServiceModel,
      LikeModel,
      sendEmail,
    };
  },
});

export default apolloServer;
