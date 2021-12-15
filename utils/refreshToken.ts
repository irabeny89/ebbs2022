import { verify, JwtPayload } from "jsonwebtoken";
import { GraphContextType, UserPayloadType } from "types";
import config from "config";
import { AUTHORIZATION_ERROR_MESSAGE, authUser, handleError } from ".";
import { AuthenticationError } from "apollo-server-micro";

const refreshToken = async (
  _: any,
  __: any,
  { req: { cookies }, res, RefreshTokenModel }: GraphContextType
) => {
  try {
    // verify refresh token
    const { aud, sub, username } = verify(
        cookies?.token,
        config.environmentVariable.jwtRefreshSecret
      ) as JwtPayload & Pick<UserPayloadType, "username">,
      // re-auth user
      tokenPair = authUser(
        {
          id: sub!,
          audience: aud as "ADMIN" | "USER",
          username,
        },
        res
      );
    // update refresh token document
    await RefreshTokenModel.findOneAndUpdate(
      {
        token: cookies?.token,
      },
      {
        token: tokenPair?.refreshToken,
      }
    ).exec();

    return tokenPair;
  } catch (error) {
    handleError(error, AuthenticationError, AUTHORIZATION_ERROR_MESSAGE);
  }
};

export default refreshToken;
