const Joi = require('joi');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: mongoose.Schema({
        ar: {type: String, required: true},
        en: {type: String, required: true}
    }),
    description: mongoose.Schema({
        ar: {type: String, required: true},
        en: {type: String, required: true}
    }),
    image: {
        type: String,
        required: true
    }
});

const Category = mongoose.model('Category', categorySchema);

function validateCategory(category){
    const schema = Joi.object({
        title: Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required()
        }),
        description: Joi.object({
            ar: Joi.string().required(),
            en: Joi.string().required()
        }),
        image: Joi.string()
    });

    return schema.validate(category);
}

module.exports.Category = Category;
module.exports.validateCategory = validateCategory;