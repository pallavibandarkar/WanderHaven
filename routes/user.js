const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectURL } = require("../middleware.js");
const {isloggedIn,isWishList } = require("../middleware.js")

const userController = require("../controllers/user.js");

router
    .route("/signup")
    .get(userController.renderSignupform)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
    saveRedirectURL,
    passport.authenticate("local",{ 
        failureRedirect: '/login' ,
        failureFlash : true
    }
    ),
    userController.login
    );
    
router.get("/logout",userController.logout);

router.get("/listing/:id/wishlist",isloggedIn,wrapAsync(userController.addTowishList))

router.get("/listing/wishlist",isloggedIn,wrapAsync(userController.getWishList))


router.get("/listings/:id/remove",isloggedIn,isWishList,wrapAsync(userController.removeWislist))

router.get("/listings/:id/propertyList",isloggedIn,wrapAsync(userController.getPropertyList))

module.exports=router;