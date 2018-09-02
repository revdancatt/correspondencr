const express = require('express')
const router = express.Router()
const Config = require('../classes/config')
const People = require('../classes/people')

// Break out all the seperate parts of the site
/* eslint-disable import/no-unresolved */
const auth = require('./auth')
const discovered = require('./discovered')
const facebook = require('./facebook')
const main = require('./main')
const people = require('./people')
const person = require('./person')
const upcoming = require('./upcoming')
const upcomingDates = require('./upcomingDates')

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

  //  If there is no username/password in conf then we need to redirect to
  //  the login page
  const urlFragment = req.url.split('?')[0]
  if ((configObj.get('username') === null || configObj.get('password') === null || configObj.get('password') === '') && urlFragment !== '/login') {
    return res.redirect('/login')
  }

  //  If there's no user session then we redirect to the login page
  if ((!('loggedin' in req.session) || req.session.loggedin === false) && urlFragment !== '/login') {
    return res.redirect('/login')
  }

  //  Make a note of us being logged in or not
  req.templateValues.loggedIn = ('loggedin' in req.session && req.session.loggedin === true)
  req.templateValues.a2z = new People().getA2Z()

  next()
})

// ############################################################################
//
//  Here are all the main routes
//
// ############################################################################

router.get('/', main.index)
router.post('/', main.posted)
router.get('/login', auth.index)
router.post('/login', auth.index)
router.get('/logout', auth.logout)
router.get('/discovered', discovered.index)
router.get('/facebook', facebook.index)
router.get('/upcoming', upcoming.index)
router.get('/upcomingDates', upcomingDates.index)
router.get('/everyone', people.index)
router.get('/people', people.index)
router.get('/people/missing-birthdays', people.missingBirthdays)
router.get('/people/missing-addresses', people.missingAddresses)
router.get('/people/hidden', people.hidden)
router.get('/people/:letter', people.byFirstLetter)
router.get('/person/add', person.add)
router.post('/person/add', person.add)
router.get('/person/:id', person.index)
router.get('/person/:id/edit', person.edit)
router.post('/person/:id', person.update)
router.get('/person/:id/hide', person.hide)
router.post('/person/:id/hide', person.hide)
router.get('/person/:id/unhide', person.unhide)
router.post('/person/:id/unhide', person.unhide)
router.get('/person/:id/delete', person.delete)
router.post('/person/:id/delete', person.delete)

module.exports = router
