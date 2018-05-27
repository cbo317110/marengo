import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

export default class {
  
  constructor(target) {
    
    Vue.use(Vuex)
    Vue.use(VueRouter)

    for (let g in target.globals) {
    	Vue.component(g, target.globals[g])
    }

    let methods = {
			getter: (url) => this.$store.getters[url],
			commit: (url, value) => this.$store.commit(url, value)
		}

		let beforeCreate = new Object
    
    let modules = {}
    let plugins = target.plugins
    let settings = target.settings
    let router = new VueRouter({ mode: 'history', routes: target.apps })
    let valid = {
      plugins: []
    }
    
    router.beforeEach(target.firewall)
    
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
      el: `#${target.el}`,
      render: h => h(target.from),
      store: new Vuex.Store({modules}),
      router
    })
    window.commit = (url, value) => window[target.name].$store.commit(url, value)
		window.getter = url => window[target.name].$store.getters[url]
  }
}