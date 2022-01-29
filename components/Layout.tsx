import { CSSProperties, ReactNode, useEffect } from "react";
import config from "../config";
import { FaShoppingCart, FaTrash, FaFirstOrder } from "react-icons/fa";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useMutation, useReactiveVar } from "@apollo/client";
import { cartItemsVar, toastsVar } from "@/graphql/reactiveVariables";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import useAuthPayload from "../hooks/useAuthPayload";
import type {
  LayoutPropsType,
  OrderItemType,
  OrderType,
  OrderVertexType,
} from "types";
import getLocalePrice from "@/utils/getLocalePrice";
import getLastCartItemsFromStorage from "@/utils/getCartItemsFromStorage";
import { SERVICE_ORDER } from "@/graphql/documentNodes";

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
    // form validation state
    [validated, setValidated] = useState(false),
    // get reactive cart items variable
    cartItems = useReactiveVar(cartItemsVar),
    // get token payload
    authPayload = useAuthPayload(),
    // get toasts
    toasts = useReactiveVar(toastsVar),
    // send order mutation
    [sendRequest, { data, error, loading }] = useMutation<
      Record<"serviceOrder", OrderVertexType>,
      Record<
        "serviceOrderInput",
        Pick<
          OrderType,
          "items" | "phone" | "state" | "address" | "nearestBusStop"
        >
      >
    >(SERVICE_ORDER);
  // on mount update cart items reactive variable from local storage
  useEffect(() => {
    cartItemsVar(getLastCartItemsFromStorage(localStorage));
  }, []);
  // show toast when order is sent ok
  data &&
    setShow(false) &&
    toastsVar([
      {
        message: "Order sent successfully.",
      },
    ]);
  // show toast when order errored
  error &&
    toastsVar([
      {
        header: error.name,
        message: "Something failed!",
      },
    ]);

  return (
    <Container fluid as="main">
      {/* toast */}
      <ToastContainer position="bottom-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.message}
            show={!!toast.message}
            onClose={() => {
              toastsVar(
                toasts.filter(({ message }) => toast.message !== message)
              );
            }}
            autohide
            bg={toast.message === generalErrorMessage ? "danger" : "info"}
          >
            <Toast.Header className="justify-content-between h5">
              {toast.header ?? "Feedback"}
            </Toast.Header>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
      {/* cart modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Cart Items | {getCartItemsTotalCount(cartItems)}{" "}
            {!authPayload && (
              <>
                {" "}
                | <Link href="/member">Login to order</Link>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.map((item) => (
            <Container key={item._id?.toString()!}>
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
                        (elem) => item._id?.toString() !== elem._id?.toString()
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
                        item._id?.toString() === countedItem._id?.toString()
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
          {data && (
            <Alert>
              Request ID {data.serviceOrder._id}. Check your{" "}
              <Link href="/member/dashboard">dashboard</Link> for more details
            </Alert>
          )}
          {/* show delivery details when cart has something */}
          {!!cartItems.length && (
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
                      type="phone"
                      required
                      className="mb-4"
                      disabled={!authPayload}
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                </Form>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Link href="/member">Login to order</Link>
          <Button
            variant="danger"
            // on click, clear cart data from storage & memory
            onClick={() => (
              localStorage.removeItem(CART_ITEMS_KEY), cartItemsVar([])
            )}
          >
            <FaTrash size={20} className="mb-1" /> Clear cart
          </Button>
          {loading ? (
            <Button>
              <Spinner animation="grow" />
            </Button>
          ) : (
            <Button variant="success" disabled={!authPayload || loading}>
              <FaFirstOrder size={20} className="mb-1" /> Send request
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
              {webPages.reduce(
                (prev: ReactNode[], page) =>
                  page.privacy === "ALL" ||
                  (page.privacy === "USER" && authPayload) ||
                  (page.privacy === "ADMIN" && authPayload?.aud === "ADMIN")
                    ? [
                        ...prev,
                        // for member page nav link
                        page.pageTitle.toLowerCase() === "member" ? (
                          <NavDropdown
                            key={page.pageTitle}
                            title={`${
                              authPayload ? authPayload.username : "Member"
                            }`}
                            id="collapsible-nav-dropdown"
                          >
                            {!authPayload ? (
                              <Link passHref href={page.route}>
                                <NavDropdown.Item>
                                  <NavDropdown.ItemText>
                                    Login/Register
                                  </NavDropdown.ItemText>
                                </NavDropdown.Item>
                              </Link>
                            ) : (
                              <>
                                <Link
                                  passHref
                                  href={
                                    page.links.find(
                                      (link) => link.pageTitle === "Dashboard"
                                    )!.route ?? ""
                                  }
                                >
                                  <NavDropdown.Item>
                                    <NavDropdown.ItemText>
                                      Dashboard
                                    </NavDropdown.ItemText>
                                  </NavDropdown.Item>
                                </Link>
                                <NavDropdown.Item>Logout</NavDropdown.Item>
                              </>
                            )}
                          </NavDropdown>
                        ) : (
                          <Link passHref href={page.route} key={page.pageTitle}>
                            <Nav.Link>{page.pageTitle}</Nav.Link>
                          </Link>
                        ),
                      ]
                    : prev,
                []
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Row>
      {/* status bar */}
      <Row className="mb-5 mt-3">
        <Col md={{ offset: 2 }} lg={{ offset: 3 }}>
          <Form.FloatingLabel label="Find..">
            <Form.Control placeholder="Find..." />
          </Form.FloatingLabel>
        </Col>
        <Col xs="auto" md={{ offset: 2 }} lg={{ offset: 3 }}>
          <Button
            data-testid="cartButton"
            variant="outline-dark"
            onClick={() => setShow(true)}
          >
            {getCartItemsTotalCount(cartItems)} <FaShoppingCart size="25" />
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
