const crypto = require('crypto')
const url = require('url')

exports.index = (req, res) => {
  let userExists = true
  if (req.config.get('username') === null || req.config.get('username') === '') userExists = false
  if (req.config.get('password') === null || req.config.get('password') === '') userExists = false

  req.templateValues.focus = 'username'

  const urlParts = url.parse(req.url, true)

  req.templateValues.handshake = urlParts.query.handshake

  //  Check to see if we've been passed the instruction to create a new user, if we have then
  //  and the user doesn't exist already then we create the account
  if ('action' in req.body && req.body.action === 'Create user' && userExists === false) {
    //  Check to see if we have a username
    if (!('username' in req.body) || req.body.username === '') {
      req.templateValues.error = 'You must supply a username'
      req.templateValues.errorPlace = 'username'
      return res.render('auth/createUser', req.templateValues)
    }
    req.templateValues.username = req.body.username

    //  Check to see if we have both passwords entered and they match.
    if (!('password1' in req.body) || req.body.password1 === '' || !('password2' in req.body) || req.body.password2 === '' || req.body.password1 !== req.body.password2) {
      req.templateValues.error = 'You must supply passwords that match'
      req.templateValues.errorPlace = 'password'
      req.templateValues.focus = 'password'
      return res.render('auth/createUser', req.templateValues)
    }

    if (!('handshake' in req.body) || req.body.handshake !== req.config.get('handshake')) {
      req.templateValues.error = 'You must supply a handshake that matches the one in config.json'
      req.templateValues.errorPlace = 'handshake'
      req.templateValues.focus = 'handshake'
      return res.render('auth/createUser', req.templateValues)
    }

    //  If we have gotten here it means we don't already have a user created in the config
    //  and we have a username and password, so now we pop them into the config and
    //  redirect once more to the login page
    req.config.set('username', req.body.username)
    const saltedPassword = `${req.body.password1}${process.env.SALT}`
    const hashedPassword = crypto.createHmac('sha256', 'fnord')
      .update(saltedPassword)
      .digest('hex')
    req.config.set('password', hashedPassword)
    return res.redirect('/login')
  }

  if ('action' in req.body && req.body.action === 'Login') {
    //  Check to see if we have a username
    if (!('username' in req.body) || req.body.username === '') {
      req.templateValues.error = 'You must supply a username'
      req.templateValues.errorPlace = 'username'
      return res.render('auth/login', req.templateValues)
    }
    req.templateValues.username = req.body.username

    //  Check to see if we have both passwords entered and they match.
    if (!('password' in req.body) || req.body.password === '') {
      req.templateValues.error = 'You must supply a password'
      req.templateValues.errorPlace = 'password'
      req.templateValues.focus = 'password'
      return res.render('auth/login', req.templateValues)
    }

    //  Hash the password
    const saltedPassword = `${req.body.password}${process.env.SALT}`
    const hashedPassword = crypto.createHmac('sha256', 'fnord')
      .update(saltedPassword)
      .digest('hex')

    //  Check that the username and password match
    if (req.body.username !== req.config.get('username') || hashedPassword !== req.config.get('password')) {
      req.templateValues.error = 'Username or password did not match'
      req.templateValues.errorPlace = 'username'
      return res.render('auth/login', req.templateValues)
    }

    //  If we have gotten through all of that, then everything is good and we can send the user
    //  on their way
    req.session.loggedin = true
    return res.redirect('/')
  }

  // Check to see if there isn't a user on the conf file, if there isn't then we need to
  //  show the create user page, otherwise show the login page
  if (req.config.get('username') === null || req.config.get('password') === null) {
    return res.render('auth/createUser', req.templateValues)
  }

  return res.render('auth/login', req.templateValues)
}

exports.logout = (req, res) => {
  delete req.session.loggedin
  return res.redirect('/')
}
