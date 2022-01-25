const config = {
  appData: {
    author: "Ernest Irabor",
    title: "EBBS - EveryBodyBuySell",
    abbr: "EBBS",
    description:
      "EBBS - EveryBodyBuySell is a platform for everybody to create and manage their online businesses.",
    features: [
      "Browse products and services.",
      "Be a member and do your business online.",
      "Manage your business - products and services - provider account.",
      "Manage your non-business profile - consumer account.",
      "With your wallet you consent to credit service provider when you are satisfied.",
      "Withdraw or transfer your fund to anyone on the platform anytime.",
      "Request for support and features through the Telegram channel link below.",
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
    maxProductAllowed: 20,
    passwordRecoveryOption: {
      subject: "EBBS - Password Recovery",
      from: "<no-reply>@gmail.com",
      body: "Hello, enter the access code to change your password on EBBS website - ",
    },
    generalErrorMessage: "Something went wrong, try again",
    constants: {
      CART_ITEMS_KEY: "ebbsCartItems",
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
        requests: [
          {
            info: "Query for product data.",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "products",
          },
          {
            info: "Query for service data.",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "services",
          },
        ],
      },
      {
        route: "/member",
        links: [],
        privacy: "ALL",
        pageTitle: "Member",
        description: "Authentication and authorization page.",
        parargraphs: [
          "Register, login or retrieve lost password. Note you must be registered to use full features of EBBS.",
        ],
        requests: [
          {
            info: "Register mutation",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "register",
          },
          {
            info: "Login mutation",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "login",
          },
          {
            info: "Retrieve password mutation",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "passcode, recoverPassword",
          },
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
        requests: [
          {
            info: "Query services",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "services",
          },
        ],
      },
      {
        route: "/products",
        links: [],
        privacy: "ALL",
        pageTitle: "Products",
        description: "List of all products",
        parargraphs: ["Browse through all products and add to cart."],
        requests: [
          {
            info: "Query products",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "products",
          },
        ],
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
        requests: [
          {
            info: "Query user data.",
            url:
              process.env.NODE_ENV == "production"
                ? "https://ebbs.vercel.app/api/graphql"
                : "http://localhost:3000/api/graphql",
            httpMethod: "POST",
            call: "user",
          },
        ],
      },
    ],
  },
  environmentVariable: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
    tokenIssuer: "https://ebbs.vercel.app",
    nodeEnvironment: process.env.NODE_ENV,
    dbUrl:
      process.env.NODE_ENV == "production"
        ? process.env.DB_URL_ATLAS!
        : process.env.DB_URL_COMPASS!,
    host:
      process.env.NODE_ENV == "production"
        ? "https://ebbs.vercel.app"
        : "http://localhost:3000",
    graphqlUri: "/api/graphql",
    ebbsEmail: process.env.EBBS_EMAIL!,
    ebbsUsername: process.env.EBBS_USERNAME!,
    ebbsPassword: process.env.EBBS_PASSWORD!,
    ebbsEmailHost: process.env.EBBS_EMAIL_HOST!,
    ebbsEmailPort: process.env.EBBS_EMAIL_PORT!,
  },
};

export default config;
