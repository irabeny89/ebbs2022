import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Link from "next/link";

const UnAuth = () => (
  <Container>
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <Card.Title>Forbidden!</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text>
              <Link href="/member">Login/register to continue.</Link>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default UnAuth;
