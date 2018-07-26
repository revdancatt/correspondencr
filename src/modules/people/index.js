const fs = require('fs')
const path = require('path')
const rootDir = path.join(__dirname, '../../..')

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
