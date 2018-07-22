const Config = require('../../classes/config')
const Person = require('../../classes/person')
const request = require('request-promise')

const checkFacebook = async () => {
  console.log('Checking facebook')
  const config = new Config()
  const facebookFeed = config.get('facebookFeed')
  if (facebookFeed === null) return

  const url = facebookFeed.replace('webcal:', 'https:')
  const bdays = await request({
    url: url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Node.js 6.0.0) MagicMirror/2.0 (https://github.com/MichMich/MagicMirror)'
    }
  })
    .then(response => {
      const bdaySplit = response.split('BEGIN:VEVENT')
      bdaySplit.shift()
      const bdays = bdaySplit.map((entry) => {
        const bdaySplit = entry.split('\r\n')
        const name = bdaySplit[2].replace('SUMMARY:','').replace('\'s birthday','')
        let date = bdaySplit[1].replace('DTSTART:','')
        return {
          name,
          month: parseInt(date.slice(4,6), 10),
          day: parseInt(date.slice(6,8), 10)
        }
      })
      return bdays
    })
    .catch(error => {
      console.log(error)
      return [error]
    })

  bdays.forEach((entry) => {
    const person = new Person(entry.name)
    person.set('month', entry.month)
    person.set('day', entry.day)
    person.save()
  })

}
exports.checkFacebook = checkFacebook

exports.startCheckingFacebook = () => {
  clearInterval(global.checkFacebookTmr)
  global.checkFacebookTmr = setInterval(() => {
    checkFacebook()
  }, 1000 * 60 * 60 * 8) // Once every 8 hours
  checkFacebook()
}

