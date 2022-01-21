import { MockedProvider } from "@apollo/client/testing";
import { render, cleanup } from "@testing-library/react";
import ProductCard from "@/components/ProductCard";
import { ProductCardPropType } from "types";

const props: ProductCardPropType = {
  _id: "1",
  category: "ELECTRICALS",
  name: "Mockie",
  price: 1e6,
  tags: ["mock", "test", "rtl", "jest"],
  images: ["cid"],
  video: "",
  description: "test product",
  saleCount: 1e2,
  provider: { title: "Ekemode" },
};

describe("Product Card Component", () => (
  afterEach(cleanup),
  it("renders product name without error", () => {
    expect(
      render(
        <MockedProvider mocks={[]}>
          <ProductCard {...props} />
        </MockedProvider>
      ).getByText(props.name)
    );
  })
));
