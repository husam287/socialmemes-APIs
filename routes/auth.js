const router=require('express').Router();
const authController=require('../controllers/auth');
const {body} = require('express-validator/check');
const User=require('../models/users');


const isAuth=require('../middlewares/isAuth');
const isSameUser=require('../middlewares/isSameUser');
const upload=require('../middlewares/upload');
//email,password,name to sign up
router.post('/signup',[
    //Email validation
    body('email')
    .not()
    .isEmpty()
    .isEmail()
    .custom((value,{req})=>{
       return User.findOne({email:value})
        .then(result=>{
            if(result){
                return Promise.reject('Email is already exist')
            }
            
        })
    }),
    //password validation
    body('password')
    .trim()
    .not()
    .isEmpty(),
    //name validation
    body('name')
    .trim()
    .isString()
    .not()
    .isEmpty()],
    authController.signup)

router.post('/login',authController.login) //{email,password} => token,userId,expireDate

router.get('/:userId/get',isAuth,authController.getUserInfo) //{} => {name,email,image,bio,posts:[],memes:[]}

router.get('/getAll',isAuth,authController.getAllUsers) //{} => [{_id,name,image}]

router.put('/:userId/edit',isAuth,isSameUser,upload("profilePic"),authController.editUser) // {name?,image?,bio?} => {message}

router.put('/:userId/changePassword',[
    body('oldPassword')
    .not()
    .isEmpty(),
    body('newPassword')
    .not()
    .isEmpty()
],isAuth,isSameUser,authController.changePassword) //{oldPassword,newPassword} =>{message}


module.exports=router;