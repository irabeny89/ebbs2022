import Button from "react-bootstrap/Button";
import { COMMENT_COUNT } from "@/graphql/documentNodes";
import { useQuery } from "@apollo/client";
import { CommentDisplayButtonPropsType, ServiceVertexType } from "types";
import { BiMessageAltDots } from "react-icons/bi";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useState } from "react";
import AjaxFeedback from "./AjaxFeedback";
import dynamic from "next/dynamic";

const ServiceCommentModal = dynamic(() => import("components/ServiceCommentModal"), {
  loading: () => <AjaxFeedback loading />
})

export default function CommentDisplayButton({
  serviceId,
}: CommentDisplayButtonPropsType) {
  const [showComment, setShowComment] = useState(false),
    { data, loading, error } = useQuery<
      Record<"service", ServiceVertexType>,
      Record<"serviceId", string>
    >(COMMENT_COUNT, {
      variables: {
        serviceId,
      },
    });

  return loading ? (
    <AjaxFeedback loading />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : (
    <>
      <ServiceCommentModal
        {...{
          serviceId,
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
