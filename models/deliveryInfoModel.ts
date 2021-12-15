import { model, Schema, Model, models } from "mongoose";
import type { DeliveryInfoType } from "types";

const schema = new Schema<DeliveryInfoType>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: [true, "Order Id is required"] },
    country: { type: String, required: [true, "Country is required"]},
    state: { type: String, required: [true, "State is required"]},
    localGovtArea: { type: String, required: [true, "Local Government Area is required"]},
    nearestBusStop: { type: String, required: [true, "Nearest bus stop is required"]},
    contactPhone: String
  },
  { timestamps: true }
);

export default (models.DeliveryInfo as Model<DeliveryInfoType, {}, {}>) ||
  model<DeliveryInfoType>("DeliveryInfo", schema);
