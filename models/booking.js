const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Listing = require("./listing.js")
const User = require("./user.js")

const bookingSchema = new Schema({
    listing:{
        type:Schema.Types.ObjectId,
        ref:"Listing",
        required:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,

    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true,
    },
    totalPrice:{
        type:Number,
        required:true
    },
    bookTime:{
        type:Date,
        required:true,
        default:Date.now()
    },
    status:{
        type:String,
        enum: ['pending', 'confirmed', 'canceled'],
        default: 'pending'
    },
    confirmedAt:{
        types:Date,
        
    },
    canceledAt:{
        type:Date,
        
    }
})

const Booking = mongoose.model("Booking",bookingSchema)
module.exports = Booking