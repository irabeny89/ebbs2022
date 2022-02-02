import Card from "react-bootstrap/Card";
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
  CommentVertexType,
  CursorConnectionType,
  DashboardPropType,
  OrderVertexType,
  PagingInputType,
  ProductType,
  ProductVertexType,
  ServiceType,
  ServiceUpdateVariableType,
  ServiceVertexType,
} from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_NEW_PRODUCT,
  MY_PRODUCTS,
  MY_ORDERS,
  MY_REQUESTS,
  MY_PROFILE,
  MY_COMMENT,
  MY_SERVICE_UPDATE,
} from "@/graphql/documentNodes";
import AjaxFeedback from "./AjaxFeedback";
import { toastsVar } from "@/graphql/reactiveVariables";
import SortedListWithTabs from "./SortedListWithTabs";
import OrdersOrRequests from "./OrdersOrRequests";
import MoreButton from "./MoreButton";
import { useEffect, useRef, useState } from "react";
import config from "../config";
import ProductList from "./ProductList";
import useAuthPayload from "hooks/useAuthPayload";

// tab title style
const tabTitleStyle = { fontSize: 16 };
// dashboard component
const Dashboard = ({
  info,
  username,
  service: {
    orders,
    products,
    comments,
    _id,
    orderCount,
    productCount,
    commentCount,
    maxProduct,
    categories,
    state,
    title,
    description,
  },
  requests,
  requestCount,
  email,
}: DashboardPropType) => {
  // use auth payload
  const authPayload = useAuthPayload();
  // state variable for form
  const [validated, setValidated] = useState(false),
    // file size state
    [fileSize, setFileSize] = useState(0),
    // image file size state
    [fileSizes, setFileSizes] = useState<number[]>([]),
    // video file size state
    [videoFileSize, setVideoFileSize] = useState(0),
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
    >(MY_ORDERS, {
      variables: {
        orderArgs: {
          last: 20,
          before: orders?.pageInfo.endCursor,
        },
      },
    }),
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
    >(MY_REQUESTS, {
      variables: {
        requestArgs: {
          last: 20,
          before: requests.pageInfo.endCursor,
        },
      },
    }),
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
    >(MY_PRODUCTS, {
      variables: {
        productArgs: {
          last: 20,
          before: products?.pageInfo.endCursor,
        },
      },
    }),
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
    >(ADD_NEW_PRODUCT, { refetchQueries: [MY_PRODUCTS] }),
    // reply comment mutation
    [sendPost, { error: postError }] = useMutation<
      Record<"myComment", CommentVertexType>,
      Record<"serviceId" | "post", string>
    >(MY_COMMENT, {
      refetchQueries: [MY_PROFILE],
    }),
    [
      updateService,
      { error: serviceUpdateError, loading: serviceUpdateLoading },
    ] = useMutation<
      Record<"myServiceUpdate", ServiceVertexType>,
      ServiceUpdateVariableType
    >(MY_SERVICE_UPDATE, {
      refetchQueries: [MY_PROFILE],
    });
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
      productData?.myProducts?.edges?.map((productEdge) => productEdge.node) ??
        []
    ),
    // extract comments from edge and reverse
    commentList =
      comments?.edges?.map((commentEdge) => commentEdge.node).reverse() ?? [];
  // indicate orders has lazy fetched once
  orderData && (hasLazyFetchedOrders.current = true);
  // toast on error
  orderError &&
    toastsVar([{ header: orderError.name, message: "Something failed!" }]);
  // indicate requests has lazy fetched once
  requestData && (hasLazyFetchedRequests.current = true);
  // toast on error
  requestError &&
    toastsVar([{ header: requestError.name, message: "Something failed!" }]);
  // indicate products has lazy fetched once
  productData && (hasLazyFetchedProducts.current = true);
  // toast on error
  productError &&
    toastsVar([{ header: productError.name, message: "Something failed!" }]);
  // toast when new product is added
  newProductData &&
    (setShow(false),
    toastsVar([
      { message: `New product added: ${newProductData.newProduct.name}` },
    ]));
  // toast on error
  newProductError &&
    (setShow(false),
    toastsVar([
      { header: newProductError.name, message: "Something failed!" },
    ]));
  // toast on post error
  postError &&
    toastsVar([
      {
        header: postError.name,
        message: "Something failed!",
      },
    ]);
  // toast on service update error
  serviceUpdateError &&
    toastsVar([
      {
        header: serviceUpdateError.name,
        message: "Something failed!",
      },
    ]);
  // cleanup state when modal closed
  useEffect(() => {
    return () => {
      setFileSizes([]);
      setVideoFileSize(0);
      setValidated(false);
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
                  }))
                : (e.preventDefault(), e.stopPropagation(), setValidated(true));
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
                  fileSizes.find((fileSize) => fileSize > 5e6) && "text-danger"
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
      <Tabs defaultActiveKey="orders" className="my-5">
        {/* orders tab */}
        <Tab
          eventKey="orders"
          title={
            <h5 style={tabTitleStyle}>
              Orders
              <Badge pill className="bg-info">
                {getCompactNumberFormat(orderCount!)}
              </Badge>
            </h5>
          }
          className="my-5"
        >
          {/* list of sorted orders by status */}
          <SortedListWithTabs
            className=""
            ListRenderer={OrdersOrRequests}
            field="status"
            list={orderList}
            rendererProps={{ className: "pt-4 rounded" }}
            tabsVariantStyle="pills"
          />
          {orders?.pageInfo.hasNextPage && (
            <MoreButton
              customFetch={getMoreOrders}
              fetchMore={() =>
                fetchMore({
                  variables: {
                    orderArgs: {
                      last: 20,
                      before: orderData?.myOrders.pageInfo.endCursor,
                    },
                  },
                })
              }
              label="Load more"
              loading={loading}
              hasLazyFetched={hasLazyFetchedOrders}
            />
          )}
        </Tab>
        {/* requests tab */}
        <Tab
          eventKey="requests"
          title={
            <h5 style={tabTitleStyle}>
              Requests
              <Badge pill className="bg-info">
                {getCompactNumberFormat(requestCount)}
              </Badge>
            </h5>
          }
          className="my-5"
        >
          {/* list of sorted orders by status */}
          <SortedListWithTabs
            tabsVariantStyle="pills"
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
              fetchMore={() =>
                fetchMoreRequests({
                  variables: {
                    requestArgs: {
                      last: 20,
                      before: requestData?.myRequests.pageInfo.endCursor,
                    },
                  },
                })
              }
              label="Load more"
              loading={requestLoading}
              hasLazyFetched={hasLazyFetchedRequests}
            />
          )}
        </Tab>
        {/* products tab */}
        <Tab
          eventKey="products"
          title={
            <h5 style={tabTitleStyle}>
              Products
              <Badge pill className="bg-info">
                {getCompactNumberFormat(productCount!)}
              </Badge>
            </h5>
          }
          className="my-5"
        >
          <Row className="mb-5">
            <Col>
              <Button onClick={() => setShow(true)}>
                <AjaxFeedback loading={newProductLoading} /> <MdAdd size={25} />{" "}
                Add Product
              </Button>
            </Col>
          </Row>
          <SortedListWithTabs
            tabsVariantStyle="pills"
            className=""
            ListRenderer={ProductList}
            field="category"
            list={productList}
            rendererProps={{ className: "d-flex flex-wrap pt-4" }}
          />
          {products?.pageInfo.hasNextPage && (
            <MoreButton
              customFetch={getMoreProducts}
              fetchMore={() =>
                fetchMoreProducts({
                  variables: {
                    productArgs: {
                      last: 20,
                      before: productData?.myProducts.pageInfo.endCursor,
                    },
                  },
                })
              }
              label="Load more"
              loading={productLoading}
              hasLazyFetched={hasLazyFetchedProducts}
            />
          )}
        </Tab>
        {/* comments tab */}
        <Tab
          eventKey="comments"
          title={
            <h5 style={tabTitleStyle}>
              Comments
              <Badge pill className="bg-info">
                {getCompactNumberFormat(commentCount!)}
              </Badge>
            </h5>
          }
          className="my-5"
        >
          <Container>
            {commentList.map((comment) => (
              <Row key={comment._id?.toString()} className="justify-content-center">
                <Col lg="7">
                  <Card className="my-3">
                    <Card.Header
                      className={`${
                        authPayload?.username === comment.poster?.username &&
                        "bg-info"
                      }`}
                    >
                      <Card.Title>{comment?.poster?.username}</Card.Title>
                      <Card.Subtitle>{new Date().toUTCString()}</Card.Subtitle>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text>{comment.post}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            ))}
            <Row className="justify-content-center mt-5">
              <Col lg="7">
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const post = new FormData(e.currentTarget).get(
                      "commentReply"
                    ) as string | null;

                    post
                      ? (e.currentTarget.reset(),
                        sendPost({
                          variables: {
                            post,
                            serviceId: _id?.toString()!,
                          },
                        }))
                      : (e.preventDefault(), e.stopPropagation());
                  }}
                >
                  <Form.FloatingLabel label="Reply comments">
                    <Form.Control
                      placeholder="Reply comments"
                      aria-label="comment reply"
                      name="commentReply"
                      as="textarea"
                      style={{ height: "6rem" }}
                    />
                  </Form.FloatingLabel>
                  <Button type="submit" className="w-100 mt-3" size="lg">
                    Send
                  </Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </Tab>
        {/* user profile tab */}
        <Tab
          eventKey="profile"
          title={<h5 style={tabTitleStyle}>Profile</h5>}
          className="my-5"
        >
          <Container>
            <Row className="align-items-center justify-content-between">
              <Col sm="5" className="mb-4">
                <Row>
                  <Col>
                    <h5>Username:</h5>
                  </Col>
                  <Col>
                    <Badge className="bg-secondary h5" pill>
                      {username}
                    </Badge>
                  </Col>
                  <hr />
                </Row>
                <Row>
                  <Col>
                    <h5>Email:</h5>
                  </Col>
                  <Col>
                    <Badge className="bg-secondary h5" pill>
                      {email}
                    </Badge>
                  </Col>
                  <hr />
                </Row>
                <Row>
                  <Col>
                    <h5>Max Products: </h5>
                  </Col>
                  <Col>
                    <Badge>{maxProduct}</Badge>
                  </Col>
                  <hr />
                </Row>
                <Row>
                  <Col>
                    <h5>Current Products: </h5>
                  </Col>
                  <Col>
                    <Badge>{productCount}</Badge>
                  </Col>
                  <hr />
                </Row>
                <h5>Categories: </h5>
                <Row>
                  {categories &&
                    categories.map((category, i) => (
                      <Col xs="auto" key={category + i}>
                        <Badge className="bg-secondary">{category}</Badge>
                      </Col>
                    ))}
                </Row>
                <hr />
              </Col>
              <Col sm="5">
                <Row className="mb-4">
                  <Col className="h4">Update Service:</Col>
                </Row>
                <Form
                  noValidate
                  validated={validated}
                  onSubmit={(e) => {
                    e.preventDefault();

                    const serviceUpdate = Array.from(
                      new FormData(e.currentTarget).entries()
                    ).reduce(
                      (prev, input) => ({
                        ...prev,
                        [input[0]]: input[0] === "logo" ? "cid" : input[1],
                      }),
                      {}
                    ) as Pick<
                      ServiceType,
                      "title" | "description" | "logo" | "state"
                    >;

                    fileSize < 1e6 && e.currentTarget.checkValidity()
                      ? (setValidated(true),
                        updateService({
                          variables: { serviceUpdate },
                        }),
                        e.currentTarget.reset())
                      : (e.preventDefault(),
                        e.stopPropagation(),
                        setValidated(false));
                  }}
                >
                  <Form.Group>
                    <Form.Label
                      className={`${fileSize > 1e6 && "text-danger"}`}
                    >
                      Logo(.jpg, .png & .jpeg - 1MB max){" "}
                      {!!fileSize &&
                        `| ${getCompactNumberFormat(fileSize).replace(
                          "B",
                          "G"
                        )} ${fileSize > 1e6 ? "\u2717" : "\u2713"}`}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      size="lg"
                      placeholder="Service logo"
                      aria-label="serviceLogo"
                      name="logo"
                      accept=".jpeg,.jpg,.png"
                      onChange={(e: any) => {
                        setFileSize(e.target.files[0].size);
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="my-3">
                    <Form.Label>Select state</Form.Label>
                    <Form.Select
                      size="lg"
                      defaultValue={state ?? "Lagos"}
                      name="state"
                    >
                      {[
                        "Abia",
                        "Adamawa",
                        "Akwa Ibom",
                        "Anambra",
                        "Bauchi",
                        "Bayelsa",
                        "Benue",
                        "Borno",
                        "Cross River",
                        "Delta",
                        "Ebonyi",
                        "Edo",
                        "Ekiti",
                        "Enugu",
                        "Gombe",
                        "Imo",
                        "Jigawa",
                        "Kaduna",
                        "Kano",
                        "Katsina",
                        "Kebbi",
                        "Kogi",
                        "Kwara",
                        "Lagos",
                        "Nasarawa",
                        "Niger",
                        "Ogun",
                        "Ondo",
                        "Osun",
                        "Oyo",
                        "Plateu",
                        "Rivers",
                        "Sokoto",
                        "Taraba",
                        "Yobe",
                        "Zamfara",
                      ].map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.FloatingLabel label="Service Name">
                    <Form.Control
                      placeholder="Service name"
                      aria-label="serviceName"
                      defaultValue={title}
                      name="title"
                    />
                  </Form.FloatingLabel>
                  <Form.FloatingLabel
                    label="Service Description"
                    className="mt-3"
                  >
                    <Form.Control
                      defaultValue={description}
                      placeholder="Service Description"
                      aria-label="service Description"
                      name="description"
                      as="textarea"
                      style={{ height: "6rem" }}
                    />
                  </Form.FloatingLabel>
                  <Button size="lg" className="my-5 w-100" type="submit">
                    {serviceUpdateLoading && (
                      <Spinner animation="grow" size="sm" />
                    )}
                    <MdSend /> Submit
                  </Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Dashboard;
