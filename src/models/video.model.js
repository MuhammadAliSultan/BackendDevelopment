import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define schema
const videoSchema = new Schema({
  videofile: {
    type: String, // Fixed typo: 'typr' -> 'type'
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 6,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // In seconds or minutes (you decide)
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  videoOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true
});

// Plugin for pagination
videoSchema.plugin(mongooseAggregatePaginate);

// Export model
export const Video = mongoose.model("Video", videoSchema);
