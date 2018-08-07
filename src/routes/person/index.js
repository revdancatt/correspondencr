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

  //  Find out if we are doing notes or details
  if ('notes' in req.body) {
    person.set('notes', req.body.notes)
  } else {
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
