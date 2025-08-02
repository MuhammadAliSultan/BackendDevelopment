import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploaderOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.warn("No local file found to upload.");
      return null;
    }

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File Uploaded Successfully to Cloudinary");

    // Delete local file only if upload succeeded
    try {
      fs.unlinkSync(localFilePath);
      console.log("🗑️ Local file deleted from temp folder:", localFilePath);
    } catch (unlinkErr) {
      console.warn("⚠️ Failed to delete local file:", unlinkErr);
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);

    // Cleanup if upload failed
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("🗑️ Local file deleted after failed upload:", localFilePath);
      } catch (unlinkErr) {
        console.warn("⚠️ Failed to delete local file after error:", unlinkErr);
      }
    }

    return null;
  }
};

export { uploaderOnCloudinary };
