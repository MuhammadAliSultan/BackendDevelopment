import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


 // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
 
const getChannelStats = AsyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // 1️⃣ Aggregate stats from videos (views, video count, likes)
    const videoStats = await Video.aggregate([
        { $match: { videoOwner: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "likes", // collection name in MongoDB
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalVideos: { $sum: 1 },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ]);

    const { totalViews, totalVideos, totalLikes } = videoStats[0] || {
        totalViews: 0,
        totalVideos: 0,
        totalLikes: 0
    };

    // 2️⃣ Get subscribers count
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // 3️⃣ Get subscriptions count
    const totalSubscriptions = await Subscription.countDocuments({ subscriber: channelId });

    // 4️⃣ Send response
    return res.status(200).json(
        new ApiResponse(200, "Channel stats fetched successfully", {
            totalViews,
            totalLikes,
            totalVideos,
            totalSubscribers,
            totalSubscriptions
        })
    );


   
});


// TODO: Get all the videos uploaded by the channel
const getChannelVideos = AsyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ videoOwner: channelId })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, videos,"Channel videos fetched successfully")
    );
});

    


export {
    getChannelStats, 
    getChannelVideos
    }