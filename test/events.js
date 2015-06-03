var Router = require('../')
var test = require('tape')
var location = require('global/window').location
var history = require('global/window').history

if (location) {
  test('hashchange', function (t) {
    t.plan(2)
    var router = new Router({
      '/one': function () { return 1 },
      '/two': function () { return 2 }
    }, {location: 'hash'})
    router.on('transition', function (route, data) {
      if (route === '/one') {
        t.equal(location.hash, '#/one')
        router.transitionTo('/two')
      } else {
        t.equal(location.hash, '#/two')
        t.end()
      }
    })
    location.hash = '#/one'
  })
}

if (history) {
  test('history', function (t) {
    t.plan(4)
    var data = [0, 0]
    var router = new Router({
      '/one': function () { return ++data[0] },
      '/two': function () { return ++data[1] }
    }, {location: 'history'})
    router.on('transition', function (route, count) {
      if (route === '/one' && count === 1) {
        t.equal(location.pathname, '/one')
        router.transitionTo('/two')
      } else if (route === '/two' && count === 1) {
        t.equal(location.pathname, '/two')
        history.back()
      } else if (route === '/one' && count === 2) {
        t.equal(location.pathname, '/one')
        history.go(1)
      } else {
        t.equal(location.pathname, '/two')
        t.end()
      }
    })
    router.transitionTo('/one')
  })
}
