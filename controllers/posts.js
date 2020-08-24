const Post = require('../models/posts');
const User = require('../models/users');
const resizeFile = require('../util/resizeFile');
const deleteFile = require('../util/deleteFile');


//########## add post ##########
exports.addPost = (req, res, next) => {
    const content = req.body.content;
    const image = req.file;

    //##### content inpput validation #####
    if(!content){
        const error=new Error('Edit post faild');
        error.statusCode=400;
        throw error;
    }
    
    //##### image may be not submitted #####
    let imageUrl=undefined;
    if(image){
        //new path after resize
        imageUrl = image.path + '.jpeg';
        resizeFile(image.path);
        
    }

    const post = new Post({
        creator: req.userId,
        content: content,
        image: imageUrl,
    });

    let postId; //to take the user id
    //##### save the post in posts db #####
    post.save()
        .then(result => {
            postId = result._id;

            //##### search for the creator #####
            return User.findById(req.userId)
        })
        .then(userDoc => {
            //##### pushing this post to creator own posts #####
            userDoc.posts.push(postId);
            return userDoc.save();
        })
        .then(result => {
            res.status(201).json({ message: 'Created successfully' });
        })
        .catch(err => {
            next(err);
        })

}


//########## To get all posts ##########
exports.getAll = (req, res, next) => {
    Post.find()
        .then(posts => {
            //##### if there's no posts at all #####
            if (!posts) {
                const error = new Error('no posts added yet');
                error.statusCode(404);
                throw error;
            }

            else {
                res.status(200).json(posts);
            }
        })
        .catch(err => {
            next(err);
        })
}


//########## To get specific post ##########
exports.get = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            //##### wrong id #####
            if (!post) {
                const error = new Error('post with this id can not be found');
                error.statusCode = 404;
                throw error;
            }

            else {
                res.status(200).json(post);
            }
        })
        .catch(err => {
            next(err);
        })
}


//########## get user posts ##########
exports.getUserPosts = (req, res, next) => {
    const userId = req.params.userId;
    Post.find({ creator: userId })
        .then(posts => {
            //##### user has no posts yet #####
            if (!posts) {
                const error = new Error('this user has no posts yet');
                error.statusCode = 404;
                throw error;
            }
            else {
                res.status(200).json(posts);
            }
        })
        .catch(err => {
            next(err);
        })
}


//########## get user posts ##########
exports.edit = (req, res, next) => {
    const postId = req.query.postId; //from query params
    const content = req.body.content;
    const image = req.file;

    //##### content inpput validation #####
    if(!content){
        deleteFile(image.path);
        const error=new Error('Edit post faild');
        error.statusCode=400;
        throw error;
    }
    
    Post.findById(postId)
    .then(post => {
        //##### no post with this id #####
        if (!post) {
            const error = new Error('there is any post by this id');
            error.statusCode = 404;
            throw error;
        }
        
        //##### resize the image after upload and remove old one #####
        let imageUrl;
        if (image) {
            imageUrl = image.path + '.jpeg';
            //new path after resize
            resizeFile(image.path);
            deleteFile(post.image);
        }
        
        //##### editing #####
            post.content = content ? content : post.content;
            post.image = image ? imageUrl : post.image;
            

            //##### saving #####
            return post.save()
        })
        .then(result => {
            
            res.status(201).json({ message: 'Post edited successfully.' });
        })
        .catch(err => {
            next(err);
        })
}


//########## delete post ##########
exports.delete=(req,res,next)=>{
    const postId=req.query.postId;
    Post.findByIdAndRemove(postId)
    .then(result=>{
        if(!result){
            const error=new Error('post can not found');
            error.statusCode=404;
            throw error;
        }
        //##### delete image #####
        deleteFile(result.image);

         //##### search for the creator #####
        return User.findById(req.userId)
    })
    .then(userDoc => {
        //##### pop back this post from creator own posts #####
        userDoc.posts.pop(postId);
        return userDoc.save();
    })
    .then(result=>{
        res.status(200).json({message:'Delete the post successfully!!'})
    })
    .catch(err=>{
        next(err);
    })
}

