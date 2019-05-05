<template lang="html">
  <div>My cart</div>
  <ul>
  	<li v-for="item in items"></li>
  </ul>
</template>

<script>

/**
 * @component Cart
 * @desc manage all items added to your cart
 * @lifecycle mounted set default value
 * @lifecycle beforeDestroy properly detach stuffs
 * @route /my-cart
 * @route /my-cart/revision
 * @fires component:Cart~checkout
 */
export default {
	props: {

		/**
		 * @vprop {String} [theme=light]
		 */
		theme: {
			type: String,
			default: 'light'
		}
	},

	data() {
		return {
			/**
			 * @member {Boolean}
			 */
			default: true
		}
	},

	computed: {

		/**
		 * @computed {Item[]} items the actual items from the store
		 * @see {@link store:Warehouse~items Warehouse~items}
		 */
		...mapGetters(['items']),

		/**
		 * @computed {Boolean} isReadyForCheckout
		 */
		 isReadyForCheckout() {
			 return !!items.length
		 }
	},

	watch: {

		/**
		 * @watch items
		 * @param {Item[]} newitems
		 * @param {Item[]} olditems
		 * @desc on items change, do some stuff
		 */
		items(newitems, olditems) {
			// Do stuff on items update
		}
	},

	mounted() {
			if(this.theme !== 'light') {
				this.default = false
			}
	},

	methods: {

		/**
		 * @method goToCheckOut
		 * @desc emit checkout event
		 * @fires component:Cart~checkout
		 */
		goToCheckOut() {
			/**
			 * @event component:Cart~checkout
			 */
			this.$emit('checkout')
		},


		/**
		 * @method incrementItem
		 * @desc More of this item !
		 *
		 * @param  {Item} item the item to act on
		 * @return {Number}    the new quantity
		 */
		incrementItem(item) {
			return item.quantity--
		},


		/**
		 * @method decrementItem
		 * @desc do the exact opposite of {@link component:Cart~incrementItem incrementItem()}
		 *
		 * @param  {Item} item the item to act on
		 * @return {Number}    the new quantity
		 */
		decrementItem(item) {
			return item.quantity--
		}
	}
}
</script>

<style lang="css" scoped>
</style>
