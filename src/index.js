import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { merge } from 'moon-helper'

const targetIsPlugin = function(target, option) {
	return target.hasOwnProperty('install') && typeof target.install == 'function'
}

const targetIsComponent = function(target, option) {
	if (typeof option == 'string') {
			let keys = [
			'props',
			'data',
			'watch',
			'render',
			'staticRenderFns',
			'data',
			'methods',
			'created',
			'beforeCreate',
			'mounted'
		]
		return keys.filter(k => target.hasOwnProperty(k)).length
	}
	return false
}

const targetIsMarengoPlugin = function(target, option) {
	return target.hasOwnProperty('body') && target.hasOwnProperty('name')
}

const ordinaryMethods = {
	getter: function(url) {
		return this.$store.getters[url]
	},
	commit: function(url, value) {
		return this.$store.commit(url, value)
	},
	dispatch: function(url) {
		return this.$store.dispatch(url)
	},
	router: function(push) {
		push = str => this.$router.push(str)
		return { push }
	}
}

export default class {
  
	static createMethods() {
		this.Methods = ordinaryMethods
	}

	static createComputed() {
		this.Computed = {}
	}

	static createWatch() {
		this.Watch = {}
	}

	static createModules() {
		this.Modules = {}
	}

	static createPlugins() {
		this.Plugins = []
	}

	static createContainer() {
		this.Container = {}
	}

	static prepare() {
		if (!this.ready) {
			this.ready = true
			this.createComputed()
			this.createWatch()
			this.createContainer()
			this.createModules()
			this.createPlugins()
			this.createMethods()
		}
	}

	static inject(target, option) {
		this.prepare()
		if (targetIsMarengoPlugin(target, option)) option ? this.addPlugin(target, option) : this.addPlugin(target)
		if (targetIsPlugin(target, option)) option ? Vue.use(target, option) : Vue.use(target)
		if (targetIsComponent(target, option)) Vue.component(option, target)
	}

	static appendMethods(methods) {
		this.Methods = merge(this.Methods, methods)	
	}

	static appendModule(name, m) {
		this.Modules[name] = merge({ namespaced: true }, m)
	}

	static addPlugin(p, option) {
    p.body = option ? p.body(option) : p.body()
    if (p.body.validation()) {
      this.Plugins.push(p)
      if (p.body.module) {
        this.appendModule(p.name, p.body.module)
      }
      if (p.body.methods) {
      	this.appendMethods(p.body.methods)
      }
      if (p.body.globals) {
      	for (let g in p.body.globals) {
      		Vue.component(g, p.body.globals[g])
      	}
      }
    }
	}

	static modules(modules) {
		Vue.use(Vuex)
		this.useModules = true
		let app = this
    for (let m in modules) {
    	let ordinary = {
    		namespaced: true,
    		state: {
    			deployed: 0
    		},
    		getters: {
    			deployed: state => state.deployed
    		},
    		mutations: {
    			deployed: state => state.deployed++
    		},
    		actions: {
    			unlockUpdates(context) {
    				Object.keys(context.state).forEach(c => {
    					app.Target.$watch(`$store.state.${m}.${c}`, function(value) {
    						context.dispatch('updated', c)
    					})
    				})
    			}
    		}
    	}
    	for (let p in modules[m].state) {
    		ordinary.getters[p] = state => state[p]
    		ordinary.mutations[p] = (state, value) => state[p] = value
    		ordinary.mutations['deploy'] = (state, payload) => state = merge(state, payload)
    		if (typeof modules[m].state[p] == 'boolean') {
    			ordinary.mutations[`!${p.charAt(0).toUpperCase() + p.slice(1)}`] = state => state[p] = !state[p]
    		}
    	}
    	if (modules[m].computed) {
    		if (typeof modules[m].computed == 'boolean') {
    			for (let s in modules[m].state) {
    				this.Computed[`$${m}.${s}`] = {
    					get() { return this.$store.getters[`${m}/${s}`] },
    					set(value) { this.$store.commit(`${m}/${s}`, value) }
    				}
    			}
    		} else if (Array.isArray(modules[m].computed)) {
    			modules[m].computed.forEach(c => {
    				this.Computed[`$${m}.${c}`] = {
    					get() { return this.$store.getters[`${m}/${c}`] },
    					set(value) { this.$store.commit(`${m}/${c}`, value) }
    				}
    			})
    		}
    	}
      this.Modules[m] = merge(ordinary, modules[m])
    }
    this.Container.store = new Vuex.Store({
    	modules: this.Modules
    })
    window['store'] = this.Container.store
	}

	static routes(routes) {
		Vue.use(VueRouter)
		this.Container.router = new VueRouter({
			mode: 'history',
			routes
		})
	}

	static helpers(methods) {
		this.appendMethods(methods)
	}

	static firewall(firewall) {
		this.Container.router.beforeEach(firewall)
	}
 
  static run(target, el) {
  	let plugins = this.Plugins
  	let modulesToDeploy = this.ModulesToDeploy
  	this.Container.render = h => h(target)
    Vue.mixin({
      methods: this.Methods,
      beforeCreate() {
        plugins.forEach(p => {
          if (this.$parent) {
            if (p.body.precept) p.body.precept(this)
          } else {
            if (p.body.deploy) p.body.deploy(this)
          }
        })
      }
    })
    if (this.Container.computed
    	&& typeof this.Container.computed == 'object') {
    	this.Container.computed = merge(this.Computed, this.Container.computed)
    } else {
			this.Container.computed = this.Computed
    }
    if (this.Container.watch
    	&& typeof this.Container.watch == 'object') {
    	this.Container.watch = merge(this.Watch, this.Container.watch)
    } else {
    	this.Container.watch = this.Watch
    }
    window[el] = new Vue(this.Container).$mount(el)
    this.Target = window[el]
    window.commit = (url, value) => window[el].$store.commit(url, value)
		window.getter = url => window[el].$store.getters[url]
		window.dispatch = url => window[el].$store.dispatch(url)
		window.router = () => window[el].router()
  }

}