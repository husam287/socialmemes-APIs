const router = require('express').Router();
const postsController = require('../controllers/posts');
const isAuth = require('../middlewares/isAuth');
const isSameUser = require('../middlewares/isSameUser');
const upload = require('../middlewares/upload');


router.post('/add', isAuth, upload('posts'), postsController.addPost); // {content:String,image:formData} => {message}

router.get('/getAll', isAuth, postsController.getAll) //{ }=>{[posts]}

router.get('/:postId/get', isAuth, postsController.get) // {}=>{post}

router.get('/:userId/getAll', isAuth, postsController.getUserPosts) //{}=>{[userPosts]}

router.put('/:userId/edit'/*?postId*/,
    isAuth,
    isSameUser,
    upload('posts'), postsController.edit) //{content,image}=>{message:Edited successfully }

router.delete('/:userId/delete'/*?postId*/,
isAuth,
isSameUser,postsController.delete) //{}=>{message:'post deleted successfully'}

module.exports = router;