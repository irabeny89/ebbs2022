import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import config from "config";
import { useState } from "react";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { MessagePosterPropsType, PagingInputType, UserVertexType } from "types";
import { COMMENTS_TAB, MY_COMMENT } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";
import Messenger from "./MessagePoster";
import FeedbackToast from "./FeedbackToast";
import PostCard from "./PostCard";

const {
  constants: { AUTH_PAYLOAD },
} = config.appData;

export default function CommentsSection() {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    [showToast, setShowToast] = useState(false),
    { data, loading, error } = useQuery<
      Record<"me", UserVertexType>,
      Record<"commentArgs", PagingInputType>
    >(COMMENTS_TAB, {
      variables: {
        commentArgs: { last: 50 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    [sendPost, { loading: posting, error: errorPosting }] = useMutation<
      Record<"myComment", string>,
      Record<"serviceId" | "post", string>
    >(MY_COMMENT, {
      refetchQueries: [COMMENTS_TAB],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    messengerAction: MessagePosterPropsType["action"] = (message) =>
      sendPost({
        variables: {
          post: message,
          serviceId: authPayload?.serviceId?.toString()!,
        },
      });

  return loading ? (
    <AjaxFeedback loading={loading} />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : !data?.me?.service?.title ? (
    <DashboardServiceAlert />
  ) : (
    <>
      <FeedbackToast {...{ showToast, setShowToast, error: errorPosting }} />
      {data?.me?.service?.comments?.edges.map(
        ({ node: { createdAt, _id, post, poster, topic } }) => (
          <Row key={_id?.toString()} className="justify-content-center">
            <Col lg="7">
              <PostCard
                {...{
                  createdAt: createdAt.toString(),
                  post,
                  serviceId: authPayload.serviceId!,
                  username: poster?.username!,
                  userServiceId: poster?.service?._id?.toString()!,
                }}
              />
            </Col>
          </Row>
        )
      )}
      <Row className="justify-content-center mt-5">
        <Col lg="7">
          <Messenger
            {...{
              action: messengerAction,
              isSubmitting: posting,
              label: "Reply comments",
            }}
          />
        </Col>
      </Row>
    </>
  );
}
