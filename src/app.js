import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
app.use(cors(
    {
        origin:process.env.CORS_ORIGN,
        credentials:true

    }
));
app.use(express.json({
    limit:"16kb"
}));

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));

app.use(cookieParser());

app.use(express.static("pubic"));

// routes importing

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users",userRouter)


export {app};
