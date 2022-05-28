import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { MdOutlineMessage } from "react-icons/md";
import { useQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { DIRECT_MESSAGERS } from "@/graphql/documentNodes";
import { DirectMessagerType } from "types";
import AjaxFeedback from "./AjaxFeedback";
import DirectMessager from "./DirectMessager";
import { useState } from "react";
import NewDirectMessageModal from "./NewDirectMessageModal";

export default function DirectMessagesSection() {
  const [showNewMessageModal, setNewMessageModal] = useState(false)
  
  const accessToken = useReactiveVar(accessTokenVar);

  const { loading, error, data } = useQuery<
    Record<"directMessagers", DirectMessagerType[]>
  >(DIRECT_MESSAGERS, {
    context: {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return loading ? (
    <AjaxFeedback loading={loading} />
  ) : error ? (
    <AjaxFeedback error={error} />
  ) : (
    <Container>
      <NewDirectMessageModal show={showNewMessageModal} setShow={setNewMessageModal} />
      <Row className="my-5">
        <Col>
          <Button onClick={() => setNewMessageModal(true)}>New Direct Message</Button>
        </Col>
      </Row>
      <Row className="justify-content-center">
        {!!data?.directMessagers.length ? (
          data.directMessagers.map((messager) => (
            <Col sm="6" md="4" key={messager._id as string}>
              <DirectMessager {...messager} />
            </Col>
          ))
        ) : (
          <>
            <MdOutlineMessage size={150} />
            <h4 className="text-center">No message yet</h4>
          </>
        )}
      </Row>
    </Container>
  );
}
