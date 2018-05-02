import { merge, objHas } from 'moon-helper'

import Plugins from './plugins'
import Conf from './conf'
import Logs from './logs'

if (!window['marengo']) { window['marengo'] = (conf) => {
	
	if (!objHas(conf, ['env', 'plugins'])) {
		Logs.warn('Invalid component')
		return
	}


	/* Merge given conf with marengo defaults */
	conf = merge({
		env: {
			language: 'en_US',
			requests: []
		},
		DOM: {
			events: {}
		}
	}, conf)

	/* Create vue component objects */
	let methods = {}
	let components = {}
	let events = {
		beforeCreate: [],
		created: [],
		mounted: [],
		updated: []
	}

	/* Inject marengo environment in this component */
	events.beforeCreate.push(function() {
		this[Conf.alias] = conf
	})

	for (let p in conf.plugins) {
		if (objHas(Plugins, p)) {
			if (Plugins[p].check(conf.plugins[p])) {
				if (objHas(Plugins[p], 'events')) {
					for (let e in events) {
						if (objHas(Plugins[p].events, e)) {
							events[e].push(Plugins[p].events[e])
						}
					}
				}
				if (objHas(Plugins[p], 'components')) {
					components = merge(components, Plugins[p].components)
				}
			} else {
				Logs.warn(`Plugin [${p}] hasn't a valid schema`)
			}
		} else {
			Logs.warn(`Plugin [${p}] not exists`)
		}
	}

	return merge({
		methods,
		components
	}, events)

} }

/* H means Helper */
/* C means Component */
/* R means Requirement */
export default (C = {}, R = ['conf', 'lang', 'request', 'middleware'], args = []) => {
	for (let r of R) {
		args.push(C[r])
		delete[C[r]]
	}
	C.extends = window['marengo'](...args)
	return C
}