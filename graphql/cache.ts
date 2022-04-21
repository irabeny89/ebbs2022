import { InMemoryCache } from "@apollo/client";
import {
  CursorConnectionType,
  ProductVertexType,
  ServiceVertexType,
} from "types";

const initialData = {
  edges: [],
  pageInfo: {
    startCursor: "",
    endCursor: "",
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        products: {
          keyArgs: false,
          merge: (
            existing: CursorConnectionType<ProductVertexType> = initialData,
            incoming: CursorConnectionType<ProductVertexType>
          ): CursorConnectionType<ProductVertexType> => ({
            edges: [...existing.edges, ...incoming.edges],
            pageInfo: incoming.pageInfo,
          }),
        },
        services: {
          keyArgs: false,
          merge: (
            existing: CursorConnectionType<ServiceVertexType> = initialData,
            incoming: CursorConnectionType<ServiceVertexType>
          ): CursorConnectionType<ServiceVertexType> => ({
            edges: [...existing.edges, ...incoming.edges],
            pageInfo: incoming.pageInfo,
          }),
        },
      },
    },
  },
});

export default cache;
