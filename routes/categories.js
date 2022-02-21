const express = require('express');
const {Category, validateCategory} = require('../models/category');
const asyncMiddleware = require('../middleware/error');
const auth = require('../middleware/auth');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const upload = require('../middleware/upload');
const router = express.Router();
const Items_Per_Page = 2;

router.get('/', asyncMiddleware(async(req, res, next)=>{
    const page = req.query.page || 1;
    const result = await Category.find()
    .skip((page - 1) * Items_Per_Page)
    .limit(Items_Per_Page);

    res.send(result);
}));

router.get('/:id', asyncMiddleware(async(req, res, next)=>{
    const category = await Category.findById(req.params.id);
    if(!category){
        throw new ApiError('Invalid Id', HttpStatusCode.BAD_REQUEST, 'No Category With The given Id', true);
    }

    res.send(category);
}));

router.post('/', auth, upload.single('image'), asyncMiddleware(async(req, res, next) => {
    
    const {error} = validateCategory(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    const category = new Category(req.body);
    if(!req.file){
        throw new ApiError('Invalid Data', HttpStatusCode.INTERNAL_SERVER_ERROR, 'Please Choose an Image', true);
    }
    category.image = 'http://localhost:3000/' + req.file.filename;
    const result = await category.save();
    res.send(result);

}));

router.put('/:id', auth, upload.single('image'), asyncMiddleware(async(req, res, next)=>{
    console.log(req.params)
    const {error} = validateCategory(req.body);
    if(error){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }
    if(req.file){
        req.body.image = 'http://localhost:3000/' + req.file.filename;
        // throw new ApiError('Invalid Data', HttpStatusCode.INTERNAL_SERVER_ERROR, 'Please Choose an Image', true);
    }
    
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!category){
        throw new ApiError('Invalid Id', HttpStatusCode.BAD_REQUEST, 'No Such a given Id', true);
    }
    res.json({'categories': category});
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const category = await Category.findByIdAndRemove(req.params.id);
    if(!category){
        throw new ApiError('Invalid Id', HttpStatusCode.BAD_REQUEST, 'No Such an Id', true);
    }
    res.json({message:'Category Deleted Successfully'});
}));

module.exports = router;