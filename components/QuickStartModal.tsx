import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { MdHowToReg } from "react-icons/md";
import { FaTelegram } from "react-icons/fa";
import { QuickStartModalPropType } from "types";

const QuickStartModal = ({
  show,
  setShow,
  features,
  link,
}: QuickStartModalPropType) => (
  <Modal show={show} onHide={() => setShow(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Quick Start</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <h3>Features:</h3>
      <ul>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <Row>
        <Col>
          <Button as="a" variant="outline-secondary" href="/about#new">
            How to get started <MdHowToReg size={30} />
          </Button>
        </Col>
        <Col>
          <Button as="a" variant="outline-primary" href={link}>
            Telegram group <FaTelegram size={30} color="#197acf" />
          </Button>
        </Col>
      </Row>
    </Modal.Footer>
  </Modal>
);

export default QuickStartModal;
