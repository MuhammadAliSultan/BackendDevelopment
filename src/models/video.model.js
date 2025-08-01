import mongoose,{Schema} from "mongoose";
import {mongooseAggregatepaginate} from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videofile:{
        typr:String,//url lagana ha
        required:true,
    }
    ,
    thumbnail:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minlength:6
    },
    title:{
        type:String,
        required:true
    },
    duration:{
        type:Number,// url to time
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    videoOwner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
videoSchema.plugin(mongooseAggregatepaginate);
export const Video=mongoose.model("Video",videoSchema);
