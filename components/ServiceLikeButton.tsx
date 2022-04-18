import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { authPayloadVar } from "@/graphql/reactiveVariables";
import { ServiceLikeButtonPropsType, ServiceVertexType } from "types";
import { LIKES } from "@/graphql/documentNodes";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { BiLike } from "react-icons/bi";
import AjaxFeedback from "./AjaxFeedback";

export default function ServiceLikeButton({
  serviceId,
}: ServiceLikeButtonPropsType) {
  const authPayload = useReactiveVar(authPayloadVar),
    // query dynamically service like data
    { data, loading, error } = useQuery<
      Record<"service", ServiceVertexType>,
      Record<"serviceId", string>
    >(LIKES, {
      variables: {
        serviceId: serviceId?.toString()!,
      },
    });

  return loading ? (
    <AjaxFeedback loading />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : (
    <Button
      disabled={!authPayload}
      size="sm"
      className="py-0 w-100"
      variant={
        data?.service?.happyClients?.includes(authPayload?.sub!)
          ? "primary"
          : "outline-primary"
      }
    >
      {false && <Spinner animation="grow" size="sm" />}
      <BiLike size={18} />{" "}
      {getCompactNumberFormat(data?.service?.likeCount ?? 0)}
    </Button>
  );
}
