import mongoose, { Document, Connection, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import Dataloader from "dataloader";
import { JwtPayload } from "jsonwebtoken";
import { MicroRequest } from "apollo-server-micro/dist/types";

type TimestampAndId = {
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

type CartItem = {
  product: mongoose.Types.ObjectId | ProductType;
  quantity: number;
  subTotal: number;
};

type PasswordRecovery = {
  start: Date;
  end: Date;
  accessCode: string;
};

export type UserType = {
  audience: "ADMIN" | "USER";
  firstname: string;
  lastname: string;
  state: string;
  country: string;
  ratedBusinesses: mongoose.Types.ObjectId[] | BusinessType[];
  requests: mongoose.Types.ObjectId[] | RequestType[];
  username: string;
  email: string;
  password: string;
  salt: string;
  passwordRecovery: PasswordRecovery;
  phone: string;
  business: mongoose.Types.ObjectId | BusinessType;
  wallet: mongoose.Types.ObjectId | WalletType;
  withdraws: mongoose.Types.ObjectId[] | WithdrawType[];
} & TimestampAndId;

export type BusinessType = {
  owner: mongoose.Types.ObjectId | UserType;
  label: string;
  logo: string;
  description: string;
  likeCount: number;
  products: ProductType[];
  orders: OrderType[];
  feeds: FeedType[];
  businessAdSubs: mongoose.Types.ObjectId[] | BusinessAdType[];
  productAdSubs: mongoose.Types.ObjectId[] | ProductAdType[];
} & TimestampAndId;

export type WalletType = {
  owner: mongoose.Types.ObjectId | UserType;
  account: string;
  bank: string;
  balance: number;
} & TimestampAndId;

export type RequestType = {
  items: CartItem[];
  itemsCount: number;
  status: "DELIVERED" | "PENDING" | "SHIPPED";
  owner: mongoose.Types.ObjectId | UserType;
  deliveryInfo: mongoose.Types.ObjectId | DeliveryInfoType;
  totalCost: number;
} & TimestampAndId;

export type OrderType = {
  provider: mongoose.Types.ObjectId | BusinessType;
  status: "DELIVERED" | "PENDING" | "SHIPPED";
  items: CartItem[];
  itemsCount: number;
  owner: mongoose.Types.ObjectId | UserType;
  deliveryInfo: mongoose.Types.ObjectId | DeliveryInfoType;
  totalCost: number;
} & TimestampAndId;

export type ProductType = {
  name: string;
  description: string;
  images: string[];
  video: string;
  category: "WEARS" | "ELECTRICALS" | "VEHICLES" | "ELECTRONICS" | "FOOD_DRUGS";
  tags: string[];
  price: number;
  soldCount: number;
  quantity: number;
  isDeleted: boolean;
  business: mongoose.Types.ObjectId | BusinessType;
} & TimestampAndId;

export type FeedType = {
  poster: mongoose.Types.ObjectId | UserType;
  post: string;
  business: mongoose.Types.ObjectId | BusinessType;
} & TimestampAndId;

export type BusinessAdType = {
  business: mongoose.Types.ObjectId | BusinessType;
  costPerDay: number;
  totalCost: number;
  start: Date;
  end: Date;
} & TimestampAndId;

export type ProductAdType = {
  product: mongoose.Types.ObjectId | ProductType;
  costPerDay: number;
  totalCost: number;
  start: Date;
  end: Date;
} & TimestampAndId;

export type DeliveryInfoType = {
  order: mongoose.Types.ObjectId | OrderType;
  contactPhone: String;
  nearestBusStop: string;
  localGovtArea: string;
  state: string;
  country: string;
} & TimestampAndId;

export type WithdrawType = {
  user: mongoose.Types.ObjectId | UserType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
} & TimestampAndId;

export type GraphContextType = {
  UserModel: Model<UserType>;
  FeedModel: Model<FeedType>;
  OrderModel: Model<OrderType>;
  WalletModel: Model<WalletType>;
  RequestModel: Model<RequestType>;
  ProductModel: Model<ProductType>;
  BusinessModel: Model<BusinessType>;
  WithdrawModel: Model<WithdrawType>;
  ProductAdModel: Model<ProductAdType>;
  BusinessAdModel: Model<BusinessAdType>;
  DeliveryAddressModel: Model<DeliveryInfoType>;
  RefreshTokenModel: Model<RefreshTokenType>;
} & ContextArgType;

export type ContextArgType = {
  req: NextApiRequest;
  res: NextApiResponse;
};

export type TokenPairType = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenType = {
  email: string;
  token: string;
} & TimestampAndId;

export type UserPayloadType = {
  username: string;
  id: string;
  audience: "ADMIN" | "USER";
};
