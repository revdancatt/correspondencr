exports.index = (req, res) => {
  req.templateValues.hasFacebookFeed = 'facebookFeed' in req.config
  return res.render('facebook/index', req.templateValues)
}
