import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Configured");

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null

        // Upload File On Cloudinary
        const response = await cloudinary.uploader.upload(
          localFilePath,
          { 
            resource_type: "auto",
            format: null,
            upload_preset: "medkart",
            // folder: folderName,
          },
        );
        // File Has Been Uploaded Successfully
        fs.unlinkSync(localFilePath)
        console.log("File is uploaded on Cloudinary.", response.secure_url, ' - ', response.format);
        return response;
    }catch(error){
        console.log("Error in uploading file on Cloudinary.", error);
        fs.unlinkSync(localFilePath)  // Remove the localy Saved Temporary File as the upload Operation got failed.  
        return null;
    }
}

const deleteFromCloudinary = async (url) => {
    const publicId = url.split("/").pop().split(".")[0];
    try{
        if(!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        console.log("File is deleted from Cloudinary.", response.result);
        return response;
    }catch(error){
        return null;
    }
}
export {uploadOnCloudinary, deleteFromCloudinary}