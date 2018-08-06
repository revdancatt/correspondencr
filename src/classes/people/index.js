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
    this.people = this.getAll()
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

  getDiscoveredExternally (days = 7) {
    const msDiff = 1000 * 60 * 60 * 24 * days
    return this.people.filter((person) => {
      return person.source === 'facebook'
    })
  }

  getUpcomingBirthdays (days = 30) {
    const msDiff = 1000 * 60 * 60 * 24 * days
    const futureDate = new Date(new Date().getTime() + msDiff)
    return this.people.filter((person) => {
      return person.nextBirthday <= futureDate
    }).sort(function (a, b) {
      if (new Date(a.nextBirthday).getTime() > new Date(b.nextBirthday).getTime()) return 1
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

  getByFirstLetter (letter, letterpart='lastname') {
    return this.people.filter((person) => {
      if (letterpart in person && person[letterpart].length > 0) {
        return person[letterpart][0].toLowerCase() === letter 
      }
      return false
    })
  }
}
module.exports = People