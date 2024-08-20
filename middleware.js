const Listing = require("./models/listing");
const Review = require("./models/review");

const {listingSchema}=require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema}=require("./schema.js");

module.exports.isloggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.originalUrl);
        //redirect URL
        req.session.redirectUrl = req.originalUrl;
        console.log("OrignalURL" ,req.session.redirectUrl);
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectURL=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// module.exports.isOwner = async(req,res,next)=>{
//     let id = req.params;
//     let listing = await Listing.findById(id);
//     if(!listing.owner.equals(res.locals.currUser._id)){
//         req.flash("error","You don't have permission to edit");
//         return res.redirect(`/listings/${id}`);
//     }
    
//     next();
// }
module.exports.isOwner= async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of the listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.listingValidation = (req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
module.exports.reviewValidation = (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        console.log(errMsg);
        console.log(error);
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    console.log("review........",review)
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of the Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
