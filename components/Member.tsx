import {
  MdRememberMe,
  MdCardMembership,
  MdSend,
  MdLogin,
  MdPassword,
  MdBusinessCenter,
} from "react-icons/md";
import Container from "react-bootstrap/Container";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import config from "../config";
import { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ServiceType, UserLoginVariableType, UserRegisterVariableType, UserType } from "types";
import { accessTokenVar, toastsVar } from "@/graphql/reactiveVariables";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import {
  USER_LOGIN,
  USER_PASSWORD_CHANGE,
  USER_REGISTER,
  USER_REQUEST_PASSCODE,
} from "@/graphql/documentNodes";
import { useRouter } from "next/router";

// fetch web app meta data
const { webPages, generalErrorMessage } = config.appData,
  // find home page data
  memberPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "member"
  );
// tab title style
const tabTitleStyle = { fontSize: 16 };
// member page - login, register & password revocery
const Member = () => {
  const router = useRouter();
  // login form validation state
  const [validated, setValidated] = useState(false),
    // register form validation state
    [registerValidated, setRegisterValidated] = useState(false),
    // passcode form validation state
    [passcodeValidated, setPassCodeValidated] = useState(false),
    // password form validation state
    [passwordValidated, setPasswordValidated] = useState(false),
    // file size state
    [fileSize, setFileSize] = useState(0),
    // alert state for new user register password comparison
    [show, setShow] = useState(false),
    [showAlert, setShowAlert] = useState(false),
    // login mutation
    [login, { data, error, loading }] = useLazyQuery<
      Record<"login", string>,
      UserLoginVariableType
    >(USER_LOGIN),
    // register mutation
    [
      registerUser,
      { data: registerData, error: registerError, loading: registerLoading },
    ] = useMutation<
      Record<"userRegister", string>,
      UserRegisterVariableType
    >(USER_REGISTER),
    // passcode request mutation
    [
      requestPassCode,
      { data: passCodeData, error: passCodeError, loading: passCodeLoading },
    ] = useMutation<Record<"requestPassCode", string>, Record<"email", string>>(
      USER_REQUEST_PASSCODE
    ),
    // change password mutation
    [
      changePassword,
      { data: passwordData, error: passwordError, loading: passwordLoading },
    ] = useMutation<
      Record<"changePassword", string>,
      Record<"passCode" | "newPassword", string>
    >(USER_PASSWORD_CHANGE);

  // toast error on login fail
  error &&
    toastsVar([
      {
        message: generalErrorMessage,
        header: error.name,
      },
    ]);
  // toast error on register fail
  registerError &&
    toastsVar([
      {
        message: generalErrorMessage,
        header: registerError.name,
      },
    ]);
  // toast error on passcode request fail
  passCodeError &&
    toastsVar([
      {
        message: generalErrorMessage,
        header: passCodeError.name,
      },
    ]);
  // toast error on pass change fail
  passwordError &&
    toastsVar([
      {
        message: generalErrorMessage,
        header: passwordError.name,
      },
    ]);
  // toast when passcode request sent successfully
  passCodeData &&
    toastsVar([
      {
        message: passCodeData.requestPassCode,
      },
    ]);

  useEffect(() => {
    // update access token on login success
    data &&
      (accessTokenVar(data.login ?? ""), router.push("/member/dashboard"));
    // update access token on register success
    registerData &&
      (accessTokenVar(registerData.userRegister ?? ""),
      router.push("/member/dashboard"));
    // update access token on password change success
    passwordData &&
      (accessTokenVar(passwordData.changePassword ?? ""),
      router.push("/member/dashboard"));
  }, [data, registerData, passwordData]);

  return (
    <Container>
      {/* page title */}
      <Row className="mb-5 h1">
        <Col>
          <MdCardMembership size="40" className="mb-2" />{" "}
          {memberPage?.pageTitle}
        </Col>
      </Row>
      {/* first paragraph */}
      <Row as="p" className="my-4 text-center justify-content-center display-5">
        {memberPage?.parargraphs[0]}
      </Row>
      {/* member authentication tabs */}
      <Tabs id="member-tabs" defaultActiveKey="Login" className="my-5">
        {/* login tab */}
        <Tab title={<h5 style={tabTitleStyle}>Login</h5>} eventKey="Login">
          <h5 className="mb-5">
            <MdLogin size={25} /> Enter Login Credentials
          </h5>
          <Container>
            <Row className="justify-content-center">
              <Col md="7">
                {/* login form */}
                <Form
                  data-testid="loginForm"
                  noValidate
                  validated={validated}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    // check form validity without submitting...
                    e.currentTarget.checkValidity()
                      ? // ...if valid, off validity, send the query & reset form inputs
                        (login({
                          variables: {
                            email: formData.get("email")?.toString() ?? "",
                            password:
                              formData.get("password")?.toString() ?? "",
                          },
                        }),
                        setValidated(false),
                        e.currentTarget.reset())
                      : // ...else prevent submitting & on validity
                        (e.preventDefault(),
                        e.stopPropagation(),
                        setValidated(true));
                  }}
                >
                  <Form.FloatingLabel label="Email">
                    <Form.Control
                      data-testid="loginEmail"
                      type="email"
                      aria-label="email"
                      placeholder="Email"
                      name="email"
                      size="lg"
                      required
                      autoFocus
                    />
                    <Form.Control.Feedback type="invalid">
                      This field is required!
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>
                  <Form.Text className="text-info">
                    Password should be 8 or more characters
                  </Form.Text>
                  <Form.FloatingLabel label="Password">
                    <Form.Control
                      data-testid="loginPassword"
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
                  <Button
                    data-testid="loginButton"
                    size="lg"
                    className="my-5"
                    type="submit"
                  >
                    {loading && <Spinner animation="grow" size="sm" />}{" "}
                    <MdSend /> Submit
                  </Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </Tab>
        {/* register tab */}
        <Tab
          title={<h5 style={tabTitleStyle}>Register</h5>}
          eventKey="Register"
        >
          <h5 className="mb-5">
            <MdRememberMe size={25} /> Enter new credentials
          </h5>
          {/* new user register form */}
          <Container>
            <Form
              data-testid="registerForm"
              noValidate
              validated={registerValidated}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget),
                  username = formData.get("username")?.toString()!,
                  email = formData.get("email")?.toString()!,
                  password = formData.get("password")?.toString()!,
                  confirmPassword = formData
                    .get("confirmPassword")
                    ?.toString()!,
                  title = formData.get("title")?.toString(),
                  logo = formData.get("logo") as File,
                  description = formData.get("description")?.toString(),
                  state = formData.get("state")?.toString(),
                  // compare password & give feedback accordingly
                  hasConfirmedPassword = confirmPassword === password;
                // show the message if passwords are not same
                setShow(!hasConfirmedPassword);
                // check form validity without submitting...
                hasConfirmedPassword &&
                logo.size < 1e6 &&
                e.currentTarget.checkValidity()
                  ? // ...if valid, off validity, send the query & reset form inputs & fileSize
                    (setRegisterValidated(false),
                    e.currentTarget.reset(),
                    setFileSize(0),
                    registerUser({
                      variables: {
                        userRegisterInput: {
                          email,
                          password,
                          username,
                          title,
                          // TODO: CID string from web3Storage client
                          logo: "",
                          description,
                          state,
                        },
                      },
                    }))
                  : // ...else prevent submitting & on validity
                    (e.preventDefault(),
                    e.stopPropagation(),
                    setRegisterValidated(true));
              }}
            >
              <Row>
                <Col md="6" className="mb-3">
                  <Form.FloatingLabel label="Username">
                    <Form.Control
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
                  <Form.FloatingLabel label="Email">
                    <Form.Control
                      data-testid="registerEmail"
                      type="email"
                      aria-label="email"
                      placeholder="Email"
                      name="email"
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
                        />
                        <Form.Control.Feedback type="invalid">
                          This field is required!
                        </Form.Control.Feedback>
                      </Form.FloatingLabel>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Select state</Form.Label>
                        <Form.Select
                          defaultValue="Lagos"
                          size="lg"
                          name="state"
                        >
                          {[
                            "Abia",
                            "Adamawa",
                            "Akwa Ibom",
                            "Anambra",
                            "Bauchi",
                            "Bayelsa",
                            "Benue",
                            "Borno",
                            "Cross River",
                            "Delta",
                            "Ebonyi",
                            "Edo",
                            "Ekiti",
                            "Enugu",
                            "Gombe",
                            "Imo",
                            "Jigawa",
                            "Kaduna",
                            "Kano",
                            "Katsina",
                            "Kebbi",
                            "Kogi",
                            "Kwara",
                            "Lagos",
                            "Nasarawa",
                            "Niger",
                            "Ogun",
                            "Ondo",
                            "Osun",
                            "Oyo",
                            "Plateu",
                            "Rivers",
                            "Sokoto",
                            "Taraba",
                            "Yobe",
                            "Zamfara",
                          ].map((state) => (
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
        </Tab>
        {/* lost password tab */}
        <Tab
          title={<h5 style={tabTitleStyle}>Lost Password</h5>}
          eventKey="Lost Password"
        >
          <h5 className="mb-5">
            <MdPassword size={25} /> Enter recovery credentials
          </h5>
          <Container>
            {/* pass code request section */}
            <Row className="justify-content-center my-5">
              <Col md="7">
                {/* request passcode accordion */}
                <Accordion>
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
                            ? // ...if valid, off validity, send the query & reset form inputs
                              (setPassCodeValidated(false),
                              e.currentTarget.reset(),
                              requestPassCode({
                                variables: {
                                  email: formData.get("email")?.toString()!,
                                },
                              }))
                            : // ...else prevent submitting & on validity
                              (e.preventDefault(),
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
                          {passCodeLoading && (
                            <Spinner animation="grow" size="sm" />
                          )}{" "}
                          <MdSend /> Submit
                        </Button>
                      </Form>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Col>
            </Row>
            {/* password change section */}
            <Row className="justify-content-center my-5">
              <Col md="7">
                <h4 className="my-5">Change Password</h4>
                <Form
                  data-testid="changePasswordForm"
                  noValidate
                  validated={passwordValidated}
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
                        (setPasswordValidated(false),
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
                        setPasswordValidated(true));
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
                  <Form.FloatingLabel label="Password" className="mb-4">
                    <Form.Control
                      onChange={() => setShowAlert(false)}
                      type="password"
                      minLength={8}
                      aria-label="password"
                      placeholder="Password"
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
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Member;
