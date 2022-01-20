import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import EmptyList from "@/components/EmptyList";

const message = "Test empty list message";

describe("Error Page Component", () => (
  afterEach(cleanup),
  beforeEach(() =>
    render(
      <MockedProvider mocks={[]}>
        <EmptyList message={message} />
      </MockedProvider>
    )
  ),
  it("renders props without error", () =>
    expect(screen.getByText(message)).toBeInTheDocument())
));
