const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken });
const axios = require('axios');
const Review = require("../models/review.js");
const cloudinary = require('cloudinary').v2;
const User = require('../models/user')
const Booking = require("../models/booking.js")


module.exports.bookAplace = async(req,res)=>{
    
    const {startDate,endDate,totalPrice} = req.body;
    const {id} = req.params;
    
    const listing = await Listing.findById(id)

    if(!listing){
        res.status(200).send({success:false,msg:'Listing Not found'})
    }

    const userId = req.user._id;
    if(!req.user){
        res.status(200).send({success:false,msg:"User Not fount"});

    }

    const booking = new Booking({
        listing:listing._id,
        user : userId,
        startDate:startDate,
        endDate:endDate,
        totalPrice:totalPrice
    })
    const result = await booking.save()

    req.flash("success","Booking Done!!");
    res.redirect(`/listing/${userId}/bookings`)
}

module.exports.getBookings = async(req,res)=>{
    const id = req.user._id;
    const userBookings = await Booking.find({user:id}).populate('user').populate('listing')

    let wishList = [];
    
    if (req.isAuthenticated()) {
        const userData = await User.findById(req.user._id);
        if (userData) {
            wishList = userData.wishList.map(listing => listing.toString());
        }
    }

    if(userBookings.length === 0){
        return res.render("error.ejs",{message:"No bookings found"})
    }
    console.log("Booked List",userBookings)
    res.render("users/booking.ejs",{userBookings,wishList})
    
}