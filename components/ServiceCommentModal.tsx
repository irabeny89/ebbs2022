import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots } from "react-icons/bi";
import {
  MessagePosterPropsType,
  PagingInputType,
  ServiceCommentModalType,
  ServiceVertexType,
} from "types";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { COMMENTS, COMMENT_COUNT, MY_COMMENT } from "@/graphql/documentNodes";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import AjaxFeedback from "./AjaxFeedback";
import MessagerPoster from "./MessagePoster";
import Link from "next/link";
import PostCard from "./PostCard";

export default function ServiceCommentModal({
  show,
  setShow,
  serviceId,
  serviceName,
}: ServiceCommentModalType) {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    // query comments
    { loading, error, data } = useQuery<
      Record<"service", ServiceVertexType>,
      Record<"commentArgs", PagingInputType> & Record<"serviceId", string>
    >(COMMENTS, {
      variables: {
        commentArgs: { last: 50 },
        serviceId,
      },
    }),
    // comment posting
    [postComment, { loading: postLoading }] = useMutation<
      Record<"myCommentPost", string>,
      Record<"serviceId" | "post", string>
    >(MY_COMMENT, {
      refetchQueries: [COMMENTS, COMMENT_COUNT],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    messagerPostAction: MessagePosterPropsType["action"] = (message) =>
      postComment({
        variables: {
          post: message,
          serviceId,
        },
      });

  return loading ? (
    <Spinner animation="grow" size="sm" />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : (
    <Modal show={show} onHide={() => setShow(false)} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <BiMessageAltDots /> Comments about{" "}
          <span className="text-info">{serviceName}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>
            {(data?.service?.comments?.edges ?? []).map(
              ({ node: { createdAt, _id, post, poster } }) => (
                <Col key={_id.toString()} sm="6">
                  <PostCard
                    {...{
                      createdAt: createdAt.toString(),
                      post,
                      posterId: poster?._id.toString()!,
                      serviceId,
                      commentId: _id.toString(),
                      username: poster?.username!,
                      posterServiceId: poster?.service?._id?.toString()!,
                    }}
                  />
                </Col>
              )
            )}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        {!!authPayload ? (
          <MessagerPoster
            {...{
              action: messagerPostAction,
              label: "Enter comment",
              isSubmitting: postLoading,
            }}
          />
        ) : (
          <Link href="/member">Login to comment</Link>
        )}
      </Modal.Footer>
    </Modal>
  );
}
