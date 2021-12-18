import { randomBytes, scrypt, BinaryLike, timingSafeEqual } from "crypto";
import { AuthenticationError } from "apollo-server-micro";
import { promisify } from "util";
import { serialize, CookieSerializeOptions } from "cookie";
import { NextApiResponse } from "next";
import { EmailOptionsType, TokenPairType, UserPayloadType } from "types";
import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import config from "../config";
import { createTestAccount, createTransport } from "nodemailer";

const {
  environmentVariable: {
    jwtAccessSecret,
    jwtRefreshSecret,
    tokenIssuer,
    nodeEnvironment,
    ebbsEmailHost,
    ebbsEmailPort,
    ebbsPassword,
    ebbsUsername,
  },
} = config;

export const CREDITS_LOANS_WITHDRAWALS_POPULATION = {
  path: "credits loans withdrawals",
};

export const DEBITS_POPULATION = {
  path: "debits",
  populate: {
    path: "to",
  },
};

export const AUTHORIZATION_ERROR_MESSAGE = "Authorization failed";

export const LOGIN_ERROR_MESSAGE = "Enter correct email and password";

export const setCookie = (
  res: NextApiResponse,
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);
  if ("maxAge" in options) {
    options.expires = new Date(Date.now() + options.maxAge!);
    options.maxAge! /= 1000;
  }
  res.setHeader("Set-Cookie", serialize(name, String(stringValue), options));
};

export const getHashPayload = async (password: string) => {
  const salt = randomBytes(32).toString("hex");

  return {
    salt,
    password: await hashPassword(password, salt),
  };
};

const asyncScrypt = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

export const handleError = (
  condition: any,
  ErrorClass: any,
  message: string
) => {
  if (condition) throw new ErrorClass(message);
};

export const getAuthPayload = (authorization: string) =>
  verify(authorization!.replace("Bearer ", ""), jwtAccessSecret) as JwtPayload &
    UserPayloadType;

const hashPassword = async (password: string, salt: string) =>
  (await asyncScrypt(password, salt, 64)).toString("hex");

export const comparePassword = async (
  hashedpassword: string,
  password: string,
  salt: string
) => {
  const isValid = timingSafeEqual(
    Buffer.from(hashedpassword),
    Buffer.from(await hashPassword(password, salt))
  );
  handleError(
    !isValid,
    AuthenticationError,
    AUTHORIZATION_ERROR_MESSAGE + " - Invalid email or password"
  );

  return isValid;
};

export const isAdminUser = (accessToken: string) => {
  try {
    const payload = verify(accessToken, jwtAccessSecret) as JwtPayload &
      UserPayloadType;

    return payload.aud === "ADMIN";
  } catch (error) {
    handleError(error, AuthenticationError, AUTHORIZATION_ERROR_MESSAGE);
  }
};

// utility function to generate a signed token
const generateToken = (
  payload: string | object | Buffer,
  secretOrPrivateKey: Secret,
  options?: SignOptions | undefined
) => {
  try {
    return sign(payload, secretOrPrivateKey, options);
  } catch (error) {
    throw new AuthenticationError(AUTHORIZATION_ERROR_MESSAGE);
  }
};

// generate access & refresh token
const createTokenPair = ({
  id,
  audience,
  username,
}: UserPayloadType): TokenPairType => ({
  accessToken: generateToken({ username }, jwtAccessSecret, {
    subject: `${id}`,
    expiresIn: "10m",
    audience,
    issuer: tokenIssuer || "http://localhost:3000/api/graphql",
    algorithm: "HS256",
  })!,
  refreshToken: generateToken({ username }, jwtRefreshSecret, {
    subject: `${id}`,
    expiresIn: "30d",
    audience,
    issuer: tokenIssuer || "http://localhost:3000/api/graphql",
    algorithm: "HS256",
  })!,
});

// generate access & refresh token while safely
// storing refresh token in cookie for later use
export const authUser = (
  { id, audience, username }: UserPayloadType,
  res: NextApiResponse
) => {
  const tokenPair = createTokenPair({
    id,
    audience,
    username,
  });
  // 30 days refresh token in the cookie
  setCookie(res, "token", tokenPair.refreshToken, {
    maxAge: 2592000000,
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnvironment == "production" ? true : false,
    path: "/api/graphql",
  });

  return tokenPair;
};

export const handleEmails = async (emailOptions: EmailOptionsType) => {
  const { smtp, user, pass } = await createTestAccount(),
    // email transporter config
    transportOptions = {
      host: process.env.NODE_ENV === "production" ? ebbsEmailHost : smtp.host,
      port: process.env.NODE_ENV === "production" ? +ebbsEmailPort : smtp.port,
      secure: process.env.NODE_ENV === "production" ? true : smtp.secure,
      auth: {
        user: process.env.NODE_ENV === "production" ? ebbsUsername : user,
        pass: process.env.NODE_ENV === "production" ? ebbsPassword : pass,
      },
    };
  // returs the result after sending mail
  return await createTransport(transportOptions).sendMail(emailOptions);
};
