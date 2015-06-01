module.exports = Router

var EE = require('events').EventEmitter
var inherits = require('inherits')
var createRouter = require('routes')

function Router (routes, opts) {
  if (!(this instanceof Router)) return new Router(routes, opts)
  var self = this
  EE.call(self)
  opts = opts || {}
  self._router = createRouter()
  self.currentRoute = null
  if (routes) {
    Object.keys(routes).forEach(function (key) {
      self.route(key, routes[key])
    })
  }
  if (opts.location !== false) this._initBrowser(opts.location)
}
inherits(Router, EE)

Router.prototype.route = function (name, model) {
  this._router.addRoute(name, model)
}

Router.prototype.transitionTo = function (name) {
  var self = this

  if (name === self.currentRoute) return

  var aborted = false
  function abort () { aborted = true }
  self.emit('loading', name, abort)

  function done (err, data) {
    if (aborted) return
    if (err) return self.emit('error', name, err)
    self.currentRoute = name
    self.emit('transition', name, data)
  }

  var model = this._router.match(name)
  if (!model) {
    return done(new Error('Route not found: ' + name))
  }

  try {
    // TODO: Detect queryParams
    var data = model.fn(model.params, done)
    if (data) {
      if (typeof data.then === 'function') {
        data.then(function (result) {
          done(null, result)
        }).catch(done)
      } else {
        done(null, data)
      }
    }
  } catch (err) {
    done(err)
  }
  return this
}

// TODO: Still not sure about this API
Router.prototype.serve = function (fn) {
  var self = this
  return function (request, response) {
    var ctx = {
      request: request,
      response: response
    }
    var name = require('url').parse(request.url).pathname
    self.once('transition', function (route, data) {
      fn.call(ctx, route, data)
    })
    self.transitionTo(name)
  }
}

Router.prototype._initBrowser = function (which) {
  var self = this
  var window = require('global/window')
  var location = require('global/document').location

  // If location doesnt exist, dont even try
  if (!location) return

  var usePush = !!(window && window.history && window.history.pushState)
  if (which === 'history') usePush = true
  else if (which === 'hash') usePush = false

  if (usePush) {
    window.onpopstate = function (e) {
      self.transitionTo(location.pathname)
    }
    self.on('transition', function (page) {
      window.history.pushState({}, page, page)
    })
  } else {
    window.addEventListener('hashchange', function (e) {
      self.transitionTo(location.hash.slice(1))
    }, false)
    self.on('transition', function (page) {
      location.hash = '#' + page
    })
  }
}
