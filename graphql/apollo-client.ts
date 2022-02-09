import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import config from "../config";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import axios from "axios";

const {
  environmentVariable: { graphqlUri, host },
  appData: { abbr },
} = config;

const client = new ApolloClient({
  name: abbr,
  version: "1.0.0",
  cache: new InMemoryCache(),
  link: from(
    [
      onError(({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(
            async ({ message, locations, path, extensions: { code } }) => {
              console.log(
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
                  } = await axios.post<
                    Record<"data", { refreshToken: string }>
                  >(host + graphqlUri, {
                    query: "query{refreshToken}",
                  });
                  accessTokenVar(refreshToken);
                  operation.setContext({
                    headers: {
                      ...operation.getContext().headers,
                      authorization: `Bearer ${accessTokenVar()}`,
                    },
                  });
                  return forward(operation);
                } catch (error) {
                  console.error(error);
                }
              }
            }
          );
        }
        if (networkError) console.log(`[Network error]: ${networkError}`);
      }),
      new RetryLink(),
      new HttpLink({
        uri: host + graphqlUri,
      }),
      // log error in dev; i.e remove error link in production
    ].filter((_, i) =>
      process.env.NODE_ENV === "development" ? true : i !== 1
    )
  ),
});

export default client;
