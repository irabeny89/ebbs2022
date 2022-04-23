import Button from "react-bootstrap/Button";
import { MdDeleteForever } from "react-icons/md";
import { DeleteButtonPropsType } from "types";

export default function DeleteButton({
  setShow,
}: DeleteButtonPropsType) {
  return (
      <Button
        size="sm"
        className="rounded mx-1 py-0 border-2"
        variant="outline-danger"
        aria-label="delete button"
        onClick={() => setShow(true)}
      >
        <MdDeleteForever size={20} />
      </Button>
  );
}
