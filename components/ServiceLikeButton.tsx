import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { ServiceLikeButtonPropsType, ServiceVertexType } from "types";
import { LIKES, LIKE_A_SERVICE } from "@/graphql/documentNodes";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { BiLike } from "react-icons/bi";
import { useState } from "react";
import dynamic from "next/dynamic";

const FeedbackToast = dynamic(() => import("components/FeedbackToast"), {
  loading: () => <Spinner animation="border" />,
});

export default function ServiceLikeButton({
  serviceId,
}: ServiceLikeButtonPropsType) {
  const [showToast, setShowToast] = useState(false);

  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    // query dynamically service like data
    { data, loading, error } = useQuery<
      Record<"service", ServiceVertexType>,
      Record<"serviceId", string>
    >(LIKES, {
      variables: {
        serviceId: serviceId?.toString()!,
      },
    }),
    [like] = useMutation<
      Record<"myFavService", boolean>,
      { serviceId: string; isFav: boolean }
    >(LIKE_A_SERVICE, {
      refetchQueries: [LIKES],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    isFav = !data?.service?.happyClients?.includes(authPayload?.sub!)!,
    handleLike = () =>
      like({
        variables: {
          serviceId,
          isFav,
        },
      });

  return loading ? (
    <Spinner animation="grow" size="sm" />
  ) : (
    <>
      <FeedbackToast
        error={error}
        showToast={showToast}
        setShowToast={setShowToast}
      />
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
    </>
  );
}
