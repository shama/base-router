var test = require('tape')
var Router = require('./index.js')

test('return data', function (t) {
  t.plan(6)
  var router = new Router({
    '/': function () { return [1, 2, 3] },
    '/error': function () { throw new Error('dang it') }
  })
  router.on('transition', function (page, data) {
    t.equal(page, '/')
    t.equal(router.currentRoute, '/')
    t.deepEqual(data, [1, 2, 3])
  })
  router.transitionTo('/')
  router.on('error', function (page, err) {
    t.equal(page, '/error')
    t.equal(router.currentRoute, '/')
    t.equal(err.message, 'dang it')
    t.end()
  })
  router.transitionTo('/error')
})

test('callback data / error', function (t) {
  t.plan(5)
  var router = new Router({
    '/': function (params, done) { done(null, [1, 2, 3]) },
    '/error': function (params, done) { done(new Error('dang it')) }
  })
  router.on('transition', function (page, data) {
    t.equal(page, '/')
    t.deepEqual(data, [1, 2, 3])
  })
  router.transitionTo('/')
  router.on('error', function (page, err) {
    t.equal(page, '/error')
    t.equal(router.currentRoute, '/')
    t.equal(err.message, 'dang it')
    t.end()
  })
  router.transitionTo('/error')
})

test('promise data / error', function (t) {
  t.plan(4)
  var router = new Router({
    '/': function () {
      return new Promise(function (resolve) {
        resolve([1, 2, 3])
      })
    },
    '/error': function () {
      return new Promise(function (resolve, reject) {
        reject(new Error('dang it'))
      })
    }
  })
  router.on('transition', function (page, data) {
    t.equal(page, '/')
    t.deepEqual(data, [1, 2, 3])
  })
  router.transitionTo('/')
  router.on('error', function (page, err) {
    t.equal(page, '/error')
    t.equal(err.message, 'dang it')
    t.end()
  })
  router.transitionTo('/error')
})

test('loading', function (t) {
  t.plan(3)
  var router = new Router({
    '/': function (params, done) {
      setTimeout(function () {
        done(null, [1, 2, 3])
      }, 100)
    }
  })
  router.on('loading', function (page) {
    t.equal(page, '/')
  })
  router.on('transition', function (page, data) {
    t.equal(page, '/')
    t.deepEqual(data, [1, 2, 3])
    t.end()
  })
  router.transitionTo('/')
})

test('unknown route', function (t) {
  t.plan(2)
  var router = new Router()
  router.on('error', function (page, err) {
    t.equal(page, '/dunno')
    t.equal(err.message, 'Route not found: /dunno')
    t.end()
  })
  router.transitionTo('/dunno')
})

test('abort route', function (t) {
  t.plan(1)
  var router = new Router({
    '/': function (params, done) {
      setTimeout(function () {
        done(null, [1, 2, 3])
      }, 100)
    }
  })
  router.on('transition', function () {
    t.ok(false, 'should have never hit transition')
  })
  router.on('loading', function (page, abort) {
    t.equal(page, '/')
    abort()
    setTimeout(function () {
      t.end()
    }, 300)
  })
  router.transitionTo('/')
})

// TODO: Test current route
