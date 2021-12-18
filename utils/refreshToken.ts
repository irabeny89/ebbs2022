import { verify, JwtPayload } from "jsonwebtoken";
import { GraphContextType, UserPayloadType } from "types";
import config from "config";
import { authUser, handleError } from ".";
import { AuthenticationError } from "apollo-server-micro";
import mongoose from "mongoose";

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
      RefreshTokenModel,
    }: GraphContextType
  ) => {
    try {
      // verify refresh token
      const { aud, sub, username, businessId } = verify(
          token,
          jwtRefreshSecret
        ) as JwtPayload & UserPayloadType,
        // re-auth user
        tokenPair = authUser(
          {
            id: sub!,
            audience: aud as "ADMIN" | "USER",
            username,
            businessId
          },
          res
        );
      // update refresh token document using token
      await RefreshTokenModel.findOneAndUpdate(
        {
          token,
        },
        {
          token: tokenPair?.refreshToken,
        }
      ).exec();
      // disconnect db
      await mongoose.disconnect();

      return tokenPair;
    } catch (error) {
      handleError(error, AuthenticationError, generalErrorMessage);
    }
  };

export default refreshToken;
