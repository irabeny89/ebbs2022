import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import client from "@/graphql/apollo-client";
import { useLazyQuery } from "@apollo/client";
import { GetStaticProps } from "next";
import type {
  CursorConnectionType,
  ProductCategoryType,
  QueryVariableType,
  ServiceCardPropType,
  ServiceVertexType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import { useEffect, useRef, useState } from "react";
import { FaBoxes } from "react-icons/fa";
import ServiceSection from "@/components/ServiceSection";
import { FEW_SERVICES } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";
// graphql query return type
type QueryReturnType = {
  services: CursorConnectionType<ServiceVertexType>;
};

const variables = {
  commentArgs: {
    last: 50,
  },
  productArgs: {
    first: 10,
  },
  serviceArgs: {
    first: 100,
  },
};

// get data at build time
export const getStaticProps: GetStaticProps = async () => {
    // fetch list
    const { data, error } = await client.query<
      QueryReturnType,
      QueryVariableType
    >({
      query: FEW_SERVICES,
      variables,
    });

    return error ? { notFound: true } : { props: data.services };
  },
  // fetch web app meta data
  { webPages, abbr } = config.appData,
  // find products page data
  servicesPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "services"
  ),
  // services page component
  ServicesPage = ({
    edges,
    pageInfo: { endCursor, hasNextPage },
  }: CursorConnectionType<ServiceCardPropType>) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false),
      // omit cursor property from edge node
      services = edges.map((item) => item.node),
      // create state variable for products list
      [_services, setProducts] = useState(services),
      // lazy fetch more products
      [fetchMoreServices, { data, loading, fetchMore }] = useLazyQuery<
        QueryReturnType,
        QueryVariableType
      >(FEW_SERVICES);
    // preventing infinite loop
    useEffect(() => {
      if (data)
        setProducts([
          ..._services,
          ...data!.services.edges.map((item) => item.node),
        ]);
    }, [data]);

    return (
      <Layout>
        {/* head title for services page tab */}
        <Head>
          <title>
            {abbr} | {servicesPage?.pageTitle}
          </title>
        </Head>
        {/* products page content */}
        <Container fluid>
          {/* page title */}
          <Row className="mb-5 h1">
            <Col>
              <FaBoxes size="40" className="mb-2" /> {servicesPage?.pageTitle}
            </Col>
          </Row>
          {/* first paragraph */}
          <Row
            as="p"
            className="my-4 text-center justify-content-center display-5"
          >
            {servicesPage?.parargraphs[0]}
          </Row>
          {/* category tabs */}
          <Tabs id="category-tabs" defaultActiveKey="ALL">
            {/* render category as tabs */}
            {["ALL"]
              .concat(..._services.map((item) => item.categories!))
              // deduplicate categories
              .reduce(
                (prev: string[], cat) =>
                  prev.includes(cat) ? prev : [...prev, cat],
                []
              )
              .map((category) => (
                <Tab title={category} eventKey={category} key={category}>
                  <Row className="bg-danger my-0">
                    <ServiceSection
                      className="pt-4 rounded"
                      // render filtered services based on product categories
                      items={
                        category === "ALL"
                          ? _services
                          : _services.filter((item) =>
                              item.categories!.includes(
                                category as ProductCategoryType
                              )
                            )
                      }
                    />
                  </Row>
                </Tab>
              ))}
              {hasNextPage ? (
                    <MoreButton
                      {...{
                        customFetch: fetchMoreServices,
                        fetchMore,
                        hasLazyFetched,
                        label: "More services",
                        loading,
                        variables: {
                          ...variables,
                          serviceArgs: {
                            first: 50,
                            after:
                              data?.services?.pageInfo?.endCursor ?? endCursor,
                          },
                        },
                      }}
                    />
                  ) : null}
          </Tabs>
        </Container>
      </Layout>
    );
  };

export default ServicesPage;

// {
//   category === "ALL"
//     ? _services
//     : _services.filter((item) =>
//         item.categories!.includes(
//           category as ProductCategoryType
//         )
//       )
// }