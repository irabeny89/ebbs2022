import { GraphContextType } from "types";
import { getAuthPayload, handleError } from ".";
import config from "config";
import mongoose from "mongoose";

const getMyProfile = async (
  _: any,
  __: any,
  { UserModel, req }: GraphContextType
) => {
  try {
    // auth user only or throw error
    const { sub } = getAuthPayload(req.headers.authorization!),
      // get user data
      user = await UserModel.findById(sub)
        .populate("ratedBusinesses business withdraws")
        .lean()
        .exec();
    // disconnect db
    mongoose.disconnect();

    return user;
  } catch (error: any) {
    // log error for more info
    handleError(error.message, Error, config.appData.generalErrorMessage);
  }
};

export default getMyProfile;
