import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

// Toggle Like for Video
const toggleVideoLike = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    const like = await Like.findOne({ video: videoId, likedBy: userId });
    if (like) {
        await Like.deleteOne({ video: videoId, likedBy: userId });
    } else {
        await Like.create({ video: videoId, likedBy: userId });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video like toggled successfully"));
});

// Toggle Like for Comment
const toggleCommentLike = AsyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const like = await Like.findOne({ comment: commentId, likedBy: userId });
    if (like) {
        await Like.deleteOne({ comment: commentId, likedBy: userId });
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment like toggled successfully"));
});

// Toggle Like for Tweet
const toggleTweetLike = AsyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    const like = await Like.findOne({ tweet: tweetId, likedBy: userId });
    if (like) {
        await Like.deleteOne({ tweet: tweetId, likedBy: userId });
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet like toggled successfully"));
});

// Get All Liked Videos (Aggregation)
const getLikedVideos = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos", // collection name in MongoDB
                localField: "video",
                foreignField: "_id",
                as: "videoData"
            }
        },
        { $unwind: "$videoData" },
        {
            $project: {
                _id: 0,
                videoId: "$videoData._id",
                title: "$videoData.title",
                description: "$videoData.description",
                createdAt: "$videoData.createdAt"
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
