# vue(x)docs

A JSDoc extension for [Vue](https://vuejs.org/v2/guide/) and [Vuex](https://vuex.vuejs.org/) based projects. This include jsdoc template & new tag definition.  

This project is not an official fork, but is widely inspired by [TUI JSDoc Template](https://github.com/nhn/tui.jsdoc-template) for some functionnality and template customization.

- [Install](#install)
- [Tags](#tags)
- [Template](#template)
	- [Config](#config)

![vue(x)docs Preview](https://github.com/Delni/vue-x-docs/raw/master/demo/vue_x_docs.png)

## Install
> _will be publish on npm when ready_

## Tags
:construction: WIP

#### Usage
([*jsdoc page - configuration*](http://usejsdoc.org/about-configuring-jsdoc.html#incorporating-command-line-options-into-the-configuration-file))

```JSON
"plugins": ["node_modules/vue(x)docs"],
```
If you use other plugins, put them before vue(x)docs. I would recommend [jsdoc-vue](https://www.npmjs.com/package/jsdoc-vue) to parse `*.vue` files, and markdown plugin from jsdoc:
```JSON
"plugins": [
	"plugins/markdown",
	"node_modules/jsdoc-vue",
	"node_modules/vue(x)docs"
],
```

#### Definition

:warning: Some tags will only be available with the template, as it redefined some of JSDoc core functionnality. In those case, a _fallback_ tag is defined

---
* `@store`  
	Define a `vuex` store.  
	Compatibility with vanilla JSDoc: fallback as `@module`.

	* `@namespaced` allow to precise that this vuex module is namespaced
	* `@actions`, `@mutations`, `@getters`, fallback as `@method`. `@actions` are automaticaly tagged as `async`

	See [warehouse-module.js](https://github.com/Delni/vue-x-docs/blob/master/demo/warehouse-module.js) for usage in context
---
* `@component`  
	Define a `vue` component.  
	Compatibility with vanilla JSDoc: fallback as `@module`.
	data from this component should be tagged `@member`

	* `@computed`: fallback as `@member`. Tag computed data
	* `@vprop`: fallback as `@member`. Tag props from actual data
	* `@route` : show the routes matched by this component. Not supported by default JSDoc template

	See [cart.vue](https://github.com/Delni/vue-x-docs/blob/master/demo/cart.vue) for usage in context
---
* `@model`
	Synonyme of `@module`, use to describe file that make the actual call to API, if you need.  
	See [goods.js](https://github.com/Delni/vue-x-docs/blob/master/demo/goods.js) for usage in context
---
## Template

:construction: to complete

### Config
([*jsdoc page - configuration*](http://usejsdoc.org/about-configuring-jsdoc.html#incorporating-command-line-options-into-the-configuration-file))

```JSON
"opts": {
    "template": "node_modules/tui-jsdoc-template"
}
```

You can customize some of the doc behavior

#### Use collapsible api list

*Default: `true`*
```JSON
"templates": {
    "useCollapsibles": true
}
```

#### Separates data, props and computed by a title
*Default: `true`*
```JSON
"templates": {
    "separateMembers": true
}
```

#### Use versioning tree output
*Default: `false`*  
```JSON
"templates": {
    "useVersionning": false
}
```
By default, output tree will be at the root of the output dir provided in conf, say `out`, you will have
```
out/
├─ <generated documentation tree>
└─ index.html
```
By enabling `useVersionning`, vue(x)doc will use your package.json information to add "_version layer_".
Say your package.json looks like
`{
	"name": "myproject",
	"version": "v1.0.0",
	...
}`, output tree will be :
```
out/
└─ myproject/
 	└─ v1.0.0/
		├─ <generated documentation tree>
		└─ index.html
```
