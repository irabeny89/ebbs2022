import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLazyQuery } from "@apollo/client";
import client from "@/graphql/apollo-client";
import { GetStaticProps, GetStaticPaths } from "next";
import {
  PagingInputType,
  ProductCardPropType,
  ServiceReturnType,
  ServiceVariableType,
  ServiceVertexType,
} from "types";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import {
  FEW_SERVICES,
  SERVICE,
  SERVICE_PRODUCT,
} from "@/graphql/documentNodes";
import { useRouter } from "next/router";
import ServiceLabel from "@/components/ServiceLabel";
import ProductSection from "@/components/ProductSection";
import AjaxFeedback from "@/components/AjaxFeedback";
import MoreButton from "@/components/MoreButton";
import { useRef } from "react";
import SortedListWithTabs from "@/components/SortedListWithTabs";
// app data from config
const { abbr } = config.appData;
// statically fetch paths for each service
export const getStaticPaths: GetStaticPaths = async () => {
  // fetch list
  const { data } = await client.query<ServiceReturnType, ServiceVariableType>({
    query: FEW_SERVICES,
    variables: {
      commentArgs: {
        last: 20,
      },
      productArgs: {
        last: 20,
      },
      serviceArgs: {
        first: 50,
      },
    },
  });

  return {
    paths: data.services.edges.map((edge) => ({
      params: { id: edge?.node._id?.toString() },
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
      query: SERVICE,
      variables: {
        serviceId: params?.id! as string,
        productArgs: { last: 20 },
        commentArgs: { last: 20 },
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
      >(SERVICE_PRODUCT, {
        variables: {
          productArgs: {
            last: 20,
            before: productConnection?.pageInfo.endCursor,
          },
          serviceId: rest?._id?.toString()!,
        },
      });

    return (
      <Layout>
        {/* head title for service page tab */}
        <Head>
          <title>{abbr} | Service</title>
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
              {productConnection?.edges && (
                <SortedListWithTabs
                  ListRenderer={ProductSection}
                  field="category"
                  list={
                    productConnection.edges
                      .concat(data?.service?.products?.edges ?? [])
                      .map((edge) => edge.node) as ProductCardPropType[]
                  }
                  rendererProps={{ className: "pt-4 rounded" }}
                />
              )}
            </Row>
            <Row className="my-4">
              <Col>
                {productConnection?.pageInfo.hasNextPage ||
                data?.service.products?.pageInfo ? (
                  <MoreButton
                    {...{
                      customFetch: fetchMoreProducts,
                      fetchMore: () =>
                        fetchMore({
                          variables: {
                            serviceId: rest._id!,
                            productArgs: {
                              last: 20,
                              before:
                                data?.service.products?.pageInfo.endCursor,
                            },
                          },
                        }),
                      hasLazyFetched,
                      label: "More services",
                      loading,
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
