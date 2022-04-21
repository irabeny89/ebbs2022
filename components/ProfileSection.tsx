import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import {
  ServiceUpdateFormDataType,
  ServiceUpdateVariableType,
  UserVertexType,
} from "types";
import Image from "next/image";
import getIpfsGateWay from "@/utils/getIpfsGateWay";
import { FormEvent, useState } from "react";
import config from "config";
import getCidMod from "@/utils/getCidMod";
import web3storage from "../web3storage";
import { useMutation, useReactiveVar, useQuery } from "@apollo/client";
import {
  COMMENTS_TAB,
  FEW_PRODUCTS,
  FEW_PRODUCTS_AND_SERVICES,
  FEW_SERVICES,
  MY_PROFILE,
  MY_SERVICE_UPDATE,
  ORDERS_TAB,
  PROFILE_TAB,
} from "@/graphql/documentNodes";
import { accessTokenVar, authPayloadVar } from "@/graphql/reactiveVariables";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";
import { MdSend } from "react-icons/md";
import AjaxFeedback from "./AjaxFeedback";

const { mediaMaxSize, countryStates } = config.appData;

export default function ProfileSection() {
  const [validated, setValidated] = useState(false),
    [fileSize, setFileSize] = useState(0),
    [uploading, setUploading] = useState(false),
    authPayload = useReactiveVar(authPayloadVar),
    accessToken = useReactiveVar(accessTokenVar),
    { data, loading, error } = useQuery<Record<"me", UserVertexType>>(
      PROFILE_TAB,
      {
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      }
    ),
    [updateService, { loading: serviceUpdateLoading }] = useMutation<
      Record<"myServiceUpdate", string>,
      ServiceUpdateVariableType
    >(MY_SERVICE_UPDATE, {
      refetchQueries: [
        PROFILE_TAB,
        COMMENTS_TAB,
        ORDERS_TAB,
        FEW_PRODUCTS_AND_SERVICES,
        FEW_PRODUCTS,
        FEW_SERVICES,
      ],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    }),
    handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        const formData = Object.fromEntries(
          new FormData(e.currentTarget)
        ) as ServiceUpdateFormDataType;
        // check validity & file size of media file
        if (fileSize < mediaMaxSize.logo && e.currentTarget.checkValidity()) {
          setValidated(true);
          // store file remotely or return undefiend if log is not selected
          const logoCID =
            formData?.logo?.name &&
            (!!process.env.NEXT_PUBLIC_OFFLINE!
              ? "/vercel.svg"
              : (setUploading(true),
                await getCidMod(web3storage, formData.logo)));
          setUploading(false);
          // alert & log if logo uploaded
          logoCID && console.log("logo file uploaded => CID:", logoCID);
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
        } else e.preventDefault(), e.stopPropagation(), setValidated(false);
      } catch (error) {
        console.error(error), setUploading(false);
      }
    };
  return loading ? (
    <AjaxFeedback loading={loading} error={error} />
  ) : (
    <Row className="align-items-center justify-content-between">
      <Col sm="5" className="mb-4">
        <Row className="justify-content-center mb-5">
          <Col xs="10">
            {data?.me?.service?.logoCID && (
              <Image
                alt="logo"
                src={getIpfsGateWay(data?.me?.service?.logoCID)}
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
              {authPayload?.username}
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
              {data?.me?.createdAt &&
                new Date(+data?.me?.createdAt).toDateString()}
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
              {data?.me?.service?.title}
            </Badge>
          </Col>
          <hr />
        </Row>
        <Row>
          <Col>
            <h5>Created Service:</h5>
          </Col>
          <Col>
            <Badge className="bg-secondary h5" pill>
              {data?.me?.service?.createdAt &&
                new Date(+data?.me?.service?.createdAt).toDateString()}
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
              {data?.me?.email}
            </Badge>
          </Col>
          <hr />
        </Row>
        <Row>
          <Col>
            <h5>Max Products: </h5>
          </Col>
          <Col>
            <Badge>{data?.me?.service?.maxProduct}</Badge>
          </Col>
          <hr />
        </Row>
        <Row>
          <Col>
            <h5>Current Products: </h5>
          </Col>
          <Col>
            <Badge>{data?.me?.service?.productCount}</Badge>
          </Col>
          <hr />
        </Row>
        <Row>
          <Col>
            <h5>Likes: </h5>
          </Col>
          <Col>
            <Badge>{data?.me?.service?.likeCount ?? 0}</Badge>
          </Col>
          <hr />
        </Row>
        <h5>Categories: </h5>
        <Row>
          {data?.me?.service?.categories &&
            data?.me?.service?.categories.map((category, i) => (
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
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label
              className={`${fileSize > mediaMaxSize.logo && "text-danger"}`}
            >
              Logo(.jpg, .png & .jpeg - 1MB max){" "}
              {!!fileSize &&
                `| ${getCompactNumberFormat(fileSize).replace("B", "G")} ${
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
              defaultValue={data?.me?.service?.state ?? "Lagos"}
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
              defaultValue={data?.me?.service?.title}
              name="title"
              className="text-capitalize"
            />
          </Form.FloatingLabel>
          <Form.FloatingLabel label="Service Description" className="mt-3">
            <Form.Control
              defaultValue={data?.me?.service?.description}
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
  );
}
