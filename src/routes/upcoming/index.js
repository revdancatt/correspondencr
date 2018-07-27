const people = require('../../modules/people')

exports.index = (req, res) => {
  //  Grab all upcoming birthdays
  const birthdayPeople = people.getUpcomingBirthdays(30 * 4)
  req.templateValues.birthdayPeople = birthdayPeople
  return res.render('upcoming/index', req.templateValues)
}
