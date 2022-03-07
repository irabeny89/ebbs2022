import "bootstrap/dist/css/bootstrap.min.css";
import { ApolloProvider, useReactiveVar } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "@/graphql/apollo-client";
import { SSRProvider } from "react-bootstrap";
import { useEffect, useState } from "react";
import { UserPayloadType } from "types";
import { hasAuthPayloadVar } from "@/graphql/reactiveVariables";
import config from "config";
import UnAuth from "@/components/UnAuth";
import Head from "next/head";
import Layout from "@/components/Layout";

const {
  abbr,
  constants: { AUTH_PAYLOAD },
} = config.appData;

function MyApp({ Component, pageProps }: AppProps) {
  const [audience, setAudience] = useState<UserPayloadType["audience"]>(),
    hasAuthPayload = useReactiveVar(hasAuthPayloadVar);
  useEffect(() => {
    setAudience(
      // @ts-ignore
      JSON.parse(localStorage.getItem(AUTH_PAYLOAD))?.aud
    );
  }, [hasAuthPayload]);

  return (
    <ApolloProvider client={client}>
      <SSRProvider>
        {Component.displayName === "DashboardPage" ? (
          // @ts-ignore
          Component.audiences.includes(audience) ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Head>
                <title>{abbr} &trade; | Forbidden Page</title>
              </Head>
              <UnAuth />
            </Layout>
          )
        ) : (
          <Component {...pageProps} />
        )}
      </SSRProvider>
    </ApolloProvider>
  );
}
export default MyApp;
