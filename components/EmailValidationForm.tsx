import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { MdSend } from "react-icons/md";
import { FormEvent, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { USER_REQUEST_PASSCODE } from "@/graphql/documentNodes";
import { toastPayloadsVar } from "@/graphql/reactiveVariables";

export default function EmailValidationForm() {
  // passcode form validation state
  const [passcodeValidated, setPassCodeValidated] = useState(false);
  // passcode request query
  const [requestPassCode, { data, error, loading }] = useLazyQuery<
    Record<"requestPassCode", string>,
    Record<"email", string>
  >(USER_REQUEST_PASSCODE);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // check form validity before sending
    e.currentTarget.checkValidity()
      ? (setPassCodeValidated(false),
        e.currentTarget.reset(),
        requestPassCode({
          variables: {
            email: formData.get("email")?.toString()!,
          },
        }))
      : (e.preventDefault(), e.stopPropagation(), setPassCodeValidated(true));
  };

  useEffect(() => {
    // toast feedback
    (error || data?.requestPassCode) &&
      toastPayloadsVar([{ error, successText: data?.requestPassCode }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error, data?.requestPassCode]);

  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Request Passcode</Accordion.Header>
        <Accordion.Body>
          <Form
            data-testid="recoveryForm"
            noValidate
            validated={passcodeValidated}
            onSubmit={handleSubmit}
          >
            <Form.FloatingLabel label="Email">
              <Form.Control
                type="email"
                aria-label="email"
                placeholder="Email"
                name="email"
                size="lg"
                required
                data-testid="recoveryEmail"
              />
              <Form.Control.Feedback type="invalid">
                This field is required!
              </Form.Control.Feedback>
            </Form.FloatingLabel>
            <Button
              size="lg"
              className="mt-5"
              type="submit"
              data-testid="recoverySendButton"
            >
              {loading && <Spinner animation="grow" size="sm" />} <MdSend />{" "}
              Submit
            </Button>
          </Form>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
