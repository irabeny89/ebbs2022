import Dashboard from "@/components/Dashboard";
import ErrorPage from "@/components/ErrorPage";
import Layout from "@/components/Layout";
import Member from "@/components/Member";
import config from "../../config";
import Head from "next/head";
import { useRouter } from "next/router";

// fetch page data
const { webPages, abbr } = config.appData,
  // find home page data
  dashboardPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "dashboard"
  ),
  // find member page data
  memberPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "member"
  );
// member page component
const MemberPage = () => {
  const { slug } = useRouter().query as {
      slug?: string[];
    }
  // if route- /member/xxx/xx ==> slug == [xxx,xx]
  return slug ? (
    // when route == member/dashboard
    slug[0] === "dashboard" ? (
        <Layout>
          <Head>
            <title>
              {abbr} &trade; | {dashboardPage?.pageTitle}
            </title>
          </Head>
          <Dashboard />
        </Layout>
    ) : (
      // if route /member/x is not defined above
      <ErrorPage title="404" message="Page Not Found!" />
    )
  ) : (
    // if slug (/member/x) not provided
    <Layout>
      {/* tab title */}
      <Head>
        <title>
          {abbr} &trade; | {memberPage?.pageTitle}
        </title>
      </Head>
      <Member />
    </Layout>
  );
};

export default MemberPage;
