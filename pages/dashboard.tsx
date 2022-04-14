import Card from "react-bootstrap/Card";
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
  AuthComponentType,
  PagingInputType,
  ServiceUpdateFormDataType,
  ServiceUpdateVariableType,
  UserVertexType,
} from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import {
  MY_PROFILE,
  MY_COMMENT,
  MY_SERVICE_UPDATE,
} from "@/graphql/documentNodes";
import AjaxFeedback from "@/components/AjaxFeedback";
import SortedListWithTabs from "@/components/SortedListWithTabs";
import OrdersOrRequests from "@/components/OrdersOrRequests";
import ProductList from "@/components/ProductList";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import web3storage from "web3storage";
import Layout from "@/components/Layout";
import getCidMod from "@/utils/getCidMod";
import getIpfsGateWay from "@/utils/getIpfsGateWay";
import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import dynamic from "next/dynamic";
import config from "../config";
import ServiceAlert from "@/components/DashboardServiceAlert";
import PageIntro from "@/components/PageIntro";

const AddProductModal = dynamic(() => import("components/AddProductModal"), {
  loading: () => <>loading...</>,
});

const {
    abbr,
    webPages,
    mediaMaxSize,
    countryStates,
    constants: { AUTH_PAYLOAD },
  } = config.appData,
  // dashboard page data
  dashboardPage = webPages.find(
    ({ pageTitle }) => pageTitle.toLowerCase() === "dashboard"
  ),
  // tab title style
  tabTitleStyle = { fontSize: 16 };

// dashboard component
const DashboardPage: AuthComponentType = () => {
  // use auth payload & access token
  const accessToken = useReactiveVar(accessTokenVar);
  // state variable for form
  const [validated, setValidated] = useState(false),
    // file size state
    [fileSize, setFileSize] = useState(0),
    // product creation form modal state
    [show, setShow] = useState(false),
    // file uploading state
    [uploading, setUploading] = useState(false);
  // query user data
  const {
      data: userData,
      loading: userLoading,
      fetchMore: fetchMoreUserData,
    } = useQuery<
      Record<"me", UserVertexType>,
      Record<
        "productArgs" | "commentArgs" | "orderArgs" | "requestArgs",
        PagingInputType
      >
    >(MY_PROFILE, {
      variables: {
        commentArgs: { last: 50 },
        orderArgs: { last: 20 },
        productArgs: { last: 20 },
        requestArgs: { last: 20 },
      },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    // comment mutation
    [sendPost] = useMutation<
      Record<"myComment", string>,
      Record<"serviceId" | "post", string>
    >(MY_COMMENT, {
      refetchQueries: [MY_PROFILE],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    [updateService, { loading: serviceUpdateLoading }] = useMutation<
      Record<"myServiceUpdate", string>,
      ServiceUpdateVariableType
    >(MY_SERVICE_UPDATE, {
      refetchQueries: [MY_PROFILE],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

  if (userData) {
    const {
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
        likeCount,
        logoCID,
      },
      requests,
      requestCount,
      email,
      createdAt,
    } = userData?.me! as Required<UserVertexType>;

    return (
      <Layout>
        <Head>
          <title>
            {abbr} &trade; | {dashboardPage?.pageTitle}
          </title>
        </Head>
        <AddProductModal {...{ show, setShow }} />
        <PageIntro
          pageTitle={
            <>
              <MdDashboardCustomize size={40} />
              {dashboardPage?.pageTitle}
            </>
          }
          paragraphs={dashboardPage?.parargraphs}
        />
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
            {!!title ? (
              <>
                {/* list of sorted orders by status */}
                <SortedListWithTabs
                  className=""
                  ListRenderer={OrdersOrRequests}
                  field="state"
                  list={orders?.edges.map((edge) => edge.node)!}
                  rendererProps={{
                    className: "pt-4 rounded",
                  }}
                  tabsVariantStyle="pills"
                />
                {orders?.pageInfo.hasNextPage && (
                  <Button
                    onClick={() =>
                      fetchMoreUserData({
                        variables: {
                          orderArgs: {
                            last: 20,
                            before: orders.pageInfo.endCursor,
                          },
                        },
                      })
                    }
                    size="lg"
                  >
                    See more
                  </Button>
                )}
              </>
            ) : (
              <ServiceAlert />
            )}
          </Tab>
          {/* requests tab */}
          <Tab
            eventKey="requests"
            title={
              <h5 style={tabTitleStyle}>
                My Requests
                <Badge pill className="bg-info">
                  {getCompactNumberFormat(requestCount)}
                </Badge>
              </h5>
            }
            className="my-5"
          >
            {/* list of sorted request orders by status */}
            <SortedListWithTabs
              tabsVariantStyle="pills"
              className=""
              ListRenderer={OrdersOrRequests}
              field="state"
              list={requests.edges.map((edge) => edge.node)}
              rendererProps={{
                className: "pt-4 rounded",
                asRequestList: true,
                title,
              }}
            />
            {requests?.pageInfo.hasNextPage && (
              <Button
                size="lg"
                onClick={() =>
                  fetchMoreUserData({
                    variables: {
                      requestArgs: {
                        last: 20,
                        before: requests.pageInfo.endCursor,
                      },
                    },
                  })
                }
              >
                See more
              </Button>
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
            {!!title ? (
              <>
                <Row className="mb-5">
                  <Col>
                    <Button
                      onClick={() => setShow(true)}
                      size="lg"
                      disabled={!title}
                    >
                      <MdAdd size={25} /> Add Product
                    </Button>
                  </Col>
                </Row>
                <SortedListWithTabs
                  tabsVariantStyle="pills"
                  className=""
                  ListRenderer={ProductList}
                  field="category"
                  list={products?.edges.map((edge) => edge.node)!}
                  rendererProps={{ className: "d-flex flex-wrap pt-4" }}
                />
                {products?.pageInfo.hasNextPage && (
                  <Button
                    size="lg"
                    onClick={() =>
                      fetchMoreUserData({
                        variables: {
                          productArgs: {
                            last: 20,
                            before: products.pageInfo.endCursor,
                          },
                        },
                      })
                    }
                  >
                    See more
                  </Button>
                )}
              </>
            ) : (
              <ServiceAlert />
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
            {title ? (
              <Container>
                {comments?.edges.map(({ node: comment }) => (
                  <Row
                    key={comment._id?.toString()}
                    className="justify-content-center"
                  >
                    <Col lg="7">
                      <Card className="my-3">
                        <Card.Header
                          className={`${
                            JSON.parse(localStorage.getItem(AUTH_PAYLOAD)!)
                              ?.username === comment.poster?.username &&
                            "bg-info"
                          }`}
                        >
                          <Card.Title>{comment?.poster?.username}</Card.Title>
                          <Card.Subtitle>
                            {new Date(+comment.createdAt).toDateString()}
                          </Card.Subtitle>
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
            ) : (
              <ServiceAlert />
            )}
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
                  <Row className="justify-content-center mb-5">
                    <Col xs="10">
                      {logoCID && (
                        <Image
                          alt="logo"
                          src={getIpfsGateWay(logoCID)}
                          width="120"
                          height="120"
                          className="rounded-circle"
                        />
                      )}
                    </Col>
                  </Row>
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
                      <h5>Joined since:</h5>
                    </Col>
                    <Col>
                      <Badge className="bg-secondary h5" pill>
                        {new Date(+createdAt).toDateString()}
                      </Badge>
                    </Col>
                    <hr />
                  </Row>
                  <Row>
                    <Col>
                      <h5>Service:</h5>
                    </Col>
                    <Col>
                      <Badge className="bg-secondary h5" pill>
                        {title}
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
                  <Row>
                    <Col>
                      <h5>Likes: </h5>
                    </Col>
                    <Col>
                      <Badge>{likeCount ?? 0}</Badge>
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
                    onSubmit={async (e) => {
                      try {
                        e.preventDefault();
                        const formData = Object.fromEntries(
                          new FormData(e.currentTarget)
                        ) as ServiceUpdateFormDataType;
                        // check validity & file size of media file
                        if (
                          fileSize < mediaMaxSize.logo &&
                          e.currentTarget.checkValidity()
                        ) {
                          setValidated(true);
                          // store file remotely or return undefiend if log is not selected
                          const logoCID =
                            formData?.logo?.name &&
                            (setUploading(true),
                            await getCidMod(web3storage, formData.logo));
                          setUploading(false);
                          // alert & log if logo uploaded
                          logoCID &&
                            console.log("logo file uploaded => CID:", logoCID);
                          // remove logo field; it's not part of gql schema
                          delete formData.logo;
                          updateService({
                            variables: {
                              serviceUpdate: {
                                ...formData,
                                logoCID,
                              },
                            },
                          });
                          // @ts-ignore
                          e.target.reset();
                        } else
                          e.preventDefault(),
                            e.stopPropagation(),
                            setValidated(false);
                      } catch (error) {
                        console.error(error), setUploading(false);
                      }
                    }}
                  >
                    <Form.Group>
                      <Form.Label
                        className={`${
                          fileSize > mediaMaxSize.logo && "text-danger"
                        }`}
                      >
                        Logo(.jpg, .png & .jpeg - 1MB max){" "}
                        {!!fileSize &&
                          `| ${getCompactNumberFormat(fileSize).replace(
                            "B",
                            "G"
                          )} ${
                            fileSize > mediaMaxSize.logo ? "\u2717" : "\u2713"
                          }`}
                      </Form.Label>
                      <Form.Control
                        type="file"
                        size="lg"
                        placeholder="Service logo"
                        aria-label="serviceLogo"
                        name="logo"
                        accept=".jpeg,.jpg,.png"
                        onChange={(e: any) => {
                          setFileSize(e.target?.files[0]?.size ?? 0);
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
                        {countryStates.nigeria.map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.FloatingLabel label="Service Name">
                      <Form.Control
                        placeholder="Service name"
                        aria-label="serviceName"
                        defaultValue={title}
                        name="title"
                        className="text-capitalize"
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
                        style={{ height: "8rem" }}
                      />
                    </Form.FloatingLabel>
                    <Button size="lg" className="my-5 w-100" type="submit">
                      {(serviceUpdateLoading || uploading) && (
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
      </Layout>
    );
  }
  return (
    <Layout>
      <Head>
        <title>
          {abbr} &trade; | {dashboardPage?.pageTitle}
        </title>
      </Head>
      <AjaxFeedback loading={userLoading} />
    </Layout>
  );
};

DashboardPage.audiences = ["user", "admin"];
DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
