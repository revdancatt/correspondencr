const Config = require('../../classes/config')
const People = require('../../classes/people')
const facebookFetcher = require('../../modules/facebook-fetcher')

exports.index = (req, res) => {
  req.templateValues.msg = 'Hello World'

  //  Check to see if we have a facebook feed setup
  req.templateValues.hasFacebookFeed = 'facebookFeed' in req.config
  req.templateValues.hideFacebook = 'hideFacebook' in req.config
  const allPeople = new People()

  //  Grab all the latest people we have found in the last week
  const newPeople = allPeople.getDiscoveredExternally()
  if (newPeople.length > 0) {
    if (newPeople.length < 10) {
      req.templateValues.newPeople = newPeople
    } else {
      req.templateValues.tooManyNewPeople = true
    }
  }

  //  Grab all todays birthdays
  req.templateValues.birthdaysToday = allPeople.getTodaysBirthdays()

  //  Grab all upcoming birthdays
  req.templateValues.birthdayPeople = allPeople.getUpcomingBirthdays()

  //  Grab all the upcoming other dates
  req.templateValues.upcomingDates = allPeople.getUpcomingDates(30 * 2)

  //  Get all the missing birthdays
  if (!process.env.BUSINESS) {
    const missingBirthdays = allPeople.getMissingBirthdays().map(a => [Math.random(), a])
      .sort((a, b) => a[0] - b[0])
      .map(a => a[1])
    const maxMissingBirthdays = 5
    if (missingBirthdays.length > maxMissingBirthdays) {
      req.templateValues.missingBirthdays = missingBirthdays.slice(0, maxMissingBirthdays)
      req.templateValues.showMoreMissingBirthdays = true
    } else {
      req.templateValues.missingBirthdays = missingBirthdays
    }
  }

  //  Get all the missing addresses
  const missingAddresses = allPeople.getMissingAddresses().map(a => [Math.random(), a])
    .sort((a, b) => a[0] - b[0])
    .map(a => a[1])
  const maxMissingAddresses = 5
  if (missingAddresses.length > maxMissingAddresses) {
    req.templateValues.missingAddresses = missingAddresses.slice(0, maxMissingAddresses)
    req.templateValues.showMoreMissingAddresses = true
  } else {
    req.templateValues.missingAddresses = missingAddresses
  }

  return res.render('main/index', req.templateValues)
}

exports.posted = async (req, res) => {
  const config = new Config()

  //  If we have an action, then try to do it
  if ('action' in req.body) {
    //  If that action is set a webCal link, add it to the config
    if (req.body.action === 'saveWebcal' && 'facebookFeed' in req.body && req.body.facebookFeed !== '') {
      config.set('facebookFeed', req.body.facebookFeed)
      await facebookFetcher.checkFacebook()
    }

    if (req.body.action === 'hideWebcal') {
      config.set('hideFacebook', true)
    }
  }
  res.redirect('/')
}
