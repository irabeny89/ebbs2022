import { AuthenticationError } from "apollo-server-micro";
import { GraphContextType } from "types";
import { getAuthPayload, handleError } from ".";
import config from "config";
import mongoose from "mongoose";

// admin users only query
const getUsers = async (
  _: any,
  __: any,
  {
    UserModel,
    req: {
      headers: { authorization },
    },
  }: GraphContextType
) => {
  try {
    // only admin allowed
    if (getAuthPayload(authorization!).aud === "ADMIN")
      return await UserModel.find()
        .populate("business")
        .populate("wallet")
        .populate("withdraws")
        .populate("requests")
        .populate("ratedBusinesses")
        .exec();
    // disconnect db
    mongoose.disconnect();

    // do nothing(not even error) for unauthorized/non-admin user
  } catch (error: any) {
    // log error for more
    handleError(
      error.message,
      AuthenticationError,
      config.appData.generalErrorMessage
    );
  }
};

export default getUsers;
