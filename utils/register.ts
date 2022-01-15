import mongoose from "mongoose";
import { ValidationError } from "apollo-server-micro";
import { BusinessType, GraphContextType, UserType } from "types";
import { authUser, getHashPayload, handleError } from ".";
import config from "config";

const { generalErrorMessage } = config.appData,
  register = async (
    _: any,
    {
      userData: { logo, description, label, ...rest },
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
        | "accountNumber"
        | "bank"
      > &
        Pick<BusinessType, "logo" | "description" | "label">;
    },
    { UserModel, res, BusinessModel }: GraphContextType
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
      // create user document
      userDoc = new UserModel({
        ...rest,
        ...(await getHashPayload(rest.password)),
      }),
      // create business document
      businessDoc = new BusinessModel({
        ...businessData,
        owner: userDoc._id,
      }),
      // authenticate and authorize user
      // and also set cookie
      tokenPair = authUser(
        {
          id: userDoc._id,
          audience: userDoc.audience,
          username: userDoc.username,
          businessId: businessDoc._id,
        },
        res
      );
    // update the business
    userDoc.business = businessDoc._id;
    // run query with transaction
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      try {
        await userDoc.save({ session });
        await businessDoc.save({ session });
      } catch (error: any) {
        // log error to see more
        handleError(error.message, Error, generalErrorMessage);
      }
    });
    // end transaction session and disconnect db
    await session.endSession();
    await mongoose.disconnect();

    return tokenPair;
  };

export default register;
