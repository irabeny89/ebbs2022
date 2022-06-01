import { makeVar } from "@apollo/client";
import { JwtPayload } from "jsonwebtoken";
import type { OrderItemType, UserPayloadType, ToastPayloadType } from "types";

export const accessTokenVar = makeVar("");

export const authPayloadVar = makeVar<Partial<UserPayloadType> & JwtPayload>(
  {}
);

export const cartItemsVar = makeVar<OrderItemType[]>([]);

export const toastPayloadsVar = makeVar<ToastPayloadType[]>([]);
