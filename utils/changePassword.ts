import { GraphContextType } from "types";
import {
  comparePassword,
  getAuthPayload,
  getHashPayload,
  handleError,
} from ".";
import config from "config";
import mongoose from "mongoose"

const { generalErrorMessage } = config.appData;

const changePassword = async (
  _: any,
  {
    passwordChangeData: { newPassword, oldPassword },
  }: { passwordChangeData: { oldPassword: string; newPassword: string } },
  {
    UserModel,
    req: {
      headers: { authorization },
    },
  }: GraphContextType
) => {
  try {
    // auth users only
    const { sub: userId } = getAuthPayload(authorization!),
      // hash new password with salt
      { password, salt } = await getHashPayload(newPassword),
      // get old password and salt
      user = await UserModel.findById(userId).select("password salt").exec();
    // confirm old password is in db or throw an error
    await comparePassword(user?.password!, oldPassword, user?.salt!);
    // then update password and salt
    await UserModel.findByIdAndUpdate(userId, {
      password,
      salt,
    }).exec();
    // disconnect db
    await mongoose.disconnect()

    return "Password changed successfully";
  } catch (error: any) {
    handleError(error.message, Error, generalErrorMessage);
  }
};

export default changePassword;
