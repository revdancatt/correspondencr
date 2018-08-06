const People = require('../../classes/people')

exports.index = (req, res) => {
  //  Grab all the latest people we have found in the last week
  req.templateValues.newPeople = new People().getDiscoveredExternally()
  return res.render('discovered/index', req.templateValues)
}
