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
	mutation: {
		canHaveName: true,
		onTagged(doclet, tag) {
			// console.log(doclet, tag)
	  		doclet.is = 'mutation'
			doclet.scope = 'static'
			doclet.name = tag.value.name
			doclet.kind = 'function'
		}
	},
	getter: {
		canHaveName: true,
		onTagged(doclet, tag) {
	  		doclet.is = 'getter'
			doclet.scope = 'static'
			doclet.name = tag.value.name
			doclet.kind = 'function'
		}
	},
	action: {
		canHaveName: true,
		onTagged(doclet, tag) {
	  		doclet.is = 'action'
			doclet.name = tag.value.name
			doclet.scope = 'static'
			doclet.kind = 'function'
			doclet.async = true
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

const models = {
	model: {
		mustHaveValue: true,
		canHaveType: false,
		canHaveName: true,
		isNamespace: true,
		onTagged(doclet, tag) {
			doclet.name = tag.value.name
			doclet.longname = `model:${tag.value.name}`
	  		doclet.is = 'model'
			doclet.kind = 'module'
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
	lifecycle: {
		mustHaveValue: true,
		canHaveName: true,
		canHaveType: false,
		onTagged(doclet, tag) {
			if(!Array.isArray(doclet.lifecycles)) doclet.lifecycles = []
			doclet.lifecycles.push(tag.value)
		}
	},
	route: {
		mustHaveValue: true,
		onTagged(doclet, tag) {
			if(doclet.is === 'component') {
				if(!doclet.routes) { doclet.routes = []}
				doclet.routes.push(tag.value)
			}
		}
	},
	computed: {
		canHaveName: true,
		canHaveType: true,
		onTagged(doclet, tag) {
			doclet.computed = true
			if(tag.value) {
				Object.keys(tag.value).forEach(key => {
					doclet[key] = tag.value[key]
				})
			}
			doclet.kind= 'member'
		},
	},
	vprop: {
		canHaveName: true,
		canHaveType: true,
		onTagged(doclet, tag) {
			doclet.isProp = true
			doclet.readonly = true
			if(tag.value) {
				Object.keys(tag.value).forEach(key => {
					doclet[key] = tag.value[key]
				})
			}
			doclet.kind= 'member'
		}
	},
	watch: {
		canHaveName: true,
		onTagged(doclet, tag) {
	  		doclet.is = 'watcher'
			if(tag.value) {
				Object.keys(tag.value).forEach(key => {
					doclet[key] = tag.value[key]
				})
			}
			doclet.scope = 'static'
			doclet.kind = 'function'
		}
	}
}

exports.defineTags = function(dictionary){
  /** All store related tags **/
  Object.keys(stores).forEach(key => {
    dictionary.defineTag(key, stores[key])
  })

  /** All store related tags **/
  Object.keys(models).forEach(key => {
    dictionary.defineTag(key, models[key])
  })

  /** All component related tags **/
  Object.keys(components).forEach(key => {
    dictionary.defineTag(key, components[key])
  })
}

exports.handlers =  {
    newDoclet(e) {
		if (e.doclet.is === 'action') {
			// console.log(e.doclet)
		}
    },
}
