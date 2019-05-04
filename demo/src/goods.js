// Define it before model, to make it global
/**
* @typedef Item
* @prop {Number} id
* @prop {String} name
* @prop {String} description
* @prop {Object[]} comments
* @prop {Date} comments.date
* @prop {User} comments.author
* @prop {String} comments.content
* @prop {Number} price
*/
/**
* @typedef SimpleItem
* @prop {String} name
* @prop {Number} price
*/

/**
* @model Goods
* @desc define items, and talk to the API.
*
* Pay attention to the fact that "simple return" with no description won't display redondant information
*/
const Goods = {

	/**
	 * @method getGoods
	 * @desc get list of items, lightweight.
	 * @async
	 * @static
	 * @return {SimpleItem[]}
	 */
	getGoods() {
		// API Call
	},


	/**
	 * @method getGoodsById
	 * @async
	 * @static
	 * @param  {Number} id the id of the item
	 * @return {Item} return the item with full description
	 * @return {Boolean} return false if id doesn't exist
	 */
	getGoodsById(id) {
		// API Call
	},

	/**
	 * @method getGoodsByName
	 * @async
	 * @static
	 * @deprecated use {@link model:Goods.getGoodsById getGoodsById}
	 * @param  {string} name the id of the item
	 * @return {Item} return the item with full description
	 * @return {Boolean} return false if id doesn't exist
	 */
	getGoodsByName(name) {
		// API Call
	}
}
module.exports = Goods
