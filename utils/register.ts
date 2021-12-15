import mongoose from "mongoose";
import { ValidationError } from "apollo-server-micro";
import {
  BusinessType,
  GraphContextType,
  TokenPairType,
  UserType,
  WalletType,
} from "types";
import { authUser, handleEncryption, handleError } from ".";

const register = async (
  _: any,
  {
    userData: { logo, description, label, account, bank, ...rest },
  }: {
    userData: Pick<
      UserType,
      | "firstname"
      | "lastname"
      | "email"
      | "phone"
      | "password"
      | "country"
      | "username"
      | "state"
    > &
      Pick<BusinessType, "logo" | "description" | "label"> &
      Pick<WalletType, "account" | "bank">;
  },
  {
    UserModel,
    RefreshTokenModel,
    res,
    WalletModel,
    BusinessModel,
  }: GraphContextType
) => {
  // throw error if already existing
  handleError(
    await UserModel.findOne({ email: rest.email }).exec(),
    ValidationError,
    "Invalid entry, try again."
  );
  // throw error if password length is not valid
  handleError(
    rest.password.length < 8,
    ValidationError,
    "Password should be more than 7 characters."
  );

  const businessData = { logo, description, label },
    walletData = { account, bank },
    // create user document
    userDoc = new UserModel({
      ...rest,
      ...(await handleEncryption(rest.password)),
    }),
    // create business document
    businessDoc = new BusinessModel({
      ...businessData,
      owner: userDoc._id,
    }),
    // create wallet document
    walletDoc = new WalletModel({
      ...walletData,
      owner: userDoc._id,
    }),
    // authenticate and authorize user
    // and also set cookie
    tokenPair = authUser(
      {
        id: userDoc._id,
        audience: userDoc.audience,
        username: userDoc.username,
      },
      res
    ),
    // create refresh token document
    refreshTokenDoc = new RefreshTokenModel({
      token: tokenPair.refreshToken,
      email: userDoc.email,
    });
  // update the business and wallet
  userDoc.business = businessDoc._id;
  userDoc.wallet = walletDoc._id;
  // run query with transaction
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    await userDoc.save({ session });
    await businessDoc.save({ session });
    await walletDoc.save({ session });
    await refreshTokenDoc.save({ session });
  });
  session.endSession();

  return tokenPair;
};

export default register;
