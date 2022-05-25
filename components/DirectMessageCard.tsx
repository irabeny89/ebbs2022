import { DirectMessageCardPropsType } from "types";
import Card from "react-bootstrap/Card";
import { CSSProperties } from "react";
import { BiUserCircle, BiCrown } from "react-icons/bi";
import { authPayloadVar } from "@/graphql/reactiveVariables";
import { useReactiveVar } from "@apollo/client";

const cardStyle: CSSProperties = {
  maxWidth: 500
};

export default function DirectMessageCard({
  message,
  createdAt,
  sender: { _id: userId, username },
}: DirectMessageCardPropsType) {
  const authPayload = useReactiveVar(authPayloadVar);

  return (
    <Card className="shadow" style={cardStyle}>
      <Card.Header>
        <Card.Title className="d-flex justify-content-between text-capitalize">
          <div>
            <BiUserCircle size={20} color="brown" /> {username}
          </div>
          <div>
            {userId === authPayload.sub && <BiCrown color="green" size={25} />}
          </div>
        </Card.Title>
        <Card.Subtitle>{new Date(+createdAt).toUTCString()}</Card.Subtitle>
      </Card.Header>
      <Card.Body>{message}</Card.Body>
    </Card>
  );
}
