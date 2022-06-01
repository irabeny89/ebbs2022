import type { ProductCardPropsType } from "types";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import { MdShoppingCart, MdBusinessCenter } from "react-icons/md";
import getCompactNumberFormat from "../utils/getCompactNumberFormat";
import Image from "next/image";
import {
  accessTokenVar,
  authPayloadVar,
  cartItemsVar,
  toastPayloadsVar,
} from "@/graphql/reactiveVariables";
import config from "../config";
import getLastCartItemsFromStorage from "@/utils/getLastCartItemsFromStorage";
import getLocalePrice from "@/utils/getLocalePrice";
import { useEffect, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import {
  DELETE_MY_PRODUCT,
  FEW_PRODUCTS,
  FEW_PRODUCTS_AND_SERVICES,
  FEW_SERVICES,
  PRODUCTS_TAB,
} from "@/graphql/documentNodes";
import getIpfsGateWay from "@/utils/getIpfsGateWay";
import dynamic from "next/dynamic";
import AjaxFeedback from "./AjaxFeedback";
import InfoButton from "./InfoButton";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";

const EditProductModal = dynamic(() => import("components/EditProductModal"), {
    loading: () => <AjaxFeedback loading />,
  }),
  DeleteModal = dynamic(() => import("components/DeleteModal"), {
    loading: () => <AjaxFeedback loading />,
  }),
  InfoModal = dynamic(() => import("components/InfoModal"), {
    loading: () => <AjaxFeedback loading />,
  });

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
  };
// product card component
const ProductCard = ({
  _id,
  category,
  name,
  price,
  tags,
  imagesCID,
  videoCID,
  description,
  saleCount,
  provider,
  className,
  style,
}: ProductCardPropsType) => {
  // get auth access token
  const accessToken = useReactiveVar(accessTokenVar),
    authPayload = useReactiveVar(authPayloadVar);

  const [showEdit, setShowEdit] = useState(false),
    [showInfo, setShowInfo] = useState(false),
    [showDelete, setShowDelete] = useState(false);

  // deletion mutation
  const [
      deleteProduct,
      { loading: deleteLoading, data: deleteData, error: deleteError },
    ] = useMutation<
      Record<"deleteMyProduct", string>,
      Record<"productId", string>
    >(DELETE_MY_PRODUCT, {
      refetchQueries: [
        FEW_PRODUCTS_AND_SERVICES,
        FEW_PRODUCTS,
        FEW_SERVICES,
        PRODUCTS_TAB,
      ],
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        productId: _id.toString(),
      },
    }),
    handleAddToCart = () => {
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
      localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(newItems));
      cartItemsVar(newItems);
    };

  useEffect(() => {
    // toast feedback
    (deleteError || deleteData?.deleteMyProduct) &&
      toastPayloadsVar([
        { error: deleteError, successText: deleteData?.deleteMyProduct },
      ]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [deleteError?.message, deleteData?.deleteMyProduct]);

  return (
    <Container fluid {...{ className, style }}>
      <InfoModal
        title={name}
        body={description}
        setShow={setShowInfo}
        show={showInfo}
      />
      <EditProductModal
        {...{
          _id,
          category,
          name,
          price,
          tags,
          imagesCID,
          videoCID,
          description,
          saleCount,
          provider,
          show: showEdit,
          setShow: setShowEdit,
        }}
      />
      <DeleteModal
        {...{
          name,
          deleteLoading,
          show: showDelete,
          setShow: setShowDelete,
          handleDelete: deleteProduct,
        }}
      />
      {/* product card */}
      <Card style={cardStyling.cardStyle}>
        <Card.Header className="text-capitalize text-center">
          <Card.Title>
            <div className="text-center">{name}</div>
            <InfoButton setShow={setShowInfo} />
            {authPayload?.serviceId === provider._id && (
              <>
                <EditButton setShow={setShowEdit} />
                <DeleteButton setShow={setShowDelete} />
              </>
            )}
          </Card.Title>
          <Card.Subtitle>
            <MdBusinessCenter size={20} /> {provider?.title}
          </Card.Subtitle>
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
            <Row className="h2">
              <Badge className="bg-dark">{getLocalePrice(price!)}</Badge>
            </Row>
          </Card.Subtitle>
        </Card.Header>
        <Card.Body>
          <Carousel controls={false} interval={6e4}>
            {imagesCID
              .split(",")
              .slice(0, -1)
              .map((fileName) => (
                <Carousel.Item
                  key={fileName}
                  style={{ width: cardStyling.mediaStyle.width }}
                >
                  <Image
                    src={`https://ipfs.io/ipfs/${
                      imagesCID.split(",").slice(-1)[0]
                    }/${fileName}`}
                    {...cardStyling.mediaStyle}
                    alt="product picture"
                    width={cardStyling.mediaStyle.width}
                    height={cardStyling.mediaStyle.height}
                  />
                </Carousel.Item>
              ))}
            {!!videoCID && (
              <Carousel.Item style={{ width: cardStyling.mediaStyle.width }}>
                <video
                  src={getIpfsGateWay(videoCID)}
                  controls
                  {...cardStyling.mediaStyle}
                />
              </Carousel.Item>
            )}
          </Carousel>
        </Card.Body>
        {authPayload?.serviceId !== provider._id && (
          <Card.Footer className="pb-4">
            <Row>
              <Button
                className="d-flex justify-content-center align-items-center"
                onClick={handleAddToCart}
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
