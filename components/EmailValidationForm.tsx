import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import { MdSend } from "react-icons/md";
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { USER_REQUEST_PASSCODE } from "@/graphql/documentNodes";

const EmailValidationForm = () => {
  // passcode form validation state
  const [passcodeValidated, setPassCodeValidated] = useState(false),
    [show, setShow] = useState(false),
    // passcode request query
    [requestPassCode, { data, error, loading }] = useLazyQuery<
      Record<"requestPassCode", string>,
      Record<"email", string>
    >(USER_REQUEST_PASSCODE);

  useEffect(() => {
    (data || error) && setShow(true);
  }, [error, data]);

  return (
    <Accordion>
      <Toast
        bg={error ? "danger" : "success"}
        show={show}
        onClose={() => setShow(false)}
        autohide
      >
        <Toast.Header className="justify-content-between h5">
          {error?.name || "Success"}
        </Toast.Header>
        {error && (
          <Toast.Body className="justify-content-between text-white">
            {error.message}
          </Toast.Body>
        )}
        {data && (
          <Toast.Body className="justify-content-between text-white">
            {data.requestPassCode}
          </Toast.Body>
        )}
      </Toast>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Request Passcode</Accordion.Header>
        <Accordion.Body>
          <Form
            data-testid="recoveryForm"
            noValidate
            validated={passcodeValidated}
            onSubmit={(e) => {
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
                : (e.preventDefault(),
                  e.stopPropagation(),
                  setPassCodeValidated(true));
            }}
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
};

export default EmailValidationForm;
