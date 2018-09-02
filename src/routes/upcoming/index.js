const People = require('../../classes/people')

exports.index = (req, res) => {
  //  Grab all upcoming birthdays
  req.templateValues.birthdayPeople = new People().getUpcomingBirthdays(30 * 4)
  return res.render('upcoming/index', req.templateValues)
}
