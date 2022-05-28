import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { NewDirectMessageModalPropsType } from "types";
import MessagePoster from "./MessagePoster";
import { ChangeEvent, useState } from "react";
import {
  SEND_MY_NEW_DIRECT_MESSAGE,
  CHATS_WITH,
  DIRECT_MESSAGERS,
} from "@/graphql/documentNodes";
import { useMutation, useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import AjaxFeedback from "./AjaxFeedback";

export default function NewDirectMessageModal({
  setShow,
  show,
  username = "",
}: NewDirectMessageModalPropsType) {
  const accessToken = useReactiveVar(accessTokenVar);

  const [_username, setUsername] = useState(username);

  const [
    sendDirectMessage,
    { loading: loadingMessage, error: errorMessage, data: dataMessage, reset },
  ] = useMutation<
    Record<"sendMyDirectMessage", string>,
    Record<"message" | "receiverUsername", string>
  >(SEND_MY_NEW_DIRECT_MESSAGE, {
    context: { headers: { authorization: `Bearer ${accessToken}` } },
    refetchQueries: [CHATS_WITH, DIRECT_MESSAGERS],
  });

  const handleMessagePost = (message: string) => {
      sendDirectMessage({
        variables: { message, receiverUsername: _username },
      });
    },
    handleUsername = (e: ChangeEvent<HTMLInputElement>) => (
      setUsername(e.target.value), reset()
    ),
    handleModalClose = () => (setUsername(username), reset(), setShow(false));

  return (
    <Modal show={show} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Send Direct Message</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.FloatingLabel label="Enter recipient username">
          <Form.Control
            aria-label="user name"
            name="username"
            value={_username}
            onChange={handleUsername}
            placeholder="Enter recipient username"
          />
        </Form.FloatingLabel>
        <br />
        {_username && (
          <MessagePoster
            label="Enter message"
            isSubmitting={loadingMessage}
            action={handleMessagePost}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <AjaxFeedback
          error={errorMessage}
          successText={
            dataMessage?.sendMyDirectMessage && "Message sent successfully."
          }
        />
      </Modal.Footer>
    </Modal>
  );
}
