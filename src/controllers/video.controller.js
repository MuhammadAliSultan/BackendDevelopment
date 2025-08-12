import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js";
import {uploaderOnCloudinary} from "../utils/cloudinary.js"
import { Like } from "../models/like.model.js";
import  {Comment} from "../models/comment.model.js"

const getAllVideos = AsyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId
  } = req.query;

  const matchStage = {
    isPublished: true
  };

  if (userId) {
    matchStage.videoOwner = userId;
  }

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  const sortStage = {
    [sortBy]: sortType === "asc" ? 1 : -1
  };

  const aggregate = Video.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "videoOwner",
        foreignField: "_id",
        as: "videoOwner"
      }
    },
    { $unwind: "$videoOwner" },
    { $sort: sortStage },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        videoOwner: {
          fullName: 1,
          email: 1
        }
      }
    }
  ]);

  const videoOptions = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await Video.aggregatePaginate(aggregate, videoOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched videos successfully"));
});



const publishAVideo = AsyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;
     const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  const videofilePath = req.files?.videoFile?.[0]?.path;

  if (!thumbnailPath || !videofilePath) {
    throw new ApiError(400, "Both thumbnail and video file are required");
  }

  if (!title && !description && !duration ) {
    throw new ApiError(400, "All fields are required");
  }
  const thumbnailLink=await uploaderOnCloudinary(thumbnailPath)
  const videoFileLink=await uploaderOnCloudinary(videofilePath)
  const video = await Video.create({
    title,
    description,
    duration,
    thumbnail: thumbnailLink,
    videoFile: videoFileLink,   // URL from Cloudinary
    videoOwner: req.user._id, 
    isPublished: true // or false if you're allowing drafts
  })
  
  return res.status(200).
  json(new ApiResponse(200,video,"New vidoe created Successfully"))
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found"));
});


const updateVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const updates = {};

  // Optional title/description
  if (title) updates.title = title;
  if (description) updates.description = description;

  // Optional thumbnail upload
  if (req.file) {
    const thumbnailLocalPath = req.file.path;

    // Upload to Cloudinary
    const thumbnailResult = await uploaderOnCloudinary(thumbnailLocalPath);

    if (!thumbnailResult?.url) {
      throw new ApiError(400, "Thumbnail upload failed");
    }

    updates.thumbnail = thumbnailResult.url;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updates },
    { new: true }
  ).select("-__v");

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});


const deleteVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please provide a video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.videoOwner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Now it's safe to delete everything
  await Video.findByIdAndDelete(videoId);
  await Like.deleteMany({ video: videoId });
  await Comment.deleteMany({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, videoId, "Video deleted successfully"));
});

const togglePublishStatus = AsyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Please fill all fields")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
        }
        video.isPublished = !video.isPublished
        await video.save({validateBeforeSave:false})
        return res.status(200).
        json(new ApiResponse(200,video,"Video Published Status Updated Successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}