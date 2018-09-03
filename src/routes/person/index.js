const Person = require('../../classes/person')

exports.index = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  let connector = null
  if (req.config.startConnection) {
    connector = new Person(req.config.startConnection)
  }

  //  Get the connections
  if (person.connections) {
    person.connections = person.connections.map((connection) => {
      const connectedPerson = new Person(connection.connector)
      if (connectedPerson === null) return null
      connection.fullname = connectedPerson.fullname
      return connection
    }).filter(Boolean)
  }

  req.templateValues.person = person
  req.templateValues.connector = connector

  return res.render('person/index', req.templateValues)
}

exports.edit = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')
  req.templateValues.person = person
  return res.render('person/edit', req.templateValues)
}

exports.add = (req, res) => {
  //  If we are adding a person, then do that here
  if ('action' in req.body && req.body.action === 'Add') {
    const person = new Person(req.body.fullname)
    if (('idontknowbirthday' in req.body && req.body.idontknowbirthday === 'true') || req.body.day === '') {
      person.set('month', null)
      person.set('day', null)
    } else {
      person.set('month', parseInt(req.body.month, 10))
      person.set('day', parseInt(req.body.day, 10))
    }
    person.set('address', req.body.address)
    person.set('country', req.body.country)

    const nameSplit = req.body.fullname.split(' ')
    if (nameSplit.length > 0) person.set('firstname', nameSplit[0])
    if (nameSplit.length > 1) person.set('lastname', nameSplit.pop())
    person.set('age', req.body.age)
    person.save()
    return res.redirect(`/person/${person.id}`)
  }

  return res.render('person/add', req.templateValues)
}

exports.update = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  let anchor = ''
  let targetId = req.params.id

  if ('action' in req.body) {
    //  Find out if we are saving notes
    if (req.body.action === 'Save notes') {
      if (!('notes' in req.body)) req.body.notes = ''
      person.set('notes', req.body.notes)
      anchor = '#notes'
    }

    //  If we have been sent new details from the add or edit page
    if (req.body.action === 'Update') {
      person.set('fullname', req.body.fullname)
      if (('idontknowbirthday' in req.body && req.body.idontknowbirthday === 'true') || req.body.day === '') {
        person.set('month', null)
        person.set('day', null)
      } else {
        person.set('month', parseInt(req.body.month, 10))
        person.set('day', parseInt(req.body.day, 10))
      }
      person.set('address', req.body.address)
      person.set('country', req.body.country)

      const nameSplit = req.body.fullname.split(' ')
      if (nameSplit.length > 0) person.set('firstname', nameSplit[0])
      if (nameSplit.length > 1) person.set('lastname', nameSplit.pop())
      person.set('age', req.body.age)
    }

    //  If we are adding a new contact information thingy
    if (req.body.action === 'Add contacted' && 'newcontact' in req.body && req.body.newcontact !== '') {
      person.setContacted(req.body.newcontact)
      anchor = '#when-stuff-was-sent'
    }

    //  If we have been told to save the check values
    if ('ids' in req.body) {
      if (!Array.isArray(req.body.ids)) req.body.ids = [req.body.ids]
      req.body.ids.forEach((id) => {
        const checkboxes = {
          checkbox1: false,
          checkbox2: false
        }
        if (`checkbox1_${id}` in req.body) checkboxes.checkbox1 = true
        if (`checkbox2_${id}` in req.body) checkboxes.checkbox2 = true
        person.setCheckboxes(checkboxes, id)
      })
      anchor = '#when-stuff-was-sent'
    }

    //  If we have been told to delete the contact
    const actionSplit = req.body.action.split('_')
    if (actionSplit.length === 2 && actionSplit[0] === 'remove') {
      person.deleteContacted(actionSplit[1])
      anchor = '#when-stuff-was-sent'
    }

    if (req.body.action === 'Add date') {
      person.addDate(req.body.day, req.body.month, req.body.details)
      anchor = '#other-dates'
    }

    if (req.body.action === 'deleteOtherDate') {
      person.deleteOtherDate(req.body.dateId)
      anchor = '#other-dates'
    }

    //  If we have been told to start a connection then we do that here
    if (req.body.action === 'startConnecting') {
      req.config.set('startConnection', person.id)
      anchor = '#connections'
    }

    if (req.body.action === 'stopConnecting') {
      req.config.delete('startConnection')
      anchor = '#connections'
    }

    if (req.body.action === 'partnerOf') {
      if (req.config.startConnection) {
        const connector = new Person(req.config.startConnection)
        person.setConnection('partner', req.config.startConnection)
        connector.setConnection('partner', person.id)
        targetId = req.config.startConnection
        req.config.delete('startConnection')
      }
      anchor = '#connections'
    }

    if (req.body.action === 'parentOf') {
      if (req.config.startConnection) {
        const connector = new Person(req.config.startConnection)
        person.setConnection('child', req.config.startConnection)
        connector.setConnection('parent', person.id)
        targetId = req.config.startConnection
        req.config.delete('startConnection')
      }
      anchor = '#connections'
    }

    if (req.body.action === 'childOf') {
      if (req.config.startConnection) {
        const connector = new Person(req.config.startConnection)
        person.setConnection('parent', req.config.startConnection)
        connector.setConnection('child', person.id)
        targetId = req.config.startConnection
        req.config.delete('startConnection')
      }
      anchor = '#connections'
    }

    if (req.body.action === 'siblingOf') {
      if (req.config.startConnection) {
        const connector = new Person(req.config.startConnection)
        person.setConnection('sibling', req.config.startConnection)
        connector.setConnection('sibling', person.id)
        targetId = req.config.startConnection
        req.config.delete('startConnection')
      }
      anchor = '#connections'
    }

    if (req.body.action === 'otherOf') {
      if (req.config.startConnection) {
        const connector = new Person(req.config.startConnection)
        person.setConnection('other', req.config.startConnection)
        connector.setConnection('other', person.id)
        targetId = req.config.startConnection
        req.config.delete('startConnection')
      }
      anchor = '#connections'
    }

    //  We want to delete a connection
    if (req.body.action === 'deleteRelationship') {
      // Grab the id of the other person
      const connectorId = parseInt(req.body.connector, 10)
      //  Delete the relationship from this end
      person.deleteConnection(req.body.relationship, connectorId)
      //  Grab the other person
      const connector = new Person(connectorId)
      //  If they exist remove the relationship from them too
      if (connector !== null) {
        //  If it's a symetrical relationship delete it from the other person too
        if (['sibling', 'other', 'partner'].includes(req.body.relationship)) {
          connector.deleteConnection(req.body.relationship, person.id)
        } else {
          //  Otherwise delete the opposite relationship from the other person
          if (req.body.relationship === 'parent') connector.deleteConnection('child', person.id)
          if (req.body.relationship === 'child') connector.deleteConnection('parent', person.id)
        }
      }
      anchor = '#connections'
    }
  }

  person.set('updated', new Date())
  person.save()
  return res.redirect(`/person/${targetId}${anchor}`)
}

exports.hide = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  //  If we have been sent the hide action
  if ('action' in req.body) {
    person.set('hidden', true)
    person.save()
    return res.redirect('/')
  }

  req.templateValues.person = person
  return res.render('person/hide', req.templateValues)
}

exports.unhide = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  //  If we have been sent the hide action
  if ('action' in req.body) {
    person.set('hidden', false)
    person.save()
    return res.redirect(`/person/${person.id}`)
  }

  req.templateValues.person = person
  return res.render('person/unhide', req.templateValues)
}

exports.delete = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  //  If we have been sent the delete action
  if ('action' in req.body) {
    //  First we need to delete all the connections
    if ('connections' in person) {
      person.connections.forEach((connection) => {
        person.deleteConnection(connection.relationship, connection.connector)
        //  Grab the other person
        const connector = new Person(connection.connector)
        //  If they exist remove the relationship from them too
        if (connector !== null) {
          //  If it's a symetrical relationship delete it from the other person too
          if (['sibling', 'other', 'partner'].includes(connection.relationship)) {
            connector.deleteConnection(connection.relationship, person.id)
          } else {
            //  Otherwise delete the opposite relationship from the other person
            if (connection.relationship === 'parent') connector.deleteConnection('child', person.id)
            if (connection.relationship === 'child') connector.deleteConnection('parent', person.id)
          }
        }
      })
    }
    person.delete()
    return res.redirect('/')
  }

  req.templateValues.person = person
  return res.render('person/delete', req.templateValues)
}