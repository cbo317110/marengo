import { isArray, isObj, objLength, isString, isFunction, replace } from 'moon-helper'
import Logs from './../logs'
import Conf from './../conf'

const renderStr = function(word, data) {
	let event = `se_${this._uid}_`
	let str = ''
	let lang = this[Conf.alias].env.language
	let langs = this[Conf.alias].plugins.language
	if (langs[lang][word]) {
		str = langs[lang][word]
		if (!data || !isObj(data)) {
			return str
		} else {
			for (let key in data) {
				if (!isArray(data[key])) {
					str = str.replace(`{${key}}`, data[key])
				}
				if (isString(data[key][1])) {
					str = str.replace(`{${key}}`, `<a href="${data[key][1]}">${data[key][0]}</a>`)
				}
				if (isFunction(data[key][1])) {
					event += `${replace(replace(word, '.', '_'), ' ', '_')}_${key}`
					str = str.replace(`{${key}}`, `<span id="${event}">${data[key][0]}</span>`)
					this[Conf.alias].DOM.events[event] = data[key][1]
				}
			}
			return str
		}
	}
	return word

}

const checkEvents = function() {
	for (let event in this[Conf.alias].DOM.events) {
		if (document.querySelector(`#${event}`)) {
			document.querySelector(`#${event}`).onclick = this[Conf.alias].DOM.events[event]
		}
	}
}

export default {
	check(language) {
		return isObj(language) && objLength(language) && objLength(language)[0].includes('_')
	},
	events: {
		beforeCreate() {
			this['$'] = renderStr
		},
		mounted: checkEvents,
		updated: checkEvents
	}
}