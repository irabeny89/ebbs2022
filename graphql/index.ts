import { ApolloServer } from "apollo-server-micro";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import typeDefs from "@/graphql/typeDefs";
import resolvers from "@/graphql/resolvers";
import UserModel from "@/models/userModel";
import ServiceModel from "@/models/serviceModel";
import ProductModel from "@/models/productModel";
import CommentModel from "@/models/commentModel";
import LikeModel from "@/models/likeModel";
import OrderModel from "@/models/orderModel";
import dbConnection from "@/models/index";
import { ContextArgType, GraphContextType } from "types";
import { randomInt } from "crypto";
import {
  getMockField
} from "@/models/mockData/enyMockie";
import config from "../config";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === "production"
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
  context: async ({ req, res }: ContextArgType): Promise<GraphContextType> => {
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
    };
  },
  mocks: {
    Int: () => randomInt(1000001),
    Float: () => randomInt(1000000001) / 100,
    User: () => ({
      username: () => getMockField("username"),
      email: () => getMockField("email"),
    }),
    ServiceProduct: () => ({
      name: () => getMockField("productName"),
    }),
    UserService: () => ({
      maxProduct: () => config.appData.maxProductAllowed,
      categories: () => [...new Array(3)],
      state: () => "Lagos",
      description: () => "The best product on the best business platform.",
      title: () => getMockField("serviceTitle")
    }),
    ServiceComment: () => ({
      post: () => getMockField("commentPost")
    })
  },
});

export default apolloServer;
