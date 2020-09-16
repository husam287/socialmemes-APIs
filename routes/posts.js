const router = require('express').Router();
const postsController = require('../controllers/posts');
const isAuth = require('../middlewares/isAuth');
const isSameUser = require('../middlewares/isSameUser');
const upload = require('../middlewares/upload');
const awsUpload=require('../middlewares/awsUpload');
const getImageLink=require('../middlewares/getImageLink')


router.post('/add', isAuth, awsUpload,getImageLink, postsController.addPost); // {content:String,image:formData} => {message}

router.get('/getAll', isAuth, postsController.getAll) //{ }=>{[posts]}

router.get('/:postId/get', isAuth, postsController.get) // {}=>{post}

router.post('/:postId/like',isAuth,postsController.like) //{}=>{message}

router.post('/:postId/unlike',isAuth,postsController.unlike) //{}=>{message}

router.post('/:postId/comment',isAuth,postsController.comment) //{commentContent}=>{message}

router.delete('/:postId/delete',
isAuth,postsController.delete) //{}=>{message:'post deleted successfully'}

router.get('/:userId/getAll', isAuth, postsController.getUserPosts) //{}=>{[userPosts]}

router.put('/:postId/edit',
    isAuth,
    awsUpload,getImageLink, postsController.edit) //{content,image}=>{message:Edited successfully }

module.exports = router;