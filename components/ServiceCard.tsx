import type { ProductCardPropType, ServiceCardPropType } from "types";
import ProductList from "./ProductList";
import ServiceLabel from "./ServiceLabel";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const ServiceCard = ({
  products: productConnection,
  ...rest
}: ServiceCardPropType) => (
  <Container fluid className="my-4">
    <Row>
      <ServiceLabel {...rest} className="text-dark bg-white mb-1 rounded" />
    </Row>
    <Row>
      <ProductList
        carousel
        items={productConnection?.edges.map((edge) => edge.node) as ProductCardPropType[]}
        className="d-flex flex-wrap"
      />
    </Row>
  </Container>
);

export default ServiceCard;
