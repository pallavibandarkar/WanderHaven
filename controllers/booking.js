const Listing=require("../models/listing.js");
const User = require('../models/user')
const Booking = require("../models/booking.js")


module.exports.bookAplace = async(req,res)=>{
    
    const {startDate,endDate,totalPrice} = req.body;
    const {id} = req.params;
    
    const listing = await Listing.findById(id)

    if(!listing){
        req.flash("error","Listing does not exit")
        return res.redirect("/listings")
    }

    const userId = req.user._id;
    if(!req.user){
        req.flash("error","You must be logged to book!!")
        return res.redirect("/login")
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
    res.render("users/booking.ejs",{userBookings,wishList})
}

module.exports.cancelRoute = async(req,res)=>{
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if(!booking){
        req.flash("error","Booking does not exist")
        return res.redirect("/listings")
    }
    booking.status = "canceled"
    const result = await booking.save()
    req.flash("success","Booking status is updated to canceled!!")
    res.redirect(`/listings/reservations/${req.user._id}`)
}

module.exports.confirmRoute = async(req,res)=>{
    const id = req.params.id;
    const booking = await Booking.findById(id);
    if(!booking){
        req.flash("error","Booking does not exist")
        return res.redirect("/listings")
    }
    booking.status = "confirmed"
    const result = await booking.save()

    req.flash("success","Booking status is updated to Confirmed!!")
    res.redirect(`/listings/reservations/${req.user._id}`)
}