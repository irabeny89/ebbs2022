# EveryBodyBuySell - EBBS

> This is a [Nextjs](https://nextjs.org), [GraphQL](https://graphql.org), [TypeScript](https://typescriptlang.org), [MongoDB](https://mongodb.com) and [IPFS](https://ipfs.io) stack web app.
> Developed using a functional programing style.

EBBS is an _ecommerce_ web app. It is a platform that connects service providers and consumers.

Service providers list their products and services while the consumers make requests for their interested products.

> Currently, EBBS does not handle payments and it is up to the users to handle that part with discretion.

## Categories

Different categories of businesses will be supported but currently supports:

| S.N | Category     | Examples                                                  |
| --- | ------------ | --------------------------------------------------------- |
| 1   | WEARS        | clothes, jewelry, shoes, wigs, etc.                       |
| 2   | ELECTRICALS  | TVs sets, generator sets, pressing Irons, etc.            |
| 3   | VEHICLES     | cars, bikes, airplanes, helicopters, etc.                 |
| 4   | ELECTRONICS  | phones, power banks, laptops, keyboards, etc.             |
| 5   | FOOD & DRUGS | fruits, slim tea, sesame seeds, pain relieving balm, etc. |
| 6   | PETS         | dogs, cats, etc.                                          |
| 7   | SOFTWARES    | SAAS apps, blog sites, etc.                               |
| 8   | ARTS         | digital arts, hand drawn porttraits, etc.                 |
| 9   | EDUCATION    | tutorial videos and materials etc.                        |

## Features

Currently supports these few features:

- Browse products and services.
- Create 2-in-1 account - provider and consumer profile.
- Manage your profile and/or products and services.
- Manage your orders and requests.
- Comment on service providers.
- Send direct messages the users.
- Telegram channel and group for feedbacks.

### More Features coming soon

These are the features coming soon:

| Feature          | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| Digital Wallet   | A digital representation of funds.                                                   |
| Fund Withdraws   | Ability to withdraw funds at anytime.                                                |
| P2P Transfers    | Ability to transfer to another user on the platform.                                 |
| Lucky price      | A random varying price given to selected products and services.                      |
| Auction          | A bidding feature for products and services where items are sold to highest bidders. |
| Cryptocurrencies | Crypto and fiat payment gateway implementations.                                     |

## App Action Flows

How things work within the app:

- Adding a product

  **on success**: alert => clear inputs => manual close

  **on failure**: alert => don't clear inputs => manual close

- Update order status

  **As a Service Provider**:
  Initial Status | New Status
  --- | ---
  PENDING | SHIPPED
  PENDING | CANCELED

  **As a Consumer**:
  Initial Status | New Status
  --- | ---
  PENDING | CANCELED
  SHIPPED | DELIVERED
  SHIPPED | CANCELED

## Deployment

The web app is deployed on vercel at <https://ebbs.vercel.app>

## To Dos

- [ ] add direct message feature
- [ ] fix unsupported order status change
