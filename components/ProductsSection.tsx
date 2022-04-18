import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useQuery, useReactiveVar } from "@apollo/client";
import { useState } from "react";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { PagingInputType, UserVertexType } from "types";
import { PRODUCTS_TAB } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";
import { MdAdd } from "react-icons/md";
import SortedListWithTabs from "./SortedListWithTabs";
import ProductList from "./ProductList";
import AddProductModal from "./AddProductModal";

export default function ProductsSection() {
  const accessToken = useReactiveVar(accessTokenVar),
    // product creation form modal state
    [show, setShow] = useState(false),
    { data, loading, error, fetchMore } = useQuery<
      Record<"me", UserVertexType>,
      Record<"productArgs", PagingInputType>
    >(PRODUCTS_TAB, {
      variables: {
        productArgs: { last: 25 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  return loading ? (
    <AjaxFeedback loading={loading} />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : !data?.me?.service?.title ? (
    <DashboardServiceAlert />
  ) : (
    <>
      <AddProductModal {...{ show, setShow }} />
      <Row className="mb-5">
        <Col>
          <Button
            onClick={() => setShow(true)}
            size="lg"
            disabled={!data?.me?.service?.title}
          >
            <MdAdd size={25} /> Add Product
          </Button>
        </Col>
      </Row>
      <SortedListWithTabs
        tabsVariantStyle="pills"
        className=""
        ListRenderer={ProductList}
        field="category"
        list={data?.me?.service?.products?.edges.map((edge) => edge.node)!}
        rendererProps={{ className: "d-flex flex-wrap pt-4" }}
      />
      {data?.me?.service?.products?.pageInfo.hasNextPage && (
        <Button
          size="lg"
          onClick={() =>
            fetchMore({
              variables: {
                productArgs: {
                  last: 25,
                  before: data?.me?.service?.products?.pageInfo?.endCursor,
                },
              },
            })
          }
        >
          See more
        </Button>
      )}
    </>
  );
}
