import { merge, objHas } from 'moon-helper'
import Conf from './conf'
import Template from './template'
import Events from './vue/events'

/* Install Marengo once */
if (!window['marengo']) { window['marengo'] = (conf) => {
	window['marengo-$'] = Conf
	
	/* Defense */
	if (!objHas(conf, ['env', 'body', 'kext'])) {
		Conf.logs.warn('Invalid component')
		return
	}

	/* Merge given conf with marengo defaults */
	conf = merge(Template, conf)

	/* Create vue component objects */
	let methods = {}
	let components = {}
	let events = Events

	/* Inject marengo environment in this component */
	events.beforeCreate.push(function() {
		this[Conf.alias] = conf
	})

	for (let p in conf.kext) {
		if (objHas(conf.kext, p)) {
			if (conf.kext[p].check(conf.body[p])) {
				if (objHas(conf.kext[p], 'env')) {
					conf.env = merge(conf.env, conf.kext[p].env)
				}
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