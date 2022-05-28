import { DirectMessagerPropsType } from "types";
import { BiUserCircle } from "react-icons/bi";
import Card from "react-bootstrap/Card";
import { CSSProperties, useState } from "react";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import dynamic from "next/dynamic";

const DirectMessageModal = dynamic(
  () => import("components/DirectMessageModal"),
  { loading: () => <>loading...</> }
);

const cardStyle: CSSProperties = {
  cursor: "pointer",
};

export default function DirectMessager({
  unSeenReceivedCount,
  username,
  unSeenSentCount,
  _id,
}: DirectMessagerPropsType) {
  const [showChats, setShowChats] = useState(false);

  return (
    <>
      <DirectMessageModal
        setShow={setShowChats}
        show={showChats}
        _id={_id}
        username={username}
      />
      <Card
        className="text-center my-2 py-1"
        style={cardStyle}
        onClick={() => setShowChats(true)}
      >
        <Card.Title>
          <BiUserCircle size={23} color="brown" /> {username}
        </Card.Title>
        <Card.Subtitle>
          <span className="text-danger fs-5">
            &darr; {getCompactNumberFormat(unSeenSentCount)}
          </span>{" "}
          | &uarr; {getCompactNumberFormat(unSeenReceivedCount)}
        </Card.Subtitle>
      </Card>
    </>
  );
}
