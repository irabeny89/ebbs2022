import type { ProductSectionPropsType } from "types";
import ProductList from "./ProductList";
import Row from "react-bootstrap/Row";

const ProductSection = ({
  items,
  title = null,
  ...rest
}: ProductSectionPropsType) => (
  <section {...rest}>
    {title}
    {/* section body */}
    <Row className="py-5 bg-secondary">
      <ProductList className="d-flex text-black flex-wrap" items={items} />
    </Row>
  </section>
);

export default ProductSection;
