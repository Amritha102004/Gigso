import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes the local temporary file.
 * @param localFilePath Path to the file on local disk
 * @returns Secure URL of the uploaded image
 */
export const uploadToCloudinary = async (localFilePath: string): Promise<string> => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path is required");
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "gigso-profiles",
      resource_type: "image",
    });

    // Clean up local temporary file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    // Make sure we delete local file even on error
    console.error("Cloudinary upload error full details:", JSON.stringify(error, null, 2));
    console.error("Error message:", (error as Error).message);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Failed to delete local temp file on error:", err);
      }
    }
    throw error;
  }
};
