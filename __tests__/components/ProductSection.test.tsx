import { MockedProvider } from "@apollo/client/testing";
import { render, cleanup, screen } from "@testing-library/react";
import ProductSection from "@/components/ProductSection";
import { ProductSectionPropType } from "types";
import { productProps } from "@/models/mockData";

const productSectionProps: ProductSectionPropType = {
  items: [productProps, { ...productProps, _id: "2" }],
  title: "Product Section",
};

describe("Product Section Component", () => {
  afterEach(cleanup);
  it("renders section header and product list", () => {
    render(
      <MockedProvider mocks={[]}>
        <ProductSection {...productSectionProps} />
      </MockedProvider>
    );
    expect(screen.getByText(productSectionProps.title as string));
    expect(screen.getAllByText(productProps.name)).toHaveLength(2);
  });
});
