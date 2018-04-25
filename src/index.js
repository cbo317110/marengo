import *  as H from 'cbo317110-helper'
import AxiosCover from 'axios-cover'

import Translate from './translate.js'
import Middleware from './middleware'
import config from './config'

if (!window['marengo']) {
	
	window['marengo'] = (
		devConfig,
		middleware,
		resource,
		methods = {},
		components = {}
	) => {

		/* Inject Helper Functions */
		for (let name in H) {
			methods[name] = H[name]
		}

		/* Component Data */
		const data = {
			marengo: H.merge(config, devConfig)
		}

		/* Component Props */
		const props = {
			config: {
				default: () => {},
				type: Object
			}
		}

		/* Inject (MA) Computed Object */
		/* (MA) is a shorthand for 'Marengo' */
		const computed = {
			'(MA)'() {
				return H.merge(this.marengo, this.config)
			}
		}

		/* Inject middleware component if was asked for it */
		if (middleware) components.middleware = Middleware


		/* Injection of features */
		const injection = {
			resource(C) {
				for(let r in resource) {
					C['(MA)'].saved.resource[r] = AxiosCover(resource[r]).client
					C[C['(MA)'].alias.resource.resource] = (name) => {
						if (C['(MA)'].saved.resource[name]) {
							return C['(MA)'].saved.resource[name]()
						}
					}
				}
			},
			middleware(C) {
				C['(MA)Mid'] = middleware
				C['(MA)Mid'](() => {
					C.$nextTick(() => {
						C.$children[0].allow()
					})
				})
			},
			language(C) {
				C[C['(MA)'].alias.language.render] = Translate.str
			}
		}

		/* Check of requirements */
		const check = {
			language(C) {
				return C['(MA)'].language.package[C['(MA)'].language.current]
			},
			resource(C) {
				return resource
			},
			middleware(C) {
				return middleware
			}
		}

		/* Events */

		/* Created event */
		const created = function(){
			if (check.resource(this)) injection.resource(this)
			if (check.middleware(this)) injection.middleware(this)
			if (check.language(this)) injection.language(this)
		}

		/* Mounted event */
		const mounted = function(){
			Translate.events(this)
		}

		return {
			components,
			data: () => data,
			props,
			computed,
			methods,
			created,
			mounted
		}

	}
}

/* H means Helper */
/* C means Component */
/* R means Requirement */
export default (C = {}, R = ['config', 'middleware', 'resource'], args = []) => {
	if (H.objHas(C, 'config')) {
		for (let r of R) {
			args.push(C[r])
			delete[C[r]]
		}
		C.extends = window['marengo'](...args)
		return C
	}
	console.warn('Invalid Marengo component!')
	return C
}