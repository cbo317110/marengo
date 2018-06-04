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
	router: function(push) {
		push = str => this.$router.push(str)
		return { push }
	},
	date(word) {
		return word
	}
}

export default class {
  
	static createMethods() {
		this.methods = ordinaryMethods
	}

	static createModules() {
		this.modules = {}
	}

	static createPlugins() {
		this.plugins = []
	}

	static prepare() {
		if (!this.ready) {
			this.ready = true
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
		this.methods = merge(this.methods, methods)	
	}

	static appendModule(name, m) {
		this.modules[name] = merge({ namespaced: true }, m)
	}

	static addPlugin(p, option) {
    p.body = option ? p.body(option) : p.body()
    if (p.body.validation()) {
      this.plugins.push(p)
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

  static app(target) {


  	let plugins = this.plugins
  	let methods = this.methods

  	let app = {
  		render: h => h(target.source)	
  	}
    
    if (target.apps) {
    	Vue.use(VueRouter)
	    app.router = new VueRouter({ mode: 'history', routes: target.apps })
	    if (target.firewall) app.router.beforeEach(target.firewall)
    }

  	if (target.modules) {
  		Vue.use(Vuex)
	    for (let m in target.modules) {
	      this.modules[m] = merge({ namespaced: true }, target.modules[m])
	    }
	    app.store = new Vuex.Store({
	    	modules: this.modules
	    })
  	}

    Vue.mixin({
      methods,
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

    window[target.name] = new Vue(app).$mount(target.el)

    window.commit = (url, value) => window[target.name].$store.commit(url, value)
		window.getter = url => window[target.name].$store.getters[url]
		window.router = () => window[target.name].router()

  }
}