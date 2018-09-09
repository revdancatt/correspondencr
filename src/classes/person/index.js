const fs = require('fs')
const path = require('path')
const Config = require('../config')
const rootDir = path.join(__dirname, '../../..')

/** Class representing a person. */
class Person {
  /**
   * Grab the details based on the id or name.
   */
  constructor (nameOrId) {
    let person = null
    if (typeof (nameOrId) === 'number') {
      person = this.getPersonById(nameOrId)
    }
    if (typeof (nameOrId) === 'string') {
      person = this.getPersonByFullname(nameOrId)
    }
    //  This cannot be the correct way of doing this!
    if (person !== null) {
      Object.assign(this, person)
      person.nextBirthday = this.getUpcomingBirthday()
      person.upcomingDates = this.getUpcomingDates()
      person.age = this.getAge()
      Object.assign(this, person)
    }
  }

  getPersonById (id) {
    const peopleJSON = this.loadPeopleJSON()
    let person = null
    if (id in peopleJSON.people) {
      person = peopleJSON.people[id]
    }
    return person
  }

  getPersonByFullname (fullname) {
    //  Load in the people JSON
    let peopleJSON = this.loadPeopleJSON()

    //  Look through all the users until we find one with the name that
    //  matches
    let person = null
    const people = Object.entries(peopleJSON.people).map((person) => {
      return person[1]
    })
    people.forEach((thisPerson) => {
      if (thisPerson.fullname === fullname) {
        person = thisPerson
      }
    })

    //  If we still haven't found them, then we need to assign them an ID
    //  and save them
    if (person === null) {
      const id = this.getNewId()
      let firstname = null
      let lastname = null
      const nameSplit = fullname.split(' ')
      if (nameSplit.length > 0) firstname = nameSplit[0]
      if (nameSplit.length > 1) lastname = nameSplit.pop()
      person = {
        id,
        fullname,
        firstname,
        lastname,
        created: new Date(),
        updated: new Date()
      }
      //  Reload in the JSON, add the person and then save
      peopleJSON = this.loadPeopleJSON()
      peopleJSON.people[id] = person
      this.savePeopleJSON(peopleJSON)
    }
    return person
  }

  //  This will get us a new ID to use for the user
  getNewId () {
    const peopleJSON = this.loadPeopleJSON()
    const id = peopleJSON.lastId
    peopleJSON.lastId += 1
    this.savePeopleJSON(peopleJSON)
    return id
  }

  loadPeopleJSON () {
    //  Check to see if the data directory exists
    const dataDir = path.join(rootDir, 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

    //  Check to see if the people.json files exits, if not then we need
    //  to make one.
    const peopleFile = path.join(rootDir, 'data', 'people.json')
    let peopleJSON = {
      lastId: 1,
      people: {}
    }
    if (!fs.existsSync(peopleFile)) {
      const peopleJSONPretty = JSON.stringify(peopleJSON, null, 4)
      fs.writeFileSync(peopleFile, peopleJSONPretty, 'utf-8')
    }

    //  Now read in the file
    const peopleRaw = fs.readFileSync(peopleFile, 'utf-8')
    return JSON.parse(peopleRaw)
  }

  savePeopleJSON (peopleJSON) {
    //  Make sure the data directory exists
    const dataDir = path.join(rootDir, 'data')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

    //  Save whatever we've been passed into the people.json
    const peopleFile = path.join(rootDir, 'data', 'people.json')
    const peopleJSONPretty = JSON.stringify(peopleJSON, null, 4)
    fs.writeFileSync(peopleFile, peopleJSONPretty, 'utf-8')
  }

  set (key, value) {
    //  Do the age separately
    if (key === 'age') {
      this.setAge(value)
    } else {
      this[key] = value
      this.updated = new Date()
    }
  }

  remove (key) {
    delete this[key]
    this.save()
  }

  setAge (value) {
    //  If we know the month and day of the person, we can calculate
    //  the actual birthday here
    if (isNaN(value)) return
    if (value === '') {
      delete this.birthdayFromAge
      delete this.hardcodedAge
      this.save()
      return
    }
    if (value === null || value === undefined) return
    const age = parseInt(value)
    if (age < 0 || age > 200) return

    if (this.month !== undefined && this.month !== null && this.month !== '' && this.day !== undefined && this.day !== null && this.day !== '') {
      const d = new Date()
      const thisYearsBirthday = new Date(d.getFullYear(), this.month - 1, this.day)
      let bd = new Date(d.getFullYear() - age, this.month - 1, this.day)
      if (thisYearsBirthday > d) {
        bd = new Date(d.getFullYear() - age - 1, this.month - 1, this.day)
      }
      this.set('birthdayFromAge', bd)
    } else {
      this.set('hardcodedAge', age)
    }
  }

  setContacted (details) {
    if (!('contacted' in this)) {
      this.contacted = []
    }
    this.contacted.push({
      id: new Date().getTime(),
      details,
      checked1: false,
      checked2: false,
      created: new Date()
    })
  }

  setCheckboxes (checkboxes, id) {
    this.contacted.map((contact) => {
      if (contact.id === parseInt(id, 10)) {
        contact.checked1 = checkboxes.checkbox1
        contact.checked2 = checkboxes.checkbox2
      }
      return contact
    })
  }

  deleteContacted (id) {
    if ('contacted' in this) {
      this.contacted = this.contacted.filter((contact) => {
        return contact.id !== parseInt(id, 10)
      })
    }
  }

  addDate (day, month, details) {
    if (isNaN(day) || day === '') return
    if (isNaN(month) || month === '') return
    if (!('otherDates' in this)) {
      this.otherDates = []
    }
    const newDate = {
      id: this.otherDates.length,
      day,
      month,
      details
    }
    this.otherDates.push(newDate)
    this.save()
  }

  deleteOtherDate (id) {
    if ('otherDates' in this) {
      this.otherDates = this.otherDates.filter((date) => {
        return date.id !== parseInt(id, 10)
      })
      if (this.otherDates.length === 0) delete this.otherDates
      this.save()
    }
  }

  setConnection (relationship, connector) {
    if (!('connections' in this)) {
      this.connections = []
    }
    const newConnection = {
      relationship,
      connector
    }
    this.connections.push(newConnection)
    this.save()
  }

  deleteConnection (relationship, connector) {
    if ('connections' in this) {
      this.connections = this.connections.filter((connection) => {
        return !(connection.relationship === relationship && connection.connector === connector)
      })
      //  Clear up the empty array
      if (this.connections.length === 0) delete this.connections
      this.save()
    }
  }

  save () {
    let peopleJSON = this.loadPeopleJSON()
    peopleJSON.people[this.id] = JSON.parse(JSON.stringify(this))
    //  Make sure we remove the dynamically created entries
    delete peopleJSON.people[this.id].nextBirthday
    delete peopleJSON.people[this.id].age
    delete peopleJSON.people[this.id].upcomingDates
    this.savePeopleJSON(peopleJSON)
  }

  delete () {
    let peopleJSON = this.loadPeopleJSON()
    peopleJSON.people[this.id] = JSON.parse(JSON.stringify(this))
    //  Make sure we remove the dynamically created entries
    delete peopleJSON.people[this.id]

    //  If we are marked as this person in the config we need to remove
    //  it from there.
    const configObj = new Config()
    if (configObj.thisIsMe === this.id) {
      configObj.delete('thisIsMe')
    }
    this.savePeopleJSON(peopleJSON)
  }

  getUpcomingBirthday () {
    if (this.day === null || this.day === undefined || this.month === null || this.month === undefined) {
      return null
    }
    const thisYear = new Date().getFullYear()
    const nextYear = new Date().getFullYear() + 1
    const thisYearBirthday = new Date(thisYear, this.month - 1, this.day, 12, 0, 0)
    const nextYearBirthday = new Date(nextYear, this.month - 1, this.day, 12, 0, 0)
    const thisDiff = thisYearBirthday.getTime() - new Date().getTime()
    let thisBirthday = thisYearBirthday
    if (thisDiff < 0) thisBirthday = nextYearBirthday
    return thisBirthday
  }

  getUpcomingDates () {
    const thisYear = new Date().getFullYear()
    const nextYear = new Date().getFullYear() + 1
    if (!('otherDates' in this)) return null
    const otherDates = this.otherDates.map((date) => {
      const thisYearDate = new Date(thisYear, date.month - 1, date.day, 12, 0, 0)
      const nextYearDate = new Date(nextYear, date.month - 1, date.day, 12, 0, 0)
      const thisDiff = thisYearDate.getTime() - new Date().getTime()
      let thisDate = thisYearDate
      if (thisDiff < 0) thisDate = nextYearDate
      return {
        id: date.id,
        day: date.day,
        month: date.month,
        details: date.details,
        nextOccurance: thisDate
      }
    })

    return otherDates.sort((a, b) => {
      return a.nextOccurance > b.nextOccurance
    })
  }

  getAge () {
    //  If we have a birthday, we can use that to work out the age
    if (this.birthdayFromAge && this.birthdayFromAge !== '') {
      const bd = new Date(this.birthdayFromAge)
      const ageDifMs = Date.now() - bd.getTime()
      const ageDate = new Date(ageDifMs)
      return Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    if (this.hardcodedAge && this.hardcodedAge !== '') return this.hardcodedAge
    return null
  }
}
module.exports = Person
