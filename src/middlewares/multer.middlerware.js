import multer from "multer";
import fs from "fs";
import path from "path";

// Define absolute upload path
const uploadPath = path.resolve("Public", "temp");

// Ensure the folder exists
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${file.fieldname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
