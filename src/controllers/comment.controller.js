import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
const getVideoComments = AsyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoObjectId
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 1,
                video: 1,
                content: 1,
                createdAt: 1,
                user: {
                    _id: "$user._id",
                    name: "$user.name",
                    avatar: "$user.avatar"
                }
            }
        }
    ]);

    const totalComments = await Comment.countDocuments({ video: videoObjectId });

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: {
                total: totalComments,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalComments / limit)
            }
        }, "Comments Retrieved Successfully")
    );
});


const addComment = AsyncHandler(async (req, res) => {
    const { content } = req.body;
     const { videoId } = req.params;


    
    const user = req.user; 

    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    
    const comment = new Comment({
        owner: user._id,
        video: videoId,
        content: content.trim()
    });

    await comment.save();

    return res
        .status(201)
        .json(new ApiResponse(201, { comment }, "Comment Added Successfully"));
});



const updateComment = AsyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user?._id;


  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID format");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not the owner of this comment");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }


const updatedComment = await Comment.findByIdAndUpdate(
  commentId,
  { comment },
  { new: true }
);

return res
  .status(200)
  .json(new ApiResponse(200, "Comment updated successfully", updatedComment));

});

const deleteComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID format");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not the owner of this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Comment deleted successfully")
  );
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }