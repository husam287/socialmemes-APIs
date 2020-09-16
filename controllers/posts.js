const Post = require('../models/posts');
const User = require('../models/users');
const resizeFile = require('../util/resizeFile');
const deleteFile = require('../util/deleteFile');
const errorFunction = require('../util/errorFunction');
const removeFromAws=require('../util/deleteByUrlFromAws')

//########## add post ##########


exports.addPost = (req, res, next) => {
    const content = req.body.content;
    const image = req.file;
    const imageUrl= image? image.path:undefined;
    //##### content inpput validation #####
    if (!content) {
        const error = new Error('Content is not send');
        error.statusCode = 400;
        throw error;
    }

    //##### image may be not submitted #####
    

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
        .select('-__v')
        .populate({
            path: 'creator likes comments.commentOwner',
            select: '_id name image',
        })
        .exec()
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
        .select('-__v')
        .populate('likes comments.commentOwner creator', '_id name image')
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
    .populate({
        path: 'creator likes comments.commentOwner',
        select: '_id name image',
    })
        .then(posts => {
            //##### user has no posts yet #####
            if (posts.length<=0) {
                throw errorFunction('this user has no posts yet', 404);
            }
            else {
                res.status(200).json(posts);
            }
        })
        .catch(err => {
            next(err);
        })
}


//########## edit user posts ##########


exports.edit = (req, res, next) => {
    const postId = req.params.postId;
    const content = req.body.content;
    const image = req.file;

    //##### content inpput validation #####
    if (!content) {
        const error = new Error('Edit post faild');
        error.statusCode = 400;
        throw error;
    }

    let editedPost;

    Post.findById(postId)
        .populate({
            path: 'creator likes comments.commentOwner',
            select: '_id name image',
        }).exec()
        .then(post => {
            // ##### user Permission rejection #####
            if (req.userId.toString() !== post.creator._id.toString()) {
                throw errorFunction('You have no permissions', 401);
            }
            //##### no post with this id #####
            if (!post) {
                const error = new Error('there is any post by this id');
                error.statusCode = 404;
                throw error;
            }

            //##### resize the image after upload and remove old one #####
            let imageUrl;
            if (image) {
                imageUrl=image.path;
                if (post.image) {
                    removeFromAws(post.image);
                }
            }

            //##### editing #####
            post.content = content ? content : post.content;
            post.image = image ? imageUrl : post.image;

            //##### assigning the updated post #####
            editedPost=post

            //##### saving #####
            return post.save()
        })
        .then(result => {

            res.status(201).json({ message: 'Post edited successfully.', updatedPost: editedPost });
        })
        .catch(err => {
            next(err);
        })
}


//########## delete post ##########


exports.delete = (req, res, next) => {
    const postId = req.params.postId;
    //##### get post #####
    Post.findById(postId)
        .then(result => {
            if (!result) {
                const error = new Error('post can not found');
                error.statusCode = 404;
                throw error;
            }
            if (result.creator.toString() !== req.userId.toString()) {
                throw errorFunction("You don't have permissions", 403);
            }
            //##### delete image if image found #####
            if (result.image) {
                removeFromAws(result.image);
            }
            //##### delete post from posts #####
            return Post.findByIdAndRemove(postId);
        })
        .then(() => {
            //##### search for the creator #####
            return User.findById(req.userId)

        })
        .then(userDoc => {
            //##### pop back this post from creator own posts #####
            userDoc.posts.pop(postId);
            return userDoc.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Delete the post successfully!!' })
        })
        .catch(err => {
            next(err);
        })
}


//########## comment in post ##########


exports.comment = (req, res, next) => {
    const postId = req.params.postId;
    const commentContent = req.body.commentContent;

    console.log(commentContent);
    //##### the comment #####
    const comment = {
        commentOwner: req.userId,
        commentContent: commentContent
    }
    Post.findById(postId)
        .then(postDoc => {
            //##### No post by this id #####
            if (!postDoc) {
                const error = new Error('No post data')
                error.statusCode(404);
                throw error;
            }
            //##### edits comments array #####
            postDoc.comments.push(comment);
            return postDoc.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Comment added successfully' })
        })
        .catch(err => {
            next(err);
        })
}


//########## like post ##########


exports.like = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(postDoc => {
            //##### if no data #####
            if (!postDoc) {
                throw errorFunction("There's no post by this id", 404);
            }
            //##### if already liked #####
            const likes = postDoc.likes.map(i => {
                return i.toString();
            })

            if (likes.indexOf(req.userId.toString()) >= 0) {
                throw errorFunction("You're already like this post", 400);
            }

            //##### edit likes array #####
            postDoc.likes.push(req.userId);
            return postDoc.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Liked successfully!' });
        })
        .catch(err => {
            next(err);
        })
}


//########## unlike ##########


exports.unlike = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(postDoc => {
            //##### if no data #####
            if (!postDoc) {
                throw errorFunction("There's no post by this id", 404);
            }
            //##### if already liked #####
            const likes = postDoc.likes.map(i => {
                return i.toString();
            })

            if (likes.indexOf(req.userId.toString()) < 0) {
                throw errorFunction("you haven't liked this post yet", 400);
            }

            //##### edit likes array #####
            postDoc.likes.pop(req.userId);
            return postDoc.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Unliked successfully!' });
        })
        .catch(err => {
            next(err);
        })
}