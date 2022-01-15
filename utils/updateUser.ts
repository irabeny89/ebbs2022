import { AuthenticationError } from "apollo-server-core";
import { BusinessType, GraphContextType, UserType } from "types";
import { getAuthPayload, handleError } from ".";
import config from "config";
import mongoose from "mongoose";

const { generalErrorMessage } = config.appData;

const updateUser = async (
  _: any,
  {
    userUpdate: { country, description, label, logo, phone, state },
  }: {
    userUpdate: Pick<UserType, "country" | "state" | "phone"> &
      Pick<BusinessType, "label" | "description" | "logo">;
  },
  {
    req: {
      headers: { authorization },
    },
    UserModel,
    BusinessModel,
  }: GraphContextType
) => {
  try {
    // updates data
    const userUpdate = { country, state, phone },
      businessUpdate = { label, description, logo };
    // start db transaction
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // update the user data or throw error
      const userBusiness = await UserModel.findByIdAndUpdate(
        getAuthPayload(authorization!).sub,
        userUpdate,
        { session }
      )
        .select("business")
        .lean()
        .exec();
      // update business data
      await BusinessModel.findByIdAndUpdate(
        userBusiness?.business!,
        businessUpdate,
        { session }
      )
        .lean()
        .exec();
    });
    // end transaction session and disconnect db
    await session.endSession();
    await mongoose.disconnect();

    return "Successfully updated";
  } catch (error: any) {
    // log error to see more
    handleError(error.message, AuthenticationError, generalErrorMessage);
  }
};

export default updateUser;
