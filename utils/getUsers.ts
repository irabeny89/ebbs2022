import { GraphContextType } from "types";
import { isAdminUser } from ".";

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
  // only admin allowed
  if (isAdminUser(authorization!.replace("Bearer ", "")))
    return await UserModel.find()
      .populate("business")
      .populate("wallet")
      .populate("withdraws")
      .populate("requests")
      .populate("ratedBusinesses")
      .exec();

  // do nothing(not even error) for unauthorized/non-admin user
};

export default getUsers;
