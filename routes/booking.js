const express = require("express");
const router = express.Router({mergeParams : true });
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const {isloggedInToBook,isloggedIn,bookingValidation} = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");
const bookingController = require("../controllers/booking.js")

router.post("/book",isloggedInToBook,bookingValidation,wrapAsync(bookingController.bookAplace))


router.get("/bookings",isloggedIn,wrapAsync(bookingController.getBookings))

module.exports = router