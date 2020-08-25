const User = require('../models/users');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const deleteFile=require('../util/deleteFile');
const resize=require('../util/resizeFile');


//########## Sign up ##########


exports.signup = (req, res, next) => {
    //validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Errors');
        error.statusCode = 400;
        error.data = errors.array();
        throw error;
    }


    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    //##### Hash the password #####
    bcrypt.hash(password, 12)
        .then((hashed) => {
            const user = new User({
                name: name,
                email: email,
                password: hashed,
            });
            return user.save();
        })
        .then(userDoc => {
            console.log('Account created successfully');
            res.status(201)
                .json({ message: 'Account is created successfully', userId: userDoc._id })
        })
        .catch((err) => {
            next(err);
        })


}


//########## log in and get token , user id, and expire Date ##########


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let fetchedUser;
    User.findOne({ email: email })
        //##### Find This email in db #####
        .then(user => {
            if (!user) {
                console.log(user);
                const error = new Error('This Email is not exists');
                error.statusCode = 401;
                throw error;
            }
            fetchedUser = user;
            //##### compare password #####
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Password is not correct');
                error.statusCode = 401;
                throw error;
            }
            //##### Create the token #####
            const tokenTimeInHours = 1;
            const token = jwt.sign({ userId: fetchedUser._id }, 'husam23214895', { expiresIn: tokenTimeInHours.toString() + 'h' });
            const expireDate = new Date().getTime() + tokenTimeInHours * 1000 * 60 * 60;
            res.status(202).json(
                {
                    token: token,
                    userId: fetchedUser._id,
                    expireDate: new Date(expireDate)
                })
        })
        .catch(err => {
            next(err);
        })

}


//########## To get user by sent id in params ##########


exports.getUserInfo = (req, res, next) => {
    const userId = req.params.userId;
    let fetchedUser = '';

    User.findById(userId)
    .select('-__v -email -password')
    .populate({
        path:'posts',
        populate:{
            path:'creator comments.commentOwner likes',
            select:'_id name image'
        }
        
    })
        //##### reject if there is no user like this #####
        .then(user => {
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }
            //user.posts=user.populated('posts.creator');
            //##### Removing password and userId #####
            res.status(200).json(user);
        })
        .catch(err => {
            next(err)
        })
}


//########## To get all users id in array ##########


exports.getAllUsers = (req, res, next) => {
    User.find()
        .then(usersDoc => {

            if (!usersDoc) {
                const error = new Error('No users found')
                error.statusCode = 404;
                throw error;
            }

            //##### Extract ids #####
            const modified=usersDoc.map(i=>{
                return {_id:i._id, name:i.name, image:i.image};
            })
            
            res.status(200).json(modified);
        })
        .catch(err => {
            next(err)
        })
}


//########## To edit specific user ##########


exports.editUser = (req, res, next) => {
    const name = req.body.name;
    const image = req.file;
    const bio = req.body.bio;
    
    if(!name&&!image&&!bio){
        const error =new Error('you must edit one thing at least');
        error.statusCode=400;
        throw error;
    }

    //##### get the user for old data #####
    let user;
    User.findById(req.userId)
        .then(userDoc => {
            user = userDoc;
            let imageUrl;
            //##### successfully editing #####
            if(image){
                imageUrl=image.path+'.jpeg';
                resize(image.path);
            }

            
            //##### successfully editing #####
            return User.findByIdAndUpdate({ _id: req.userId }, {
                name: name ? name : user.name,
                image: image ? imageUrl : user.image,     //if empty body assign old value
                bio: bio ? bio : user.bio
            })
            .then(result => {
                if(result.image!=='/images/unknown.png'){
                    deleteFile(result.image);
                }
                res.status(201).json({ message: 'Edited successfully!!' })
            })
            .catch(err => {
                next(err);
            })
        })
        .catch(err => {
            next(err);
        })

}


//########## change password ##########


exports.changePassword=(req,res,next)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation Errors');
        error.statusCode = 400;
        error.data = errors.array();
        throw error;
    }
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    //##### find user that login #####
    User.findById(req.userId)
        .then(userDoc=>{
            //##### check password #####
            return bcrypt.compare(oldPassword,userDoc.password)
        })
        .then(isEqual=>{
            //##### pass not correct #####
            if(!isEqual){
                const error = new Error('Incorrect Password');
                error.statusCode=403;
                throw error;
            }
            //##### password correct so hash it #####
            return bcrypt.hash(newPassword,12);
        })
        .then(hashedPass=>{
            return User.findByIdAndUpdate(req.userId,{password:hashedPass})
        })
        .then(result=>{
            //##### successfully changed #####
            res.status(201).json({message:"Password changed successfully"});
        })
        .catch(err=>{
            next(err)
        })
        
}


