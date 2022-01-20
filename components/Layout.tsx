import { CSSProperties, ReactNode, useEffect } from "react";
import Container from "react-bootstrap/Container";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import config from "config";
import { FaShoppingCart, FaTrash, FaFirstOrder } from "react-icons/fa";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import { useReactiveVar } from "@apollo/client";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import useAuthPayload from "hooks/useAuthPayload";
import type { LayoutPropsType, OrderItemType } from "types";
import getLocalePrice from "@/utils/getLocalePrice";
import getLastCartItemsFromStorage from "@/utils/getCartItemsFromStorage";
import AjaxFeedback from "./AjaxFeedback";

// get cart items total count
const getCartItemsTotalCount = (cartItems: OrderItemType[]) =>
    cartItems.reduce((prev, elem) => elem.quantity! + prev, 0),
  // get storage key constant
  {
    title,
    author,
    constants: { CART_ITEMS_KEY },
    webPages,
  } = config.appData,
  // layout style
  mainStyle: CSSProperties = {
    minHeight: "90vh",
  },
  // layout component
  Layout = ({ children }: LayoutPropsType) => {
    // state variable to handle modal clicks
    const [show, setShow] = useState(false),
      // mount state
      [hasMounted, setHasMounted] = useState(false),
      // get reactive cart items variable
      cartItems = useReactiveVar(cartItemsVar),
      // get token payload
      authPayload = useAuthPayload();
    // on mount update cart items reactive variable from local storage
    useEffect(() => {
      setHasMounted(true);
      cartItemsVar(getLastCartItemsFromStorage(localStorage));
    }, []);

    return hasMounted ? (
      <Container fluid as="main">
        {/* cart modal */}
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Cart Items | {getCartItemsTotalCount(cartItems)}
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
                          (elem) =>
                            item._id?.toString() !== elem._id?.toString()
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
                    <FormControl
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
            {!authPayload && (
              <Row>
                <Col className="h2 text-danger">
                  Wallet: &#8358; 0 Balance: &#8358; 0
                </Col>
                <Col className="h3">
                  <Link href="/member">Login</Link>
                </Col>
              </Row>
            )}
            {!!cartItems.length && (
              // delivery details
              <>
                <Row className="my-5 h2">Delivery Details:</Row>
                <Row className="my-3">
                  <Col>
                    <FloatingLabel label="Contact phone">
                      <FormControl
                        placeholder="Phone number to call"
                        type="tel"
                        disabled={!authPayload}
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row className="my-3">
                  <Col>
                    <FloatingLabel label="Full drop-off address">
                      <FormControl
                        placeholder="Full drop-off address"
                        disabled={!authPayload}
                        required
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row className="my-3">
                  <Col>
                    <FloatingLabel label="Nearest bus stop">
                      <FormControl
                        placeholder="Nearest bus stop"
                        required
                        disabled={!authPayload}
                      />
                    </FloatingLabel>
                  </Col>
                </Row>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              // on click, clear cart data from storage & memory
              onClick={() => (
                localStorage.removeItem(CART_ITEMS_KEY), cartItemsVar([])
              )}
            >
              <FaTrash size={20} className="mb-1" /> Clear cart
            </Button>
            <Button variant="success" disabled={!authPayload}>
              <FaFirstOrder size={20} className="mb-1" /> Send request
            </Button>
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
                                    Login/Register
                                  </NavDropdown.Item>
                                </Link>
                              ) : (
                                <NavDropdown.Item>Logout</NavDropdown.Item>
                              )}
                            </NavDropdown>
                          ) : (
                            <Link
                              passHref
                              href={page.route}
                              key={page.pageTitle}
                            >
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
          <Col xs="auto">
            <Link href="/member">login to buy</Link>
          </Col>
          <Col md={{ offset: 2 }} lg={{ offset: 3 }}>
            <FloatingLabel label="Find product or service">
              <FormControl placeholder="Find product or service" />
            </FloatingLabel>
          </Col>
          <Col xs="auto" md={{ offset: 2 }} lg={{ offset: 3 }}>
            <Button variant="outline-dark" onClick={() => setShow(true)}>
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
    ) : (
      <AjaxFeedback loading />
    );
  };

export default Layout;