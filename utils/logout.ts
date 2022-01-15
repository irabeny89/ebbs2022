import { GraphContextType } from "types";
import { setCookie } from ".";

const logout = async (
  _: any,
  __: any,
  {
    res,
  }: GraphContextType
): Promise<string> => {
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
