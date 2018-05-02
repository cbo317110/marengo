import { merge, objHas } from 'moon-helper'
import Conf from './conf'

/* Install Marengo once */
if (!window['marengo']) { window['marengo'] = (conf) => {

	/* Defense */
	if (!objHas(conf, ['env', 'body', 'kext'])) {
		Conf.logs.warn('Invalid component')
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

	for (let p in conf.kext) {
		window['marengo-$'] = Conf
		if (objHas(conf.kext, p)) {
			if (conf.kext[p].check(conf.body[p])) {
				if (objHas(conf.kext[p], 'events')) {
					for (let e in events) {
						if (objHas(conf.kext[p].events, e)) {
							events[e].push(conf.kext[p].events[e])
						}
					}
				}
				if (objHas(conf.kext[p], 'components')) {
					components = merge(components, conf.kext[p].components)
				}
			} else {
				Conf.logs.warn(`Plugin [${p}] hasn't a valid schema`)
			}
		} else {
			Conf.logs.warn(`Plugin [${p}] not exists`)
		}
	}

	return merge({
		methods,
		components
	}, events)

} }

export default (component = {}, conf) => {
	if (objHas(component, 'conf')) {
		conf = component.conf
		delete component.conf
		component.extends = window['marengo'](conf)
	} else {
		Conf.logs.warn('Invalid component')
	}
	return component
}