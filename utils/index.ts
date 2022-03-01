import { timingSafeEqual, createHash } from "crypto";
import { ForbiddenError } from "apollo-server-micro";
import {
  CursorConnectionArgsType,
  CursorConnectionType,
  PassCodeDataType,
} from "types";

export const isDevEnv = process.env.NODE_ENV === "development";

export const handleError = (
  condition: any,
  ErrorClass: any,
  message: string
) => {
  if (condition) throw new ErrorClass(message);
};

export const searchList = <
  T extends Array<
    Record<"createdAt", Date | string> & {
      title?: string;
      name?: string;
      tags?: string[];
      category?: string;
    }
  >
>(
  list: T,
  searchText: string
) =>
  list.filter(
    (item) =>
      item?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item?.category?.toLowerCase().includes(searchText.toLowerCase()) ||
      item?.tags
        ?.map((item) => item.toLowerCase())
        .includes(searchText.toLowerCase()) ||
      item?.title?.toLowerCase().includes(searchText.toLowerCase())
  );

export const getCursorConnection = <
  T extends Record<"createdAt", Date | string> & {
    title?: string;
    name?: string;
    tags?: string[];
  }
>({
  list,
  first,
  after,
  last,
  before,
  search,
}: CursorConnectionArgsType<T>): CursorConnectionType<T> => {
  let edges: {
      cursor: Date | string;
      node: T;
    }[] = [],
    startCursor: Date | string = new Date(),
    endCursor: Date | string = new Date(),
    hasNextPage: boolean = false,
    hasPreviousPage: boolean = false;
  // if search is requested...
  const _list = search
    ? // ..then check items with name, tags or title fields & return the list
      (searchList(list, search) as typeof list)
    : list;

  if (first) {
    const afterIndex = _list.findIndex((item) => item.createdAt === after);
    // create edges with cursor
    edges = _list.slice(afterIndex + 1, first + afterIndex + 1).map((item) => ({
      cursor: item.createdAt,
      node: item,
    }));
    // paging info
    startCursor = edges[0]?.node?.createdAt ?? "";
    endCursor = edges.reverse()[0]?.node?.createdAt ?? "";
    hasNextPage = _list.some((item) => item.createdAt > endCursor);
    hasPreviousPage = list.some((item) => item.createdAt < startCursor);
  }
  if (last) {
    const beforeIndex = _list.findIndex((item) => item.createdAt === before);
    // create edges with cursor
    edges = _list
      .slice(
        (beforeIndex === -1 ? 0 : beforeIndex) - last,
        beforeIndex === -1 ? undefined : beforeIndex
      )
      .map((item) => ({
        cursor: item.createdAt,
        node: item,
      }));
    // paging info
    startCursor = edges[0]?.node?.createdAt ?? "";
    endCursor = edges.reverse()[0]?.node?.createdAt ?? "";
    hasNextPage = _list.some((item) => item.createdAt > endCursor);
    hasPreviousPage = _list.some((item) => item.createdAt < startCursor);
  }
  return {
    edges: edges.reverse(),
    pageInfo: { startCursor, endCursor, hasPreviousPage, hasNextPage },
  };
};

export const devErrorLogger = (error: any) =>
  isDevEnv &&
  (console.log("===================================="),
  console.log(error),
  console.log("===================================="));

export const getHash = (data: string) =>
  createHash("sha256").update(data).digest("hex");

export const verifyPassCodeData = (
  { email, hashedPassCode }: PassCodeDataType,
  passCode: string
) => {
  // throws error when passCodeData or hashedPassCode is undefined.
  // throw error if passcode is invalid
  handleError(
    !timingSafeEqual(Buffer.from(passCode), Buffer.from(hashedPassCode)),
    ForbiddenError,
    "Failed! Get a new passcode and try again."
  );

  return email;
};
