import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import {uploaderOnCloudinary} from "../utils/cloudinary.js"

const createTweet = AsyncHandler(async (req, res) => {
  const { contentOfTweet } = req.body;

  if (!contentOfTweet) {
    throw new ApiError(400, "No content to be posted");
  }

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not found");
  }

  const tweet = await Tweet.create({
    content: contentOfTweet,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = AsyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = AsyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = AsyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}