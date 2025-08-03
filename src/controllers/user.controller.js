import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { uploaderOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import fs, { access } from 'fs'
import jwt from "jsonwebtoken"
const options={
    httpOnly:true,
    secure:false
  }

const generateAccessTokenAndRefreshTokens=async(userId)=>{
  try{
    const user = await User.findById(userId)
  
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
     user.refreshToken=refreshToken
     await user.save({validateBeforeSave:false})
     return {accessToken,refreshToken}

  }catch(error){
   throw new ApiError(500,error?.message||"someThing Went wrong")
  }
}
const  registerUser=AsyncHandler(async(req,res)=>{
   const {userName,email,password,fullName}=req.body ;
   
   if(fullName===""||email===""||password===""||userName===""){
    throw new ApiError(400,"Kindly Fill  All the Fields");
   }


   const existingUser=await User.findOne({
    $or:[{email}, {userName}]
   })

    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";


   if (existingUser) {
  // ⚠️ Cleanup temp files before throwing error
  if (fs.existsSync(avatarLocalPath)) {
    fs.unlinkSync(avatarLocalPath);
    console.log("🗑️ Deleted avatar due to existing user");
  }
  if (fs.existsSync(coverImageLocalPath)) {
    fs.unlinkSync(coverImageLocalPath);
    console.log("🗑️ Deleted coverImage due to existing user");
  }

  throw new ApiError(409, "Data with this username or email already exists");
}




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
const loginUser=AsyncHandler(async(req,res)=>{
  const {email,password}=req.body
  if(!email){
    throw new ApiError(400,"Please enter your email")
   }
  console.log("Email and password ",email,password)
  const user=await User.findOne({email})
  if(!user){
    throw new ApiError(400,"User not found")
    }
    console.log("User found ",user)
  const passwordVerification=await user.isPasswordCorrect(password)
  if(!passwordVerification){
    throw new ApiError(401,"Incorrect password")
    }
    console.log("Password verification ",passwordVerification)
    
 const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);

 console.log("access and refresh token ",accessToken,refreshToken)
  const loggedInUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  console.log("To JSON:", JSON.stringify({ user: loggedInUser, accessToken, refreshToken }));

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})
const logOutUser=AsyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,
   { $set:{refreshToken:undefined}},{new :true}
  )
  console.log("logging out user")
return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json({ msg: "Logged out" });

})
const refreshAccessToken=AsyncHandler(async(req,res)=>{
  const incommingRefreshToken=req.cookies?.refreshToken||req.body.refreshToken
  if(!incommingRefreshToken){
    throw new ApiError(401,"Unauthorized Request")
  }
  try {
 const decodedToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  const user=await User.findById(decodedToken._id)
  if(!user){
    throw "invalid refresh token"
  }
  if(incommingRefreshToken!==user?.refreshToken){
    throw "invalid refresh token"
  }
  const {accessToken,refreshToken}=await generateAccessTokenAndRefreshTokens(user._id)
return res.status(200)
.cookie("accessToken",accessToken, options)
.cookie("refreshToken",refreshToken, options)
.json(new ApiResponse(200,{accessToken,refreshToken},"Access Token Refreshed"));

    
  } catch (error) {
    throw new ApiError(401,error.message||"Unauthorized Request")
  }
 

})

const changeCurrentPassword=AsyncHandler(async(req,res)=>{
  const {oldPassword,newPassword,confirmPassword}=req.body
  if(newPassword!==confirmPassword){
    throw new ApiError(400,"Password and Confirm Password does not match")
  }
  const user=await User.findById(req.user._id)
  const passwordValidation=user.isPasswordCorrect(oldPassword)
  if(!passwordValidation){
    throw new ApiError(400,"Old Password is incorrect")
  }
  user.password=newPassword
  await user.save(
    {
    validateBeforeSave:false
    }
  )
  return res.status(200)
  .json(new ApiResponse(200,{},"Password Changed Successfully"))
}
)

const updateUserInfo=AsyncHandler(async(req,res)=>{
  const {fullName,email}=req.body
  if(!fullName||!email){
    throw new ApiError(400,"Please fill all the fields")
  }
      const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
        
    ).select("-password")
  
})

const getCurrentUser=AsyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id).select("-password")
  return res.status(200)
  .json(new ApiResponse(200,user,"User Found"))

})

const updateAvatar=AsyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file.path
  if(!avatarLocalPath){
    throw new ApiError(400,"Please Provide Avatar")
  }
  const avatar= await uploaderOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"Avatar Upload Failed")
  }
  const user=await User.findByIdAndUpdate(req.user._id,{$set:{
    avatar:avatar.url
  }}, {new:true})

   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})


const updateCoverImage=AsyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file.path
  if(!coverImageLocalPath){
    throw new ApiError(400,"Please Provide Avatar")
  }
  const coverImage= await uploaderOnCloudinary(coverImageLocalPath)
  if(!avatar.url){
    throw new ApiError(400,"coverImage Upload Failed")
  }
  const user=await User.findByIdAndUpdate(req.user._id,{$set:{
    coverImage:coverImage.url
  }}, {new:true})

   return res
    .status(200)
    .json(
        new ApiResponse(200, user, "coverImage  updated successfully")
    )
})
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAvatar,
  updateCoverImage,
  getCurrentUser,
  updateUserInfo

}