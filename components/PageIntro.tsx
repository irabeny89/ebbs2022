import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useLazyQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import { LOGOUT } from "@/graphql/documentNodes";
import config from "config";
import { useEffect } from "react";
import router from "next/router";
import { PageIntroPropsType } from "types";

const {
  constants: { AUTH_PAYLOAD },
} = config.appData;

export default function PageIntro({
  pageTitle,
  paragraphs = [],
}: PageIntroPropsType) {
  const authPayload = useReactiveVar(authPayloadVar),
    [logout, { data: logoutData, loading: loggingOut, client }] =
      useLazyQuery<Record<"logout", string>>(LOGOUT);
  // clear states on logout
  useEffect(() => {
    // when logged out clear store, accessTokenVar & redirect to home page
    logoutData &&
      (client.clearStore(),
      accessTokenVar(""),
      localStorage.removeItem(AUTH_PAYLOAD),
      authPayloadVar({}),
      router.push("/"));
  }, [logoutData, client]);

  return (
    <>
      <Row className="justify-content-between align-items-center bg-dark text-white">
        <Col className="my-4" as="h2">
          {pageTitle} {authPayload?.username && <> | {authPayload.username}</>}
        </Col>
        <Col xs="auto">
          {authPayload && (
            <Button
              size="lg"
              variant="outline-danger border-3"
              onClick={() => logout()}
            >
              {loggingOut && <Spinner size="sm" animation="grow" />} Logout
            </Button>
          )}
        </Col>
      </Row>
      <Row className="my-4">
        <Col className="text-center">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </Col>
      </Row>
    </>
  );
}
