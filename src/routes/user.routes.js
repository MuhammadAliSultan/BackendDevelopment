import { loginUser, registerUser, logOutUser, refreshAccessToken } from "../controllers/user.controller.js";
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

export default routes;
