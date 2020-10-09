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

    let memePopulated;
    //##### meme saveing #####
    meme.save()
    .then(savedMeme=>{
        //populating saved Meme
        return savedMeme.populate('creator reacts.reactOwner','_id name image').execPopulate()
    })
    .then(populatedStuff=>{
        memePopulated=populatedStuff;
        //find user by id
        return User.findById(req.userId);
    })
    .then(userDoc=>{
        userDoc.memes.push(memePopulated._id); //pushing the meme to user's memes array
        //saving
        userDoc.save()
        res.status(201).json({message:'Meme Added Successfully!!',meme:memePopulated});
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
    const memeId = req.params.memeId;
    let removedMeme;

    //##### Checking The Real Owner #####
    Meme.findById(memeId)
    .then(result=>{
        if(result.creator.toString()!==req.userId.toString()){
            throw errorFunction("You don't have permissions", 403);
        }
    })
    .catch(err=>{
        next(err);
    })


    //##### Finding a specific meme and delete it #####
    Meme.findByIdAndRemove(memeId)
    .then(result=>{
        removedMeme=result;
        return User.findById(req.userId)
    })
    //##### removing from user's memes array ######
    .then(userDoc=>{
        userDoc.memes.forEach((value,i)=>{
            if(value._id.toString()===removedMeme._id.toString()){
                userDoc.memes.splice(i,1);
            }
        })
        userDoc.save(); //saving user again
        removeFromAws(removedMeme.image); //removing the image
        res.status(200).json({message:'Deleted Successfully!!'}) //sending response
    })
    .catch(err=>{
        next(err)
    })
}

exports.reactLike = (req,res,next)=>{
    const memeId = req.params.memeId;

    react('like',memeId);
}

exports.reactHaha = (req,res,next)=>{
    const memeId = req.params.memeId;
    
    react('haha',memeId);

}

exports.reactAngry = (req,res,next)=>{
    const memeId = req.params.memeId;
    
    react('angry',memeId);

}

exports.removeReact = (req,res,next)=>{
    const memeId = req.params.memeId;
    
    //##### search for the meme #####
    Meme.findById(memeId)
    .then(fetchedMeme=>{
        //##### remove userId from react list #####
        fetchedMeme.reacts.forEach((value,i)=>{
            if(value.reactOwner.toString()===req.userId.toString()){
                fetchedMeme.reacts.splice(i,1);
            }
        })
        
        return fetchedMeme.save()
    })
    //##### populating edited meme #####
    .then(result=>{
        return result.populate('creator reacts.reactOwner','_id name image').execPopulate()
    })
    .then(result=>{
        res.status(201).json({message:'Unreacted successfully',meme:result})
    })
    .catch(err=>{
        next(err);
    })
}


//##### private React Function #####
const react = (reactType,memeId)=>{

    //##### finding the meme #####
    Meme.findById(memeId)
    .then(fetchedMeme=>{

        //##### checking if user reacted or not #####
        fetchedMeme.reacts.forEach(value=>{
            if(req.userId.toString()===value.reactOwner.toString()){
                throw errorFunction("You're already like this post", 400);
            }
        })


        //React details
        const AddedReact = {
            reactOwner:req.userId,
            reactType:reactType
        }
        
        //pushing the react to meme's Reacts
        fetchedMeme.reacts.push(AddedReact);

        
        //saving the meme
        return fetchedMeme.save()
    })
    .then(result=>{
        //populate the saved meme
        return result.populate('creator reacts.reactOwner','_id name image').execPopulate()
    })
    .then(result=>{
        //sending response
        res.status(200).json({message:'You Reacted '+reactType+" to this Meme.",meme:result})
    })
    .catch(err=>{
        next(err);
    })
}