import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Form from "react-bootstrap/Form"
import Alert from "react-bootstrap/Alert"
import Button from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner"
import { MdPassword, MdSend } from "react-icons/md";
import EmailValidationForm from "./EmailValidationForm";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ChangePasswordVariableType } from "types";
import { USER_PASSWORD_CHANGE } from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";

export default function LostPasswordSection() {
  const [validated, setValidated] = useState(false),
  [showAlert, setShowAlert] = useState(false),
  // change password mutation
  [
    changePassword,
    { data: passwordData, error: passwordError, loading: passwordLoading },
  ] = useMutation<
    Record<"changePassword", string>,
    ChangePasswordVariableType
  >(USER_PASSWORD_CHANGE);

  return (
    <>
      <h5 className="mb-5">
        <MdPassword size={25} /> Enter recovery credentials
      </h5>
      <Container>
        {/* pass code request section */}
        <Row className="justify-content-center my-5">
          <Col md="7">
            <EmailValidationForm />
          </Col>
        </Row>
        {/* password change section */}
        <Row className="justify-content-center my-5">
          <Col md="7">
            <h4 className="my-5">Change Password</h4>
            <Form
              data-testid="changePasswordForm"
              noValidate
              validated={validated}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget),
                  password = formData.get("password")?.toString()!,
                  confirmPassword = formData
                    .get("confirmPassword")
                    ?.toString()!,
                  // compare password, store in variable
                  hasConfirmedPassword = confirmPassword === password;
                // show the alert message if passwords are not same
                setShowAlert(!hasConfirmedPassword);
                // check form validity without submitting...
                hasConfirmedPassword && e.currentTarget.checkValidity()
                  ? // ...if valid, off validity, send the query & reset form inputs
                    (setValidated(false),
                    e.currentTarget.reset(),
                    changePassword({
                      variables: {
                        passCode: formData.get("passCode")?.toString()!,
                        newPassword: password,
                      },
                    }))
                  : // ...else prevent submitting & on validity
                    (e.preventDefault(),
                    e.stopPropagation(),
                    setValidated(true));
              }}
            >
              <Form.FloatingLabel label="Pass Code" className="mb-3">
                <Form.Control
                  data-testid="changePassCode"
                  required
                  aria-label="passcode"
                  name="passCode"
                  placeholder="Pass Code"
                  size="lg"
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.Text className="text-info">
                Password should be 8 or more characters
              </Form.Text>
              <Form.FloatingLabel label="New Password" className="mb-4">
                <Form.Control
                  onChange={() => setShowAlert(false)}
                  type="password"
                  minLength={8}
                  aria-label="New Password"
                  placeholder="New Password"
                  name="password"
                  size="lg"
                  data-testid="changePassword"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Confirm Password">
                <Form.Control
                  data-testid="changeConfirmPassword"
                  type="password"
                  minLength={8}
                  aria-label="confirmPassword"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  size="lg"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              {showAlert && (
                <Alert variant="danger" className="my-4">
                  Passwords do not match. Try again.
                </Alert>
              )}
              {/* change password form feedback toast */}
              <AjaxFeedback
                error={passwordError}
                loading={passwordLoading}
                successText={passwordData?.changePassword}
                className="mt-5"
              />
              <Button
                size="lg"
                className="my-5"
                data-testid="changeSubmit"
                type="submit"
              >
                {passwordLoading && <Spinner animation="grow" size="sm" />}{" "}
                <MdSend /> Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}
