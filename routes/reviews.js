const express = require("express");
const router = express.Router({mergeParams : true });
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