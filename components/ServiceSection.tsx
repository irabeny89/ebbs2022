import { ServiceSectionPropType } from "types";
import ServiceList from "./ServiceList";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const ServiceSection = ({ items, title = null, ...rest }: ServiceSectionPropType) => (
  <Container fluid {...rest}>
    <Row className="h2">
      {title}
    </Row>
    <Row className="py-5 bg-info">
      <ServiceList className="d-flex flex-wrap" items={items} />
    </Row>
  </Container>
);

export default ServiceSection;
