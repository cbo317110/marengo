import Logs from './../logs'
import Conf from './../conf'

const middleware = {
	render: function(el){
		return this.allowed ? el('div', this.$slots.default) : null
	},
	data() {
		return {
			allowed: false
		}
	}
}

export default {
	check(middleware) {
		return typeof middleware == 'function'
	},
	components: {
		middleware
	},
	events: {
		beforeCreate: function() {
			this[`${Conf.alias}/middleware`] = this[Conf.alias].plugins.middleware
		},
		created: function() {
			this[`${Conf.alias}/middleware`](() => {
				this.$nextTick(() => {
					this.$children[0].allowed = true
				})
			})
		}
	}
}