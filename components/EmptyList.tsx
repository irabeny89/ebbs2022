import { FaList } from "react-icons/fa";

type EmptyListProp = {
  message: string;
};

const EmptyList = ({ message }: EmptyListProp) => (
  <div className="text-center my-4">
    <FaList size={160} />
    <p>{message}</p>
  </div>
);

export default EmptyList;
