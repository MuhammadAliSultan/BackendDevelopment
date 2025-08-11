import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// ✅ Ensure comment is attached to at least one entity
commentSchema.pre("save", function (next) {
    if (!this.video) {
        return next(new Error("Comment must be associated with a video or tweet."));
    }
    next();
});

// ✅ Optional: Index for faster queries
commentSchema.index({ video: 1, createdAt: -1 });


commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
