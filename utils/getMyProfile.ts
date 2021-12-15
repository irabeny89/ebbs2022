import { GraphContextType } from "types";
import { handleAuth } from ".";

const getMyProfile = async (
  _: any,
  __: any,
  {
    UserModel,
    req: {
      headers: { authorization },
    },
  }: GraphContextType
) =>
  await UserModel.findById(
    handleAuth(authorization!.replace("Bearer ", ""))?.sub
  ).exec();

export default getMyProfile;
