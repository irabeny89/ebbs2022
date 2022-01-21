import { MockedProvider } from "@apollo/client/testing";
import { render, screen, cleanup } from "@testing-library/react";
import MoreButton from "@/components/MoreButton";

const label = "More";

describe("More Button Component", () => {
  afterEach(cleanup);

  it("renders label", () => {
    render(
      <MockedProvider mocks={[]}>
        <MoreButton
          customFetch={() => {}}
          fetchMore={() => {}}
          hasLazyFetched={{ current: false }}
          label={label}
          loading={false}
          variables={{}}
        />
      </MockedProvider>
    );

    expect(
      screen.getByRole("button", {
        name: label,
      })
    );
  });
  it("gives loading feedback", () => {
    render(
      <MockedProvider mocks={[]}>
        <MoreButton
          customFetch={() => {}}
          fetchMore={() => {}}
          hasLazyFetched={{ current: false }}
          label={label}
          loading={true}
          variables={{}}
        />
      </MockedProvider>
    );
    screen.debug();
    expect(
      screen.getByRole("button", {
        name: label,
      }).firstChild
    ).toHaveAttribute("class", "spinner-grow spinner-grow-sm");
  });
});
