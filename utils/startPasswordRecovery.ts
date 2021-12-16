import { GraphContextType, UserType } from "types";
import { randomBytes } from "crypto";
import { handleEmails } from ".";
import config from "config";

const {
  passwordRecoveryOption: { body, from, subject },
} = config.appData;

const startPasswordRecovery = async (
  _: any,
  { email }: Pick<UserType, "email">,
  { UserModel }: GraphContextType
) => {
  try {
    // generate access code and with time
    const accessCode = randomBytes(4).toString("hex"),
      start = new Date(),
      end = new Date(Date.now() + 30 * 60 * 1000);
    // update the password recovery field
    await UserModel.findOneAndUpdate(
      { email },
      {
        passwordRecovery: { accessCode, start, end },
      },
      { upsert: true }
    )
      .select("passwordRecovery")
      .exec();
    // send email
    await handleEmails({
      subject,
      from,
      body: body + accessCode,
      to: email,
    });

    return "Access code sent to your email";
  } catch (error: any) {
    throw new Error("Something went wrong");
  }
};

export default startPasswordRecovery;