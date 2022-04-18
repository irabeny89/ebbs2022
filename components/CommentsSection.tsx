import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import config from "config";
import { useState } from "react";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { MessengerPropsType, PagingInputType, UserVertexType } from "types";
import { COMMENTS_TAB, MY_COMMENT } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";
import Messenger from "./Messenger";
import FeedbackToast from "./FeedbackToast";

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
    messengerAction: MessengerPropsType["action"] = (message) =>
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
      {data?.me?.service?.comments?.edges.map(({ node: comment }) => (
        <Row key={comment._id?.toString()} className="justify-content-center">
          <Col lg="7">
            <Card className="my-3">
              <Card.Header
                className={`${
                  JSON.parse(localStorage.getItem(AUTH_PAYLOAD)!)?.username ===
                    comment.poster?.username && "text-info"
                }`}
              >
                <Card.Title>{comment?.poster?.username}</Card.Title>
                <Card.Subtitle>
                  {new Date(+comment.createdAt).toDateString()}
                </Card.Subtitle>
              </Card.Header>
              <Card.Body>
                <Card.Text>{comment.post}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ))}
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
