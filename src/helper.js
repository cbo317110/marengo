import { uniqueId, merge, isPlainObject, isBoolean, forEach } from 'lodash'

/* Aliases */
const isObject = isPlainObject


/* Types */
const isArray = param => Array.isArray(param)
const isString = param => typeof param === 'string'
const isFunction = param => typeof param === 'function'

/* Utilities */
const unique = () => `${new Date().getTime()}${uniqueId()}`
const objHas = (obj = {}, keys) => {
	if (!isObject(obj) || !(typeof keys === 'string' || Array.isArray(keys))) return false
	if (typeof keys === 'string') return obj.hasOwnProperty(keys)  
	return keys.length == keys.filter(key => obj.hasOwnProperty(key)).length
}
const rule3 = (a, c, b) => b * c / a

export {
	rule3,
	unique,
	merge,
	forEach,
	objHas,
	isObject,
	isArray,
	isBoolean,
	isString,
	isFunction
}