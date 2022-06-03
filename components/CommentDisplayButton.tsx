import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { COMMENT_COUNT } from "@/graphql/documentNodes";
import { useQuery } from "@apollo/client";
import { CommentDisplayButtonPropsType, ServiceVertexType } from "types";
import { BiMessageAltDots } from "react-icons/bi";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toastPayloadsVar } from "@/graphql/reactiveVariables";

const ServiceCommentModal = dynamic(
  () => import("components/ServiceCommentModal")
);

export default function CommentDisplayButton({
  serviceId,
  serviceName,
}: CommentDisplayButtonPropsType) {
  const [showComment, setShowComment] = useState(false);

  const { data, loading, error } = useQuery<
    Record<"service", ServiceVertexType>,
    Record<"serviceId", string>
  >(COMMENT_COUNT, {
    variables: {
      serviceId,
    },
  });

  useEffect(() => {
    // toast feedback
    error && toastPayloadsVar([{ error }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error]);

  return loading ? (
    <Spinner animation="grow" size="sm" />
  ) : (
    <>
      <ServiceCommentModal
        {...{
          serviceId,
          serviceName,
          setShow: setShowComment,
          show: showComment,
        }}
      />
      <Button
        size="sm"
        className="py-0 w-100"
        variant="outline-secondary"
        onClick={() => setShowComment(true)}
      >
        <BiMessageAltDots size={18} />{" "}
        {getCompactNumberFormat(data?.service?.commentCount! ?? 0)}
      </Button>
    </>
  );
}
