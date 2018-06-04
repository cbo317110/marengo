import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

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

export default class {
  
	static inject(target, option) {
		if (targetIsPlugin(target, option)) option ? Vue.use(target, option) : Vue.use(target)
		if (targetIsComponent(target, option)) Vue.component(option, target)
	}

  constructor(target) {
    
    Vue.use(Vuex)
    Vue.use(VueRouter)

    let methods = Object.assign({
			getter: function(url) {
				return this.$store.getters[url]
			},
			commit: function(url, value) {
				return this.$store.commit(url, value)
			},
			router: function(push) {
				push = str => this.$router.push(str)
				return { push }
			}
		}, target.helpers)

		let beforeCreate = new Object
    
    let modules = {}
    let plugins = target.plugins
    let settings = target.settings
    let router = new VueRouter({ mode: 'history', routes: target.apps })
    let valid = {
      plugins: []
    }
    
    router.beforeEach(target.firewall)

    for (let m in target.modules) {
      modules[m] = Object.assign({ namespaced: true }, target.modules[m])
    }	
    
    for (let p in plugins) {
      p = plugins[p]
      p.body = settings[p.name] ? p.body(settings[p.name]) : p.body()
      if (p.body.validation()) {
        valid.plugins.push(p)
        if (p.body.module) {
          modules[p.name] = Object.assign({ namespaced: true }, p.body.module)
        }
        if (p.body.methods) {
          methods = Object.assign(methods, p.body.methods)
        }
        if (p.body.globals) {
        	for (let g in p.body.globals) {
        		Vue.component(g, p.body.globals[g])
        	}
        }
      }
    }

    Vue.mixin({
      methods,
      beforeCreate() {
        valid.plugins.forEach(p => {
          if (this.$parent) {
            if (p.body.precept) p.body.precept(this)
          } else {
            if (p.body.deploy) p.body.deploy(this)
          }
        })
      }
    })    

    window[target.name] = new Vue({
      render: h => h(target.source),
      store: new Vuex.Store({modules}),
      router
    }).$mount(target.el)
    window.commit = (url, value) => window[target.name].$store.commit(url, value)
		window.getter = url => window[target.name].$store.getters[url]
		window.router = () => window[target.name].router()
  }
}