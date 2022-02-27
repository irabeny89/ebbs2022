import FormControl from "react-bootstrap/FormControl";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import { BiMessageAltDots, BiLike, BiInfoCircle, BiSend } from "react-icons/bi";
import type {
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
import {
  MY_COMMENT,
  MY_FAV_SERVICE,
  SERVICE_LIKE_DATA,
} from "@/graphql/documentNodes";
import { accessTokenVar } from "@/graphql/reactiveVariables";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import web3storage from "web3storage";

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
      // logo state
      [logoSrc, setLogoSrc] = useState(""),
      // comment post text state
      [post, setPost] = useState(""),
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
      // comment posting
      [postComment, { loading: postLoading, data: postData }] = useMutation<
        Record<"myCommentPost", string>,
        Record<"serviceId" | "post", string>
      >(MY_COMMENT, {
        refetchQueries: [SERVICE_LIKE_DATA],
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
        variables: {
          post,
          serviceId: _id?.toString()!,
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
        fetchPolicy: "network-only",
      });
    // useEffect hook to manage rerenders
    useEffect(() => {
      fetch("/api/revalidateHome");
      postData && setPost("");
    }, [postData, likeData]);

    useEffect(() => {
      setAuthPayload(
        JSON.parse(localStorage.getItem(config.appData.constants.AUTH_PAYLOAD)!)
      );
    }, []);
    // set image source states on mount
    useEffect(() => {
      web3storage
        .get(logoCID!)
        .then((res) => res?.files())
        .then((files) => files && setLogoSrc(URL.createObjectURL(files[0])))
        .catch(console.error);
    }, [logoCID]);

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
                {(serviceData?.service?.comments?.edges ?? [])
                  .map((edge) => edge.node)
                  .map((comment) => (
                    <Col key={comment._id.toString()} sm="6">
                      <Card className="mb-3">
                        <Card.Header>
                          <Card.Title>{comment?.poster?.username!}</Card.Title>
                          <Card.Subtitle>
                            {new Date(+comment.createdAt).toDateString()}
                          </Card.Subtitle>
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
              <Col>
                <FloatingLabel label="Enter comment">
                  <FormControl
                    value={post}
                    onChange={(e) => setPost(e.currentTarget.value)}
                    placeholder="Enter text"
                    as="textarea"
                    style={{
                      height: "5rem",
                    }}
                  ></FormControl>
                </FloatingLabel>
                <Button
                  className="w-100 my-2"
                  onClick={() => postComment()}
                  disabled={!post}
                >
                  {postLoading && <Spinner animation="grow" size="sm" />}
                  <BiSend size={18} /> Send
                </Button>
              </Col>
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
              src={logoSrc}
              width="50"
              height="50"
              className="rounded-circle"
            />
          </Col>
          <Link href={`/services/${_id}`}>
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
