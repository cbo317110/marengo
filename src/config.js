export default {
	alias: {
		language: {
			render: '$trans'
		},
		resource: {
			resource: '$resource'
		}
	},
	event: {
		prefix: 'static_event_',
		collection: []
	},
	language: {
		current: 'en_US',
		supported: ['pt_BR', 'en_US', 'es_ES'],
		package: {
			pt_BR: {
				table: 'Cadeira'
			}
		}
	},
	saved: {
		data: {},
		resource: {}
	}
}