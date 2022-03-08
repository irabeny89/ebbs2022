import client from "@/graphql/apollo-client";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useLazyQuery } from "@apollo/client";
import type {
  CursorConnectionType,
  PagingInputType,
  ProductCardPropType,
} from "types";
import { GetStaticProps } from "next";
import { FaBoxes } from "react-icons/fa";
import { useRef } from "react";
import ProductSection from "@/components/ProductSection";
import { FEW_PRODUCTS } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";
import SortedListWithTabs from "@/components/SortedListWithTabs";

// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find products page data
  productsPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "products"
  );
// fetch data at build time
export const getStaticProps: GetStaticProps = async () => {
    const { data, error } = await client.query<
      Record<"products", CursorConnectionType<ProductCardPropType>>,
      Record<"args", PagingInputType>
    >({
      query: FEW_PRODUCTS,
      variables: { args: { last: 20 } },
      fetchPolicy: "no-cache",
    });

    return error
      ? { notFound: true }
      : { props: data.products, revalidate: 30 };
  },
  // products page component
  ProductsPage = ({
    edges,
    pageInfo: { endCursor, hasNextPage },
  }: CursorConnectionType<ProductCardPropType>) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false);
    // omit cursor property from edge node
    const products = edges.map((item) => item.node);
    // lazy fetch more products
    const [fetchMoreProducts, { data, loading, fetchMore }] = useLazyQuery<
      Record<"products", CursorConnectionType<ProductCardPropType>>,
      Record<"args", PagingInputType>
    >(FEW_PRODUCTS, {
      variables: {
        args: { last: 20, before: endCursor },
      },
    });

    return (
      <Layout>
        {/* head title for tabs */}
        <Head>
          <title>
            {abbr} | {productsPage?.pageTitle}
          </title>
        </Head>
        {/* products page content */}
        <Container fluid>
          {/* page title */}
          <Row className="mb-5 h1">
            <Col>
              <FaBoxes size="40" className="mb-2" /> {productsPage?.pageTitle}
            </Col>
          </Row>
          {/* first paragraph */}
          <Row
            as="p"
            className="my-4 text-center justify-content-center display-5"
          >
            {productsPage?.parargraphs[0]}
          </Row>
          <SortedListWithTabs
            ListRenderer={ProductSection}
            field="category"
            list={products
              .concat(data?.products.edges.map((edge) => edge.node) ?? [])
              .reverse()}
            rendererProps={{ className: "pt-4 rounded" }}
          />
          <Row>
            <Col>
              {hasNextPage ? (
                <MoreButton
                  {...{
                    customFetch: fetchMoreProducts,
                    fetchMore: () =>
                      fetchMore({
                        variables: {
                          args: {
                            last: 20,
                            before: data?.products?.pageInfo?.endCursor,
                          },
                        },
                      }),
                    hasLazyFetched,
                    label: "More products",
                    loading,
                  }}
                />
              ) : null}
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  };

export default ProductsPage;
