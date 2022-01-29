import { ServiceListPropType } from "types";
import ServiceCard from "./ServiceCard";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const ServiceList = ({ items, ...rest }: ServiceListPropType) => {
  return (
    <Container fluid {...rest}>
      {items.map((service) => (
          <Row key={service._id!.toString()} className="m-auto m-lg-2">
            <ServiceCard {...service} />
          </Row>
        ))}
    </Container>
  );
};

export default ServiceList;
