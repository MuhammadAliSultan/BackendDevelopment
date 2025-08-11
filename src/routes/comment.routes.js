import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt);


router
  .route("/:videoId")
  .get(getVideoComments)   // Get all comments for a video
  .post(addComment);       // Add a new comment to a video

router
  .route("/c/:commentId")
  .patch(updateComment)    // Update a comment
  .delete(deleteComment);  // Delete a comment

export default router;
