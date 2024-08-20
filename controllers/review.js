const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");

//module.exports.createReview = 
// module.exports.destroyReview = async(req,res)=>{
//     let {id,reviewId}=req.params;
    
    
//     await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
//     //console.log(1);
//     let result1=await Review.findOneAndDelete(reviewId);
//     console.log("result.....",result1);
    
//     req.flash("success","Review Deleted");
//     res.redirect(`/listings/${id}`);
// }

module.exports.createReview = async(req,res)=>{
    let {id} = req.params
    let listing =await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("review saved");
    req.flash("success","New Review created");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let {id,reviewId}=req.params;
    
    
    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    //console.log(1);
    let result1=await Review.findOneAndDelete(reviewId);
    console.log("result.....",result1);
    
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}