import { model, Schema, Model, models } from "mongoose";
import type { RequestType } from "types";

const schema = new Schema<RequestType>(
  {
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 0, default: 0 },
        subTotal: { type: Number, min: 0, default: 0 },
      },
    ],
    itemsCount: { type: Number, min: 0, default: 0 },
    totalCost: { type: Number, min: 0, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    deliveryInfo: [
      {
        type: Schema.Types.ObjectId,
        ref: "DeliveryInfo",
        required: [true, "Delivery info Id is required"],
      },
    ],
    status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "SHIPPED", "DELIVERED"],
    },
  },
  { timestamps: true }
);

export default (models.Request as Model<RequestType, {}, {}>) ||
  model<RequestType>("Request", schema);
