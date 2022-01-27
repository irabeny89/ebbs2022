import type { MoreButtonPropType } from "types";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
// load more button component
const MoreButton = ({
  hasLazyFetched,
  fetchMore,
  customFetch,
  loading,
  label = "more",
}: MoreButtonPropType) => {
  return (
    <Button
      variant="outline-primary"
      className="m-3"
      onClick={() =>
        hasLazyFetched.current
          ? fetchMore()
          : (customFetch(),
            (hasLazyFetched.current = true))
      }
    >
      {loading ? <Spinner animation="grow" size="sm" /> : null} {label}
    </Button>
  );
};

export default MoreButton;
