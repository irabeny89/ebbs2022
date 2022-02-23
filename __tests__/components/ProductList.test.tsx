import { MockedProvider } from "@apollo/client/testing";
import { render, cleanup } from "@testing-library/react";
import ProductList from "@/components/ProductList";
import { productProps } from "mockData";

const items = [productProps, { ...productProps, _id: "2" }];

describe("Product List Component", () => {
  afterEach(cleanup);
  it("renders product list", () => {
    expect(
      render(
        <MockedProvider mocks={[]}>
          <ProductList items={items} />
        </MockedProvider>
      ).getAllByText(productProps.name)
    ).toHaveLength(2);
  });
});
