import Layout from "@/components/Layout";
import Head from "next/head";
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
import type {
  ChangePasswordVariableType,
  UserLoginVariableType,
  RegisterVariableType,
} from "types";
import {
  accessTokenVar,
  authPayloadVar,
  hasAuthPayloadVar,
} from "@/graphql/reactiveVariables";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import {
  USER_LOGIN,
  USER_PASSWORD_CHANGE,
  USER_REGISTER,
} from "@/graphql/documentNodes";
import { useRouter } from "next/router";
import EmailValidationForm from "@/components/EmailValidationForm";
import { decode } from "jsonwebtoken";
import web3storage from "../web3storage";
import FeedbackToast from "@/components/FeedbackToast";
import AjaxFeedback from "@/components/AjaxFeedback";
// fetch web app meta data
const {
    webPages,
    abbr,
    constants: { AUTH_PAYLOAD },
  } = config.appData,
  // find member page data
  memberPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "member"
  );
// tab title style
const tabTitleStyle = { fontSize: 16 };
// member page component
const MemberPage = () => {
  const router = useRouter(),
    // login form validation state
    [validated, setValidated] = useState(false),
    // register form validation state
    [registerValidated, setRegisterValidated] = useState(false),
    // password form validation state
    [passwordValidated, setPasswordValidated] = useState(false),
    // file size state
    [fileSize, setFileSize] = useState(0),
    // alert state for new user register password comparison
    [show, setShow] = useState(false),
    [showAlert, setShowAlert] = useState(false),
    // feedback toast
    [showToast, setShowToast] = useState(false),
    // login mutation
    [login, { data, loading, error }] = useLazyQuery<
      Record<"login", string>,
      UserLoginVariableType
    >(USER_LOGIN),
    // register mutation
    [
      registerUser,
      { data: registerData, error: registerError, loading: registerLoading },
    ] = useMutation<Record<"register", string>, RegisterVariableType>(
      USER_REGISTER
    ),
    // change password mutation
    [
      changePassword,
      { data: passwordData, error: passwordError, loading: passwordLoading },
    ] = useMutation<
      Record<"changePassword", string>,
      ChangePasswordVariableType
    >(USER_PASSWORD_CHANGE);

  useEffect(() => {
    // update access token on login success & save payload in storage
    data &&
      (localStorage.setItem(AUTH_PAYLOAD, JSON.stringify(decode(data.login))),
      // @ts-ignore
      authPayloadVar(decode(data.login)),
      hasAuthPayloadVar(true),
      accessTokenVar(data.login),
      router.push("/dashboard"));
    // update access token on register success & save payload in storage
    registerData &&
      (localStorage.setItem(
        AUTH_PAYLOAD,
        JSON.stringify(decode(registerData.register))
      ),
      // @ts-ignore
      authPayloadVar(decode(registerData.register)),
      hasAuthPayloadVar(true),
      accessTokenVar(registerData.register),
      router.push("/dashboard"));
  }, [data, registerData, router]);
  return (
    <Layout>
      {/* tab title */}
      <Head>
        <title>
          {abbr} &trade; | {memberPage?.pageTitle}
        </title>
      </Head>
      <Container>
        {/* page title */}
        <Row className="mb-5 h1">
          <Col>
            <MdCardMembership size="40" className="mb-2" />{" "}
            {memberPage?.pageTitle}
          </Col>
        </Row>
        {/* first paragraph */}
        <Row
          as="p"
          className="my-4 text-center justify-content-center display-5"
        >
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
                      // check form validity before submitting...
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
                    {/* login form feedback toast */}
                    <FeedbackToast
                      {...{
                        error,
                        showToast,
                        setShowToast,
                        successText: registerData?.register && "Login successfully. Welcome!",
                      }}
                    />
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
              <Row className="mb-5">
                <Col md="6">
                  <EmailValidationForm />
                </Col>
              </Row>
              {/* basic user registeration form */}
              <Form
                data-testid="registerForm"
                noValidate
                validated={registerValidated}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget),
                    username = formData.get("username")?.toString().trim()!,
                    passCode = formData.get("passCode")?.toString().trim()!,
                    password = formData.get("password")?.toString(),
                    confirmPassword = formData
                      .get("confirmPassword")
                      ?.toString()!,
                    title = formData.get("title")?.toString().trim(),
                    logo = formData.get("logo") as File,
                    description = formData
                      .get("description")
                      ?.toString()
                      .trim(),
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
                      (setRegisterValidated(false),
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
                              ? await web3storage.put([logo])
                              : undefined,
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
                      {passwordLoading && (
                        <Spinner animation="grow" size="sm" />
                      )}{" "}
                      <MdSend /> Submit
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Container>
          </Tab>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default MemberPage;
