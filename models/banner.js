const Joi = require('joi');
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    }
});

const Banner = mongoose.model('Banner', bannerSchema);

function validateBanner(banner){
    const schema = Joi.object({
        image: Joi.string().required()
    });

    return schema.validate(banner);
}

module.exports.Banner = Banner;
module.exports.validateBanner = validateBanner;