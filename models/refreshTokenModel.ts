import { models, Schema, model, Model } from "mongoose";
import type { RefreshTokenType } from "types";

const schema = new Schema<RefreshTokenType>(
  {
    email: String,
    token: { type: String, unique: true },
  },
  { timestamps: true }
);

export default (models.RefreshToken as Model<RefreshTokenType, {}, {}>) ||
  model<RefreshTokenType>("RefreshToken", schema);
