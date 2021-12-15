import { GraphContextType } from "types";
import { setCookie } from ".";

const logout = async (
  _: any,
  __: any,
  {
    req: {
      cookies: { token },
    },
    RefreshTokenModel,
    res,
  }: GraphContextType
): Promise<string> => {
  // delete the refresh token from the database
  await RefreshTokenModel.findOneAndDelete({
    token,
  }).exec();
  // invalidate cookie
  setCookie(res, "token", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
    path: "/api/graphql",
  });

  return "Logged out successfully.";
};

export default logout;
