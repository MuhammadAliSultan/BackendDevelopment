import dotenv from "dotenv";
import { app } from "./app.js";

import connectDB from "./db/index.js";
dotenv.config(
    {
         path: './.env' 

    }
);

connectDB()
.then(() => {
    console.log("Database connection established successfully.");
    app.on("error",(error)=>{
        console.log("Error loading --",error);

    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
});