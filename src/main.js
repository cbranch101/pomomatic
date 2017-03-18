var component = require("./components/timer.js")

var m = require("mithril")


m.mount(document.body, component)
//kick off live editing
require("./patch")