import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import config from "../config";
import type { AjaxFeedbackProps } from "types";
import Row from "react-bootstrap/Row";

const AjaxFeedback = ({
  loading,
  error,
  successText,
  text = config.appData.abbr,
  ...rest
}: AjaxFeedbackProps) => {
  return (
    <Container {...rest} data-testid="ajax">
      {loading && (
        <Row className="justify-content-center">
          <Spinner animation="border" role="status" size="sm">
            {text}
          </Spinner>
        </Row>
      )}
      {(error || successText) && (
        <Row>
          <Alert variant={successText ? "success" : "danger"}>
            <Alert.Heading>Alert</Alert.Heading>
            <hr />
            <Row>{error?.message || successText}</Row>
          </Alert>
        </Row>
      )}
    </Container>
  );
};

export default AjaxFeedback;
