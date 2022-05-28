import Card from "react-bootstrap/Card";
import { BiUserCircle, BiCrown } from "react-icons/bi";
import { MdBusinessCenter, MdOutlineMessage } from "react-icons/md";
import { useReactiveVar, useMutation } from "@apollo/client";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { CSSProperties, useState } from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import DeleteModal from "./DeleteModal";
import NewDirectMessageModal from "./NewDirectMessageModal";
import {
  COMMENTS,
  COMMENTS_TAB,
  COMMENT_COUNT,
  DELETE_MY_COMMENT,
} from "@/graphql/documentNodes";

const dotsStyle: CSSProperties = { cursor: "pointer" };

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
    accessToken = useReactiveVar(accessTokenVar);

  const [showDelete, setShowDelete] = useState(false),
    [showNewDirectMessage, setShowNewDirectMessage] = useState(false);

  const [deleteMyComment, { loading }] = useMutation<
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

  const isMyPost = posterId === authPayload.sub;

  return (
    <Card className="mb-3">
      <NewDirectMessageModal
        username={username}
        show={showNewDirectMessage}
        setShow={setShowNewDirectMessage}
      />
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
            {username} &nbsp;
            {posterServiceId === serviceId && (
              <BiCrown color="green" size={25} />
            )}
          </div>
          <div style={dotsStyle}>
            {posterServiceId && (
              <Link href={`/services/${posterServiceId}`}>
                <MdBusinessCenter size={30} className="mx-2" />
              </Link>
            )}
            <MdOutlineMessage
              onClick={() => setShowNewDirectMessage(true)}
              size={30}
              className="mx-2"
            />
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
