import { JwtPayload, decode } from "jsonwebtoken";
import { UserPayloadType } from "types";
import { useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { useLazyQuery } from "@apollo/client";
import { REFRESH_TOKEN_QUERY } from "@/graphql/documentNodes";
import { useEffect } from "react";

const useAuthPayload = () => {
  const accessToken = useReactiveVar(accessTokenVar),
    [refreshAccessToken, { data }] = useLazyQuery<
      Record<"refreshToken", string>
    >(REFRESH_TOKEN_QUERY);
  useEffect(() => {
    !accessToken && refreshAccessToken() && accessTokenVar(data?.refreshToken);
  }, [data]);

  return {
    accessToken,
    authPayload: decode(accessToken) as (UserPayloadType & JwtPayload) | null,
  };
};

export default useAuthPayload;
