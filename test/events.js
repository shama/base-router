var Router = require('../')
var test = require('tape')
var location = require('global/window').location
var history = require('global/window').history

if (location && history) {
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

  test('history', function (t) {
    t.plan(6)
    var first = true
    var second, back, forward = false
    var router = new Router({
      '/one': function () { return 1 },
      '/two': function () { return 2 }
    }, {location: 'history'})
    router.on('transition', function (route, data) {
      if (first) {
        first = false; second = true
        t.equal(route, '/one')
        t.equal(data, 1)
        router.transitionTo('/two')
      } else if (second) {
        second = false; back = true
        history.back()
      } else if (back) {
        back = false; forward = true
        t.equal(route, '/one')
        t.equal(data, 1)
        history.go(1)
      } else if (forward) {
        t.equal(route, '/two')
        t.equal(data, 2)
        t.end()
      }
    })
    router.transitionTo('/one')
  })
}
