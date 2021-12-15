import { model, models, Schema, Model } from "mongoose";
import type { BusinessType } from "types";

const schema = new Schema<BusinessType>(
  {
    label: String,
    logo: String,
    description: { type: String, maxlength: 255},
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    likeCount: { type: Number, min: 0, default: 0},
    businessAdSubs: [{ type: Schema.Types.ObjectId, ref: "BusinessAd" }],
    productAdSubs: [{ type: Schema.Types.ObjectId, ref: "ProductAd" }],
    feeds: [{ type: Schema.Types.ObjectId, ref: "Feed" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default (models.Business as Model<BusinessType, {}, {}>) ||
  model<BusinessType>("Business", schema);
