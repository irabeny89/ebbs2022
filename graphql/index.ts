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
import type { GraphContextType } from "types";
import config from "../config";

const { ebbsEmailHost, ebbsUsername, ebbsPassword } =
  config.environmentVariable;

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
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
    };
  },
});

export default apolloServer;
