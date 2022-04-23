import Modal from "react-bootstrap/Modal";
import { InfoModalPropsType } from "types";

export default function InfoModal({
  show,
  setShow,
  title,
  body,
}: InfoModalPropsType) {
  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
    </Modal>
  );
}
