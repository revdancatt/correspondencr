const People = require('../../classes/people')

exports.index = (req, res) => {
  //  Grab all upcoming birthdays
  req.templateValues.upcomingDates = new People().getUpcomingDates(30 * 4)
  return res.render('upcomingDates/index', req.templateValues)
}
