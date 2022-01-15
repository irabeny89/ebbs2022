import getUsers from "@/utils/getUsers";
import register from "@/utils/register";
import login from "@/utils/login";
import refreshToken from "@/utils/refreshToken";
import logout from "@/utils/logout";
import updateUser from "@/utils/updateUser";
import getMyProfile from "@/utils/getMyProfile";
import startPasswordRecovery from "@/utils/startPasswordRecovery";
import changePassword from "@/utils/changePassword";
import recoverPassword from "@/utils/recoverPassword";
import addProduct from "@/utils/addProduct";
import postFeedback from "@/utils/postFeedback";
import processRequest from "@/utils/processRequest";

const hello = () => "world!";
const resolvers = {
  Query: {
    hello,
    // getUsers,
    // getMyProfile,
    // refreshToken,
  },
  // Mutation: {
  //   register,
  //   login,
  //   logout,
  //   updateUser,
  //   startPasswordRecovery,
  //   changePassword,
  //   recoverPassword,
  //   addProduct,
  //   postFeedback,
  //   processRequest
  // },
};

export default resolvers;
