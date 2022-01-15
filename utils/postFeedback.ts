import { GraphContextType } from "types";
import config from "config";
import mongoose from "mongoose";
import { getAuthPayload, handleError } from ".";

const postFeedback = async (
  _: any,
  { postMessage: post }: { postMessage: string },
  { req, BusinessModel, FeedModel }: GraphContextType
) => {
  try {
    // auth user only or throw error
    const { businessId: business, sub: poster } = getAuthPayload(
        req.headers.authorization!
      ),
      // create feedback document
      feedbackDoc = new FeedModel({
        post,
        poster,
        business,
      }),
      // start db transaction session
      session = await mongoose.startSession();
    await session.withTransaction(async () => {
      await feedbackDoc.save({ session });
      await BusinessModel.findByIdAndUpdate(
        business,
        {
          $push: { feeds: feedbackDoc._id },
        },
        { session }
      )
        .lean()
        .exec();
    });
    // end transaction and end db connection
    await session.endSession();
    await mongoose.disconnect();

    return feedbackDoc;
  } catch (error: any) {
    handleError(error.message, Error, config.appData.generalErrorMessage);
  }
};

export default postFeedback;
