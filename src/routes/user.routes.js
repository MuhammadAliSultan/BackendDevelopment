import {  registerUser,loginUser,logOutUser,
  refreshAccessToken,changeCurrentPassword,updateAvatar,
  updateCoverImage,getCurrentUser,updateUserInfo,
   getUserChannelProfile,getUserHistory} from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middlerware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const routes = Router();

routes.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

routes.post("/login", loginUser);

routes.post("/logout", verifyJwt, logOutUser);
routes.post("/refresh-Token", refreshAccessToken);
routes.patch("/update-avatar", verifyJwt,upload.single("avatar"), updateAvatar);
routes.patch("/update-coverImage", verifyJwt,upload.single("coverImage"), updateCoverImage);
routes.get("/current-user", verifyJwt, getCurrentUser);
routes.patch("/update-user-info", verifyJwt, updateUserInfo);
routes.post("/change-current-password", verifyJwt, changeCurrentPassword);
routes.get("/c/:userName",verifyJwt,getUserChannelProfile)
routes.get("/history",verifyJwt,getUserHistory)
export default routes;
