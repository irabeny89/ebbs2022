import type {
  CursorConnectionType,
  HomePagePropType,
  PagingInputType,
  ProductVertexType,
  ServiceVertexType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import Link from "next/link";
import { FaHome, FaTelegram } from "react-icons/fa";
import { MdBusinessCenter } from "react-icons/md";
import { CSSProperties, useState } from "react";
import { GetStaticProps } from "next";
import client from "@/graphql/apollo-client";
import ProductSection from "@/components/ProductSection";
import ServiceSection from "@/components/ServiceSection";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { FaBoxes } from "react-icons/fa";
import { FEW_PRODUCTS_AND_SERVICES } from "@/graphql/documentNodes";
// fetch page data
const { webPages, abbr, features } = config.appData,
  // find home page data
  homePage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "home"
  ),
  // product & store card style
  highlightStyle: CSSProperties = {
    backgroundColor: "#262A41",
    color: "white",
  };
// get data build time
export const getStaticProps: GetStaticProps = async () => {
    const {
      data: { products, services },
      error,
    } = await client.query<
      {
        products: CursorConnectionType<ProductVertexType>;
        services: CursorConnectionType<ServiceVertexType>;
      },
      Record<"productArgs" | "commentArgs" | "serviceArgs", PagingInputType>
    >({
      query: FEW_PRODUCTS_AND_SERVICES,
      variables: {
        commentArgs: {
          last: 30,
        },
        productArgs: {
          first: 20,
        },
        serviceArgs: {
          first: 20,
        },
      },
    });

    return error
      ? { notFound: true }
      : {
          props: {
            products: products.edges.map((edge) => edge.node),
            services: services.edges.map((edge) => edge.node),
          },
          revalidate: 10,
        };
  },
  // home page component
  Home = ({ products, services }: HomePagePropType) => {
    // state variable to handle modal clicks
    const [show, setShow] = useState(false);

    return (
      <Layout>
        {/* tab title */}
        <Head>
          <title>
            {abbr} &trade; | {homePage?.pageTitle}
          </title>
        </Head>
        {/* main body of home page */}
        <Container fluid>
          {/* site features modal */}
          <Modal show={show} onHide={() => setShow(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Features</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ul>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </Modal.Body>
            <Modal.Footer>
              <Row>
                <Col>
                  <Button as="a" variant="outline-primary">
                    Join Telegram group <FaTelegram size={30} color="#197acf" />
                  </Button>
                </Col>
              </Row>
            </Modal.Footer>
          </Modal>
          {/* page title */}
          <Row className="mb-5 h1">
            <Col>
              <FaHome size="40" className="mb-2" /> {homePage?.pageTitle} |{" "}
              <Button onClick={() => setShow(true)} variant="outline-info">
                Features
              </Button>
            </Col>
          </Row>
          {/* first paragraph */}
          <Row
            as="p"
            className="my-4 text-center justify-content-center display-5"
          >
            {homePage?.parargraphs[0]}
          </Row>
          <Row className="text-center">
            <Link href="/member">Be a member</Link>
          </Row>
          {/* Products Section */}
          <Row className="mt-5 rounded" style={highlightStyle}>
            <ProductSection
              title={
                <Col>
                  <FaBoxes size="40" className="mb-2" /> Products
                </Col>
              }
              items={products}
              className="pt-4 rounded"
            />
          </Row>
          {/* link to products page */}
          <Row className="text-center mt-4 mb-5">
            <Link
              href={
                homePage?.links.find(
                  (link) => link.pageTitle.toLowerCase() === "products"
                )?.route ?? ""
              }
            >
              Go see all products
            </Link>
          </Row>
          {/* Service Section */}
          <Row className="mt-5 rounded" style={highlightStyle}>
            <ServiceSection
              items={services}
              className="pt-4 rounded"
              title={
                <Col>
                  <MdBusinessCenter size="40" className="mb-2" /> Services
                </Col>
              }
            />
          </Row>
          {/* link to services page */}
          <Row className="text-center mt-4 mb-5">
            <Link
              href={
                homePage?.links.find(
                  (link) => link.pageTitle.toLowerCase() === "services"
                )?.route ?? ""
              }
            >
              Go see all services
            </Link>
          </Row>
        </Container>
      </Layout>
    );
  };

export default Home;
