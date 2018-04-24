import { objHas, merge } from './helper'

const defense = (component = {}) => {
	if (objHas(component, 'config')) {
		return true
	}
	return false
}

const config = {
	event: {
		prefix: 'static_event_'
	},
	language: {
		current: 'en_US',
		supported: ['pt_BR', 'en_US', 'es_ES'],
		package: {
			pt_BR: {
				table: 'Cadeira'
			}
		}
	}
}

const base = env => {
	return {
		props: {
			marengoEnvironment: {
				default: () => merge(config, env),
			},
			config: {
				default: () => {},
				type: Object
			}
		},
		computed: {
			parsedConfig() {
				return merge(this.marengoEnvironment, this.config)
			}
		},
		mounted() {
			console.log(this.parsedConfig)
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