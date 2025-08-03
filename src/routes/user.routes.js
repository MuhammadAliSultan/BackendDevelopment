import {  registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,updateAvatar,updateCoverImage,getCurrentUser,updateUserInfo } from "../controllers/user.controller.js";
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
routes.post("/update-avatar", verifyJwt, updateAvatar);
routes.post("/update-coverImage", verifyJwt, updateCoverImage);
routes.post("/current-user", verifyJwt, getCurrentUser);
routes.post("/update-user-info", verifyJwt, updateUserInfo);
routes.post("/change-current-password", verifyJwt, changeCurrentPassword);

export default routes;
