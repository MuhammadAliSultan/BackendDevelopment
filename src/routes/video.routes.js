// video.routes.js

import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middlerware.js";

const router = Router();

router.use(verifyJwt); // all routes below require authentication

// ✅ Publish a new video (multipart: videoFile + thumbnail)
router.post(
  "/createVideo",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

// ✅ Get all videos (with optional filters, sort, pagination)
router.get("/", getAllVideos);

// ✅ Get a single video by ID
router.get("/:videoId", getVideoById);

router.patch(
  "/:videoId",
  upload.single("thumbnail"), // enables file upload
  updateVideo
);

// ✅ Toggle publish status
router.patch("/toggle/publish/:videoId", togglePublishStatus);

// ✅ Delete video
router.delete("/:videoId", deleteVideo);

export default router;
