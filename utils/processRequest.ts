import mongoose from "mongoose";
import config from "config";
import {
  GraphContextType,
  OrderType,
  ProductType,
  TimestampAndId,
} from "types";
import { getAuthPayload, handleError } from ".";

// gather order data
const getOrderData = (
  {
    ownerId,
    products,
    rest,
  }: {
    products: Pick<ProductType, "business" | "price" | "_id">[];
    ownerId: string;
    rest: Pick<
      OrderType,
      "contactPhone" | "nearestBusStop" | "localGovtArea" | "state" | "country"
    >;
  },
  ProductModel: mongoose.Model<ProductType>
): Omit<OrderType, keyof TimestampAndId>[] =>
  products
    // gather business/provider ids
    .reduce(
      (owners: mongoose.Types.ObjectId[], product) =>
        owners.includes(product.business)
          ? owners
          : [...owners, product.business],
      []
    )
    // gather orders by business/provider ids
    .map((provider) =>
      products.reduce(
        async (order: any, { business, _id }) => {
          const orderProducts = await ProductModel.find({
            _id: { $in: [...order.items, _id] },
          })
            .select("price")
            .lean()
            .exec();
          return business.toString() === provider.toString()
            ? {
                provider,
                status: "PENDING",
                items: [...order.items, _id],
                itemsCount: order.items.length + 1,
                owner: ownerId,
                totalCost: orderProducts.reduce(
                  (acc, item) => (acc += item.price),
                  0
                ),
                ...rest,
              }
            : order;
        },
        {
          provider,
          items: [],
        }
      )
    );

const processRequest = async (
  _: any,
  {
    requestData: { items, ...rest },
  }: {
    requestData: Pick<
      OrderType,
      | "items"
      | "contactPhone"
      | "nearestBusStop"
      | "localGovtArea"
      | "state"
      | "country"
    >;
  },
  { req, OrderModel, UserModel, ProductModel, BusinessModel }: GraphContextType
) => {
  try {
    // auth user only or throw error
    const { sub } = getAuthPayload(req.headers.authorization!),
      // get user balance
      user = await UserModel.findById(sub).select("balance").lean().exec(),
      // get items from db
      products = await ProductModel.find()
        .where("_id")
        .in(items)
        .select("price business")
        .lean()
        .exec(),
      // sum up the product prices
      totalCost = products.reduce((acc, item) => (acc += item.price), 0);
    // throw error if user balance is low
    handleError(user?.balance! < totalCost, Error, "Your balance is low");
    // group orders by providers
    const orders = getOrderData(
      {
        ownerId: sub!,
        products,
        rest,
      },
      ProductModel
    );
    // start db transaction
    const session = await mongoose.startSession(),
      orderDocuments = await session.withTransaction(async () => {
        // create order documents
        const orderDocs = await OrderModel.create(orders, { session });
        // add order ids to business collection
        orderDocs.forEach(
          async ({ _id, provider }) =>
            await BusinessModel.findByIdAndUpdate(provider, {
              $push: { orders: _id },
            })
        );
        return orderDocs;
      });
    // end db transaction and disconnect db
    await session.endSession();
    await mongoose.disconnect();

    return orderDocuments;
  } catch (error: any) {
    handleError(error.message, Error, config.appData.generalErrorMessage);
  }
};

export default processRequest;
