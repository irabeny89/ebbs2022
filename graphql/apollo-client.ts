import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import config from "../config";

const {
    environmentVariable: { graphqlUri, host },
    appData: { abbr },
  } = config,
  httpLink = new HttpLink({
    uri: host + graphqlUri,
    headers: {
      authorization: accessTokenVar() ? `Bearer ${accessTokenVar()}` : "",
    },
  }),
  errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(
        ({ message, locations, path, extensions: { code } }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
              locations
            )}, Path: ${path}`
          );
          switch (code) {
            case "UNAUTHENTICATED":
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: accessTokenVar()
                    ? `Bearer ${accessTokenVar()}`
                    : "",
                },
              });

              return forward(operation);
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
