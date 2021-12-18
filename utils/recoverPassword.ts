import { GraphContextType } from "types";
import { getHashPayload, handleError } from ".";
import config from "config";

const { generalErrorMessage } = config.appData;

const recoverPassword = async (
  _: any,
  {
    recoveryData: { accessCode: passwordRecoveryCode, newPassword },
  }: { recoveryData: { accessCode: string; newPassword: string } },
  { UserModel }: GraphContextType
) => {
  try {
    // hash password with salt
    const { salt, password } = await getHashPayload(newPassword),
      // get user password recovery end date
      user = await UserModel.findOne({
        passwordRecoveryCode,
      })
        .select("passwordRecoveryEnd")
        .exec();
    // throw error if access code is expired
    handleError(
      user?.passwordRecoveryEnd! < new Date(),
      Error,
      "Access code expired; generate another."
    );
    // find & update user with new password & salt
    await UserModel.findByIdAndUpdate(user?._id!, { password, salt }).exec();

    return "Password has been changed successfully";
  } catch (error: any) {
    // log the error to see more
    handleError(error.message, Error, generalErrorMessage);
  }
};

export default recoverPassword;
