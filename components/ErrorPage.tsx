import Layout from "@/components/Layout";
import Head from "next/head";

const pageNotFoundStyle = {
  paddingBottom: "20rem",
};

type ErrorPageProps = {
  message: string;
  title: string;
}

const ErrorPage = ({ message, title }: ErrorPageProps) => (
  <Layout>
    <Head>
      <title>MoveMoney | {title}</title>
    </Head>
    <div style={pageNotFoundStyle}>
    <h2 className="display-3">{message}</h2>
      <hr />
      <br />
    </div>
  </Layout>
);

export default ErrorPage;
