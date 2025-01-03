const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const {isloggedIn,isOwner,listingValidation} = require("../middleware.js");

const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const { storage } = require("../cloudconfig.js");
const Booking = require("../models/booking.js");
const upload = multer({ storage })
// .post(upload.single('listing[image]'), function (req, res, next) {
//     res.send(req.file);
//   })
  
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isloggedIn,
        upload.array('listing[image]',10),
        listingValidation,
        wrapAsync(listingController.createListing));

//New Route
router.get("/new",isloggedIn,listingController.renderNewForm);

router.get("/category/:category",wrapAsync(listingController.categoryListing))

router.
    route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isloggedIn,isOwner,upload.array('listing[image]',10),
        listingValidation,wrapAsync(listingController.updateRoute))
    .delete(isloggedIn,isOwner,wrapAsync(listingController.destroyRoute));
 
 
//edit route
router.get("/:id/edit",
    isloggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

router.post("/search",wrapAsync(listingController.search))

router.get("/reservations/:id",isloggedIn,wrapAsync(listingController.reservations))

module.exports = router;