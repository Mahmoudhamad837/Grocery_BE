const express = require('express');
const ApiError = require('../Exceptions/api.error');
const HttpStatusCode = require('../Exceptions/error.status');
const { Product, validateProduct } = require('../models/product');
const { User } = require('../models/user');
const asyncMiddleware = require('../middleware/error');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Category } = require('../models/category');
const { Review } = require('../models/review');
const { ceil } = require('lodash');
const socket = require('../socket');
const router = express.Router();
const Items_Per_Page = 10;
const filters = ['category', 'price', 'search'];
// router.get('/', async(req, res, next)=>{
//     console.log('All Products');
//     const products = await Product.find();
//     res.send(products);
// });

router.get('/:id', asyncMiddleware(async (req, res, next) => {
    console.log('Product By Id');
    console.log(req.params)
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        throw new ApiError('Invalid Id', HttpStatusCode.INTERNAL_SERVER_ERROR, 'Invalid Id', true);
    }
    const reviews = await Review.find({product: req.params.id}).select('-product -__v');
    const relatedProducts = await Product.find({category: product.category._id}).skip(0).limit(5);
    const index = relatedProducts.findIndex(prod=>prod._id == product._id.toString());
    relatedProducts.splice(index, 1);
    res.send({'product': product, 'relatedProducts': relatedProducts, 'reviews': reviews});
}));

router.get('/', asyncMiddleware(async (req, res, next) => {
    const page = req.query.page || 1;
    var title = new RegExp(".*" + req.query.title + ".*");
    const filters = req.query;
    delete filters.page
    console.log('Queries:- ', filters);
    if (Object.keys(filters).length > 0) {
        if(filters.category){
            const category = await Category.findOne({'title.en': filters.category});
            if(!category){
                throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'No Such a Category', true);
            }
            filters.category = category._id.toString();
        }
        const products = await Product.find(filters)
            .populate('category', '-_id -__v')
            .select('-__v')
            .skip((page - 1) * Items_Per_Page)
            .limit(Items_Per_Page);

        const total = await Product.find(filters).countDocuments();
        
            var data = {
                data: products,
                pagination: {
                    current_page: page,
                    start_page: 1,
                    next_page: (page < ceil(total/Items_Per_Page))? page + 1: page,
                    prev_page: (page > 1) ? page-1 : page,
                    end_page: ceil(total/Items_Per_Page),
                    total_pages: ceil(total/Items_Per_Page)
                }
            };
            res.send(data);
    } else {
        const total = await Product.find().countDocuments();
        const products = await Product.find()
            .populate('category', '-_id -__v')
            .select('-__v')
            .skip((page - 1) * Items_Per_Page)
            .limit(Items_Per_Page);

        var data = {
            data: products,
            pagination: {
                current_page: page,
                start_page: 1,
                next_page: (page < ceil(total/Items_Per_Page))? page + 1: page,
                prev_page: (page > 1) ? page-1 : page,
                end_page: ceil(total/Items_Per_Page),
                total_pages: ceil(total/Items_Per_Page)
            }
        };
        socket.getIo().emit('products', data);
        res.send(data);
    }


}));

router.post('/', auth, upload.single('image'), asyncMiddleware(async (req, res, next) => {
    const { error } = validateProduct(req.body);
    if (error) {
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }

    const category = await Category.findById(req.body.category);
    if(!category){
        throw new ApiError('Invalid Category', HttpStatusCode.BAD_REQUEST, 'No Category With this Id', true);
    }

    if(!req.file){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please Choose an Image', true);
    }
    const product = new Product(req.body);
    product.image = 'http://localhost:3000/' + req.file.filename;
    const result = await product.save();
    res.send(result);
}));

router.post('/search', asyncMiddleware(async(req, res ,next)=>{
    if(!req.body.search){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please use the word search', true);
    }
    const search = req.body.search;
    const result = await Product.find({'title.en': search});
    res.send(result);
}));

router.put('/:id', auth, upload.single('image'), asyncMiddleware(async (req, res, next) => {
    console.log('Updaing Product');
    const { error } = validateProduct(req.body);

    if (error) {
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, error.message, true);
    }

    if(!req.file){
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Please Choose an Image', true);
    }
    req.body.image = 'http://localhost:3000/' + req.file.filename;
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!product) {
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Product Not Found', true);
    }
    res.send(product)
}));

router.delete('/:id', auth, asyncMiddleware(async(req, res, next) => {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
        throw new ApiError('Invalid Data', HttpStatusCode.BAD_REQUEST, 'Product Not Found', true);
    }

    res.json({'message':"Product Deleted Successfully"});
}));

module.exports = router;