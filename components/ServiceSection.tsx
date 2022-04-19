import { ServiceSectionPropType } from "types";
import ServiceList from "./ServiceList";
import Row from "react-bootstrap/Row";
import EmptyList from "./EmptyList";

const ServiceSection = ({
  items,
  title = null,
  ...rest
}: ServiceSectionPropType) => (
  <section {...rest}>
    {title}
    {/* section body */}
    <Row className="py-5 bg-secondary">
      {!!items.length ? (
        <ServiceList className="d-flex flex-wrap" items={items} />
      ) : (
        <EmptyList message="No service yet" />
      )}
    </Row>
  </section>
);

export default ServiceSection;
