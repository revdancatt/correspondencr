const moment = require('moment')

exports.ifIndexDivisibleBy = (index, divisor, options) => {
  if ((index + 1) % divisor === 0 && index > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifIndexNotDivisibleBy = (index, divisor, options) => {
  if ((index + 1) % divisor !== 0 && index > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.indexOf = (context, ndx, options) => options.fn(context[ndx])

exports.ifEven = (n, options) => {
  if (n % 2 === 0 || n === 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifOdd = (n, options) => {
  if (n % 2 !== 0 && n > 0) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifEqual = (v1, v2, options) => {
  if (v1 === v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifNotEqual = (v1, v2, options) => {
  if (v1 !== v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifgt = (v1, v2, options) => {
  if (v1 > v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifgte = (v1, v2, options) => {
  if (v1 >= v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.iflt = (v1, v2, options) => {
  if (v1 < v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.iflte = (v1, v2, options) => {
  if (v1 <= v2) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifEqualNumbers = (v1, v2, options) => {
  if (parseInt(v1, 10) === parseInt(v2, 10)) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.ifIsNotNull = (v1, options) => {
  if (v1 !== null) {
    return options.fn(this)
  }
  return options.inverse(this)
}

exports.and = (v1, v2) => {
  return v1 && v2
}

exports.or = (v1, v2) => {
  return v1 || v2
}

exports.timePretty = t => {
  if (t === null || t === undefined) return ''
  return moment(t).format('dddd, MMMM Do YYYY, h:mm:ss a')
}

const datePrettyNoYear = t => {
  if (t === null || t === undefined) return ''
  return moment(t).format('dddd, MMMM Do')
}
exports.datePrettyNoYear = datePrettyNoYear

const datePretty = t => {
  if (t === null || t === undefined) return ''
  return moment(t).format('dddd, MMMM Do YYYY')
}
exports.datePretty = datePretty

exports.datePrettyDM = (day, month) => {
  const d = new Date()
  const thisYear = new Date(d.getFullYear(), month - 1, day)
  const nextYear = new Date(d.getFullYear() + 1, month - 1, day)
  if (thisYear < d) {
    return datePretty(nextYear)
  }
  return datePretty(thisYear)
}

const timeAgo = backThen => {
  if (backThen === null || backThen === undefined) return ''
  const d = new Date()
  const bd = new Date(backThen)
  if (d.getMonth() === bd.getMonth() && d.getDate() === bd.getDate()) return 'Today'
  return moment(backThen).fromNow()
}
exports.timeAgo = timeAgo

exports.timeAgoDM = (day, month) => {
  const d = new Date()
  const thisYear = new Date(d.getFullYear(), month - 1, day)
  const nextYear = new Date(d.getFullYear() + 1, month - 1, day)
  if (thisYear < d) {
    return timeAgo(nextYear)
  }
  return timeAgo(thisYear)
}

exports.prettyNumber = x => {
  if (x === null || x === undefined) return ''
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

exports.dumpThis = object => {
  console.log(object)
  return ''
}

exports.dumpJSON = object => {
  let pre = "<pre class='admin_view'>"
  pre += JSON.stringify(object, null, 4)
  pre += '</pre>'
  return pre
}

exports.addReturns = text => {
  if (text === null || text === undefined) return ''
  return text.replace(/\n/g, '<br />')
}

exports.toUpperCase = text => {
  if (text === null || text === undefined) return ''
  return text.toUpperCase()
}

exports.stripAt = text => {
  return text.replace('@', '')
}
