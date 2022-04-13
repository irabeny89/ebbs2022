import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FaShoppingCart } from "react-icons/fa";
import { useState, FormEvent, useEffect } from "react";
import { FEW_PRODUCTS_AND_SERVICES } from "@/graphql/documentNodes";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import { useLazyQuery, useReactiveVar } from "@apollo/client";
import {
  CursorConnectionType,
  ProductVertexType,
  ServiceVertexType,
  PagingInputType,
} from "types";
import dynamic from "next/dynamic";
import countCartItems from "@/utils/countCartItems";
// dynamically import components - code splitting
const CartModal = dynamic(() => import("./CartModal"), {
    loading: () => <>loading..</>,
  }),
  SearchResultModal = dynamic(() => import("./SearchResultModal"), {
    loading: () => <>loading..</>,
  });

export default function SubHeader() {
  // states
  const [show, setShow] = useState(false),
    [showSearch, setShowSearch] = useState(false),
    cartItems = useReactiveVar(cartItemsVar);
  // queries
  const [
    searchProduct,
    { data: searchData, loading: searchLoading, fetchMore },
  ] = useLazyQuery<
    Record<"products", CursorConnectionType<ProductVertexType>> &
      Record<"services", CursorConnectionType<ServiceVertexType>>,
    Record<
      "productArgs" | "serviceArgs" | "commentArgs" | "serviceProductArgs",
      PagingInputType
    >
  >(FEW_PRODUCTS_AND_SERVICES);
  // extract products & services from returned data connection
  const foundProducts =
      searchData?.products.edges.map((edge) => edge.node) ?? [],
    foundServices = searchData?.services.edges.map((edge) => edge.node) ?? [];
  // click handlers
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const search = new FormData(e.currentTarget).get("search") as
      | string
      | undefined;

    search
      ? (e.currentTarget.reset(),
        searchProduct({
          variables: {
            productArgs: {
              search,
              first: 20,
            },
            serviceArgs: {
              search,
              first: 20,
            },
            commentArgs: {
              last: 20,
            },
            serviceProductArgs: {
              first: 10,
            },
          },
        }))
      : (e.preventDefault(), e.stopPropagation());
  };
  // on mount update cart items reactive variable from local storage
  useEffect(() => {
    cartItemsVar(getLastCartItemsFromStorage(localStorage));
  }, []);
  // show search result modal when ready
  useEffect(() => {
    searchData && setShowSearch(true);
  }, [searchData]);

  return (
    <Row className="mb-5 mt-3">
      <CartModal show={show} setShow={setShow} />
      <SearchResultModal
        {...{
          fetchMore,
          foundProducts,
          foundServices,
          productsEndCursor: searchData?.products.pageInfo.endCursor,
          productsHasNextPage: searchData?.products.pageInfo.hasNextPage,
          searchLoading,
          servicesHasNextPage: searchData?.services.pageInfo.hasNextPage,
          setShow: setShowSearch,
          show: showSearch,
        }}
      />
      <Col>
        <Form onSubmit={handleSubmit}>
          <InputGroup className="justify-content-center">
            <Form.FloatingLabel label="Search...">
              <Form.Control
                placeholder="Search..."
                arial-label="search product or service"
                name="search"
                size="sm"
              />
            </Form.FloatingLabel>
            <Button size="sm" type="submit" variant="secondary">
              {searchLoading && <Spinner size="sm" animation="grow" />}
              Search
            </Button>
          </InputGroup>
        </Form>
      </Col>
      <Col xs="auto">
        <Button
          data-testid="cartButton"
          variant="outline-dark"
          onClick={() => setShow(true)}
        >
          {countCartItems(cartItems)} <FaShoppingCart size="25" />
        </Button>
      </Col>
    </Row>
  );
}
