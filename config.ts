import { CookieSerializeOptions } from "cookie";

const isProductionEnv = process.env.NODE_ENV === "production";

const config = {
  appData: {
    author: "Ernest Irabor",
    title: "EBBS - EveryBodyBuySell",
    abbr: "EBBS",
    socialMedia: [{ name: "telegram", link: "https://t.me/ebbs2022" }],
    description:
      "EBBS - EveryBodyBuySell is a platform for everybody to create and manage their online businesses.",
    features: [
      "Easy to use dashboard to manage your online business.",
      "Manage your business logistics.",
      "Customer Relation Management through comments etc.",
      "Connect with other businesses.",
      "Monitor your orders.",
      "Join the Telegram channel below to share your thoughts.",
      "More features coming...",
    ],
    privacyTypes: ["ALL", "USER", "ADMIN"],
    testAccount: {
      email: "",
      password: "",
    },
    productCategories: [
      "WEARS",
      "ELECTRICALS",
      "VEHICLES",
      "ELECTRONICS",
      "FOOD_DRUGS",
    ],
    orderStatuses: ["PENDING", "SHIPPED", "DELIVERED", "CANCELED"],
    subscriptionInfos: [
      {
        type: "BUSINESS",
        costPerDay: 500,
      },
      {
        type: "PRODUCT",
        costPerDay: 500,
      },
    ],
    // time in minutes
    passCodeDuration: 15,
    maxProductAllowed: 12,
    passwordRecoveryOption: {
      subject: "EBBS - Password Recovery",
      from: "<no-reply>@gmail.com",
      body: "Hello, enter the access code to change your password on EBBS website - ",
    },
    generalErrorMessage:
      "Something went wrong. Login or check your inputs and try again",
    constants: {
      AUTH_PAYLOAD: "authPayload",
      CART_ITEMS_KEY: "ebbsCartItems",
      COOKIE_PASSCODE: "passCodeData",
      COOKIE_CLEAR_OPTIONS: {
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      } as CookieSerializeOptions,
    },
    webPages: [
      {
        route: "/",
        links: [
          { route: "/member", pageTitle: "Member" },
          { route: "/products", pageTitle: "Products" },
          { route: "/services", pageTitle: "Services" },
          { route: "/member/dashboard", pageTitle: "Dashboard" },
        ],
        privacy: "ALL",
        pageTitle: "Home",
        description: "List of products and services.",
        parargraphs: [
          "EBBS - EveryBodyBuySell is a platform for you to create and manage your online business.",
        ],
      },
      {
        route: "/member",
        links: [{ route: "/member/dashboard", pageTitle: "Dashboard" }],
        privacy: "ALL",
        pageTitle: "Member",
        description: "Authentication and authorization page.",
        parargraphs: [
          "Register, login or retrieve lost password. Note you must be registered to use full features of EBBS.",
        ],
      },
      {
        route: "/services",
        links: [],
        privacy: "ALL",
        pageTitle: "Services",
        description: "List of all services",
        parargraphs: [
          "Browse through all services and their corresponding products.",
        ],
      },
      {
        route: "/products",
        links: [],
        privacy: "ALL",
        pageTitle: "Products",
        description: "List of all products",
        parargraphs: ["Browse through all products and add to cart."],
      },
      {
        route: "/member/dashboard",
        links: [],
        privacy: "USER",
        pageTitle: "Dashboard",
        description: "Dashboard to manage profile.",
        parargraphs: [
          "Manage your profile - orders, requests, add or remove products, edit service etc.",
        ],
      },
      {
        route: "/about",
        links: [],
        privacy: "ALL",
        pageTitle: "About",
        description: "Learn about EBBS - the About Us page",
        parargraphs: [
          "EveryBodyBuySell- EBBS, is a platform that allows members to do business with each other.",
          "Once you create a profile you can monitor orders, requests, comments, add products etc.",
          "More features will always be added to support your business; also you can request for features as well through the telegram channel.",
        ],
      },
    ],
  },
  environmentVariable: {
    apiHost: isProductionEnv ? process.env.API_HOST : "http://localhost:4000",
    graphqlUri: "/api/graphql",
    web3storageKey: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY,
  },
};

export default config;
