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
    console.log(listing);
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
    console.log("Category:",category);
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
    console.log(deletedListing);
    req.flash("success","listing Deleted!!");
    res.redirect("/listings");
 }
 