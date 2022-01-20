import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import { ProductCardPropType } from "types";
import ProductSection from "./ProductSection";
import config from "../config";

// find products page data
const productsPage = config.appData.webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "products"
  ),
  // categorized products component
  CategorizedProducts = ({
    products,
  }: Record<"products", ProductCardPropType[]>) =>
    products ? (
      <Container>
        {/* first paragraph */}
        <Row
          as="p"
          className="my-4 text-center justify-content-center display-5"
        >
          {productsPage?.parargraphs[0]}
        </Row>
        <Tabs id="category-tabs" defaultActiveKey="ALL">
          {/* render category tabs */}
          {["ALL", ...products.map((item) => item.category!)]
            .reduce(
              (prev: string[], cat) =>
                prev.includes(cat) ? prev : [...prev, cat],
              []
            )
            .map((category) => (
              <Tab title={category} eventKey={category} key={category}>
                {/* omit cursor field meant for pagination */}
                <Row className="bg-danger my-0">
                  <ProductSection
                    className="pt-4 rounded"
                    // render filtered products based on category
                    items={
                      category === "ALL"
                        ? products
                        : products.filter((item) => item.category === category)
                    }
                  />
                </Row>
              </Tab>
            ))}
        </Tabs>
      </Container>
    ) : null;

export default CategorizedProducts;
