const fs = require('fs')
const path = require('path')
const rootDir = path.join(__dirname, '../../..')
const Person = require('../person')

/** Class representing all people. */
class People {
  /**
   * Grab the details based on the id or name.
   */
  constructor () {
    this.people = this.getAll().filter((person) => {
      return !('hidden' in person && person.hidden === true)
    })
  }

  getAll () {
    //  First things first read in the people.json file
    const filename = path.join(rootDir, 'data', 'people.json')
    if (!fs.existsSync(filename)) return []
    const peopleRaw = fs.readFileSync(filename, 'utf-8')
    const peopleJSON = JSON.parse(peopleRaw)
    return Object.entries(peopleJSON.people).map((person) => {
      return new Person(parseInt(person[0], 10))
    })
  }

  getHidden () {
    return this.getAll().filter((person) => {
      return ('hidden' in person && person.hidden === true)
    })
  }

  getDiscoveredExternally (days = 7) {
    return this.people.filter((person) => {
      return person.source === 'facebook'
    }).sort(function (a, b) {
      if (new Date(a.created).getTime() < new Date(b.created).getTime()) return 1
      return -1
    })
  }

  getTodaysBirthdays () {
    const d = new Date()
    return this.people.filter((person) => {
      if (parseInt(person.day, 10) === d.getDate() && parseInt(person.month, 10) === d.getMonth() + 1) return true
      return false
    }).map((person) => {
      person.nextBirthday = new Date(new Date().getFullYear(), person.month - 1, person.day)
      return person
    })
  }

  getUpcomingBirthdays (days = 30) {
    const msDiff = 1000 * 60 * 60 * 24 * days
    const futureDate = new Date(new Date().getTime() + msDiff)
    const todaysBirthdays = this.getTodaysBirthdays().map((person) => {
      return person.id
    })
    return this.people.filter((person) => {
      if (person.nextBirthday === null || person.nextBirthday === undefined) return false
      if (todaysBirthdays.includes(person.id)) return false
      return person.nextBirthday <= futureDate
    }).sort(function (a, b) {
      if (new Date(a.nextBirthday).getTime() > new Date(b.nextBirthday).getTime()) return 1
      return -1
    })
  }

  getMissingBirthdays () {
    return this.people.filter((person) => {
      return (person.nextBirthday === null || person.nextBirthday === undefined)
    }).sort(function (a, b) {
      if (a.lastname > b.lastname) return 1
      return -1
    })
  }

  getMissingAddresses () {
    return this.people.filter((person) => {
      return (person.address === null || person.address === undefined || person.address === '')
    }).sort(function (a, b) {
      if (a.lastname > b.lastname) return 1
      return -1
    })
  }

  getA2Z () {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    let index = {}
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet.charAt(i)
      index[letter] = this.people.filter((person) => {
        return person.lastname[0].toLowerCase() === letter
      }).length
    }
    return index
  }

  getByFirstLetter (letter, letterpart = 'lastname') {
    return this.people.filter((person) => {
      if (letterpart in person && person[letterpart].length > 0) {
        return person[letterpart][0].toLowerCase() === letter
      }
      return false
    })
  }

  getUpcomingDates (days = 30) {
    const msDiff = 1000 * 60 * 60 * 24 * days
    const futureDate = new Date(new Date().getTime() + msDiff)
    const upcomingDates = []
    this.people.forEach((person) => {
      if ('upcomingDates' in person && person.upcomingDates !== null) {
        person.upcomingDates.forEach((date) => {
          if (date.nextOccurance < futureDate) {
            const newDate = {
              nextOccurance: date.nextOccurance,
              details: date.details,
              person: {
                id: person.id,
                fullname: person.fullname
              }
            }
            upcomingDates.push(newDate)
          }
        })
      }
    })
    return upcomingDates.sort((a, b) => {
      return a.nextOccurance > b.nextOccurance
    })
  }
}
module.exports = People
