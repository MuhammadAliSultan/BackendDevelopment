// tweet.routes.js

import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt); // all routes below require authentication

// ✅ Create tweet
router.post("/createTweet", createTweet);

// ✅ Get all tweets (with optional userId, sort, pagination via query)
router.get("/", getUserTweets);

// ✅ Update tweet
router.patch("/:tweetId", updateTweet);

// ✅ Delete tweet
router.delete("/:tweetId", deleteTweet);

export default router;
