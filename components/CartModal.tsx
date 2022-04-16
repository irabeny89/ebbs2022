import Modal from "react-bootstrap/Modal";
import { CartModalPropType } from "types";
import Link from "next/link";
import {
  authPayloadVar,
  cartItemsVar,
} from "@/graphql/reactiveVariables";
import { useReactiveVar } from "@apollo/client";
import countCartItems from "@/utils/countCartItems";
import CartItems from "./CartItems";
import DeliveryForm from "./DeliveryForm";

export default function CartModal({ show, setShow }: CartModalPropType) {
  const authPayload = useReactiveVar(authPayloadVar),
    cartItems = useReactiveVar(cartItemsVar);

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          Cart Items | {countCartItems(cartItems)}{" "}
          {!authPayload && (
            <>
              | <Link href="/member">Login to order</Link>
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DeliveryForm>
          <CartItems />
        </DeliveryForm>
      </Modal.Body>
    </Modal>
  );
}
