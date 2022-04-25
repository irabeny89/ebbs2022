import { gql } from "@apollo/client";
// fragments
export const PRODUCT_FRAGMENT = gql`
    fragment ProductFields on ServiceProduct {
      _id
      name
      description
      category
      imagesCID
      videoCID
      tags
      price
      saleCount
    }
  `,
  SERVICE_FRAGMENT = gql`
    fragment ServiceFields on UserService {
      _id
      title
      logoCID
      description
      state
      happyClients
      likeCount
      categories
      commentCount
    }
  `,
  PAGING_FRAGMENT = gql`
    fragment PageInfoFields on PageInfo {
      totalPages
      totalItems
      page
      perPage
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  `,
  COMMENT_FRAGMENT = gql`
    fragment CommentFields on ServiceComment {
      _id
      post
      poster {
        username
        service {
          _id
        }
      }
      createdAt
    }
  `,
  ORDER_FRAGMENT = gql`
    fragment OrderFields on ServiceOrder {
      _id
      client {
        username
      }
      items {
        _id
        name
        price
        quantity
        cost
        status
        productId
        providerId
        providerTitle
      }
      orderStats {
        PENDING
        CANCELED
        SHIPPED
        DELIVERED
      }
      phone
      state
      address
      nearestBusStop
      deliveryDate
      totalCost
      createdAt
    }
  `;

// query operations
export const REFRESH_TOKEN_QUERY = gql`
  query RefreshToken {
    refreshToken
  }
`;

export const USER_LOGIN = gql`
  query UserLogin($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const USER_REQUEST_PASSCODE = gql`
  query RequestPassCode($email: String!) {
    requestPassCode(email: $email)
  }
`;

export const SERVICE = gql`
  ${PRODUCT_FRAGMENT}
  ${SERVICE_FRAGMENT}
  query UserService($serviceId: ID!, $productArgs: PagingInput!) {
    service(serviceId: $serviceId) {
      ...ServiceFields
      products(args: $productArgs) {
        edges {
          node {
            ...ProductFields
            provider {
              _id
              title
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const SERVICE_LIKE_DATA = gql`
  query ServiceLikeData($serviceId: ID!, $commentArgs: PagingInput!) {
    service(serviceId: $serviceId) {
      _id
      happyClients
      likeCount
      commentCount
      comments(args: $commentArgs) {
        edges {
          node {
            _id
            post
            poster {
              username
            }
            createdAt
          }
        }
      }
    }
  }
`;

export const SERVICE_PRODUCT = gql`
  ${PRODUCT_FRAGMENT}
  query ServiceProducts($productArgs: PagingInput!, $serviceId: ID!) {
    service(serviceId: $serviceId) {
      _id
      products(args: $productArgs) {
        edges {
          node {
            ...ProductFields
            provider {
              _id
              title
            }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

export const FEW_SERVICES = gql`
  ${PRODUCT_FRAGMENT}
  query FewServices($serviceArgs: PagingInput!, $productArgs: PagingInput!) {
    services(args: $serviceArgs) {
      edges {
        node {
          _id
          title
          logoCID
          description
          state
          categories
          products(args: $productArgs) {
            edges {
              node {
                ...ProductFields
                provider {
                  _id
                  title
                }
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const FEW_PRODUCTS_AND_SERVICES = gql`
  ${PRODUCT_FRAGMENT}
  query FewProductsAndServices(
    $productArgs: PagingInput!
    $serviceArgs: PagingInput!
    $serviceProductArgs: PagingInput!
  ) {
    products(args: $productArgs) {
      edges {
        node {
          ...ProductFields
          provider {
            _id
            title
          }
        }
      }
    }
    services(args: $serviceArgs) {
      edges {
        node {
          _id
          title
          logoCID
          description
          state
          categories
          products(args: $serviceProductArgs) {
            edges {
              node {
                ...ProductFields
                provider {
                  _id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const FEW_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query Products($args: PagingInput!) {
    products(args: $args) {
      edges {
        node {
          ...ProductFields
          provider {
            _id
            title
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const PROFILE_TAB = gql`
  query ProfileTab {
    me {
      _id
      createdAt
      email
      service {
        _id
        title
        logoCID
        description
        state
        likeCount
        productCount
        maxProduct
        categories
        createdAt
      }
    }
  }
`;

export const COMMENTS_TAB = gql`
  query CommentsTab($commentArgs: PagingInput!) {
    me {
      _id
      service {
        _id
        title
        comments(args: $commentArgs) {
          edges {
            node {
              _id
              post
              poster {
                _id
                username
                service {
                  _id
                }
              }
              createdAt
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_TAB = gql`
  ${PRODUCT_FRAGMENT}
  query ProductsTab($productArgs: PagingInput!) {
    me {
      _id
      service {
        _id
        title
        products(args: $productArgs) {
          edges {
            node {
              ...ProductFields
              provider {
                _id
                title
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

export const REQUESTS_TAB = gql`
  ${ORDER_FRAGMENT}
  query RequestTab($requestArgs: PagingInput!) {
    me {
      _id
      requestCount
      requests(args: $requestArgs) {
        edges {
          node {
            ...OrderFields
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
      service {
        _id
        title
      }
    }
  }
`;

export const ORDERS_TAB = gql`
  ${ORDER_FRAGMENT}
  query OrdersTab($orderArgs: PagingInput!) {
    me {
      _id
      service {
        _id
        title
        orders(args: $orderArgs) {
          edges {
            node {
              ...OrderFields
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`;

export const DASHBOARD = gql`
  query Dashbaord {
    me {
      _id
      requestCount
      service {
        _id
        orderCount
        productCount
        commentCount
      }
    }
  }
`;

export const COMMENTS = gql`
  query Comments($commentArgs: PagingInput!, $serviceId: ID!) {
    service(serviceId: $serviceId) {
      _id
      comments(args: $commentArgs) {
        edges {
          node {
            _id
            post
            poster {
              _id
              username
              service {
                _id
              }
            }
            createdAt
          }
        }
      }
    }
  }
`;

export const COMMENT_COUNT = gql`
  query CommentCount($serviceId: ID!) {
    service(serviceId: $serviceId) {
      _id
      commentCount
    }
  }
`;

export const LIKES = gql`
  query Likes($serviceId: ID!) {
    service(serviceId: $serviceId) {
      _id
      likeCount
      happyClients
    }
  }
`;

export const LIKE_A_SERVICE = gql`
  mutation LikeAService($serviceId: ID!, $isFav: Boolean!) {
    myFavService(serviceId: $serviceId, isFav: $isFav)
  }
`;

export const MY_ORDERS = gql`
  ${ORDER_FRAGMENT}
  query OrderList($orderArgs: PagingInput!) {
    myOrders(args: $orderArgs) {
      edges {
        node {
          ...OrderFields
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const MY_REQUESTS = gql`
  ${ORDER_FRAGMENT}
  query RequestList($requestArgs: PagingInput!) {
    myRequests(args: $requestArgs) {
      edges {
        node {
          ...OrderFields
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const MY_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query MyProducts($productArgs: PagingInput!) {
    myProducts(args: $productArgs) {
      edges {
        node {
          ...ProductFields
          provider {
            _id
            title
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const LOGOUT = gql`
  query UserLogOut {
    logout
  }
`;

// mutation operations
export const USER_REGISTER = gql`
  mutation register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput)
  }
`;

export const USER_PASSWORD_CHANGE = gql`
  mutation PasswordChange($passCode: String!, $newPassword: String!) {
    changePassword(passCode: $passCode, newPassword: $newPassword)
  }
`;

export const UPDATE_ORDER_ITEM_STATUS = gql`
  mutation UpdateOrderItemStatus($orderItemStatusArgs: OrderItemStatusInput!) {
    updateOrderItemStatus(args: $orderItemStatusArgs)
  }
`;

export const ADD_NEW_PRODUCT = gql`
  mutation AddNewProduct($newProduct: NewProductInput!) {
    newProduct(args: $newProduct)
  }
`;

export const EDIT_PRODUCT = gql`
  mutation EditProduct($fields: EditProductInput!) {
    editProduct(args: $fields)
  }
`;

export const DELETE_MY_PRODUCT = gql`
  mutation DeleteMyProduct($productId: ID!) {
    deleteMyProduct(productId: $productId)
  }
`;

export const MY_FAV_SERVICE = gql`
  mutation ServiceLikeToggle($serviceId: ID!, $isFav: Boolean!) {
    myFavService(serviceId: $serviceId, isFav: $isFav)
  }
`;

export const SERVICE_ORDER = gql`
  mutation ServiceOrder($serviceOrderInput: ServiceOrderInput!) {
    serviceOrder(args: $serviceOrderInput)
  }
`;

export const MY_COMMENT = gql`
  mutation MyComment($serviceId: ID!, $post: String!) {
    myCommentPost(serviceId: $serviceId, post: $post)
  }
`;

export const DELETE_MY_COMMENT = gql`
  mutation DeleteMyComment($commentId: ID!) {
    deleteMyComment(commentId: $commentId)
  }
`;

export const MY_SERVICE_UPDATE = gql`
  mutation MyServiceUpdate($serviceUpdate: MyServiceUpdateInput!) {
    myServiceUpdate(args: $serviceUpdate)
  }
`;

export const SET_ORDER_DELIVERY_DATE = gql`
  mutation SetOrderDeliveryDate($orderId: ID!, $deliveryDate: String!) {
    setOrderDeliveryDate(orderId: $orderId, deliveryDate: $deliveryDate)
  }
`;
