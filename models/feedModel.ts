import { model, Schema, Model, models } from "mongoose";
import type { FeedType } from "types";

const schema = new Schema<FeedType>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business" },
    post: { type: String, maxlength: 255 },
    poster: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default (models.Feed as Model<FeedType, {}, {}>) ||
  model<FeedType>("Feed", schema);
