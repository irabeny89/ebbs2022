import { model, models, Schema, Model } from "mongoose";
import type { ProductType } from "types";
import config from "../config";

const {
  appData: { productCategory },
} = config;

const schema = new Schema<ProductType>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: 255,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: productCategory,
    },
    tags: [{ type: String, maxlength: 50 }],
    images: [
      {
        type: String,
        required: [true, "Product image is required; atleast 1"],
      },
    ],
    video: String,
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "Business product belongs is required"],
    },
    isDeleted: { type: Boolean, default: false },
    price: { type: Number, min: 0, required: [true, "Price is required"] },
    quantity: {
      type: Number,
      min: 0,
      required: [true, "Quantity is required"],
    },
    soldCount: {
      type: Number,
      min: 0,
      required: [true, "Amount sold is required"],
    },
  },
  { timestamps: true }
);

export default (models.Product as Model<ProductType, {}, {}>) ||
  model<ProductType>("Product", schema);
