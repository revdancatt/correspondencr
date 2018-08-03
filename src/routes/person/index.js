const Person = require('../../classes/person')

exports.index = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  //  Work out when their next birthday is
  req.templateValues.person = person
  return res.render('person/index', req.templateValues)
}

exports.edit = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  //  Work out when their next birthday is
  req.templateValues.person = person
  return res.render('person/edit', req.templateValues)
}

exports.update = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  person.fullname = req.body.fullname
  person.month = parseInt(req.body.month, 10)
  person.day = parseInt(req.body.day, 10)
  person.address = req.body.address
  person.country = req.body.country

  const nameSplit = req.body.fullname.split(' ')
  if (nameSplit.length > 0) person.firstname = nameSplit[0]
  if (nameSplit.length > 1) person.lastname = nameSplit[1]
  person.updated = new Date()
  person.save()
  return res.redirect(`/person/${req.params.id}`)
}
