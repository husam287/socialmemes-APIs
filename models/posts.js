const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    comments: [
        {
            commentOwner:{
                type: Schema.Types.ObjectId,
                ref: 'User',
                required:true
            },
            commentContent:{
                type:String,
                required:true
            }
        }
    ]

},
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
