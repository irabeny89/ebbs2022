import Image from "next/image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { BiInfoCircle } from "react-icons/bi";
import type { ServiceLabelPropType } from "types";
import { CSSProperties, useState } from "react";
import Link from "next/link";
import getIpfsGateWay from "@/utils/getIpfsGateWay";
import CommentDisplayButton from "./CommentDisplayButton";
import ServiceLikeButton from "./ServiceLikeButton";
import AjaxFeedback from "./AjaxFeedback";
import dynamic from "next/dynamic";

const InfoModal = dynamic(() => import("components/InfoModal"), {
  loading: () => <AjaxFeedback loading />,
});

const styling: { [key: string]: CSSProperties } = {
  smallTextStyle: {
    fontSize: 10,
  },
};

const ServiceLabel = ({
  categories,
  _id,
  title,
  state,
  logoCID,
  description,
  className,
  style,
}: ServiceLabelPropType) => {
  // info modal state
  const [show, setShow] = useState(false);

  return (
    <section {...{ style, className }}>
      <InfoModal {...{ body: description, title, setShow, show }} />
      {/* service label */}
      <Row style={styling.smallTextStyle} className="text-right mb-0 bg-white">
        <Col className="text-nowrap text-truncate">
          {categories!.join(" | ")}{" "}
        </Col>
      </Row>
      <Row className="align-items-center">
        <Col xs="auto" className="pt-2">
          {logoCID && (
            <Image
              alt="logo"
              src={getIpfsGateWay(logoCID)}
              width="50"
              height="50"
              className="rounded-circle"
            />
          )}
        </Col>
        <Link passHref href={`/services/${_id}`}>
          <Col className="text-capitalize" style={{ cursor: "pointer" }}>
            <Row className="h5">{title}</Row>
            <Row style={styling.smallTextStyle}>{state}</Row>
          </Col>
        </Link>
      </Row>
      {/* buttons */}
      <Row>
        <Col>
          <ServiceLikeButton serviceId={_id.toString()} />
        </Col>
        <Col>
          <CommentDisplayButton serviceId={_id.toString()} />
        </Col>
        <Col>
          <Button
            size="sm"
            className="py-0 w-100"
            variant="outline-info"
            aria-label="info button"
            onClick={() => setShow(true)}
          >
            <BiInfoCircle size={18} />
          </Button>
        </Col>
      </Row>
    </section>
  );
};

export default ServiceLabel;
