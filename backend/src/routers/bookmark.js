// Modules
const express = require('express');
const jwt = require('jsonwebtoken');

// Custom Modules
const Utils = require('../utils.js');
const Config = require('../config.js');
const User = require('../database/user.js');
const Bookmark = require('../database/bookmark.js');

// Setup
const router = express.Router();

// Create Bookmark
router.get('/bookmark', (req, res) => {
  const JWTData = jwt.verify(Utils.getToken(req), Config.JWT_SECRET_KEY);

  req.getValidationResult()
    .then(Utils.checkValidations)
    .then(() => User.findOne({ username: JWTData.username }).exec())
    .then(owner => Bookmark.find({ owner }))
    .then(bookmarks => res.status(200).send(bookmarks))
    .catch(err => res.status(err.status ? err.status : 500).send({ err }));
});

// Create Bookmark
router.post('/bookmark', (req, res) => {
  req.checkBody('url', 'title', 'Must not be empty').notEmpty();
  req.checkBody('title', 'Must only contains lowercase alpha numeric').matches(Config.allowedChars);
  req.checkBody('url', 'Must only contains lowercase alpha numeric').isURL();

  const title = req.body.title;
  const url = req.body.url;
  const JWTData = jwt.verify(Utils.getToken(req), Config.JWT_SECRET_KEY);

  req.getValidationResult()
    .then(Utils.checkValidations)
    .then(() => User.findOne({ username: JWTData.username }).exec())
    .then(owner => Bookmark.create({ title, url, owner }))
    .then(bookmark => res.status(200).send({ title: bookmark.title, url: bookmark.url }))
    .catch(err => res.status(err.status ? err.status : 500).send({ err }));
});

// Update Bookmark
router.put('/bookmark/:id?', (req, res) => {
  req.checkBody('url', 'title', 'Must not be empty').notEmpty();
  req.checkBody('title', 'Must only contains lowercase alpha numeric').isAlpha();
  req.checkBody('url', 'Must only contains lowercase alpha numeric').isURL();

  const title = req.body.title;
  const url = req.body.url;
  const id = req.params.id;
  const JWTData = jwt.verify(Utils.getToken(req), Config.JWT_SECRET_KEY);

  req.getValidationResult()
    .then(Utils.checkValidations)
    .then(() => User.findOne({ username: JWTData.username }))
    .then(owner => Bookmark.findOne({ _id: id, owner }))
    .then((bookmark) => {
      if (!bookmark) {
        return Promise.reject({ status: 404, error: 'Bookmark not found.', id });
      }
      return bookmark;
    })
    .then(() => Bookmark.findByIdAndUpdate(id, { title, url }, { new: true }))
    .then(bookmark => res.status(200).send({ title: bookmark.title, url: bookmark.url }))
    .catch(err => res.status(err.status ? err.status : 500).send({ err }));
});

// Update Bookmark
router.delete('/bookmark/:id?', (req, res) => {
  const id = req.params.id;
  const JWTData = jwt.verify(Utils.getToken(req), Config.JWT_SECRET_KEY);

  req.getValidationResult()
    .then(Utils.checkValidations)
    .then(() => User.findOne({ username: JWTData.username }))
    .then(owner => Bookmark.remove({ _id: id, owner }))
    .then((bookmark) => {
      if (!bookmark) {
        return Promise.reject({ status: 404, error: 'Bookmark not found.', id });
      }
      return bookmark;
    })
    .then(bookmark => res.status(200).send({ title: bookmark.title, url: bookmark.url }))
    .catch(err => res.status(err.status ? err.status : 500).send({ err }));
});

// Export Router
module.exports = router;
