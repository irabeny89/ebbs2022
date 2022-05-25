import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useQuery, useReactiveVar } from "@apollo/client";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import { DIRECT_MESSAGERS } from "@/graphql/documentNodes";
import { DirectMessagerType } from "types";
import AjaxFeedback from "./AjaxFeedback";
import DirectMessager from "./DirectMessager";

export default function DirectMessagesSection() {
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
      <Row className="justify-content-center">
        {data?.directMessagers.map((messager) => (
          <Col sm="6" md="4">
            <DirectMessager key={messager._id as string} {...messager} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
