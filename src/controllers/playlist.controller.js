import mongoose from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const validateObjectId = (id, name) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${name} ID`);
  }
};


// Helper function to fetch a playlist with populated videos
const fetchPlaylistWithVideos = async (playlistId) => {
  return await Playlist.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos"
      }
    }
  ]);
};

const createPlaylist = AsyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id
  });

  const populatedPlaylist = await fetchPlaylistWithVideos(playlist._id);

  return res
    .status(201)
    .json(new ApiResponse(201, populatedPlaylist[0], "Playlist created successfully"));
});

const getUserPlaylists = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos"
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        videos: 1,
        videosCount: { $size: "$videos" }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists retrieved successfully"));
});

const getPlaylistById = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;

 validateObjectId(playlistId, "playlist");

  const playlist = await fetchPlaylistWithVideos(playlistId);
  if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

 validateObjectId(playlistId, "playlist");
validateObjectId(videoId, "video");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (playlist.videos.some(vId => vId.toString() === videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  const updatedPlaylist = await fetchPlaylistWithVideos(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist[0], "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

validateObjectId(playlistId, "playlist");
validateObjectId(videoId, "video");


  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!playlist.videos.some(vId => vId.toString() === videoId)) {
    throw new ApiError(400, "Video does not exist in playlist");
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  const updatedPlaylist = await fetchPlaylistWithVideos(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist[0], "Video removed from playlist successfully"));
});

const deletePlaylist = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;

validateObjectId(playlistId, "playlist");



  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

validateObjectId(playlistId, "playlist");


  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Only owner can update
  if (playlist.owner && playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  // Update only provided fields
  const updateFields = {};
  if (typeof name === "string" && name.trim() !== "") updateFields.name = name;
  if (typeof description === "string") updateFields.description = description;

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "Please provide at least one field to update");
  }

  await Playlist.findByIdAndUpdate(playlistId, { $set: updateFields }, { new: true });

  const updatedPlaylist = await fetchPlaylistWithVideos(playlistId);
  if (!updatedPlaylist.length) {
    throw new ApiError(404, "Playlist not found after update");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist[0], "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}