const router=require('express').Router();

const memeController=require('../controllers/memes');
const awsUpload=require('../middlewares/awsUpload');
const getImageLink=require('../middlewares/getImageLink')
const isAuth=require('../middlewares/isAuth');
const isSameUser=require('../middlewares/isSameUser');
const resizeImage = require('../middlewares/resizeImages')


router.post('/add',isAuth,awsUpload,resizeImage(600),getImageLink,memeController.add) //{image:File} => {message:String,meme:Meme}

router.get('/:memeId/get',isAuth,memeController.get) // {}=>{Meme}

router.get('getAll',isAuth,memeController.getAll) // {}=>[Meme]

router.delete('/:memeId/delete',isAuth,memeController.delete) // {}=>{message:string,memes:[Meme]}

router.post('/:memeId/reactLike',isAuth,memeController.reactLike) // {}=>{message:string, meme:Meme}

router.post('/:memeId/reactHaha',isAuth,memeController.reactHaha) // {}=>{message:string, meme:Meme}

router.post('/:memeId/reactUnlike',isAuth,memeController.reactUnlike) // {}=>{message:string, meme:Meme}




module.exports=router;