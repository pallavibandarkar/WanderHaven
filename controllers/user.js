
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.renderSignupform = (req,res)=>{
    res.render("./users/signup.ejs");
}

module.exports.signup = async (req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser = new User ({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,((err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to wanderlust");
            res.redirect("/listings");
        }))
        

    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
    
    
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("./users/login.ejs")
}

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome back to wanderlust!!");
        // res.locals.redirectUrl = req.session.redirectUrl;
        let redirectUrl = res.locals.redirectUrl || "/listings"
        console.log(redirectUrl);
        res.redirect(redirectUrl);
}

module.exports.logout = (req,res)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!!");
        res.redirect("/listings");
    })
}

module.exports.addTowishList = async (req, res) => {
    const { id } = req.params;

    try {
        const userData = await User.findById(req.user._id);
        if (!userData) {
            req.flash("error","User Not found!");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error","Listing you requested for does not exist");
            return res.redirect("/listings");
        }

        if (userData.wishList.includes(listing._id)) {
            req.flash("error","Listing already in wishlist");
            return res.redirect("/listings");
        }

        userData.wishList.push(listing._id);
        await userData.save();

        req.flash("success","Added to wishlist");
        return res.redirect("/listing/wishlist");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding to wishlist" });
    }
};

module.exports.getWishList = async(req,res)=>{
    try {
        const getuser = await User.findById(req.user._id)
            .populate({
                path: "wishList",
                model: "Listing"
            });

        console.log(getuser); 

        if(getuser.wishList.length === 0){
            return res.render("error.ejs",{message:"No WishList Found"})
        }
        
        res.render("users/wishList.ejs",{getuser});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports.removeWislist=async(req,res)=>{
    try {
        const {id} = req.params
        const getuser = await User.findByIdAndUpdate(req.user._id,{$pull : {wishList:id}})
        req.flash("success","Removed From Wishlist")
        res.redirect("/listing/wishlist")
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports.getPropertyList = async(req,res)=>{
    try{
        const {_id} = req.user;

        const properties = await Listing.find({owner:_id}).populate('owner')
        if(properties.length === 0){
            res.render("error.ejs","No Properties Found")
        }

        let wishList = [];
            
        if (req.isAuthenticated()) {
            const userData = await User.findById(req.user._id);
            if (userData) {
                wishList = userData.wishList.map(listing => listing.toString());
            }
        }
        res.render("users/properties.ejs",{properties,wishList})
    }
    catch(err){
        console.log(err)
    }
}