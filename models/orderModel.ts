import { model, Schema, Model, models } from "mongoose";
import type { OrderType } from "types";

const schema = new Schema<OrderType>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client Id is required"],
    },
    provider: {
      type: Schema.Types.ObjectId, 
      ref: "Business"
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 0, default: 0 },
        subTotal: { type: Number, min: 0, default: 0 },
      },
    ],
    itemsCount: { type: Number, min: 0, default: 0 },
    deliveryInfo: [
      {
        type: Schema.Types.ObjectId,
        ref: "DeliveryInfo",
        required: [true, "Delivery Info Id is required"],
      },
    ],
    totalCost: { type: Number, min: 0, default: 0 },
    status: {
      type: String, default: "PENDING", enum: ["PENDING", "DELIVERED", "SHIPPED"]
    }
  },
  { timestamps: true }
);

export default (models.Order as Model<OrderType, {}, {}>) ||
  model<OrderType>("Order", schema);
