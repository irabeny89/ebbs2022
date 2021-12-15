import { model, Schema, Model, models } from "mongoose";
import type { WithdrawType } from "types";

const schema = new Schema<WithdrawType>(
  {
    amount: { type: Number, required: true, min: 0, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    balanceBefore: { type: Number, required: true, min: 0, default: 0 },
    balanceAfter: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default (models.Withdraw as Model<WithdrawType, {}, {}>) ||
  model<WithdrawType>("Withdraw", schema);
