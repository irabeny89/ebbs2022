import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { SearchResultModalType } from "types";
import SortedListWithTabs from "./SortedListWithTabs";
import ProductList from "./ProductList";
import ServiceList from "./ServiceList";

export default function SearchResultModal({
  setShow,
  show,
  foundProducts,
  productsHasNextPage,
  foundServices,
  servicesHasNextPage,
  productsEndCursor,
  fetchMore,
  searchLoading,
}: SearchResultModalType) {
  return (
    <Modal show={show} onHide={() => setShow(false)} fullscreen>
      <Modal.Header closeButton>
        <Modal.Title>Search result ...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Modal.Title>
          Products Found: {foundProducts.length}
          {productsHasNextPage && "+"}
        </Modal.Title>
        <br />
        <SortedListWithTabs
          ListRenderer={ProductList}
          field="category"
          list={foundProducts}
          rendererProps={{ className: "d-flex flex-wrap" }}
        />
        <Modal.Title className="mt-3">
          Services Found: {foundServices.length}
          {servicesHasNextPage && "+"}
        </Modal.Title>
        <br />
        <SortedListWithTabs
          ListRenderer={ServiceList}
          field="state"
          list={foundServices}
          rendererProps={{ className: "d-flex flex-wrap" }}
        />
      </Modal.Body>
      <Modal.Footer>
        {(productsHasNextPage || servicesHasNextPage) && (
          <Button
            size="lg"
            variant="outline-info"
            onClick={() =>
              fetchMore({
                variables: {
                  args: {
                    first: 20,
                    after: productsEndCursor,
                  },
                },
              })
            }
          >
            {searchLoading && <Spinner animation="grow" size="sm" />} Load more
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
