import { JwtPayload, decode } from "jsonwebtoken";
import { UserPayloadType } from "types";
import { useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";

const useAuthPayload = () => {
  const accessToken = useReactiveVar(accessTokenVar);
  return decode(accessToken) as (UserPayloadType & JwtPayload) | null;
};

export default useAuthPayload;
