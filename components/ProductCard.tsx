import type { ProductCardPropType } from "types";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { MdShoppingCart, MdDeleteForever } from "react-icons/md";
import getCompactNumberFormat from "../utils/getCompactNumberFormat";
import Image from "next/image";
import { mockMedia } from "mockData";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import config from "../config";
import getLastCartItemsFromStorage from "@/utils/getCartItemsFromStorage";
import getLocalePrice from "@/utils/getLocalePrice";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  DELETE_MY_PRODUCT,
  FEW_PRODUCTS_AND_SERVICES,
  MY_PROFILE,
} from "@/graphql/documentNodes";
import useAuthPayload from "../hooks/useAuthPayload";

const { CART_ITEMS_KEY } = config.appData.constants,
  // custom style
  cardStyling = {
    cardStyle: {
      width: 275,
    },
    mediaStyle: {
      width: 250,
      height: 200,
    },
  },
  // product card component
  ProductCard = ({
    _id,
    category,
    name,
    price,
    tags,
    images,
    video,
    description,
    saleCount,
    provider,
    className,
    style,
  }: ProductCardPropType) => {
    // get auth payload
    const { authPayload, accessToken } = useAuthPayload();
    // product info modal state
    const [show, setShow] = useState(false),
      // product delete modal dialog state
      [showDialog, setShowDialog] = useState(false);
    // deletion mutation
    const [deleteProduct, { loading }] = useMutation<
      Record<"deleteMyProduct", string>,
      Record<"productId", string>
    >(DELETE_MY_PRODUCT, {
      refetchQueries: [FEW_PRODUCTS_AND_SERVICES, MY_PROFILE],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        productId: _id.toString(),
      },
    });

    return (
      <Container fluid {...{ className, style }}>
        {/* info modal */}
        <Modal centered show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{description}</Modal.Body>
        </Modal>
        {/* delete modal dialog */}
        <Modal
          centered
          show={showDialog}
          onHide={() => setShowDialog(false)}
          size="sm"
        >
          <Modal.Dialog className="m-0">
            <Modal.Header className="h3 bg-warning">
              Delete{" "}
              <Badge className="bg-secondary" pill>
                {name}
              </Badge>
              ?
            </Modal.Header>
            <Modal.Body>Are you sure? This cannot be undone.</Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={() => deleteProduct()}>
                {loading && <Spinner animation="grow" size="sm" />}Delete
              </Button>
              <Button variant="secondary" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal>
        {/* product card */}
        <Card style={cardStyling.cardStyle}>
          <Card.Header className="text-capitalize text-center">
            <Card.Title>
              {name}{" "}
              <Button
                size="sm"
                className="rounded py-0"
                variant="outline-info"
                onClick={() => setShow(true)}
              >
                i
              </Button>{" "}
              {authPayload?.serviceId === provider._id && (
                <Button
                  size="sm"
                  className="rounded py-0"
                  variant="outline-danger"
                  onClick={() => setShowDialog(true)}
                >
                  <MdDeleteForever />
                </Button>
              )}
            </Card.Title>
            <Card.Subtitle>{provider?.title}</Card.Subtitle>
            <Row className="my-2">
              <Col>
                <Card.Subtitle>{category}</Card.Subtitle>
              </Col>
              <Col>
                <Card.Subtitle className="text-center">
                  {getCompactNumberFormat(saleCount!)} sold
                </Card.Subtitle>
              </Col>
            </Row>
            <Card.Subtitle style={{ fontSize: 14 }}>
              {tags!.map((tag) => (
                <Badge className="bg-secondary mx-1" key={tag}>
                  {tag}
                </Badge>
              ))}
            </Card.Subtitle>
            <Card.Subtitle className="mt-2">
              <Row className="h1">
                <Badge className="bg-dark">{getLocalePrice(price!)}</Badge>
              </Row>
            </Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <Carousel controls={false} interval={6e4}>
              {mockMedia.map(({ src, type }) =>
                type === "video" ? (
                  <Carousel.Item
                    key={src}
                    style={{ width: cardStyling.mediaStyle.width }}
                  >
                    <video src={src} controls {...cardStyling.mediaStyle} />
                  </Carousel.Item>
                ) : (
                  <Carousel.Item
                    key={src}
                    style={{ width: cardStyling.mediaStyle.width }}
                  >
                    <Image
                      src={src}
                      {...cardStyling.mediaStyle}
                      layout="fixed"
                      alt="product picture"
                    />
                  </Carousel.Item>
                )
              )}
            </Carousel>
          </Card.Body>
          {authPayload?.serviceId !== provider._id && (
            <Card.Footer className="pb-4">
              <Row>
                <Button
                  className="d-flex justify-content-center align-items-center"
                  onClick={() => {
                    const oldItems = getLastCartItemsFromStorage(localStorage),
                      // if cart has this product update it; if it doesn't add it.
                      newItems = oldItems.find((item) => item.productId === _id)
                        ? oldItems.map((item) =>
                            item.productId === _id
                              ? {
                                  ...item,
                                  quantity: ++item.quantity,
                                  cost: item.price * item.quantity++,
                                }
                              : item
                          )
                        : [
                            ...oldItems,
                            {
                              productId: _id.toString(),
                              providerId: provider?._id!.toString(),
                              providerTitle: provider?.title!,
                              name: name!,
                              price: price!,
                              quantity: 1,
                              cost: price! * 1,
                            },
                          ];
                    // store in storage and update state
                    localStorage.setItem(
                      CART_ITEMS_KEY,
                      JSON.stringify(newItems)
                    );
                    cartItemsVar(newItems);
                  }}
                >
                  <MdShoppingCart />
                  <div className="mx-1">Add to cart</div>
                </Button>
              </Row>
            </Card.Footer>
          )}
        </Card>
      </Container>
    );
  };

export default ProductCard;
