import type { ProductSectionPropsType } from "types";
import ProductList from "./ProductList";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const ProductSection = ({
  items,
  title = null,
  ...rest
}: ProductSectionPropsType) => (
  <Container fluid {...rest}>
    <Row className="h2">{title}</Row>
    <Row className="py-5 bg-info">
      <ProductList className="d-flex text-black flex-wrap" items={items} />
    </Row>
  </Container>
);

export default ProductSection;
