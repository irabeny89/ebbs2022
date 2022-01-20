import { gql } from "apollo-server-micro";

const typeDefs = gql`
  # -- query --
  type Query {
    "Hello world test"
    hello: String!
    # refresh auth token
    refreshToken: TokenPair
    # single service
    service(serviceId: ID): UserService
    # list of services
    services(args: PagingInput): ServiceConnection
    # list of products
    products(args: PagingInput): ProductConnection
  }
  # -- mutation --
  type Mutation {
    # toggles liking; like if not like before vice versa
    serviceLiking(serviceId: ID!): LikeOption
  }

  # -- inputs --
  input UserPasswordRecoveryInput {
    passCode: String!
    newPassword: String!
  }

  input UserPasswordChangeInput {
    newPassword: String!
    oldPassword: String!
  }

  input ServiceProductCreateInput {
    name: String!
    description: String!
    images: [String]!
    video: String
    category: CategoryOption!
    tags: [String]
    price: Float!
    quantity: Int!
  }

  input UserLoginInput {
    email: String!
    password: String!
  }

  input UserCreateInput {
    firstname: String!
    lastname: String!
    "resident state"
    state: String!
    "resident country"
    country: String!
    username: String!
    email: String!
    phone: String!
    password: String!
    "business logo"
    logo: String
    "business description"
    description: String
    "business label"
    label: String
    "bank account number"
    accountNumber: String
    bank: String
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
  enum LikeOption {
    LIKE
    UNLIKE
  }
  
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
    DELIVERED
    PENDING
    SHIPPED
    CANCELED
  }

  enum AudienceOptions {
    ADMIN
    USER
  }
  # -- paging object types --
  # the token payload
  type TokenPair {
    # the access token
    accessToken: String
    # the refresh token for access token renewal
    refreshToken: String
  }
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
    # the user's alias
    username: String!
    # the user's email
    email: String!
    # product creation date
    createdAt: String!
    # product modification date
    updatedAt: String!
  }
  # service object type
  type UserService {
    _id: ID!
    # service name
    name: String!
    # service logo
    logo: String!
    # service description
    description: String!
    # service home country
    country: String!
    # service home state
    state: String!
    # number of likes for the service
    happyClients: [ID!]!
    # list of service products
    products(args: PagingInput): ProductConnection
    # comments from clients
    comments(args: PagingInput): CommentConnection
    # service orders from clients
    orders(args: PagingInput): OrderConnection
    # all product categories
    categories: [CategoryOption]!
    # max product allowed per service
    maxProduct: Int!
    # the total number of comments per service
    commentCount: Int!
    # product creation date
    createdAt: String!
    # product modification date
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
    # the product name
    name: String!
    # the product description
    description: String!
    # the product category
    category: CategoryOption!
    # the product images
    images: [String!]!
    # the product video clip - optional
    video: String
    # the related names for the product
    tags: [String]!
    # the product price
    price: Float!
    # the product sales count
    saleCount: Int!
    # the service the product belongs to
    provider: UserService!
    # product creation date
    createdAt: String!
    # product modification date
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
    # the client home country
    country: String!
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