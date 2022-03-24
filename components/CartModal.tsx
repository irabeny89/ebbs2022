import Modal from "react-bootstrap/Modal";
import { CartModalPropType } from "types";
import Link from "next/link";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FaTrash, FaFirstOrder } from "react-icons/fa";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import config from "config";
import getLocalePrice from "@/utils/getLocalePrice";

const {
  constants: { CART_ITEMS_KEY },
} = config.appData;

export default function CartModal({
  authPayload,
  cartItems,
  cartItemsCount,
  loading,
  sendRequest,
  serviceOrder,
  setShow,
  setValidated,
  show,
  validated,
}: CartModalPropType) {
  return (
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
        {serviceOrder && (
          <Alert>
            <Alert.Heading>{serviceOrder}</Alert.Heading>
            Go to{" "}
            <Link href="/dashboard" passHref>
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
                        {loading && <Spinner animation="grow" size="sm" />} Send
                        request
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
  );
}
