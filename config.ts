import { CookieSerializeOptions } from "cookie";

const isProductionEnv = process.env.NODE_ENV === "production";

const config = {
  appData: {
    author: "Ernest Irabor",
    title: "EBBS - EveryBodyBuySell",
    abbr: "EBBS",
    socialMedia: [{ name: "Telegram", link: "https://t.me/ebbs2022" }, { name: "Email", link: "Everybodybuysell@gmail.com" }],
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
    maxImageFiles: 3,
    // size in bytes
    mediaMaxSize: {
      image: 5e6,
      video: 1e7,
      logo: 1e6,
    },
    // time in minutes
    passCodeDuration: 15,
    maxProductAllowed: 12,
    generalErrorMessage:
      "Something went wrong. Login or check your inputs and try again",
    constants: {
      AUTH_PAYLOAD: "authPayload",
      CART_ITEMS_KEY: "ebbsCartItems",
      COOKIE_PASSCODE: "passCodeData",
      COOKIE_CLEAR_OPTIONS: {
        maxAge: 0,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      } as CookieSerializeOptions,
    },
    webPages: [
      {
        route: "/",
        privacy: "ALL",
        pageTitle: "Home",
        description: "List of products and services.",
        parargraphs: [
          "EBBS - EveryBodyBuySell is a platform for you to create and manage your online business.",
        ],
      },
      {
        route: "/member",
        privacy: "ALL",
        pageTitle: "Member",
        description: "Authentication and authorization page.",
        parargraphs: [
          "Register, login or retrieve lost password. Note you must be registered to use full features of EBBS.",
        ],
      },
      {
        route: "/services",
        privacy: "ALL",
        pageTitle: "Services",
        description: "List of all services",
        parargraphs: [
          "Browse through all services and their corresponding products.",
        ],
      },
      {
        route: "/products",
        privacy: "ALL",
        pageTitle: "Products",
        description: "List of all products",
        parargraphs: ["Browse through all products and add to cart."],
      },
      {
        route: "/dashboard",
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
    apiHost:
      isProductionEnv && !process.env.OFFLINE!
        ? "https://ebbs-io.vercel.app"
        : "http://localhost:4000",
    graphqlUri: "/api/graphql",
    web3storageKey: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY,
  },
};

export default config;
