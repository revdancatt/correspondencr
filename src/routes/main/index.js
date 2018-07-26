const Config = require('../../classes/config')
const facebookFetcher = require('../../modules/facebook-fetcher')
const people = require('../../modules/people')

exports.index = (req, res) => {
  req.templateValues.msg = 'Hello World'

  //  Check to see if we have a facebook feed setup
  req.templateValues.hasFacebookFeed = 'facebookFeed' in req.config

  //  Grab all the latest people we have found in the last week
  const newPeople = people.getDiscoveredExternally()
  if (newPeople.length > 0) {
    if (newPeople.length < 10) {
      req.templateValues.newPeople = newPeople
    } else {
      req.templateValues.tooManyNewPeople = true
    }
  }
  return res.render('main/index', req.templateValues)
}

exports.posted = (req, res) => {
  const config = new Config()

  //  If we have an action, then try to do it
  if ('action' in req.body) {
    //  If that action is set a webCal link, add it to the config
    if (req.body.action === 'saveWebcal' && 'facebookFeed' in req.body && req.body.facebookFeed !== '') {
      config.set('facebookFeed', req.body.facebookFeed)
      facebookFetcher.checkFacebook()
    }
  }
  res.redirect('/')
}