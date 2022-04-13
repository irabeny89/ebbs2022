import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import { useReactiveVar } from "@apollo/client";
import { FaTrash } from "react-icons/fa";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import config from "config";
import getLocalePrice from "@/utils/getLocalePrice";
import { OrderItemType } from "types";
import { ChangeEvent } from "react";

const {
  constants: { CART_ITEMS_KEY },
} = config.appData;

export default function CartItems() {
  const cartItems = useReactiveVar(cartItemsVar),
    handleDelete = (item: OrderItemType) => {
      // filter out the item
      const filteredList = getLastCartItemsFromStorage(localStorage).filter(
        (elem) => item.productId?.toString() !== elem.productId?.toString()
      );
      // update storage and state
      localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(filteredList));
      cartItemsVar(filteredList);
    },
    handleChange = (e: ChangeEvent<HTMLFormElement>, item: OrderItemType) => {
      e.preventDefault();
      // update cart item count with user input
      item.quantity = +e.currentTarget.value;
      // update cart item list
      const updatedCartItems = cartItems.map((countedItem) =>
        // if cart item is current item...
        item.productId?.toString() === countedItem.productId?.toString()
          ? // ...return updated object
            item
          : // ...else return unchanged object
            countedItem
      );
      // update storage & state
      localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCartItems));
      cartItemsVar(updatedCartItems);
    };

  return (
    <Container>
      {cartItems.map((item) => (
        // product name, delete button & quantity input
        <section key={item.productId.toString()}>
          <Row className="text-capitalize">
            {/* cart item name */}
            <Col xs="7">{item.name}</Col>
            {/* delete cart item button */}
            <Col>
              <FaTrash
                style={{ cursor: "pointer" }}
                color="red"
                size="20"
                onClick={() => handleDelete(item)}
              />
            </Col>
            {/* item quantity input */}
            <Col style={{ textAlign: "right" }} xs="3">
              <Form.Control
                type="number"
                min={1}
                name="quantity"
                defaultValue={item.quantity}
                onChange={(e: any) => handleChange(e, item)}
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
        </section>
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
    </Container>
  );
}
