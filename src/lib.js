const { objHas, merge, unique, isFunction } = require('moon-helper')

export default (target, plugins) => {

	let events = {
		beforeCreate: [],
		created: [],
		mounted: [],
		updated: []
	}

	// Ordinary and default values
	let methods = {}
	let components = {}

	// Init the horse
	events.beforeCreate.push(function() {
		
		this['!(M)'] = target
		
		if (!this.$root['(M, root, drive)']) {

			this.$root['(M, root, drive)'] = {}
			
			this.$root['(M, root, pull)'] = function(key, standard){
				if (objHas(this.$root['(M, root, drive)'], key))
					return this.$root['(M, root, drive)'][key]
				return standard
			}

			this.$root['(M, root, push)'] = function(key, value) {
				this.$root['(M, root, drive)'][key] = value
			}

			this.$root['(M, root, data)'] = function() {
				return this.$root['(M, root, drive)']
			}

		}

		this.$m = function() {
			let args = Array.from(arguments)
			let hook = args[0]
			delete args[0]
			args = args.filter(n => n != undefined)
			if ( objHas(this.$root, `(M, root, ${hook})`)
				&& isFunction(this.$root[`(M, root, ${hook})`]) ) {
				return this.$root[`(M, root, ${hook})`](...args)
			}
		}

	})

	let props = {
		env: {
			default: () => {},
			type: Object
		}
	}

	let computed = {
		'(M)': function() {
			return merge(this['!(M)'], this.env)
		}
	}

	for (let p in plugins) {
		if (objHas(target, p) && plugins[p].check(target[p])) {
			if (objHas(plugins[p], 'events')) {
				for (let e in events) {
					if (objHas(plugins[p].events, e)) {
						events[e].push(plugins[p].events[e])
					}
				}
			}
			if (objHas(plugins[p], 'components')) {
				components = merge(components, plugins[p].components)
			}
		}
	}



	return merge({
		methods,
		components,
		props,
		computed
	}, events)

}