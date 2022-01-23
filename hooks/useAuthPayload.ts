import { JwtPayload, verify } from "jsonwebtoken";
import config from "../config";
import { UserPayloadType } from "types";
import { useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";

const useAuthPayload = () => {
  const accessToken = useReactiveVar(accessTokenVar);
  try {
    return verify(
      accessToken,
      config.environmentVariable.jwtAccessSecret
    ) as Partial<UserPayloadType> & JwtPayload;
  } catch (error: any) {
    // log error for more
    return null;
  }
};

export default useAuthPayload;
