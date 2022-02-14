import { CSSProperties, useEffect } from "react";
import config from "../config";
import { FaShoppingCart, FaTrash, FaFirstOrder } from "react-icons/fa";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useLazyQuery, useMutation, useReactiveVar } from "@apollo/client";
import {
  accessTokenVar,
  cartItemsVar,
  toastsVar,
} from "@/graphql/reactiveVariables";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import useAuthPayload from "../hooks/useAuthPayload";
import type {
  CursorConnectionType,
  LayoutPropsType,
  OrderItemType,
  OrderType,
  PagingInputType,
  ProductVertexType,
  ServiceVertexType,
} from "types";
import getLocalePrice from "@/utils/getLocalePrice";
import getLastCartItemsFromStorage from "@/utils/getCartItemsFromStorage";
import {
  FEW_PRODUCTS_AND_SERVICES,
  MY_PROFILE,
  SERVICE_ORDER,
} from "@/graphql/documentNodes";
import SortedListWithTabs from "./SortedListWithTabs";
import ProductList from "./ProductList";
import ServiceList from "./ServiceList";

// get cart items total count
const getCartItemsTotalCount = (cartItems: OrderItemType[]) =>
    cartItems.reduce((prev, elem) => elem.quantity! + prev, 0),
  // get storage key constant
  {
    title,
    author,
    constants: { CART_ITEMS_KEY },
    webPages,
    generalErrorMessage,
  } = config.appData;
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
    // get token payload
    authPayload = useAuthPayload(),
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
  useEffect(() => {
    // show search result when ready
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
      {/* toast */}

      {/* cart modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Cart Items | {cartItemsCount}{" "}
            {!authPayload && (
              <>
                {" "}
                | <Link href="/member">Login to order</Link>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data?.serviceOrder && (
            <Alert>
              <Alert.Heading>{data.serviceOrder}</Alert.Heading>
              Go to{" "}
              <Link href="/member/dashboard" passHref>
                <Alert.Link>dashboard</Alert.Link>
              </Link>{" "}
              to see your requests.
            </Alert>
          )}
          {cartItems.map((item) => (
            <Container key={item.productId.toString()}>
              {/* product name, delete button & input element */}
              <Row className="text-capitalize">
                {/* cart item name */}
                <Col xs="7">{item.name}</Col>
                {/* delete cart item button */}
                <Col>
                  <FaTrash
                    style={{ cursor: "pointer" }}
                    color="red"
                    size="20"
                    onClick={() => {
                      // filter out the item
                      const filteredList = getLastCartItemsFromStorage(
                        localStorage
                      ).filter(
                        (elem) =>
                          item.productId?.toString() !==
                          elem.productId?.toString()
                      );
                      // update storage and state
                      localStorage.setItem(
                        CART_ITEMS_KEY,
                        JSON.stringify(filteredList)
                      );
                      cartItemsVar(filteredList);
                    }}
                  />
                </Col>
                {/* item quantity input */}
                <Col style={{ textAlign: "right" }} xs="3">
                  <Form.Control
                    type="number"
                    min={1}
                    name="quantity"
                    defaultValue={item.quantity}
                    onChange={(e) => {
                      e.preventDefault();
                      // update cart item count with user input
                      item.quantity = +e.currentTarget.value;
                      // update cart item list
                      const updatedCartItems = cartItems.map((countedItem) =>
                        // if cart item is current item...
                        item.productId?.toString() ===
                        countedItem.productId?.toString()
                          ? // ...return updated object
                            item
                          : // ...else return unchanged object
                            countedItem
                      );
                      // update storage & state
                      localStorage.setItem(
                        CART_ITEMS_KEY,
                        JSON.stringify(updatedCartItems)
                      );
                      cartItemsVar(updatedCartItems);
                    }}
                  />
                </Col>
              </Row>
              {/* cart item prices- subtotal & unit price */}
              <Row>
                <Col className="bg-warning" style={{ fontSize: "1.2rem" }}>
                  {getLocalePrice(item.price * item.quantity)}
                </Col>
                <Col
                  xs="5"
                  style={{ textAlign: "right" }}
                  className="bg-secondary my-1 text-white"
                >
                  {getLocalePrice(item.price)}
                </Col>
              </Row>
              <hr />
            </Container>
          ))}
          {/* total price calculation */}
          <Row className="h1">
            Total:{" "}
            {getLocalePrice(
              cartItems.reduce(
                (prev, item) => item.price * item.quantity! + prev,
                0
              )
            )}
          </Row>
          {/* show delivery details when cart has something */}
          {authPayload && !!cartItems.length && (
            // delivery details
            <Row>
              <Col>
                <h4 className="my-5">Delivery Details: </h4>
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    // check form validity
                    e.currentTarget.checkValidity()
                      ? (setValidated(false),
                        e.currentTarget.reset(),
                        sendRequest({
                          variables: {
                            serviceOrderInput: {
                              address: formData.get("address")?.toString()!,
                              items: getLastCartItemsFromStorage(localStorage),
                              nearestBusStop: formData
                                .get("nearestBusStop")
                                ?.toString()!,
                              phone: formData.get("phone")?.toString()!,
                              state: formData.get("state")?.toString()!,
                            },
                          },
                        }))
                      : (e.preventDefault(),
                        e.stopPropagation(),
                        setValidated(true));
                  }}
                >
                  <Form.Group>
                    <Form.Label>Select state</Form.Label>
                    <Form.Select size="lg" name="state" disabled={!authPayload}>
                      {[
                        "Abia",
                        "Adamawa",
                        "Akwa Ibom",
                        "Anambra",
                        "Bauchi",
                        "Bayelsa",
                        "Benue",
                        "Borno",
                        "Cross River",
                        "Delta",
                        "Ebonyi",
                        "Edo",
                        "Ekiti",
                        "Enugu",
                        "Gombe",
                        "Imo",
                        "Jigawa",
                        "Kaduna",
                        "Kano",
                        "Katsina",
                        "Kebbi",
                        "Kogi",
                        "Kwara",
                        "Lagos",
                        "Nasarawa",
                        "Niger",
                        "Ogun",
                        "Ondo",
                        "Osun",
                        "Oyo",
                        "Plateu",
                        "Rivers",
                        "Sokoto",
                        "Taraba",
                        "Yobe",
                        "Zamfara",
                      ].map((state) => (
                        <option
                          key={state}
                          value={state}
                          selected={state === "Lagos"}
                        >
                          {state}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.FloatingLabel label="Address">
                    <Form.Control
                      placeholder="Address"
                      aria-label="address"
                      name="address"
                      required
                      className="my-3"
                      disabled={!authPayload}
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                  <Form.FloatingLabel label="Nearest Bus Stop">
                    <Form.Control
                      placeholder="Nearest Bus Stop"
                      aria-label="nearest bus stop"
                      name="nearestBusStop"
                      required
                      className="my-3"
                      disabled={!authPayload}
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                  <Form.FloatingLabel label="Phone">
                    <Form.Control
                      placeholder="Phone"
                      aria-label="phone"
                      name="phone"
                      type="phone"
                      required
                      className="mb-4"
                      disabled={!authPayload}
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                  {!!cartItemsCount && (
                    <Modal.Footer>
                      <Button
                        size="lg"
                        variant="danger"
                        // on click, clear cart data from storage & memory
                        onClick={() => (
                          localStorage.removeItem(CART_ITEMS_KEY),
                          cartItemsVar([])
                        )}
                      >
                        <FaTrash size={20} className="mb-1" /> Clear cart
                      </Button>
                      {authPayload && (
                        <Button variant="success" size="lg" type="submit">
                          <FaFirstOrder size={20} className="mb-1" />
                          {loading && (
                            <Spinner animation="grow" size="sm" />
                          )}{" "}
                          Send request
                        </Button>
                      )}
                    </Modal.Footer>
                  )}
                </Form>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
      {/* search result modal */}
      <Modal show={showSearch} onHide={() => setShowSearch(false)} fullscreen>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>Search results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Modal.Title>
            Products Found: {foundProducts.length}
            {searchData?.products.pageInfo.hasNextPage && "+"}
          </Modal.Title>
          <br />
          <SortedListWithTabs
            ListRenderer={ProductList}
            field="category"
            list={foundProducts}
            rendererProps={{ className: "d-flex flex-wrap" }}
          />
          <Modal.Title className="mt-3">
            Services Found: {foundServices.length}
            {searchData?.services.pageInfo.hasNextPage && "+"}
          </Modal.Title>
          <br />
          <SortedListWithTabs
            ListRenderer={ServiceList}
            field="state"
            list={foundServices}
            rendererProps={{ className: "d-flex flex-wrap" }}
          />
        </Modal.Body>
        <Modal.Footer>
          {(searchData?.products.pageInfo.hasNextPage ||
            searchData?.services.pageInfo.hasNextPage) && (
            <Button
              size="lg"
              variant="outline-info"
              onClick={() =>
                fetchMore({
                  variables: {
                    args: {
                      first: 20,
                      after: searchData.products.pageInfo.endCursor,
                    },
                  },
                })
              }
            >
              {searchLoading && <Spinner animation="grow" size="sm" />} Load
              more
            </Button>
          )}
        </Modal.Footer>
      </Modal>
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
              {webPages.map((page) => (
                <Link passHref href={page.route} key={page.pageTitle}>
                  <Nav.Link>{page.pageTitle}</Nav.Link>
                </Link>
              ))}
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
            <Form.Group>
              <Row>
                <Col>
                  <Form.FloatingLabel label="Search...">
                    <Form.Control
                      placeholder="Find..."
                      arial-label="search product or service"
                      name="search"
                    />
                  </Form.FloatingLabel>
                </Col>
                <Col>
                  <Button size="lg" type="submit" variant="outline-info">
                    {searchLoading && <Spinner size="sm" animation="grow" />}
                    Search
                  </Button>
                </Col>
              </Row>
            </Form.Group>
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
        {author} | {title}&trade; | &copy;2021
      </Row>
    </Container>
  );
};

export default Layout;
