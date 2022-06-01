import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import {
  accessTokenVar,
  authPayloadVar,
  toastPayloadsVar,
} from "@/graphql/reactiveVariables";
import { MessagePosterPropsType, PagingInputType, UserVertexType } from "types";
import { COMMENTS_TAB, MY_COMMENT } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";
import Messenger from "./MessagePoster";
import PostCard from "./PostCard";
import { useEffect } from "react";

export default function CommentsSection() {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar);

  const { data, loading, error } = useQuery<
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
    [sendPost, { loading: posting, error: errorPosting, reset }] = useMutation<
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

  useEffect(() => {
    // toast feedback
    error && toastPayloadsVar([{ error }]);
    (errorPosting) && toastPayloadsVar([{ error: errorPosting, reset }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error?.message, errorPosting?.message]);

  return loading ? (
    <AjaxFeedback loading={loading} />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : !data?.me?.service?.title ? (
    <DashboardServiceAlert />
  ) : (
    <>
      {data?.me?.service?.comments?.edges.map(
        ({ node: { createdAt, _id, post, poster } }) => (
          <Row key={_id?.toString()} className="justify-content-center">
            <Col lg="7">
              <PostCard
                {...{
                  createdAt: createdAt.toString(),
                  post,
                  commentId: _id.toString(),
                  posterId: poster?._id?.toString()!,
                  serviceId: authPayload.serviceId!,
                  username: poster?.username!,
                  posterServiceId: poster?.service?._id?.toString()!,
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
