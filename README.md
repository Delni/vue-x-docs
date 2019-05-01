# vue(x)docs

A JSDoc extension for [Vue](https://vuejs.org/v2/guide/) and [Vuex](https://vuex.vuejs.org/) based projects. This include jsdoc template & new tag definition.  

This project is not an official fork, but is widely inspired by [TUI JSDoc Template](https://github.com/nhn/tui.jsdoc-template) for some functionnality and template customization.

- [Install](#install)
- [Tags](#tags)
- [Template](#template)
	- [Config](#config)

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

| Name         | Fallback  | Description
| ----         | :------:  | -----------
| `@store`     | `@module` | Define a `vuex` store
| `@component` | `@module` | Define a `vue` component

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

#### Use versioning tree output
*Default: `false`*  
```
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
