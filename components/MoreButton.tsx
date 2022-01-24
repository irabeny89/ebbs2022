import type { MoreButtonPropType } from "types";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
// load more button component
const MoreButton = ({
  hasLazyFetched,
  fetchMore,
  customFetch,
  variables,
  loading,
  label = "more",
}: MoreButtonPropType) => {
  return (
    <Button
      variant="outline-primary"
      size="sm"
      className="m-3"
      onClick={() =>
        hasLazyFetched.current
          ? fetchMore({
              variables,
            })
          : (customFetch({
              variables,
            }),
            (hasLazyFetched.current = true))
      }
    >
      {loading ? <Spinner animation="grow" size="sm" /> : null} {label}
    </Button>
  );
};

export default MoreButton;
