import "bootstrap/dist/css/bootstrap.min.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "@/graphql/apollo-client";
import { SSRProvider } from "react-bootstrap";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </ApolloProvider>
  );
}
export default MyApp;
