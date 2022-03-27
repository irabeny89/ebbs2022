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
  ServiceCardPropType,
  ServiceReturnType,
  ServiceVariableType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import { useRef } from "react";
import { FaBoxes } from "react-icons/fa";
import ServiceSection from "@/components/ServiceSection";
import { FEW_SERVICES } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";

// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find products page data
  servicesPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "services"
  );

// get data at build time - ssg
export const getStaticProps: GetStaticProps = async () => {
    // fetch list
    const { data, error } = await client.query<
      ServiceReturnType,
      ServiceVariableType
    >({
      query: FEW_SERVICES,
      variables: {
        commentArgs: {
          last: 20,
        },
        productArgs: {
          last: 5,
        },
        serviceArgs: {
          last: 20,
        },
      },
      fetchPolicy: "no-cache",
    });

    return error
      ? { notFound: true }
      : { props: data.services, revalidate: 20 };
  },
  // services page component
  ServicesPage = ({
    edges,
    pageInfo: { endCursor, hasNextPage },
  }: CursorConnectionType<ServiceCardPropType>) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false),
      // lazy fetch more products
      [fetchMoreServices, { data, loading, fetchMore }] = useLazyQuery<
        ServiceReturnType,
        ServiceVariableType
      >(FEW_SERVICES, {
        variables: {
          serviceArgs: {
            last: 20,
            before: endCursor,
          },
          commentArgs: {
            last: 20,
          },
          productArgs: {
            last: 5,
          },
        },
      });
    // omit cursor property from edge node
    const services = [...(data?.services.edges ?? []), ...edges]
      .map((edge) => edge.node)
      .filter((item) => item.products?.edges.length! > 0);

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
          <Row className="mb-4 h1">
            <Col>
              <FaBoxes size="40" className="mb-2" /> {servicesPage?.pageTitle}
            </Col>
          </Row>
          <hr />
          {/* first paragraph */}
          <Row className="my-4 text-center">
            <Col>{servicesPage?.parargraphs[0]}</Col>
          </Row>
          {/* category tabs 
          N.B - no need to use SortedListWithTabs component because it is incompatible with the requirements here.
          */}
          <Tabs id="category-tabs" defaultActiveKey="ALL">
            {/* render category as tabs */}
            {["ALL"]
              .concat(...services.map((item) => item.categories!))
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
                          ? (services as ServiceCardPropType[])
                          : (services.filter((item) =>
                              item.categories!.includes(
                                category as ProductCategoryType
                              )
                            ) as ServiceCardPropType[])
                      }
                    />
                  </Row>
                </Tab>
              ))}
            {hasNextPage ? (
              <MoreButton
                {...{
                  customFetch: fetchMoreServices,
                  fetchMore: () =>
                    fetchMore({
                      variables: {
                        serviceArgs: {
                          last: 20,
                          before: endCursor,
                        },
                        commentArgs: {
                          last: 20,
                        },
                        productArgs: {
                          last: 5,
                        },
                      },
                    }),
                  hasLazyFetched,
                  label: "More services",
                  loading,
                }}
              />
            ) : null}
          </Tabs>
        </Container>
      </Layout>
    );
  };

export default ServicesPage;
