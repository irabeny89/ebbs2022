import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { BiUserCircle } from "react-icons/bi";
import { useReactiveVar, useMutation } from "@apollo/client";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import DeleteButton from "./DeleteButton";
import { useState } from "react";
import DeleteModal from "./DeleteModal";
import {
  COMMENTS,
  COMMENTS_TAB,
  COMMENT_COUNT,
  DELETE_MY_COMMENT,
} from "@/graphql/documentNodes";

export default function PostCard({
  posterId,
  serviceId,
  username,
  posterServiceId,
  createdAt,
  post,
  commentId,
}: Record<
  | "serviceId"
  | "username"
  | "posterServiceId"
  | "posterId"
  | "createdAt"
  | "post"
  | "commentId",
  string
>) {
  const authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    [showDelete, setShowDelete] = useState(false),
    isMyPost = posterId === authPayload.sub,
    [deleteMyComment, { loading }] = useMutation<
      Record<"deleteMyComment", string>,
      Record<"commentId", string>
    >(DELETE_MY_COMMENT, {
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        commentId,
      },
      refetchQueries: [COMMENTS, COMMENT_COUNT, COMMENTS_TAB],
    });

  return (
    <Card className="mb-3">
      <DeleteModal
        name="this comment post"
        show={showDelete}
        setShow={setShowDelete}
        deleteLoading={loading}
        handleDelete={() => deleteMyComment()}
      />
      <Card.Header>
        <Card.Title
          className={`${
            serviceId === authPayload.serviceId && "text-primary"
          } d-flex justify-content-between`}
        >
          <div>
            <BiUserCircle
              color={`${serviceId === authPayload.serviceId && "blue"}`}
              size={30}
              className="px-1"
            />
            {username}
          </div>
          <div>
            {posterServiceId === serviceId && <Badge pill>Owner</Badge>}
          </div>
        </Card.Title>
        <Card.Subtitle className="d-flex justify-content-between">
          {new Date(+createdAt).toUTCString()}
          {isMyPost && <DeleteButton setShow={setShowDelete} />}
        </Card.Subtitle>
      </Card.Header>
      <Card.Body>{post}</Card.Body>
    </Card>
  );
}
