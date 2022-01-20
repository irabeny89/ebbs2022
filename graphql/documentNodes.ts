import { gql } from "@apollo/client";
// fragments
export const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on ServiceProduct {
    _id
    name
    description
    category
    images
    video
    tags
    price
    saleCount
  }
`;

export const SERVICE_FRAGMENT = gql`
    fragment ServiceFields on UserService {
      _id
      title
      logo
      description
      state
      happyClients
      categories
      commentCount
    }
  `,
  PAGING_FRAGMENT = gql`
    fragment PageInfoFields on PaginationInfo {
      totalPages
      totalItems
      page
      perPage
      hasNextPage
      hasPreviousPage
    }
  `;
// query operations
export const REFRESH_TOKEN_QUERY = gql`
  query RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation RegisterUser($userData: UserInput!) {
    registerUser(userData: $userData) {
      accessToken
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
    }
  }
`;

export const FEW_SERVICES = gql`
  ${PRODUCT_FRAGMENT}
  ${SERVICE_FRAGMENT}
  query FewServices(
    $serviceArgs: PagingInput!
    $productArgs: PagingInput!
    $commentArgs: PagingInput!
  ) {
    services(args: $serviceArgs) {
      edges {
        node {
          ...ServiceFields
          products(args: $productArgs) {
            edges {
              node {
                ...ProductFields
                provider {
                  title
                }
              }
            }
          }
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
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const FEW_PRODUCTS_AND_SERVICES = gql`
  ${PRODUCT_FRAGMENT}
  ${SERVICE_FRAGMENT}
  query FewProductsAndServices(
    $productArgs: PagingInput!
    $serviceArgs: PagingInput!
    $commentArgs: PagingInput!
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
          ...ServiceFields
          products(args: $productArgs) {
            edges {
              node {
                ...ProductFields
                provider {
                  title
                }
              }
            }
          }
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
    }
  }
`;
