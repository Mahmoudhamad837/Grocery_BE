const express = require('express');
const { Banner, validateBanner } = require('../models/banner');
const auth = require('../middleware/auth');
const asyncMiddleware = require('../middleware/error');
const upload = require('../middleware/upload');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const router = express.Router();

router.get('/', asyncMiddleware(async(req, res, next)=>{
    const banners = await Banner.find();
    res.json({data: banners});
}));

router.get('/:id', asyncMiddleware(async(req, res, next)=>{
    const banner = await Banner.findById(req.params.id);
    if(!banner){
        throw new ApiError('Invalid Id', HttpStatusCode.BAD_REQUEST, 'Invalid ID', true);
    }
    res.json({data: banner});
}));

router.post('/', auth, upload.array('image', 4), asyncMiddleware(async(req, res, next)=>{
    const count = await Banner.find().countDocuments();
    if(req.files.length > (4-count)){
        throw new ApiError('Invalid', HttpStatusCode.BAD_REQUEST, 'You have to upload only ' + (4-count) + ' images', true);
    }
    if(count >= 4){
        throw new ApiError('Invalid', HttpStatusCode.BAD_REQUEST, 'The Maximum photos count is 4', true);
    }
    console.log(req.files);
    for(image of req.files){
        const banner = new Banner({image: 'http://localhost:3000/' + image.filename});
        await banner.save();
    }
    res.send({message: 'Banner Images Uploaded Successfully'});
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next)=>{
    const banner = await Banner.findByIdAndRemove(req.params.id);
    if(!banner){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Invalid ID', true);
    }

    res.json({message: 'Banner Image Deleted Successfully'});
}));

module.exports = router;