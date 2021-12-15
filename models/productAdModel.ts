import { model, Schema, Model, models } from "mongoose";
import type { ProductAdType } from "types";

const schema = new Schema<ProductAdType>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    costPerDay: {
      type: Number,
      min: 0,
      required: [true, "Ads total cost is required"],
    },
    totalCost: {
      type: Number,
      required: [true, "Ads total cost is required"],
      min: 0,
    },
    start: { type: Date, required: [true, "Start date is required"]},
    end: { type: Date, required: [true, "End date is required"]}
  },
  { timestamps: true }
);

export default (models.ProductAd as Model<ProductAdType, {}, {}>) ||
  model<ProductAdType>("ProductAd", schema);
