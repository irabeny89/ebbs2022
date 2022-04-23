import Button from "react-bootstrap/Button";
import { InfoButtonPropsType } from "types";
import { BsInfoLg } from "react-icons/Bs";

export default function InfoButton({ setShow }: InfoButtonPropsType) {
  return (
    <Button
      size="sm"
      className="rounded mx-1 py-0 border-2"
      variant="outline-info"
      onClick={() => setShow(true)}
    >
      <BsInfoLg size={20} />
    </Button>
  );
}
