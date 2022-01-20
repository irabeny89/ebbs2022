import type { ProductCardPropType } from "types";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { BiCartAlt } from "react-icons/bi";
import getCompactNumberFormat from "../utils/getCompactNumberFormat";
import Image from "next/image";
import { mockMedia } from "@/models/localData";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { cartItemsVar } from "@/graphql/reactiveVariables";
import config from "config";
import getLastCartItemsFromStorage from "@/utils/getCartItemsFromStorage";
import getLocalePrice from "@/utils/getLocalePrice";
import { useState } from "react";

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
    // modal state
    const [show, setShow] = useState(false);

    return (
      <Container fluid {...{ className, style }}>
        {/* info modal */}
        <Modal centered show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{description}</Modal.Body>
        </Modal>
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
              </Button>
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
          <Card.Footer className="pb-4">
            <Row>
              <Button
                className="d-flex justify-content-center align-items-center"
                onClick={() => {
                  const oldItems = getLastCartItemsFromStorage(localStorage),
                    // if cart has this product update it; if it doesn't add it.
                    newItems = oldItems.find((item) => item._id === _id)
                      ? oldItems.map((item) =>
                          item._id === _id
                            ? {
                                ...item,
                                quantity: ++item.quantity,
                                cost: item.price * ++item.quantity,
                              }
                            : item
                        )
                      : [
                          ...oldItems,
                          {
                            _id: _id!,
                            providerId: provider?._id!,
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
                <BiCartAlt />
                <div className="mx-1">Add to cart</div>
              </Button>
            </Row>
          </Card.Footer>
        </Card>
      </Container>
    );
  };

export default ProductCard;
