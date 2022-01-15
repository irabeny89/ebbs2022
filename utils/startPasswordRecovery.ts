import { GraphContextType, UserType } from "types";
import { randomBytes } from "crypto";
import { sendEmails, handleError } from ".";
import config from "config";
import mongoose from "mongoose";

const {
  passwordRecoveryOption: { body, from, subject },
  generalErrorMessage,
} = config.appData;

const startPasswordRecovery = async (
  _: any,
  { email }: Pick<UserType, "email">,
  { UserModel }: GraphContextType
) => {
  try {
    // generate access code and time
    const passwordRecoveryCode = randomBytes(4).toString("hex"),
      // recovery start time
      passwordRecoveryStart = new Date(),
      // recovery expires after some time
      passwordRecoveryEnd = new Date(
        passwordRecoveryStart.getTime() + 30 * 60 * 1000
      );
    // update the password recovery fields or throw error if email is invalid
    handleError(
      !(await UserModel.findOneAndUpdate(
        { email },
        {
          passwordRecoveryCode,
          passwordRecoveryStart,
          passwordRecoveryEnd,
        }
      )
        .select("passwordRecoveryEnd")
        .lean()
        .exec()),
      Error,
      generalErrorMessage
    );
    // disconnect db
    await mongoose.disconnect();
    // send access code to email
    await sendEmails({
      subject,
      from,
      body: body + passwordRecoveryCode,
      to: email,
    });

    return "Access code sent to your email";
  } catch (error: any) {
    // log error to see more
    handleError(error.message, Error, generalErrorMessage);
  }
};

export default startPasswordRecovery;
