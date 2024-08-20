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