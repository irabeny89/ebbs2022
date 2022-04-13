import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import config from "config";
import SubFooter from "./SubFooter";

const { title, author } = config.appData;

export default function Footer() {
  return (
    <>
      <Row as="footer" className="bg-secondary text-white py-2">
        <Col className="text-center">
          {author} | {title}&trade; | &copy;2022
        </Col>
      </Row>
      <SubFooter />
    </>
  );
}
