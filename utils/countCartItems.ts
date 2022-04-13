import { OrderItemType } from "types";

export default function countCartItems(cartItems: OrderItemType[]) {
  return cartItems.reduce((prev, elem) => elem.quantity! + prev, 0);
}
