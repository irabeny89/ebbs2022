import Layout from "@/components/Layout";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import userEvents from "@testing-library/user-event"

describe("Layout component", () => {
  screen.debug();
  beforeEach(() =>
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <Layout>Test</Layout>
      </MockedProvider>
    )
  );
  afterAll(cleanup);
  it("renders without error", () => {
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });
  it("has a link to member page", () => {
    expect(
      screen.getByRole("link", {
        name: "login here",
      })
    ).toHaveAttribute("href", "/member");
  });
  it("cart button renders a cart modal when clicked", () => {
    const cartButton = screen.getByTestId("cartButton")
    userEvents.click(cartButton)
    expect(screen.getByText(/Cart Items/)).toBeInTheDocument()
  })
});
