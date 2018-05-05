const { objHas } = require('moon-helper')
const Marengo = require('./lib')

module.exports = (component = {}, settings = {}, plugins = {}) => {
	component.extends = Marengo(settings, plugins)
	return component
}