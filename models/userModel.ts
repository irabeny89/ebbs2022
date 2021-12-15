import { models, Schema, model, Model } from "mongoose";
import type { UserType } from "types";

const schema = new Schema<UserType>(
  {
    audience: { type: String, default: "USER", enum: ["ADMIN", "USER"] },
    firstname: { type: String, required: [true, "First name is required"] },
    lastname: { type: String, required: [true, "Last name is required"] },
    state: { type: String, required: [true, "State is required"] },
    country: { type: String, required: [true, "Country is required"] },
    ratedBusinesses: [{ type: Schema.Types.ObjectId, ref: "Business" }],
    requests: [{ type: Schema.Types.ObjectId, ref: "Request" }],
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /.+\@.+\..+/,
      required: [true, "Email is required"],
      lowercase: true,
    },
    password: { type: String, required: [true, "Password is required"] },
    salt: { type: String, required: [true, "Salt is required"] },
    passwordRecovery: {
      start: Date,
      end: Date,
      accessCode: String,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxLength: 15,
      minLength: 5,
      match: /^\d+$/,
    },
    business: { type: Schema.Types.ObjectId, ref: "Business" },
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    withdraws: [{ type: Schema.Types.ObjectId, ref: "Withdraw" }],
  },
  { timestamps: true }
);

export default (models.User as Model<UserType, {}, {}>) ||
  model<UserType>("User", schema);
