const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });

module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
}

module.exports.renderNewForm = (req,res)=>{
    
    res.render("listings/new.ejs");
}
module.exports.showListings = async (req,res)=>{

    let {id}=req.params;
    const listing =await Listing.findById(id)
    .populate({path:"reviews",
    populate:
    {path:"author"},
    }).
    populate("owner","username");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});

}

module.exports.createListing = async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
    // console.log("------------",response.body.features[0].geometry);
    // res.send("done!!");

    let url = req.file.path;
    let filename = req.file.filename
    let category = req.body.listing.category
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    newlisting.geometry = response.body.features[0].geometry
    let savedlisting = await newlisting.save();
    console.log(savedlisting);
    req.flash("success","New listing created!!");
    res.redirect("/listings");
    
}

module.exports.renderEditForm = async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace("/upload","/upload/w_250");
        res.render("listings/edit.ejs",{listing , originalUrl});
    
    
}

module.exports.updateRoute = async (req,res,next)=>{
    
    let {id}=req.params;
    let listing = await Listing.findById(id);


    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename
    listing.image = {url,filename};
    await listing.save();
    }

    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","listing updated!!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyRoute = async (req,res)=>{
    let {id} = req.params;
    const deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted!!");
    res.redirect("/listings");
 }
 
//  Listing routers
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const {isloggedIn,isOwner,listingValidation} = require("../middleware.js");

const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const { storage } = require("../cloudconfig.js")
const upload = multer({ storage })
// .post(upload.single('listing[image]'), function (req, res, next) {
//     res.send(req.file);
//   })
  
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isloggedIn,
        upload.single('listing[image]'),
        listingValidation,
        wrapAsync(listingController.createListing));

//New Route
router.get("/new",isloggedIn,listingController.renderNewForm);

//search
router.get("/search",async (req,res)=>{
    
    let {search} = req.query;
    console.log("Search Query:",search);
    let listingS = await Listing.find({location:search});
    console.log("Search result:",listingS);
    try{
        if(listingS.length === 0){
            return res.send("Sorry search for another country");
        }
    }catch{
        console.log("error:","Sorry search for another country")
    }
    
    let id = listingS[0].id;
    console.log("id:",id)

    
   
    res.redirect(`/listings/${id}`)
})

router.get("/category/:category",async(req,res)=>{
    let {category} = req.params;
    console.log("category:",category);
    let categoryListing = await Listing.find({category : category});
    console.log(categoryListing);
        //res.render("listings/edit.ejs",{listing , originalUrl});
        res.render("listings/category.ejs",{categoryListing});
})
router.
    route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isloggedIn,isOwner,upload.single('listing[image]'),listingValidation,wrapAsync(listingController.updateRoute))
    .delete(isloggedIn,isOwner,wrapAsync(listingController.destroyRoute));
 
 
    //edit route
router.get("/:id/edit",
    isloggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;


const express = require("express");
// const router = express.Router({mergeParams : true });
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema}=require("../schema.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewValidation ,isloggedIn,isReviewAuthor} =require("../middleware.js")

const reviewController = require("../controllers/review.js");

//Reviews
//Post route
router.post("/",isloggedIn,reviewValidation,wrapAsync(reviewController.createReview)
);

//DELETE ROUTE
//delete review
router.delete(
    "/:reviewId",
    isloggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
); 

module.exports = router;

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

    req.flash("success","New Review created");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async(req,res)=>{
    let {id,reviewId}=req.params;
    
    
    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    //console.log(1);
    let result1=await Review.findOneAndDelete(reviewId);
    
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}