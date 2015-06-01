var App = require('./example.js')

// Create our app attached to document.body
var app = new App(document.body)

// Default route
app.router.transitionTo('/posts/one')
