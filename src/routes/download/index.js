const fs = require('fs')
const path = require('path')

exports.index = (req, res) => {
  const filename = path.join(__dirname, '..', '..', '..', 'data', 'people.json')
  if (!fs.existsSync(filename)) {
    return res.redirect('/')
  }
  const data = fs.readFileSync(filename, 'utf-8')
  res.setHeader('Content-Type', 'application/json');
  return res.send(data)
}