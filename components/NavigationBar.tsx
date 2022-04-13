import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Link from "next/link";
import config from "config";
import { authPayloadVar } from "@/graphql/reactiveVariables";
import { useReactiveVar } from "@apollo/client";

const { title, webPages } = config.appData;

export default function NavigationBar() {
  const authPayload = useReactiveVar(authPayloadVar);
  return (
    <Row>
      <Col>
        <Navbar collapseOnSelect expand="md">
          <Link passHref href="/">
            <Navbar.Brand
              style={{
                cursor: "pointer",
              }}
            >
              {title}&trade;
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              {/* nav links */}
              {webPages.map((page) =>
                page.pageTitle.toLowerCase() === "dashboard" &&
                !authPayload ? null : (
                  <Link passHref href={page.route} key={page.pageTitle}>
                    <Nav.Link>{page.pageTitle}</Nav.Link>
                  </Link>
                )
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Col>
    </Row>
  );
}
