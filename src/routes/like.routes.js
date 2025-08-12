import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);


router.post("/toggle/video/:videoId", toggleVideoLike);
router.post("/toggle/comment/:commentId", toggleCommentLike);
router.post("/toggle/tweet/:tweetId", toggleTweetLike);

router.get("/videos", getLikedVideos);

export default router;
