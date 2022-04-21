import type { MoreButtonPropType } from "types";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
// load more button component
const MoreButton = ({
  hasLazyFetched,
  fetchMore,
  initialFetch,
  loading,
  label = "More",
}: MoreButtonPropType) => {
  return (
    <Button
      size="lg"
      variant="outline-primary"
      className="m-3 border-3"
      onClick={hasLazyFetched ? fetchMore : initialFetch}
    >
      {loading && <Spinner animation="grow" size="sm" />}&nbsp;{label}
    </Button>
  );
};

export default MoreButton;
