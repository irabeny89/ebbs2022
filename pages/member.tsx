import Layout from "@/components/Layout";
import config from "config";
import Head from "next/head"

const {
  appData: { abbr, pageTitles },
} = config;

const Member = () => {
  return (
    <Layout>
      <Head>
        <title>
          {abbr} &trade; | {pageTitles[1]}
        </title>
      </Head>
      Member
    </Layout>
  );
};

export default Member;
