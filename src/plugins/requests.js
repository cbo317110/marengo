import { isObj, objLength } from 'moon-helper'
import ac from 'axios-cover'
import Logs from './../logs'
import Conf from './../conf'

export default {
	check(requests) {
		return isObj(requests) && objLength(requests)
	},
	events: {
		beforeCreate() {
			let requests = this[Conf.alias].plugins.requests
			for (let r in requests) {
				this[Conf.alias].env.requests[r] = ac(requests[r]).client
			}
			this['$requests'] = (name) => {
				if (this[Conf.alias].env.requests[name]) {
					return this[Conf.alias].env.requests[name]()
				} else {
					Logs.warn(`Request [${name}] not exists!`)
				}
			}
		}
	}
}