import { verify, JwtPayload } from "jsonwebtoken";
import { GraphContextType, UserPayloadType } from "types";
import config from "config";
import { authUser, handleError } from ".";
import { AuthenticationError } from "apollo-server-micro";

const {
    environmentVariable: { jwtRefreshSecret },
    appData: { generalErrorMessage },
  } = config,
  refreshToken = async (
    _: any,
    __: any,
    {
      req: {
        cookies: { token },
      },
      res,
    }: GraphContextType
  ) => {
    try {
      // verify refresh token
      const { aud, sub, username } = verify(
          token,
          jwtRefreshSecret
        ) as JwtPayload & UserPayloadType,
        // re-auth user
        tokenPair = authUser(
          {
            id: sub!,
            audience: aud as "ADMIN" | "USER",
            username,
          },
          res
        );

      return {
        ...tokenPair,
        refreshToken: token,
      };
    } catch (error) {
      // log error for more
      handleError(error, AuthenticationError, generalErrorMessage);
    }
  };

export default refreshToken;
