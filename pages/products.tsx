import client from "@/graphql/apollo-client";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useLazyQuery } from "@apollo/client";
import type {
  CursorConnectionType,
  PagingInputType,
  ProductCardPropsType,
} from "types";
import { GetStaticProps } from "next";
import { FaBoxes } from "react-icons/fa";
import { useRef } from "react";
import ProductSection from "@/components/ProductSection";
import { FEW_PRODUCTS } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";
import SortedListWithTabs from "@/components/SortedListWithTabs";
import PageIntro from "@/components/PageIntro";

// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find products page data
  productsPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "products"
  );
// fetch data at build time
export const getStaticProps: GetStaticProps = async () => {
  const { data, error } = await client.query<
    Record<"products", CursorConnectionType<ProductCardPropsType>>,
    Record<"args", PagingInputType>
  >({
    query: FEW_PRODUCTS,
    variables: { args: { last: 25 } },
    fetchPolicy: "no-cache",
  });

  return error ? { notFound: true } : { props: data.products, revalidate: 15 };
};
// products page component
export default function ProductsPage({
  edges,
  pageInfo: { startCursor, hasPreviousPage },
}: CursorConnectionType<ProductCardPropsType>) {
  // ref for lazy fetch flag
  const hasLazyFetched = useRef(false),
    // lazy fetch more products
    [fetchProducts, { data, loading, fetchMore }] = useLazyQuery<
      Record<"products", CursorConnectionType<ProductCardPropsType>>,
      Record<"args", PagingInputType>
    >(FEW_PRODUCTS, {
      variables: {
        args: { last: 25, before: startCursor },
      },
      notifyOnNetworkStatusChange: true,
    }),
    handleFetchMore = () =>
      fetchMore({
        variables: {
          args: {
            last: 25,
            before: data?.products?.pageInfo?.startCursor,
          },
        },
      }),
    products = edges
      .map((item) => item.node)
      .concat(data?.products?.edges?.map((edge) => edge.node) ?? []),
    showMoreButton = data
      ? data?.products?.pageInfo?.hasPreviousPage
      : hasPreviousPage;

  return (
    <Layout>
      {/* head title for tabs */}
      <Head>
        <title>
          {abbr} | {productsPage?.pageTitle}
        </title>
      </Head>
      <PageIntro
        pageTitle={
          <>
            <FaBoxes size="40" className="mb-2" /> {productsPage?.pageTitle}
          </>
        }
        paragraphs={productsPage?.parargraphs}
      />
      <SortedListWithTabs
        ListRenderer={ProductSection}
        field="category"
        list={products}
        rendererProps={{ className: "pt-4" }}
      />
      <Row>
        <Col>
          {showMoreButton && (
            <MoreButton
              {...{
                initialFetch: fetchProducts,
                fetchMore: handleFetchMore,
                hasLazyFetched: (hasLazyFetched.current = !!data),
                label: "More products",
                loading,
              }}
            />
          )}
        </Col>
      </Row>
    </Layout>
  );
}
