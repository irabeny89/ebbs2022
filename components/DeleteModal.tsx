import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { DeleteModalPropsType } from "types";
export default function DeleteModal({
  setShow,
  show,
  handleDelete,
  name,
  deleteLoading,
}: DeleteModalPropsType) {
  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Dialog className="m-0">
        <Modal.Header className="h3 bg-warning">
          Delete{" "}
          <Badge className="bg-secondary" pill>
            {name}
          </Badge>
          ?
        </Modal.Header>
        <Modal.Body>This cannot be undone. Are you sure?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleDelete()}>
            {deleteLoading && <Spinner animation="grow" size="sm" />}Delete
          </Button>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal>
  );
}
