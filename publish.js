'use strict';

const doop = require('jsdoc/util/doop');
const env = require('jsdoc/env');
const fs = require('jsdoc/fs');
const helper = require('./static/scripts/templateHelper');
const logger = require('jsdoc/util/logger');
const path = require('jsdoc/path');
const taffy = require('taffydb').taffy;
const template = require('jsdoc/template');
const util = require('util');

const htmlsafe = helper.htmlsafe;
const linkto = helper.linkto;
const resolveAuthorLinks = helper.resolveAuthorLinks;
const hasOwnProp = Object.prototype.hasOwnProperty;

let data;
let view;

let outdir = path.normalize(env.opts.destination);


env.conf.templates = {
	separateMembers: true,
    useCollapsibles: true,
	...env.conf.templates
}

function find(spec) {
    return helper.find(data, spec);
}

function tutoriallink(tutorial) {
    return helper.toTutorial(tutorial, null, {
        tag: 'em',
        classname: 'disabled',
        prefix: 'Tutorial: '
    });
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    let url;

    if ( !/^(#.+)/.test(hash) ) {
        return hash;
    }

    url = helper.createLink(doclet);
    url = url.replace(/(#.+|$)/, hash);

    return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
    let needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (let i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }
    // and namespaces that are functions get a signature (but finding them is a
    // bit messy)
    else if (doclet.kind === 'namespace' && doclet.meta && doclet.meta.code &&
        doclet.meta.code.type && doclet.meta.code.type.match(/[Ff]unction/)) {
        needsSig = true;
    }

    return needsSig;
}

function getSignatureAttributes(item) {
    let attributes = [];

    if (item.optional) {
        attributes.push('opt');
    }

    if (item.nullable === true) {
        attributes.push('nullable');
    }
    else if (item.nullable === false) {
        attributes.push('non-null');
    }

    return attributes;
}

function updateItemName(item) {
    let attributes = getSignatureAttributes(item);
    let itemName = item.name || '';

    if (item.variable) {
        itemName = '&hellip;' + itemName;
    }

    if (attributes && attributes.length) {
        itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
            attributes.join(', ') );
    }

    return itemName;
}

function addParamAttributes(params) {
    return params.filter(function(param) {
        return param.name && param.name.indexOf('.') === -1;
    }).map(updateItemName);
}

function buildItemTypeStrings(item) {
    let types = [];

    if (item && item.type && item.type.names) {
        item.type.names.forEach(function(name) {
            types.push( linkto(name, htmlsafe(name)) );
        });
    }

    return types;
}

function buildAttribsString(attribs) {
    let attribsString = '';

    if (attribs && attribs.length) {
        attribsString = htmlsafe( util.format('%s', attribs.join('')) );
    }

    return attribsString;
}

function addNonParamAttributes(items) {
    let types = [];

    items.forEach(function(item) {
        types = types.concat( buildItemTypeStrings(item) );
    });

    return types;
}

function addSignatureParams(f) {
    let params = f.params ? addParamAttributes(f.params) : [];

    f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
}

function addSignatureReturns(f) {
    let attribs = [];
    let attribsString = '';
    let returnTypes = [];
    let returnTypesString = '';
    let source = f.yields || f.returns;

    // jam all the return-type attributes into an array. this could create odd results (for example,
    // if there are both nullable and non-nullable return types), but let's assume that most people
    // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
    if (source) {
        source.forEach(function(item) {
            helper.getAttribs(item).forEach(function(attrib) {
                if (attribs.indexOf(attrib) === -1) {
                    attribs.push(attrib);
                }
            });
        });

        attribsString = buildAttribsString(attribs);
    }

    if (source) {
        returnTypes = addNonParamAttributes(source);
    }
    if (returnTypes.length) {
        returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join(' | ') );
    }

    f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
        '<span class="type-signature">' + returnTypesString + '</span>';
}

function addSignatureTypes(f) {
    let types = f.type ? buildItemTypeStrings(f) : [];

    f.signature = (f.signature || '') + '<span class="type-signature">' +
        (types.length ? ' ' + types.join(' | ') : '') + '</span>';
}

function addAttribs(f) {
    let attribs = helper.getAttribs(f);
    let attribsString = buildAttribsString(attribs);
    if(attribsString) {
      f.attribs = attribs.map(a => util.format('<span class="type-tag">%s</span>', a)).join('');
    }
}

function shortenPaths(files, commonPrefix) {
    Object.keys(files).forEach(function(file) {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            // always use forward slashes
            .replace(/\\/g, '/');
    });

    return files;
}

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return null;
    }

    return doclet.meta.path && doclet.meta.path !== 'null' ?
        path.join(doclet.meta.path, doclet.meta.filename) :
        doclet.meta.filename;
}

function generate(title, docs, filename, resolveLinks) {
    let docData;
    let html;
    let outpath;

    resolveLinks = resolveLinks !== false;

    docData = {
          env: env,
          title: title,
          docs: docs,
          package: find({kind: 'package'})[0]
      };

    outpath = path.join(outdir, filename);
    html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
}

function generateSourceFiles(sourceFiles, encoding) {
    encoding = encoding || 'utf8';
    Object.keys(sourceFiles).forEach(function(file) {
        let source;
        // links are keyed to the shortened path in each doclet's `meta.shortpath` property
        let sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);

        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: 'source',
                code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, encoding) )
            };
        }
        catch (e) {
            logger.error('Error while generating source file %s: %s', file, e.message);
        }

        generate('Source: ' + sourceFiles[file].shortened, [source], sourceOutfile,
            false);
    });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    let symbols = {};

    // build a lookup table
    doclets.forEach(function(symbol) {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    modules.forEach(function(module) {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(function(symbol) {
                    return symbol.description || symbol.kind === 'class';
                })
                .map(function(symbol) {
                    symbol = doop(symbol);

                    if (symbol.kind === 'class' || symbol.kind === 'function') {
                        symbol.name = symbol.name.replace('module:', '(require("') + '"))';
                    }

                    return symbol;
                });
        }
    });
}

function buildSubNav(obj, itemsSeen) {
    let longname = obj.longname;
	let props = find({
		kind: 'member',
		memberof: longname,
		isProp: true
	})
	let computeds = find({
		kind: 'member',
		memberof: longname,
		computed: true
	})
    let members = find({
        kind: 'member',
        memberof: longname,
		isProp: {isUndefined: true},
		computed: {isUndefined: true}
    });
    let methods = find({
        kind: 'function',
        memberof: longname,
		is:{isUndefined: true}
    });
    let watchers = find({
        kind: 'function',
        memberof: longname,
		is: 'watcher'
    });
    let actions = find({
        kind: 'function',
        memberof: longname,
		is: 'action'
    });
    let mutations = find({
        kind: 'function',
        memberof: longname,
		is: 'mutation'
    });
    let getters = find({
        kind: 'function',
        memberof: longname,
		is: 'getter'
    });
    let events = find({
        kind: 'event',
        memberof: longname
    });
    let typedef = find({
        kind: 'typedef',
        memberof: longname
    });
    let html = '<div class="hidden" id="' + obj.longname.replace(/"/g, '_') + '_sub">';
    html += buildSubNavMembers(props, 'Props', itemsSeen);
    html += buildSubNavMembers(members, 'Members', itemsSeen);
    html += buildSubNavMembers(computeds, 'Computed members', itemsSeen);
	html += buildSubNavMembers(getters, 'Getters', itemsSeen);
	html += buildSubNavMembers(watchers, 'Watchers', itemsSeen);
	html += buildSubNavMembers(mutations, 'Mutations', itemsSeen);
    html += buildSubNavMembers(actions, 'Actions', itemsSeen);
    html += buildSubNavMembers(methods, 'Methods', itemsSeen);
    html += buildSubNavMembers(events, 'Events', itemsSeen);
    html += buildSubNavMembers(typedef, 'Typedef', itemsSeen);
    html += '</div>';

    return html;
}

function buildSubNavMembers(list, type, itemsSeen) {
    let html = '';

    if (list.length) {
        html += '<div class="member-type">' + type + '</div>';
        html += '<ul class="inner">';
        list.forEach(function(item) {
            html += '<li>' + linkto(item.longname, item.name) + '</li>';
			itemsSeen[item.longname] = true;
        });
        html += '</ul>';
    }

    return html;
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
    let nav = '';
	let itemsNav = '';
	const makeHtml = env.conf.templates.useCollapsibles ? makeCollapsibleItemHtmlInNav : makeItemHtmlInNav;

    if (items.length) {

		items.forEach(function(item) {
            let linkHtml;

            if ( !hasOwnProp.call(item, 'longname') ) {
                itemsNav += '<li>' + linktoFn('', item.name) + buildSubNav(item, itemsSeen) + '</li>';
            }
            else if ( !hasOwnProp.call(itemsSeen, item.longname) ) {
                let displayName;
                if (env.conf.templates.default.useLongnameInNav || item.kind === 'namespace') {
                    displayName = item.longname;
                } else {
                    displayName = item.name;
                }

                linkHtml = linktoFn(item.longname, displayName.replace(/\b(module|event):/g, ''));
                itemsNav += makeHtml(item, linkHtml, itemsSeen);
            }

            itemsSeen[item.longname] = true;
        });

        if (itemsNav !== '') {
            nav += '<h3>' + itemHeading + '</h3><ul>' + itemsNav + '</ul>';
        }
    }

    return nav;
}

function buildGlobalNav (items, itemHeading, itemsSeen, linktoFn) {
	let nav = '';
	let itemsNav = '';

	let html = '';

	function makeCollapsibleItemHtmlInGlobal(item, linkHtml, itemsSeen) {
		let subNav = ''
		if (item.length) {
			subNav +='<div class="hidden" id="global:' + linkHtml.toString().toLowerCase() + '_sub">';
	        subNav += '<ul class="inner">';
	        item.forEach((i) => {
	            subNav += '<li>' + linkto(i.longname, i.name) + '</li>';
				itemsSeen[i.longname] = true;
	        });
	        subNav += '</ul></div>';
			return '<li>'
				+ '<button type="button" class="toggle-subnav">'
				+ '  <span class="toggler">+</span>'
				+ '</button>'
				+ '<a>' + linkHtml + '</a>'
				+ subNav
				+ '</li>';
	    }
		return ''

	}

	if(items.length) {
		items.forEach(item => {
			if(!hasOwnProp.call(itemsSeen, item.longname)) {
				const longname = item.longname

			    const members = find({ kind: 'member',   scope: 'global' });
			    const methods = find({ kind: 'function', scope: 'global' });
			    const events  = find({ kind: 'event',    scope: 'global' });
			    const typedef = find({ kind: 'typedef',  scope: 'global' });

				if(env.conf.templates.useCollapsibles) {
					itemsNav += makeCollapsibleItemHtmlInGlobal(members, 'Members', itemsSeen);
					itemsNav += makeCollapsibleItemHtmlInGlobal(methods, 'Methods', itemsSeen);
					itemsNav += makeCollapsibleItemHtmlInGlobal(events,  'Events',  itemsSeen);
					itemsNav += makeCollapsibleItemHtmlInGlobal(typedef, 'Typedef', itemsSeen);
				} else {
					itemsNav += buildSubNavMembers(members, 'Members', itemsSeen);
					itemsNav += buildSubNavMembers(methods, 'Methods', itemsSeen);
					itemsNav += buildSubNavMembers(events,  'Events',  itemsSeen);
					itemsNav += buildSubNavMembers(typedef, 'Typedef', itemsSeen);
				}

				itemsSeen[item.longname] = true;
			}
		})
	}

	if(itemsNav !== '') {
		// turn the heading into a link so you can actually get to the global page
		nav += '<h3>' + linkto('global', itemHeading) + '</h3><ul>' + itemsNav + '</ul>';
	}

	return nav
}

function linktoTutorial(longName, name) {
    return tutoriallink(name);
}

function linktoExternal(longName, name) {
    return linkto(longName, name.replace(/(^"|"$)/g, ''));
}

function makeItemHtmlInNav(item, linkHtml, itemsSeen) {
    return '<li>'
        + linkHtml
        + buildSubNav(item, itemsSeen)
        + '</li>';
}

function makeCollapsibleItemHtmlInNav(item, linkHtml, itemsSeen) {
    return '<li>'
        + '<button type="button" class="toggle-subnav">'
        + '  <span class="toggler">+</span>'
        + '</button>'
		+ linkHtml
        + buildSubNav(item, itemsSeen)
        + '</li>';
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
    let globalNav, typedefNav;
    let nav = '<br>';
    let seen = {};
    let seenTutorials = {};

    nav += buildMemberNav(members.components, 'Components', seen, linkto);
    nav += buildMemberNav(members.stores, 'Stores', seen, linkto);
    nav += buildMemberNav(members.modules, 'Modules', seen, linkto);
    nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
    nav += buildMemberNav(members.classes, 'Classes', seen, linkto);
    nav += buildMemberNav(members.events, 'Events', seen, linkto);
    nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto);
    nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
    nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial);
    nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);
	nav += buildMemberNav(members.models, 'Models', seen, linkto);
	nav += buildGlobalNav(members.globals, 'Global', seen, linkto);

    return nav;
}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
    let components, stores, models;
    let classes;
    let conf;
    let externals;
    let files;
    let fromDir;
    let globalUrl;
    let indexUrl;
    let interfaces;
    let members;
    let mixins;
    let modules;
    let namespaces;
    let outputSourceFiles;
    let packageInfo;
    let packages;
    let sourceFilePaths = [];
    let sourceFiles = {};
    let staticFileFilter;
    let staticFilePaths;
    let staticFiles;
    let staticFileScanner;
    let store;
    let templatePath;

    data = taffyData;

    conf = env.conf.templates || {};
    conf.default = conf.default || {};

    templatePath = path.normalize(opts.template);
    view = new template.Template( path.join(templatePath, 'templates') );

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    globalUrl = helper.getUniqueFilename('global');
    helper.registerLink('global', globalUrl);

    // set up templating
    view.layout = conf.default.layoutFile ?
        path.getResourcePath(path.dirname(conf.default.layoutFile),
            path.basename(conf.default.layoutFile) ) :
        'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    data().each(function(doclet) {
        let sourcePath;

        doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(function(example) {
                let caption;
                let code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code = RegExp.$3;
                }

                return {
                    caption: caption || '',
                    code: code || example
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach(function(seeItem, i) {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // build a list of source files
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };
            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });

    // update outdir if necessary, then create outdir
    packageInfo = ( find({kind: 'package'}) || [] )[0];
    if (packageInfo && packageInfo.name && env.conf.templates.useVersionning) {
        outdir = path.join( outdir, packageInfo.name, (packageInfo.version || '') );
    }
    fs.mkPath(outdir);

    // copy the template's static files to outdir
    fromDir = path.join(templatePath, 'static');
    staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(function(fileName) {
        let toDir = fs.toDir( fileName.replace(fromDir, outdir) );

        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
        staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

        staticFilePaths.forEach(function(filePath) {
            let extraStaticFiles;

            filePath = path.resolve(env.pwd, filePath);
            extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(function(fileName) {
                let sourcePath = fs.toDir(filePath);
                let toDir = fs.toDir( fileName.replace(sourcePath, outdir) );

                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    data().each(function(doclet) {
        let docletPath;
        let url = helper.createLink(doclet);

        helper.registerLink(doclet.longname, url);

        // add a shortened version of the full path
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });

    data().each(function(doclet) {
        let url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    members = helper.getMembers(data);
    members.tutorials = tutorials.children;

    // output pretty-printed source files by default
    outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    view.outputSourceFiles = outputSourceFiles;

    // once for all
    view.nav = buildNav(members);
    attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules );

    // generate the pretty-printed source files first so other pages can link to them
    if (outputSourceFiles) {
        generateSourceFiles(sourceFiles, opts.encoding);
    }

    if (members.globals.length) { generate('Global', [{kind: 'globalobj'}], globalUrl); }

    // index page displays information from package.json and lists files
    files = find({kind: 'file'});
    packages = find({kind: 'package'});

    generate('Home',
        packages.concat(
            [{
                kind: 'mainpage',
                readme: opts.readme,
                longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'
            }]
        )/*.concat(files)*/, indexUrl);

    // set up the lists that we'll use to generate pages
    stores =     taffy(members.stores);
    components = taffy(members.components);
    models =     taffy(members.models);
    classes =    taffy(members.classes);
    modules =    taffy(members.modules);
    namespaces = taffy(members.namespaces);
    mixins =     taffy(members.mixins);
    externals =  taffy(members.externals);
    interfaces = taffy(members.interfaces);

    Object.keys(helper.longnameToUrl).forEach(function(longname) {
        let myClasses = helper.find(classes, {longname: longname});
        let myExternals = helper.find(externals, {longname: longname});
        let myInterfaces = helper.find(interfaces, {longname: longname});
        let myMixins = helper.find(mixins, {longname: longname});
        let myModules = helper.find(modules, {longname: longname});
        let myStores = helper.find(stores, {longname: longname});
        let myModels = helper.find(models, {longname: longname});
        let myComponents = helper.find(components, {longname: longname});
        let myNamespaces = helper.find(namespaces, {longname: longname});

        if (myModules.length) {
            generate('Module: ' + myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        if (myStores.length) {
            generate('Store: ' + myStores[0].name, myStores, helper.longnameToUrl[longname]);
        }

        if (myComponents.length) {
            generate('Component: ' + myComponents[0].name, myComponents, helper.longnameToUrl[longname]);
        }

        if (myClasses.length) {
            generate('Class: ' + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        if (myNamespaces.length) {
            generate('Namespace: ' + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        if (myMixins.length) {
            generate('Mixin: ' + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        if (myExternals.length) {
            generate('External: ' + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }

        if (myInterfaces.length) {
            generate('Interface: ' + myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
        }

        if (myModels.length) {
            generate('Model: ' + myModels[0].name, myModels, helper.longnameToUrl[longname]);
        }
    });

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        let tutorialData = {
            title: title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children
        };
        let tutorialPath = path.join(outdir, filename);
        let html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(function(child) {
            generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }

    saveChildren(tutorials);
};
