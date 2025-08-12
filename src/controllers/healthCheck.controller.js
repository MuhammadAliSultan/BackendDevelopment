import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const healthcheck = AsyncHandler(async (req, res) => {
    // Simple healthcheck response
    return res
        .status(200)
        .json(new ApiResponse(200, { status: "OK" }, "Server is running fine 🚀"));
});

export {
    healthcheck
};
