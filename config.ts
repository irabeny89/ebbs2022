const config = {
  appData: {
    author: "Ernest Irabor",
    title: "EBBS - EveryBodyBuySell",
    abbr: "EBBS",
    description:
      "EBBS - EveryBodyBuySell is a platform for everybody to do business with products and services.",
    features: [
      "Browse products and services",
      "Create a profile for both business and regular use i.e 2-in-1 account",
      "Manage your products in your business",
      "Manage your product orders",
      "Manage your product requests",
      "Service provider get paid when clients give consent",
      "Subscribe if you want your business on the first page",
      "Manage your wallet",
      "Withdraw your fund anytime",
    ],
    testAccount: {
      email: "movefund@gmail.com",
      password: "testmove",
    },
    pageTitles: [
      "Home",
      "Dashboard",
      "Fund Account",
      "Send Fund",
      "Payback Loan",
      "Users",
    ],
    productCategory: [
      "WEARS",
      "ELECTRICALS",
      "VEHICLES",
      "ELECTRONICS",
      "FOOD_DRUGS",
    ],
    subscriptionInfos: [
      {
        type: "BUSINESS",
        costPerDay: 1000,
      },
      {
        type: "PRODUCT",
        costPerDay: 1500,
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
  },
};

export default config;
