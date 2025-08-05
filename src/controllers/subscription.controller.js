import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// ---------------------------------------------
// Toggle subscription (subscribe/unsubscribe)
// ---------------------------------------------
const toggleSubscription = AsyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  });

  if (existingSubscription) {
    await Subscription.deleteOne({ _id: existingSubscription._id });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed from channel"));
  }

  const subscription = await Subscription.create({
    channel: channelId,
    subscriber: subscriberId
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Subscribed to channel"));
});

// ---------------------------------------------
// Get all subscribers of a channel
// ---------------------------------------------
const getChannelSubscribers = AsyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber"
      }
    },
    { $unwind: "$subscriber" },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriber._id",
        fullName: "$subscriber.fullName",
        email: "$subscriber.email",
        avatar: "$subscriber.avatar"
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { count: subscribers.length, subscribers }, "Fetched subscribers successfully")
  );
});

// ---------------------------------------------
// Get all channels the user has subscribed to
// ---------------------------------------------
const getSubscribedChannels = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel"
      }
    },
    { $unwind: "$channel" },
    {
      $project: {
        _id: 0,
        channelId: "$channel._id",
        fullName: "$channel.fullName",
        email: "$channel.email",
        avatar: "$channel.avatar"
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { count: channels.length, channels }, "Fetched subscribed channels successfully")
  );
});

export {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels
};
