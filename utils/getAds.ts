import { GraphContextType } from "types";

const getAds = async (
  _: any,
  __: any,
  { BusinessAdModel, ProductAdModel }: GraphContextType
) => {
  const businessAds = await BusinessAdModel.find()
    .select("business")
    .populate("business")
    .exec();
  const productAds = await ProductAdModel.find()
    .select("product")
    .populate("product")
    .exec();

  return { businessAds, productAds };
};

export default getAds;
