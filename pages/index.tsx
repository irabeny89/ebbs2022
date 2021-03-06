import type {
  CursorConnectionType,
  HomePagePropsType,
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
import { FaBoxes } from "react-icons/fa";
import { FEW_PRODUCTS_AND_SERVICES } from "@/graphql/documentNodes";
import PageIntro from "@/components/PageIntro";

// dynamically import - code splitting
const QuickStartModal = dynamic(() => import("components/QuickStartModal"), {
  loading: () => <>loading..</>,
});
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
          last: 10,
        },
        serviceArgs: {
          last: 10,
        },
        serviceProductArgs: {
          first: 5,
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
          revalidate: 15,
        };
  },
  // home page component
  Home = ({ products, services }: HomePagePropsType) => {
    // state variable to handle modal clicks
    const [show, setShow] = useState(false);

    return (
      <Layout>
        <Head>
          {/* tab title */}
          <title>
            {abbr} &trade; | {homePage?.pageTitle}
          </title>
        </Head>
        <QuickStartModal
          show={show}
          setShow={setShow}
          features={features}
          link={link}
        />
        <PageIntro
          pageTitle={
            <>
              <FaHome size="40" className="mb-2" /> {homePage?.pageTitle} |{" "}
              <Button onClick={() => setShow(true)} variant="primary">
                Quick Start
              </Button>
            </>
          }
          paragraphs={homePage?.parargraphs}
        />
        <Row className="text-center">
          <Col>
            <Link href="/member" passHref>
              <Button as="a" variant="outline-primary" className="border-3">
                Be a member <MdHowToReg size={30} color="#197acf" />
              </Button>
            </Link>
          </Col>
        </Row>
        {/* Products Section */}
        <Row className="mt-5 rounded" style={highlightStyle}>
          <ProductSection
            title={
              <h2>
                <FaBoxes size="40" className="mb-2" /> Products
              </h2>
            }
            items={products}
            className="pt-4 rounded"
          />
        </Row>
        {/* link to products page */}
        <Row className="text-center mt-4 mb-5">
          <Col>
            <Link href="/products" passHref>
              <Button as="a" variant="outline-primary" className="border-3">
                See All Products <FaBoxes size={30} color="#197acf" />
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
              <h2>
                <MdBusinessCenter size="40" className="mb-2" /> Services
              </h2>
            }
          />
        </Row>
        {/* link to services page */}
        <Row className="text-center mt-4 mb-5">
          <Col>
            <Link href="/services" passHref>
              <Button as="a" variant="outline-primary" className="border-3">
                See All Services <MdBusinessCenter size={30} color="#197acf" />
              </Button>
            </Link>
          </Col>
        </Row>
      </Layout>
    );
  };

export default Home;
