const Person = require('../../classes/person')

exports.index = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')
  req.templateValues.person = person
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
      // don't add birthday information
    } else {
      person.set('month', parseInt(req.body.month, 10))
      person.set('day', parseInt(req.body.day, 10))
    }
    person.set('source', 'direct')
    person.set('address', req.body.address)
    person.set('country', req.body.country)
    person.save()
    return res.redirect(`/person/${person.id}`)
  }

  return res.render('person/add', req.templateValues)
}

exports.update = (req, res) => {
  const person = new Person(parseInt(req.params.id, 10))
  if (person.id === undefined) return res.redirect('/')

  if ('action' in req.body) {
    //  Find out if we are saving notes
    if (req.body.action === 'Save notes') {
      if (!('notes' in req.body)) req.body.notes = ''
      person.set('notes', req.body.notes)
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
      if (nameSplit.length > 1) person.set('lastname', nameSplit[1])
    }

    //  If we are adding a new contact information thingy
    if (req.body.action === 'Add contacted' && 'newcontact' in req.body && req.body.newcontact !== '') {
      person.setContacted(req.body.newcontact)
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
    }
    //  If we have been told to delete the contact
    const actionSplit = req.body.action.split('_')
    if (actionSplit.length === 2 && actionSplit[0] === 'remove') {
      person.deleteContacted(actionSplit[1])
    }
  }
  person.set('updated', new Date())
  person.save()
  return res.redirect(`/person/${req.params.id}`)
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

  //  If we have been sent the hide action
  if ('action' in req.body) {
    person.delete()
    return res.redirect('/')
  }

  req.templateValues.person = person
  return res.render('person/delete', req.templateValues)
}
