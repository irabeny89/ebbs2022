import Layout from "@/components/Layout";
import Head from "next/head";
import { MdCardMembership } from "react-icons/md";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import config from "../config";
import dynamic from "next/dynamic";
import LoginSection from "@/components/LoginSection";

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
      <Container>
        {/* page title */}
        <Row className="mb-4 h1">
          <Col>
            <MdCardMembership size="40" className="mb-2" />{" "}
            {memberPage?.pageTitle}
          </Col>
        </Row>
        <hr />
        {/* first paragraph */}
        <Row className="my-4 text-center">
          <Col>{memberPage?.parargraphs[0]}</Col>
        </Row>
        {/* member authentication tabs */}
        <Tabs id="member-tabs" defaultActiveKey="Login" className="my-5">
          {/* login tab */}
          <Tab title={<h5 style={tabTitleStyle}>Login</h5>} eventKey="Login">
            <LoginSection />
          </Tab>
          {/* register tab */}
          <Tab
            title={<h5 style={tabTitleStyle}>Register</h5>}
            eventKey="Register"
          >
            <RegisterSection />
          </Tab>
          {/* lost password tab */}
          <Tab
            title={<h5 style={tabTitleStyle}>Lost Password</h5>}
            eventKey="Lost Password"
          >
            <LostPasswordSection />
          </Tab>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default MemberPage;
