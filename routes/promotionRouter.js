const express = require('express'); // using express middleware
const bodyParser = require('body-parser'); // using body-parser middleware
const Promotion = require('../models/promotion');  // using Promotion model
const authenticate = require('../authenticate'); 


const promotionRouter = express.Router(); 

promotionRouter.use(bodyParser.json()); // declaring that body-parser middleware is being used

promotionRouter.route('/') 
    .get((req, res, next) => { // get request which is getting any/all documents that are in the collection
        Promotion.find()
        .then(promotions => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        })
        .catch(err => next(err)); 
    })
    .post(authenticate.verifyUser, (req, res, next) => { // creating a new document in the promotion collection
        Promotion.create(req.body)
        .then(promotion => {
            console.log('Promotion Created ', promotion);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        })
        .catch(err => next(err)); 
    })
    .put(authenticate.verifyUser, (req, res) => { // put request that is not supported
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any documents in the promotion collection
        Promotion.deleteMany()
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })


promotionRouter.route('/:promotionId') 
    .get((req, res, next) => { // get request that is getting all promotions with an id matching the requested id
        Promotion.findById(req.params.promotionId)
        .then(promotion => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        })
        .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => { // post request that is not supported
        res.statusCode = 403;
        res.end(`POST operation not supported on /promotions/${req.params.promotionId}`); 
    })
    .put(authenticate.verifyUser, (req, res, next) => { // put request that is updating any promotions that have an id matching the id requested
        Promotion.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, { new: true })
        .then(promotion => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion); 
        })
        .catch(err => next(err)); 
    })
    .delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any promotions that have an id matching the id requested
        Promotion.findByIdAndDelete(req.params.promotionId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })

module.exports = promotionRouter;

