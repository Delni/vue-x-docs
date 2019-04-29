const state = {}

const mutations = {}

const getters = {}

const actions = {

  /**
   * @action getBooksByAuthor
   * @desc get a list of books by author
   * @param  {String} author the name of the author
   * @return {Books[]}       description
   */
  getBooksByAuthor(author) {}
}


/**
 * @store Bookstore
 * @namespaced
 * @description The bookstore module of the vue app
 */
module.exports = {
  namespaced: true, /** @memberof store:Bookstore */
  state,            /** @memberof store:Bookstore */
  mutations,        /** @memberof store:Bookstore */
  getters,          /** @memberof store:Bookstore */
  actions,          /** @memberof store:Bookstore */
}
