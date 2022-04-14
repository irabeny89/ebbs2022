import { FaTelegram } from "react-icons/fa";
import Layout from "@/components/Layout";
import config from "../config";
import Head from "next/head";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {
  MdOutlineInfo,
  MdHowToReg,
  MdAddAlert,
  MdFeaturedPlayList,
} from "react-icons/md";
// fetch page data
const {
    gettingStartedSteps,
    webPages,
    features,
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
    <Container>
      {/* About header */}
      <Row as="h2">
        <Col>
          <MdOutlineInfo size="40" className="mb-2" />
          {aboutPage?.pageTitle}
        </Col>
      </Row>
      <hr />
      {/* paragraphs */}
      {aboutPage?.parargraphs.map((paragraph, i) => (
        <Row key={i} className="text-center">
          <Col as="p">{paragraph}</Col>
        </Row>
      ))}
      {/* features */}
      <Row className="my-3 justify-content-center">
        <Col sm="auto" className="m-3">
          <h3>
            <MdFeaturedPlayList size={25} /> Features:
          </h3>
          {features.map((feature, i) => (
            <ul key={i}>
              <li>{feature}</li>
            </ul>
          ))}
        </Col>
        {/* how to get started */}
        <Col id="new" sm="auto" className="m-3">
          <h3>
            <MdHowToReg size={25} /> How to get started:
          </h3>
          <ol>
            {gettingStartedSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Link href="/member">Link to member page.</Link>
        </Col>
      </Row>
      {/* info */}
      <Row className="px-3 mt-4 text-center">
        <Col>
          <MdAddAlert size={20} /> More features coming soon; also join the
          telegram channel to ask for features, report issues and stay updated.
        </Col>
      </Row>
      {/* Telegram button */}
      <Row className="justify-content-center my-3">
        <Col xs="auto">
          <Button as="a" variant="outline-primary" href={link}>
            Telegram group <FaTelegram size={30} color="#197acf" />
          </Button>
        </Col>
      </Row>
    </Container>
  </Layout>
);

export default About;
