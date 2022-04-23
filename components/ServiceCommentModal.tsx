import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots } from "react-icons/bi";
import {
  MessengerPropsType,
  PagingInputType,
  ServiceCommentModalType,
  ServiceVertexType,
} from "types";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { COMMENTS, COMMENT_COUNT, MY_COMMENT } from "@/graphql/documentNodes";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import AjaxFeedback from "./AjaxFeedback";
import Messenger from "./Messenger";
import Link from "next/link";

export default function ServiceCommentModal({
  show,
  setShow,
  // edges,
  serviceId,
}: // authPayload,
// favoriteService,
ServiceCommentModalType) {
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
    messengerAction: MessengerPropsType["action"] = (message) =>
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
          <BiMessageAltDots /> Comments
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>
            {(data?.service?.comments?.edges ?? [])
              .map((edge) => edge.node)
              .map((comment) => (
                <Col key={comment._id.toString()} sm="6">
                  <Card className="mb-3">
                    <Card.Header>
                      <Card.Title>{comment?.poster?.username!}</Card.Title>
                      <Card.Subtitle>
                        {new Date(+comment.createdAt).toDateString()}
                      </Card.Subtitle>
                    </Card.Header>
                    <Card.Body>{comment.post}</Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        {!!authPayload ? (
          <Messenger
            {...{
              action: messengerAction,
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
