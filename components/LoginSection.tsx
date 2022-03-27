import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { MdLogin, MdSend } from "react-icons/md";
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { USER_LOGIN } from "@/graphql/documentNodes";
import type { UserLoginVariableType } from "types";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import config from "../config";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";

const {
  constants: { AUTH_PAYLOAD, CART_ITEMS_KEY },
} = config.appData;
const FeedbackToast = dynamic(() => import("./FeedbackToast"), {
  loading: () => <>loading...</>,
});

export default function LoginSection() {
  const [validated, setValidated] = useState(false),
    // feedback toast
    [showToast, setShowToast] = useState(false),
    router = useRouter(),
    // login mutation
    [login, { data, loading, error }] = useLazyQuery<
      Record<"login", string>,
      UserLoginVariableType
    >(USER_LOGIN);
  useEffect(() => {
    // update access token on login success, filter cart items & save payload in storage
    (async () => {
      const decode = (await import("jsonwebtoken")).decode;
      data &&
        (localStorage.setItem(AUTH_PAYLOAD, JSON.stringify(decode(data.login))),
        localStorage.setItem(
          CART_ITEMS_KEY,
          JSON.stringify(
            getLastCartItemsFromStorage(localStorage).filter(
              // @ts-ignore
              ({ providerId }) => providerId !== decode(data.login)?.serviceId
            )
          )
        ),
        accessTokenVar(data.login),
        router.push("/dashboard"));
    })();
  }, [data, router]);

  return (
    <>
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
                        password: formData.get("password")?.toString() ?? "",
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
                  successText: data?.login && "Login successfully. Welcome!",
                }}
              />
              <Button
                data-testid="loginButton"
                size="lg"
                className="my-5"
                type="submit"
              >
                {loading && <Spinner animation="grow" size="sm" />} <MdSend />{" "}
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}
