import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import Badge from "react-bootstrap/Badge";
import { TabTitlePropsType } from "types";

const tabTitleStyle = { fontSize: 16 };

export default function TabTitle({ countValue }: TabTitlePropsType) {
  return (
    <h5 style={tabTitleStyle}>
      Orders
      <Badge pill className="bg-info">
        {getCompactNumberFormat(countValue)}
      </Badge>
    </h5>
  );
}
