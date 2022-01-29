import { gql } from "apollo-server-micro";

const typeDefs = gql`
  # -- query --
  type Query {
    "Hello world test"
    hello: String!
    "refresh auth token"
    refreshToken: String!
    "single service"
    service(serviceId: ID): UserService
    "list of all services"
    services(args: PagingInput!): ServiceConnection
    "list of all products"
    products(args: PagingInput!): ProductConnection
    "list of products belonging to an authorized & authenticated user"
    myProducts(args: PagingInput!): ProductConnection
    "list of my orders belonging to an authorized & authenticated user"
    myOrders(args: PagingInput!): OrderConnection
    "list of my requests belonging to an authorized & authenticated user"
    myRequests(args: PagingInput!): OrderConnection
    "user login"
    login(email: String!, password: String!): String!
    "user profile data"
    me: User
  }
  # -- mutation --
  type Mutation {
    "register new user"
    userRegister(userRegisterInput: UserRegisterInput!): String!
    "request passcode to change password"
    requestPassCode(email: String!): String!
    "resetPassword with passcode"
    changePassword(passCode: String!, newPassword: String!): String!
    "toggles liking; like if not liked before vice versa"
    serviceLiking(serviceId: ID!): UserService
    "send purchase request; creates new order"
    serviceOrder(args: ServiceOrderInput!): ServiceOrder
    "set order status; updates order status"
    orderStatus(orderId: ID!, status: StatusOptions!): ServiceOrder
    "new product creation"
    newProduct(args: NewProductInput!): ServiceProduct
    "delete product by an authorized user"
    deleteMyProduct(productId: ID!): ServiceProduct
    "comment on a service by an authorized user"
    myComment(serviceId: ID!, post: String!): ServiceComment
    "update service by an authorized user"
    myServiceUpdate(args: MyServiceUpdateInput!): UserService
  }

  # -- inputs --
  input ServiceOrderInput {
    items: [OrderItemInput!]!
    phone: String!
    state: String!
    address: String!
    nearestBusStop: String!
  }

  input OrderItemInput {
    _id: ID!
  providerId: ID!
  name: String!
  price: Float!
  quantity: Int!
  cost: Float!
  }
  
  input UserPasswordChangeInput {
    newPassword: String!
    oldPassword: String!
  }

  input NewProductInput {
    name: String!
    description: String!
    images: [String]!
    video: String
    category: CategoryOption!
    tags: [String]
    price: Float!
  }

  input UserRegisterInput {
    username: String!
    email: String!
    password: String!
    title: String
    logo: String
    description: String
    state: String
  }

  input MyServiceUpdateInput {
    logo: String
    description: String
    state: String
    title: String
  }

  input UserUpdateInput {
    "user phone number"
    phone: String
    "resident state"
    state: String
    "resident country"
    country: String
    "business logo"
    logo: String
    "business description"
    description: String
    "business label"
    label: String
  }

  input PagingInput {
    # forward paging count
    first: Int
    # forward paging after this cursor eg endCursor
    after: String
    # backward paging count
    last: Int
    # backward paging befor this cursor eg startCursor"
    before: String
  }
  # -- enumerations --
  enum CategoryOption {
    WEARS
    ELECTRICALS
    VEHICLES
    ELECTRONICS
    FOOD_DRUGS
  }

  enum ActionOption {
    RATE
    UNRATE
  }

  enum StatusOptions {
    PENDING
    SHIPPED
    DELIVERED
    CANCELED
  }

  enum RequestStatusOption {
    DELIVERED
    CANCELED
  }

  enum OrderStatusOption {
    CANCELED
    SHIPPED
  }

  enum AudienceOptions {
    ADMIN
    USER
  }
  # -- paging object types --
  # the pagination object
  type PageInfo {
    # the start cursor of a list
    startCursor: String!
    # the end cursor of a list
    endCursor: String!
    # the next page indicator when moving forward in a list
    hasNextPage: Boolean!
    # the previous page indicator when moving backwards in a list
    hasPreviousPage: Boolean!
  }

  type CommentConnection {
    edges: [CommentEdge!]!
    pageInfo: PageInfo!
  }

  type CommentEdge {
    cursor: String!
    node: ServiceComment!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
  }

  type OrderEdge {
    cursor: String!
    node: ServiceOrder!
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
  }

  type ProductEdge {
    cursor: String!
    node: ServiceProduct!
  }
  
  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type ServiceEdge {
    cursor: String!
    node: UserService!
  }

  type ServiceConnection {
    edges: [ServiceEdge!]!
    pageInfo: PageInfo!
  }
  # -- vertices/nodes --
  # user object type
  type User {
    _id: ID!
    "the user's alias"
    username: String!
    "the user's email"
    email: String!
    "user products requests"
    requests(args: PagingInput!): OrderConnection
    "total number of user request"
    requestCount: Int!
    "the user's service"
    service: UserService
    "product creation date"
    createdAt: String!
    "product modification date"
    updatedAt: String!
  }
  # service object type
  type UserService {
    _id: ID!
    """the service name"""
    title: String!
    """the service logo"""
    logo: String!
    """service description"""
    description: String!
    """service home state"""
    state: String!
    "number of likes for the service"
    likeCount: Int!
    "list of users who likes the service"
    happyClients: [ID!]!
    """list of service products"""
    products(args: PagingInput!): ProductConnection
    """comments from clients"""
    comments(args: PagingInput!): CommentConnection
    """service orders from clients"""
    orders(args: PagingInput!): OrderConnection
    """all product categories"""
    categories: [CategoryOption]!
    """max product allowed per service"""
    maxProduct: Int!
    """the total number of orders per service"""
    orderCount: Int!
    """the total number of products per service"""
    productCount: Int!
    """the total number of comments per service"""
    commentCount: Int!
    """product creation date"""
    createdAt: String!
    """product modification date"""
    updatedAt: String!
  }
  # comment object type
  type ServiceComment {
    _id: ID!
    # the service commented on
    topic: UserService!
    # the client who posted the comment
    poster: User!
    # the comment post
    post: String!
    # product creation date
    createdAt: String!
    # product modification date
    updatedAt: String!
  }
  # product object type
  type ServiceProduct {
    _id: ID!
    "the product name"
    name: String!
    "the product description"
    description: String!
    "the product category"
    category: CategoryOption!
    "the product images"
    images: [String!]!
    "the product video clip - optional"
    video: String
    "the related names for the product"
    tags: [String]!
    "the product price"
    price: Float!
    "the product sales count"
    saleCount: Int!
    "the service the product belongs to"
    provider: UserService!
    "product creation date"
    createdAt: String!
    "product modification date"
    updatedAt: String!
  }

  type OrderItem {
    # the ordered product name
    name: String!
    # the ordered product price at the time
    price: Float!
    # the quantity ordered per item
    quantity: Int!
    # the cost of the item(s) - price * quantity
    cost: Float!
  }

  type ServiceOrder {
    _id: ID!
    # the user who placed the order
    client: User!
    # the service provider in charge of delivery
    provider: UserService!
    # delivery status
    status: StatusOptions!
    # the products in the order
    items: [OrderItem!]!
    # the client phone to call 
    phone: String!
    # the client home state
    state: String!
    # the client address
    address: String!
    # the client nearest bus stop
    nearestBusStop: String!
    # the delivery date specified by the service provider
    deliveryDate: String!
    # the items total cost
    totalCost: Float!
    # product creation date
    createdAt: String!
    # product modification date
    updatedAt: String!
  }
`;

export default typeDefs;
