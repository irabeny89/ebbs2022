import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Link from "next/link";

const UnAuth = () => (
  <Container>
    <Row className="justify-content-center">
      <Col sm="auto">
        <Card>
          <Card.Header className="bg-danger text-white">
            <Card.Title className="display-1">Forbidden!</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Text className="h5">
              <Link href="/member">Login/register to continue.</Link>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default UnAuth;
