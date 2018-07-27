const express = require('express')
const router = express.Router()
const Config = require('../classes/config')

// Break out all the seperate parts of the site
/* eslint-disable import/no-unresolved */
const discovered = require('./discovered')
const main = require('./main')
const upcoming = require('./upcoming')

// ############################################################################
//
/*
 * Always create a templateValues object that gets passed to the
 * templates. The config object from global (this allows use to
 * manipulate it here if we need to) and the user if one exists
 */
//
// ############################################################################
router.use(function (req, res, next) {
  req.templateValues = {}
  const configObj = new Config()
  req.config = configObj
  req.templateValues.config = req.config
  req.templateValues.NODE_ENV = process.env.NODE_ENV
  next()
})

// ############################################################################
//
//  Here are all the main routes
//
// ############################################################################

router.get('/', main.index)
router.post('/', main.posted)
router.get('/discovered', discovered.index)
router.get('/upcoming', upcoming.index)

module.exports = router
