import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'blog',
        required: true
    },
    name: {
        type: String,
        required: true

    },
    content: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false,
        required: true
    }
}, {timestamps: true});

const Comment = mongoose.model('comment', commentSchema);

export default Comment;