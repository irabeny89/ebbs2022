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
import Layout from "@/components/Layout";
import config from "config";
import Head from "next/head";
import { useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { ServiceType, TokenPairType, UserType } from "types";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import AjaxFeedback from "@/components/AjaxFeedback";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";

// fetch web app meta data
const { webPages, abbr } = config.appData,
  // find home page data
  memberPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "member"
  ),
  // tab title style
  tabTitleStyle = { fontSize: 16 },
  // member page - login, register & password revocery
  Member = () => {
    // form validation ref
    const [validated, setValidated] = useState(false),
      // file size state
      [fileSize, setFileSize] = useState(0),
      // alert state for new user register password comparison
      [show, setShow] = useState(false),
      [showAlert, setShowAlert] = useState(false),
      // login mutation
      [login, { data, error, loading }] = useLazyQuery<
        {
          login: TokenPairType;
        },
        {
          email: string;
          password: string;
        }
      >(gql`
        query UserLogin($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            accessToken
          }
        }
      `),
      // register mutation
      [
        registerUser,
        { data: registerData, error: registerError, loading: registerLoading },
      ] = useMutation<
        {
          userRegister: TokenPairType;
        },
        {
          userRegisterInput: Pick<UserType, "username" | "email" | "password"> &
            Partial<
              Pick<ServiceType, "title" | "logo" | "description" | "state">
            >;
        }
      >(gql`
        mutation UserRegister($userRegisterInput: UserRegisterInput!) {
          userRegister(userRegisterInput: $userRegisterInput) {
            accessToken
          }
        }
      `),
      // passcode request mutation
      [
        requestPassCode,
        { data: passCodeData, error: passCodeError, loading: passCodeLoading },
      ] = useMutation<{ requestPassCode: string }, { email: string }>(gql`
        mutation RequestPassCode($email: String!) {
          requestPassCode(email: $email)
        }
      `),
      [
        changePassword,
        { data: passwordData, error: passwordError, loading: passwordLoading },
      ] = useMutation<
        { changePassword: TokenPairType },
        { passCode: string; newPassword: string }
      >(gql`
        mutation PasswordChange($passCode: String!, $newPassword: String!) {
          changePassword(passCode: $passCode, newPassword: $newPassword) {
            accessToken
          }
        }
      `);
    // update access token on login
    useEffect(() => {
      accessTokenVar(data?.login?.accessToken ?? "");
    }, [data]);
    // update access token on register
    useEffect(() => {
      accessTokenVar(registerData?.userRegister?.accessToken ?? "");
    }, [registerData]);

    return (
      <Layout>
        {/* tab title */}
        <Head>
          <title>
            {abbr} &trade; | {memberPage?.pageTitle}
          </title>
        </Head>
        {/* member page body */}
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
                    <AjaxFeedback error={error} loading={loading} />
                    {/* login form */}
                    <Form
                      noValidate
                      validated={validated}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        // check form validity without submitting...
                        e.currentTarget.checkValidity()
                          ? // ...if valid, off validity, send the query & reset form inputs
                            (setValidated(false),
                            e.currentTarget.reset(),
                            login({
                              variables: {
                                email: formData.get("email")?.toString() ?? "",
                                password:
                                  formData.get("password")?.toString() ?? "",
                              },
                            }))
                          : // ...else prevent submitting & on validity
                            (e.preventDefault(),
                            e.stopPropagation(),
                            setValidated(true));
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
                          autoFocus
                        />
                        <Form.Control.Feedback type="invalid">
                          This field is required!
                        </Form.Control.Feedback>
                      </Form.FloatingLabel>
                      <small className="text-info">
                        Password should be 8 or more characters
                      </small>
                      <Form.FloatingLabel label="Password">
                        <Form.Control
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
                      <Button size="lg" className="my-5" type="submit">
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
              <AjaxFeedback error={registerError} loading={registerLoading} />
              {/* new user register form */}
              <Form
                noValidate
                validated={validated}
                onSubmit={async (e) => {
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
                      (setValidated(false),
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
                      setValidated(true));
                }}
              >
                <Row>
                  <Col md="6" className="mb-3">
                    <Form.FloatingLabel label="Username">
                      <Form.Control
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
                    <small className="text-info">
                      Password should be 8 or more characters
                    </small>
                    <Form.FloatingLabel label="Password">
                      <Form.Control
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
                        <Form.Group>
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
                      </Col>
                      <Col md="6">
                        <Form.Group>
                          <Form.Label>Select state</Form.Label>
                          <Form.Select size="lg" name="state">
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
                              <option
                                key={state}
                                value={state}
                                selected={state === "Lagos"}
                              >
                                {state}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-4">
                      <Col md="6">
                        <Form.FloatingLabel label="Service Name">
                          <Form.Control
                            placeholder="Service name"
                            aria-label="serviceName"
                            name="title"
                          />
                          <Form.Control.Feedback type="invalid">
                            This field is required!
                          </Form.Control.Feedback>
                        </Form.FloatingLabel>
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion>
                <Button size="lg" className="my-5" type="submit">
                  <MdSend /> Submit
                </Button>
              </Form>
            </Tab>
            {/* lost password section */}
            <Tab
              title={<h5 style={tabTitleStyle}>Lost Password</h5>}
              eventKey="Lost Password"
            >
              <h5 className="mb-5">
                <MdPassword size={25} /> Enter recovery credentials
              </h5>
              <AjaxFeedback error={registerError} loading={registerLoading} />
              <Container>
                {/* pass code request section */}
                <Row className="justify-content-center my-5">
                  <Col md="7">
                    <AjaxFeedback
                      error={passCodeError}
                      loading={passCodeLoading}
                    />
                    {passCodeData && (
                      <Alert variant="success">
                        {passCodeData.requestPassCode}
                      </Alert>
                    )}
                    {/* request passcode accordion */}
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Request Passcode</Accordion.Header>
                        <Accordion.Body>
                          <Form
                            noValidate
                            validated={validated}
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              // check form validity before sending
                              e.currentTarget.checkValidity()
                                ? // ...if valid, off validity, send the query & reset form inputs
                                  (setValidated(false),
                                  e.currentTarget.reset(),
                                  requestPassCode({
                                    variables: {
                                      email: formData.get("email")?.toString()!,
                                    },
                                  }))
                                : // ...else prevent submitting & on validity
                                  (e.preventDefault(),
                                  e.stopPropagation(),
                                  setValidated(true));
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
                              />
                              <Form.Control.Feedback type="invalid">
                                This field is required!
                              </Form.Control.Feedback>
                            </Form.FloatingLabel>
                            <Button size="lg" className="mt-5" type="submit">
                              <MdSend /> Send
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
                    <AjaxFeedback
                      error={passwordError}
                      loading={passwordLoading}
                    />
                    <h4 className="my-5">Change Password</h4>
                    <Form
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
                      <small className="text-info">
                        Password should be 8 or more characters
                      </small>
                      <Form.FloatingLabel label="Password" className="mb-4">
                        <Form.Control
                          onChange={() => setShowAlert(false)}
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
                      <Form.FloatingLabel label="Confirm Password">
                        <Form.Control
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
                      <Button size="lg" className="my-5" type="submit">
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

export default Member;