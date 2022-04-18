import { MessengerPropsType } from "types";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BiSend } from "react-icons/bi";
import { FormEvent } from "react";

export default function Messenger({
  action,
  isSubmitting,
  label,
}: MessengerPropsType) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = new FormData(e.currentTarget).get("message") as
      | string
      | null;

    message
      ? (e.currentTarget.reset(), action(message))
      : (e.preventDefault(), e.stopPropagation());
  };

  return (
    <Form onSubmit={handleSubmit} className="w-100">
      <Form.FloatingLabel label={label}>
        <Form.Control
          placeholder={label}
          aria-label={label}
          name="message"
          as="textarea"
          style={{ height: "6rem" }}
        />
      </Form.FloatingLabel>
      <Button type="submit" className="w-100 mt-3" size="lg">
        {isSubmitting && <Spinner animation="grow" size="sm" />}
        <BiSend size={18} />
        &nbsp;Send
      </Button>
    </Form>
  );
}
