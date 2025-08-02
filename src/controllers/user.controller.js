import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploaderOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { upload } from "../middlewares/multer.middlerware.js";

const  registerUser=AsyncHandler(async(req,res)=>{
   const {userName,email,password,fullName}=req.body ;
   
   if(fullName===""||email===""||password===""||userName===""){
    throw new ApiError(400,"Kindly Fill  All the Fields");
   }


   const existingUser=await User.findOne({
    $or:[{email}, {userName}]
   })
   if(existingUser){
    throw new ApiError(409,"Data with this username or email already exists");
   }


   const avatarLocalPath=req.files?.avatar[0].path;
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";


   if(!avatarLocalPath){
    throw new ApiError(400,"Please upload an avatar");
   }
   if(!coverImageLocalPath){
    coverImageLocalPath="";
   }
   const pathAvatar=await uploaderOnCloudinary(avatarLocalPath)
   const pathCoverImage=await uploaderOnCloudinary(coverImageLocalPath)
   console.log("paths ",pathAvatar,pathCoverImage)
   const user=await User.create({
    
    userName:userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar:pathAvatar,
    coverImage:pathCoverImage
    });
    console.log("User created ",user)
    const userConfirmation=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!userConfirmation){
        throw new ApiError(500,"Something went wrong User not found")
    }
    console.log("User Confirmation",userConfirmation)
    return res.status(201).json(
    new ApiResponse(200,userConfirmation,"User created successfully")
    
    )




})

export {registerUser}