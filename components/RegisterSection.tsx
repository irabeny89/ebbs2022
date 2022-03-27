import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import dynamic from "next/dynamic";
import { MdBusinessCenter, MdRememberMe, MdSend } from "react-icons/md";
import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { USER_REGISTER } from "@/graphql/documentNodes";
import { RegisterVariableType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import config from "config";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { useRouter } from "next/router";
import EmailValidationForm from "./EmailValidationForm";

const {
  countryStates,
  constants: { AUTH_PAYLOAD },
} = config.appData;

// dynamically import component - code splitting
const FeedbackToast = dynamic(() => import("./FeedbackToast"), {
    loading: () => <>loading...</>,
  });

export default function RegisterSection() {
  const [validated, setValidated] = useState(false),
    [show, setShow] = useState(false),
    [fileSize, setFileSize] = useState(0),
    [showToast, setShowToast] = useState(false),
    router = useRouter(),
    // register mutation
    [
      registerUser,
      { data: registerData, error: registerError, loading: registerLoading },
    ] = useMutation<Record<"register", string>, RegisterVariableType>(
      USER_REGISTER
    );
  useEffect(() => {
    (async () => {
      const decode = (await import("jsonwebtoken")).decode;
      // update access token on register success & save payload in storage
      registerData &&
        (localStorage.setItem(
          AUTH_PAYLOAD,
          JSON.stringify(decode(registerData.register))
        ),
        accessTokenVar(registerData.register),
        router.push("/dashboard"));
    })();
  }, [registerData, router]);

  return (
    <>
      <h5 className="mb-5">
        <MdRememberMe size={25} /> Enter new credentials
      </h5>
      {/* new user register form */}
      <Container>
        <Row className="mb-5">
          <Col md="6">
            <EmailValidationForm />
          </Col>
        </Row>
        {/* basic user registeration form */}
        <Form
          data-testid="registerForm"
          noValidate
          validated={validated}
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget),
              username = formData.get("username")?.toString().trim()!,
              passCode = formData.get("passCode")?.toString().trim()!,
              password = formData.get("password")?.toString(),
              confirmPassword = formData.get("confirmPassword")?.toString()!,
              title = formData.get("title")?.toString().trim(),
              logo = formData.get("logo") as File,
              description = formData.get("description")?.toString().trim(),
              state = formData.get("state")?.toString().trim(),
              // compare password & give feedback accordingly
              hasConfirmedPassword = confirmPassword === password;
            // show the message if passwords are not same
            setShow(!hasConfirmedPassword);
            // check form validity without submitting...
            hasConfirmedPassword &&
            logo.size < 1e6 &&
            e.currentTarget.checkValidity()
              ? // ...if valid, off validity, send the query & reset form inputs & fileSize
                (setValidated(false),
                e.currentTarget.reset(),
                setFileSize(0),
                registerUser({
                  variables: {
                    registerInput: {
                      passCode,
                      password,
                      username,
                      title,
                      logoCID: logo.name
                        ? await (
                            await import("../web3storage/index")
                          ).default.put([logo])
                        : undefined,
                      description,
                      state,
                    },
                  },
                }))
              : // ...else prevent submitting & on validity
                (e.preventDefault(), e.stopPropagation(), setValidated(true));
          }}
        >
          <Row>
            <Col md="6" className="mb-3">
              <Form.FloatingLabel label="Username">
                <Form.Control
                  className="text-capitalize"
                  data-testid="registerUsername"
                  aria-label="username"
                  placeholder="Username"
                  maxLength={30}
                  name="username"
                  size="lg"
                  required
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
            </Col>
            <Col md="6">
              <Form.FloatingLabel label="Pass Code">
                <Form.Control
                  data-testid="passCode"
                  aria-label="pass-code"
                  placeholder="Pass-code"
                  name="passCode"
                  size="lg"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
            </Col>
          </Row>
          <Row>
            <Col md="6" className="mb-4">
              <Form.Text className="text-info">
                Password should be 8 or more characters
              </Form.Text>
              <Form.FloatingLabel label="Password">
                <Form.Control
                  data-testid="registerPassword"
                  onChange={() => setShow(false)}
                  type="password"
                  minLength={8}
                  aria-label="password"
                  placeholder="Password"
                  name="password"
                  size="lg"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
            </Col>
            <Col md="6" className="m-auto">
              <Form.FloatingLabel label="Confirm Password">
                <Form.Control
                  data-testid="registerConfirmPassword"
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
            </Col>
          </Row>
          {show && (
            <Row>
              <Col md="5">
                <Alert variant="danger">
                  Passwords do not match. Try again.
                </Alert>
              </Col>
            </Row>
          )}
          {/* service creation accordion */}
          <Accordion className="mt-5">
            <Accordion.Header style={{ maxWidth: 360 }}>
              <h5>
                <MdBusinessCenter size={25} /> Optional. Create a service?
              </h5>
            </Accordion.Header>
            <Accordion.Body>
              {/* service creation form */}
              <Row className="my-4">
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label
                      className={`${fileSize > 1e6 && "text-danger"}`}
                    >
                      Logo(.jpg, .png & .jpeg - 1MB max){" "}
                      {!!fileSize &&
                        `| ${getCompactNumberFormat(fileSize).replace(
                          "B",
                          "G"
                        )} ${fileSize > 1e6 ? "\u2717" : "\u2713"}`}
                    </Form.Label>
                    <Form.Control
                      data-testid="registerLogo"
                      type="file"
                      size="lg"
                      placeholder="Service logo"
                      aria-label="serviceLogo"
                      name="logo"
                      accept=".jpeg,.jpg,.png"
                      onChange={(e: any) => {
                        setFileSize(e.target.files[0].size);
                      }}
                    />
                  </Form.Group>
                  <Form.FloatingLabel label="Service Name">
                    <Form.Control
                      data-testid="registerServiceName"
                      placeholder="Service name"
                      aria-label="serviceName"
                      name="title"
                      className="text-capitalize"
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label>Select state</Form.Label>
                    <Form.Select defaultValue="Lagos" size="lg" name="state">
                      {countryStates.nigeria.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.FloatingLabel label="Service Description">
                    <Form.Control
                      data-testid="registerServiceDescription"
                      placeholder="Service Description"
                      aria-label="service Description"
                      name="description"
                      as="textarea"
                      style={{ height: "6rem" }}
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion>
          {/* register form feedback toast */}
          <FeedbackToast
            {...{
              error: registerError,
              showToast,
              setShowToast,
              successText:
                registerData?.register &&
                "Registration successful. You can login Now.",
            }}
          />
          <Button
            data-testid="registerButton"
            size="lg"
            className="my-4"
            type="submit"
          >
            {registerLoading && <Spinner animation="grow" size="sm" />}{" "}
            <MdSend /> Submit
          </Button>
        </Form>
      </Container>
    </>
  );
}
