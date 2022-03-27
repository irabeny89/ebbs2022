import dynamic from "next/dynamic";
import Image from "next/image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots, BiLike, BiInfoCircle } from "react-icons/bi";
import type {
  JwtPayload,
  PagingInputType,
  ServiceLabelPropType,
  ServiceVertexType,
  UserPayloadType,
} from "types";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { CSSProperties, useEffect, useState } from "react";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import AjaxFeedback from "./AjaxFeedback";
import Link from "next/link";
import { MY_FAV_SERVICE, SERVICE_LIKE_DATA } from "@/graphql/documentNodes";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import config from "../config";
import getIpfsGateWay from "@/utils/getIpfsGateWay";

const ServiceCommentModal = dynamic(() => import("./ServiceCommentModal"), {
  loading: () => <>loading...</>,
});

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
    logoCID,
    description,
    className,
    style,
  }: ServiceLabelPropType) => {
    // info modal state
    const [show, setShow] = useState(false),
      [authPayload, setAuthPayload] = useState<UserPayloadType & JwtPayload>(),
      // comment modal state
      [showComment, setShowComment] = useState(false),
      // the auth payload
      accessToken = useReactiveVar(accessTokenVar),
      // query dynamically service like data
      { data: serviceData } = useQuery<
        Record<
          "service",
          Required<
            Pick<
              ServiceVertexType,
              "happyClients" | "likeCount" | "commentCount" | "comments"
            >
          >
        >,
        Record<"serviceId", string> & Record<"commentArgs", PagingInputType>
      >(SERVICE_LIKE_DATA, {
        variables: {
          serviceId: _id?.toString()!,
          commentArgs: {
            last: 20,
          },
        },
      }),
      // service liking mutation
      [likeOrUnlike, { loading, data: likeData }] = useMutation<
        Record<"myFavService", boolean>,
        Record<"serviceId", string> & Record<"isFav", boolean>
      >(MY_FAV_SERVICE, {
        refetchQueries: [SERVICE_LIKE_DATA],
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
        fetchPolicy: "no-cache",
      });
    // useEffect hook to manage rerenders
    useEffect(() => {
      setAuthPayload(
        JSON.parse(localStorage.getItem(config.appData.constants.AUTH_PAYLOAD)!)
      );
    }, []);

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
        <ServiceCommentModal
          {...{
            authPayload,
            edges: serviceData?.service?.comments?.edges,
            favoriteService: likeData?.myFavService,
            serviceId: _id.toString(),
            setShow: setShowComment,
            show: showComment,
          }}
        />
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
        <Row>
          <Col>
            <Button
              disabled={!authPayload}
              size="sm"
              className="py-0 w-100"
              variant={
                serviceData?.service?.happyClients?.includes(authPayload?.sub!)
                  ? "primary"
                  : "outline-primary"
              }
              onClick={() =>
                likeOrUnlike({
                  variables: {
                    serviceId: _id!.toString(),
                    isFav: serviceData?.service?.happyClients?.includes(
                      authPayload?.sub!
                    )
                      ? false
                      : true,
                  },
                })
              }
            >
              {loading && <Spinner animation="grow" size="sm" />}
              <BiLike size={18} />{" "}
              {getCompactNumberFormat(serviceData?.service?.likeCount! ?? 0)}
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
              {getCompactNumberFormat(serviceData?.service?.commentCount! ?? 0)}
            </Button>
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
      </Container>
    ) : (
      <AjaxFeedback loading />
    );
  };

export default ServiceLabel;
