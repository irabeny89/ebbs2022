import { ProductCardPropType } from "types";

// mock images
export const mockImages = [
  { type: "image", src: "/ferrari-f430-sport-car.jpg" },
  { type: "image", src: "/Ferrari Scuderia Spider.jpg" },
];
// mock video
export const mockVideo = {
  type: "video",
  src: "/Sinzu Money has a mad update for Spending..mp4",
};
// mock media
export const mockMedia = [...mockImages, mockVideo];

export const productProps: ProductCardPropType = {
  _id: "1",
  category: "ELECTRICALS",
  name: "Mockie",
  price: 1e6,
  tags: ["mock", "test", "rtl", "jest"],
  images: ["cid"],
  video: "",
  description: "test product",
  saleCount: 1e2,
  provider: { title: "Ekemode" },
};