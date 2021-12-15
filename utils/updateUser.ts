import { BusinessType, GraphContextType, UserType } from "types";
import { handleAuth } from ".";

const updateUser = async (
  _: any,
  {userUpdate: {
    country,
    description,
    label,
    logo,
    phone,
    state,
  }}: {userUpdate: Pick<UserType, "country" | "state" | "phone"> &
    Pick<BusinessType, "label" | "description" | "logo">},
  {
    req: {
      headers: { authorization },
    },
    UserModel,
    BusinessModel,
  }: GraphContextType
) => {
  // validate user auth
  const payload = handleAuth(authorization!.replace("Bearer ", "")),
    userUpdate = { country, state, phone },
    businessUpdate = { label, description, logo },
  // update the user data
  userBusiness = await UserModel.findByIdAndUpdate(payload?.sub, userUpdate).select("business").exec();
console.log('====================================');
console.log(userBusiness, logo);
console.log('====================================');
  // update business data
  await BusinessModel.findByIdAndUpdate(userBusiness?.business, businessUpdate).exec();

  return "Successfully updated";
};

export default updateUser;
