import mongoose, { Document, Connection, Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import Dataloader from "dataloader";
import { JwtPayload } from "jsonwebtoken";
import { MicroRequest } from "apollo-server-micro/dist/types";
import path from "path";
import { MutableRefObject, ReactNode } from "react";

type UserPayloadType = {
  serviceId?: string;
  username: string;
  audience: "ADMIN" | "USER";
};

type EmailOptionsType = {
  subject: string;
  from: string;
  to: string;
  body: string;
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
  | "FOOD_DRUGS";

type TimestampAndId = {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  passCode: string;
  codeStart: Date;
  codeEnd: Date;
} & TimestampAndId;

type ServiceType = {
  owner: mongoose.Types.ObjectId;
  title: string;
  logo: string;
  description: string;
  state: string;
  maxProduct: number;
} & TimestampAndId;

type ProductType = {
  name: string;
  description: string;
  category: ProductCategoryType;
  images: string[];
  video?: string;
  tags: string[];
  price: number;
  provider: mongoose.Types.ObjectId;
} & TimestampAndId;

type OrderItemType = {
  _id: string;
  providerId: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
};

type OrderType = {
  client: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  status: StatusType;
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

type ProductVertexType = Partial<
  Omit<ProductType, "provider"> & {
    saleCount: number;
    provider: ServiceVertexType;
  }
>;

type ServiceVertexType = Partial<
  Omit<ServiceType, "owner"> & {
    happyClients: string[];
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
  }
> &
  TimestampAndId;

type OrderVertexType = Partial<Omit<OrderType, "client">> &
  Record<"client", UserVertexType>;

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
  cursor: string;
  node: NodeType;
};

type PageInfoType = {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PagingInputType = Partial<{
  id: Pick<TimestampAndId, "_id">;
  first: number;
  after: string;
  last: number;
  before: string;
}>;

type GraphContextType = {
  UserModel: Model<UserType>;
  ServiceModel: Model<ServiceType>;
  CommentModel: Model<CommentType>;
  OrderModel: Model<OrderType>;
  ProductModel: Model<ProductType>;
  LikeModel: Model<LikeType>;
} & ContextArgType;

type ContextArgType = {
  req: NextApiRequest;
  res: NextApiResponse;
};

type ServiceCardPropType = Required<ServiceVertexType> & StyleType;

type ProductCardPropType = Required<
  Omit<ProductVertexType, "createdAt" | "updatedAt">
> &
  StyleType;

type HomePagePropType = {
  products: ProductCardPropType[];
  services: ServiceCardPropType[];
};

type ProductSectionPropType = {
  items: ProductCardPropType[];
  title?: ReactNode | string | null;
} & StyleType;

type ProductListPropType = {
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

type ServiceLabelPropType = Omit<ServiceVertexType, "products"> & StyleType;

type HomePagePropType = {
  services: ServiceCardPropType[];
  products: ProductType[];
};

type LayoutPropsType = {
  children: ReactNode;
};

type AjaxFeedbackProps = {
  loading?: boolean;
  error?: any;
  text?: string;
} & StyleType;

type MoreButtonPropType = {
  hasLazyFetched: MutableRefObject<boolean>;
  fetchMore: any;
  customFetch: any;
  loading: boolean;
  label: ReactNode | string;
};

type DashboardPropType = Required<UserVertexType> & Record<"info", string>;

type SortedListWithTabsPropType = {
  tabsVariantStyle?: "pills" | "tabs"
  field: string;
  className?: string;
  rendererProps: { [k: string]: any };
  list: { [k: string]: any }[];
  ListRenderer: (props: any) => JSX.Element;
};

type OrdersOrRequestsPropType = {
  items: OrderVertexType[];
  statuses: StatusType[];
} & StyleType;
