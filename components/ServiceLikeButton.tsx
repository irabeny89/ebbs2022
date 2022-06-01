import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  accessTokenVar,
  authPayloadVar,
  toastPayloadsVar,
} from "@/graphql/reactiveVariables";
import { ServiceLikeButtonPropsType, ServiceVertexType } from "types";
import { LIKES, LIKE_A_SERVICE } from "@/graphql/documentNodes";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { BiLike } from "react-icons/bi";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

export default function ServiceLikeButton({
  serviceId,
}: ServiceLikeButtonPropsType) {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar);
  // query dynamically service like data
  const { data, loading } = useQuery<
      Record<"service", ServiceVertexType>,
      Record<"serviceId", string>
    >(LIKES, {
      variables: {
        serviceId: serviceId?.toString()!,
      },
    }),
    [like, { reset, error }] = useMutation<
      Record<"myFavService", boolean>,
      { serviceId: string; isFav: boolean }
    >(LIKE_A_SERVICE, {
      refetchQueries: [LIKES],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const isFav = !data?.service?.happyClients?.includes(authPayload?.sub!)!;

  const handleLike = () =>
    like({
      variables: {
        serviceId,
        isFav,
      },
    });

  useEffect(() => {
    // toast feedback
    error && toastPayloadsVar([{ error, reset }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error?.message]);

  return loading ? (
    <Spinner animation="grow" size="sm" />
  ) : (
    <Button
      disabled={!authPayload}
      size="sm"
      className="py-0 w-100"
      onClick={handleLike}
      variant={false ? "primary" : "outline-primary"}
    >
      <BiLike size={18} />{" "}
      {getCompactNumberFormat(data?.service?.likeCount ?? 0)}
    </Button>
  );
}
