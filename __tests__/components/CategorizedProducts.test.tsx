import CategorizedProducts from "@/components/CategorizedProducts";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import config from "../../config";

const productsPage = config.appData.webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "products"
  ),
  category = "ELECTRICALS";
describe("Categorized Product component", () => {
  afterEach(cleanup);
  beforeEach(() =>
    render(
      <MockedProvider mocks={[]}>
        <CategorizedProducts
          products={[
            {
              _id: "1",
              category,
              description: "test product",
              images: [""],
              video: "",
              name: "Test product 1",
              price: 100,
              provider: { title: "test provider" },
              saleCount: 1000,
              tags: ["test tag"],
            },
          ]}
        />
      </MockedProvider>
    )
  );
  it("renders first paragraph without error", () => {
    expect(screen.getByText(productsPage?.parargraphs[0]!)).toBeInTheDocument();
  });
  it("has ALL tab", () => {
    expect(
      screen.getByRole("tab", {
        name: "ALL",
      })
    ).toBeInTheDocument();
  });
  it("has tab for product category", () =>
    expect(screen.getByRole("tab", { name: category })).toBeInTheDocument());
});
