import type { NextRequest } from "next/server";
import client from "@/graphql/apollo-client";
import { REFRESH_TOKEN_QUERY } from "@/graphql/documentNodes";
import { TokenPairType } from "types";
import { accessTokenVar } from "@/graphql/reactiveVariables";

export async function middleware(req: NextRequest) {
  try {

    // refresh token
    const {
      data: {
        refreshToken: { accessToken },
      },
      error,
    } = await client.query<{ refreshToken: TokenPairType }>({
      query: REFRESH_TOKEN_QUERY,
    });
    
    // update access token reactive variable
    error ? null : accessTokenVar(accessToken);
  } catch(error: any) {
    // log error for more
    console.log("login to reauthenticate");
  }
}
