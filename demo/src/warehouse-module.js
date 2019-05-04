/**
 * @store Warehouse
 * @namespaced
 * @desc Main store for this application
 */

const goods = require('./goods.js')
const state = {
	/**
	 * @member {Array} items the items you have selected
	 */
	items: []
}

const mutations = {

	/**
	 * @mutation ADD_TO_CART
	 * @desc push new item into the cart
	 *
	 * @param  {Object} payload
	 * @param  {Item}   payload.item the item to push
	 * @param  {Number} payload.quantity how many of this item to put
	 */
	ADD_TO_CART({state}, {item, quantity}) {
		state.items.push({
			item,
			quantity
		})
	}
}
const actions = {

	/**
	 * @action getAllGood
	 * @desc get the goods async fashion from API
	 * @see {@link model:Goods.getGoods}
	 *
	 * @return {SimpleItem[]}
	 */
	getAllGood() {
		return goods.getGoods()
	},

	/**
	 * @action getThatGood
	 * @param {Item} item the item to get
	 * @desc get the good async fashion from API
	 * @see {@link model:Goods.getGoodsById}
	 *
	 * @return {SimpleItem[]}
	 */
	getThatGood(store, item) {
		return goods.getGoodsById(item.id).then(res => {
			return {
				...res,
				comments: extractComments(res)
			}
		})
	}
}


/**
 * @method extractComments
 * @static
 * @return {String[]}
 */
function extractComments() {
	// inner function
}
const getters = {

	/**
	 * @getter items
	 * @return {Item[]}
	 */
	items: state=> state.items
}
