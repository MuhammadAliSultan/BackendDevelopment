import mongoose,{Schema} from "mongoose";
import {jwt} from "jsonwebtoken";
import {bycrypt} from "bcrypt";
const userSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    }
    ,email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is Required"],
        minlength:6
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,// url to avatar image
        required:true
    },
    coverImage:{
        type:String,//url to image
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    refreshToken:{
        type:String,
    }

},{timestamps:true})


// for encrypting password
userSchema.pre("save",async function (next){
    if(this.ismodified("password")){
        this.password=await bycrypt.hash(this.password,10)
    }
    next();
})

// password comparing
userSchema.methods.isPasswordCorrect=async function(password){
    return await bycrypt.compare(password, this.password);
}


//jwt 
//jwt is a bearer token
// its like a key
userSchema.methods.generateAccessToken = function () {
    return  jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};



userSchema.methods.generateRefreshToken=async function(){
return  jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User=mongoose.model("User",userSchema);
export default User;