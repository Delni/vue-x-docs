const stores = {
  store: {
		mustHaveValue: true,
		canHaveType: false,
		canHaveName: true,
		isNamespace: true,
		onTagged(doclet, tag) {
			doclet.name = tag.value.name
			doclet.vuexModule = tag.value.name
			doclet.longname = `store:${tag.value.name}`
			doclet.scope = 'static'
      doclet.is = 'store'
			doclet.kind = 'module'
		}
	},
  namespaced: {
		canHaveName: false,
		canHaveType: false,
		onTagged(doclet) {
			if(doclet.vuexModule) {
				doclet.namespaced = true
			}
		}
	}
}

const components = {
  component: {
    mustHaveValue: true,
    canHaveName: true,
    canHaveType: false,
    isNamespace: true,
    onTagged(doclet, tag) {
      doclet.name = tag.value.name
			doclet.vuexModule = tag.value.name
			doclet.longname = `component:${tag.value.name}`
			doclet.scope = 'static'
      doclet.is = 'component'
			doclet.kind = 'module'
    },
  },
  computed: {
    onTagged(doclet, tag) {
      doclet.computed = true
    },
  }
}

exports.defineTags = function(dictionary){
  /** All store related tags **/
  Object.keys(stores).forEach(key => {
    dictionary.defineTag(key, stores[key])
  })


  /** All component related tags **/
  Object.keys(components).forEach(key => {
    dictionary.defineTag(key, components[key])
  })
}

exports.handlers =  {
    newDoclet(e) {
      // if (e.doclet.namespaced) {
			// 	e.doclet.description += 'is namespace'
			// }
    },
  }
