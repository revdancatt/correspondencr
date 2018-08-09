const fs = require('fs')
const path = require('path')

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
      //  NOTE: Here we are taking the 2nd name as the last name. We could in
      //  theory take the last name (which would seem to make sense) only
      //  in my case, most people with more than two names have kept their
      //  maiden name and then tagged their married name onto the end. But in
      //  most cases I still know them by the maiden name, so as weird as it
      //  seems I can find people better with first name, second name.
      if (nameSplit.length > 1) lastname = nameSplit[1]
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
    this[key] = value
    this.updated = new Date()
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

  save () {
    let peopleJSON = this.loadPeopleJSON()
    peopleJSON.people[this.id] = JSON.parse(JSON.stringify(this))
    //  Make sure we remove the dynamically created entries
    delete peopleJSON.people[this.id].nextBirthday
    this.savePeopleJSON(peopleJSON)
  }

  delete () {
    let peopleJSON = this.loadPeopleJSON()
    peopleJSON.people[this.id] = JSON.parse(JSON.stringify(this))
    //  Make sure we remove the dynamically created entries
    delete peopleJSON.people[this.id]
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
}
module.exports = Person
