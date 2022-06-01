import "bootstrap/dist/css/bootstrap.min.css";
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "@/graphql/apollo-client";
import { SSRProvider } from "react-bootstrap";
import { useEffect, useState } from "react";
import { UserPayloadType } from "types";
import { authPayloadVar } from "@/graphql/reactiveVariables";
import config from "config";
import UnAuth from "@/components/UnAuth";
import Head from "next/head";
import Layout from "@/components/Layout";
import FeedbackToast from "@/components/FeedbackToast";
import ErrorBoundary from "@/components/ErrorBoundary";

const {
  abbr,
  constants: { AUTH_PAYLOAD },
} = config.appData;

function MyApp({ Component, pageProps }: AppProps) {
  const [audience, setAudience] = useState<UserPayloadType["audience"]>();
  useEffect(() => {
    // @ts-ignore
    const authPayload = JSON.parse(localStorage.getItem(AUTH_PAYLOAD));
    authPayloadVar(authPayload);
    setAudience(authPayload?.aud);
  }, [Component.displayName]);

  return (
    <SSRProvider>
      <ErrorBoundary>
        <ApolloProvider client={client}>
          <FeedbackToast>
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
          </FeedbackToast>
        </ApolloProvider>
      </ErrorBoundary>
    </SSRProvider>
  );
}
export default MyApp;
