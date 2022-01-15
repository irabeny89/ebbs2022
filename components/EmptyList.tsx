import { FaList } from "react-icons/fa";

type EmptyListProp = {
  message: string;
};

const EmptyList = (props: EmptyListProp) => (
  <div className="text-center my-4">
    <FaList size={160} />
    <p>{props.message}</p>
  </div>
);

export default EmptyList;
