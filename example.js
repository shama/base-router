module.exports = App

var Router = require('./index.js')
var createElement = require('base-element')

function App (el) {
  // Create our main app element
  this.element = createElement(el)

  // Define our routes
  var h = this.element.html
  this.router = new Router({
    '/': function () {
      return h('span', 'This is the home page.')
    },
    '/posts/:post?': function (params) {
      return h('strong', 'This is the content for page ' + (params.post || 'index') + '.')
    },
    '/about': function () {
      return h('em', 'This is the content for about page.')
    }
  }, { location: 'history' })

  // On any transtion, re-render
  this.router.on('transition', this.render.bind(this))

  // Display error view if we got an error then remove 2s later
  var errorElement = this.errorElement = createElement(el)
  this.router.on('error', function (page, err) {
    errorElement.render(function () {
      return this.html('.error', err.message)
    })
    setTimeout(function () {
      errorElement.render()
    }, 2000)
  })
}

App.prototype.render = function (page, data) {
  var h = this.element.html
  var links = h('ul', [
    h('li', h('a', { href: '/' }, 'home')),
    h('li', h('a', { href: '/posts/one' }, 'one')),
    h('li', h('a', { href: '/posts/two' }, 'two')),
    h('li', h('a', { href: '/about' }, 'about'))
  ])
  this.element.render(h('.content', [
    links,
    data
  ]))
}

var app

if (process.browser) {
  // On the client side
  app = new App(document.body)
  app.router.transitionTo('/posts/one')
} else {
  // On the server side
  var toHTML = require('vdom-to-html')
  app = new App(false)
  var middleware = app.router.serve(function (page, data) {
    app.render(page, data)
    this.response.writeHead(200, { 'Content-Type': 'text/html' })
    this.response.end(toHTML(app.element.vtree))
  })
  require('http').createServer(middleware).listen(1337)
}
