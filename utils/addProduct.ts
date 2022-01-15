import { GraphContextType, ProductType } from "types";
import { getAuthPayload, handleError } from ".";
import mongoose from "mongoose";
import config from "config";
import { AuthenticationError } from "apollo-server-core";

const addProduct = async (
  _: any,
  {
    productData,
  }: {
    productData: Pick<
      ProductType,
      | "name"
      | "description"
      | "images"
      | "video"
      | "category"
      | "tags"
      | "price"
      | "quantity"
    >;
  },
  { req, ProductModel, BusinessModel }: GraphContextType
) => {
  try {
    // auth user only; throws error otherwise
    const { businessId } = getAuthPayload(req.headers.authorization!);
    handleError(
      !businessId,
      AuthenticationError,
      config.appData.generalErrorMessage
    );
    // prevent over-adding product by comparing max product and product count
    const business = await BusinessModel.findById(businessId)
      .select("maxProductAllowed")
      .lean()
      .exec();
    handleError(
      business?.maxProductAllowed! === business?.currentProductCount!,
      Error,
      "Maximum product exceeded. Please upgrade."
    );
    // create product document
    const productDoc = new ProductModel({
      ...productData,
      business: businessId,
    });
    // run db with transaction
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await productDoc.save({ session });
      await BusinessModel.findByIdAndUpdate(
        businessId,
        {
          $push: {
            products: productDoc._id,
          },
          $inc: {
            currentProductCount: 1,
          },
        },
        { session }
      ).lean().exec();
    });
    await session.endSession();
    // disconnect db after ending transaction session
    await mongoose.disconnect();

    return productDoc;
  } catch (error: any) {
    handleError(error.message, Error, config.appData.generalErrorMessage);
  }
};

export default addProduct;
