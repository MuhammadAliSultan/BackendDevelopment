import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
// All imports stay the same as your original file

router.use(verifyJwt); // All routes require authentication

// ✅ Get all playlists of a user (placed before /:playlistId to avoid collision)
router.get("/user/:userId", getUserPlaylists);

// ✅ Create a new playlist
router.post("/", createPlaylist);

// ✅ Update playlist details
router.patch("/:playlistId", updatePlaylist);

// ✅ Delete a playlist
router.delete("/:playlistId", deletePlaylist);

// ✅ Get playlist by ID
router.get("/:playlistId", getPlaylistById);

// ✅ Add a video to a playlist (RESTful: POST to videos)
router.post("/:playlistId/videos/:videoId", addVideoToPlaylist);

// ✅ Remove a video from a playlist (RESTful: DELETE to videos)
router.delete("/:playlistId/videos/:videoId", removeVideoFromPlaylist);

export default router