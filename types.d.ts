import mongoose, { Document, Connection, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import Dataloader from "dataloader";
import { JwtPayload } from "jsonwebtoken";
import { MicroRequest } from "apollo-server-micro/dist/types";
import path from "path";
import { MutableRefObject, ReactNode } from "react";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Dispatch, SetStateAction } from "react";

type JwtPayload = {
  [key: string]: any;
  iss?: string | undefined;
  sub?: string | undefined;
  aud?: string | string[] | undefined;
  exp?: number | undefined;
  nbf?: number | undefined;
  iat?: number | undefined;
  jti?: string | undefined;
};

type ModalShowStateType = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
};

type FormValidateStateType = {
  validated: boolean;
  setValidated: Dispatch<SetStateAction<boolean>>;
};

type PassCodeDataType = Record<"email" | "hashedPassCode", string>;

type AuthComponentType<PropsType = {}> = {
  (PropsType): JSX.Element;
  audiences: UserPayloadType["audience"][];
  displayName: string;
};

type UserPayloadType = {
  serviceId?: string;
  username: string;
  audience: "admin" | "user";
  id: string;
};

type StatusType = "DELIVERED" | "PENDING" | "SHIPPED" | "CANCELED";

type TokenPairType = {
  accessToken: string;
  refreshToken: string;
};

type ProductCategoryType =
  | "WEARS"
  | "ELECTRICALS"
  | "VEHICLES"
  | "ELECTRONICS"
  | "FOOD_DRUGS"
  | "PETS"
  | "SOFTWARES"
  | "ARTS"
  | "EDUCATION";

type TimestampAndId = {
  _id: string | mongoose.Types.ObjectId;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type StyleType = {
  className?: string;
  style?: CSSProperties;
};

type UserType = {
  role: "ADMIN" | "USER";
  username: string;
  email: string;
  password: string;
  salt: string;
} & TimestampAndId;

type ServiceType = {
  owner: mongoose.Types.ObjectId | string;
  title: string;
  logoCID: string;
  description: string;
  state: string;
  maxProduct: number;
} & TimestampAndId;

type ProductType = {
  name: string;
  description: string;
  category: ProductCategoryType;
  imagesCID: string;
  videoCID?: string;
  tags?: string[];
  price: number;
  provider: mongoose.Types.ObjectId;
} & TimestampAndId;

type OrderItemType = {
  _id?: mongoose.Types.ObjectId | string;
  productId: string | mongoose.Types.ObjectId;
  providerId: string | mongoose.Types.ObjectId;
  providerTitle: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
  status?: StatusType;
};

type OrderStatsType = Record<
  "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELED",
  number
>;

type OrderType = {
  client: mongoose.Types.ObjectId | string;
  items: OrderItemType[];
  phone: string;
  state: string;
  address: string;
  nearestBusStop: string;
  deliveryDate: Date;
  totalCost: number;
} & TimestampAndId;

type LikeType = {
  selection: mongoose.Types.ObjectId;
  happyClients: mongoose.Types.ObjectId[];
} & TimestampAndId;

type CommentType = {
  topic: mongoose.Types.ObjectId;
  poster: mongoose.Types.ObjectId;
  post: string;
} & TimestampAndId;

type MessageType = {
  message: string;
  sender: mongoose.Types.ObjectId | string;
  receiver: mongoose.Types.ObjectId | string;
} & TimestampAndId;

type MessageVertexType = Omit<MessageType, "sender"> &
  Record<"sender", UserVertexType>;

type ProductVertexType = Partial<
  Omit<ProductType, "provider"> & {
    saleCount: number;
    provider: ServiceVertexType;
  }
>;

type ServiceVertexType = Partial<
  Omit<ServiceType, "owner"> & {
    happyClients: (string | mongoose.Types.ObjectId)[];
    products: CursorConnectionType<ProductVertexType>;
    comments: CursorConnectionType<CommentVertexType>;
    orders: CursorConnectionType<OrderVertexType>;
    categories: [ProductCategoryType];
    commentCount: number;
    productCount: number;
    orderCount: number;
    likeCount: number;
  }
>;

type CommentVertexType = Partial<{
  topic: ServiceVertexType;
  poster: UserVertexType;
}> &
  Omit<CommentType, "topic" | "poster">;

type UserVertexType = Partial<
  Pick<UserType, "username" | "email"> & {
    service: ServiceVertexType;
    requests: CursorConnectionType<OrderVertexType>;
    requestCount: number;
  } & TimestampAndId
>;

type OrderVertexType = Partial<Omit<OrderType, "client">> & {
  client: UserVertexType;
  orderStats: OrderStatsType;
};

type PaginationInfoType = {
  totalPages: number;
  totalItems: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type CursorConnectionType<NodeType> = {
  edges: EdgeType<NodeType>[];
  pageInfo: PageInfoType;
};

type EdgeType<NodeType> = {
  cursor: Date | string;
  node: NodeType;
};

type PageInfoType = {
  startCursor: Date | string;
  endCursor: Date | string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PagingInputType = Partial<{
  first: number;
  after: Date | string;
  last: number;
  before: Date | string;
  search: string;
}>;

type CursorConnectionArgsType<T> = Record<"list", T[]> & PagingInputType;

type RegisterVariableType = Record<
  "registerInput",
  Pick<UserType, "username" | "password"> &
    Partial<Pick<ServiceType, "title" | "logoCID" | "description" | "state">> &
    Record<"passCode", string>
>;

type UserLoginVariableType = Record<"email" | "password", string>;

type ServiceReturnType = Record<
  "services",
  CursorConnectionType<ServiceVertexType>
>;

type ServiceVariableType = Record<
  "productArgs" | "serviceArgs",
  PagingInputType
>;

type ChangePasswordVariableType = Record<"passCode" | "newPassword", string>;

type ServiceUpdateVariableType = Record<
  "serviceUpdate",
  Partial<Pick<ServiceType, "title" | "description" | "logoCID" | "state">>
>;

type ServiceUpdateFormDataType = Partial<{
  title: string;
  description: string;
  state: string;
  logo: File;
}>;

type NewProductVariableType = Record<
  "newProduct",
  Omit<ProductType, "provider" | "createdAt" | "updatedAt" | "_id">
>;

type NewProductFormDataType = Pick<
  ProductType,
  "name" | "category" | "description" | "price"
> & { images: File[]; video?: File; tags?: string };

type GraphContextType = {
  UserModel: Model<UserType>;
  ServiceModel: Model<ServiceType>;
  CommentModel: Model<CommentType>;
  OrderModel: Model<OrderType>;
  ProductModel: Model<ProductType>;
  LikeModel: Model<LikeType>;
  req: NextApiRequest;
  res: NextApiResponse;
  sendEmail: (
    emailOptions: Mail.Options
  ) => Promise<
    SMTPTransport.SentMessageInfo &
      Record<"testAccountMessageUrl", string | false>
  >;
};

type ServiceCardPropsType = Required<ServiceVertexType> & StyleType;

type ProductCardPropsType = Required<
  Omit<ProductVertexType, "createdAt" | "updatedAt">
> &
  StyleType;

type HomePagePropsType = {
  products: ProductCardPropType[];
  services: ServiceCardPropType[];
};

type ProductSectionPropsType = {
  items: ProductCardPropType[];
  title?: ReactNode | string | null;
} & StyleType;

type ProductListPropsType = {
  items: ProductCardPropType[];
  carousel?: boolean;
} & StyleType;

type ServiceSectionPropType = {
  items: ServiceCardPropType[];
  title?: ReactNode | string | null;
} & StyleType;

type ServiceListPropType = {
  items: ServiceCardPropType[];
} & StyleType;

type ServiceLabelPropType = Required<
  Pick<
    ServiceVertexType,
    "_id" | "categories" | "description" | "logoCID" | "title" | "state"
  >
> &
  StyleType;

type ServiceLikeButtonPropsType = {
  serviceId: string;
};

type LayoutPropsType = {
  children: ReactNode;
};

type PageIntroPropsType = {
  pageTitle: ReactNode | string;
  paragraphs?: string[];
};

type ProfileSectionPropsType = {
  logoCID?: string;
  username?: string;
  createdAt?: string | Date;
  title?: string;
  email?: string;
  maxProduct?: number;
  productCount?: number;
  likeCount?: number;
  categories?: [ProductCategoryType];
  state?: string;
  description?: string;
};

type TabTitlePropsType = {
  label: string;
  countValue?: number;
};

type DeliveryFormType = {
  children: ReactNode;
};

type AddProductModalType = ModalShowStateType;

type EditProductModalType = Omit<
  ProductType,
  "createdAt" | "updatedAt" | "provider"
> &
  ModalShowStateType;

type AjaxFeedbackProps = {
  loading?: boolean;
  error?: any;
  text?: string;
  successText?: string;
} & StyleType;

type MoreButtonPropType = {
  hasLazyFetched: boolean;
  fetchMore: any;
  initialFetch: any;
  loading: boolean;
  label: ReactNode | string;
};

type SortedListWithTabsPropType = {
  tabsVariantStyle?: "pills" | "tabs";
  field: string;
  rendererProps?: { [k: string]: any };
  list: { [k: string]: any }[];
  ListRenderer: (props: any) => JSX.Element;
} & StyleType;

type OrdersOrRequestsPropType = {
  asRequestList?: boolean;
  title: string;
  items: OrderVertexType[];
} & StyleType;

type QuickStartModalPropType = {
  features: string[];
  link: string;
} & ModalShowStateType;

type MessagePosterPropsType = {
  action: (message: string) => void;
  label: string;
  isSubmitting: boolean;
};

type InfoModalPropsType = Record<"title" | "body", string> & ModalShowStateType;

type InfoButtonPropsType = {
  setShow: ModalShowStateType["setShow"];
};

type EditButtonPropsType = {
  setShow: ModalShowStateType["setShow"];
};

type DeleteButtonPropsType = {
  setShow: ModalShowStateType["setShow"];
};

type DeleteModalPropsType = {
  handleDelete: () => {};
  name: string;
  deleteLoading: boolean;
} & ModalShowStateType;

type CommentDisplayButtonPropsType = {
  serviceId: string;
  serviceName: string;
};

type CartModalPropType = ModalShowStateType;

type DirectMessageCardPropsType = MessageVertexType;

type DirectMessagerType = {
  _id: string;
  username: string;
  unSeenReceivedCount: number;
  unSeenSentCount: number;
};

type DirectMessagerPropsType = DirectMessagerType;

type SearchResultModalType = {
  foundProducts: ProductVertexType[];
  productsHasNextPage: boolean | undefined;
  foundServices: ServiceVertexType[];
  servicesHasNextPage: boolean | undefined;
  productsEndCursor: string | Date | undefined;
  fetchMore: any;
  searchLoading: boolean;
} & ModalShowStateType;

type ServiceCommentModalType = {
  serviceId: string;
  serviceName: string;
} & ModalShowStateType;
