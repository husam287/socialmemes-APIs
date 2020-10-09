const Meme = require('../models/memes');
const User = require('../models/users');
const errorFunction = require('../util/errorFunction');
const removeFromAws=require('../util/deleteByUrlFromAws');


exports.add = (req,res,next)=>{

    //##### extracting informations #####
    const imagePath = req.file.path;
    const meme = new Meme({
        creator:req.userId,
        image:imagePath,
        reacts:[]
    })

    let memeId;
    //##### meme saveing #####
    meme.save()
    .then(savedMeme=>{
        memeId=savedMeme._id;
        return User.findById(req.userId);
    })
    .then(userDoc=>{
        userDoc.memes.push(memeId);
        res.status(201).json({message:'Meme Added Successfully!!',meme:meme});
    })
    .catch(err=>{
        next(err);
    })
}

exports.get = (req,res,next)=>{

    const memeId = req.params.memeId
    //##### finding meme by Id #####
    Meme.findById(memeId)
    .populate('creator reacts.reactOwner','_id name image')
    .then(meme=>{
        //meme not found
        if(!meme) {throw errorFunction('No Meme By This Id !',404)}

        //sending
        res.status(201).json(meme);
    })
    .catch(err=>{
        next(err);
    })
}

exports.getAll= (req,res,next)=>{

    //##### find all memes #####
    Meme.find()
    .populate('creator reacts.reactOwner','_id name image')
    .then(result=>{
        //##### if memes array is empty #####
        if(result.length<=0) {throw errorFunction('Memes is empty now add some please !',404)}

        //##### Sending the array #####
        res.status(201).json(result);
    })
    .catch(err=>{
        next(err);
    })
}

exports.delete = (req,res,next)=>{
    // const memeId = req.params.memeId;

    // //##### Finding a specific meme and delete it #####
    // Meme.findByIdAndRemove(memeId)
    // .then(result=>{
    //     result
    // })
}

exports.reactLike = (req,res,next)=>{
    
}

exports.reactHaha = (req,res,next)=>{
    
}

exports.reactUnlike = (req,res,next)=>{
    
}