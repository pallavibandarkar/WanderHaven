const joi=require("joi");

module.exports.listingSchema = joi.object({
    listing:joi.object({  
        title:joi.string().required(),
        description:joi.string().required(),
        // image: joi.array().items(
        //     joi.object({
        //         url: joi.string().uri().required(),
        //         filename: joi.string().required(),
        //     })
        // ),
        price:joi.number().required().min(0),
        location:joi.string().required(),
        country:joi.string().required(),
        category:joi.string().required(),
        place:joi.string().required(),
        guests:joi.number().required().min(0),
        bedrooms:joi.number().required().min(0),
        beds:joi.number().required().min(0),
        bathrooms:joi.number().required().min(0),
    }).required(),
});

module.exports.reviewSchema = joi.object({
    review : joi.object({
        rating:joi.number().required().min(1).max(5),
        comment:joi.string().required(),
    }).required(),
});

module.exports.bookingSchema = joi.object({
        startDate: joi.date().required().greater('now'),
        endDate: joi.date().required().greater(joi.ref('startDate')),
        totalPrice: joi.number().required().min(0),
    }).required();