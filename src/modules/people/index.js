const fs = require('fs')
const path = require('path')
const rootDir = path.join(__dirname, '../../..')
const Person = require('../../classes/person')

const getBirthday = (person) => {

  const thisYear = new Date().getFullYear()
  const nextYear = new Date().getFullYear() + 1

  if (person && 'month' in person && 'day' in person) {
    //  We don't really care about the hour and to save with timezone faffing I'm just
    //  going to add 12 hours onto everything, to stick the birthday "time" roughly
    //  halfway through the day, this isn't exact science!
    const thisYearBirthday = new Date(thisYear, person.month - 1, person.day, 12, 0, 0)
    const nextYearBirthday = new Date(nextYear, person.month - 1, person.day, 12, 0, 0)
    //  Grab the differences between the dates in milliseconds
    const thisDiff = thisYearBirthday.getTime() - new Date().getTime()
    const nextDiff = nextYearBirthday.getTime() - new Date().getTime()
    //  We are doing this because although we are checking the difference between two dates
    //  we aren't really checking against the year and although I could work out if the
    //  birthday for this year has been and gone, it's just easier to check two dates
    //  the birthday this year which may have gone already, and the birthday next year.
    if (thisDiff > 0) {
      return thisYearBirthday
    } else {
      return thisYearBirthday
    }
  }
}
/*
This gets all the people we've discovered from facebook in the
past [days] days
*/
export const getDiscoveredExternally = (days = 7) => {
  //  First things first read in the people.json file
  const filename = path.join(rootDir, 'data', 'people.json')
  if (!fs.existsSync(filename)) return []
  const peopleRaw = fs.readFileSync(filename, 'utf-8')
  const peopleJSON = JSON.parse(peopleRaw)

  //  What is the time difference we are searching for?
  //  Default: 1000ms * 60 seconds * 60 minutes * 24 hours * [days]
  const msDiff = 1000 * 60 * 60 * 24 * days
  const newPeople = []
  //  Go thru all the people finding the ones that were created
  //  within that time from external sources
  Object.entries(peopleJSON).forEach((_, i) => {
    const person = peopleJSON[i]
    if (person && person.source === 'facebook') {
      const thisDiff = new Date().getTime() - new Date(person.created).getTime()
      if (thisDiff < msDiff) newPeople.push(person)
    }
  })
  return newPeople
}

/*
Get all the birthdays coming up in the next [days] days
*/
export const getUpcomingBirthdays = (days = 30) => {
  //  First things first read in the people.json file
  const filename = path.join(rootDir, 'data', 'people.json')
  if (!fs.existsSync(filename)) return []
  const peopleRaw = fs.readFileSync(filename, 'utf-8')
  const peopleJSON = JSON.parse(peopleRaw)

  //  What is the time difference we are searching for?
  //  Default: 1000ms * 60 seconds * 60 minutes * 24 hours * [days]
  const msDiff = 1000 * 60 * 60 * 24 * days
  let birthdayPeople = []
  const thisYear = new Date().getFullYear()
  const nextYear = new Date().getFullYear() + 1

  birthdayPeople = Object.entries(peopleJSON.people).map((person) => {
    const id = parseInt(person[0], 10)
    return new Person(id)
  })

  return birthdayPeople.sort(function (a, b) {
    if (new Date(a.nextBirthday).getTime() > new Date(b.nextBirthday).getTime()) return 1
    return -1
  })
}

export const getA2Z = () => {
  //  First things first read in the people.json file
  const filename = path.join(rootDir, 'data', 'people.json')
  if (!fs.existsSync(filename)) return {}
  const peopleRaw = fs.readFileSync(filename, 'utf-8')
  const peopleJSON = JSON.parse(peopleRaw)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  let index = {}
  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet.charAt(i)
    index[letter] = Object.entries(peopleJSON.people).map((person) => {
      const id = parseInt(person[0], 10)
      return new Person(id)
    }).filter((person) => {
      return person.lastname[0].toLowerCase() === letter
    }).length
  }
  return index
}

export const getByFirstLetter = (letter, letterpart='lastname') => {
  //  First things first read in the people.json file
  const filename = path.join(rootDir, 'data', 'people.json')
  if (!fs.existsSync(filename)) return []
  const peopleRaw = fs.readFileSync(filename, 'utf-8')
  const peopleJSON = JSON.parse(peopleRaw)

  let people = []
  Object.entries(peopleJSON).forEach((_, i) => {
    const person = peopleJSON[i]
    if (person !== undefined && person !== null && letterpart in person && person[letterpart].length > 0 && person[letterpart][0].toLowerCase() === letter) {
      people.push(person)
    }
  })
  return people
}
