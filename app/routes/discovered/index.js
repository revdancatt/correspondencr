const People = require('../../classes/people')

exports.index = (req, res) => {
  //  Grab all the latest people we have found in the last week
  const days = 30
  req.templateValues.newPeople = new People().getDiscoveredExternally(days)
  req.templateValues.days = days
  return res.render('discovered/index', req.templateValues)
}