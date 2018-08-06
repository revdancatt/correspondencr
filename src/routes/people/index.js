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
