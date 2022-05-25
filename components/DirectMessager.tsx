import { DirectMessagerPropsType } from "types";
import { BiUserCircle } from "react-icons/bi";
import Card from "react-bootstrap/Card";
import { CSSProperties } from "react";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";

const cardStyle: CSSProperties = {
  cursor: "pointer"
}

export default function DirectMessager({
  unSeenReceivedCount,
  username,
  unSeenSentCount,
}: DirectMessagerPropsType) {
  return (
    <Card className="text-center my-3 py-1" style={cardStyle}>
      <Card.Title>
        <BiUserCircle size={23} color="brown" /> {username}
      </Card.Title>
      <Card.Subtitle>
        <span className="text-danger fs-5">
          &darr; {getCompactNumberFormat(unSeenReceivedCount)}
        </span>{" "}
        | &uarr; {getCompactNumberFormat(unSeenSentCount)}
      </Card.Subtitle>
    </Card>
  );
}
