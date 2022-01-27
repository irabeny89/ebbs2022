import { makeVar } from "@apollo/client";
import { JwtPayload } from "jsonwebtoken";
import type { OrderItemType, UserPayloadType } from "types";

export const accessTokenVar = makeVar("");

export const authPayloadVar = makeVar<Partial<UserPayloadType> & JwtPayload>(
  {}
);

export const cartItemsVar = makeVar<OrderItemType[]>([]);

export const toastsVar = makeVar<{
  header?: string;
  message: string
}[]>([])