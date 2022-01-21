import { MockedProvider } from "@apollo/client/testing";
import { render, cleanup } from "@testing-library/react";
import ProductCard from "@/components/ProductCard";
import { productProps } from "@/models/mockData";

describe("Product Card Component", () => (
  afterEach(cleanup),
  it("renders product name without error", () => {
    expect(
      render(
        <MockedProvider mocks={[]}>
          <ProductCard {...productProps} />
        </MockedProvider>
      ).getByText(productProps.name)
    );
  })
));
