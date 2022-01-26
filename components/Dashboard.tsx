import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import { MdDashboardCustomize, MdAdd, MdSend } from "react-icons/md";
import {
  CursorConnectionType,
  DashboardPropType,
  OrderVertexType,
  PagingInputType,
  ProductType,
  ProductVertexType,
} from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_NEW_PRODUCT,
  MY_PRODUCTS,
  MY_ORDERS,
  MY_REQUESTS,
} from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import { toastsVar } from "@/graphql/reactiveVariables";
import SortedListWithTabs from "./SortedListWithTabs";
import OrdersOrRequests from "./OrdersOrRequests";
import MoreButton from "./MoreButton";
import { useEffect, useRef, useState } from "react";
import config from "../config";
import ProductList from "./ProductList";

// tab title style
const tabTitleStyle = { fontSize: 16 },
  Dashboard = ({
    info,
    service: { orders, products },
    requests,
  }: DashboardPropType) => {
    // state variable for product creation form
    const [validated, setValidated] = useState(false),
      // image file size state
      [fileSizes, setFileSizes] = useState<number[]>([]),
      // video file size state
      [videoFileSize, setVideoFileSize] = useState<number>(0),
      // product creation form modal state
      [show, setShow] = useState(false);
    // ref mutable object
    const hasLazyFetchedOrders = useRef(false),
      hasLazyFetchedRequests = useRef(false),
      hasLazyFetchedProducts = useRef(false);
    // query more orders
    const [
        getMoreOrders,
        { data: orderData, error: orderError, loading, fetchMore },
      ] = useLazyQuery<
        Record<"myOrders", CursorConnectionType<OrderVertexType>>,
        Record<"orderArgs", PagingInputType>
      >(MY_ORDERS),
      // query more requests
      [
        getMoreRequests,
        {
          data: requestData,
          error: requestError,
          loading: requestLoading,
          fetchMore: fetchMoreRequests,
        },
      ] = useLazyQuery<
        Record<"myRequests", CursorConnectionType<OrderVertexType>>,
        Record<"requestArgs", PagingInputType>
      >(MY_REQUESTS),
      // query more products
      [
        getMoreProducts,
        {
          data: productData,
          error: productError,
          loading: productLoading,
          fetchMore: fetchMoreProducts,
        },
      ] = useLazyQuery<
        Record<"myProducts", CursorConnectionType<ProductVertexType>>,
        Record<"productArgs", PagingInputType>
      >(MY_PRODUCTS),
      // add new product mutation
      [
        addProduct,
        {
          data: newProductData,
          loading: newProductLoading,
          error: newProductError,
        },
      ] = useMutation<
        Record<"newProduct", ProductVertexType>,
        Record<"newProduct", Omit<ProductType, "provider">>
      >(ADD_NEW_PRODUCT);
    // extract orders from edge
    const orderList = (
        orders?.edges?.map((orderEdge) => orderEdge.node) ?? []
      ).concat(
        orderData?.myOrders?.edges?.map((orderEdge) => orderEdge.node) ?? []
      ),
      // extract requests from edge
      requestList = (
        requests?.edges?.map((requestEdge) => requestEdge.node) ?? []
      ).concat(
        requestData?.myRequests?.edges.map((requestEdge) => requestEdge.node) ??
          []
      ),
      // extract products from edge
      productList = (
        products?.edges?.map((productEdge) => productEdge.node) ?? []
      ).concat(
        productData?.myProducts?.edges?.map(
          (productEdge) => productEdge.node
        ) ?? []
      );
    // indicate orders has lazy fetched once
    useEffect(() => {
      orderData && (hasLazyFetchedOrders.current = true);
      orderError &&
        toastsVar([{ header: orderError.name, message: "Something failed!" }]);
    }, [orderError, orderData]);
    // indicate requests has lazy fetched once
    useEffect(() => {
      requestData && (hasLazyFetchedRequests.current = true);
      requestError &&
        toastsVar([
          { header: requestError.name, message: "Something failed!" },
        ]);
    }, [requestData, requestError]);
    // indicate products has lazy fetched once
    useEffect(() => {
      productData && (hasLazyFetchedProducts.current = true);
      productError &&
        toastsVar([
          { header: productError.name, message: "Something failed!" },
        ]);
    }, [productData, productError]);
    // toast when new product is added or when errored
    useEffect(() => {
      newProductData &&
        (setShow(false),
        toastsVar([
          { message: `New product added: ${newProductData.newProduct.name}` },
        ]));
      newProductError &&
        (setShow(false),
        toastsVar([
          { header: newProductError.name, message: "Something failed!" },
        ]));
    }, [newProductData, newProductError]);
    // cleanup state when modal closed
    useEffect(() => {
      return () => {
        setFileSizes([]);
        setVideoFileSize(0);
      };
    }, [show]);

    return (
      <Container>
        {/* product creation modal */}
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton className="h3">
            Add a product...
          </Modal.Header>
          <Modal.Body>
            <Form
              validated={validated}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                // TODO: get cid from web3 storage module after storing the files then store the cid strings
                const newProduct = Array.from(
                  formData.entries() as unknown as any[]
                ).reduce(
                  (prev, entry) =>
                    entry[0] === "tags"
                      ? {
                          ...prev,
                          [entry[0]]: entry[1]
                            .split(" ")
                            .filter((tag: string) => tag !== ""),
                        }
                      : entry[0] === "images"
                      ? { ...prev, [entry[0]]: ["cid"] }
                      : entry[0] === "video"
                      ? { ...prev, [entry[0]]: "cid" }
                      : entry[0] === "price"
                      ? { ...prev, [entry[0]]: +entry[1] }
                      : { ...prev, [entry[0]]: entry[1] },
                  {}
                ) as Omit<ProductType, "provider">;

                e.currentTarget.checkValidity() &&
                fileSizes.length < 4 &&
                fileSizes.find((fileSize) => fileSize < 5e6) &&
                videoFileSize < 1e7
                  ? (e.currentTarget.reset(),
                    setValidated(false),
                    setFileSizes([]),
                    setVideoFileSize(0),
                    addProduct({
                      variables: {
                        newProduct,
                      },
                      refetchQueries: [MY_PRODUCTS],
                    }))
                  : (e.preventDefault(),
                    e.stopPropagation(),
                    setValidated(true));
              }}
            >
              <Form.FloatingLabel label="Product Name">
                <Form.Control
                  placeholder="Product Name"
                  name="name"
                  required
                  aria-label="product name"
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Category" className="my-3">
                <Form.Select
                  placeholder="Category"
                  name="category"
                  aria-label="product category"
                >
                  {config.appData.productCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Price" className="mb-3">
                <Form.Control
                  placeholder="Price"
                  name="price"
                  aria-label="product price"
                  type="number"
                  min={0}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.Text className="text-info">
                Split each tags with space e.g{" "}
                <Badge className="bg-secondary" pill>
                  shoes
                </Badge>{" "}
                <Badge className="bg-secondary" pill>
                  sandals
                </Badge>
              </Form.Text>
              <Form.FloatingLabel label="Tags" className="mb-3">
                <Form.Control
                  placeholder="Tags"
                  name="tags"
                  aria-label="product tags"
                  maxLength={100}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              {/* image file */}
              <Form.Group>
                <Form.Label
                  as="div"
                  className={`${
                    fileSizes.find((fileSize) => fileSize > 5e6) &&
                    "text-danger"
                  } mb-0`}
                >
                  1-3 Images (.jpg, .png & .jpeg - 5MB max each)
                </Form.Label>
                <Form.Text>
                  {!!fileSizes.length &&
                    (fileSizes.length < 4 ? (
                      fileSizes
                        .map((fileSize) =>
                          fileSize > 5e6
                            ? `${getCompactNumberFormat(fileSize).replace(
                                "B",
                                "G"
                              )} \u2717`
                            : `${getCompactNumberFormat(fileSize)} \u2713`
                        )
                        .join(", ")
                    ) : (
                      <small className="text-danger">
                        Select images not more than 3. Atleast 1.
                      </small>
                    ))}
                </Form.Text>
                <Form.Control
                  required
                  multiple
                  type="file"
                  size="lg"
                  placeholder="Image"
                  aria-label="product images"
                  name="images"
                  accept=".jpeg,.jpg,.png"
                  onChange={(e: any) => {
                    setFileSizes(
                      Array.from(e.target.files).map((file: any) => file.size)
                    );
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.Group>
              {/* video file */}
              <Form.Group className="my-3">
                <Form.Label
                  as="div"
                  className={`${videoFileSize > 1e7 && "text-danger"} mb-0`}
                >
                  1 Video (.mp4 - 10MB max)
                </Form.Label>
                <Form.Text>
                  {!!videoFileSize &&
                    (videoFileSize > 1e7
                      ? `${getCompactNumberFormat(videoFileSize).replace(
                          "B",
                          "G"
                        )} \u2717`
                      : `${getCompactNumberFormat(videoFileSize)} \u2713`)}
                </Form.Text>
                {videoFileSize > 1e7 && (
                  <Form.Text className="text-danger">
                    Select a video file less than 10 MB
                  </Form.Text>
                )}
                <Form.Control
                  type="file"
                  size="lg"
                  placeholder="Video"
                  aria-label="product video clip"
                  name="video"
                  accept=".mp4"
                  onChange={(e: any) => {
                    setVideoFileSize(e.target.files[0].size);
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.Group>
              <Form.FloatingLabel label="Description">
                <Form.Control
                  placeholder="Description"
                  name="description"
                  required
                  aria-label="product description"
                  as="textarea"
                  style={{ height: "6rem" }}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Button className="w-100 my-4" type="submit" size="lg">
                {newProductLoading && <Spinner animation="grow" size="sm" />}{" "}
                <MdSend /> Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        {/* title */}
        <Row>
          <Col className="h1 my-5" as="h2">
            <MdDashboardCustomize size={40} /> Dashboard
          </Col>
        </Row>
        {/* first paragraph */}
        <Row>
          <Col as="p" className="display-5 text-center my-5">
            {info}
          </Col>
        </Row>
        {/* dashboard tabs */}
        <Tabs defaultActiveKey="order" className="my-5">
          {/* order tab */}
          <Tab
            eventKey="order"
            title={<h5 style={tabTitleStyle}>Orders</h5>}
            className="my-5"
          >
            {/* list of sorted orders by status */}
            <SortedListWithTabs
              className=""
              ListRenderer={OrdersOrRequests}
              field="status"
              list={orderList}
              rendererProps={{ className: "pt-4 rounded" }}
            />
            {orders?.pageInfo.hasNextPage && (
              <MoreButton
                customFetch={getMoreOrders}
                fetchMore={fetchMore}
                label="Load more"
                loading={loading}
                hasLazyFetched={hasLazyFetchedOrders}
                variables={{
                  orderArgs: {
                    last: 20,
                    before: hasLazyFetchedOrders.current
                      ? orderData?.myOrders.pageInfo.endCursor
                      : orders.pageInfo.endCursor,
                  },
                }}
              />
            )}
          </Tab>
          {/* request tab */}
          <Tab
            eventKey="request"
            title={<h5 style={tabTitleStyle}>Requests</h5>}
            className="my-5"
          >
            {/* list of sorted orders by status */}
            <SortedListWithTabs
              className=""
              ListRenderer={OrdersOrRequests}
              field="status"
              list={requestList}
              rendererProps={{
                className: "pt-4 rounded",
                statuses: ["CANCELED", "DELIVERED"],
              }}
            />
            {requests?.pageInfo.hasNextPage && (
              <MoreButton
                customFetch={getMoreRequests}
                fetchMore={fetchMoreRequests}
                label="Load more"
                loading={requestLoading}
                hasLazyFetched={hasLazyFetchedRequests}
                variables={{
                  requestArgs: {
                    last: 20,
                    before: hasLazyFetchedRequests.current
                      ? requestData?.myRequests.pageInfo.endCursor
                      : requests.pageInfo.endCursor,
                  },
                }}
              />
            )}
          </Tab>
          {/* products tab */}
          <Tab
            eventKey="products"
            title={<h5 style={tabTitleStyle}>Products</h5>}
            className="my-5"
          >
            <Row className="mb-5">
              <Col>
                <Button onClick={() => setShow(true)}>
                  <AjaxFeedback loading={newProductLoading} />{" "}
                  <MdAdd size={25} /> Add Product
                </Button>
              </Col>
            </Row>
            <SortedListWithTabs
              className=""
              ListRenderer={ProductList}
              field="category"
              list={productList}
              rendererProps={{ className: "d-flex flex-wrap pt-4" }}
            />
            {products?.pageInfo.hasNextPage && (
              <MoreButton
                customFetch={getMoreProducts}
                fetchMore={fetchMoreProducts}
                label="Load more"
                loading={productLoading}
                hasLazyFetched={hasLazyFetchedProducts}
                variables={{
                  productArgs: {
                    last: 20,
                    before: hasLazyFetchedProducts.current
                      ? productData?.myProducts.pageInfo.endCursor
                      : products.pageInfo.endCursor,
                  },
                }}
              />
            )}
          </Tab>
          {/* comment tab */}
        </Tabs>
      </Container>
    );
  };

export default Dashboard;
