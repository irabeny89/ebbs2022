import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import config from "config";
import { FormEvent } from "react";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { PagingInputType, UserVertexType } from "types";
import { COMMENTS_TAB, MY_COMMENT } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import DashboardServiceAlert from "components/DashboardServiceAlert";

const {
  constants: { AUTH_PAYLOAD },
} = config.appData;

export default function CommentsSection() {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
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
    [sendPost] = useMutation<
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
    handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const post = new FormData(e.currentTarget).get("commentReply") as
        | string
        | null;

      post
        ? (e.currentTarget.reset(),
          sendPost({
            variables: {
              post,
              serviceId: authPayload?.serviceId?.toString()!,
            },
          }))
        : (e.preventDefault(), e.stopPropagation());
    };

  return loading ? (
    <AjaxFeedback loading={loading} error={error} />
  ) : !data?.me?.service?.title ? (
    <DashboardServiceAlert />
  ) : (
    <>
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
          <Form onSubmit={handleSubmit}>
            <Form.FloatingLabel label="Reply comments">
              <Form.Control
                placeholder="Reply comments"
                aria-label="comment reply"
                name="commentReply"
                as="textarea"
                style={{ height: "6rem" }}
              />
            </Form.FloatingLabel>
            <Button type="submit" className="w-100 mt-3" size="lg">
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </>
  );
}
