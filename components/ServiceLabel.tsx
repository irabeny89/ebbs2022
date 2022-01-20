import FormControl from "react-bootstrap/FormControl";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Card from "react-bootstrap/Card";
import Image from "next/image";
import { BiMessageAltDots, BiLike, BiInfoCircle, BiSend } from "react-icons/bi";
import type { ServiceLabelPropType } from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { CSSProperties, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { gql, useMutation } from "@apollo/client";
import AjaxFeedback from "./AjaxFeedback";
import Link from "next/link";
import useAuthPayload from "hooks/useAuthPayload";

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
      [likeOrUnlike, { loading, data }] = useMutation<
        Record<"serviceLiking", "LIKE" | "UNLIKE">,
        {
          serviceId: string;
        }
      >(gql`
        mutation ServiceLiking($serviceId: ID!, $option: LikeOption!) {
          serviceLiking(serviceId: $serviceId,)
        }
      `);

    return _id ? (
      <Container {...{ style, className }}>
        {/* info modal */}
        <Modal centered show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{description}</Modal.Body>
        </Modal>
        {/* comments modal */}
        <Modal show={showComment} onHide={() => setShowComment(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              <BiMessageAltDots /> Comments
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {comments?.edges
              .map((edge) => edge.node)
              .map((comment) => (
                <Card key={comment._id} className="mb-3">
                  <Card.Header>
                    <Card.Title>{comment.poster!.username}</Card.Title>
                    <Card.Subtitle>{comment.createdAt}</Card.Subtitle>
                  </Card.Header>
                  <Card.Body>{comment.post}</Card.Body>
                </Card>
              ))}
            <hr />
            {!!authPayload && (
              <>
                <FloatingLabel label="Enter comment">
                  <FormControl
                    placeholder="Enter text"
                    as="textarea"
                    style={{
                      height: "4rem"
                    }}
                  ></FormControl>
                </FloatingLabel>
                <Button className="w-100 my-2">
                  <BiSend size={18} /> Send
                </Button>
              </>
            )}
          </Modal.Body>
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
              <Row style={styling.smallTextStyle}>
                {state}
              </Row>
            </Col>
          </Link>
        </Row>
        <Row>
          <Col>
            <Button
              disabled={!authPayload}
              size="sm"
              className="py-0 w-100"
              variant={happyClients?.includes(authPayload?.sub!) ? "primary" : "outline-primary"}
              onClick={() => likeOrUnlike({variables: { serviceId: _id }})}
            >
              <BiLike size={18} /> {getCompactNumberFormat(happyClients!.length)}
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
