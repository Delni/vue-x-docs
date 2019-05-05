# vue(x)docs

A JSDoc extension for [Vue](https://vuejs.org/v2/guide/) and [Vuex](https://vuex.vuejs.org/) based projects. This include jsdoc template & new tag definition.  

[![NPM version](https://img.shields.io/npm/v/vue-x-docs.svg)](https://www.npmjs.com/package/vue-x-docs)
![downloads](https://img.shields.io/npm/dm/vue-x-docs.svg)
![size](https://img.shields.io/bundlephobia/min/vue-x-docs.svg)  
![vulneribilites](https://img.shields.io/snyk/vulnerabilities/npm/vue-x-docs.svg)
![last commit](https://img.shields.io/github/last-commit/Delni/vue-x-docs.svg)
![license](https://img.shields.io/github/license/Delni/vue-x-docs.svg)

This project is not an official fork, but is widely inspired by [TUI JSDoc Template](https://github.com/nhn/tui.jsdoc-template) for some functionnality and template customization.

- [Install](#install)
- [Tags](#tags)
- [Template](#template)
	- [Config](#config)

![vue(x)docs Preview](https://github.com/Delni/vue-x-docs/raw/master/demo/vue_x_docs.png)

## Install
Using npm :
```bash
npm install -D vue-x-docs
```
Using yarn:
```shell
yarn add -D vue-x-docs
```

## Tags

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

	See [warehouse-module.js](https://github.com/Delni/vue-x-docs/blob/master/demo/src/warehouse-module.js) for usage in context
---
* `@component`  
	Define a `vue` component.  
	Compatibility with vanilla JSDoc: fallback as `@module`.
	data from this component should be tagged `@member`

	* `@computed`: fallback as `@member`. Tag computed data
	* `@vprop`: fallback as `@member`. Tag props from actual data
	* `@route` : show the routes matched by this component. Not supported by default JSDoc template

	See [cart.vue](https://github.com/Delni/vue-x-docs/blob/master/demo/src/cart.vue) for usage in context
---
* `@model`
	Synonyme of `@module`, use to describe file that make the actual call to API, if you need.  
	See [goods.js](https://github.com/Delni/vue-x-docs/blob/master/demo/src/goods.js) for usage in context
---
## Template

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
