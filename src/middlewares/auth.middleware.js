import { ApiError } from "../utils/apiError.js"
import { AsyncHandler } from "../utils/AsyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
export const verifyJwt = AsyncHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found for provided token");
  }

  req.user = user;
  next();
});
