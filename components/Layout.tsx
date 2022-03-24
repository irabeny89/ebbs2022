import { CSSProperties, useEffect } from "react";
import config from "../config";
import { FaShoppingCart, FaTelegramPlane } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import {
  accessTokenVar,
  authPayloadVar,
  cartItemsVar,
} from "@/graphql/reactiveVariables";
import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import type {
  CursorConnectionType,
  LayoutPropsType,
  OrderItemType,
  OrderType,
  PagingInputType,
  ProductVertexType,
  ServiceVertexType,
} from "types";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import {
  FEW_PRODUCTS_AND_SERVICES,
  MY_PROFILE,
  SERVICE_ORDER,
} from "@/graphql/documentNodes";
import dynamic from "next/dynamic";

// dynamically import components - tree shaking
const CartModal = dynamic(() => import("./CartModal"), { ssr: false }),
  SearchResultModal = dynamic(() => import("./SearchResultModal"), {
    ssr: false,
  });
// get cart items total count
const getCartItemsTotalCount = (cartItems: OrderItemType[]) =>
    cartItems.reduce((prev, elem) => elem.quantity! + prev, 0),
  // get storage key constant
  { title, author, socialMedia, webPages } = config.appData;
// layout style
const mainStyle: CSSProperties = {
  minHeight: "90vh",
};
// layout component
const Layout = ({ children }: LayoutPropsType) => {
  // state variable to handle cart modal clicks
  const [show, setShow] = useState(false),
    // state variable for search list modal
    [showSearch, setShowSearch] = useState(false),
    // form validation state
    [validated, setValidated] = useState(false),
    // get reactive cart items variable
    cartItems = useReactiveVar(cartItemsVar),
    // auth payload state
    authPayload = useReactiveVar(authPayloadVar),
    // access token
    accessToken = useReactiveVar(accessTokenVar),
    // send order mutation
    [sendRequest, { data, loading }] = useMutation<
      Record<"serviceOrder", string>,
      Record<
        "serviceOrderInput",
        Pick<
          OrderType,
          "items" | "phone" | "state" | "address" | "nearestBusStop"
        >
      >
    >(SERVICE_ORDER, {
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      refetchQueries: [MY_PROFILE],
    }),
    // search for products
    [searchProduct, { data: searchData, loading: searchLoading, fetchMore }] =
      useLazyQuery<
        Record<"products", CursorConnectionType<ProductVertexType>> &
          Record<"services", CursorConnectionType<ServiceVertexType>>,
        Record<
          "productArgs" | "serviceArgs" | "commentArgs" | "serviceProductArgs",
          PagingInputType
        >
      >(FEW_PRODUCTS_AND_SERVICES);
  // on mount update cart items reactive variable from local storage
  useEffect(() => {
    cartItemsVar(getLastCartItemsFromStorage(localStorage));
  }, []);
  // show search result when ready
  useEffect(() => {
    searchData && setShowSearch(true);
  }, [searchData]);
  // clear order alert after some time
  useEffect(() => {
    setTimeout(() => {
      if (data) data.serviceOrder = "";
    }, 3000);
  }, [data]);
  // extract products from connection
  const foundProducts =
      searchData?.products.edges.map((edge) => edge.node) ?? [],
    // extract services from cursor connection
    foundServices = searchData?.services.edges.map((edge) => edge.node) ?? [];
  // get total cart items count
  const cartItemsCount = getCartItemsTotalCount(cartItems);

  return (
    <Container fluid as="main">
      {/* cart modal */}
      <CartModal
        {...{
          authPayload,
          cartItems,
          cartItemsCount,
          loading,
          sendRequest,
          setShow,
          setValidated,
          show,
          validated,
          serviceOrder: data?.serviceOrder,
        }}
      />
      {/* search result modal */}
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
      {/* navigation bar */}
      <Row as="header">
        <Navbar collapseOnSelect expand="md">
          <Link passHref href="/">
            <Navbar.Brand
              style={{
                cursor: "pointer",
              }}
            >
              {title}&trade;
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              {/* nav links */}
              {webPages.map((page) =>
                page.pageTitle.toLowerCase() === "dashboard" &&
                !authPayload ? null : (
                  <Link passHref href={page.route} key={page.pageTitle}>
                    <Nav.Link>{page.pageTitle}</Nav.Link>
                  </Link>
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Row>
      {/* status bar */}
      <Row className="mb-5 mt-3">
        <Col md={{ offset: 2 }} lg={{ offset: 3 }}>
          <Form
            onSubmit={(e) => {
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
            }}
          >
            <InputGroup>
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
        <Col xs="auto" md={{ offset: 2 }} lg={{ offset: 3 }}>
          <Button
            data-testid="cartButton"
            variant="outline-dark"
            onClick={() => setShow(true)}
          >
            {cartItemsCount} <FaShoppingCart size="25" />
          </Button>
        </Col>
      </Row>
      {/* dynamically add pages(children) to layout */}
      <Row style={mainStyle}>{children}</Row>
      {/* footer */}
      <Row
        as="footer"
        className="bg-secondary text-white py-2 justify-content-center"
      >
        {author} | {title}&trade; | &copy;2022{" "}
      </Row>
      <Row>
        <Col className="p-2 bg-secondary text-white">
          Social:
          {socialMedia.map(({ name, link }) =>
            name.toLowerCase() === "telegram" ? (
              <a href={link} className="p-2 text-white" key={name}>
                <FaTelegramPlane /> {name}
              </a>
            ) : name.toLowerCase() === "email" ? (
              <a href={`mailto:${link}`} className="p-2 text-white" key={name}>
                <MdEmail /> {name}
              </a>
            ) : (
              <a href={link} key={name}>
                {name}
              </a>
            )
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
