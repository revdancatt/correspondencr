const People = require('../../classes/people')

exports.index = (req, res) => {
  req.templateValues.people = new People().people.sort(function (a, b) {
    if (a.lastname > b.lastname) return 1
    return -1
  })

  return res.render('people/index', req.templateValues)
}

exports.byFirstLetter = (req, res) => {
  req.templateValues.letter = req.params.letter
  req.templateValues.people = new People().getByFirstLetter(req.params.letter, 'lastname')
  return res.render('people/byFirstLetter', req.templateValues)
}

exports.missingBirthdays = (req, res) => {
  req.templateValues.people = new People().getMissingBirthdays().sort(function (a, b) {
    if (new Date(a.nextBirthday).getTime() > new Date(b.nextBirthday).getTime()) return 1
    return -1
  })
  return res.render('people/missingBirthdays', req.templateValues)
}

exports.missingAddresses = (req, res) => {
  req.templateValues.people = new People().getMissingAddresses().sort(function (a, b) {
    if (new Date(a.nextBirthday).getTime() > new Date(b.nextBirthday).getTime()) return 1
    return -1
  })
  return res.render('people/missingAddresses', req.templateValues)
}

exports.hidden = (req, res) => {
  req.templateValues.people = new People().getHidden()
  return res.render('people/hidden', req.templateValues)
}
