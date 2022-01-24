import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { gql, useLazyQuery } from "@apollo/client";
import client from "@/graphql/apollo-client";
import { GetStaticProps, GetStaticPaths } from "next";
import {
  CursorConnectionType,
  PagingInputType,
  ProductCardPropType,
  QueryVariableType,
  ServiceVertexType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import {
  FEW_SERVICES,
  PRODUCT_FRAGMENT,
  SERVICE_FRAGMENT,
} from "@/graphql/documentNodes";
import { useRouter } from "next/router";
import ServiceLabel from "@/components/ServiceLabel";
import ProductSection from "@/components/ProductSection";
import AjaxFeedback from "@/components/AjaxFeedback";
import MoreButton from "@/components/MoreButton";
import { useRef } from "react";
import SortedListWithTabs from "@/components/SortedListWithTabs";
// graphql query return type
type QueryReturnType = {
  services: CursorConnectionType<ServiceVertexType>;
};
// statically fetch paths for each service
export const getStaticPaths: GetStaticPaths = async () => {
  // fetch list
  const { data } = await client.query<QueryReturnType, QueryVariableType>({
    query: FEW_SERVICES,
    variables: {
      commentArgs: {
        last: 30,
      },
      productArgs: {
        first: 10,
      },
      serviceArgs: {
        first: 500,
      },
    },
  });

  return {
    paths: data.services.edges.map((edge) => ({
      params: { id: edge.node._id?.toString() },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { data, error } = await client.query<
      {
        service: ServiceVertexType;
      },
      { serviceId: string } & Record<
        "productArgs" | "commentArgs",
        PagingInputType
      >
    >({
      query: gql`
        ${PRODUCT_FRAGMENT}
        ${SERVICE_FRAGMENT}
        query UserService(
          $serviceId: ID!
          $productArgs: PagingInput!
          $commentArgs: PagingInput!
        ) {
          service(serviceId: $serviceId) {
            ...ServiceFields
            products(args: $productArgs) {
              edges {
                node {
                  ...ProductFields
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
            comments(args: $commentArgs) {
              edges {
                node {
                  _id
                  post
                  poster {
                    username
                  }
                  createdAt
                }
              }
            }
          }
        }
      `,
      variables: {
        serviceId: params?.id! as string,
        productArgs: { first: 100 },
        commentArgs: { last: 50 },
      },
    });

    return error ? { notFound: true } : { props: data.service, revalidate: 10 };
  },
  // service page component
  ServicePage = ({
    products: productConnection,
    ...rest
  }: ServiceVertexType) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false),
      // query mutation
      [fetchMoreProducts, { data, loading, fetchMore }] = useLazyQuery<
        {
          service: ServiceVertexType;
        },
        { serviceId: string; productArgs: PagingInputType }
      >(gql`
        ${PRODUCT_FRAGMENT}
        query ServiceProducts($productArgs: PagingInput!, $serviceId: ID!) {
          service(serviceId: $serviceId) {
            products(args: $productArgs) {
              edges {
                node {
                  ...ProductFields
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `);

    return (
      <Layout>
        {/* head title for service page tab */}
        <Head>
          <title>{config.appData.abbr} | Service</title>
        </Head>
        {/* when fetching data out of range of staticPaths */}
        {useRouter().isFallback ? (
          <AjaxFeedback loading />
        ) : (
          // service section
          <Container>
            <Row>
              <ServiceLabel {...rest} className="my-5" />
            </Row>
            <Row>
              {productConnection?.edges ? (
                <SortedListWithTabs
                  ListRenderer={ProductSection}
                  field="category"
                  list={
                    productConnection.edges
                      .map((edge) => edge.node)
                      .concat(
                        data?.service?.products?.edges.map(
                          (edge) => edge.node
                        )! ?? []
                      ) as ProductCardPropType[]
                  }
                  rendererProps={{ className: "pt-4 rounded" }}
                />
              ) : (
                <AjaxFeedback loading />
              )}
            </Row>
            <Row className="my-4">
              <Col>
                {productConnection?.pageInfo.hasNextPage ? (
                  <MoreButton
                    {...{
                      customFetch: fetchMoreProducts,
                      fetchMore,
                      hasLazyFetched,
                      label: "More services",
                      loading,
                      variables: {
                        productArgs: {
                          first: 50,
                          after:
                            data?.service?.products?.pageInfo?.endCursor ??
                            productConnection.pageInfo.endCursor,
                        },
                        serviceId: rest._id!,
                      },
                    }}
                  />
                ) : null}
              </Col>
            </Row>
          </Container>
        )}
      </Layout>
    );
  };

export default ServicePage;
