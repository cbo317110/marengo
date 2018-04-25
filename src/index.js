import *  as H from 'cbo317110-helper'
import AxiosCover from 'axios-cover'

import Translate from './translate.js'
import Middleware from './middleware'

const defense = (component = {}) => {
	if (H.objHas(component, 'config')) {
		return true
	}
	return false
}

const config = {
	alias: {
		language: {
			render: '$trans'
		},
		resource: {
			resource: '$resource'
		}
	},
	event: {
		prefix: 'static_event_',
		collection: []
	},
	language: {
		current: 'en_US',
		supported: ['pt_BR', 'en_US', 'es_ES'],
		package: {
			pt_BR: {
				table: 'Cadeira'
			}
		}
	},
	resource: {},
	saved: {
		data: {},
		resource: {}
	}
}

const base = (env, middleware) => {
	
	let methods = {}
	let components = {}

	for (let name in H) {
		methods[name] = H[name]
	}
	
	if (middleware) {
		components.middleware = Middleware
		methods['(MA)Middleware'] = middleware
		methods['(MA)MiddlewareCompleted'] = function() {
			this.$nextTick(() => {
				this.$children[0].allow()
			})
		}
	}

	return {
		components,
		data() {
			return {
				marengo: H.merge(config, env)
			}
		},
		props: {
			config: {
				default: () => {},
				type: Object
			}
		},
		computed: {
			'(MA)'() {
				return H.merge(this.marengo, this.config)
			}
		},
		methods,
		created() {
			if(H.objHas(this['(MA)'], 'resource')) {
				let resources = this['(MA)'].resource
				for(let r in resources) {
					this['(MA)'].saved.resource[r] = AxiosCover(resources[r]).client
				}
				this[this['(MA)'].alias.resource.resource] = (name) => {
					if (this['(MA)'].saved.resource[name]) {
						return this['(MA)'].saved.resource[name]()
					}
				}
			}
			this['(MA)Middleware'](this['(MA)MiddlewareCompleted'])
			this[this['(MA)'].alias.language.render] = Translate.str
		},
		mounted() {
			Translate.events(this)
		}
	}
}

export default (component = {}) => {
	if (defense(component)) {
		let env = component.config
		let middleware = component.middleware
		component.extends = base(env, middleware)
		delete component.config
		delete component.middleware
		return component
	} else {
		console.warn('Invalid Marengo component!')
		return component
	}
}
