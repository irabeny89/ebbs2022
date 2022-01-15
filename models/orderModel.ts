import { model, Schema, Model, models } from "mongoose";
import type { OrderType } from "types";
import config from "config";

const schema = new Schema<OrderType>(
  {
    status: {
      type: String,
      default: "PENDING",
      enum: config.appData.orderStatuses,
    },
    items: [
      {
        name: {
          type: String,
          required: [true, "Name is required"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
        },
        cost: {
          type: Number,
          required: [true, "Cost is required"],
        },
      },
    ],
    phone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    country: { type: String, required: [true, "Country is required"] },
    state: { type: String, required: [true, "State is required"] },
    address: { type: String, required: [true, "Address is required"] },
    nearestBusStop: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    deliveryDate: Date,
    totalCost: { type: Number, min: 0, default: 0 },
    client: { type: Schema.Types.ObjectId, ref: "User" },
    provider: { type: Schema.Types.ObjectId, ref: "Service" },
  },
  { timestamps: true }
);

export default (models.Order as Model<OrderType, {}, {}>) ||
  model<OrderType>("Order", schema);
