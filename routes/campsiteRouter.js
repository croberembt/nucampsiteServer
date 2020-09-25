const express = require('express'); // using express middleware
const bodyParser = require('body-parser'); // using body-parser middleware
const Campsite = require('../models/campsite');  // using Campsite model
const authenticate = require('../authenticate'); // import authenticate module


const campsiteRouter = express.Router(); 

campsiteRouter.use(bodyParser.json()); // declaring that body-parser middleware is being used

campsiteRouter.route('/') 
    .get((req, res, next) => { // get request which is getting any/all documents that are in the collection
        Campsite.find()
        .populate('comments.author')
        .then(campsites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsites);
        })
        .catch(err => next(err)); 
    })
    .post(authenticate.verifyUser, (req, res, next) => { // creating a new document in the campsite collection
        Campsite.create(req.body)
        .then(campsite => {
            console.log('Campsite Created ', campsite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite);
        })
        .catch(err => next(err)); 
    })
    .put(authenticate.verifyUser, (req, res) => { // put request that is not supported
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any documents in the campsite collection
        Campsite.deleteMany()
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })


campsiteRouter.route('/:campsiteId') 
    .get((req, res, next) => { // get request that is getting all campsites with an id matching the requested id
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite);
        })
        .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => { // post request that is not supported
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`); 
    })
    .put(authenticate.verifyUser, (req, res, next) => { // put request that is updating any campsites that have an id matching the id requested
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
        .then(campsite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite); 
        })
        .catch(err => next(err)); 
    })
    .delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any campsites that have an id matching the id requested
        Campsite.findByIdAndDelete(req.params.campsiteId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })

campsiteRouter.route('/:campsiteId/comments') 
.get((req, res, next) => { // get request that is getting any comments that belong to the campsite that has the id being requested
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if(campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`); 
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); 
})
.post(authenticate.verifyUser, (req, res, next) => { // post request that is creating a new comment that is added to the campsite matching the id being requested
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            req.body.author = req.user._id;
            campsite.comments.push(req.body);
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err); 
        }
    })
    .catch(err => next(err)); 
})
.put(authenticate.verifyUser, (req, res) => { // put request that is not supported
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`); 
})
.delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any comments that belong to the campsite that has the id being requested
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            for (let i = (campsite.comments.length-1); i >= 0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove(); 
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite); 
            })
            .catch(err => next(err)); 
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`); 
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); 
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => { // get request that is getting the comment that matches the id of the comment being requested from the campsite with specific id being requested as well
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => { // post request that is not supported 
    res.statusCode = 403;
    res.end(`POST oparation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`); 
})
.put(authenticate.verifyUser, (req, res, next) => { // post request that is updating the comment (can be the rating and/or the body of the comment) that matches the id of the comment being requested from the campsite with specific id being requested as well
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            if (req.body.rating) {
                campsite.comments.id(req.params.commentId).rating = req.body.rating; 
            }
            if (req.body.text) {
                campsite.comments.id(req.params.commentId).text = req.body.text;
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite); 
            })
            .catch(err => next(err));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`); 
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); 
})
.delete(authenticate.verifyUser, (req, res, next) => { // delete request that is deleting the comment with an id matching the id requested that belongs to the comment with the id being requested
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            campsite.comments.id(req.params.commentId).remove();
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite); 
            })
            .catch(err => next(err)); 
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err)); 
})

module.exports = campsiteRouter;