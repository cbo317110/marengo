const { objHas, merge } = require('moon-helper')
const Events = require('./vue/events')

module.exports = (target, plugins) => {

	/* Ordinary and default values  */
	let methods = {}
	let components = {}

	/* Init the horse */
	Events.beforeCreate.push(function() {
		this['!(M)'] = target
	})

	let props = {
		env: {
			default: () => {},
			type: Object
		}
	}

	let computed = {
		'(M)': function(){
			return merge(this['!(M)'], this.env)
		}
	}

	for (let p in plugins) {
		if (objHas(plugins, p)) {
			if (plugins[p].check(target[p])) {
				if (objHas(plugins[p], 'standard')) {
					target[p] = merge(target[p], plugins[p].standard)
				}
				if (objHas(plugins[p], 'events')) {
					for (let e in Events) {
						if (objHas(plugins[p].events, e)) {
							Events[e].push(plugins[p].events[e])
						}
					}
				}
				if (objHas(plugins[p], 'components')) {
					components = merge(components, plugins[p].components)
				}
			} else {
				console.warn(`Plugin [${p}] hasn't a valid schema`)
			}
		} else {
			console.warn(`Plugin [${p}] not exists`)
		}
	}

	return merge({
		methods,
		components,
		props,
		computed
	}, Events)

}