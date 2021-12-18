import { GraphContextType } from "types";
import { getAuthPayload, handleError } from ".";
import config from "config";
import mongoose from "mongoose"

const { generalErrorMessage } = config.appData;

const getMyProfile = async (
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
    // auth users only, returns user profile; getAuthPayload throws error if user has no auth
    const user = await UserModel.findById(
      getAuthPayload(authorization!.replace("Bearer ", ""))?.sub
    )
      .populate("ratedBusinesses requests business wallet withdraws")
      .exec();
    // disconnect db
    mongoose.disconnect()
      
    return user
  } catch (error: any) {
    handleError(error.message, Error, generalErrorMessage);
  }
};

export default getMyProfile;
