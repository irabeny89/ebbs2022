import {
  CHATS_WITH,
  DIRECT_MESSAGERS,
  SEND_MY_DIRECT_MESSAGE,
  SET_SEEN_DIRECT_MESSAGES,
} from "@/graphql/documentNodes";
import {
  accessTokenVar,
  authPayloadVar,
  toastPayloadsVar,
} from "@/graphql/reactiveVariables";
import { useQuery, useReactiveVar, useMutation } from "@apollo/client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import {
  CursorConnectionType,
  DirectMessageModalPropsType,
  DirectMessageType,
  PagingInputType,
} from "types";
import DirectMessageCard from "./DirectMessageCard";
import MessagePoster from "./MessagePoster";

const AjaxFeedback = dynamic(() => import("components/AjaxFeedback"), {
  loading: () => <>loading...</>,
});

export default function DirectMessageModal({
  show,
  setShow,
  _id: userId,
  username,
}: DirectMessageModalPropsType) {
  const accessToken = useReactiveVar(accessTokenVar),
    authPayload = useReactiveVar(authPayloadVar);

  const { data, error, loading } = useQuery<
    Record<"chatsWith", CursorConnectionType<DirectMessageType>>,
    Record<"userId", string> & Record<"args", PagingInputType>
  >(CHATS_WITH, {
    variables: {
      userId,
      args: { last: 25 },
    },
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const [
    sendDirectMessage,
    { loading: loadingMessage, error: errorMessage, reset },
  ] = useMutation<
    Record<"sendMyDirectMessage", string>,
    Record<"message" | "receiverId", string>
  >(SEND_MY_DIRECT_MESSAGE, {
    context: { headers: { authorization: `Bearer ${accessToken}` } },
    refetchQueries: [CHATS_WITH, DIRECT_MESSAGERS],
  });

  const [setSeenMessages] = useMutation<
    Record<"setSeenDirectMessages", string>,
    Record<"messageIds", string[]>
  >(SET_SEEN_DIRECT_MESSAGES, {
    context: { headers: { authorization: `Bearer ${accessToken}` } },
    refetchQueries: [CHATS_WITH, DIRECT_MESSAGERS],
  });

  const handleMessagePost = (message: string) =>
    sendDirectMessage({
      variables: { message, receiverId: userId },
    });
  // when message modal loads, flag received messages as seen(isSeen === true)
  useEffect(() => {
    const unSeenMessages =
        !!data?.chatsWith.edges.length &&
        data.chatsWith.edges.filter(
          ({ node: { isSeen, receiver } }) =>
            receiver === authPayload.sub && isSeen === false
        ),
      messageIds =
        unSeenMessages &&
        !!unSeenMessages.length &&
        unSeenMessages.map(({ node: { _id } }) => _id);

    messageIds &&
      setSeenMessages({
        variables: {
          messageIds,
        },
      });

    return () => reset();
  }, [show, reset, data?.chatsWith.edges, authPayload.sub, setSeenMessages]);

  useEffect(() => {
    // toast feedback
    error && toastPayloadsVar([{ error }]);
    errorMessage && toastPayloadsVar([{ error: errorMessage, reset }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error, errorMessage, reset]);

  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Chats with &nbsp;<span className="text-info">{username}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <AjaxFeedback loading />
          ) : error ? (
            <AjaxFeedback error={error} />
          ) : (
            data?.chatsWith.edges.map(({ node }) => (
              <DirectMessageCard key={node._id} {...node} />
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <MessagePoster
            label="Enter message"
            isSubmitting={loadingMessage}
            action={handleMessagePost}
          />
        </Modal.Footer>
      </Modal>
    </>
  );
}
