import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { MdSend } from "react-icons/md";
import { FormEvent, useEffect, useState } from "react";
import {
  ADD_NEW_PRODUCT,
  FEW_PRODUCTS,
  FEW_PRODUCTS_AND_SERVICES,
  FEW_SERVICES,
  PRODUCTS_TAB,
} from "@/graphql/documentNodes";
import {
  AddProductModalType,
  NewProductFormDataType,
  NewProductVariableType,
} from "types";
import { useMutation, useReactiveVar } from "@apollo/client";
import { accessTokenVar, toastPayloadsVar } from "@/graphql/reactiveVariables";
import config from "config";
import getCidMod from "@/utils/getCidMod";
import web3storage from "../web3storage";
import getCompactNumberFormat from "@/utils/getCompactNumberFormat";

const { mediaMaxSize, maxImageFiles, productCategories } = config.appData;

export default function AddProductModal({
  show,
  setShow,
}: AddProductModalType) {
  const [validated, setValidated] = useState(false),
    accessToken = useReactiveVar(accessTokenVar),
    // image file sizes state
    [fileSizes, setFileSizes] = useState<number[]>([]),
    // video file size state
    [videoFileSize, setVideoFileSize] = useState(0),
    [uploading, setUploading] = useState(false);

  const [addProduct, { data, loading: newProductLoading, error, reset }] =
    useMutation<Record<"newProduct", string>, NewProductVariableType>(
      ADD_NEW_PRODUCT,
      {
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
      }
    );
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = Object.fromEntries(
          new FormData(e.currentTarget)
        ) as unknown as NewProductFormDataType,
        // formData does not contain FileList but File
        // so, using DOM directly & asserting type
        // @ts-ignore
        imageFileList = e.currentTarget.querySelector(
          "input[name='images']"
          // @ts-ignore
        ).files as FileList;
      // validate form & maximum file sizes
      if (
        e.currentTarget.checkValidity() &&
        fileSizes.length <= maxImageFiles &&
        fileSizes.find((fileSize) => fileSize < mediaMaxSize.image) &&
        videoFileSize < mediaMaxSize.video
      ) {
        // store file remotely or return undefined if video is not selected
        // alert while uploading
        const videoCID =
          formData?.video?.name &&
          (setUploading(true), await getCidMod(web3storage, formData.video));
        setUploading(false);
        // if uploaded log to console the cid
        videoCID && console.log("video file uploaded => CID:", videoCID);
        // remove video field; it's not part of gql schema
        delete formData.video;
        // store images remotely & attach file names separated by comma & alert while uploading
        setUploading(true);
        // @ts-ignore
        const imagesCID = !!process.env.NEXT_PUBLIC_OFFLINE!
          ? "/vercel.svg"
          : (Array.from(imageFileList)
              .map(({ name }: File) => encodeURIComponent(name))
              .concat(await web3storage.put(imageFileList))
              .join() as string);
        // alert & log if images uploaded
        setUploading(false);
        console.log("images uploaded =>", imagesCID);
        // remove video field; it's not part of gql schema
        // @ts-ignore
        delete formData.images;
        // call the mutate function
        addProduct({
          variables: {
            newProduct: {
              ...formData,
              imagesCID,
              videoCID,
              tags: formData?.tags
                ?.trim()
                .split(" ")
                .filter((text) => text !== ""),
              price: +formData.price,
            },
          },
        }),
          e.currentTarget.reset(),
          setFileSizes([]),
          setVideoFileSize(0);
      } else e.preventDefault(), e.stopPropagation(), setValidated(true);
    } catch (error) {
      setUploading(false), console.error(error);
    }
  };

  useEffect(() => {
    // toast feedback
    (error || data) &&
      toastPayloadsVar([{ error, successText: data!.newProduct, reset }]);

    return () => {
      toastPayloadsVar([]);
    };
  }, [error?.message, data?.newProduct]);

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton className="h3">
        Add a product...
        {(uploading || newProductLoading) && (
          <Spinner animation="border" size="sm" />
        )}
      </Modal.Header>
      <Modal.Body>
        <Form validated={validated} noValidate onSubmit={handleSubmit}>
          <Form.FloatingLabel label="Product Name">
            <Form.Control
              placeholder="Product Name"
              name="name"
              required
              aria-label="product name"
              className="text-capitalize"
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.FloatingLabel>
          <Form.FloatingLabel label="Category" className="my-3">
            <Form.Select
              placeholder="Category"
              name="category"
              aria-label="product category"
            >
              {productCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.FloatingLabel>
          <Form.FloatingLabel label="Price" className="mb-3">
            <Form.Control
              placeholder="Price"
              name="price"
              aria-label="product price"
              type="number"
              min={0}
              required
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.FloatingLabel>
          <Form.Text className="text-info">
            Split each tags with space e.g{" "}
            <Badge className="bg-secondary" pill>
              shoes
            </Badge>{" "}
            <Badge className="bg-secondary" pill>
              sandals
            </Badge>
          </Form.Text>
          <Form.FloatingLabel label="Tags" className="mb-3">
            <Form.Control
              placeholder="Tags"
              name="tags"
              aria-label="product tags"
              maxLength={100}
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.FloatingLabel>
          {/* image file */}
          <Form.Group>
            <Form.Label
              as="div"
              className={`${
                fileSizes.find((fileSize) => fileSize > 5e6) && "text-danger"
              } mb-0`}
            >
              1-3 Images (.jpg, .png & .jpeg - 5MB max each)
            </Form.Label>
            <Form.Text>
              {!!fileSizes.length &&
                (fileSizes.length < 4 ? (
                  fileSizes
                    .map((fileSize) =>
                      fileSize > 5e6
                        ? `${getCompactNumberFormat(fileSize).replace(
                            "B",
                            "G"
                          )} \u2717`
                        : `${getCompactNumberFormat(fileSize)} \u2713`
                    )
                    .join(", ")
                ) : (
                  <small className="text-danger">
                    Select images not more than 3. Atleast 1.
                  </small>
                ))}
            </Form.Text>
            <Form.Control
              required
              multiple
              type="file"
              size="lg"
              placeholder="Image"
              aria-label="product images"
              name="images"
              accept=".jpeg,.jpg,.png"
              onChange={(e: any) => {
                setFileSizes(
                  Array.from(e.target.files).map((file: any) => file.size)
                );
              }}
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.Group>
          {/* video file */}
          <Form.Group className="my-3">
            <Form.Label
              as="div"
              className={`${videoFileSize > 1e7 && "text-danger"} mb-0`}
            >
              1 Video (.mp4 - 10MB max)
            </Form.Label>
            <Form.Text>
              {!!videoFileSize &&
                (videoFileSize > 1e7
                  ? `${getCompactNumberFormat(videoFileSize).replace(
                      "B",
                      "G"
                    )} \u2717`
                  : `${getCompactNumberFormat(videoFileSize)} \u2713`)}
            </Form.Text>
            {videoFileSize > 1e7 && (
              <Form.Text className="text-danger">
                Select a video file less than 10 MB
              </Form.Text>
            )}
            <Form.Control
              type="file"
              size="lg"
              placeholder="Video"
              aria-label="product video clip"
              name="video"
              accept=".mp4"
              onChange={(e: any) => {
                setVideoFileSize(e.target.files[0].size);
              }}
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.Group>
          <Form.FloatingLabel label="Description">
            <Form.Control
              placeholder="Description"
              name="description"
              required
              aria-label="product description"
              as="textarea"
              style={{ height: "8rem" }}
            />
            <Form.Control.Feedback type="invalid">
              This field is required!
            </Form.Control.Feedback>
          </Form.FloatingLabel>
          <Button className="w-100 my-4" type="submit" size="lg">
            {(newProductLoading || uploading) && (
              <Spinner animation="grow" size="sm" />
            )}{" "}
            <MdSend /> Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
