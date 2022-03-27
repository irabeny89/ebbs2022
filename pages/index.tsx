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
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { MdBusinessCenter, MdHowToReg } from "react-icons/md";
import { CSSProperties, useState } from "react";
import { GetStaticProps } from "next";
import client from "@/graphql/apollo-client";
import ProductSection from "@/components/ProductSection";
import ServiceSection from "@/components/ServiceSection";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { FaBoxes } from "react-icons/fa";
import { FEW_PRODUCTS_AND_SERVICES } from "@/graphql/documentNodes";

// dynamically import - code splitting
const QuickStartModal = dynamic(
  () => import("../components/QuickStartModal"),
  { loading: () => <>loading..</> }
);
// fetch page data
const {
    webPages,
    abbr,
    features,
    socialMedia: [{ link }],
  } = config.appData,
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
      Record<
        "productArgs" | "serviceArgs" | "serviceProductArgs",
        PagingInputType
      >
    >({
      query: FEW_PRODUCTS_AND_SERVICES,
      variables: {
        productArgs: {
          last: 20,
        },
        serviceArgs: {
          last: 20,
        },
        serviceProductArgs: {
          first: 10,
        },
      },
      fetchPolicy: "no-cache",
    });

    return error
      ? { notFound: true }
      : {
          props: {
            products: products.edges.map((edge) => edge.node),
            services: services.edges
              .map((edge) => edge.node)
              // filter out services without a single product
              .filter((item) => item.products?.edges.length! > 0),
          },
          revalidate: 20,
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
          <QuickStartModal
            show={show}
            setShow={setShow}
            features={features}
            link={link}
          />
          {/* page title */}
          <Row className="mb-4 h1">
            <Col>
              <FaHome size="40" className="mb-2" /> {homePage?.pageTitle} |{" "}
              <Button
                onClick={() => setShow(true)}
                variant="outline-dark border-2"
              >
                Quick Start
              </Button>
            </Col>
          </Row>
          <hr />
          {/* first paragraph */}
          <Row className="my-4 text-center">
            <Col>{homePage?.parargraphs[0]}</Col>
          </Row>
          <Row className="text-center">
            <Col>
              <Link href="/member" passHref>
                <Button as="a" variant="outline-primary" href={link}>
                  Be a member <MdHowToReg size={30} color="#197acf" />
                </Button>
              </Link>
            </Col>
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
            <Col>
              <Link href="/products" passHref>
                <Button as="a" variant="outline-primary" href={link}>
                  All Products <FaBoxes size={30} color="#197acf" />
                </Button>
              </Link>
            </Col>
          </Row>
          {/* Services Section */}
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
            <Col>
              <Link href="/services" passHref>
                <Button as="a" variant="outline-primary" href={link}>
                  All Services <MdBusinessCenter size={30} color="#197acf" />
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  };

export default Home;
