import Button from "react-bootstrap/Button";
import { InfoButtonPropsType } from "types";
import { MdInfoOutline } from "react-icons/md";

export default function InfoButton({ setShow }: InfoButtonPropsType) {
  return (
    <Button
      size="sm"
      className="rounded mx-1 py-0 border-2"
      variant="outline-info"
      onClick={() => setShow(true)}
    >
      <MdInfoOutline size={20} />
    </Button>
  );
}
