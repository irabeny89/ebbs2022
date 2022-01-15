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
    if (getAuthPayload(authorization!).aud === "ADMIN") {
      // get all users documents
      const users = await UserModel.find()
        .populate("business withdraws ratedBusinesses")
        .lean()
        .exec();
      // disconnect db
      await mongoose.disconnect();

      return users;
    }

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
