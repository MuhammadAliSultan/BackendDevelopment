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


router.use(verifyJwt); // All routes require authentication

router.get("/user/:userId", getUserPlaylists);


router.post("/", createPlaylist);

router.patch("/:playlistId", updatePlaylist);

router.delete("/:playlistId", deletePlaylist);

router.get("/:playlistId", getPlaylistById);

router.post("/:playlistId/videos/:videoId", addVideoToPlaylist);

router.delete("/:playlistId/videos/:videoId", removeVideoFromPlaylist);

export default router