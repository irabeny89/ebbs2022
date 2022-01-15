import { ApolloServer } from "apollo-server-micro";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import typeDefs from "@/graphql/typeDefs";
import resolvers from "@/graphql/resolvers";
import UserModel from "@/models/userModel";
import UserServiceModel from "@/models/serviceModel";
import ServiceProductModel from "@/models/productModel";
import ServiceCommentModel from "@/models/commentModel";
import ServiceLikeModel from "@/models/likeModel";
import ServiceOrderModel from "@/models/orderModel";
import dbConnection from "@/models/index";
import { ContextArgType, GraphContextType } from "types";
import { randomInt } from "crypto";

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
      ServiceCommentModel,
      ServiceOrderModel,
      ServiceProductModel,
      UserServiceModel,
      ServiceLikeModel
    };
  },
  mocks: {
    Int: () => randomInt(1000001),
    Float: () => randomInt(1000000001) / 100,
  },
});

export default apolloServer;
