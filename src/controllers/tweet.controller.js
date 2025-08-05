import mongoose from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js";


const createTweet = AsyncHandler(async (req, res) => {
  const { content} = req.body;

  if (!content) {
    throw new ApiError(400, "No content to be posted");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not found");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = AsyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    userId,
    sortBy = "createdAt",
    sortType = "desc"
  } = req.query;

  const matchStage = {};
  if (userId) {
    matchStage["owner"] = new mongoose.Types.ObjectId(userId);
  }

  const sortStage = {
    [sortBy]: sortType === "asc" ? 1 : -1,
  };

  const aggregate = Tweet.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users", // your User collection name (must be lowercase and plural)
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" },
    { $sort: sortStage },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner.fullName": 1,
        "owner.email": 1
      }
    }
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await Tweet.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tweets fetched successfully"));
});


const updateTweet = AsyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId || !content) {
        throw new ApiError(400, "Tweet ID and new content are required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Ensure only the tweet owner can update it
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});


const deleteTweet = AsyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId  = req.user?._id;
    if(!tweetId||!userId){
        throw new ApiError(400, "Tweet ID and user ID are required");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
        }
     if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    await tweet.deleteOne();//or remove()
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}