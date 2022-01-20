import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import ErrorPage from "@/components/ErrorPage";

const props = {
  title: "Test title",
  message: "Test error message",
};

describe("Error Page Component", () => (
  beforeEach(() =>
    render(
      <MockedProvider mocks={[]}>
        <ErrorPage {...props} />
      </MockedProvider>
    )
  ),
  afterEach(cleanup),
  it("renders error message without crashing", () =>
    expect(screen.getByText(props.message)).toBeInTheDocument())
));
