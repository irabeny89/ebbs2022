import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots, BiSend } from "react-icons/bi";
import { ServiceCommentModalType } from "types";
import { useEffect, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import { MY_COMMENT, SERVICE_LIKE_DATA } from "@/graphql/documentNodes";
import { accessTokenVar } from "@/graphql/reactiveVariables";

export default function ServiceCommentModal({
  show,
  setShow,
  edges,
  serviceId,
  authPayload,
  favoriteService,
}: ServiceCommentModalType) {
  const [post, setPost] = useState(""),
    // the auth payload
    accessToken = useReactiveVar(accessTokenVar),
    // comment posting
    [postComment, { loading: postLoading, data: postData }] = useMutation<
      Record<"myCommentPost", string>,
      Record<"serviceId" | "post", string>
    >(MY_COMMENT, {
      refetchQueries: [SERVICE_LIKE_DATA],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        post,
        serviceId,
      },
    });
  // useEffect hook to manage rerenders
  useEffect(() => {
    fetch("/api/revalidateHome");
    postData?.myCommentPost && setPost("");
  }, [postData?.myCommentPost, favoriteService]);

  return (
    <Modal show={show} onHide={() => setShow(false)} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <BiMessageAltDots /> Comments
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row>
            {(edges ?? [])
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
        {!!authPayload && (
          <Col>
            <Form.FloatingLabel label="Enter comment">
              <Form.Control
                value={post}
                onChange={(e) => setPost(e.currentTarget.value)}
                placeholder="Enter text"
                as="textarea"
                style={{
                  height: "5rem",
                }}
              ></Form.Control>
            </Form.FloatingLabel>
            <Button
              className="w-100 my-2"
              onClick={() => postComment()}
              disabled={!post}
            >
              {postLoading && <Spinner animation="grow" size="sm" />}
              <BiSend size={18} /> Send
            </Button>
          </Col>
        )}
      </Modal.Footer>
    </Modal>
  );
}
