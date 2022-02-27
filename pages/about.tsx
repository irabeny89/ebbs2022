import Layout from "@/components/Layout";
import config from "../config";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { MdOutlineInfo } from "react-icons/md";
// fetch page data
const { webPages, abbr, features } = config.appData,
  // find home page data
  aboutPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "about"
  );

const About = () => (
  <Layout>
    {/* tab title */}
    <Head>
      <title>
        {abbr} &trade; | {aboutPage?.pageTitle}
      </title>
    </Head>
    <Container fluid>
      <Row className="h1">
        <Col>
          <MdOutlineInfo size="40" className="mb-2" />
          {aboutPage?.pageTitle}
        </Col>
      </Row>
      {/* first paragraph */}
      {aboutPage?.parargraphs.map((paragraph, i) => <Row
            as="p"
            className="my-4 text-center justify-content-center display-5"
            key={i}
          >
            {paragraph}
          </Row>)}
    </Container>
  </Layout>
);

export default About;
