import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useReactiveVar } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import {
  accessTokenVar,
  authPayloadVar,
  cartItemsVar,
} from "@/graphql/reactiveVariables";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import { MY_PROFILE, SERVICE_ORDER } from "@/graphql/documentNodes";
import { DeliveryFormType, OrderType } from "types";
import countCartItems from "@/utils/countCartItems";
import { FaFirstOrder, FaTrash } from "react-icons/fa";
import config from "config";
import Link from "next/link";

const {
  constants: { CART_ITEMS_KEY },
  countryStates,
} = config.appData;

export default function DeliveryForm({ children }: DeliveryFormType) {
  const cartItems = useReactiveVar(cartItemsVar),
    // form validation state
    [validated, setValidated] = useState(false),
    authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    // send request mutation
    [sendRequest, { data, loading }] = useMutation<
      Record<"serviceOrder", string>,
      Record<
        "serviceOrderInput",
        Pick<
          OrderType,
          "items" | "phone" | "state" | "address" | "nearestBusStop"
        >
      >
    >(SERVICE_ORDER, {
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      refetchQueries: [MY_PROFILE],
    }),
    handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      // check form validity
      e.currentTarget.checkValidity()
        ? (setValidated(false),
          e.currentTarget.reset(),
          sendRequest({
            variables: {
              serviceOrderInput: {
                address: formData.get("address")?.toString()!,
                items: getLastCartItemsFromStorage(localStorage),
                nearestBusStop: formData.get("nearestBusStop")?.toString()!,
                phone: formData.get("phone")?.toString()!,
                state: formData.get("state")?.toString()!,
              },
            },
          }))
        : (e.preventDefault(), e.stopPropagation(), setValidated(true));
    };
  // clear order alert after some time
  useEffect(() => {
    setTimeout(() => {
      if (data) data.serviceOrder = "";
    }, 3000);
  }, [data]);

  return (
    <>
      {data?.serviceOrder && (
        <Alert>
          <Alert.Heading>{data.serviceOrder}</Alert.Heading>
          Go to{" "}
          <Link href="/dashboard" passHref>
            <Alert.Link>dashboard</Alert.Link>
          </Link>{" "}
          to see your requests.
        </Alert>
      )}
      {children}
      {/* delivery details */}
      {authPayload && !!cartItems?.length && (
        <Row>
          <Col>
            <h4 className="my-5">Delivery Details: </h4>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Select state</Form.Label>
                <Form.Select size="lg" name="state" disabled={!authPayload}>
                  {countryStates.nigeria.map((state) => (
                    <option
                      key={state}
                      value={state}
                      selected={state === "Lagos"}
                    >
                      {state}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.Group>
              <Form.FloatingLabel label="Address">
                <Form.Control
                  placeholder="Address"
                  aria-label="address"
                  name="address"
                  required
                  className="my-3"
                  disabled={!authPayload}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Nearest Bus Stop">
                <Form.Control
                  placeholder="Nearest Bus Stop"
                  aria-label="nearest bus stop"
                  name="nearestBusStop"
                  required
                  className="my-3"
                  disabled={!authPayload}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              <Form.FloatingLabel label="Phone">
                <Form.Control
                  placeholder="Phone"
                  aria-label="phone"
                  name="phone"
                  type="phone"
                  required
                  className="mb-4"
                  disabled={!authPayload}
                />
                <Form.Control.Feedback type="invalid">
                  This field is required!
                </Form.Control.Feedback>
              </Form.FloatingLabel>
              {!!countCartItems(cartItems) && (
                <Modal.Footer>
                  <Button
                    size="lg"
                    variant="danger"
                    // on click, clear cart data from storage & memory
                    onClick={() => (
                      localStorage.removeItem(CART_ITEMS_KEY), cartItemsVar([])
                    )}
                  >
                    <FaTrash size={20} className="mb-1" /> Clear cart
                  </Button>
                  {authPayload && (
                    <Button variant="success" size="lg" type="submit">
                      <FaFirstOrder size={20} className="mb-1" />
                      {loading && <Spinner animation="grow" size="sm" />} Send
                      request
                    </Button>
                  )}
                </Modal.Footer>
              )}
            </Form>
          </Col>
        </Row>
      )}
    </>
  );
}
