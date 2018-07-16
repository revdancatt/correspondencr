exports.index = (req, res) => {
  req.templateValues.msg = 'Hello World'
  return res.render('main/index', req.templateValues)
}
