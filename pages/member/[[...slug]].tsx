import Dashboard from "@/components/Dashboard";
import ErrorPage from "@/components/ErrorPage";
import Layout from "@/components/Layout";
import Member from "@/components/Member";
import config from "../../config";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";
import client from "@/graphql/apollo-client";
import { MY_PROFILE } from "@/graphql/documentNodes";
import { PagingInputType, UserVertexType } from "types";

// fetch page data
const { webPages, abbr } = config.appData,
  // find home page data
  dashboardPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "dashboard"
  );

// ssg path
export const getStaticPaths: GetStaticPaths = async () => {
    return { paths: [{ params: { slug: ["dashboard"] } }], fallback: true };
  }
  // ssg
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data, error } = await client.query<
    Record<"me", UserVertexType>,
    Record<"productArgs" | "commentArgs" | "orderArgs", PagingInputType>
  >({
    query: MY_PROFILE,
    variables: {
      commentArgs: { last: 20 },
      orderArgs: { last: 20 },
      productArgs: { first: 20 },
    },
  });

  return error ? { notFound: true } : { props: params?.slug ? data.me : {}, revalidate: 10 };
},
  MemberPage = (props: Required<UserVertexType>) => {
    const { slug } = useRouter().query as {
      slug?: string[];
    };

    return slug ? (
      slug[0] === "dashboard" ? (
        <Layout>
          <Head>
            <title>
              {abbr} &trade; | {dashboardPage?.pageTitle}
            </title>
          </Head>
          <Dashboard {...props} info={dashboardPage?.parargraphs[0] ?? ""} />
        </Layout>
      ) : (
        <ErrorPage title="404" message="Page Not Found!" />
      )
    ) : (
      <Member />
    );
  };

export default MemberPage;
