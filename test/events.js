var Router = require('../')
var test = require('tape')
var location = require('global/window').location

if (location) {
  test('hashchange', function (t) {
    t.plan(6)
    var first = true
    var router = new Router({
      '/one': function () { return 1 },
      '/two': function () { return 2 }
    }, {location: 'hash'})
    router.on('transition', function (route, data) {
      if (first) {
        first = false
        t.equal(route, '/one')
        t.equal(location.hash, '#/one')
        t.equal(data, 1)
        router.transitionTo('/two')
      } else {
        t.equal(route, '/two')
        t.equal(location.hash, '#/two')
        t.equal(data, 2)
        t.end()
      }
    })
    location.hash = '#/one'
  })
}
module.exports = {}
