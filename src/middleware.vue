<template>
	<div v-if="ready">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				ready: false
			}
		},
		methods: {
			allow() {
				this.ready = true
			}
		}
	}
</script>