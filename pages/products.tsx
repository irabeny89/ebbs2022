import client from "@/graphql/apollo-client";
import Layout from "@/components/Layout";
import Head from "next/head";
import config from "config";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { gql, useLazyQuery } from "@apollo/client";
import type {
  CursorConnectionType,
  PagingInputType,
  ProductCardPropType,
} from "types";
import { GetStaticProps } from "next";
import { FaBoxes } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import ProductSection from "@/components/ProductSection";
import { PRODUCT_FRAGMENT } from "@/graphql/documentNodes";
import MoreButton from "@/components/MoreButton";
import SortedListWithTabs from "@/components/SortedListWithTabs";

// query document node
const PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query Products($args: PagingInput) {
    products(args: $args) {
      edges {
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// fetch data at build time
export const getStaticProps: GetStaticProps = async () => {
    const { data, error } = await client.query<
      {
        products: CursorConnectionType<ProductCardPropType>;
      },
      PagingInputType
    >({
      query: PRODUCTS,
      variables: { first: 100 },
    });

    return error ? { notFound: true } : { props: data.products };
  },
  // fetch web app meta data
  { webPages, abbr } = config.appData,
  // find products page data
  productsPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "products"
  ),
  // products page component
  ProductsPage = ({
    edges,
    pageInfo: { endCursor, hasNextPage },
  }: CursorConnectionType<ProductCardPropType>) => {
    // ref for lazy fetch flag
    const hasLazyFetched = useRef(false),
      // omit cursor property from edge node
      products = edges.map((item) => item.node),
      // create state variable for products list
      [_products, setProducts] = useState(products),
      // lazy fetch more products
      [fetchMoreProducts, { data, loading, fetchMore }] = useLazyQuery<
        {
          products: CursorConnectionType<ProductCardPropType>;
        },
        {
          first: number;
          after: string;
        }
      >(PRODUCTS);
    // preventing infinite loop
    useEffect(() => {
      if (data)
        setProducts([
          ..._products,
          ...data!.products.edges.map((item) => item.node),
        ]);
    }, [data]);

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
            list={_products}
            rendererProps={{ className: "pt-4 rounded" }}
          />
          <Row>
            <Col>
              {hasNextPage ? (
                <MoreButton
                  {...{
                    customFetch: fetchMoreProducts,
                    fetchMore,
                    hasLazyFetched,
                    label: "More products",
                    loading,
                    variables: {
                      first: 50,
                      after: data?.products?.pageInfo?.endCursor ?? endCursor,
                    },
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
