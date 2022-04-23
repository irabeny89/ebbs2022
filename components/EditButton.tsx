import Button from "react-bootstrap/Button";
import { MdModeEdit } from "react-icons/md";
import { EditButtonPropsType } from "types";

export default function EditButton({
  setShow
}: EditButtonPropsType) {
  return (
      <Button
        size="sm"
        className="rounded mx-1 py-0 border-2"
        variant="outline-dark"
        aria-label="edit button"
        onClick={() => setShow(true)}
      >
        <MdModeEdit size={20} />
      </Button>
  );
}
