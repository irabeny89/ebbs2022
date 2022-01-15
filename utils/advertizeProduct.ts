import { GraphContextType } from "types";
import { getAuthPayload, handleError } from ".";
import mongoose from "mongoose";
import config from "config";

const {
    subscriptionInfos: [, { costPerDay, type }],
    generalErrorMessage,
  } = config.appData,

  advertizeProduct = async (
    _: any,
    { adData: { start, end, productId } }: { adData: { start: string; end: string, productId: string } },
    { req, ProductAdModel, BusinessModel }: GraphContextType
  ) => {
    try {
      // if ads sub type is not PRODUCT throw error
      handleError(type !== "PRODUCT", Error, generalErrorMessage);
      // auth user only else it throws jwt error
      const { businessId } = getAuthPayload(req.headers.authorization!),
        // subscription days rounded up
        subDays = Math.round(
          (new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600000)
        ),
        // product subscription document
        productAdDoc = new ProductAdModel({
          start,
          end,
          product: productId,
          costPerDay,
          days: subDays,
          totalCost: subDays * costPerDay,
        }),
        // db transaction
        session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await productAdDoc.save({ session });
        await BusinessModel.findByIdAndUpdate(
          businessId,
          {
            $push: {
              productAdSubs: productAdDoc._id,
            },
          },
          { session }
        ).lean().exec();
      });
      // end transaction and end db connection
      await session.endSession();
      await mongoose.disconnect();

      return productAdDoc;
    } catch (error: any) {
      // log error for more
      handleError(error.message, Error, generalErrorMessage);
    }
  };

export default advertizeProduct;
