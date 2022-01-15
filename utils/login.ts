import { GraphContextType, UserType } from "types";
import {
  AUTHORIZATION_ERROR_MESSAGE,
  authUser,
  comparePassword,
  handleError,
} from ".";
import { AuthenticationError } from "apollo-server-micro";
import mongoose from "mongoose";

const login = async (
  _: any,
  {
    loginData: { email, password },
  }: { loginData: Pick<UserType, "email" | "password"> },
  { UserModel, res }: GraphContextType
) => {
  // select the fields required for signing a token
  const userPayloadField = await UserModel.findOne({ email })
    .select("_id username audience password salt business")
    .lean()
    .exec();
  // handle error if user does not exist
  handleError(
    !userPayloadField,
    AuthenticationError,
    AUTHORIZATION_ERROR_MESSAGE + "- Invalid username or password!"
  );
  const {
    _id,
    username,
    audience,
    password: hashedPassword,
    salt,
    business: businessId,
  } = userPayloadField!;
  // verify user and compare password
  await comparePassword(hashedPassword, password, salt);
  // authorize and authenticate user
  // by generating access & refresh token
  // also setting cookie with refresh token
  const tokenPair = authUser(
    {
      id: _id?.toString()!,
      username,
      audience,
      businessId: businessId.toString(),
    },
    res
  );
  // disconnect db
  await mongoose.disconnect();

  return tokenPair;
};

export default login;
