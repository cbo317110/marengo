import { objHas, merge } from './helper'
import Translate from './translate.js'

const defense = (component = {}) => {
	if (objHas(component, 'config')) {
		return true
	}
	return false
}

const config = {
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
		},
		aliases: {
			render: '$trans'
		}
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
			this[this['[maEnv]'].language.aliases.render] = Translate.str
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