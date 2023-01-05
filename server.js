/*
 * Welcome to the server.js file, this file. This file is written in
 * ES6 and is expected to run in node.
 *
 * There is a lot of scripting at the top of this file, most of which
 * is to make sure the user has completed all the steps needed to
 * actually run the dashboard properly. This will be checking for
 * things like `yarn install` and the usual stuff having been run.
 *
 * You'll see!
 */
const fs = require('fs')
const path = require('path')
const rootDir = __dirname
const colours = require('colors')

colours.setTheme({
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  alert: 'magenta'
})

//  Let us know where the app is being run from
console.log(`server.js is being run from this directory: ${process.cwd()}`.help)
console.log(`server.js exists in this directory: ${rootDir}`.help)


//  Now we can actually require it
require('dotenv').config()


// ########################################################################
/*
 * STEP FIVE
 *
 * Now we have enough for our server to actually run on a port we need
 * to check to see if a config.json file exist, which is going to actually
 * hold all the other information.
 *
 * Specifically in this case the Auth0 settings as we are now running
 * the server on we assume either localhost _or_ a public website.
 * Because Auth0 should be protecting us from all the admin stuff and
 * initially that isn't in place we need to somehow project the Auth0
 * form. We'll do this by creating a local token which has to be added
 * to be able to update the form. The user installing this app will know
 * the token becasue we'll tell them. But a remote user won't have that
 * information.
 * */

const express = require('express')
const exphbs = require('express-handlebars')
const routes = require('./app/routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const http = require('http')
const helpers = require('./app/helpers')
const Config = require('./app/classes/config')

//  Read in the config file
const config = new Config()

const app = express()
const hbs = exphbs.create({
  extname: '.html',
  helpers,
  partialsDir: `${__dirname}/app/templates/includes/`
})

app.engine('html', hbs.engine)
app.set('view engine', 'html')
app.locals.layout = false
app.set('views', `${__dirname}/app/templates`)
app.use(
  express.static(`${__dirname}/app/public`, {
    'no-cache': true
  })
)
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(cookieParser())
app.use(
  session({
    // Here we are creating a unique session identifier
    secret: config.get('handshake'),
    resave: true,
    saveUninitialized: true,
    store: new FileStore({
      ttl: 60 * 60 * 24 * 7
    })
  })
)

app.enable('trust proxy')
app.use('/', routes)

app.use((request, response) => {
  response.status(404).render('static/404')
})

if (process.env.NODE_ENV !== 'DEV') {
  app.use((err, req, res) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })
}


http.createServer(app).listen(process.env.PORT)
console.log('Server running on port: '.info + process.env.PORT)

