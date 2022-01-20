import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import userEvents from "@testing-library/user-event";
import AjaxFeeddback from "@/components/AjaxFeedback";

describe("AjaxFeedback component", () => {
  beforeEach(() =>
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AjaxFeeddback />
      </MockedProvider>
    )
  );
  afterEach(cleanup);
  it("renders without error", () =>
    expect(screen.getByTestId("ajax")).toBeInTheDocument());
  it("shows loading feedback", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AjaxFeeddback loading />
      </MockedProvider>
    );
    expect(screen.getByText(/ebbs/i)).toBeInTheDocument();
  });
  it("renders handles error gracefully", () => {
    const errorMessage = "Oops!";
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <AjaxFeeddback error={new Error(errorMessage)} />
      </MockedProvider>
    );
    expect(screen.getByText("Alert")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
