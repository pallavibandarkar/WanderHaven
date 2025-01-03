const Listing = require("./models/listing");
const User = require("./models/user.js")
const Review = require("./models/review");

const {listingSchema}=require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema}=require("./schema.js");
const {bookingSchema} = require("./schema.js");
const Booking = require("./models/booking.js");

module.exports.isloggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.originalUrl);
        console.log("Parameters",req.params)
        //redirect URL
        req.session.redirectUrl = req.originalUrl;
        console.log("OrignalURL" ,req.session.redirectUrl);
        req.flash("error","You must be logged in to create new listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.isloggedInToBook = (req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log("Parameters",req.params)
        console.log(req.originalUrl)
        const id = req.params.id
        //redirect URL
        req.session.redirectUrl = `/listings/${id}`;
        console.log("OrignalURL" ,req.session.redirectUrl);
        req.flash("error","You must be logged in to Book");
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
        console.log(errMsg)
        throw new ExpressError(400,errMsg);

    }else{
        next();
    }
};
module.exports.bookingValidation=(req,res,next)=>{
    let {error} = bookingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el) => el.message).join(",");
        console.log(errMsg)
        throw new ExpressError(400,errMsg);
    }else{
        next()
    }
}
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

module.exports.isWishList = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const user = await User.findById(req.user._id); // Find the user by ID

        if (!user) {
            return res.status(404).send({ success: false, msg: "User  not found" });
        }
        const isInWishList = user.wishList.includes(id);
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, msg: "Internal server error" });
    }
};

module.exports.propertyOwner = async(req,res,next)=>{
    const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        const listing = await Listing.findById(booking.listing);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }

        if(listing.owner.equals(req.user._id)){
            next();
        }
        
}

