const express = require('express');
require('express-async-errors');
const cors = require('cors')
const mongoose = require('mongoose');
const path = require('path');
const products = require('./routes/products');
const orders = require('./routes/orders');
const users = require('./routes/users');
const categories = require('./routes/categories');
const copouns = require('./routes/copouns');
const banners = require('./routes/banners');
const addresses = require('./routes/addresses');
const reviews = require('./routes/reviews');
const notifications = require('./routes/notifications');
const contacts = require('./routes/contact');
const auth = require('./routes/auth');
const app = express();

var corsOptions = {
    origin: 'http://localhost:4200'
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'images')));

mongoose.connect('mongodb://localhost/ecommerce')
.then(()=>{console.log('connected')})
.catch(err=>{console.log('Error')});

app.use(cors(corsOptions));

// app.all("/*", function(req, res, next){
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
//     next();
// });

app.use('/api/products', products);

app.use('/api/orders', orders);

app.use('/api/users', users);

app.use('/api/categories', categories);

app.use('/api/copouns', copouns);

app.use('/api/banners', banners);

app.use('/api/addresses', addresses);

app.use('/api/reviews', reviews);

app.use('/api/notifications', notifications);

app.use('/api/contactUs', contacts);

app.use('/api/auth', auth);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, ()=>{
    console.log('Listening to Port ', PORT);
});

const io = require('./socket').init(server);
io.on('connection', socket=>{
    console.log('Connected To Socket');
});