import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import Tooltip from "react-bootstrap/Tooltip";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { MdInfo } from "react-icons/md";
import { OrdersOrRequestsPropType, StatusType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import getLocalePrice from "@/utils/getLocalePrice";
import { useMutation, useReactiveVar } from "@apollo/client";
import {
  ORDERS_TAB,
  SET_ORDER_DELIVERY_DATE,
  UPDATE_ORDER_ITEM_STATUS,
} from "@/graphql/documentNodes";
import { forwardRef } from "react";
import Link from "next/link";
import { accessTokenVar } from "@/graphql/reactiveVariables";

const getStatusColor = (status: string) =>
  status[0] === "P"
    ? "bg-danger"
    : status[0] === "S"
    ? "bg-primary"
    : status[0] === "C"
    ? "bg-warning"
    : status[0] === "D"
    ? "bg-success"
    : "";

const StatusPopover = forwardRef(function StatusPopover(
  {
    statusOptions,
    handleClick,
    itemId,
    ...rest
  }: {
    statusOptions: StatusType[];
    handleClick: any;
    itemId: string;
    rest?: any;
  },
  ref
) {
  return (
    // @ts-ignore
    <Popover {...rest} ref={ref}>
      <Popover.Header className="text-center bg-dark text-white" as="h5">
        Change Status
      </Popover.Header>
      <Popover.Body>
        {statusOptions.map((status) => (
          <Badge
            key={status}
            pill
            style={{ cursor: "pointer" }}
            className={getStatusColor(status) + " mx-1"}
            onClick={() =>
              handleClick({
                variables: {
                  orderItemStatusArgs: {
                    itemId,
                    status,
                  },
                },
              })
            }
          >
            {status}
          </Badge>
        ))}
      </Popover.Body>
    </Popover>
  );
});

const OrdersOrRequests = ({
  asRequestList,
  items,
  title,
  ...rest
}: OrdersOrRequestsPropType) => {
  // auth payload
  const accessToken = useReactiveVar(accessTokenVar);
  // order status update mutation
  const [setOrderStatus] = useMutation<
      {
        orderStatus: string;
      },
      {
        itemId: string;
        status: StatusType;
      }
    >(UPDATE_ORDER_ITEM_STATUS, {
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      refetchQueries: [ORDERS_TAB],
    }),
    [setOrderDeliveryDate, { loading: deliveryDateLoading }] = useMutation<
      Record<"setOrderDeliveryDate", string>,
      Record<"orderId" | "deliveryDate", string>
    >(SET_ORDER_DELIVERY_DATE, {
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      refetchQueries: [ORDERS_TAB],
    });

  return (
    <Container {...rest}>
      <Row>
        {items.map((order) => (
          <Col md="6" lg="4" className="my-3" key={order._id!.toString()}>
            <Accordion>
              <Accordion.Item
                eventKey={order._id!.toString()}
                className="border-primary border-2"
              >
                <Accordion.Header>
                  <Row>
                    <Row>
                      <Col>
                        <Card.Title>
                          {!asRequestList && order.client.username}{" "}
                          {Object.entries(order.orderStats).map(
                            ([key, value]) =>
                              typeof value === "number" &&
                              !!value && (
                                <Badge
                                  key={key}
                                  className={getStatusColor(key)}
                                  pill
                                >
                                  {value + key[0]}
                                </Badge>
                              )
                          )}{" "}
                          {order?.deliveryDate && (
                            <span>
                              {" "}
                              | ETA:{" "}
                              <Badge
                                pill
                                className={
                                  +order.deliveryDate < Date.now()
                                    ? "bg-danger"
                                    : "bg-primary"
                                }
                              >{`${new Date(
                                +order.deliveryDate
                              ).toDateString()}`}</Badge>
                            </span>
                          )}
                        </Card.Title>
                      </Col>
                    </Row>
                    <Card.Subtitle>
                      Items:{" "}
                      <Badge className="bg-secondary" pill>
                        {getCompactNumberFormat(order.items!.length)}
                      </Badge>{" "}
                      |{" "}
                      <Badge className="bg-dark" pill>
                        {getLocalePrice(order.totalCost!)}
                      </Badge>{" "}
                      |&nbsp;
                      <Badge className="bg-dark" pill>
                        {new Date(+order?.createdAt! || 0).toDateString()}
                      </Badge>
                    </Card.Subtitle>
                  </Row>
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover size="sm" responsive>
                    <thead>
                      <tr>
                        <OverlayTrigger
                          overlay={
                            <Tooltip>
                              Tap the status type below to change to another
                              status type
                            </Tooltip>
                          }
                        >
                          <th>
                            Status <MdInfo />
                          </th>
                        </OverlayTrigger>
                        <th>#</th>
                        <th>Product</th>
                        <th>Provider</th>
                        <th>Price {"\u20a6"}</th>
                        <th>Qty</th>
                        <th>Subtotal {"\u20a6"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, i) => (
                        <tr key={i}>
                          <OverlayTrigger
                            trigger="click"
                            placement="auto"
                            overlay={
                              asRequestList ? (
                                <StatusPopover
                                  itemId={item._id?.toString()!}
                                  handleClick={setOrderStatus}
                                  statusOptions={["CANCELED", "DELIVERED"]}
                                />
                              ) : (
                                <StatusPopover
                                  itemId={item._id?.toString()!}
                                  handleClick={setOrderStatus}
                                  statusOptions={["CANCELED", "SHIPPED"]}
                                />
                              )
                            }
                          >
                            <td style={{ cursor: "pointer" }}>
                              <Badge
                                pill
                                className={getStatusColor(item?.status ?? "")}
                              >
                                {item.status}
                              </Badge>
                            </td>
                          </OverlayTrigger>

                          <td>{++i}</td>
                          <td>{item.name}</td>
                          <td>
                            <Link href={`/services/${item.providerId}`}>
                              {item.providerTitle}
                            </Link>
                          </td>
                          <td>
                            {item.price.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td>{item.quantity}</td>
                          <td>
                            {(item.quantity * item.price).toLocaleString(
                              "en-US",
                              { maximumFractionDigits: 2 }
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td />
                        <td />
                        <td />
                        <td className="h4 text-center py-2">Total: </td>
                        <td colSpan={3} className="h4 text-center py-2">
                          {getLocalePrice(
                            order?.items!.reduce(
                              (acc, item) => acc + item.cost,
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <hr />
                  <h5 className="mt-5">Delivery Details:</h5>
                  <Form.FloatingLabel label="State">
                    <Form.Control
                      placeholder="State"
                      className="my-3"
                      value={order.state}
                      disabled
                    />
                  </Form.FloatingLabel>
                  <Form.FloatingLabel label="Address">
                    <Form.Control
                      placeholder="Address"
                      className="my-3"
                      value={order.address}
                      disabled
                    />
                  </Form.FloatingLabel>
                  <Form.FloatingLabel label="Nearest Bus Stop">
                    <Form.Control
                      value={order.nearestBusStop}
                      className="my-3"
                      disabled
                    />
                  </Form.FloatingLabel>
                  <Form.FloatingLabel label="Phone">
                    <Form.Control
                      className="mb-4"
                      value={order.phone}
                      disabled
                    />
                  </Form.FloatingLabel>
                  <hr />
                  {!asRequestList && (
                    <Row className="my-5">
                      <h5>Set Delivery Date:</h5>
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const deliveryDate = new FormData(
                            e.currentTarget
                          ).get("deliveryDate") as string | null;
                          deliveryDate
                            ? setOrderDeliveryDate({
                                variables: {
                                  deliveryDate,
                                  orderId: order._id?.toString()!,
                                },
                              })
                            : (e.preventDefault(), e.stopPropagation());
                        }}
                      >
                        <Col>
                          <Form.FloatingLabel label="Delivery Date">
                            <Form.Control
                              placeholder="Delivery Date"
                              aria-placeholder="Delivery Date"
                              min={new Date().toLocaleDateString("en-ca")}
                              type="date"
                              name="deliveryDate"
                              defaultValue={
                                new Date(
                                  +order?.deliveryDate!
                                ).toLocaleDateString("en-CA") ?? ""
                              }
                              disabled={order?.items?.every(
                                ({ status }) => status === "DELIVERED"
                              )}
                            />
                          </Form.FloatingLabel>
                        </Col>
                        <Col xs="auto">
                          <Button
                            type="submit"
                            size="lg"
                            variant="outline-primary"
                            className="mt-3 w-100"
                            disabled={order?.items?.every(
                              ({ status }) => status === "DELIVERED"
                            )}
                          >
                            {deliveryDateLoading && (
                              <Spinner animation="grow" size="sm" />
                            )}{" "}
                            Update ETA
                          </Button>
                        </Col>
                      </Form>
                    </Row>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default OrdersOrRequests;
