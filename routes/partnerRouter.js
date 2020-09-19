const express = require('express'); // using express middleware
const bodyParser = require('body-parser'); // using body-parser middleware
const Partner = require('../models/partner');  // using Partner model


const partnerRouter = express.Router(); 

partnerRouter.use(bodyParser.json()); // declaring that body-parser middleware is being used

partnerRouter.route('/') 
    .get((req, res, next) => { // get request which is getting any/all documents that are in the collection
        Partner.find()
        .then(partners => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        })
        .catch(err => next(err)); 
    })
    .post((req, res, next) => { // creating a new document in the partner collection
        Partner.create(req.body)
        .then(partner => {
            console.log('Partner Created ', partner);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
        .catch(err => next(err)); 
    })
    .put((req, res) => { // put request that is not supported
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete((req, res, next) => { // delete request that is deleting any documents in the partner collection
        Partner.deleteMany()
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })


partnerRouter.route('/:partnerId') 
    .get((req, res, next) => { // get request that is getting all partners with an id matching the requested id
        Partner.findById(req.params.partnerId)
        .then(partner => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
        .catch(err => next(err));
    })
    .post((req, res) => { // post request that is not supported
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`); 
    })
    .put((req, res, next) => { // put request that is updating any partners that have an id matching the id requested
        Partner.findByIdAndUpdate(req.params.partnerId, {
            $set: req.body
        }, { new: true })
        .then(partner => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner); 
        })
        .catch(err => next(err)); 
    })
    .delete((req, res, next) => { // delete request that is deleting any partners that have an id matching the id requested
        Partner.findByIdAndDelete(req.params.partnerId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })

module.exports = partnerRouter;