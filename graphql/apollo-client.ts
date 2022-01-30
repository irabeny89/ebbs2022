import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import config from "../config";
import axios from "axios";

const {
  environmentVariable: { graphqlUri, host },
  appData: { abbr },
} = config;

const httpLink = new HttpLink({
    uri: host + graphqlUri,
    headers: {
      authorization: accessTokenVar() ? `Bearer ${accessTokenVar()}` : "",
    },
  }),
  errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(
        async ({ message, locations, path, extensions: { code } }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
          switch (code) {
            case "UNAUTHENTICATED":
              try {
                const {
                  data: { refreshToken },
                } = await axios.post(host + graphqlUri, {
                  query: "query{refreshToken}",
                });
                
                accessTokenVar(refreshToken);

                operation.setContext({
                  headers: {
                    ...operation.getContext().headers,
                    authorization: `Bearer ${refreshToken}`,
                  },
                });

                return forward(operation);
              } catch (err) {
                console.error(err);
              } finally {
                return forward(operation);
              }
          }
        }
      );
    }

    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error,
    },
  }),
  client = new ApolloClient({
    name: abbr,
    version: "1.0.0",
    cache: new InMemoryCache(),
    link: from([errorLink, retryLink, httpLink]),
  });

export default client;
