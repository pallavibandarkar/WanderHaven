const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });
const axios = require('axios');
const Review = require("../models/review.js");
const cloudinary = require('cloudinary').v2;


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
    // let response = await geocodingClient.forwardGeocode({
    //     query: req.body.listing.location,
    //     limit: 1
    //   })
    //     .send()
    // console.log("------------",response.body.features[0].geometry);
    // res.send("done!!");

    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: req.body.listing.location,  // Location from the form
          key: process.env.OPENCAGE_API_KEY,  // Replace with your OpenCage API key
          language: 'en',  // Set language to English
          limit: 1  // Limit to 1 result
        }
    });

    if(response.data.results.length === 0) {
        req.flash("error", "Location not found!");
        return res.redirect("/listings");
      }
  
      // Get the geometry (coordinates) from the response
    const resultGeometry = response.data.results[0].geometry;
    const geometry = {
        type: "Point",  // Set the type to "Point" as per your schema
        coordinates: [resultGeometry.lng, resultGeometry.lat]  // Format as [longitude, latitude]
    };

    console.log(geometry)
    let url = req.file.path;
    let filename = req.file.filename
    let category = req.body.listing.category
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    newlisting.geometry =geometry
    let savedlisting = await newlisting.save();

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

    if(req.body.listing.location){
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
              q: req.body.listing.location,  // Location from the form
              key: process.env.OPENCAGE_API_KEY,  // Replace with your OpenCage API key
              language: 'en',  // Set language to English
              limit: 1  // Limit to 1 result
            }
        });
    
        if(response.data.results.length === 0) {
            req.flash("error", "Location not found!");
            return res.redirect("/listings");
        }
      
        const resultGeometry = response.data.results[0].geometry;
        const geometry = {
            type: "Point",
            coordinates: [resultGeometry.lng, resultGeometry.lat]  //[longitude, latitude]
        };
    
        console.log(geometry)
        listing.geometry = geometry
        const data = await listing.save()
    }

    // if(typeof req.file !== "undefined"){
    // let url = req.file.path;
    // let filename = req.file.filename
    // listing.image = {url,filename};
    // await listing.save();
    // }

    if(req.file){
        if(listing.image && listing.image.filename){
            const file = await cloudinary.uploader.destroy(listing.image.filename);
            console.log(file)
        }
        listing.image = {
            url : req.file.path,
            filename : req.file.filename
        }

        await listing.save()
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
    let listing = await Listing.findById(id)

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if(listing.image && listing.image.filename){
        const file = await cloudinary.uploader.destroy(listing.image.filename);
        console.log(file,"Listing image successfully deleted from cloudinary")
    }
    const deletedListing=await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted!!");
    res.redirect("/listings");
}
 