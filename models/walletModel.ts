import { model, Schema, Model, models } from "mongoose";
import type { WalletType } from "types";

const schema = new Schema<WalletType>(
  {
    account: String,
    bank: String,
    balance: { type: Number, min: 0, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default (models.Wallet as Model<WalletType, {}, {}>) ||
  model<WalletType>("Wallet", schema);
