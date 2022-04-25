import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import { BiUserCircle } from "react-icons/bi";
import { useReactiveVar } from "@apollo/client";
import { authPayloadVar } from "@/graphql/reactiveVariables";

export default function PostCard({
  serviceId,
  username,
  userServiceId,
  createdAt,
  post,
}: Record<
  "serviceId" | "username" | "userServiceId" | "createdAt" | "post",
  string
>) {
  const authPayload = useReactiveVar(authPayloadVar);
  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title
          className={`${
            serviceId === authPayload.serviceId && "text-primary"
          } d-flex justify-content-between`}
        >
          <div>
            <BiUserCircle
              color={`${serviceId === authPayload.serviceId && "blue"}`}
              size={30}
              className="px-1"
            />
            {username}
          </div>
          <div>{userServiceId === serviceId && <Badge pill>Owner</Badge>}</div>
        </Card.Title>
        <Card.Subtitle>{new Date(+createdAt).toDateString()}</Card.Subtitle>
      </Card.Header>
      <Card.Body>{post}</Card.Body>
    </Card>
  );
}
