import { registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
const routes=Router();
routes.route("/register").post(registerUser)


export default routes;