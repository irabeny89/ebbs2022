import {
  LOGOUT,
  REFRESH_TOKEN_QUERY,
  UPDATE_ORDER_ITEM_STATUS,
} from "@/graphql/documentNodes";
import resolvers from "@/graphql/resolvers";
import typeDefs from "@/graphql/typeDefs";
import { ApolloServer } from "apollo-server-micro";
import { verify } from "jsonwebtoken";
import { authUser, setCookie, getAuthPayload } from "@/utils/index";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({
    aud: "aud",
    sub: "sub",
    username: "username",
    serviceId: "serviceId",
  })),
}));

jest.mock("@/utils/index", () => ({
  authUser: jest.fn(() => ({ accessToken: "accessToken" })),
  setCookie: jest.fn(),
  getAuthPayload: jest.fn(),
}));

describe("Apollo Server", () => {
  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      req: {
        cookies: { token: "refreshtoken" },
        headers: { authorization: "access token" },
      },
      OrderModel: {
        findOneAndUpdate: jest.fn(() => ({
          select: jest.fn(() => ({
            lean: jest.fn(() => ({
              exec: jest.fn(),
            })),
          })),
        })),
        findOne: jest.fn(() => ({
          select: jest.fn(() => ({
            lean: jest.fn(() => ({
              exec: jest.fn(),
            })),
          })),
        })),
      },
    }),
  });
  // hello query
  it("returns the string 'world' from hello query", async () => {
    const { data, errors } = await testServer.executeOperation({
      query: "{hello}",
    });

    expect(errors).toBeUndefined();
    expect(data?.hello).toBe("world!");
  });
  // refreshToken query
  it("returns access token from refreshToken query", async () => {
    const { data, errors } = await testServer.executeOperation({
      query: REFRESH_TOKEN_QUERY,
    });

    expect(errors).toBeUndefined();
    expect(data?.refreshToken).toBe("accessToken");
  });
  // logout query
  it("logs out successfully without error", async () => {
    const { errors } = await testServer.executeOperation({
      query: LOGOUT,
    });

    expect(errors).toBeUndefined();
  });
  // user status update mutation
  it("updates user order status, non-nullable & return status", async () => {
    const { errors, data } = await testServer.executeOperation({
      query: UPDATE_ORDER_ITEM_STATUS,
      variables: {
        orderItemStatusArgs: {
          status: "SHIPPED",
          itemId: "1",
        },
      },
    });
    expect(errors).toBeUndefined();
    expect(data?.updateOrderItemStatus.includes("SHIPPED")).toBeTruthy();
    expect(data?.updateOrderItemStatus).not.toBeNull();
  });
});
