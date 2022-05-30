import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLazyQuery } from "@apollo/client";
import client from "@/graphql/apollo-client";
import { GetStaticProps, GetStaticPaths } from "next";
import {
  PagingInputType,
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
      productArgs: {
        last: 25,
      },
      serviceArgs: {
        first: 50,
      },
    },
  });
  
return {
  paths:
  data?.services?.edges.map(({ node }) => ({
    params: { id: node._id?.toString() },
  })) ?? [],
  fallback: "blocking",
};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params?.id) return { notFound: true };
  
  const { data, error } = await client.query<
  {
    service: ServiceVertexType;
  },
  { serviceId: string } & Record<"productArgs", PagingInputType>
  >({
    query: SERVICE,
    variables: {
      serviceId: params.id as string,
      productArgs: { last: 25 },
    },
  });
  
  if (error) return { notFound: true };
  
  return { props: data?.service, revalidate: 15 };
};

export default function ServicePage({
  products: productConnection,
  ...rest
}: Required<ServiceVertexType>) {
  // ref for lazy fetch flag
  const hasLazyFetched = useRef(false),
  // new data reference
  productsRef = useRef(productConnection.edges),
  // query mutation
  [fetchProducts, { data, loading }] = useLazyQuery<
  {
    service: ServiceVertexType;
  },
  { serviceId: string; productArgs: PagingInputType }
  >(SERVICE_PRODUCT, {
    variables: {
      productArgs: {
        last: 25,
        before: productConnection?.pageInfo.startCursor,
      },
      serviceId: rest?._id?.toString()!,
    },
  }),
  handleFetchMore = () =>
  fetchProducts({
    variables: {
      serviceId: rest._id.toString(),
      productArgs: {
        last: 25,
        before: data?.service.products?.pageInfo.startCursor,
      },
    },
  }),
  showMoreButton = data
  ? data?.service?.products?.pageInfo.hasPreviousPage
  : productConnection.pageInfo.hasPreviousPage;
  // deduplicate products data
  productsRef.current = [
    ...new Set(
      productsRef.current.concat(data?.service?.products?.edges ?? [])
      ),
    ];

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
          test
          <Row>
            <ServiceLabel {...rest} className="my-5" />
          </Row>
          <Row>
            {productConnection?.edges && (
              <SortedListWithTabs
                ListRenderer={ProductSection}
                field="category"
                list={productsRef.current.map(({ node }) => node)}
                rendererProps={{ className: "pt-4 rounded" }}
              />
            )}
          </Row>
          <Row className="my-4">
            <Col>
              {showMoreButton && (
                <MoreButton
                  {...{
                    initialFetch: fetchProducts,
                    fetchMore: handleFetchMore,
                    hasLazyFetched: (hasLazyFetched.current = !!data),
                    label: "More services",
                    loading,
                  }}
                />
              )}
            </Col>
          </Row>
        </Container>
      )}
    </Layout>
  );
}
