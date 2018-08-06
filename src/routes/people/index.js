const People = require('../../classes/people')

exports.index = (req, res) => {
  req.templateValues.people = new People().people
  return res.render('people/index', req.templateValues)
}

exports.byFirstLetter = (req, res) => {
  req.templateValues.letter = req.params.letter
  req.templateValues.people = new People().getByFirstLetter(req.params.letter, 'lastname')
  return res.render('people/byFirstLetter', req.templateValues)
}

exports.missingBirthdays = (req, res) => {
  req.templateValues.people = new People().getMissingBirthdays()
  return res.render('people/missingBirthdays', req.templateValues)
}

exports.missingAddresses = (req, res) => {
  req.templateValues.people = new People().getMissingAddresses()
  return res.render('people/missingAddresses', req.templateValues)
}
