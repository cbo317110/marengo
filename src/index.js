import { objHas, merge } from 'cbo317110-helper'
import Translate from './translate.js'
import AxiosCover from 'axios-cover'

const defense = (component = {}) => {
	if (objHas(component, 'config')) {
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

const base = env => {
	let methods = {}
	return {
		data() {
			return {
				marengo: merge(config, env)
			}
		},
		props: {
			config: {
				default: () => {},
				type: Object
			}
		},
		computed: {
			'[maEnv]'() {
				return merge(this.marengo, this.config)
			}
		},
		methods,
		created() {
			if(objHas(this['[maEnv]'], 'resource')) {
				let resources = this['[maEnv]'].resource
				for(let r in resources) {
					this['[maEnv]'].saved.resource[r] = AxiosCover(resources[r]).client
				}
				this[this['[maEnv]'].alias.resource.resource] = (name) => {
					if (this['[maEnv]'].saved.resource[name]) {
						return this['[maEnv]'].saved.resource[name]()
					}
				}
			}
			this[this['[maEnv]'].alias.language.render] = Translate.str
		},
		mounted() {
			Translate.events(this)
		}
	}
}

export default (component = {}) => {
	if (defense(component)) {
		let env = component.config
		delete component.config
		component.extends = base(env)
		return component
	} else {
		console.warn('Invalid Marengo component!')
		return component
	}
}