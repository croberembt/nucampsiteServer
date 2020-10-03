const express = require('express'); // using express middleware
const Favorite = require('../models/favorite');  // using Favorite model
const authenticate = require('../authenticate'); // import authenticate module
const cors = require('./cors'); 

const favoriteRouter = express.Router(); 

favoriteRouter.route('/') 
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => { // get request which is getting any/all documents that are in the collection
        Favorite.find()
        .populate('user')
        .populate('campsites')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err)); 
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // creating a new document in the favorite collection
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (!favorite) {
                Favorite.create({user: req.user._id, campsites: req.body})
                .then(favorite => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err)); 
            } else {
               req.body.forEach(campsite => {
                   if (favorite.campsites.includes(campsite._id)) {
                        err = new Error(`Favorite for this campsite already exists`);
                        err.status = 404;
                        return next(err);
                   } else {
                        favorite.campsites.push(campsite._id); 
                        favorite.save()
                        .then(response => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(response);
                        })
                        .catch(err => next(err)); 
                   }
               });
            }
        })
        .catch(err => next(err)); 
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { // put request that is not supported
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any documents in the favorite collection
        Favorite.deleteOne({user: req.user._id})
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
        .catch(err => next(err)); 
    })


favoriteRouter.route('/:campsiteId') 
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res) => { // get request that is getting all favorites with an id matching the requested id
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`); 
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // post request 
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                if (favorite.campsites.includes(req.params.campsiteId)) {
                    err = new Error(`That campsite already exists in the list of favorites!`);
                    err.status = 404;
                    return next(err);
                }
                else {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(response => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(response);
                    })
                    .catch(err => next(err)); 
                }
            } else {
                Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
                .then(favorite => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err)); 
            }
        })
        .catch(err => next(err)); 
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { // put request that is not supported
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`); 
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { // delete request that is deleting any favorites that have an id matching the id requested
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                const remove = favorite.campsites.indexOf(req.params.campsiteId);
                favorite.campsites.splice(remove, 1);
                favorite.save()
                .then(response => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
                .catch(err => next(err)); 
            }
            else {
                err = new Error(`Campsite not found`);
                err.status = 404;
                return next(err); 
            }
        })
        .catch(err => next(err)); 
    })

module.exports = favoriteRouter;