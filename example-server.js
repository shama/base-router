var http = require('http')
var toHTML = require('vdom-to-html')
var App = require('./example.js')

var app = new App(false)

app.router.on('error', function (page, err) {
  //console.log('error', err.message)
})

// Create middleware for our server
var middleware = app.router.serve(function (page, data) {
  app.render(page, data)
  this.response.writeHead(200, { 'Content-Type': 'text/html' })
  this.response.end(toHTML(app.element.vtree))
})

// Create our server and listen
http.createServer(middleware).listen(1337)
