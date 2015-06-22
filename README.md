# base-router
A simple and portable router for the client and server.

[![build status](https://secure.travis-ci.org/shama/base-router.svg)](https://travis-ci.org/shama/base-router)
[![NPM version](https://badge.fury.io/js/base-router.svg)](https://badge.fury.io/js/base-router)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/shama.svg)](https://saucelabs.com/u/shama)

## example

```js
var createRouter = require('base-router')

// Create a router that will resolve data
var router = createRouter({
  '/': function () {
    return [1,2,3]
  }
})

// React to transition events
router.on('transition', function (route, data) {
  // Trigger re-render with virtual dom here
})

// Manually trigger transitioning to routes
router.transtionTo('/')
```

#### Specifying Routes
This library uses the module [routington](https://github.com/pillarjs/routington)
to specify and match routes. Please see their docs for route matching.

Some common examples are:

* `/bears` will match `/bears`
* `/bears/:type` will match `/bears/grizzly`
* `/bears/:type?` will match `/bears` or `/bears/grizzly`

#### Resolving Data
You can resolve data using `return`, `callback` or `promise`:

```js
var router = createRouter({
  '/': function () {
    // Throw an error to indicate an error
    return [1,2,3]
  },
  '/callback': function (params, done) {
    // Call done with an error as the the first param to indicate an error
    done(null, [1,2,3])
  },
  '/promise': function () {
    return new Promise(function (resolve, reject) {
      // Reject the promise to indicate an error
      resolve([1,2,3])
    })
  },
})
```

A `loading` event is emitted indicating the route is transitioning but has not
yet finished resolving. Only when the route has resolved will `transition` be
called.

#### Example with [virtual-dom](https://github.com/Matt-Esch/virtual-dom)

```js
var createRouter = require('base-router')
var h = require('virtual-dom/h')
var xhr = require('xhr')

var router = createRouter({
  '/': function () {
    // Define simple elements for this route
    return h('div', 'Home Page')
  },
  '/posts/:post': function (params, done) {
    // If remote data is needed grab that
    xhr('/api/posts/' + params.post, function (err, res, body) {
      if (err) return done(err)
      // Then return a vnode with the retrieved data
      done(null, h('.post', body))
    })
  },
})

router.on('transition', function (route, childNode) {
  // Render each page based on the route selected
  var links = [
    h('a', { href: '/' }, 'Home'),
    h('a', { href: '/posts/one' }, 'First Post')
  ]
  var content = h('.content', [links, childNode])
  // Now we can render our page with virtual dom diffing
})
```

## api

### `var router = new BaseRouter([routes, options])`
Creates a new instance of `base-router`.

* `routes` - An object literal of routes to create.
* `options` - An object literal to configure:
  * `location` - Whether to manage the `window.location`. If
  `window.history.pushState` is available it will use that otherwise it will use
  `window.location.hash`. Set to `false` to disable, `hash` to force using
  hashes, and `history` to force using push state.

### `router.route(name, model)`
Adds a new route. `name` is the pathname to our route and `model` is a function
that resolves the data for the route.

```js
router.route('/user/:id', function (params, done) {
  done(null, params.id)
})
```

### `router.transitionTo(name[, params, callback])`
Transitions to the given route `name`.

Optionally you can supply `params` to override the params given to a route.

Optionally you can supply a `callback` which will be called instead of using the
`transition` and `error` events.

### `router.currentRoute`
The last resolved route we are currently on.

### Events

#### `.on('transition', function (name, data) {})`
When a transition has resolved. Gives the `name` of the route and the `data`
that has been resolved by the model.

#### `.on('loading', function (name, abort) {})`
Indicates the desire to transition into a route with `name` but model has not
yet resolved.

Call `abort()` to abort the transition.

#### `.on('error', function (name, err) {})`
When a transition has errored. Gives the `name` of the route and the `err`
that has been either thrown, first argument of callback or rejected by the
promise.

## license
(c) 2015 Kyle Robinson Young. MIT License
