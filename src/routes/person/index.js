const Person = require('../../classes/person')

exports.index = (req, res) => {
  req.templateValues.msg = 'Hello World'
  const person = new Person(parseInt(req.params.id, 10))
  //  Work out when their next birthday is
  req.templateValues.person = person
  return res.render('person/index', req.templateValues)
}
