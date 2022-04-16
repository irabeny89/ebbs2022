import Layout from "@/components/Layout";
import Head from "next/head";
import { MdCardMembership } from "react-icons/md";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import config from "../config";
import dynamic from "next/dynamic";
import LoginSection from "@/components/LoginSection";
import PageIntro from "@/components/PageIntro";

// dynamically import component - tree shaking
const LostPasswordSection = dynamic(
    () => import("@/components/LostPasswordSection"),
    { loading: () => <>loading...</> }
  ),
  RegisterSection = dynamic(() => import("@/components/RegisterSection"), {
    loading: () => <>loading...</>,
  });
// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find member page data
  memberPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "member"
  );
// tab title style
const tabTitleStyle = { fontSize: 16 };
// member page component
const MemberPage = () => {
  return (
    <Layout>
      {/* tab title */}
      <Head>
        <title>
          {abbr} &trade; | {memberPage?.pageTitle}
        </title>
      </Head>
      <PageIntro
        pageTitle={
          <>
            <MdCardMembership size="40" className="mb-2" />{" "}
            {memberPage?.pageTitle}
          </>
        }
        paragraphs={memberPage?.parargraphs}
      />
      {/* member authentication tabs */}
      <Tabs id="member-tabs" defaultActiveKey="Login" className="my-5">
        <Tab title={<h5 style={tabTitleStyle}>Login</h5>} eventKey="Login">
          <LoginSection />
        </Tab>
        <Tab
          title={<h5 style={tabTitleStyle}>Register</h5>}
          eventKey="Register"
        >
          <RegisterSection />
        </Tab>
        <Tab
          title={<h5 style={tabTitleStyle}>Lost Password</h5>}
          eventKey="Lost Password"
        >
          <LostPasswordSection />
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default MemberPage;
