const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        
    }, 
    image: {
        type: String,
        default: "images/unknown.png",
    },
    bio: {
        type: String,
        default:"nothing here"
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref:'Post'
    }],
    memes:[
        {
            type:Schema.Types.ObjectId,
            ref:'Meme'
        }
    ]
    
});


module.exports = mongoose.model("User", userSchema);
