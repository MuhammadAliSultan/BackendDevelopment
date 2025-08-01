import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key:process.env.CLOUDINARY_APIKEY , 
        api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
    });


    const uploaderOnCloudinary = async(localpath)=>{

     const uploadResult = await cloudinary.uploader
       .upload(
           localpath, {
               resource_type: 'auto'
           }
       )
       .catch((error) => {
           console.log(error);
           fs.unlinkSync(localpath)
       });
    
    console.log("File Uploaded Successfully",uploadResult);
    }