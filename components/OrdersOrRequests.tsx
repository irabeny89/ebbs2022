import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Card from "react-bootstrap/Card";
import { OrdersOrRequestsPropType, OrderVertexType, StatusType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import getLocalePrice from "@/utils/getLocalePrice";
import { useMutation } from "@apollo/client";
import { SET_ORDER_STATUS } from "@/graphql/documentNodes";
import { toastsVar } from "@/graphql/reactiveVariables";
import { useEffect } from "react";

const OrdersOrRequests = ({
  items,
  statuses = ["CANCELED", "SHIPPED"],
  ...rest
}: OrdersOrRequestsPropType) => {
  // order status update mutation
  const [setOrderStatus, { data: orderStatusData, error, loading }] =
    useMutation<
      {
        orderStatus: OrderVertexType;
      },
      {
        orderId: string;
        status: StatusType;
      }
    >(SET_ORDER_STATUS);
  // monitor status
  useEffect(() => {
    // show toast when status changed
    orderStatusData &&
      toastsVar(
        new Array({
          message: `order status updated to ${orderStatusData.orderStatus.status}`,
        })
      );
  }, [orderStatusData]);
  // monitor error
  useEffect(() => {
    // show toast when error is thrown
    error &&
      toastsVar(
        new Array({
          message: error?.message,
          header: error.name,
        })
      );
  }, [error]);

  return (
    <Container {...rest}>
      <Row>
        {items.map((order) => (
          <Col md="6" lg="4" className="my-3" key={order._id!.toString()}>
            <Accordion>
              <Accordion.Item eventKey={order._id!.toString()}>
                <Accordion.Header>
                  <Row>
                    <Row>
                      <Col>
                        <Card.Title>{order.client.username}</Card.Title>
                      </Col>
                      <Col xs="auto">
                        <Badge
                          className={
                            order.status === "CANCELED"
                              ? "bg-danger pills"
                              : order.status === "DELIVERED"
                              ? "bg-success pills"
                              : order.status === "PENDING"
                              ? "bg-warning pills"
                              : "primary pills"
                          }
                        >
                          {order.status}
                        </Badge>
                      </Col>
                    </Row>
                    <Card.Subtitle>
                      <Badge className="bg-secondary pills">
                        {getCompactNumberFormat(order.items!.length)}
                      </Badge>{" "}
                      |{" "}
                      <Badge className="bg-dark">
                        {getLocalePrice(order.totalCost!)}
                      </Badge>{" "}
                      | {/* TODO: use order creation date */}
                      <Badge className="bg-dark">
                        {new Date().toDateString()}
                      </Badge>
                    </Card.Subtitle>
                  </Row>
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover size="sm" responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order?.items?.map((item, i) => (
                        <tr key={i}>
                          <td>{++i}</td>
                          <td>{item.name}</td>
                          <td>{getLocalePrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{getLocalePrice(item.quantity * item.price)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td />
                        <td />
                        <td className="h4 text-center py-2">Total: </td>
                        <td colSpan={2} className="h4 text-center py-2">
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
                  <h5 className="my-4">Delivery Details:</h5>
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
                  {/* update only when status is either shipped, pending or canceled */}
                  {["SHIPPED", "PENDING", "CANCELED"].includes(
                    order?.status!
                  ) && (
                    <Card.Footer className="bg-info rounded">
                      <Form
                        onSubmit={(e) => (
                          e.preventDefault(),
                          setOrderStatus({
                            variables: {
                              orderId: order._id!.toString(),
                              status: new FormData(e.currentTarget).get(
                                "status"
                              ) as StatusType,
                            },
                          })
                        )}
                      >
                        <Row className="align-items-center">
                          <Col>
                            <Form.Group>
                              <Form.Label>Select order status</Form.Label>
                              <Form.Select size="lg" name="status">
                                {statuses.map((status) => (
                                  <option key={status}>{status}</option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs="auto">
                            <Button type="submit" disabled={loading}>
                              Update
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Card.Footer>
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
