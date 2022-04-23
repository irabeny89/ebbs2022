import Modal from "react-bootstrap/Modal";
import { InfoModalPropsType } from "types";

export default function InfoModal({
  show,
  setShow,
  name,
  description,
}: InfoModalPropsType) {
  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{description}</Modal.Body>
    </Modal>
  );
}
