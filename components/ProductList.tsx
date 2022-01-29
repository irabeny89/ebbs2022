import type { ProductListPropType } from "types";
import ProductCard from "./ProductCard";
import Carousel from "react-bootstrap/Carousel";
import Button from "react-bootstrap/Button";
import EmptyList from "./EmptyList";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

const ProductList = ({
  items,
  carousel = false,
  ...rest
}: ProductListPropType) =>
  items.length ? (
    carousel ? (
      // carousel product list
      <Container fluid style={{ maxWidth: 325 }}>
        <Carousel
          interval={6e4}
          variant="dark"
          wrap={false}
          nextIcon={
            <Button variant="secondary" size="sm">
              Next Product
            </Button>
          }
          prevIcon={
            <Button variant="secondary" size="sm">
              Prev Product
            </Button>
          }
        >
          {items.map((product) => (
            <Carousel.Item key={product._id}>
              <Row className="text-black">
                <ProductCard {...product} />
              </Row>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    ) : (
      // product list - no carousel
      <Container fluid {...rest}>
        {items.map((product) => (
          <Row className="text-black my-2 mx-auto mx-lg-2" key={product._id}>
            <ProductCard {...product} />
          </Row>
        ))}
      </Container>
    )
  ) : (
    <Container>
      <Row>
        <EmptyList message="No product yet" />
      </Row>
    </Container>
  );

export default ProductList;
