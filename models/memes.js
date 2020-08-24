const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memeSchema = new Schema({
    creator:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    image:{
        type:String
    },
    reacts: [
        {
            reactOwner:{
                type: Schema.Types.ObjectId,
                ref: 'User',
                required:true
            },
            reactType:{ //like,haha,dislike
                type:String,
                required:true,
            }
        }
    ],

},{timestamps:true});

module.exports = mongoose.model("Meme", memeSchema);
