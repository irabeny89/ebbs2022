import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import config from "config";
import type { AjaxFeedbackProps } from "types";
import Row from "react-bootstrap/Row";

const AjaxFeedback = ({
  loading,
  error,
  text = config.appData.abbr,
  ...rest
}: AjaxFeedbackProps) => {
  return (
    <Container {...rest}>
      {loading && (
        <Row className="justify-content-center">
          <Spinner animation="border" role="status">
            {text}
          </Spinner>
        </Row>
      )}
      {error && (
        <Row>
          <Alert variant="danger">
            <Alert.Heading>Alert</Alert.Heading>
            <hr />
            <Row>{error.message}</Row>
          </Alert>
        </Row>
      )}
    </Container>
  );
};

export default AjaxFeedback;