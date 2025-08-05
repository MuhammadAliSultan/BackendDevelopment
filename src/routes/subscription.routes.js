import { Router } from 'express';
import {
    toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt); // apply auth to all routes

router
    .route("/toggle/:channelId")   // ✅ THIS IS THE ROUTE YOU'RE HITTING
    .post(toggleSubscription);     // ✅ POST METHOD HANDLED

// Get subscribers of a channel
router.get("/channel/:channelId", getChannelSubscribers);

// Get channels a user has subscribed to
router.get("/user/:userId", getSubscribedChannels);

export default router;
