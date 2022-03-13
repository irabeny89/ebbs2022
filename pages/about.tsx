import { FaTelegram } from "react-icons/fa";
import Layout from "@/components/Layout";
import config from "../config";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { MdOutlineInfo } from "react-icons/md";
// fetch page data
const {
    webPages,
    abbr,
    socialMedia: [{ link }],
  } = config.appData,
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
      {aboutPage?.parargraphs.map((paragraph, i) => (
        <Row
          as="p"
          className="my-4 p-4 justify-content-center display-5"
          key={i}
        >
          {paragraph}
        </Row>
      ))}
      <Row className="justify-content-center">
        <Col xs="auto" className="mt-5">
          <Button as="a" variant="outline-primary" href={link}>
            Join Telegram group <FaTelegram size={30} color="#197acf" />
          </Button>
        </Col>
      </Row>
    </Container>
  </Layout>
);

export default About;
