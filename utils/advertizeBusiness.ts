import { GraphContextType } from "types";
import { getAuthPayload, handleError } from ".";
import mongoose from "mongoose";
import config from "config";

const {
    subscriptionInfos: [{ costPerDay, type }],
    generalErrorMessage,
  } = config.appData,
  advertizeBusiness = async (
    _: any,
    { adData: { start, end } }: { adData: { start: string; end: string } },
    { req, BusinessAdModel, BusinessModel }: GraphContextType
  ) => {
    try {
      // if sub type is not BUSINESS throw error
      handleError(type !== "BUSINESS", Error, generalErrorMessage);
      // auth user only else it throws jwt error
      const { businessId } = getAuthPayload(req.headers.authorization!),
        // subscription days rounded up
        subDays = Math.round(
          (new Date(end).getTime() - new Date(start).getTime()) / (24 * 3600000)
        ),
        // business subscription document
        businessAdDoc = new BusinessAdModel({
          start,
          end,
          business: businessId,
          costPerDay,
          days: subDays,
          totalCost: subDays * costPerDay,
        }),
        // db transaction
        session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await businessAdDoc.save({ session });
        await BusinessModel.findByIdAndUpdate(
          businessId,
          {
            $push: {
              businessAdSubs: businessAdDoc._id,
            },
          },
          { session }
        ).lean().exec();
      });
      // end transaction and end db connection
      await session.endSession();
      await mongoose.disconnect();

      return businessAdDoc;
    } catch (error: any) {
      // log error for more
      handleError(error.message, Error, generalErrorMessage);
    }
  };

export default advertizeBusiness;
