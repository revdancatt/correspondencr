const Config = require('../../classes/config')
const people = require('../../modules/people')

exports.index = (req, res) => {
  //  Grab all the latest people we have found in the last week
  const newPeople = people.getDiscoveredExternally()
  req.templateValues.newPeople = newPeople
  return res.render('discovered/index', req.templateValues)
}
