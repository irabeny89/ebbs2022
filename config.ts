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
      "Simple dashboard to manage online trades.",
      "Track orders and your requests.",
      "Add or remove products from catalog.",
      "Relate with customers via comments tab.",
      "More features coming...",
    ],
    gettingStartedSteps: [
      "Go to the 'Member' page.",
      "Click the 'Register' tab.",
      "Fill the form accordingly.",
      "Then submit. And congrats, member :)."
    ],
    privacyTypes: ["ALL", "USER", "ADMIN"],
    testAccount: {
      email: "",
      password: "",
    },
    countryStates: {
      nigeria: [
        "Abia",
        "Adamawa",
        "Akwa Ibom",
        "Anambra",
        "Bauchi",
        "Bayelsa",
        "Benue",
        "Borno",
        "Cross River",
        "Delta",
        "Ebonyi",
        "Edo",
        "Ekiti",
        "Enugu",
        "Gombe",
        "Imo",
        "Jigawa",
        "Kaduna",
        "Kano",
        "Katsina",
        "Kebbi",
        "Kogi",
        "Kwara",
        "Lagos",
        "Nasarawa",
        "Niger",
        "Ogun",
        "Ondo",
        "Osun",
        "Oyo",
        "Plateu",
        "Rivers",
        "Sokoto",
        "Taraba",
        "Yobe",
        "Zamfara",
      ]
    },
    productCategories: [
      "WEARS",
      "ELECTRICALS",
      "VEHICLES",
      "ELECTRONICS",
      "FOOD_DRUGS",
      "SOFTWARES",
      "PETS",
      "ARTS"
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
          "EBBS - EveryBodyBuySell is a platform to trade with other members.",
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
          "Browse through all services and their respective products.",
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
          "EveryBodyBuySell- EBBS is a platform that allows members to trade with each other.",
          "Once you create a profile you can monitor orders, requests, comments, products etc.",
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
