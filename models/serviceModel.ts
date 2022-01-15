import config from "config";
import { model, Schema, Model, models } from "mongoose";
import type { ServiceType } from "types";

const schema = new Schema<ServiceType>(
  {
    name: { type: String, required: [true, "Service name is required"] },
    logo: String,
    description: {
      type: String,
      maxlength: 255,
      required: [true, "Information about the service is required"],
    },
    country: { type: String, required: [true, "Country is required"] },
    state: { type: String, required: [true, "State is required"] },
    maxProduct: {
      type: Number,
      default: config.appData.maxProductAllowed,
      min: 0,
    },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default (models.Service as Model<ServiceType, {}, {}>) ||
  model<ServiceType>("Service", schema);
