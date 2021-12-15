import { model, Schema, Model, models } from "mongoose";
import type { BusinessAdType } from "types";

const schema = new Schema<BusinessAdType>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business" },
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
    start: Date,
    end: Date,
  },
  { timestamps: true }
);

export default (models.BusinessAd as Model<BusinessAdType, {}, {}>) ||
  model<BusinessAdType>("BusinessAd", schema);
