import { FaTelegram } from "react-icons/fa";
import Layout from "@/components/Layout";
import Link from "next/link";
import config from "../config";
import Head from "next/head";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import {
  MdOutlineInfo,
  MdHowToReg,
  MdAddAlert,
  MdFeaturedPlayList,
} from "react-icons/md";
import PageIntro from "@/components/PageIntro";
// fetch page data
const {
    gettingStartedSteps,
    webPages,
    features,
    abbr,
    socialMedia: [{ link }],
    productCategoryExamples,
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
    <PageIntro
      pageTitle={
        <>
          <MdOutlineInfo size="40" className="mb-2" />
          {aboutPage?.pageTitle}
        </>
      }
      paragraphs={aboutPage?.parargraphs}
    />
    <Alert variant="info" className="text-center border-5">
      {aboutPage?.alert}
    </Alert>
    <Container>
      <Row>
        <h3 className="my-3">Business Categories</h3>
        <p>{aboutPage?.categoryParagraph}</p>
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            {productCategoryExamples.map((categoryExample, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{Object.keys(categoryExample)}</td>
                <td>{Object.values(categoryExample)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
    {/* features */}
    <Row className="my-3 justify-content-center bg-dark text-white">
      <Col sm="auto" className="m-3">
        <h3 className="my-3">
          <MdFeaturedPlayList size={25} /> Features
        </h3>
        {features.map((feature, i) => (
          <ul key={i}>
            <li>{feature}</li>
          </ul>
        ))}
      </Col>
      {/* how to get started */}
      <Col id="new" sm="auto" className="m-3">
        <h3 className="my-3">
          <MdHowToReg size={25} /> How to get started
        </h3>
        <ol>
          {gettingStartedSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <Link passHref href="/member">
          <Button>Link to member page.</Button>
        </Link>
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
  </Layout>
);

export default About;
