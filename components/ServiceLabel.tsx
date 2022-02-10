import FormControl from "react-bootstrap/FormControl";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Card from "react-bootstrap/Card";
import Image from "next/image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots, BiLike, BiInfoCircle, BiSend } from "react-icons/bi";
import type { ServiceLabelPropType, ServiceVertexType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { CSSProperties, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import AjaxFeedback from "./AjaxFeedback";
import Link from "next/link";
import useAuthPayload from "hooks/useAuthPayload";
import {
  FEW_PRODUCTS_AND_SERVICES,
  FEW_SERVICES,
  SERVICE_LIKE_TOGGLE,
} from "@/graphql/documentNodes";
import { toastsVar } from "@/graphql/reactiveVariables";

const styling: { [key: string]: CSSProperties } = {
    smallTextStyle: {
      fontSize: 10,
    },
  },
  ServiceLabel = ({
    categories,
    _id,
    title,
    state,
    logo,
    comments,
    commentCount,
    description,
    happyClients,
    likeCount,
    className,
    style,
  }: ServiceLabelPropType) => {
    // info modal state
    const [show, setShow] = useState(false),
      // comment modal state
      [showComment, setShowComment] = useState(false),
      // the auth payload
      authPayload = useAuthPayload(),
      // service liking mutation
      [likeOrUnlike, { loading, data, error }] = useMutation<
        Record<"serviceLiking", ServiceVertexType>,
        Record<"serviceId", string>
      >(SERVICE_LIKE_TOGGLE, {
        variables: { serviceId: _id!.toString() },
        refetchQueries: [FEW_PRODUCTS_AND_SERVICES, FEW_SERVICES],
      });

    useEffect(() => {
      error &&
        toastsVar([
          {
            header: error.name,
            message: "Something failed!",
          },
        ]);
    }, [error]);

    return _id ? (
      <Container {...{ style, className }}>
        {/* service info modal */}
        <Modal centered show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{description}</Modal.Body>
        </Modal>
        {/* comments modal */}
        <Modal
          show={showComment}
          onHide={() => setShowComment(false)}
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <BiMessageAltDots /> Comments
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row>
                {comments?.edges
                  .map((edge) => edge.node)
                  .map((comment) => (
                    <Col key={comment._id.toString()}>
                      <Card className="mb-3">
                        <Card.Header>
                          <Card.Title>{comment.poster!.username}</Card.Title>
                          <Card.Subtitle>{comment.createdAt}</Card.Subtitle>
                        </Card.Header>
                        <Card.Body>{comment.post}</Card.Body>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            {!!authPayload && (
              <>
                <FloatingLabel label="Enter comment">
                  <FormControl
                    placeholder="Enter text"
                    as="textarea"
                    style={{
                      height: "4rem",
                    }}
                  ></FormControl>
                </FloatingLabel>
                <Button className="w-100 my-2">
                  <BiSend size={18} /> Send
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
        {/* service label */}
        <Row
          style={styling.smallTextStyle}
          className="text-right mb-0 bg-white"
        >
          <Col className="text-nowrap text-truncate">
            {categories!.join(" | ")}{" "}
          </Col>
        </Row>
        <Row className="align-items-center">
          <Col xs="auto" className="pt-2">
            <Image
              src="/Ferrari Scuderia Spider.jpg"
              width="50"
              height="50"
              className="rounded-circle"
            />
          </Col>
          <Link href={`/services/${_id}`}>
            <Col
              title={title}
              className="text-capitalize"
              style={{ cursor: "pointer" }}
            >
              <Row className="h5">{title}</Row>
              <Row style={styling.smallTextStyle}>{state}</Row>
            </Col>
          </Link>
        </Row>
        <Row>
          <Col>
            <Button
              disabled={!authPayload}
              size="sm"
              className="py-0 w-100"
              variant={
                happyClients?.includes(authPayload?.sub!)
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() => likeOrUnlike()}
            >
              {loading && <Spinner animation="grow" size="sm" />}
              <BiLike size={18} />{" "}
              {getCompactNumberFormat(
                data?.serviceLiking?.likeCount ?? likeCount!
              )}
            </Button>
          </Col>
          <Col>
            <Button
              size="sm"
              className="py-0 w-100"
              variant="outline-secondary"
              onClick={() => setShowComment(true)}
            >
              <BiMessageAltDots size={18} />{" "}
              {getCompactNumberFormat(commentCount!)}
            </Button>
          </Col>
          <Col>
            <Button
              size="sm"
              className="py-0 w-100"
              variant="outline-info"
              onClick={() => setShow(true)}
            >
              <BiInfoCircle size={18} />
            </Button>
          </Col>
        </Row>
      </Container>
    ) : (
      <AjaxFeedback loading />
    );
  };

export default ServiceLabel;
