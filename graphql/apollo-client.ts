import { ApolloClient, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import axios from "axios";
import config from "../config";
import cache from "./cache";
import { accessTokenVar } from "./reactiveVariables";

const {
  environmentVariable: { graphqlUri, apiHost },
  appData: { abbr },
} = config;

const client = new ApolloClient({
  name: abbr,
  version: "1.0.0",
  cache,
  link: from([
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(
          async ({ message, locations, path, extensions: { code } }) => {
            console.error(
              `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
                locations
              )}, Path: ${JSON.stringify(path)}, Code: ${code}`
            );
            if (code === "UNAUTHENTICATED") {
              try {
                const {
                  data: {
                    data: { refreshToken },
                  },
                } = await axios.post(
                  apiHost + graphqlUri,
                  {
                    query: "{refreshToken}",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                    withCredentials: true,
                  }
                );
                accessTokenVar(refreshToken);
                operation.setContext({
                  headers: {
                    ...operation.getContext().headers,
                    authorization: `Bearer ${accessTokenVar()}`,
                  },
                });
                return forward(operation);
              } catch (error) {
                console.log("=====axios:refreshToken======");
                console.error(error);
                console.log("=============================");
              }
            }
          }
        );
      }
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    new RetryLink(),
    new HttpLink({
      uri: `${apiHost}${graphqlUri}`,
      credentials: "include",
    }),
  ]),
});

export default client;
