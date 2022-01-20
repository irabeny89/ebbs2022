import { models, Schema, model, Model } from "mongoose";
import type { UserType } from "types";

const schema = new Schema<UserType>(
  {
    role: { type: String, default: "USER", enum: ["ADMIN", "USER"] },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      maxlength: 30
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /.+\@.+\..+/,
      required: [true, "Email is required"],
      lowercase: true,
    },
    password: { type: String, required: [true, "Password is required"], minlength: 8 },
    salt: { type: String, required: [true, "Salt is required"] },
    passCode: String,
    codeStart: Date,
    codeEnd: Date,
  },
  { timestamps: true }
);

export default (models.User as Model<UserType, {}, {}>) ||
  model<UserType>("User", schema);
