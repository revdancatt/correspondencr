const people = require('../../modules/people')

exports.index = (req, res) => {
  //  Grab all upcoming birthdays
  req.templateValues.people = people.getByFirstLetter(req.params.letter, 'lastname')
  return res.render('people/byFirstLetter', req.templateValues)
}
