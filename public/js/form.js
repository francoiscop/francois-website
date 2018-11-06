webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(10)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return formControlMix; });
var formControlMix = {
    props: {
        label: {
            type: String,
            default: ''
        },
        value: {
            default: null
        },
        required: {
            type: Boolean,
            default: false
        },
        error: {
            type: Object,
            default: function _default() {
                return {
                    status: false,
                    label: ''
                };
            }
        },
        width: {
            type: Number,
            default: 18
        }
    },

    data: function data() {
        return {
            errorMutable: this.error
        };
    },


    computed: {
        labelComputed: function labelComputed() {
            return this.label.replace(/[_-]/g, " ");
        },
        widthComputed: function widthComputed() {
            return this.label === '' ? 0 : this.width;
        }
    },

    filters: {
        removeUnderscore: function removeUnderscore(value) {
            return value.replace(/[_-]/g, " ");
        }
    },

    methods: {
        removeUnderscore: function removeUnderscore(value) {
            return value.replace(/[_-]/g, " ");
        },
        setError: function setError(e) {

            this.errorMutable.status = true;

            this.errorMutable.label = e;

            this.$store.dispatch('form/setError', this.label);

            this.$emit('setError', e);
        },
        clearError: function clearError(e) {

            //clear error only if has error:
            if (!this.errorMutable.status) return;

            this.errorMutable.status = false;

            this.errorMutable.label = '';

            this.$store.dispatch('form/clearError', this.label);

            this.$emit('clearError', this.label);
        }
    }
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 6 */,
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Store */
/* unused harmony export install */
/* unused harmony export mapState */
/* unused harmony export mapMutations */
/* unused harmony export mapGetters */
/* unused harmony export mapActions */
/* unused harmony export createNamespacedHelpers */
/**
 * vuex v3.0.1
 * (c) 2017 Evan You
 * @license MIT
 */
var applyMixin = function (Vue) {
  var version = Number(Vue.version.split('.')[0]);

  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options;
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store;
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
};

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook;

  devtoolHook.emit('vuex:init', store);

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state);
  });
}

/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */


/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Module = function Module (rawModule, runtime) {
  this.runtime = runtime;
  this._children = Object.create(null);
  this._rawModule = rawModule;
  var rawState = rawModule.state;
  this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
};

var prototypeAccessors$1 = { namespaced: { configurable: true } };

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module;
};

Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key];
};

Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced;
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions;
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations;
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters;
  }
};

Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn);
};

Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};

Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};

Object.defineProperties( Module.prototype, prototypeAccessors$1 );

var ModuleCollection = function ModuleCollection (rawRootModule) {
  // register root module (Vuex.Store options)
  this.register([], rawRootModule, false);
};

ModuleCollection.prototype.get = function get (path) {
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update([], this.root, rawRootModule);
};

ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  if (true) {
    assertRawModule(path, rawModule);
  }

  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) {
    this.root = newModule;
  } else {
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
  }

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};

ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1));
  var key = path[path.length - 1];
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key);
};

function update (path, targetModule, newModule) {
  if (true) {
    assertRawModule(path, newModule);
  }

  // update target module
  targetModule.update(newModule);

  // update nested modules
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (true) {
          console.warn(
            "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
            'manual reload is needed'
          );
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      );
    }
  }
}

var functionAssert = {
  assert: function (value) { return typeof value === 'function'; },
  expected: 'function'
};

var objectAssert = {
  assert: function (value) { return typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'); },
  expected: 'function or object with "handler" function'
};

var assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
};

function assertRawModule (path, rawModule) {
  Object.keys(assertTypes).forEach(function (key) {
    if (!rawModule[key]) { return }

    var assertOptions = assertTypes[key];

    forEachValue(rawModule[key], function (value, type) {
      assert(
        assertOptions.assert(value),
        makeAssertionMessage(path, key, type, value, assertOptions.expected)
      );
    });
  });
}

function makeAssertionMessage (path, key, type, value, expected) {
  var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
  if (path.length > 0) {
    buf += " in module \"" + (path.join('.')) + "\"";
  }
  buf += " is " + (JSON.stringify(value)) + ".";
  return buf
}

var Vue; // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #731
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  if (true) {
    assert(Vue, "must call Vue.use(Vuex) before creating a store instance.");
    assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");
    assert(this instanceof Store, "Store must be called with the new operator.");
  }

  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  var state = options.state; if ( state === void 0 ) state = {};
  if (typeof state === 'function') {
    state = state() || {};
  }

  // store internal state
  this._committing = false;
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue();

  // bind commit and dispatch to self
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };

  // strict mode
  this.strict = strict;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state);

  // apply plugins
  plugins.forEach(function (plugin) { return plugin(this$1); });

  if (Vue.config.devtools) {
    devtoolPlugin(this);
  }
};

var prototypeAccessors = { state: { configurable: true } };

prototypeAccessors.state.get = function () {
  return this._vm._data.$$state
};

prototypeAccessors.state.set = function (v) {
  if (true) {
    assert(false, "Use store.replaceState() to explicit replace store state.");
  }
};

Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload };
  var entry = this._mutations[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown mutation type: " + type));
    }
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  });
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

  if (
    "development" !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    );
  }
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
    var this$1 = this;

  // check object-style dispatch
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var action = { type: type, payload: payload };
  var entry = this._actions[type];
  if (!entry) {
    if (true) {
      console.error(("[vuex] unknown action type: " + type));
    }
    return
  }

  this._actionSubscribers.forEach(function (sub) { return sub(action, this$1.state); });

  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  return genericSubscribe(fn, this._subscribers)
};

Store.prototype.subscribeAction = function subscribeAction (fn) {
  return genericSubscribe(fn, this._actionSubscribers)
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  if (true) {
    assert(typeof getter === 'function', "store.watch only accepts a function.");
  }
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm._data.$$state = state;
  });
};

Store.prototype.registerModule = function registerModule (path, rawModule, options) {
    if ( options === void 0 ) options = {};

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
    assert(path.length > 0, 'cannot register the root module by using registerModule.');
  }

  this._modules.register(path, rawModule);
  installModule(this, this.state, path, this._modules.get(path), options.preserveState);
  // reset store to update getters...
  resetStoreVM(this, this.state);
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path]; }

  if (true) {
    assert(Array.isArray(path), "module path must be a string or an Array.");
  }

  this._modules.unregister(path);
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1));
    Vue.delete(parentState, path[path.length - 1]);
  });
  resetStore(this);
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions);
  resetStore(this, true);
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function genericSubscribe (fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn);
  }
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  }
}

function resetStore (store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  var state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}

function resetStoreVM (store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); };
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed: computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () { return oldVm.$destroy(); });
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state);
    });
  }

  var local = module.context = makeLocalContext(store, namespace, path);

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ("development" !== 'production' && !store._actions[type]) {
          console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options);
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type;
        if ("development" !== 'production' && !store._mutations[type]) {
          console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
          return
        }
      }

      store.commit(type, payload, options);
    }
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () { return store.getters; }
        : function () { return makeLocalGetters(store, namespace); }
    },
    state: {
      get: function () { return getNestedState(store.state, path); }
    }
  });

  return local
}

function makeLocalGetters (store, namespace) {
  var gettersProxy = {};

  var splitPos = namespace.length;
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    var localType = type.slice(splitPos);

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    });
  });

  return gettersProxy
}

function registerMutation (store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload);
  });
}

function registerAction (store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb);
    if (!isPromise(res)) {
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err
      })
    } else {
      return res
    }
  });
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (true) {
      console.error(("[vuex] duplicate getter key: " + type));
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  };
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, function () {
    if (true) {
      assert(store._committing, "Do not mutate vuex store state outside mutation handlers.");
    }
  }, { deep: true, sync: true });
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload;
    payload = type;
    type = type.type;
  }

  if (true) {
    assert(typeof type === 'string', ("Expects string as the type, but found " + (typeof type) + "."));
  }

  return { type: type, payload: payload, options: options }
}

function install (_Vue) {
  if (Vue && _Vue === Vue) {
    if (true) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      );
    }
    return
  }
  Vue = _Vue;
  applyMixin(Vue);
}

var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {};
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var commit = this.$store.commit;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
        if (!module) {
          return
        }
        commit = module.context.commit;
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val;
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if ("development" !== 'production' && !(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val));
        return
      }
      return this.$store.getters[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
});

var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var dispatch = this.$store.dispatch;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
        if (!module) {
          return
        }
        dispatch = module.context.dispatch;
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    };
  });
  return res
});

var createNamespacedHelpers = function (namespace) { return ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
}); };

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace;
      namespace = '';
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/';
    }
    return fn(namespace, map)
  }
}

function getModuleByNamespace (store, helper, namespace) {
  var module = store._modulesNamespaceMap[namespace];
  if ("development" !== 'production' && !module) {
    console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
  }
  return module
}

var index_esm = {
  Store: Store,
  install: install,
  version: '3.0.1',
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions,
  createNamespacedHelpers: createNamespacedHelpers
};


/* harmony default export */ __webpack_exports__["a"] = (index_esm);


/***/ }),
/* 9 */,
/* 10 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(174)
/* template */
var __vue_template__ = __webpack_require__(175)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/select.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-16661640", Component.options)
  } else {
    hotAPI.reload("data-v-16661640", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

(function (global, factory) {
	 true ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global['vue-scrollto'] = factory());
}(this, (function () { 'use strict';

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

var src = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

var easings = {
    ease: [0.25, 0.1, 0.25, 1.0],
    linear: [0.00, 0.0, 1.00, 1.0],
    "ease-in": [0.42, 0.0, 1.00, 1.0],
    "ease-out": [0.00, 0.0, 0.58, 1.0],
    "ease-in-out": [0.42, 0.0, 0.58, 1.0]
};

// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
var supportsPassive = false;
try {
    var opts = Object.defineProperty({}, "passive", {
        get: function get() {
            supportsPassive = true;
        }
    });
    window.addEventListener("test", null, opts);
} catch (e) {}

var _ = {
    $: function $(selector) {
        if (typeof selector !== "string") {
            return selector;
        }
        return document.querySelector(selector);
    },
    on: function on(element, events, handler) {
        var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { passive: false };

        if (!(events instanceof Array)) {
            events = [events];
        }
        for (var i = 0; i < events.length; i++) {
            element.addEventListener(events[i], handler, supportsPassive ? opts : false);
        }
    },
    off: function off(element, events, handler) {
        if (!(events instanceof Array)) {
            events = [events];
        }
        for (var i = 0; i < events.length; i++) {
            element.removeEventListener(events[i], handler);
        }
    },
    cumulativeOffset: function cumulativeOffset(element) {
        var top = 0;
        var left = 0;

        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left
        };
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





















var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var abortEvents = ["mousedown", "wheel", "DOMMouseScroll", "mousewheel", "keyup", "touchmove"];

var defaults$$1 = {
    container: "body",
    duration: 500,
    easing: "ease",
    offset: 0,
    cancelable: true,
    onStart: false,
    onDone: false,
    onCancel: false,
    x: false,
    y: true
};

function setDefaults(options) {
    defaults$$1 = _extends({}, defaults$$1, options);
}

var scroller = function scroller() {
    var element = void 0; // element to scroll to
    var container = void 0; // container to scroll
    var duration = void 0; // duration of the scrolling
    var easing = void 0; // easing to be used when scrolling
    var offset = void 0; // offset to be added (subtracted)
    var cancelable = void 0; // indicates if user can cancel the scroll or not.
    var onStart = void 0; // callback when scrolling is started
    var onDone = void 0; // callback when scrolling is done
    var onCancel = void 0; // callback when scrolling is canceled / aborted
    var x = void 0; // scroll on x axis
    var y = void 0; // scroll on y axis

    var initialX = void 0; // initial X of container
    var targetX = void 0; // target X of container
    var initialY = void 0; // initial Y of container
    var targetY = void 0; // target Y of container
    var diffX = void 0; // difference
    var diffY = void 0; // difference

    var abort = void 0; // is scrolling aborted

    var abortEv = void 0; // event that aborted scrolling
    var abortFn = function abortFn(e) {
        if (!cancelable) return;
        abortEv = e;
        abort = true;
    };
    var easingFn = void 0;

    var timeStart = void 0; // time when scrolling started
    var timeElapsed = void 0; // time elapsed since scrolling started

    var progress = void 0; // progress

    function scrollTop(container) {
        var scrollTop = container.scrollTop;

        if (container.tagName.toLowerCase() === "body") {
            // in firefox body.scrollTop always returns 0
            // thus if we are trying to get scrollTop on a body tag
            // we need to get it from the documentElement
            scrollTop = scrollTop || document.documentElement.scrollTop;
        }

        return scrollTop;
    }

    function scrollLeft(container) {
        var scrollLeft = container.scrollLeft;

        if (container.tagName.toLowerCase() === "body") {
            // in firefox body.scrollLeft always returns 0
            // thus if we are trying to get scrollLeft on a body tag
            // we need to get it from the documentElement
            scrollLeft = scrollLeft || document.documentElement.scrollLeft;
        }

        return scrollLeft;
    }

    function step(timestamp) {
        if (abort) return done();
        if (!timeStart) timeStart = timestamp;

        timeElapsed = timestamp - timeStart;

        progress = Math.min(timeElapsed / duration, 1);
        progress = easingFn(progress);

        topLeft(container, initialY + diffY * progress, initialX + diffX * progress);

        timeElapsed < duration ? window.requestAnimationFrame(step) : done();
    }

    function done() {
        if (!abort) topLeft(container, targetY, targetX);
        timeStart = false;

        _.off(container, abortEvents, abortFn);
        if (abort && onCancel) onCancel(abortEv, element);
        if (!abort && onDone) onDone(element);
    }

    function topLeft(element, top, left) {
        if (y) element.scrollTop = top;
        if (x) element.scrollLeft = left;
        if (element.tagName.toLowerCase() === "body") {
            // in firefox body.scrollTop doesn't scroll the page
            // thus if we are trying to scrollTop on a body tag
            // we need to scroll on the documentElement
            if (y) document.documentElement.scrollTop = top;
            if (x) document.documentElement.scrollLeft = left;
        }
    }

    function scrollTo(target, _duration) {

        //console.error(nav)
        //console.error(typeof nav)
        //return
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if ((typeof _duration === "undefined" ? "undefined" : _typeof(_duration)) === "object") {
            options = _duration;
        } else if (typeof _duration === "number") {
            options.duration = _duration;
        }

        element = _.$(target);

        if (!element) {
            return console.warn("[vue-scrollto warn]: Trying to scroll to an element that is not on the page: " + target);
        }

        container = _.$(options.container || defaults$$1.container);
        duration = options.duration || defaults$$1.duration;
        easing = options.easing || defaults$$1.easing;
        offset = options.offset || defaults$$1.offset;
        cancelable = options.hasOwnProperty("cancelable") ? options.cancelable !== false : defaults$$1.cancelable;
        onStart = options.onStart || defaults$$1.onStart;
        onDone = options.onDone || defaults$$1.onDone;
        onCancel = options.onCancel || defaults$$1.onCancel;
        x = options.x === undefined ? defaults$$1.x : options.x;
        y = options.y === undefined ? defaults$$1.y : options.y;

        var cumulativeOffsetContainer = _.cumulativeOffset(container);
        var cumulativeOffsetElement = _.cumulativeOffset(element);

        if (typeof offset === "function") {
            offset = offset();
        }

        initialY = scrollTop(container);
        targetY = cumulativeOffsetElement.top - cumulativeOffsetContainer.top + offset;

        if (options.hasOwnProperty('nav') && options.nav !== '') targetY = options.nav;

        initialX = scrollLeft(container);
        targetX = cumulativeOffsetElement.left - cumulativeOffsetContainer.left + offset;

        abort = false;

        diffY = targetY - initialY;
        diffX = targetX - initialX;

        if (typeof easing === "string") {
            easing = easings[easing] || easings["ease"];
        }

        easingFn = src.apply(src, easing);

        if (!diffY && !diffX) return;
        if (onStart) onStart(element);

        _.on(container, abortEvents, abortFn, { passive: true });

        window.requestAnimationFrame(step);

        return function () {
            abortEv = null;
            abort = true;
        };
    }

    return scrollTo;
};

var _scroller = scroller();

var bindings = []; // store binding data

function deleteBinding(el) {
    for (var i = 0; i < bindings.length; ++i) {
        if (bindings[i].el === el) {
            bindings.splice(i, 1);
            return true;
        }
    }
    return false;
}

function findBinding(el) {
    for (var i = 0; i < bindings.length; ++i) {
        if (bindings[i].el === el) {
            return bindings[i];
        }
    }
}

function getBinding(el) {
    var binding = findBinding(el);

    if (binding) {
        return binding;
    }

    bindings.push(binding = {
        el: el,
        binding: {}
    });

    return binding;
}

function handleClick(e) {
    e.preventDefault();
    var ctx = getBinding(this).binding;

    if (typeof ctx.value === "string") {
        return _scroller(ctx.value);
    }
    _scroller(ctx.value.el || ctx.value.element, ctx.value);
}

var VueScrollTo$1 = {
    bind: function bind(el, binding) {
        getBinding(el).binding = binding;
        _.on(el, "click", handleClick);
    },
    unbind: function unbind(el) {
        deleteBinding(el);
        _.off(el, "click", handleClick);
    },
    update: function update(el, binding) {
        getBinding(el).binding = binding;
    },

    scrollTo: _scroller,
    bindings: bindings
};

var install = function install(Vue, options) {
    if (options) setDefaults(options);
    Vue.directive("scroll-to", VueScrollTo$1);
    Vue.prototype.$scrollTo = VueScrollTo$1.scrollTo;
};

if (typeof window !== "undefined" && window.Vue) {
    window.VueScrollTo = VueScrollTo$1;
    window.VueScrollTo.setDefaults = setDefaults;
    Vue.use(install);
}

VueScrollTo$1.install = install;

return VueScrollTo$1;

})));


/***/ }),
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(200);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(25);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(220)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(222)
/* template */
var __vue_template__ = __webpack_require__(223)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/inputFile.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-df2ac59c", Component.options)
  } else {
    hotAPI.reload("data-v-df2ac59c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*!
 * Cropper.js v1.4.0
 * https://fengyuanchen.github.io/cropperjs
 *
 * Copyright 2015-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2018-06-01T15:18:18.692Z
 */

var IN_BROWSER = typeof window !== 'undefined';
var WINDOW = IN_BROWSER ? window : {};
var NAMESPACE = 'cropper';

// Actions
var ACTION_ALL = 'all';
var ACTION_CROP = 'crop';
var ACTION_MOVE = 'move';
var ACTION_ZOOM = 'zoom';
var ACTION_EAST = 'e';
var ACTION_WEST = 'w';
var ACTION_SOUTH = 's';
var ACTION_NORTH = 'n';
var ACTION_NORTH_EAST = 'ne';
var ACTION_NORTH_WEST = 'nw';
var ACTION_SOUTH_EAST = 'se';
var ACTION_SOUTH_WEST = 'sw';

// Classes
var CLASS_CROP = NAMESPACE + '-crop';
var CLASS_DISABLED = NAMESPACE + '-disabled';
var CLASS_HIDDEN = NAMESPACE + '-hidden';
var CLASS_HIDE = NAMESPACE + '-hide';
var CLASS_INVISIBLE = NAMESPACE + '-invisible';
var CLASS_MODAL = NAMESPACE + '-modal';
var CLASS_MOVE = NAMESPACE + '-move';

// Data keys
var DATA_ACTION = NAMESPACE + 'Action';
var DATA_PREVIEW = NAMESPACE + 'Preview';

// Drag modes
var DRAG_MODE_CROP = 'crop';
var DRAG_MODE_MOVE = 'move';
var DRAG_MODE_NONE = 'none';

// Events
var EVENT_CROP = 'crop';
var EVENT_CROP_END = 'cropend';
var EVENT_CROP_MOVE = 'cropmove';
var EVENT_CROP_START = 'cropstart';
var EVENT_DBLCLICK = 'dblclick';
var EVENT_POINTER_DOWN = WINDOW.PointerEvent ? 'pointerdown' : 'touchstart mousedown';
var EVENT_POINTER_MOVE = WINDOW.PointerEvent ? 'pointermove' : 'touchmove mousemove';
var EVENT_POINTER_UP = WINDOW.PointerEvent ? 'pointerup pointercancel' : 'touchend touchcancel mouseup';
var EVENT_READY = 'ready';
var EVENT_RESIZE = 'resize';
var EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';
var EVENT_ZOOM = 'zoom';

// RegExps
var REGEXP_ACTIONS = /^(?:e|w|s|n|se|sw|ne|nw|all|crop|move|zoom)$/;
var REGEXP_DATA_URL = /^data:/;
var REGEXP_DATA_URL_JPEG = /^data:image\/jpeg;base64,/;
var REGEXP_TAG_NAME = /^(?:img|canvas)$/i;

var DEFAULTS = {
  // Define the view mode of the cropper
  viewMode: 0, // 0, 1, 2, 3

  // Define the dragging mode of the cropper
  dragMode: DRAG_MODE_CROP, // 'crop', 'move' or 'none'

  // Define the initial aspect ratio of the crop box
  initialAspectRatio: NaN,

  // Define the aspect ratio of the crop box
  aspectRatio: NaN,

  // An object with the previous cropping result data
  data: null,

  // A selector for adding extra containers to preview
  preview: '',

  // Re-render the cropper when resize the window
  responsive: true,

  // Restore the cropped area after resize the window
  restore: true,

  // Check if the current image is a cross-origin image
  checkCrossOrigin: true,

  // Check the current image's Exif Orientation information
  checkOrientation: true,

  // Show the black modal
  modal: true,

  // Show the dashed lines for guiding
  guides: true,

  // Show the center indicator for guiding
  center: true,

  // Show the white modal to highlight the crop box
  highlight: true,

  // Show the grid background
  background: true,

  // Enable to crop the image automatically when initialize
  autoCrop: true,

  // Define the percentage of automatic cropping area when initializes
  autoCropArea: 0.8,

  // Enable to move the image
  movable: true,

  // Enable to rotate the image
  rotatable: true,

  // Enable to scale the image
  scalable: true,

  // Enable to zoom the image
  zoomable: true,

  // Enable to zoom the image by dragging touch
  zoomOnTouch: true,

  // Enable to zoom the image by wheeling mouse
  zoomOnWheel: true,

  // Define zoom ratio when zoom the image by wheeling mouse
  wheelZoomRatio: 0.1,

  // Enable to move the crop box
  cropBoxMovable: true,

  // Enable to resize the crop box
  cropBoxResizable: true,

  // Toggle drag mode between "crop" and "move" when click twice on the cropper
  toggleDragModeOnDblclick: true,

  // Size limitation
  minCanvasWidth: 0,
  minCanvasHeight: 0,
  minCropBoxWidth: 0,
  minCropBoxHeight: 0,
  minContainerWidth: 200,
  minContainerHeight: 100,

  // Shortcuts of events
  ready: null,
  cropstart: null,
  cropmove: null,
  cropend: null,
  crop: null,
  zoom: null
};

var TEMPLATE = '<div class="cropper-container" touch-action="none">' + '<div class="cropper-wrap-box">' + '<div class="cropper-canvas"></div>' + '</div>' + '<div class="cropper-drag-box"></div>' + '<div class="cropper-crop-box">' + '<span class="cropper-view-box"></span>' + '<span class="cropper-dashed dashed-h"></span>' + '<span class="cropper-dashed dashed-v"></span>' + '<span class="cropper-center"></span>' + '<span class="cropper-face"></span>' + '<span class="cropper-line line-e" data-cropper-action="e"></span>' + '<span class="cropper-line line-n" data-cropper-action="n"></span>' + '<span class="cropper-line line-w" data-cropper-action="w"></span>' + '<span class="cropper-line line-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-e" data-cropper-action="e"></span>' + '<span class="cropper-point point-n" data-cropper-action="n"></span>' + '<span class="cropper-point point-w" data-cropper-action="w"></span>' + '<span class="cropper-point point-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-ne" data-cropper-action="ne"></span>' + '<span class="cropper-point point-nw" data-cropper-action="nw"></span>' + '<span class="cropper-point point-sw" data-cropper-action="sw"></span>' + '<span class="cropper-point point-se" data-cropper-action="se"></span>' + '</div>' + '</div>';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Check if the given value is not a number.
 */
var isNaN = Number.isNaN || WINDOW.isNaN;

/**
 * Check if the given value is a number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a number, else `false`.
 */
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if the given value is undefined.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
 */
function isUndefined(value) {
  return typeof value === 'undefined';
}

/**
 * Check if the given value is an object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is an object, else `false`.
 */
function isObject(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Check if the given value is a plain object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
 */

function isPlainObject(value) {
  if (!isObject(value)) {
    return false;
  }

  try {
    var _constructor = value.constructor;
    var prototype = _constructor.prototype;


    return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
  } catch (e) {
    return false;
  }
}

/**
 * Check if the given value is a function.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a function, else `false`.
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Iterate the given data.
 * @param {*} data - The data to iterate.
 * @param {Function} callback - The process function for each element.
 * @returns {*} The original data.
 */
function forEach(data, callback) {
  if (data && isFunction(callback)) {
    if (Array.isArray(data) || isNumber(data.length) /* array-like */) {
        var length = data.length;

        var i = void 0;

        for (i = 0; i < length; i += 1) {
          if (callback.call(data, data[i], i, data) === false) {
            break;
          }
        }
      } else if (isObject(data)) {
      Object.keys(data).forEach(function (key) {
        callback.call(data, data[key], key, data);
      });
    }
  }

  return data;
}

/**
 * Extend the given object.
 * @param {*} obj - The object to be extended.
 * @param {*} args - The rest objects which will be merged to the first object.
 * @returns {Object} The extended object.
 */
var assign = Object.assign || function assign(obj) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (isObject(obj) && args.length > 0) {
    args.forEach(function (arg) {
      if (isObject(arg)) {
        Object.keys(arg).forEach(function (key) {
          obj[key] = arg[key];
        });
      }
    });
  }

  return obj;
};

var REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/i;

/**
 * Normalize decimal number.
 * Check out {@link http://0.30000000000000004.com/}
 * @param {number} value - The value to normalize.
 * @param {number} [times=100000000000] - The times for normalizing.
 * @returns {number} Returns the normalized number.
 */
function normalizeDecimalNumber(value) {
  var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100000000000;

  return REGEXP_DECIMALS.test(value) ? Math.round(value * times) / times : value;
}

var REGEXP_SUFFIX = /^(?:width|height|left|top|marginLeft|marginTop)$/;

/**
 * Apply styles to the given element.
 * @param {Element} element - The target element.
 * @param {Object} styles - The styles for applying.
 */
function setStyle(element, styles) {
  var style = element.style;


  forEach(styles, function (value, property) {
    if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
      value += 'px';
    }

    style[property] = value;
  });
}

/**
 * Check if the given element has a special class.
 * @param {Element} element - The element to check.
 * @param {string} value - The class to search.
 * @returns {boolean} Returns `true` if the special class was found.
 */
function hasClass(element, value) {
  return element.classList ? element.classList.contains(value) : element.className.indexOf(value) > -1;
}

/**
 * Add classes to the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be added.
 */
function addClass(element, value) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, function (elem) {
      addClass(elem, value);
    });
    return;
  }

  if (element.classList) {
    element.classList.add(value);
    return;
  }

  var className = element.className.trim();

  if (!className) {
    element.className = value;
  } else if (className.indexOf(value) < 0) {
    element.className = className + ' ' + value;
  }
}

/**
 * Remove classes from the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be removed.
 */
function removeClass(element, value) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, function (elem) {
      removeClass(elem, value);
    });
    return;
  }

  if (element.classList) {
    element.classList.remove(value);
    return;
  }

  if (element.className.indexOf(value) >= 0) {
    element.className = element.className.replace(value, '');
  }
}

/**
 * Add or remove classes from the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be toggled.
 * @param {boolean} added - Add only.
 */
function toggleClass(element, value, added) {
  if (!value) {
    return;
  }

  if (isNumber(element.length)) {
    forEach(element, function (elem) {
      toggleClass(elem, value, added);
    });
    return;
  }

  // IE10-11 doesn't support the second parameter of `classList.toggle`
  if (added) {
    addClass(element, value);
  } else {
    removeClass(element, value);
  }
}

var REGEXP_HYPHENATE = /([a-z\d])([A-Z])/g;

/**
 * Transform the given string from camelCase to kebab-case
 * @param {string} value - The value to transform.
 * @returns {string} The transformed value.
 */
function hyphenate(value) {
  return value.replace(REGEXP_HYPHENATE, '$1-$2').toLowerCase();
}

/**
 * Get data from the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to get.
 * @returns {string} The data value.
 */
function getData(element, name) {
  if (isObject(element[name])) {
    return element[name];
  } else if (element.dataset) {
    return element.dataset[name];
  }

  return element.getAttribute('data-' + hyphenate(name));
}

/**
 * Set data to the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to set.
 * @param {string} data - The data value.
 */
function setData(element, name, data) {
  if (isObject(data)) {
    element[name] = data;
  } else if (element.dataset) {
    element.dataset[name] = data;
  } else {
    element.setAttribute('data-' + hyphenate(name), data);
  }
}

/**
 * Remove data from the given element.
 * @param {Element} element - The target element.
 * @param {string} name - The data key to remove.
 */
function removeData(element, name) {
  if (isObject(element[name])) {
    try {
      delete element[name];
    } catch (e) {
      element[name] = undefined;
    }
  } else if (element.dataset) {
    // #128 Safari not allows to delete dataset property
    try {
      delete element.dataset[name];
    } catch (e) {
      element.dataset[name] = undefined;
    }
  } else {
    element.removeAttribute('data-' + hyphenate(name));
  }
}

var REGEXP_SPACES = /\s\s*/;
var onceSupported = function () {
  var supported = false;

  if (IN_BROWSER) {
    var once = false;
    var listener = function listener() {};
    var options = Object.defineProperty({}, 'once', {
      get: function get$$1() {
        supported = true;
        return once;
      },


      /**
       * This setter can fix a `TypeError` in strict mode
       * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
       * @param {boolean} value - The value to set
       */
      set: function set$$1(value) {
        once = value;
      }
    });

    WINDOW.addEventListener('test', listener, options);
    WINDOW.removeEventListener('test', listener, options);
  }

  return supported;
}();

/**
 * Remove event listener from the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Function} listener - The event listener.
 * @param {Object} options - The event options.
 */
function removeListener(element, type, listener) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var handler = listener;

  type.trim().split(REGEXP_SPACES).forEach(function (event) {
    if (!onceSupported) {
      var listeners = element.listeners;


      if (listeners && listeners[event] && listeners[event][listener]) {
        handler = listeners[event][listener];
        delete listeners[event][listener];

        if (Object.keys(listeners[event]).length === 0) {
          delete listeners[event];
        }

        if (Object.keys(listeners).length === 0) {
          delete element.listeners;
        }
      }
    }

    element.removeEventListener(event, handler, options);
  });
}

/**
 * Add event listener to the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Function} listener - The event listener.
 * @param {Object} options - The event options.
 */
function addListener(element, type, listener) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var _handler = listener;

  type.trim().split(REGEXP_SPACES).forEach(function (event) {
    if (options.once && !onceSupported) {
      var _element$listeners = element.listeners,
          listeners = _element$listeners === undefined ? {} : _element$listeners;


      _handler = function handler() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        delete listeners[event][listener];
        element.removeEventListener(event, _handler, options);
        listener.apply(element, args);
      };

      if (!listeners[event]) {
        listeners[event] = {};
      }

      if (listeners[event][listener]) {
        element.removeEventListener(event, listeners[event][listener], options);
      }

      listeners[event][listener] = _handler;
      element.listeners = listeners;
    }

    element.addEventListener(event, _handler, options);
  });
}

/**
 * Dispatch event on the target element.
 * @param {Element} element - The event target.
 * @param {string} type - The event type(s).
 * @param {Object} data - The additional event data.
 * @returns {boolean} Indicate if the event is default prevented or not.
 */
function dispatchEvent(element, type, data) {
  var event = void 0;

  // Event and CustomEvent on IE9-11 are global objects, not constructors
  if (isFunction(Event) && isFunction(CustomEvent)) {
    event = new CustomEvent(type, {
      detail: data,
      bubbles: true,
      cancelable: true
    });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
  }

  return element.dispatchEvent(event);
}

/**
 * Get the offset base on the document.
 * @param {Element} element - The target element.
 * @returns {Object} The offset data.
 */
function getOffset(element) {
  var box = element.getBoundingClientRect();

  return {
    left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
    top: box.top + (window.pageYOffset - document.documentElement.clientTop)
  };
}

var location = WINDOW.location;

var REGEXP_ORIGINS = /^(https?:)\/\/([^:/?#]+):?(\d*)/i;

/**
 * Check if the given URL is a cross origin URL.
 * @param {string} url - The target URL.
 * @returns {boolean} Returns `true` if the given URL is a cross origin URL, else `false`.
 */
function isCrossOriginURL(url) {
  var parts = url.match(REGEXP_ORIGINS);

  return parts && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
}

/**
 * Add timestamp to the given URL.
 * @param {string} url - The target URL.
 * @returns {string} The result URL.
 */
function addTimestamp(url) {
  var timestamp = 'timestamp=' + new Date().getTime();

  return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
}

/**
 * Get transforms base on the given object.
 * @param {Object} obj - The target object.
 * @returns {string} A string contains transform values.
 */
function getTransforms(_ref) {
  var rotate = _ref.rotate,
      scaleX = _ref.scaleX,
      scaleY = _ref.scaleY,
      translateX = _ref.translateX,
      translateY = _ref.translateY;

  var values = [];

  if (isNumber(translateX) && translateX !== 0) {
    values.push('translateX(' + translateX + 'px)');
  }

  if (isNumber(translateY) && translateY !== 0) {
    values.push('translateY(' + translateY + 'px)');
  }

  // Rotate should come first before scale to match orientation transform
  if (isNumber(rotate) && rotate !== 0) {
    values.push('rotate(' + rotate + 'deg)');
  }

  if (isNumber(scaleX) && scaleX !== 1) {
    values.push('scaleX(' + scaleX + ')');
  }

  if (isNumber(scaleY) && scaleY !== 1) {
    values.push('scaleY(' + scaleY + ')');
  }

  var transform = values.length ? values.join(' ') : 'none';

  return {
    WebkitTransform: transform,
    msTransform: transform,
    transform: transform
  };
}

/**
 * Get the max ratio of a group of pointers.
 * @param {string} pointers - The target pointers.
 * @returns {number} The result ratio.
 */
function getMaxZoomRatio(pointers) {
  var pointers2 = assign({}, pointers);
  var ratios = [];

  forEach(pointers, function (pointer, pointerId) {
    delete pointers2[pointerId];

    forEach(pointers2, function (pointer2) {
      var x1 = Math.abs(pointer.startX - pointer2.startX);
      var y1 = Math.abs(pointer.startY - pointer2.startY);
      var x2 = Math.abs(pointer.endX - pointer2.endX);
      var y2 = Math.abs(pointer.endY - pointer2.endY);
      var z1 = Math.sqrt(x1 * x1 + y1 * y1);
      var z2 = Math.sqrt(x2 * x2 + y2 * y2);
      var ratio = (z2 - z1) / z1;

      ratios.push(ratio);
    });
  });

  ratios.sort(function (a, b) {
    return Math.abs(a) < Math.abs(b);
  });

  return ratios[0];
}

/**
 * Get a pointer from an event object.
 * @param {Object} event - The target event object.
 * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
 * @returns {Object} The result pointer contains start and/or end point coordinates.
 */
function getPointer(_ref2, endOnly) {
  var pageX = _ref2.pageX,
      pageY = _ref2.pageY;

  var end = {
    endX: pageX,
    endY: pageY
  };

  return endOnly ? end : assign({
    startX: pageX,
    startY: pageY
  }, end);
}

/**
 * Get the center point coordinate of a group of pointers.
 * @param {Object} pointers - The target pointers.
 * @returns {Object} The center point coordinate.
 */
function getPointersCenter(pointers) {
  var pageX = 0;
  var pageY = 0;
  var count = 0;

  forEach(pointers, function (_ref3) {
    var startX = _ref3.startX,
        startY = _ref3.startY;

    pageX += startX;
    pageY += startY;
    count += 1;
  });

  pageX /= count;
  pageY /= count;

  return {
    pageX: pageX,
    pageY: pageY
  };
}

/**
 * Check if the given value is a finite number.
 */
var isFinite = Number.isFinite || WINDOW.isFinite;

/**
 * Get the max sizes in a rectangle under the given aspect ratio.
 * @param {Object} data - The original sizes.
 * @param {string} [type='contain'] - The adjust type.
 * @returns {Object} The result sizes.
 */
function getAdjustedSizes(_ref4) // or 'cover'
{
  var aspectRatio = _ref4.aspectRatio,
      height = _ref4.height,
      width = _ref4.width;
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'contain';

  var isValidNumber = function isValidNumber(value) {
    return isFinite(value) && value > 0;
  };

  if (isValidNumber(width) && isValidNumber(height)) {
    var adjustedWidth = height * aspectRatio;

    if (type === 'contain' && adjustedWidth > width || type === 'cover' && adjustedWidth < width) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  } else if (isValidNumber(width)) {
    height = width / aspectRatio;
  } else if (isValidNumber(height)) {
    width = height * aspectRatio;
  }

  return {
    width: width,
    height: height
  };
}

/**
 * Get the new sizes of a rectangle after rotated.
 * @param {Object} data - The original sizes.
 * @returns {Object} The result sizes.
 */
function getRotatedSizes(_ref5) {
  var width = _ref5.width,
      height = _ref5.height,
      degree = _ref5.degree;

  degree = Math.abs(degree) % 180;

  if (degree === 90) {
    return {
      width: height,
      height: width
    };
  }

  var arc = degree % 90 * Math.PI / 180;
  var sinArc = Math.sin(arc);
  var cosArc = Math.cos(arc);
  var newWidth = width * cosArc + height * sinArc;
  var newHeight = width * sinArc + height * cosArc;

  return degree > 90 ? {
    width: newHeight,
    height: newWidth
  } : {
    width: newWidth,
    height: newHeight
  };
}

/**
 * Get a canvas which drew the given image.
 * @param {HTMLImageElement} image - The image for drawing.
 * @param {Object} imageData - The image data.
 * @param {Object} canvasData - The canvas data.
 * @param {Object} options - The options.
 * @returns {HTMLCanvasElement} The result canvas.
 */
function getSourceCanvas(image, _ref6, _ref7, _ref8) {
  var imageAspectRatio = _ref6.aspectRatio,
      imageNaturalWidth = _ref6.naturalWidth,
      imageNaturalHeight = _ref6.naturalHeight,
      _ref6$rotate = _ref6.rotate,
      rotate = _ref6$rotate === undefined ? 0 : _ref6$rotate,
      _ref6$scaleX = _ref6.scaleX,
      scaleX = _ref6$scaleX === undefined ? 1 : _ref6$scaleX,
      _ref6$scaleY = _ref6.scaleY,
      scaleY = _ref6$scaleY === undefined ? 1 : _ref6$scaleY;
  var aspectRatio = _ref7.aspectRatio,
      naturalWidth = _ref7.naturalWidth,
      naturalHeight = _ref7.naturalHeight;
  var _ref8$fillColor = _ref8.fillColor,
      fillColor = _ref8$fillColor === undefined ? 'transparent' : _ref8$fillColor,
      _ref8$imageSmoothingE = _ref8.imageSmoothingEnabled,
      imageSmoothingEnabled = _ref8$imageSmoothingE === undefined ? true : _ref8$imageSmoothingE,
      _ref8$imageSmoothingQ = _ref8.imageSmoothingQuality,
      imageSmoothingQuality = _ref8$imageSmoothingQ === undefined ? 'low' : _ref8$imageSmoothingQ,
      _ref8$maxWidth = _ref8.maxWidth,
      maxWidth = _ref8$maxWidth === undefined ? Infinity : _ref8$maxWidth,
      _ref8$maxHeight = _ref8.maxHeight,
      maxHeight = _ref8$maxHeight === undefined ? Infinity : _ref8$maxHeight,
      _ref8$minWidth = _ref8.minWidth,
      minWidth = _ref8$minWidth === undefined ? 0 : _ref8$minWidth,
      _ref8$minHeight = _ref8.minHeight,
      minHeight = _ref8$minHeight === undefined ? 0 : _ref8$minHeight;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var maxSizes = getAdjustedSizes({
    aspectRatio: aspectRatio,
    width: maxWidth,
    height: maxHeight
  });
  var minSizes = getAdjustedSizes({
    aspectRatio: aspectRatio,
    width: minWidth,
    height: minHeight
  }, 'cover');
  var width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
  var height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight));

  // Note: should always use image's natural sizes for drawing as
  // imageData.naturalWidth === canvasData.naturalHeight when rotate % 180 === 90
  var destMaxSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: maxWidth,
    height: maxHeight
  });
  var destMinSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: minWidth,
    height: minHeight
  }, 'cover');
  var destWidth = Math.min(destMaxSizes.width, Math.max(destMinSizes.width, imageNaturalWidth));
  var destHeight = Math.min(destMaxSizes.height, Math.max(destMinSizes.height, imageNaturalHeight));
  var params = [-destWidth / 2, -destHeight / 2, destWidth, destHeight];

  canvas.width = normalizeDecimalNumber(width);
  canvas.height = normalizeDecimalNumber(height);
  context.fillStyle = fillColor;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(rotate * Math.PI / 180);
  context.scale(scaleX, scaleY);
  context.imageSmoothingEnabled = imageSmoothingEnabled;
  context.imageSmoothingQuality = imageSmoothingQuality;
  context.drawImage.apply(context, [image].concat(toConsumableArray(params.map(function (param) {
    return Math.floor(normalizeDecimalNumber(param));
  }))));
  context.restore();
  return canvas;
}

var fromCharCode = String.fromCharCode;

/**
 * Get string from char code in data view.
 * @param {DataView} dataView - The data view for read.
 * @param {number} start - The start index.
 * @param {number} length - The read length.
 * @returns {string} The read result.
 */

function getStringFromCharCode(dataView, start, length) {
  var str = '';
  var i = void 0;

  length += start;

  for (i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }

  return str;
}

var REGEXP_DATA_URL_HEAD = /^data:.*,/;

/**
 * Transform Data URL to array buffer.
 * @param {string} dataURL - The Data URL to transform.
 * @returns {ArrayBuffer} The result array buffer.
 */
function dataURLToArrayBuffer(dataURL) {
  var base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
  var binary = atob(base64);
  var arrayBuffer = new ArrayBuffer(binary.length);
  var uint8 = new Uint8Array(arrayBuffer);

  forEach(uint8, function (value, i) {
    uint8[i] = binary.charCodeAt(i);
  });

  return arrayBuffer;
}

/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */
function arrayBufferToDataURL(arrayBuffer, mimeType) {
  var uint8 = new Uint8Array(arrayBuffer);
  var data = '';

  // TypedArray.prototype.forEach is not supported in some browsers.
  forEach(uint8, function (value) {
    data += fromCharCode(value);
  });

  return 'data:' + mimeType + ';base64,' + btoa(data);
}

/**
 * Get orientation value from given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {number} The read orientation value.
 */
function getOrientation(arrayBuffer) {
  var dataView = new DataView(arrayBuffer);
  var orientation = void 0;
  var littleEndian = void 0;
  var app1Start = void 0;
  var ifdStart = void 0;

  // Only handle JPEG image (start by 0xFFD8)
  if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
    var length = dataView.byteLength;
    var offset = 2;

    while (offset < length) {
      if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
        app1Start = offset;
        break;
      }

      offset += 1;
    }
  }

  if (app1Start) {
    var exifIDCode = app1Start + 4;
    var tiffOffset = app1Start + 10;

    if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
      var endianness = dataView.getUint16(tiffOffset);

      littleEndian = endianness === 0x4949;

      if (littleEndian || endianness === 0x4D4D /* bigEndian */) {
          if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
            var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

            if (firstIFDOffset >= 0x00000008) {
              ifdStart = tiffOffset + firstIFDOffset;
            }
          }
        }
    }
  }

  if (ifdStart) {
    var _length = dataView.getUint16(ifdStart, littleEndian);
    var _offset = void 0;
    var i = void 0;

    for (i = 0; i < _length; i += 1) {
      _offset = ifdStart + i * 12 + 2;

      if (dataView.getUint16(_offset, littleEndian) === 0x0112 /* Orientation */) {
          // 8 is the offset of the current tag's value
          _offset += 8;

          // Get the original orientation value
          orientation = dataView.getUint16(_offset, littleEndian);

          // Override the orientation with its default value
          dataView.setUint16(_offset, 1, littleEndian);
          break;
        }
    }
  }

  return orientation;
}

/**
 * Parse Exif Orientation value.
 * @param {number} orientation - The orientation to parse.
 * @returns {Object} The parsed result.
 */
function parseOrientation(orientation) {
  var rotate = 0;
  var scaleX = 1;
  var scaleY = 1;

  switch (orientation) {
    // Flip horizontal
    case 2:
      scaleX = -1;
      break;

    // Rotate left 180°
    case 3:
      rotate = -180;
      break;

    // Flip vertical
    case 4:
      scaleY = -1;
      break;

    // Flip vertical and rotate right 90°
    case 5:
      rotate = 90;
      scaleY = -1;
      break;

    // Rotate right 90°
    case 6:
      rotate = 90;
      break;

    // Flip horizontal and rotate right 90°
    case 7:
      rotate = 90;
      scaleX = -1;
      break;

    // Rotate left 90°
    case 8:
      rotate = -90;
      break;

    default:
  }

  return {
    rotate: rotate,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var render = {
  render: function render() {
    this.initContainer();
    this.initCanvas();
    this.initCropBox();
    this.renderCanvas();

    if (this.cropped) {
      this.renderCropBox();
    }
  },
  initContainer: function initContainer() {
    var element = this.element,
        options = this.options,
        container = this.container,
        cropper = this.cropper;


    addClass(cropper, CLASS_HIDDEN);
    removeClass(element, CLASS_HIDDEN);

    var containerData = {
      width: Math.max(container.offsetWidth, Number(options.minContainerWidth) || 200),
      height: Math.max(container.offsetHeight, Number(options.minContainerHeight) || 100)
    };

    this.containerData = containerData;

    setStyle(cropper, {
      width: containerData.width,
      height: containerData.height
    });

    addClass(element, CLASS_HIDDEN);
    removeClass(cropper, CLASS_HIDDEN);
  },


  // Canvas (image wrapper)
  initCanvas: function initCanvas() {
    var containerData = this.containerData,
        imageData = this.imageData;
    var viewMode = this.options.viewMode;

    var rotated = Math.abs(imageData.rotate) % 180 === 90;
    var naturalWidth = rotated ? imageData.naturalHeight : imageData.naturalWidth;
    var naturalHeight = rotated ? imageData.naturalWidth : imageData.naturalHeight;
    var aspectRatio = naturalWidth / naturalHeight;
    var canvasWidth = containerData.width;
    var canvasHeight = containerData.height;

    if (containerData.height * aspectRatio > containerData.width) {
      if (viewMode === 3) {
        canvasWidth = containerData.height * aspectRatio;
      } else {
        canvasHeight = containerData.width / aspectRatio;
      }
    } else if (viewMode === 3) {
      canvasHeight = containerData.width / aspectRatio;
    } else {
      canvasWidth = containerData.height * aspectRatio;
    }

    var canvasData = {
      aspectRatio: aspectRatio,
      naturalWidth: naturalWidth,
      naturalHeight: naturalHeight,
      width: canvasWidth,
      height: canvasHeight
    };

    canvasData.left = (containerData.width - canvasWidth) / 2;
    canvasData.top = (containerData.height - canvasHeight) / 2;
    canvasData.oldLeft = canvasData.left;
    canvasData.oldTop = canvasData.top;

    this.canvasData = canvasData;
    this.limited = viewMode === 1 || viewMode === 2;
    this.limitCanvas(true, true);
    this.initialImageData = assign({}, imageData);
    this.initialCanvasData = assign({}, canvasData);
  },
  limitCanvas: function limitCanvas(sizeLimited, positionLimited) {
    var options = this.options,
        containerData = this.containerData,
        canvasData = this.canvasData,
        cropBoxData = this.cropBoxData;
    var viewMode = options.viewMode;
    var aspectRatio = canvasData.aspectRatio;

    var cropped = this.cropped && cropBoxData;

    if (sizeLimited) {
      var minCanvasWidth = Number(options.minCanvasWidth) || 0;
      var minCanvasHeight = Number(options.minCanvasHeight) || 0;

      if (viewMode > 1) {
        minCanvasWidth = Math.max(minCanvasWidth, containerData.width);
        minCanvasHeight = Math.max(minCanvasHeight, containerData.height);

        if (viewMode === 3) {
          if (minCanvasHeight * aspectRatio > minCanvasWidth) {
            minCanvasWidth = minCanvasHeight * aspectRatio;
          } else {
            minCanvasHeight = minCanvasWidth / aspectRatio;
          }
        }
      } else if (viewMode > 0) {
        if (minCanvasWidth) {
          minCanvasWidth = Math.max(minCanvasWidth, cropped ? cropBoxData.width : 0);
        } else if (minCanvasHeight) {
          minCanvasHeight = Math.max(minCanvasHeight, cropped ? cropBoxData.height : 0);
        } else if (cropped) {
          minCanvasWidth = cropBoxData.width;
          minCanvasHeight = cropBoxData.height;

          if (minCanvasHeight * aspectRatio > minCanvasWidth) {
            minCanvasWidth = minCanvasHeight * aspectRatio;
          } else {
            minCanvasHeight = minCanvasWidth / aspectRatio;
          }
        }
      }

      var _getAdjustedSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: minCanvasWidth,
        height: minCanvasHeight
      });

      minCanvasWidth = _getAdjustedSizes.width;
      minCanvasHeight = _getAdjustedSizes.height;


      canvasData.minWidth = minCanvasWidth;
      canvasData.minHeight = minCanvasHeight;
      canvasData.maxWidth = Infinity;
      canvasData.maxHeight = Infinity;
    }

    if (positionLimited) {
      if (viewMode) {
        var newCanvasLeft = containerData.width - canvasData.width;
        var newCanvasTop = containerData.height - canvasData.height;

        canvasData.minLeft = Math.min(0, newCanvasLeft);
        canvasData.minTop = Math.min(0, newCanvasTop);
        canvasData.maxLeft = Math.max(0, newCanvasLeft);
        canvasData.maxTop = Math.max(0, newCanvasTop);

        if (cropped && this.limited) {
          canvasData.minLeft = Math.min(cropBoxData.left, cropBoxData.left + (cropBoxData.width - canvasData.width));
          canvasData.minTop = Math.min(cropBoxData.top, cropBoxData.top + (cropBoxData.height - canvasData.height));
          canvasData.maxLeft = cropBoxData.left;
          canvasData.maxTop = cropBoxData.top;

          if (viewMode === 2) {
            if (canvasData.width >= containerData.width) {
              canvasData.minLeft = Math.min(0, newCanvasLeft);
              canvasData.maxLeft = Math.max(0, newCanvasLeft);
            }

            if (canvasData.height >= containerData.height) {
              canvasData.minTop = Math.min(0, newCanvasTop);
              canvasData.maxTop = Math.max(0, newCanvasTop);
            }
          }
        }
      } else {
        canvasData.minLeft = -canvasData.width;
        canvasData.minTop = -canvasData.height;
        canvasData.maxLeft = containerData.width;
        canvasData.maxTop = containerData.height;
      }
    }
  },
  renderCanvas: function renderCanvas(changed, transformed) {
    var canvasData = this.canvasData,
        imageData = this.imageData;


    if (transformed) {
      var _getRotatedSizes = getRotatedSizes({
        width: imageData.naturalWidth * Math.abs(imageData.scaleX || 1),
        height: imageData.naturalHeight * Math.abs(imageData.scaleY || 1),
        degree: imageData.rotate || 0
      }),
          naturalWidth = _getRotatedSizes.width,
          naturalHeight = _getRotatedSizes.height;

      var width = canvasData.width * (naturalWidth / canvasData.naturalWidth);
      var height = canvasData.height * (naturalHeight / canvasData.naturalHeight);

      canvasData.left -= (width - canvasData.width) / 2;
      canvasData.top -= (height - canvasData.height) / 2;
      canvasData.width = width;
      canvasData.height = height;
      canvasData.aspectRatio = naturalWidth / naturalHeight;
      canvasData.naturalWidth = naturalWidth;
      canvasData.naturalHeight = naturalHeight;
      this.limitCanvas(true, false);
    }

    if (canvasData.width > canvasData.maxWidth || canvasData.width < canvasData.minWidth) {
      canvasData.left = canvasData.oldLeft;
    }

    if (canvasData.height > canvasData.maxHeight || canvasData.height < canvasData.minHeight) {
      canvasData.top = canvasData.oldTop;
    }

    canvasData.width = Math.min(Math.max(canvasData.width, canvasData.minWidth), canvasData.maxWidth);
    canvasData.height = Math.min(Math.max(canvasData.height, canvasData.minHeight), canvasData.maxHeight);

    this.limitCanvas(false, true);

    canvasData.left = Math.min(Math.max(canvasData.left, canvasData.minLeft), canvasData.maxLeft);
    canvasData.top = Math.min(Math.max(canvasData.top, canvasData.minTop), canvasData.maxTop);
    canvasData.oldLeft = canvasData.left;
    canvasData.oldTop = canvasData.top;

    setStyle(this.canvas, assign({
      width: canvasData.width,
      height: canvasData.height
    }, getTransforms({
      translateX: canvasData.left,
      translateY: canvasData.top
    })));

    this.renderImage(changed);

    if (this.cropped && this.limited) {
      this.limitCropBox(true, true);
    }
  },
  renderImage: function renderImage(changed) {
    var canvasData = this.canvasData,
        imageData = this.imageData;

    var width = imageData.naturalWidth * (canvasData.width / canvasData.naturalWidth);
    var height = imageData.naturalHeight * (canvasData.height / canvasData.naturalHeight);

    assign(imageData, {
      width: width,
      height: height,
      left: (canvasData.width - width) / 2,
      top: (canvasData.height - height) / 2
    });
    setStyle(this.image, assign({
      width: imageData.width,
      height: imageData.height
    }, getTransforms(assign({
      translateX: imageData.left,
      translateY: imageData.top
    }, imageData))));

    if (changed) {
      this.output();
    }
  },
  initCropBox: function initCropBox() {
    var options = this.options,
        canvasData = this.canvasData;

    var aspectRatio = options.aspectRatio || options.initialAspectRatio;
    var autoCropArea = Number(options.autoCropArea) || 0.8;
    var cropBoxData = {
      width: canvasData.width,
      height: canvasData.height
    };

    if (aspectRatio) {
      if (canvasData.height * aspectRatio > canvasData.width) {
        cropBoxData.height = cropBoxData.width / aspectRatio;
      } else {
        cropBoxData.width = cropBoxData.height * aspectRatio;
      }
    }

    this.cropBoxData = cropBoxData;
    this.limitCropBox(true, true);

    // Initialize auto crop area
    cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
    cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);

    // The width/height of auto crop area must large than "minWidth/Height"
    cropBoxData.width = Math.max(cropBoxData.minWidth, cropBoxData.width * autoCropArea);
    cropBoxData.height = Math.max(cropBoxData.minHeight, cropBoxData.height * autoCropArea);
    cropBoxData.left = canvasData.left + (canvasData.width - cropBoxData.width) / 2;
    cropBoxData.top = canvasData.top + (canvasData.height - cropBoxData.height) / 2;
    cropBoxData.oldLeft = cropBoxData.left;
    cropBoxData.oldTop = cropBoxData.top;

    this.initialCropBoxData = assign({}, cropBoxData);
  },
  limitCropBox: function limitCropBox(sizeLimited, positionLimited) {
    var options = this.options,
        containerData = this.containerData,
        canvasData = this.canvasData,
        cropBoxData = this.cropBoxData,
        limited = this.limited;
    var aspectRatio = options.aspectRatio;


    if (sizeLimited) {
      var minCropBoxWidth = Number(options.minCropBoxWidth) || 0;
      var minCropBoxHeight = Number(options.minCropBoxHeight) || 0;
      var maxCropBoxWidth = Math.min(containerData.width, limited ? canvasData.width : containerData.width);
      var maxCropBoxHeight = Math.min(containerData.height, limited ? canvasData.height : containerData.height);

      // The min/maxCropBoxWidth/Height must be less than container's width/height
      minCropBoxWidth = Math.min(minCropBoxWidth, containerData.width);
      minCropBoxHeight = Math.min(minCropBoxHeight, containerData.height);

      if (aspectRatio) {
        if (minCropBoxWidth && minCropBoxHeight) {
          if (minCropBoxHeight * aspectRatio > minCropBoxWidth) {
            minCropBoxHeight = minCropBoxWidth / aspectRatio;
          } else {
            minCropBoxWidth = minCropBoxHeight * aspectRatio;
          }
        } else if (minCropBoxWidth) {
          minCropBoxHeight = minCropBoxWidth / aspectRatio;
        } else if (minCropBoxHeight) {
          minCropBoxWidth = minCropBoxHeight * aspectRatio;
        }

        if (maxCropBoxHeight * aspectRatio > maxCropBoxWidth) {
          maxCropBoxHeight = maxCropBoxWidth / aspectRatio;
        } else {
          maxCropBoxWidth = maxCropBoxHeight * aspectRatio;
        }
      }

      // The minWidth/Height must be less than maxWidth/Height
      cropBoxData.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
      cropBoxData.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
      cropBoxData.maxWidth = maxCropBoxWidth;
      cropBoxData.maxHeight = maxCropBoxHeight;
    }

    if (positionLimited) {
      if (limited) {
        cropBoxData.minLeft = Math.max(0, canvasData.left);
        cropBoxData.minTop = Math.max(0, canvasData.top);
        cropBoxData.maxLeft = Math.min(containerData.width, canvasData.left + canvasData.width) - cropBoxData.width;
        cropBoxData.maxTop = Math.min(containerData.height, canvasData.top + canvasData.height) - cropBoxData.height;
      } else {
        cropBoxData.minLeft = 0;
        cropBoxData.minTop = 0;
        cropBoxData.maxLeft = containerData.width - cropBoxData.width;
        cropBoxData.maxTop = containerData.height - cropBoxData.height;
      }
    }
  },
  renderCropBox: function renderCropBox() {
    var options = this.options,
        containerData = this.containerData,
        cropBoxData = this.cropBoxData;


    if (cropBoxData.width > cropBoxData.maxWidth || cropBoxData.width < cropBoxData.minWidth) {
      cropBoxData.left = cropBoxData.oldLeft;
    }

    if (cropBoxData.height > cropBoxData.maxHeight || cropBoxData.height < cropBoxData.minHeight) {
      cropBoxData.top = cropBoxData.oldTop;
    }

    cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
    cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);

    this.limitCropBox(false, true);

    cropBoxData.left = Math.min(Math.max(cropBoxData.left, cropBoxData.minLeft), cropBoxData.maxLeft);
    cropBoxData.top = Math.min(Math.max(cropBoxData.top, cropBoxData.minTop), cropBoxData.maxTop);
    cropBoxData.oldLeft = cropBoxData.left;
    cropBoxData.oldTop = cropBoxData.top;

    if (options.movable && options.cropBoxMovable) {
      // Turn to move the canvas when the crop box is equal to the container
      setData(this.face, DATA_ACTION, cropBoxData.width >= containerData.width && cropBoxData.height >= containerData.height ? ACTION_MOVE : ACTION_ALL);
    }

    setStyle(this.cropBox, assign({
      width: cropBoxData.width,
      height: cropBoxData.height
    }, getTransforms({
      translateX: cropBoxData.left,
      translateY: cropBoxData.top
    })));

    if (this.cropped && this.limited) {
      this.limitCanvas(true, true);
    }

    if (!this.disabled) {
      this.output();
    }
  },
  output: function output() {
    this.preview();
    dispatchEvent(this.element, EVENT_CROP, this.getData());
  }
};

var preview = {
  initPreview: function initPreview() {
    var crossOrigin = this.crossOrigin;
    var preview = this.options.preview;

    var url = crossOrigin ? this.crossOriginUrl : this.url;
    var image = document.createElement('img');

    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }

    image.src = url;
    this.viewBox.appendChild(image);
    this.viewBoxImage = image;

    if (!preview) {
      return;
    }

    var previews = preview;

    if (typeof preview === 'string') {
      previews = this.element.ownerDocument.querySelectorAll(preview);
    } else if (preview.querySelector) {
      previews = [preview];
    }

    this.previews = previews;

    forEach(previews, function (el) {
      var img = document.createElement('img');

      // Save the original size for recover
      setData(el, DATA_PREVIEW, {
        width: el.offsetWidth,
        height: el.offsetHeight,
        html: el.innerHTML
      });

      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      img.src = url;

      /**
       * Override img element styles
       * Add `display:block` to avoid margin top issue
       * Add `height:auto` to override `height` attribute on IE8
       * (Occur only when margin-top <= -height)
       */
      img.style.cssText = 'display:block;' + 'width:100%;' + 'height:auto;' + 'min-width:0!important;' + 'min-height:0!important;' + 'max-width:none!important;' + 'max-height:none!important;' + 'image-orientation:0deg!important;"';

      el.innerHTML = '';
      el.appendChild(img);
    });
  },
  resetPreview: function resetPreview() {
    forEach(this.previews, function (element) {
      var data = getData(element, DATA_PREVIEW);

      setStyle(element, {
        width: data.width,
        height: data.height
      });

      element.innerHTML = data.html;
      removeData(element, DATA_PREVIEW);
    });
  },
  preview: function preview() {
    var imageData = this.imageData,
        canvasData = this.canvasData,
        cropBoxData = this.cropBoxData;
    var cropBoxWidth = cropBoxData.width,
        cropBoxHeight = cropBoxData.height;
    var width = imageData.width,
        height = imageData.height;

    var left = cropBoxData.left - canvasData.left - imageData.left;
    var top = cropBoxData.top - canvasData.top - imageData.top;

    if (!this.cropped || this.disabled) {
      return;
    }

    setStyle(this.viewBoxImage, assign({
      width: width,
      height: height
    }, getTransforms(assign({
      translateX: -left,
      translateY: -top
    }, imageData))));

    forEach(this.previews, function (element) {
      var data = getData(element, DATA_PREVIEW);
      var originalWidth = data.width;
      var originalHeight = data.height;
      var newWidth = originalWidth;
      var newHeight = originalHeight;
      var ratio = 1;

      if (cropBoxWidth) {
        ratio = originalWidth / cropBoxWidth;
        newHeight = cropBoxHeight * ratio;
      }

      if (cropBoxHeight && newHeight > originalHeight) {
        ratio = originalHeight / cropBoxHeight;
        newWidth = cropBoxWidth * ratio;
        newHeight = originalHeight;
      }

      setStyle(element, {
        width: newWidth,
        height: newHeight
      });

      setStyle(element.getElementsByTagName('img')[0], assign({
        width: width * ratio,
        height: height * ratio
      }, getTransforms(assign({
        translateX: -left * ratio,
        translateY: -top * ratio
      }, imageData))));
    });
  }
};

var events = {
  bind: function bind() {
    var element = this.element,
        options = this.options,
        cropper = this.cropper;


    if (isFunction(options.cropstart)) {
      addListener(element, EVENT_CROP_START, options.cropstart);
    }

    if (isFunction(options.cropmove)) {
      addListener(element, EVENT_CROP_MOVE, options.cropmove);
    }

    if (isFunction(options.cropend)) {
      addListener(element, EVENT_CROP_END, options.cropend);
    }

    if (isFunction(options.crop)) {
      addListener(element, EVENT_CROP, options.crop);
    }

    if (isFunction(options.zoom)) {
      addListener(element, EVENT_ZOOM, options.zoom);
    }

    addListener(cropper, EVENT_POINTER_DOWN, this.onCropStart = this.cropStart.bind(this));

    if (options.zoomable && options.zoomOnWheel) {
      addListener(cropper, EVENT_WHEEL, this.onWheel = this.wheel.bind(this));
    }

    if (options.toggleDragModeOnDblclick) {
      addListener(cropper, EVENT_DBLCLICK, this.onDblclick = this.dblclick.bind(this));
    }

    addListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove = this.cropMove.bind(this));
    addListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd = this.cropEnd.bind(this));

    if (options.responsive) {
      addListener(window, EVENT_RESIZE, this.onResize = this.resize.bind(this));
    }
  },
  unbind: function unbind() {
    var element = this.element,
        options = this.options,
        cropper = this.cropper;


    if (isFunction(options.cropstart)) {
      removeListener(element, EVENT_CROP_START, options.cropstart);
    }

    if (isFunction(options.cropmove)) {
      removeListener(element, EVENT_CROP_MOVE, options.cropmove);
    }

    if (isFunction(options.cropend)) {
      removeListener(element, EVENT_CROP_END, options.cropend);
    }

    if (isFunction(options.crop)) {
      removeListener(element, EVENT_CROP, options.crop);
    }

    if (isFunction(options.zoom)) {
      removeListener(element, EVENT_ZOOM, options.zoom);
    }

    removeListener(cropper, EVENT_POINTER_DOWN, this.onCropStart);

    if (options.zoomable && options.zoomOnWheel) {
      removeListener(cropper, EVENT_WHEEL, this.onWheel);
    }

    if (options.toggleDragModeOnDblclick) {
      removeListener(cropper, EVENT_DBLCLICK, this.onDblclick);
    }

    removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove);
    removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd);

    if (options.responsive) {
      removeListener(window, EVENT_RESIZE, this.onResize);
    }
  }
};

var handlers = {
  resize: function resize() {
    var options = this.options,
        container = this.container,
        containerData = this.containerData;

    var minContainerWidth = Number(options.minContainerWidth) || 200;
    var minContainerHeight = Number(options.minContainerHeight) || 100;

    if (this.disabled || containerData.width <= minContainerWidth || containerData.height <= minContainerHeight) {
      return;
    }

    var ratio = container.offsetWidth / containerData.width;

    // Resize when width changed or height changed
    if (ratio !== 1 || container.offsetHeight !== containerData.height) {
      var canvasData = void 0;
      var cropBoxData = void 0;

      if (options.restore) {
        canvasData = this.getCanvasData();
        cropBoxData = this.getCropBoxData();
      }

      this.render();

      if (options.restore) {
        this.setCanvasData(forEach(canvasData, function (n, i) {
          canvasData[i] = n * ratio;
        }));
        this.setCropBoxData(forEach(cropBoxData, function (n, i) {
          cropBoxData[i] = n * ratio;
        }));
      }
    }
  },
  dblclick: function dblclick() {
    if (this.disabled || this.options.dragMode === DRAG_MODE_NONE) {
      return;
    }

    this.setDragMode(hasClass(this.dragBox, CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP);
  },
  wheel: function wheel(e) {
    var _this = this;

    var ratio = Number(this.options.wheelZoomRatio) || 0.1;
    var delta = 1;

    if (this.disabled) {
      return;
    }

    e.preventDefault();

    // Limit wheel speed to prevent zoom too fast (#21)
    if (this.wheeling) {
      return;
    }

    this.wheeling = true;

    setTimeout(function () {
      _this.wheeling = false;
    }, 50);

    if (e.deltaY) {
      delta = e.deltaY > 0 ? 1 : -1;
    } else if (e.wheelDelta) {
      delta = -e.wheelDelta / 120;
    } else if (e.detail) {
      delta = e.detail > 0 ? 1 : -1;
    }

    this.zoom(-delta * ratio, e);
  },
  cropStart: function cropStart(e) {
    if (this.disabled) {
      return;
    }

    var options = this.options,
        pointers = this.pointers;

    var action = void 0;

    if (e.changedTouches) {
      // Handle touch event
      forEach(e.changedTouches, function (touch) {
        pointers[touch.identifier] = getPointer(touch);
      });
    } else {
      // Handle mouse event and pointer event
      pointers[e.pointerId || 0] = getPointer(e);
    }

    if (Object.keys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
      action = ACTION_ZOOM;
    } else {
      action = getData(e.target, DATA_ACTION);
    }

    if (!REGEXP_ACTIONS.test(action)) {
      return;
    }

    if (dispatchEvent(this.element, EVENT_CROP_START, {
      originalEvent: e,
      action: action
    }) === false) {
      return;
    }

    // This line is required for preventing page zooming in iOS browsers
    e.preventDefault();

    this.action = action;
    this.cropping = false;

    if (action === ACTION_CROP) {
      this.cropping = true;
      addClass(this.dragBox, CLASS_MODAL);
    }
  },
  cropMove: function cropMove(e) {
    var action = this.action;


    if (this.disabled || !action) {
      return;
    }

    var pointers = this.pointers;


    e.preventDefault();

    if (dispatchEvent(this.element, EVENT_CROP_MOVE, {
      originalEvent: e,
      action: action
    }) === false) {
      return;
    }

    if (e.changedTouches) {
      forEach(e.changedTouches, function (touch) {
        assign(pointers[touch.identifier], getPointer(touch, true));
      });
    } else {
      assign(pointers[e.pointerId || 0], getPointer(e, true));
    }

    this.change(e);
  },
  cropEnd: function cropEnd(e) {
    if (this.disabled) {
      return;
    }

    var action = this.action,
        pointers = this.pointers;


    if (e.changedTouches) {
      forEach(e.changedTouches, function (touch) {
        delete pointers[touch.identifier];
      });
    } else {
      delete pointers[e.pointerId || 0];
    }

    if (!action) {
      return;
    }

    e.preventDefault();

    if (!Object.keys(pointers).length) {
      this.action = '';
    }

    if (this.cropping) {
      this.cropping = false;
      toggleClass(this.dragBox, CLASS_MODAL, this.cropped && this.options.modal);
    }

    dispatchEvent(this.element, EVENT_CROP_END, {
      originalEvent: e,
      action: action
    });
  }
};

var change = {
  change: function change(e) {
    var options = this.options,
        canvasData = this.canvasData,
        containerData = this.containerData,
        cropBoxData = this.cropBoxData,
        pointers = this.pointers;
    var action = this.action;
    var aspectRatio = options.aspectRatio;
    var left = cropBoxData.left,
        top = cropBoxData.top,
        width = cropBoxData.width,
        height = cropBoxData.height;

    var right = left + width;
    var bottom = top + height;
    var minLeft = 0;
    var minTop = 0;
    var maxWidth = containerData.width;
    var maxHeight = containerData.height;
    var renderable = true;
    var offset = void 0;

    // Locking aspect ratio in "free mode" by holding shift key
    if (!aspectRatio && e.shiftKey) {
      aspectRatio = width && height ? width / height : 1;
    }

    if (this.limited) {
      minLeft = cropBoxData.minLeft;
      minTop = cropBoxData.minTop;

      maxWidth = minLeft + Math.min(containerData.width, canvasData.width, canvasData.left + canvasData.width);
      maxHeight = minTop + Math.min(containerData.height, canvasData.height, canvasData.top + canvasData.height);
    }

    var pointer = pointers[Object.keys(pointers)[0]];
    var range = {
      x: pointer.endX - pointer.startX,
      y: pointer.endY - pointer.startY
    };
    var check = function check(side) {
      switch (side) {
        case ACTION_EAST:
          if (right + range.x > maxWidth) {
            range.x = maxWidth - right;
          }

          break;

        case ACTION_WEST:
          if (left + range.x < minLeft) {
            range.x = minLeft - left;
          }

          break;

        case ACTION_NORTH:
          if (top + range.y < minTop) {
            range.y = minTop - top;
          }

          break;

        case ACTION_SOUTH:
          if (bottom + range.y > maxHeight) {
            range.y = maxHeight - bottom;
          }

          break;

        default:
      }
    };

    switch (action) {
      // Move crop box
      case ACTION_ALL:
        left += range.x;
        top += range.y;
        break;

      // Resize crop box
      case ACTION_EAST:
        if (range.x >= 0 && (right >= maxWidth || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
          renderable = false;
          break;
        }

        check(ACTION_EAST);
        width += range.x;

        if (width < 0) {
          action = ACTION_WEST;
          width = -width;
          left -= width;
        }

        if (aspectRatio) {
          height = width / aspectRatio;
          top += (cropBoxData.height - height) / 2;
        }

        break;

      case ACTION_NORTH:
        if (range.y <= 0 && (top <= minTop || aspectRatio && (left <= minLeft || right >= maxWidth))) {
          renderable = false;
          break;
        }

        check(ACTION_NORTH);
        height -= range.y;
        top += range.y;

        if (height < 0) {
          action = ACTION_SOUTH;
          height = -height;
          top -= height;
        }

        if (aspectRatio) {
          width = height * aspectRatio;
          left += (cropBoxData.width - width) / 2;
        }

        break;

      case ACTION_WEST:
        if (range.x <= 0 && (left <= minLeft || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
          renderable = false;
          break;
        }

        check(ACTION_WEST);
        width -= range.x;
        left += range.x;

        if (width < 0) {
          action = ACTION_EAST;
          width = -width;
          left -= width;
        }

        if (aspectRatio) {
          height = width / aspectRatio;
          top += (cropBoxData.height - height) / 2;
        }

        break;

      case ACTION_SOUTH:
        if (range.y >= 0 && (bottom >= maxHeight || aspectRatio && (left <= minLeft || right >= maxWidth))) {
          renderable = false;
          break;
        }

        check(ACTION_SOUTH);
        height += range.y;

        if (height < 0) {
          action = ACTION_NORTH;
          height = -height;
          top -= height;
        }

        if (aspectRatio) {
          width = height * aspectRatio;
          left += (cropBoxData.width - width) / 2;
        }

        break;

      case ACTION_NORTH_EAST:
        if (aspectRatio) {
          if (range.y <= 0 && (top <= minTop || right >= maxWidth)) {
            renderable = false;
            break;
          }

          check(ACTION_NORTH);
          height -= range.y;
          top += range.y;
          width = height * aspectRatio;
        } else {
          check(ACTION_NORTH);
          check(ACTION_EAST);

          if (range.x >= 0) {
            if (right < maxWidth) {
              width += range.x;
            } else if (range.y <= 0 && top <= minTop) {
              renderable = false;
            }
          } else {
            width += range.x;
          }

          if (range.y <= 0) {
            if (top > minTop) {
              height -= range.y;
              top += range.y;
            }
          } else {
            height -= range.y;
            top += range.y;
          }
        }

        if (width < 0 && height < 0) {
          action = ACTION_SOUTH_WEST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_NORTH_WEST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_SOUTH_EAST;
          height = -height;
          top -= height;
        }

        break;

      case ACTION_NORTH_WEST:
        if (aspectRatio) {
          if (range.y <= 0 && (top <= minTop || left <= minLeft)) {
            renderable = false;
            break;
          }

          check(ACTION_NORTH);
          height -= range.y;
          top += range.y;
          width = height * aspectRatio;
          left += cropBoxData.width - width;
        } else {
          check(ACTION_NORTH);
          check(ACTION_WEST);

          if (range.x <= 0) {
            if (left > minLeft) {
              width -= range.x;
              left += range.x;
            } else if (range.y <= 0 && top <= minTop) {
              renderable = false;
            }
          } else {
            width -= range.x;
            left += range.x;
          }

          if (range.y <= 0) {
            if (top > minTop) {
              height -= range.y;
              top += range.y;
            }
          } else {
            height -= range.y;
            top += range.y;
          }
        }

        if (width < 0 && height < 0) {
          action = ACTION_SOUTH_EAST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_NORTH_EAST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_SOUTH_WEST;
          height = -height;
          top -= height;
        }

        break;

      case ACTION_SOUTH_WEST:
        if (aspectRatio) {
          if (range.x <= 0 && (left <= minLeft || bottom >= maxHeight)) {
            renderable = false;
            break;
          }

          check(ACTION_WEST);
          width -= range.x;
          left += range.x;
          height = width / aspectRatio;
        } else {
          check(ACTION_SOUTH);
          check(ACTION_WEST);

          if (range.x <= 0) {
            if (left > minLeft) {
              width -= range.x;
              left += range.x;
            } else if (range.y >= 0 && bottom >= maxHeight) {
              renderable = false;
            }
          } else {
            width -= range.x;
            left += range.x;
          }

          if (range.y >= 0) {
            if (bottom < maxHeight) {
              height += range.y;
            }
          } else {
            height += range.y;
          }
        }

        if (width < 0 && height < 0) {
          action = ACTION_NORTH_EAST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_SOUTH_EAST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_NORTH_WEST;
          height = -height;
          top -= height;
        }

        break;

      case ACTION_SOUTH_EAST:
        if (aspectRatio) {
          if (range.x >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
            renderable = false;
            break;
          }

          check(ACTION_EAST);
          width += range.x;
          height = width / aspectRatio;
        } else {
          check(ACTION_SOUTH);
          check(ACTION_EAST);

          if (range.x >= 0) {
            if (right < maxWidth) {
              width += range.x;
            } else if (range.y >= 0 && bottom >= maxHeight) {
              renderable = false;
            }
          } else {
            width += range.x;
          }

          if (range.y >= 0) {
            if (bottom < maxHeight) {
              height += range.y;
            }
          } else {
            height += range.y;
          }
        }

        if (width < 0 && height < 0) {
          action = ACTION_NORTH_WEST;
          height = -height;
          width = -width;
          top -= height;
          left -= width;
        } else if (width < 0) {
          action = ACTION_SOUTH_WEST;
          width = -width;
          left -= width;
        } else if (height < 0) {
          action = ACTION_NORTH_EAST;
          height = -height;
          top -= height;
        }

        break;

      // Move canvas
      case ACTION_MOVE:
        this.move(range.x, range.y);
        renderable = false;
        break;

      // Zoom canvas
      case ACTION_ZOOM:
        this.zoom(getMaxZoomRatio(pointers), e);
        renderable = false;
        break;

      // Create crop box
      case ACTION_CROP:
        if (!range.x || !range.y) {
          renderable = false;
          break;
        }

        offset = getOffset(this.cropper);
        left = pointer.startX - offset.left;
        top = pointer.startY - offset.top;
        width = cropBoxData.minWidth;
        height = cropBoxData.minHeight;

        if (range.x > 0) {
          action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
        } else if (range.x < 0) {
          left -= width;
          action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
        }

        if (range.y < 0) {
          top -= height;
        }

        // Show the crop box if is hidden
        if (!this.cropped) {
          removeClass(this.cropBox, CLASS_HIDDEN);
          this.cropped = true;

          if (this.limited) {
            this.limitCropBox(true, true);
          }
        }

        break;

      default:
    }

    if (renderable) {
      cropBoxData.width = width;
      cropBoxData.height = height;
      cropBoxData.left = left;
      cropBoxData.top = top;
      this.action = action;
      this.renderCropBox();
    }

    // Override
    forEach(pointers, function (p) {
      p.startX = p.endX;
      p.startY = p.endY;
    });
  }
};

var methods = {
  // Show the crop box manually
  crop: function crop() {
    if (this.ready && !this.cropped && !this.disabled) {
      this.cropped = true;
      this.limitCropBox(true, true);

      if (this.options.modal) {
        addClass(this.dragBox, CLASS_MODAL);
      }

      removeClass(this.cropBox, CLASS_HIDDEN);
      this.setCropBoxData(this.initialCropBoxData);
    }

    return this;
  },


  // Reset the image and crop box to their initial states
  reset: function reset() {
    if (this.ready && !this.disabled) {
      this.imageData = assign({}, this.initialImageData);
      this.canvasData = assign({}, this.initialCanvasData);
      this.cropBoxData = assign({}, this.initialCropBoxData);
      this.renderCanvas();

      if (this.cropped) {
        this.renderCropBox();
      }
    }

    return this;
  },


  // Clear the crop box
  clear: function clear() {
    if (this.cropped && !this.disabled) {
      assign(this.cropBoxData, {
        left: 0,
        top: 0,
        width: 0,
        height: 0
      });

      this.cropped = false;
      this.renderCropBox();
      this.limitCanvas(true, true);

      // Render canvas after crop box rendered
      this.renderCanvas();
      removeClass(this.dragBox, CLASS_MODAL);
      addClass(this.cropBox, CLASS_HIDDEN);
    }

    return this;
  },


  /**
   * Replace the image's src and rebuild the cropper
   * @param {string} url - The new URL.
   * @param {boolean} [hasSameSize] - Indicate if the new image has the same size as the old one.
   * @returns {Cropper} this
   */
  replace: function replace(url) {
    var hasSameSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!this.disabled && url) {
      if (this.isImg) {
        this.element.src = url;
      }

      if (hasSameSize) {
        this.url = url;
        this.image.src = url;

        if (this.ready) {
          this.viewBoxImage.src = url;

          forEach(this.previews, function (element) {
            element.getElementsByTagName('img')[0].src = url;
          });
        }
      } else {
        if (this.isImg) {
          this.replaced = true;
        }

        this.options.data = null;
        this.uncreate();
        this.load(url);
      }
    }

    return this;
  },


  // Enable (unfreeze) the cropper
  enable: function enable() {
    if (this.ready && this.disabled) {
      this.disabled = false;
      removeClass(this.cropper, CLASS_DISABLED);
    }

    return this;
  },


  // Disable (freeze) the cropper
  disable: function disable() {
    if (this.ready && !this.disabled) {
      this.disabled = true;
      addClass(this.cropper, CLASS_DISABLED);
    }

    return this;
  },


  /**
   * Destroy the cropper and remove the instance from the image
   * @returns {Cropper} this
   */
  destroy: function destroy() {
    var element = this.element;


    if (!getData(element, NAMESPACE)) {
      return this;
    }

    if (this.isImg && this.replaced) {
      element.src = this.originalUrl;
    }

    this.uncreate();
    removeData(element, NAMESPACE);

    return this;
  },


  /**
   * Move the canvas with relative offsets
   * @param {number} offsetX - The relative offset distance on the x-axis.
   * @param {number} [offsetY=offsetX] - The relative offset distance on the y-axis.
   * @returns {Cropper} this
   */
  move: function move(offsetX) {
    var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : offsetX;
    var _canvasData = this.canvasData,
        left = _canvasData.left,
        top = _canvasData.top;


    return this.moveTo(isUndefined(offsetX) ? offsetX : left + Number(offsetX), isUndefined(offsetY) ? offsetY : top + Number(offsetY));
  },


  /**
   * Move the canvas to an absolute point
   * @param {number} x - The x-axis coordinate.
   * @param {number} [y=x] - The y-axis coordinate.
   * @returns {Cropper} this
   */
  moveTo: function moveTo(x) {
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
    var canvasData = this.canvasData;

    var changed = false;

    x = Number(x);
    y = Number(y);

    if (this.ready && !this.disabled && this.options.movable) {
      if (isNumber(x)) {
        canvasData.left = x;
        changed = true;
      }

      if (isNumber(y)) {
        canvasData.top = y;
        changed = true;
      }

      if (changed) {
        this.renderCanvas(true);
      }
    }

    return this;
  },


  /**
   * Zoom the canvas with a relative ratio
   * @param {number} ratio - The target ratio.
   * @param {Event} _originalEvent - The original event if any.
   * @returns {Cropper} this
   */
  zoom: function zoom(ratio, _originalEvent) {
    var canvasData = this.canvasData;


    ratio = Number(ratio);

    if (ratio < 0) {
      ratio = 1 / (1 - ratio);
    } else {
      ratio = 1 + ratio;
    }

    return this.zoomTo(canvasData.width * ratio / canvasData.naturalWidth, null, _originalEvent);
  },


  /**
   * Zoom the canvas to an absolute ratio
   * @param {number} ratio - The target ratio.
   * @param {Object} pivot - The zoom pivot point coordinate.
   * @param {Event} _originalEvent - The original event if any.
   * @returns {Cropper} this
   */
  zoomTo: function zoomTo(ratio, pivot, _originalEvent) {
    var options = this.options,
        canvasData = this.canvasData;
    var width = canvasData.width,
        height = canvasData.height,
        naturalWidth = canvasData.naturalWidth,
        naturalHeight = canvasData.naturalHeight;


    ratio = Number(ratio);

    if (ratio >= 0 && this.ready && !this.disabled && options.zoomable) {
      var newWidth = naturalWidth * ratio;
      var newHeight = naturalHeight * ratio;

      if (dispatchEvent(this.element, EVENT_ZOOM, {
        ratio: ratio,
        oldRatio: width / naturalWidth,
        originalEvent: _originalEvent
      }) === false) {
        return this;
      }

      if (_originalEvent) {
        var pointers = this.pointers;

        var offset = getOffset(this.cropper);
        var center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
          pageX: _originalEvent.pageX,
          pageY: _originalEvent.pageY
        };

        // Zoom from the triggering point of the event
        canvasData.left -= (newWidth - width) * ((center.pageX - offset.left - canvasData.left) / width);
        canvasData.top -= (newHeight - height) * ((center.pageY - offset.top - canvasData.top) / height);
      } else if (isPlainObject(pivot) && isNumber(pivot.x) && isNumber(pivot.y)) {
        canvasData.left -= (newWidth - width) * ((pivot.x - canvasData.left) / width);
        canvasData.top -= (newHeight - height) * ((pivot.y - canvasData.top) / height);
      } else {
        // Zoom from the center of the canvas
        canvasData.left -= (newWidth - width) / 2;
        canvasData.top -= (newHeight - height) / 2;
      }

      canvasData.width = newWidth;
      canvasData.height = newHeight;
      this.renderCanvas(true);
    }

    return this;
  },


  /**
   * Rotate the canvas with a relative degree
   * @param {number} degree - The rotate degree.
   * @returns {Cropper} this
   */
  rotate: function rotate(degree) {
    return this.rotateTo((this.imageData.rotate || 0) + Number(degree));
  },


  /**
   * Rotate the canvas to an absolute degree
   * @param {number} degree - The rotate degree.
   * @returns {Cropper} this
   */
  rotateTo: function rotateTo(degree) {
    degree = Number(degree);

    if (isNumber(degree) && this.ready && !this.disabled && this.options.rotatable) {
      this.imageData.rotate = degree % 360;
      this.renderCanvas(true, true);
    }

    return this;
  },


  /**
   * Scale the image on the x-axis.
   * @param {number} scaleX - The scale ratio on the x-axis.
   * @returns {Cropper} this
   */
  scaleX: function scaleX(_scaleX) {
    var scaleY = this.imageData.scaleY;


    return this.scale(_scaleX, isNumber(scaleY) ? scaleY : 1);
  },


  /**
   * Scale the image on the y-axis.
   * @param {number} scaleY - The scale ratio on the y-axis.
   * @returns {Cropper} this
   */
  scaleY: function scaleY(_scaleY) {
    var scaleX = this.imageData.scaleX;


    return this.scale(isNumber(scaleX) ? scaleX : 1, _scaleY);
  },


  /**
   * Scale the image
   * @param {number} scaleX - The scale ratio on the x-axis.
   * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
   * @returns {Cropper} this
   */
  scale: function scale(scaleX) {
    var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;
    var imageData = this.imageData;

    var transformed = false;

    scaleX = Number(scaleX);
    scaleY = Number(scaleY);

    if (this.ready && !this.disabled && this.options.scalable) {
      if (isNumber(scaleX)) {
        imageData.scaleX = scaleX;
        transformed = true;
      }

      if (isNumber(scaleY)) {
        imageData.scaleY = scaleY;
        transformed = true;
      }

      if (transformed) {
        this.renderCanvas(true, true);
      }
    }

    return this;
  },


  /**
   * Get the cropped area position and size data (base on the original image)
   * @param {boolean} [rounded=false] - Indicate if round the data values or not.
   * @returns {Object} The result cropped data.
   */
  getData: function getData$$1() {
    var rounded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var options = this.options,
        imageData = this.imageData,
        canvasData = this.canvasData,
        cropBoxData = this.cropBoxData;

    var data = void 0;

    if (this.ready && this.cropped) {
      data = {
        x: cropBoxData.left - canvasData.left,
        y: cropBoxData.top - canvasData.top,
        width: cropBoxData.width,
        height: cropBoxData.height
      };

      var ratio = imageData.width / imageData.naturalWidth;

      forEach(data, function (n, i) {
        data[i] = n / ratio;
      });

      if (rounded) {
        // In case rounding off leads to extra 1px in right or bottom border
        // we should round the top-left corner and the dimension (#343).
        var bottom = Math.round(data.y + data.height);
        var right = Math.round(data.x + data.width);

        data.x = Math.round(data.x);
        data.y = Math.round(data.y);
        data.width = right - data.x;
        data.height = bottom - data.y;
      }
    } else {
      data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }

    if (options.rotatable) {
      data.rotate = imageData.rotate || 0;
    }

    if (options.scalable) {
      data.scaleX = imageData.scaleX || 1;
      data.scaleY = imageData.scaleY || 1;
    }

    return data;
  },


  /**
   * Set the cropped area position and size with new data
   * @param {Object} data - The new data.
   * @returns {Cropper} this
   */
  setData: function setData$$1(data) {
    var options = this.options,
        imageData = this.imageData,
        canvasData = this.canvasData;

    var cropBoxData = {};

    if (this.ready && !this.disabled && isPlainObject(data)) {
      var transformed = false;

      if (options.rotatable) {
        if (isNumber(data.rotate) && data.rotate !== imageData.rotate) {
          imageData.rotate = data.rotate;
          transformed = true;
        }
      }

      if (options.scalable) {
        if (isNumber(data.scaleX) && data.scaleX !== imageData.scaleX) {
          imageData.scaleX = data.scaleX;
          transformed = true;
        }

        if (isNumber(data.scaleY) && data.scaleY !== imageData.scaleY) {
          imageData.scaleY = data.scaleY;
          transformed = true;
        }
      }

      if (transformed) {
        this.renderCanvas(true, true);
      }

      var ratio = imageData.width / imageData.naturalWidth;

      if (isNumber(data.x)) {
        cropBoxData.left = data.x * ratio + canvasData.left;
      }

      if (isNumber(data.y)) {
        cropBoxData.top = data.y * ratio + canvasData.top;
      }

      if (isNumber(data.width)) {
        cropBoxData.width = data.width * ratio;
      }

      if (isNumber(data.height)) {
        cropBoxData.height = data.height * ratio;
      }

      this.setCropBoxData(cropBoxData);
    }

    return this;
  },


  /**
   * Get the container size data.
   * @returns {Object} The result container data.
   */
  getContainerData: function getContainerData() {
    return this.ready ? assign({}, this.containerData) : {};
  },


  /**
   * Get the image position and size data.
   * @returns {Object} The result image data.
   */
  getImageData: function getImageData() {
    return this.sized ? assign({}, this.imageData) : {};
  },


  /**
   * Get the canvas position and size data.
   * @returns {Object} The result canvas data.
   */
  getCanvasData: function getCanvasData() {
    var canvasData = this.canvasData;

    var data = {};

    if (this.ready) {
      forEach(['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'], function (n) {
        data[n] = canvasData[n];
      });
    }

    return data;
  },


  /**
   * Set the canvas position and size with new data.
   * @param {Object} data - The new canvas data.
   * @returns {Cropper} this
   */
  setCanvasData: function setCanvasData(data) {
    var canvasData = this.canvasData;
    var aspectRatio = canvasData.aspectRatio;


    if (this.ready && !this.disabled && isPlainObject(data)) {
      if (isNumber(data.left)) {
        canvasData.left = data.left;
      }

      if (isNumber(data.top)) {
        canvasData.top = data.top;
      }

      if (isNumber(data.width)) {
        canvasData.width = data.width;
        canvasData.height = data.width / aspectRatio;
      } else if (isNumber(data.height)) {
        canvasData.height = data.height;
        canvasData.width = data.height * aspectRatio;
      }

      this.renderCanvas(true);
    }

    return this;
  },


  /**
   * Get the crop box position and size data.
   * @returns {Object} The result crop box data.
   */
  getCropBoxData: function getCropBoxData() {
    var cropBoxData = this.cropBoxData;

    var data = void 0;

    if (this.ready && this.cropped) {
      data = {
        left: cropBoxData.left,
        top: cropBoxData.top,
        width: cropBoxData.width,
        height: cropBoxData.height
      };
    }

    return data || {};
  },


  /**
   * Set the crop box position and size with new data.
   * @param {Object} data - The new crop box data.
   * @returns {Cropper} this
   */
  setCropBoxData: function setCropBoxData(data) {
    var cropBoxData = this.cropBoxData;
    var aspectRatio = this.options.aspectRatio;

    var widthChanged = void 0;
    var heightChanged = void 0;

    if (this.ready && this.cropped && !this.disabled && isPlainObject(data)) {
      if (isNumber(data.left)) {
        cropBoxData.left = data.left;
      }

      if (isNumber(data.top)) {
        cropBoxData.top = data.top;
      }

      if (isNumber(data.width) && data.width !== cropBoxData.width) {
        widthChanged = true;
        cropBoxData.width = data.width;
      }

      if (isNumber(data.height) && data.height !== cropBoxData.height) {
        heightChanged = true;
        cropBoxData.height = data.height;
      }

      if (aspectRatio) {
        if (widthChanged) {
          cropBoxData.height = cropBoxData.width / aspectRatio;
        } else if (heightChanged) {
          cropBoxData.width = cropBoxData.height * aspectRatio;
        }
      }

      this.renderCropBox();
    }

    return this;
  },


  /**
   * Get a canvas drawn the cropped image.
   * @param {Object} [options={}] - The config options.
   * @returns {HTMLCanvasElement} - The result canvas.
   */
  getCroppedCanvas: function getCroppedCanvas() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!this.ready || !window.HTMLCanvasElement) {
      return null;
    }

    var canvasData = this.canvasData;

    var source = getSourceCanvas(this.image, this.imageData, canvasData, options);

    // Returns the source canvas if it is not cropped.
    if (!this.cropped) {
      return source;
    }

    var _getData = this.getData(),
        initialX = _getData.x,
        initialY = _getData.y,
        initialWidth = _getData.width,
        initialHeight = _getData.height;

    var ratio = source.width / Math.floor(canvasData.naturalWidth);

    if (ratio !== 1) {
      initialX *= ratio;
      initialY *= ratio;
      initialWidth *= ratio;
      initialHeight *= ratio;
    }

    var aspectRatio = initialWidth / initialHeight;
    var maxSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: options.maxWidth || Infinity,
      height: options.maxHeight || Infinity
    });
    var minSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: options.minWidth || 0,
      height: options.minHeight || 0
    }, 'cover');

    var _getAdjustedSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: options.width || (ratio !== 1 ? source.width : initialWidth),
      height: options.height || (ratio !== 1 ? source.height : initialHeight)
    }),
        width = _getAdjustedSizes.width,
        height = _getAdjustedSizes.height;

    width = Math.min(maxSizes.width, Math.max(minSizes.width, width));
    height = Math.min(maxSizes.height, Math.max(minSizes.height, height));

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = normalizeDecimalNumber(width);
    canvas.height = normalizeDecimalNumber(height);

    context.fillStyle = options.fillColor || 'transparent';
    context.fillRect(0, 0, width, height);

    var _options$imageSmoothi = options.imageSmoothingEnabled,
        imageSmoothingEnabled = _options$imageSmoothi === undefined ? true : _options$imageSmoothi,
        imageSmoothingQuality = options.imageSmoothingQuality;


    context.imageSmoothingEnabled = imageSmoothingEnabled;

    if (imageSmoothingQuality) {
      context.imageSmoothingQuality = imageSmoothingQuality;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage
    var sourceWidth = source.width;
    var sourceHeight = source.height;

    // Source canvas parameters
    var srcX = initialX;
    var srcY = initialY;
    var srcWidth = void 0;
    var srcHeight = void 0;

    // Destination canvas parameters
    var dstX = void 0;
    var dstY = void 0;
    var dstWidth = void 0;
    var dstHeight = void 0;

    if (srcX <= -initialWidth || srcX > sourceWidth) {
      srcX = 0;
      srcWidth = 0;
      dstX = 0;
      dstWidth = 0;
    } else if (srcX <= 0) {
      dstX = -srcX;
      srcX = 0;
      srcWidth = Math.min(sourceWidth, initialWidth + srcX);
      dstWidth = srcWidth;
    } else if (srcX <= sourceWidth) {
      dstX = 0;
      srcWidth = Math.min(initialWidth, sourceWidth - srcX);
      dstWidth = srcWidth;
    }

    if (srcWidth <= 0 || srcY <= -initialHeight || srcY > sourceHeight) {
      srcY = 0;
      srcHeight = 0;
      dstY = 0;
      dstHeight = 0;
    } else if (srcY <= 0) {
      dstY = -srcY;
      srcY = 0;
      srcHeight = Math.min(sourceHeight, initialHeight + srcY);
      dstHeight = srcHeight;
    } else if (srcY <= sourceHeight) {
      dstY = 0;
      srcHeight = Math.min(initialHeight, sourceHeight - srcY);
      dstHeight = srcHeight;
    }

    var params = [srcX, srcY, srcWidth, srcHeight];

    // Avoid "IndexSizeError"
    if (dstWidth > 0 && dstHeight > 0) {
      var scale = width / initialWidth;

      params.push(dstX * scale, dstY * scale, dstWidth * scale, dstHeight * scale);
    }

    // All the numerical parameters should be integer for `drawImage`
    // https://github.com/fengyuanchen/cropper/issues/476
    context.drawImage.apply(context, [source].concat(toConsumableArray(params.map(function (param) {
      return Math.floor(normalizeDecimalNumber(param));
    }))));

    return canvas;
  },


  /**
   * Change the aspect ratio of the crop box.
   * @param {number} aspectRatio - The new aspect ratio.
   * @returns {Cropper} this
   */
  setAspectRatio: function setAspectRatio(aspectRatio) {
    var options = this.options;


    if (!this.disabled && !isUndefined(aspectRatio)) {
      // 0 -> NaN
      options.aspectRatio = Math.max(0, aspectRatio) || NaN;

      if (this.ready) {
        this.initCropBox();

        if (this.cropped) {
          this.renderCropBox();
        }
      }
    }

    return this;
  },


  /**
   * Change the drag mode.
   * @param {string} mode - The new drag mode.
   * @returns {Cropper} this
   */
  setDragMode: function setDragMode(mode) {
    var options = this.options,
        dragBox = this.dragBox,
        face = this.face;


    if (this.ready && !this.disabled) {
      var croppable = mode === DRAG_MODE_CROP;
      var movable = options.movable && mode === DRAG_MODE_MOVE;

      mode = croppable || movable ? mode : DRAG_MODE_NONE;

      options.dragMode = mode;
      setData(dragBox, DATA_ACTION, mode);
      toggleClass(dragBox, CLASS_CROP, croppable);
      toggleClass(dragBox, CLASS_MOVE, movable);

      if (!options.cropBoxMovable) {
        // Sync drag mode to crop box when it is not movable
        setData(face, DATA_ACTION, mode);
        toggleClass(face, CLASS_CROP, croppable);
        toggleClass(face, CLASS_MOVE, movable);
      }
    }

    return this;
  }
};

var AnotherCropper = WINDOW.Cropper;

var Cropper = function () {
  /**
   * Create a new Cropper.
   * @param {Element} element - The target element for cropping.
   * @param {Object} [options={}] - The configuration options.
   */
  function Cropper(element) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, Cropper);

    if (!element || !REGEXP_TAG_NAME.test(element.tagName)) {
      throw new Error('The first argument is required and must be an <img> or <canvas> element.');
    }

    this.element = element;
    this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
    this.cropped = false;
    this.disabled = false;
    this.pointers = {};
    this.ready = false;
    this.reloading = false;
    this.replaced = false;
    this.sized = false;
    this.sizing = false;
    this.init();
  }

  createClass(Cropper, [{
    key: 'init',
    value: function init() {
      var element = this.element;

      var tagName = element.tagName.toLowerCase();
      var url = void 0;

      if (getData(element, NAMESPACE)) {
        return;
      }

      setData(element, NAMESPACE, this);

      if (tagName === 'img') {
        this.isImg = true;

        // e.g.: "img/picture.jpg"
        url = element.getAttribute('src') || '';
        this.originalUrl = url;

        // Stop when it's a blank image
        if (!url) {
          return;
        }

        // e.g.: "http://example.com/img/picture.jpg"
        url = element.src;
      } else if (tagName === 'canvas' && window.HTMLCanvasElement) {
        url = element.toDataURL();
      }

      this.load(url);
    }
  }, {
    key: 'load',
    value: function load(url) {
      var _this = this;

      if (!url) {
        return;
      }

      this.url = url;
      this.imageData = {};

      var element = this.element,
          options = this.options;


      if (!options.rotatable && !options.scalable) {
        options.checkOrientation = false;
      }

      if (!options.checkOrientation || !window.ArrayBuffer) {
        this.clone();
        return;
      }

      // XMLHttpRequest disallows to open a Data URL in some browsers like IE11 and Safari
      if (REGEXP_DATA_URL.test(url)) {
        if (REGEXP_DATA_URL_JPEG.test(url)) {
          this.read(dataURLToArrayBuffer(url));
        } else {
          this.clone();
        }

        return;
      }

      var xhr = new XMLHttpRequest();

      this.reloading = true;
      this.xhr = xhr;

      var done = function done() {
        _this.reloading = false;
        _this.xhr = null;
      };

      xhr.ontimeout = done;
      xhr.onabort = done;
      xhr.onerror = function () {
        done();
        _this.clone();
      };

      xhr.onload = function () {
        done();
        _this.read(xhr.response);
      };

      // Bust cache when there is a "crossOrigin" property
      if (options.checkCrossOrigin && isCrossOriginURL(url) && element.crossOrigin) {
        url = addTimestamp(url);
      }

      xhr.open('get', url);
      xhr.responseType = 'arraybuffer';
      xhr.withCredentials = element.crossOrigin === 'use-credentials';
      xhr.send();
    }
  }, {
    key: 'read',
    value: function read(arrayBuffer) {
      var options = this.options,
          imageData = this.imageData;

      var orientation = getOrientation(arrayBuffer);
      var rotate = 0;
      var scaleX = 1;
      var scaleY = 1;

      if (orientation > 1) {
        this.url = arrayBufferToDataURL(arrayBuffer, 'image/jpeg');

        var _parseOrientation = parseOrientation(orientation);

        rotate = _parseOrientation.rotate;
        scaleX = _parseOrientation.scaleX;
        scaleY = _parseOrientation.scaleY;
      }

      if (options.rotatable) {
        imageData.rotate = rotate;
      }

      if (options.scalable) {
        imageData.scaleX = scaleX;
        imageData.scaleY = scaleY;
      }

      this.clone();
    }
  }, {
    key: 'clone',
    value: function clone() {
      var element = this.element,
          url = this.url;

      var crossOrigin = void 0;
      var crossOriginUrl = void 0;

      if (this.options.checkCrossOrigin && isCrossOriginURL(url)) {
        crossOrigin = element.crossOrigin;


        if (crossOrigin) {
          crossOriginUrl = url;
        } else {
          crossOrigin = 'anonymous';

          // Bust cache when there is not a "crossOrigin" property
          crossOriginUrl = addTimestamp(url);
        }
      }

      this.crossOrigin = crossOrigin;
      this.crossOriginUrl = crossOriginUrl;

      var image = document.createElement('img');

      if (crossOrigin) {
        image.crossOrigin = crossOrigin;
      }

      image.src = crossOriginUrl || url;
      this.image = image;
      image.onload = this.start.bind(this);
      image.onerror = this.stop.bind(this);
      addClass(image, CLASS_HIDE);
      element.parentNode.insertBefore(image, element.nextSibling);
    }
  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      var image = this.isImg ? this.element : this.image;

      image.onload = null;
      image.onerror = null;
      this.sizing = true;

      var IS_SAFARI = WINDOW.navigator && /(Macintosh|iPhone|iPod|iPad).*AppleWebKit/i.test(WINDOW.navigator.userAgent);
      var done = function done(naturalWidth, naturalHeight) {
        assign(_this2.imageData, {
          naturalWidth: naturalWidth,
          naturalHeight: naturalHeight,
          aspectRatio: naturalWidth / naturalHeight
        });
        _this2.sizing = false;
        _this2.sized = true;
        _this2.build();
      };

      // Modern browsers (except Safari)
      if (image.naturalWidth && !IS_SAFARI) {
        done(image.naturalWidth, image.naturalHeight);
        return;
      }

      var sizingImage = document.createElement('img');
      var body = document.body || document.documentElement;

      this.sizingImage = sizingImage;

      sizingImage.onload = function () {
        done(sizingImage.width, sizingImage.height);

        if (!IS_SAFARI) {
          body.removeChild(sizingImage);
        }
      };

      sizingImage.src = image.src;

      // iOS Safari will convert the image automatically
      // with its orientation once append it into DOM (#279)
      if (!IS_SAFARI) {
        sizingImage.style.cssText = 'left:0;' + 'max-height:none!important;' + 'max-width:none!important;' + 'min-height:0!important;' + 'min-width:0!important;' + 'opacity:0;' + 'position:absolute;' + 'top:0;' + 'z-index:-1;';
        body.appendChild(sizingImage);
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      var image = this.image;


      image.onload = null;
      image.onerror = null;
      image.parentNode.removeChild(image);
      this.image = null;
    }
  }, {
    key: 'build',
    value: function build() {
      if (!this.sized || this.ready) {
        return;
      }

      var element = this.element,
          options = this.options,
          image = this.image;

      // Create cropper elements

      var container = element.parentNode;
      var template = document.createElement('div');

      template.innerHTML = TEMPLATE;

      var cropper = template.querySelector('.' + NAMESPACE + '-container');
      var canvas = cropper.querySelector('.' + NAMESPACE + '-canvas');
      var dragBox = cropper.querySelector('.' + NAMESPACE + '-drag-box');
      var cropBox = cropper.querySelector('.' + NAMESPACE + '-crop-box');
      var face = cropBox.querySelector('.' + NAMESPACE + '-face');

      this.container = container;
      this.cropper = cropper;
      this.canvas = canvas;
      this.dragBox = dragBox;
      this.cropBox = cropBox;
      this.viewBox = cropper.querySelector('.' + NAMESPACE + '-view-box');
      this.face = face;

      canvas.appendChild(image);

      // Hide the original image
      addClass(element, CLASS_HIDDEN);

      // Inserts the cropper after to the current image
      container.insertBefore(cropper, element.nextSibling);

      // Show the image if is hidden
      if (!this.isImg) {
        removeClass(image, CLASS_HIDE);
      }

      this.initPreview();
      this.bind();

      options.initialAspectRatio = Math.max(0, options.initialAspectRatio) || NaN;
      options.aspectRatio = Math.max(0, options.aspectRatio) || NaN;
      options.viewMode = Math.max(0, Math.min(3, Math.round(options.viewMode))) || 0;

      addClass(cropBox, CLASS_HIDDEN);

      if (!options.guides) {
        addClass(cropBox.getElementsByClassName(NAMESPACE + '-dashed'), CLASS_HIDDEN);
      }

      if (!options.center) {
        addClass(cropBox.getElementsByClassName(NAMESPACE + '-center'), CLASS_HIDDEN);
      }

      if (options.background) {
        addClass(cropper, NAMESPACE + '-bg');
      }

      if (!options.highlight) {
        addClass(face, CLASS_INVISIBLE);
      }

      if (options.cropBoxMovable) {
        addClass(face, CLASS_MOVE);
        setData(face, DATA_ACTION, ACTION_ALL);
      }

      if (!options.cropBoxResizable) {
        addClass(cropBox.getElementsByClassName(NAMESPACE + '-line'), CLASS_HIDDEN);
        addClass(cropBox.getElementsByClassName(NAMESPACE + '-point'), CLASS_HIDDEN);
      }

      this.render();
      this.ready = true;
      this.setDragMode(options.dragMode);

      if (options.autoCrop) {
        this.crop();
      }

      this.setData(options.data);

      if (isFunction(options.ready)) {
        addListener(element, EVENT_READY, options.ready, {
          once: true
        });
      }

      dispatchEvent(element, EVENT_READY);
    }
  }, {
    key: 'unbuild',
    value: function unbuild() {
      if (!this.ready) {
        return;
      }

      this.ready = false;
      this.unbind();
      this.resetPreview();
      this.cropper.parentNode.removeChild(this.cropper);
      removeClass(this.element, CLASS_HIDDEN);
    }
  }, {
    key: 'uncreate',
    value: function uncreate() {
      if (this.ready) {
        this.unbuild();
        this.ready = false;
        this.cropped = false;
      } else if (this.sizing) {
        this.sizingImage.onload = null;
        this.sizing = false;
        this.sized = false;
      } else if (this.reloading) {
        this.xhr.abort();
      } else if (this.image) {
        this.stop();
      }
    }

    /**
     * Get the no conflict cropper class.
     * @returns {Cropper} The cropper class.
     */

  }], [{
    key: 'noConflict',
    value: function noConflict() {
      window.Cropper = AnotherCropper;
      return Cropper;
    }

    /**
     * Change the default options.
     * @param {Object} options - The new default options.
     */

  }, {
    key: 'setDefaults',
    value: function setDefaults(options) {
      assign(DEFAULTS, isPlainObject(options) && options);
    }
  }]);
  return Cropper;
}();

assign(Cropper.prototype, render, preview, events, handlers, change, methods);

/* harmony default export */ __webpack_exports__["a"] = (Cropper);


/***/ }),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return mixError; });
var mixError = {
  data: function data() {

    return {

      error: {
        status: false,
        success: false,
        libel: ''
      }

    };
  },


  methods: {
    setError: function setError(error) {

      console.error('ERROR ::: ', error.response);

      if (!error || !error.response) return;

      var libel = false;

      if (error.response.status === 404 || error.response.status === 500) libel = 'Error System';

      if (error.response.status === 403) libel = 'You need to be logegd in';

      if (!libel && typeof error.response.data.errors === 'undefined') {

        if (typeof error.response.data.error !== 'undefined') libel = 'Error ' + error.response.data.error;else libel = 'Undefined Error';
      }

      if (!libel) {

        var k = 0;

        for (k in error.response.data.errors) {
          break;
        }libel = error.response.data.errors[k][0];
      }

      this.setLibel(libel);
    },
    setLibel: function setLibel(libel) {

      this.error.status = true;
      //state.error.success = true
      this.error.libel = libel;
    }
  }
};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(224)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(226)
/* template */
var __vue_template__ = __webpack_require__(228)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/blobMedia.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-351b8293", Component.options)
  } else {
    hotAPI.reload("data-v-351b8293", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(151);


/***/ }),
/* 151 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vuex__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__store_modules_form__ = __webpack_require__(235);
__webpack_require__(152);

__webpack_require__(154);

Vue.component('error', __webpack_require__(156));
Vue.component('vv-switch', __webpack_require__(161));
Vue.component('vv-switches', __webpack_require__(164));
Vue.component('vv-textarea', __webpack_require__(169));
Vue.component('vv-select-label', __webpack_require__(172));
Vue.component('vv-input', __webpack_require__(177));
Vue.component('vv-gender', __webpack_require__(182));
Vue.component('vv-dob', __webpack_require__(185));
Vue.component('vv-date-year-month', __webpack_require__(188));
Vue.component('vv-captcha', __webpack_require__(191));
Vue.component('vv-tag', __webpack_require__(194));
Vue.component('vv-checkbox', __webpack_require__(208));
Vue.component('vs-form', __webpack_require__(211));

Vue.component('vs-upload', __webpack_require__(216));

Vue.component('vs-upload-simple', __webpack_require__(230));



Vue.use(__WEBPACK_IMPORTED_MODULE_0_vuex__["a" /* default */]);



window.store = new __WEBPACK_IMPORTED_MODULE_0_vuex__["a" /* default */].Store({

	modules: {

		form: __WEBPACK_IMPORTED_MODULE_1__store_modules_form__["a" /* default */]
	},

	state: {},

	getters: {},

	actions: {},

	mutations: {}
});

/*
const vm = new Vue({
	el: '#app',
    store
})
*/

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(153);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./form.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./form.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "/*\n||\n|| BUG CHROME\n||\n*/\ninput:-webkit-autofill {\n  -webkit-box-shadow: inset 0 0 0px 9999px white !important; }\n\n/*\n||\n|| INPUT\n||\n*/\n.c-input-group {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -ms-flex: 1 1;\n  flex: 1 1;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  min-width: 24px;\n  padding: 18px 0 0;\n  position: relative;\n  width: 100%;\n  outline: none;\n  transition: box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);\n  font-family: inherit; }\n\n.c-input-group input {\n  width: 100%;\n  font-family: inherit !important;\n  font-size: 20px !important;\n  font-weight: 400 !important; }\n\n.c-input-group input:focus {\n  outline: none; }\n\n.c-input-group--text-field input {\n  box-shadow: none;\n  -webkit-box-flex: 1;\n  -ms-flex: 1;\n  flex: 1;\n  height: 30px;\n  margin: 0;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap; }\n\n.c-input-group label {\n  display: inline-block;\n  font-size: 20px;\n  line-height: 30px;\n  height: 30px;\n  max-width: 90%;\n  min-width: 0;\n  overflow: hidden;\n  pointer-events: none;\n  text-align: left;\n  text-overflow: ellipsis;\n  -webkit-transform-origin: top left;\n  transform-origin: top left;\n  transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);\n  white-space: nowrap;\n  width: 100%;\n  z-index: 0; }\n\n.c-input-group--text-field label {\n  position: absolute;\n  top: 18px;\n  left: 0; }\n\n.c-input-group--text-field.c-input-group--prepend-icon label {\n  left: 40px; }\n\n.c-input-group__input {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -ms-flex: 1 0 100%;\n  flex: 1 0 100%;\n  min-width: 0;\n  min-height: 30px; }\n\n.c-input-group__icon-cb {\n  cursor: pointer; }\n\n.c-input-group.c-input-group--error .c-input-group__append-icon,\n.c-input-group.c-input-group--error .c-input-group__prepend-icon,\n.c-input-group.c-input-group--focused .c-input-group__append-icon,\n.c-input-group.c-input-group--focused .c-input-group__prepend-icon {\n  color: inherit; }\n\n.c-input-group.c-input-group--append-icon label,\n.c-input-group.c-input-group--prepend-icon label,\n.c-input-group.c-input-group--selection-controls label {\n  max-width: 75%; }\n\n.c-input-group.c-input-group--append-icon.c-input-group--prepend-icon label {\n  max-width: 65%; }\n\n.c-input-group .c-input-group__append-icon {\n  padding: 0 6px; }\n\n.c-input-group .c-input-group__append-icon,\n.c-input-group .c-input-group__prepend-icon {\n  -ms-flex-item-align: center;\n  align-self: center;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none; }\n\n.c-input-group--text-field.c-input-group--prepend-icon .c-input-group__prepend-icon {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  min-width: 40px; }\n\n.c-input-group.c-input-group--single-line.c-input-group--dirty label,\n.c-input-group.c-input-group--solo.c-input-group--dirty label {\n  display: none; }\n\n.c-input-group.c-input-group--solo {\n  min-height: 46px;\n  border-radius: 2px;\n  padding: 0;\n  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);\n  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12); }\n\n.c-input-group.c-input-group--solo label {\n  top: 8px;\n  padding-left: 16px;\n  -webkit-transform: none !important;\n  transform: none !important; }\n\n.c-input-group.c-input-group--solo .c-input-group__input {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  padding: 8px 16px; }\n\n.c-input-group.c-input-group--solo .c-input-group__details {\n  display: none; }\n\n.c-input-group--disabled {\n  pointer-events: none; }\n\n.c-input-group--disabled .c-input-group__details:before {\n  background-color: transparent;\n  background-position: bottom;\n  background-size: 3px 1px;\n  background-repeat: repeat-x; }\n\n.c-input-group.c-input-group--text-field:not(.c-input-group--single-line):not(.c-input-group--error).c-input-group--focused label {\n  color: inherit; }\n\n.c-input-group.c-input-group--text-field:not(.c-input-group--single-line):not(.c-input-group--error).c-input-group--focused .c-input-group__input {\n  border-color: inherit; }\n\n.c-input-group.c-input-group--text-field {\n  border-color: inherit; }\n\n.c-input-group.c-input-group--text-field.c-input-group--focused:not(.c-input-group--disabled) .c-input-group__details:after {\n  -webkit-transform: scaleX(1);\n  transform: scaleX(1); }\n\n.c-input-group--required label:after {\n  content: \"*\"; }\n\n.c-input-group.c-input-group--error label {\n  -webkit-animation: a 0.6s cubic-bezier(0.25, 0.8, 0.5, 1);\n  animation: a 0.6s cubic-bezier(0.25, 0.8, 0.5, 1); }\n\n.c-input-group.c-input-group--error .c-input-group__messages {\n  color: inherit; }\n\n.c-input-group.c-input-group--error .c-input-group__details:before {\n  background-color: currentColor; }\n\n.c-input-group .slide-y-transition-leave, .c-input-group .slide-y-transition-leave-to {\n  position: absolute; }\n\n.c-input-group__details {\n  color: inherit;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding-top: 4px;\n  -webkit-box-flex: 1;\n  -ms-flex: 1 0 100%;\n  flex: 1 0 100%;\n  font-size: 14px;\n  min-height: 26px;\n  overflow: hidden;\n  position: relative;\n  width: 100%; }\n\n.c-input-group__details:after,\n.c-input-group__details:before {\n  content: \"\";\n  position: absolute;\n  left: 0;\n  background-color: red;\n  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }\n\n.c-input-group__details:after {\n  /*EFFECT WITH FOCUS !!! */\n  background-color: currentColor;\n  background-color: #209cee;\n  /*info*/\n  background-color: #3273dc;\n  /*link*/\n  color: inherit;\n  top: 0;\n  height: 2px;\n  -webkit-transform: scaleX(0);\n  transform: scaleX(0);\n  -webkit-transform-origin: center center 0;\n  transform-origin: center center 0;\n  width: 100%;\n  z-index: 1; }\n\n.c-input-group--error .c-input-group__details:after {\n  /*EFFECT WITH FOCUS !!! ERROR*/\n  background-color: #ff3860;\n  /*info*/ }\n\n.c-input-group__details:before {\n  top: 0;\n  height: 1px;\n  width: 100%;\n  z-index: 0; }\n\n.c-input-group:not(.c-input-group--error) .c-input-group__details:before {\n  /* THIS IS THE BAR !!!!!!! */\n  background-color: rgba(0, 0, 0, 0.42); }\n\n.c-input-group--hide-details .c-input-group__details {\n  min-height: 2px;\n  padding: 0; }\n\n.c-input-group--async-loading .c-input-group__details:after,\n.c-input-group--async-loading .c-input-group__details:before {\n  display: none; }\n\n.c-input-group .progress-linear {\n  position: absolute;\n  top: 0;\n  left: 0;\n  margin: 0; }\n\n.c-input-group__error,\n.c-input-group__hint {\n  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }\n\n.c-input-group__error {\n  color: inherit; }\n\n.c-input-group--editable.c-input-group--active,\n.c-input-group--overflow.c-input-group--active,\n.c-input-group--segmented.c-input-group--active {\n  background-color: #fff; }\n\n.c-input-group--text-field.c-input-group--prepend-icon .c-input-group__details {\n  margin-left: auto;\n  max-width: calc(100% - 40px); }\n\n.c-input-group--text-field .c-input-group__counter {\n  margin-left: auto;\n  white-space: nowrap; }\n\n/*focused*/\n.c-input-group--text-field:not(.c-input-group--single-line).c-input-group--focused:not(.c-input-group--textarea) label,\n.input-group--text-field:not(.input-group--single-line).input-group--placeholder:not(.input-group--textarea) label {\n  -webkit-transform: translateY(-18px) scale(0.75);\n  transform: translateY(-18px) scale(0.75); }\n\n/* color */\n.c-input-group--text-field:not(.c-input-group--error) .c-input-group__counter {\n  color: rgba(0, 0, 0, 0.54); }\n\n/*SPECIAL*/\n.c-input--email {\n  margin-bottom: 40px !important; }\n\n/*\n||\n|| SELECT\n||\n*/\n.c-v-select {\n  position: relative;\n  font-family: inherit;\n  height: 34px;\n  widthxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx: 200px; }\n\n.c-v-select,\n.c-v-select * {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\n/* Rtl support */\n.c-v-select.rtl .open-indicator {\n  left: 10px;\n  right: auto; }\n\n.c-v-select.rtl .selected-tag {\n  float: right;\n  margin-right: 3px;\n  margin-left: 1px; }\n\n.c-v-select.rtl .cvdropdown-menu {\n  text-align: right; }\n\n.c-v-select.rtl .cvdropdown-toggle .clear {\n  left: 30px;\n  right: auto; }\n\n/* Open Indicator */\n.c-v-select .open-indicator {\n  position: absolute;\n  bottom: 6px;\n  bottom: 3px;\n  right: 10px;\n  display: inline-block;\n  cursor: pointer;\n  pointer-events: all;\n  transition: all 150ms cubic-bezier(1, -0.115, 0.975, 0.855);\n  transition-timing-function: cubic-bezier(1, -0.115, 0.975, 0.855);\n  opacity: 1;\n  height: 20px;\n  width: 10px; }\n\n.c-v-select .open-indicator:before {\n  border-color: #3c3c3c;\n  border-style: solid;\n  border-width: 1px 1px 0 0;\n  content: '';\n  display: inline-block;\n  height: 10px;\n  width: 10px;\n  vertical-align: top;\n  transform: rotate(133deg);\n  transition: all 150ms cubic-bezier(1, -0.115, 0.975, 0.855);\n  transition-timing-function: cubic-bezier(1, -0.115, 0.975, 0.855);\n  box-sizing: inherit; }\n\n/* Open Indicator States */\n.c-v-select.open .open-indicator:before {\n  transform: rotate(315deg); }\n\n.c-v-select.loading .open-indicator {\n  opacity: 0; }\n\n.c-v-select.open .open-indicator {\n  bottom: 1px;\n  bottom: 1px; }\n\n/* cvdropdown Toggle */\n.c-v-select .cvdropdown-toggle {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  display: block;\n  padding: 0;\n  background: none;\n  border: 1px solid rgba(60, 60, 60, 0.26);\n  border: 1px solid #b5b5b5;\n  border-radius: 0px;\n  white-space: normal; }\n\n.c-v-select .cvdropdown-toggle.has-select-error {\n  border: 1px solid #ff3860; }\n\n.c-v-select .cvdropdown-toggle:after {\n  visibility: hidden;\n  display: block;\n  font-size: 0;\n  content: \" \";\n  clear: both;\n  height: 0; }\n\n/* Clear Button */\n.c-v-select .cvdropdown-toggle .clear {\n  position: absolute;\n  bottom: 9px;\n  bottom: 6px;\n  right: 30px;\n  font-size: 23px;\n  font-weight: 700;\n  line-height: 1;\n  color: rgba(60, 60, 60, 0.5);\n  padding: 0;\n  border: 0;\n  background-color: transparent;\n  cursor: pointer; }\n\n/* cvdropdown Toggle States */\n.c-v-select.searchable .cvdropdown-toggle {\n  cursor: text; }\n\n.c-v-select.unsearchable .cvdropdown-toggle {\n  cursor: pointer; }\n\n.c-v-select.open .cvdropdown-toggle {\n  border-bottom-color: transparent;\n  border-bottom-left-radius: 0;\n  border-bottom-right-radius: 0; }\n\n/* cvdropdown Menu */\n.c-v-select .cvdropdown-menu {\n  display: block;\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 0;\n  width: 100%;\n  overflow-y: scroll;\n  border: 1px solid rgba(0, 0, 0, 0.26);\n  box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.15);\n  border-top: none;\n  border-radius: 0 0 4px 4px;\n  text-align: left;\n  list-style: none;\n  background: #fff; }\n\n.c-v-select .no-options {\n  text-align: center; }\n\n/* Selected Tags */\n.c-v-select .selected-tag {\n  color: #333;\n  background-color: #f0f0f0;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  height: 26px;\n  margin: 4px 1px 0px 3px;\n  padding: 1px 0.25em;\n  float: left;\n  line-height: 24px; }\n\n.c-v-select.single .selected-tag {\n  background-color: transparent;\n  border-color: transparent; }\n\n.c-v-select.single.open .selected-tag {\n  position: absolute;\n  opacity: .5; }\n\n.c-v-select.single.open.searching .selected-tag,\n.c-v-select.single.loading .selected-tag {\n  display: none; }\n\n.c-v-select .selected-tag .close {\n  float: none;\n  margin-right: 0;\n  font-size: 20px;\n  appearance: none;\n  padding: 0;\n  cursor: pointer;\n  background: 0 0;\n  border: 0;\n  font-weight: 700;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  filter: alpha(opacity=20);\n  opacity: .2; }\n\n.c-v-select.single.searching:not(.open):not(.loading) input[type=\"search\"] {\n  opacity: .2; }\n\n/* Search Input */\n.c-v-select input[type=\"search\"]::-webkit-search-decoration,\n.c-v-select input[type=\"search\"]::-webkit-search-cancel-button,\n.c-v-select input[type=\"search\"]::-webkit-search-results-button,\n.c-v-select input[type=\"search\"]::-webkit-search-results-decoration {\n  display: none; }\n\n.c-v-select input[type=\"search\"]::-ms-clear {\n  display: none; }\n\n.c-v-select input[type=\"search\"],\n.c-v-select input[type=\"search\"]:focus {\n  appearance: none;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  line-height: 1.42857143;\n  font-size: 1em;\n  height: 36px;\n  display: inline-block;\n  border: none;\n  outline: none;\n  margin: 0;\n  padding: 0 .5em;\n  width: 10em;\n  max-width: 100%;\n  background: none;\n  position: relative;\n  box-shadow: none; }\n\n.c-v-select.unsearchable input[type=\"search\"] {\n  opacity: 0; }\n\n.c-v-select.unsearchable input[type=\"search\"]:hover {\n  cursor: pointer; }\n\n/* List Items */\n.c-v-select li {\n  line-height: 1.42857143;\n  /* Normalize line height */ }\n\n.c-v-select li > a {\n  display: block;\n  padding: 3px 20px;\n  clear: both;\n  color: #333;\n  /* Overrides most CSS frameworks */\n  white-space: nowrap; }\n\n.c-v-select li:hover {\n  cursor: pointer; }\n\n.c-v-select .cvdropdown-menu .active > a {\n  color: #333;\n  background: rgba(50, 50, 50, 0.1); }\n\n.c-v-select .cvdropdown-menu > .highlight > a {\n  /*\n     * required to override bootstrap 3's\n     * .cvdropdown-menu > li > a:hover {} styles\n     */\n  background: #5897fb;\n  color: #fff; }\n\n.c-v-select .highlight:not(:last-child) {\n  margin-bottom: 0;\n  /* Fixes Bulma Margin */ }\n\n/* Loading Spinner */\n.c-v-select .spinner {\n  opacity: 0;\n  position: absolute;\n  top: 5px;\n  right: 10px;\n  font-size: 5px;\n  text-indent: -9999em;\n  overflow: hidden;\n  border-top: 0.9em solid rgba(100, 100, 100, 0.1);\n  border-right: 0.9em solid rgba(100, 100, 100, 0.1);\n  border-bottom: 0.9em solid rgba(100, 100, 100, 0.1);\n  border-left: 0.9em solid rgba(60, 60, 60, 0.45);\n  transform: translateZ(0);\n  animation: vSelectSpinner 1.1s infinite linear;\n  transition: opacity .1s; }\n\n.c-v-select .spinner,\n.c-v-select .spinner:after {\n  border-radius: 50%;\n  width: 5em;\n  height: 5em; }\n\n/* Disabled state */\n.c-v-select.disabled .cvdropdown-toggle,\n.c-v-select.disabled .cvdropdown-toggle .clear,\n.c-v-select.disabled .cvdropdown-toggle input,\n.c-v-select.disabled .selected-tag .close,\n.c-v-select.disabled .open-indicator {\n  cursor: not-allowed;\n  background-color: #f8f8f8; }\n\n/* Loading Spinner States */\n.c-v-select.loading .spinner {\n  opacity: 1; }\n\n/* KeyFrames */\n@-webkit-keyframes vSelectSpinner {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n@keyframes vSelectSpinner {\n  0% {\n    transform: rotate(0deg); }\n  100% {\n    transform: rotate(360deg); } }\n\n/* cvdropdown Default Transition */\n.fade-enter-active,\n.fade-leave-active {\n  transition: opacity 0.15s cubic-bezier(1, 0.5, 0.8, 1); }\n\n.fade-enter,\n.fade-leave-to {\n  opacity: 0; }\n\n/*\n||\n|| CAPTCHA\n||\n*/\n.v-c-captcha-wrapper {\n  border: 0px solid green;\n  margin: 0;\n  heightxxxx: 38px;\n  display: flex;\n  justify-content: space-between; }\n\n.v-c-captcha-wrapper .field,\n.v-c-captcha-wrapper .button,\n.v-c-captcha-wrapper input {\n  height: 38px; }\n\n.v-c-captcha-wrapper input {\n  width: 50%; }\n\n.captcha img {\n  height: 100%; }\n\n/*\n||\n|| TEXTAREA\n||\n*/\ndiv.hidden-textarea {\n  visibility: hidden;\n  position: absolute;\n  top: -10000px;\n  display: block;\n  white-space: pre-line; }\n\ntextarea.custom-textarea,\ndiv.hidden-textarea {\n  resize: none !important;\n  overflow: hidden;\n  border: 1px solid #E6ECF0;\n  border: 1px solid #ced4da;\n  border-radius: 0;\n  min-height: 2.8em !important;\n  padding: 0.60em 0.6em;\n  font-family: inherit !important;\n  font-family: Oxygen Mono !important;\n  font-size: 0.8rem !important;\n  letter-spacing: 0px;\n  box-shadow: 0 0 0 0em rgba(50, 115, 220, 0);\n  overflow-wrap: break-word;\n  width: 100%; }\n\n/*\n||\n|| INPUT\n||\n*/\ninput {\n  background-color: transparent;\n  border-style: none; }\n\n::-webkit-input-placeholder {\n  /* Chrome/Opera/Safari */\n  color: pink;\n  font-family: 'Yanone Kaffeesatz'; }\n\n::-moz-placeholder {\n  /* Firefox 19+ */\n  color: pink !important;\n  font-family: 'Yanone Kaffeesatz' !important; }\n\n:-ms-input-placeholder {\n  /* IE 10+ */\n  color: pink;\n  font-family: 'Yanone Kaffeesatz'; }\n\n:-moz-placeholder {\n  /* Firefox 18- */\n  color: pink;\n  font-family: 'Yanone Kaffeesatz'; }\n", ""]);

// exports


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(155);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(5)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../css-loader/index.js!./cropper.min.css", function() {
			var newContent = require("!!../../css-loader/index.js!./cropper.min.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "/*!\n * Cropper.js v1.4.0\n * https://fengyuanchen.github.io/cropperjs\n *\n * Copyright 2015-present Chen Fengyuan\n * Released under the MIT license\n *\n * Date: 2018-06-01T15:18:09.891Z\n */.cropper-container{direction:ltr;font-size:0;line-height:0;position:relative;-ms-touch-action:none;touch-action:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.cropper-container img{display:block;height:100%;image-orientation:0deg;max-height:none!important;max-width:none!important;min-height:0!important;min-width:0!important;width:100%}.cropper-canvas,.cropper-crop-box,.cropper-drag-box,.cropper-modal,.cropper-wrap-box{bottom:0;left:0;position:absolute;right:0;top:0}.cropper-canvas,.cropper-wrap-box{overflow:hidden}.cropper-drag-box{background-color:#fff;opacity:0}.cropper-modal{background-color:#000;opacity:.5}.cropper-view-box{display:block;height:100%;outline-color:rgba(51,153,255,.75);outline:1px solid #39f;overflow:hidden;width:100%}.cropper-dashed{border:0 dashed #eee;display:block;opacity:.5;position:absolute}.cropper-dashed.dashed-h{border-bottom-width:1px;border-top-width:1px;height:33.33333%;left:0;top:33.33333%;width:100%}.cropper-dashed.dashed-v{border-left-width:1px;border-right-width:1px;height:100%;left:33.33333%;top:0;width:33.33333%}.cropper-center{display:block;height:0;left:50%;opacity:.75;position:absolute;top:50%;width:0}.cropper-center:after,.cropper-center:before{background-color:#eee;content:\" \";display:block;position:absolute}.cropper-center:before{height:1px;left:-3px;top:0;width:7px}.cropper-center:after{height:7px;left:0;top:-3px;width:1px}.cropper-face,.cropper-line,.cropper-point{display:block;height:100%;opacity:.1;position:absolute;width:100%}.cropper-face{background-color:#fff;left:0;top:0}.cropper-line{background-color:#39f}.cropper-line.line-e{cursor:ew-resize;right:-3px;top:0;width:5px}.cropper-line.line-n{cursor:ns-resize;height:5px;left:0;top:-3px}.cropper-line.line-w{cursor:ew-resize;left:-3px;top:0;width:5px}.cropper-line.line-s{bottom:-3px;cursor:ns-resize;height:5px;left:0}.cropper-point{background-color:#39f;height:5px;opacity:.75;width:5px}.cropper-point.point-e{cursor:ew-resize;margin-top:-3px;right:-3px;top:50%}.cropper-point.point-n{cursor:ns-resize;left:50%;margin-left:-3px;top:-3px}.cropper-point.point-w{cursor:ew-resize;left:-3px;margin-top:-3px;top:50%}.cropper-point.point-s{bottom:-3px;cursor:s-resize;left:50%;margin-left:-3px}.cropper-point.point-ne{cursor:nesw-resize;right:-3px;top:-3px}.cropper-point.point-nw{cursor:nwse-resize;left:-3px;top:-3px}.cropper-point.point-sw{bottom:-3px;cursor:nesw-resize;left:-3px}.cropper-point.point-se{bottom:-3px;cursor:nwse-resize;height:20px;opacity:1;right:-3px;width:20px}@media (min-width:768px){.cropper-point.point-se{height:15px;width:15px}}@media (min-width:992px){.cropper-point.point-se{height:10px;width:10px}}@media (min-width:1200px){.cropper-point.point-se{height:5px;opacity:.75;width:5px}}.cropper-point.point-se:before{background-color:#39f;bottom:-50%;content:\" \";display:block;height:200%;opacity:0;position:absolute;right:-50%;width:200%}.cropper-invisible{opacity:0}.cropper-bg{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC\")}.cropper-hide{display:block;height:0;position:absolute;width:0}.cropper-hidden{display:none!important}.cropper-move{cursor:move}.cropper-crop{cursor:crosshair}.cropper-disabled .cropper-drag-box,.cropper-disabled .cropper-face,.cropper-disabled .cropper-line,.cropper-disabled .cropper-point{cursor:not-allowed}", ""]);

// exports


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(157)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(159)
/* template */
var __vue_template__ = __webpack_require__(160)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/social/error.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5745937d", Component.options)
  } else {
    hotAPI.reload("data-v-5745937d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(158);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("ea869510", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5745937d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./error.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5745937d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./error.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.b-notification-error{\n\n  padding:2px 5px 5px 20px;text-align: left;\n}\n.b-notification-error .media{\n\n  padding-top: 0;\n}\n", ""]);

// exports


/***/ }),
/* 159 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({

  props: {

    error: {
      type: Object,
      default: function _default() {
        return {};
      }
    }

  }
});

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "transition",
    { attrs: { name: "fade" } },
    [
      _c(
        "b-notification",
        {
          staticClass: "b-notification-error m-t-5",
          class: _vm.error.success ? "is-info" : "is-warning",
          attrs: { active: _vm.error.status },
          on: {
            "update:active": function($event) {
              _vm.$set(_vm.error, "status", $event)
            }
          }
        },
        [
          _vm._v(
            "\n        " + _vm._s(_vm.error.libel || _vm.error.label) + "\n    "
          )
        ]
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5745937d", module.exports)
  }
}

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(162)
/* template */
var __vue_template__ = __webpack_require__(163)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/switch.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-42cd9b18", Component.options)
  } else {
    hotAPI.reload("data-v-42cd9b18", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 162 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({

    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],

    props: {

        value: {
            type: Boolean,
            default: false
        },

        label: {
            type: String,
            default: ''
        },

        name: {
            type: String,
            default: ''
        },

        size: {
            type: String,
            default: ''
        },

        trigger: {
            type: Boolean,
            default: false
        }
    },

    data: function data() {
        return {
            //input : this.vmodel,
            input: this.value
        };
    },


    watch: {
        input: function input(val) {
            //this.input = val;
            this.$emit('change', val);
            this.clearError();
            if (this.trigger) this.$emit('trigger', val);
        }
    },

    computed: {
        nameComputed: function nameComputed() {
            return this.name.replace('_', ' ');
        }
    }

});

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "b-switch",
        {
          attrs: { value: _vm.value, size: _vm.size },
          on: {
            input: function($event) {
              _vm.input = $event
            }
          }
        },
        [
          _c(
            "span",
            { class: { "has-text-danger": _vm.errorMutable.status } },
            [_vm._v(_vm._s(_vm.nameComputed))]
          )
        ]
      ),
      _vm._v(" "),
      _vm.errorMutable.status
        ? _c("div", {
            staticClass: "has-text-danger",
            staticStyle: { "font-size": "0.8rem" },
            domProps: { textContent: _vm._s(_vm.errorMutable.label) }
          })
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-42cd9b18", module.exports)
  }
}

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(165)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(167)
/* template */
var __vue_template__ = __webpack_require__(168)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/switches.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-236380c6", Component.options)
  } else {
    hotAPI.reload("data-v-236380c6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(166);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("9ee65244", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-236380c6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./switches.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-236380c6\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./switches.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.switch + .switch {\n    margin-left: 0em;\n}\n", ""]);

// exports


/***/ }),
/* 167 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({

	mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],

	props: {
		switches: {
			type: Array,
			defaul: function defaul() {
				return [];
			}
		},

		label: {
			type: String,
			default: ''
		},

		isCenter: {
			type: Boolean,
			default: false
		},

		isVertical: {
			type: Boolean,
			default: false
		}
	},

	data: function data() {

		return {

			input: null

		};
	},


	methods: {
		setSwitch: function setSwitch(val, index, ref, field) {

			this.$emit('change', { ref: ref, val: val, index: index });

			if (this.switches[index].triggerSubform) this.$emit('trigger', val);

			if (this.switches[index].disableUpload) this.$emit('disableUpload', val);

			if (!val) return;

			this.clearError();

			for (var k in this.switches) {

				k = parseInt(k);

				if (k !== index) this.switches[k].status = false;
			}

			this.input = ref;
		}
	}

});

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "div",
        {
          staticClass: "flex",
          class: [
            { "flex-center-x": _vm.isCenter },
            { "flex-column": _vm.isVertical }
          ]
        },
        _vm._l(_vm.switches, function(s, index) {
          return _c(
            "b-switch",
            {
              key: index,
              ref: s.ref,
              refInFor: true,
              class: [
                { "m-r-10": !_vm.isVertical },
                { "m-b-5": _vm.isVertical }
              ],
              attrs: { value: s.status },
              on: {
                input: function($event) {
                  _vm.setSwitch($event, index, s.ref)
                }
              },
              model: {
                value: s.status,
                callback: function($$v) {
                  _vm.$set(s, "status", $$v)
                },
                expression: "s.status"
              }
            },
            [_vm._v(_vm._s(s.libel))]
          )
        })
      ),
      _vm._v(" "),
      _c("error", { attrs: { error: _vm.errorMutable } })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-236380c6", module.exports)
  }
}

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(170)
/* template */
var __vue_template__ = __webpack_require__(171)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/textarea.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-438c851e", Component.options)
  } else {
    hotAPI.reload("data-v-438c851e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 170 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        value: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        }
    },

    data: function data() {
        return {
            input: this.value,
            height: null
        };
    },
    mounted: function mounted() {
        var _this = this;

        setTimeout(function () {
            _this.height = _this.$refs.hiddenHeight.clientHeight;
        }, 200);
    },


    watch: {
        input: function input(val) {

            this.$emit('change', val);
            this.clearError();
        }
    },

    methods: {
        setHeight: function setHeight() {
            this.height = this.$refs.hiddenHeight.clientHeight;
        }
    }
});

/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _vm.label !== ""
          ? _c(
              "div",
              {
                staticStyle: {
                  display: "flex",
                  "align-items": "center",
                  height: "38px"
                },
                style: "width: " + this.width + "%"
              },
              [
                _c("label", {
                  class: { "has-text-danger": _vm.errorMutable.status },
                  staticStyle: { "text-transform": "capitalize" },
                  domProps: { textContent: _vm._s(_vm.labelComputed) }
                })
              ]
            )
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          {
            staticStyle: { position: "relative" },
            style: "width: " + (100 - this.widthComputed) + "%"
          },
          [
            _c("div", { ref: "hiddenHeight", staticClass: "hidden-textarea" }, [
              _vm._v(_vm._s(_vm.input))
            ]),
            _vm._v(" "),
            _c(
              "textarea",
              {
                directives: [
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.input,
                    expression: "input"
                  }
                ],
                staticClass: "custom-textarea",
                style: "height:" + _vm.height + "px",
                attrs: { placeholder: _vm.placeholder },
                domProps: { value: _vm.input },
                on: {
                  keyup: _vm.setHeight,
                  input: function($event) {
                    if ($event.target.composing) {
                      return
                    }
                    _vm.input = $event.target.value
                  }
                }
              },
              [_vm._v(_vm._s(_vm.value))]
            )
          ]
        )
      ]
    ),
    _vm._v(" "),
    _vm.errorMutable.status
      ? _c("div", {
          staticClass: "has-text-danger",
          staticStyle: { "font-size": "0.8rem" },
          style: "padding-left:" + (+this.widthComputed + 1) + "%",
          domProps: { textContent: _vm._s(_vm.errorMutable.label) }
        })
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-438c851e", module.exports)
  }
}

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(173)
/* template */
var __vue_template__ = __webpack_require__(176)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/selectLabel.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0a30bbb8", Component.options)
  } else {
    hotAPI.reload("data-v-0a30bbb8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 173 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__form_select_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    components: { 'vv-select': __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default.a },
    mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        label: {
            type: String,
            default: null
        },
        placeholderProp: {
            type: String,
            default: null
        },
        keyEnum: {
            type: String,
            default: 'null'
        },
        width: {
            type: Number,
            default: 18
        },
        options: {
            /*
            type: Array,
            default(){
                return []
            }
            */
        },
        value: {
            type: String,
            default: ''
        },
        trigger: {
            type: Boolean,
            default: false
        },
        widthStyle: {
            type: String,
            default: null
        },
        marginStyle: {
            type: String,
            default: null
        }
    },

    data: function data() {
        return {
            input: ''
        };
    },


    computed: {
        placeholder: function placeholder() {
            if (!this.label && this.placeholderProp !== 'null') return this.placeholderProp;
            return this.label.charAt(0).toUpperCase() + this.label.slice(1);
        },
        widthComputed: function widthComputed() {
            return this.label === '' ? 0 : this.width;
        }
    },

    methods: {
        change: function change(val) {
            this.input = val;
            this.$emit('change', val);
            if (this.trigger) this.$emit('trigger', val);
        }
    }
});

/***/ }),
/* 174 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var pointerScroll = {

    watch: {
        typeAheadPointer: function typeAheadPointer() {
            this.maybeAdjustScroll();
        }
    },

    methods: {
        /**
         * Adjust the scroll position of the cvcvdropdown list
         * if the current pointer is outside of the
         * overflow bounds.
         * @returns {*}
         */
        maybeAdjustScroll: function maybeAdjustScroll() {
            return;
            var pixelsToPointerTop = this.pixelsToPointerTop();
            var pixelsToPointerBottom = this.pixelsToPointerBottom();

            if (pixelsToPointerTop <= this.viewport().top) {
                return this.scrollTo(pixelsToPointerTop);
            } else if (pixelsToPointerBottom >= this.viewport().bottom) {
                return this.scrollTo(this.viewport().top + this.pointerHeight());
            }
        },


        /**
         * The distance in pixels from the top of the cvcvdropdown
         * list to the top of the current pointer element.
         * @returns {number}
         */
        pixelsToPointerTop: function pixelsToPointerTop() {
            var pixelsToPointerTop = 0;
            if (this.$refs.cvcvdropdownMenu) {
                for (var i = 0; i < this.typeAheadPointer; i++) {
                    pixelsToPointerTop += this.$refs.cvcvdropdownMenu.children[i].offsetHeight;
                }
            }
            return pixelsToPointerTop;
        },


        /**
         * The distance in pixels from the top of the cvcvdropdown
         * list to the bottom of the current pointer element.
         * @returns {*}
         */
        pixelsToPointerBottom: function pixelsToPointerBottom() {
            return this.pixelsToPointerTop() + this.pointerHeight();
        },


        /**
         * The offsetHeight of the current pointer element.
         * @returns {number}
         */
        pointerHeight: function pointerHeight() {
            var element = this.$refs.cvdropdownMenu ? this.$refs.cvdropdownMenu.children[this.typeAheadPointer] : false;
            return element ? element.offsetHeight : 0;
        },


        /**
         * The currently viewable portion of the cvdropdownMenu.
         * @returns {top: (string|*|number), bottom: }
         */
        viewport: function viewport() {
            return {
                top: this.$refs.cvdropdownMenu ? this.$refs.cvdropdownMenu.scrollTop : 0,
                bottom: this.$refs.cvdropdownMenu ? this.$refs.cvdropdownMenu.offsetHeight + this.$refs.cvdropdownMenu.scrollTop : 0
            };
        },


        /**
         * Scroll the cvdropdownMenu to a given position.
         * @param position
         * @returns {*}
         */
        scrollTo: function scrollTo(position) {
            return this.$refs.cvdropdownMenu ? this.$refs.cvdropdownMenu.scrollTop = position : null;
        }
    }

};

var typeAheadPointer = {
    data: function data() {
        return {
            typeAheadPointer: -1
        };
    },


    watch: {
        filteredOptions: function filteredOptions() {
            this.typeAheadPointer = 0;
        }
    },

    methods: {
        /**
         * Move the typeAheadPointer visually up the list by
         * subtracting the current index by one.
         * @return {void}
         */
        typeAheadUp: function typeAheadUp() {
            if (this.typeAheadPointer > 0) {
                this.typeAheadPointer--;
                if (this.maybeAdjustScroll) {
                    this.maybeAdjustScroll();
                }
            }
        },


        /**
         * Move the typeAheadPointer visually down the list by
         * adding the current index by one.
         * @return {void}
         */
        typeAheadDown: function typeAheadDown() {
            if (this.typeAheadPointer < this.filteredOptions.length - 1) {
                this.typeAheadPointer++;
                if (this.maybeAdjustScroll) {
                    this.maybeAdjustScroll();
                }
            }
        },


        /**
         * Select the option at the current typeAheadPointer position.
         * Optionally clear the search input on selection.
         * @return {void}
         */
        typeAheadSelect: function typeAheadSelect() {
            if (this.filteredOptions[this.typeAheadPointer]) {
                this.select(this.filteredOptions[this.typeAheadPointer]);
            } else if (this.taggable && this.search.length) {
                this.select(this.search);
            }

            if (this.clearSearchOnSelect) {
                this.search = "";
            }
        }
    }
};

/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [pointerScroll, typeAheadPointer],
    props: {

        width: {
            type: Number,
            default: null
        },

        errorClass: {
            type: Boolean,
            default: false
        },

        /**
         * Contains the currently selected value. Very similar to a
         * `value` attribute on an <input>. You can listen for changes
         * using 'change' event using v-on
         * @type {Object||String||null}
         */
        value: {
            default: null
        },
        /**
         * An array of strings or objects to be used as cvdropdown choices.
         * If you are using an array of objects, vue-select will look for
         * a `label` key (ex. [{label: 'This is Foo', value: 'foo'}]). A
         * custom label key can be set with the `label` prop.
         * @type {Array}
         */
        options: {
            //type: Array,
            //default () {
            //  return []
            //},
        },
        /**
         * Disable the entire component.
         * @type {Boolean}
         */
        disabled: {
            type: Boolean,
            default: false
        },
        /**
         * Can the user clear the selected property?
         * @type {Boolean}
         */
        clearable: {
            type: Boolean,
            default: true
        },
        /**
         * Sets the max-height property on the cvdropdown list.
         * @deprecated
         * @type {String}
         */
        maxHeight: {
            type: String,
            default: '400px'
        },
        /**
         * Enable/disable filtering the options.
         * @type {Boolean}
         */
        searchable: {
            type: Boolean,
            default: true
        },
        /**
         * Equivalent to the `multiple` attribute on a `<select>` input.
         * @type {Boolean}
         */
        multiple: {
            type: Boolean,
            default: false
        },
        /**
         * Equivalent to the `placeholder` attribute on an `<input>`.
         * @type {String}
         */
        placeholder: {
            type: String,
            default: ''
        },
        /**
         * Sets a Vue transition property on the `.cvdropdown-menu`. vue-select
         * does not include CSS for transitions, you'll need to add them yourself.
         * @type {String}
         */
        transition: {
            type: String,
            default: 'fade'
        },
        /**
         * Enables/disables clearing the search text when an option is selected.
         * @type {Boolean}
         */
        clearSearchOnSelect: {
            type: Boolean,
            default: true
        },
        /**
         * Close a cvdropdown when an option is chosen. Set to false to keep the cvdropdown
         * open (useful when combined with multi-select, for example)
         * @type {Boolean}
         */
        closeOnSelect: {
            type: Boolean,
            default: true
        },
        /**
         * Tells vue-select what key to use when generating option
         * labels when each `option` is an object.
         * @type {String}
         */
        label: {
            type: String,
            default: 'label'
        },
        /**
         * Callback to generate the label text. If {option}
         * is an object, returns option[this.label] by default.
         * @type {Function}
         * @param  {Object || String} option
         * @return {String}
         */
        getOptionLabel: {
            type: Function,
            default: function _default(option) {
                if ((typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') {
                    if (!option.hasOwnProperty(this.label)) {
                        return option;
                        return console.warn('[vue-select warn]: Label key "option.' + this.label + '" does not' + (' exist in options object ' + JSON.stringify(option) + '.\n') + 'http://sagalbot.github.io/vue-select/#ex-labels');
                    }
                    if (this.label && option[this.label]) {
                        return option[this.label];
                    }
                }
                return option;
            }
        },
        /**
         * An optional callback function that is called each time the selected
         * value(s) change. When integrating with Vuex, use this callback to trigger
         * an action, rather than using :value.sync to retreive the selected value.
         * @type {Function}
         * @param {Object || String} val
         */
        onChange: {
            type: Function,
            default: function _default(val) {
                this.$emit('input', val);
            }
        },
        /**
         * Enable/disable creating options from searchInput.
         * @type {Boolean}
         */
        taggable: {
            type: Boolean,
            default: false
        },
        /**
         * Set the tabindex for the input field.
         * @type {Number}
         */
        tabindex: {
            type: Number,
            default: null
        },
        /**
         * When true, newly created tags will be added to
         * the options list.
         * @type {Boolean}
         */
        pushTags: {
            type: Boolean,
            default: false
        },
        /**
         * When true, existing options will be filtered
         * by the search text. Should not be used in conjunction
         * with taggable.
         * @type {Boolean}
         */
        filterable: {
            type: Boolean,
            default: true
        },
        /**
         * Callback to determine if the provided option should
         * match the current search text. Used to determine
         * if the option should be displayed.
         * @type   {Function}
         * @param  {Object || String} option
         * @param  {String} label
         * @param  {String} search
         * @return {Boolean}
         */
        filterBy: {
            type: Function,
            default: function _default(option, label, search) {
                return (label || '').toLowerCase().indexOf(search.toLowerCase()) > -1;
            }
        },
        /**
         * Callback to filter results when search text
         * is provided. Default implementation loops
         * each option, and returns the result of
         * this.filterBy.
         * @type   {Function}
         * @param  {Array} list of options
         * @param  {String} search text
         * @param  {Object} vSelect instance
         * @return {Boolean}
         */
        filter: {
            "type": Function,
            default: function _default(options, search) {
                var _this = this;

                return options.filter(function (option) {
                    var label = _this.getOptionLabel(option);
                    if (typeof label === 'number') {
                        label = label.toString();
                    }
                    return _this.filterBy(option, label, search);
                });
            }
        },
        /**
         * User defined function for adding Options
         * @type {Function}
         */
        createOption: {
            type: Function,
            default: function _default(newOption) {
                if (_typeof(this.mutableOptions[0]) === 'object') {
                    newOption = _defineProperty({}, this.label, newOption);
                }
                this.$emit('option:created', newOption);
                return newOption;
            }
        },
        /**
         * When false, updating the options will not reset the select value
         * @type {Boolean}
         */
        resetOnOptionsChange: {
            type: Boolean,
            default: false
        },
        /**
         * Disable the cvdropdown entirely.
         * @type {Boolean}
         */
        noDrop: {
            type: Boolean,
            default: false
        },
        /**
         * Sets the id of the input element
         */
        inputId: {
            type: String
        },
        /**
         * Sets RTL support. Accepts 'ltr', 'rtl', 'auto'.
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
         * @type {String}
         */
        dir: {
            type: String,
            default: 'auto'
        }
    },
    data: function data() {
        return {
            search: '',
            open: false,
            mutableValue: null,
            mutableOptions: [],
            errorClassMutable: this.errorClass
        };
    },

    watch: {
        errorClass: function errorClass(val) {
            this.errorClassMutable = val;
        },

        /**
         * When the value prop changes, update
         * the internal mutableValue.
         * @param  {mixed} val
         * @return {void}
         */
        value: function value(val) {
            this.mutableValue = val;
        },

        /**
         * Maybe run the onChange callback.
         * @param  {string|object} val
         * @param  {string|object} old
         * @return {void}
         */
        mutableValue: function mutableValue(val, old) {

            if (this.multiple) {
                this.onChange ? this.onChange(val) : null;
            } else {
                this.onChange && val !== old ? this.onChange(val) : null;
            }
        },

        /**
         * When options change, update
         * the internal mutableOptions.
         * @param  {array} val
         * @return {void}
         */
        options: function options(val) {
            this.mutableOptions = val;
        },

        /**
         * Maybe reset the mutableValue
         * when mutableOptions change.
         * @return {[type]} [description]
         */
        mutableOptions: function mutableOptions() {
            if (!this.taggable && this.resetOnOptionsChange) {
                this.mutableValue = this.multiple ? [] : null;
            }
        },

        /**
         * Always reset the mutableValue when
         * the multiple prop changes.
         * @param  {Boolean} val
         * @return {void}
         */
        multiple: function multiple(val) {
            this.mutableValue = val ? [] : null;
        }
    },
    /**
     * Clone props into mutable values,
     * attach any event listeners.
     */
    created: function created() {
        this.mutableValue = this.value;
        this.mutableOptions = this.options.slice(0);
        this.mutableLoading = this.loading;
        this.$on('option:created', this.maybePushTag);
    },

    methods: {
        /**
         * Select a given option.
         * @param  {Object|String} option
         * @return {void}
         */
        select: function select(option) {
            if (!this.isOptionSelected(option)) {
                if (this.taggable && !this.optionExists(option)) {
                    option = this.createOption(option);
                }
                if (this.multiple && !this.mutableValue) {
                    this.mutableValue = [option];
                } else if (this.multiple) {
                    this.mutableValue.push(option);
                } else {
                    this.mutableValue = option;
                }
            }
            this.onAfterSelect(option);
        },

        /**
         * De-select a given option.
         * @param  {Object|String} option
         * @return {void}
         */
        deselect: function deselect(option) {
            var _this2 = this;

            if (this.multiple) {
                var ref = -1;
                this.mutableValue.forEach(function (val) {
                    if (val === option || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val[_this2.label] === option[_this2.label]) {
                        ref = val;
                    }
                });
                var index = this.mutableValue.indexOf(ref);
                this.mutableValue.splice(index, 1);
            } else {
                this.mutableValue = null;
            }
        },

        /**
         * Clears the currently selected value(s)
         * @return {void}
         */
        clearSelection: function clearSelection() {
            this.mutableValue = this.multiple ? [] : null;
        },

        /**
         * Called from this.select after each selection.
         * @param  {Object|String} option
         * @return {void}
         */
        onAfterSelect: function onAfterSelect(option) {
            if (this.closeOnSelect) {
                this.open = !this.open;
                this.$refs.search.blur();
            }
            if (this.clearSearchOnSelect) {
                this.search = '';
            }

            //this.clearError();
            //this.errorClassMutable = false;
            this.$parent.clearError();
        },

        /**
         * Toggle the visibility of the cvdropdown menu.
         * @param  {Event} e
         * @return {void}
         */
        togglecvdropdown: function togglecvdropdown(e) {
            if (e.target === this.$refs.openIndicator || e.target === this.$refs.search || e.target === this.$refs.toggle || e.target === this.$el) {
                if (this.open) {
                    this.$refs.search.blur(); // cvdropdown will close on blur
                } else {
                    if (!this.disabled) {
                        this.open = true;
                        this.$refs.search.focus();
                    }
                }
            }
        },

        /**
         * Check if the given option is currently selected.
         * @param  {Object|String}  option
         * @return {Boolean}        True when selected | False otherwise
         */
        isOptionSelected: function isOptionSelected(option) {
            var _this3 = this;

            if (this.multiple && this.mutableValue) {
                var selected = false;
                this.mutableValue.forEach(function (opt) {
                    if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) === 'object' && opt[_this3.label] === option[_this3.label]) {
                        selected = true;
                    } else if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) === 'object' && opt[_this3.label] === option) {
                        selected = true;
                    } else if (opt === option) {
                        selected = true;
                    }
                });
                return selected;
            }
            return this.mutableValue === option;
        },

        /**
         * If there is any text in the search input, remove it.
         * Otherwise, blur the search input to close the cvdropdown.
         * @return {void}
         */
        onEscape: function onEscape() {
            if (!this.search.length) {
                this.$refs.search.blur();
            } else {
                this.search = '';
            }
        },

        /**
         * Close the cvdropdown on blur.
         * @emits  {search:blur}
         * @return {void}
         */
        onSearchBlur: function onSearchBlur() {
            if (this.clearSearchOnBlur) {
                this.search = '';
            }
            this.open = false;
            this.$emit('search:blur');
        },

        /**
         * Open the cvdropdown on focus.
         * @emits  {search:focus}
         * @return {void}
         */
        onSearchFocus: function onSearchFocus() {
            this.open = true;
            this.$emit('search:focus');
        },

        /**
         * Delete the value on Delete keypress when there is no
         * text in the search input, & there's tags to delete
         * @return {this.value}
         */
        maybeDeleteValue: function maybeDeleteValue() {
            if (!this.$refs.search.value.length && this.mutableValue) {
                return this.multiple ? this.mutableValue.pop() : this.mutableValue = null;
            }
        },

        /**
         * Determine if an option exists
         * within this.mutableOptions array.
         *
         * @param  {Object || String} option
         * @return {boolean}
         */
        optionExists: function optionExists(option) {
            var _this4 = this;

            var exists = false;
            this.mutableOptions.forEach(function (opt) {
                if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) === 'object' && opt[_this4.label] === option) {
                    exists = true;
                } else if (opt === option) {
                    exists = true;
                }
            });
            return exists;
        },

        /**
         * If push-tags is true, push the
         * given option to mutableOptions.
         *
         * @param  {Object || String} option
         * @return {void}
         */
        maybePushTag: function maybePushTag(option) {
            if (this.pushTags) {
                this.mutableOptions.push(option);
            }
        }
    },
    computed: {
        input: function input() {
            return this.mutableValue;
        },
        mainWidth: function mainWidth() {
            return this.width === null ? '' : this.width + '%';
        },

        /**
         * Classes to be output on .cvdropdown
         * @return {Object}
         */
        cvdropdownClasses: function cvdropdownClasses() {
            return {
                open: this.cvdropdownOpen,
                single: !this.multiple,
                searching: this.searching,
                searchable: this.searchable,
                unsearchable: !this.searchable,
                loading: this.mutableLoading,
                rtl: this.dir === 'rtl',
                disabled: this.disabled
            };
        },

        /**
         * If search text should clear on blur
         * @return {Boolean} True when single and clearSearchOnSelect
         */
        clearSearchOnBlur: function clearSearchOnBlur() {
            return this.clearSearchOnSelect && !this.multiple;
        },

        /**
         * Return the current state of the
         * search input
         * @return {Boolean} True if non empty value
         */
        searching: function searching() {
            return !!this.search;
        },

        /**
         * Return the current state of the
         * cvdropdown menu.
         * @return {Boolean} True if open
         */
        cvdropdownOpen: function cvdropdownOpen() {
            return this.noDrop ? false : this.open && !this.mutableLoading;
        },

        /**
         * Return the placeholder string if it's set
         * & there is no value selected.
         * @return {String} Placeholder text
         */
        searchPlaceholder: function searchPlaceholder() {
            if (this.isValueEmpty && this.placeholder) {
                return this.placeholder;
            }
        },

        /**
         * The currently displayed options, filtered
         * by the search elements value. If tagging
         * true, the search text will be prepended
         * if it doesn't already exist.
         *
         * @return {array}
         */
        filteredOptions: function filteredOptions() {
            if (!this.filterable && !this.taggable) {
                return this.mutableOptions.slice();
            }
            var options = this.search.length ? this.filter(this.mutableOptions, this.search, this) : this.mutableOptions;
            if (this.taggable && this.search.length && !this.optionExists(this.search)) {
                options.unshift(this.search);
            }
            return options;
        },

        /**
         * Check if there aren't any options selected.
         * @return {Boolean}
         */
        isValueEmpty: function isValueEmpty() {
            if (this.mutableValue) {
                if (_typeof(this.mutableValue) === 'object') {
                    return !Object.keys(this.mutableValue).length;
                }
                return !this.mutableValue.length;
            }
            return true;
        },

        /**
         * Return the current value in array format.
         * @return {Array}
         */
        valueAsArray: function valueAsArray() {
            if (this.multiple) {
                return this.mutableValue;
            } else if (this.mutableValue) {
                return [].concat(this.mutableValue);
            }
            return [];
        },

        /**
         * Determines if the clear button should be displayed.
         * @return {Boolean}
         */
        showClearButton: function showClearButton() {
            return !this.multiple && this.clearable && !this.open && this.mutableValue != null;
        }
    }
});

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { style: { width: _vm.mainWidth } }, [
    _c(
      "div",
      {
        staticClass: "cvdropdown c-v-select",
        class: _vm.cvdropdownClasses,
        attrs: { dir: _vm.dir }
      },
      [
        _c(
          "div",
          {
            ref: "toggle",
            class: [
              "cvdropdown-toggle",
              "clearfix",
              { "has-select-error": _vm.errorClassMutable }
            ],
            on: {
              mousedown: function($event) {
                $event.preventDefault()
                return _vm.togglecvdropdown($event)
              }
            }
          },
          [
            _vm._l(_vm.valueAsArray, function(option) {
              return _vm._t(
                "selected-option-container",
                [
                  _c(
                    "span",
                    { key: option.index, staticClass: "selected-tag" },
                    [
                      _vm._t(
                        "selected-option",
                        [
                          _vm._v(
                            "\n            " +
                              _vm._s(_vm.getOptionLabel(option)) +
                              "\n          "
                          )
                        ],
                        null,
                        typeof option === "object"
                          ? option
                          : ((_obj = {}), (_obj[_vm.label] = option), _obj)
                      ),
                      _vm._v(" "),
                      _vm.multiple
                        ? _c(
                            "button",
                            {
                              staticClass: "close",
                              attrs: {
                                disabled: _vm.disabled,
                                type: "button",
                                "aria-label": "Remove option"
                              },
                              on: {
                                click: function($event) {
                                  _vm.deselect(option)
                                }
                              }
                            },
                            [
                              _c("span", { attrs: { "aria-hidden": "true" } }, [
                                _vm._v("×")
                              ])
                            ]
                          )
                        : _vm._e()
                    ],
                    2
                  )
                ],
                {
                  option:
                    typeof option === "object"
                      ? option
                      : ((_obj$1 = {}), (_obj$1[_vm.label] = option), _obj$1),
                  deselect: _vm.deselect,
                  multiple: _vm.multiple,
                  disabled: _vm.disabled
                }
              )
              var _obj
              var _obj$1
            }),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.search,
                  expression: "search"
                }
              ],
              ref: "search",
              staticClass: "form-controlxxxxxxxxxxxx",
              style: { width: _vm.isValueEmpty ? "100%" : "1%" },
              attrs: {
                type: "search",
                autocomplete: "nope",
                disabled: _vm.disabled,
                placeholder: _vm.searchPlaceholder,
                tabindex: _vm.tabindex,
                readonly: !_vm.searchable,
                id: _vm.inputId,
                "aria-label": "Search for option",
                name: "testest"
              },
              domProps: { value: _vm.search },
              on: {
                keydown: [
                  function($event) {
                    if (
                      !("button" in $event) &&
                      _vm._k($event.keyCode, "delete", [8, 46], $event.key, [
                        "Backspace",
                        "Delete"
                      ])
                    ) {
                      return null
                    }
                    return _vm.maybeDeleteValue($event)
                  },
                  function($event) {
                    if (
                      !("button" in $event) &&
                      _vm._k($event.keyCode, "up", 38, $event.key, "ArrowUp")
                    ) {
                      return null
                    }
                    $event.preventDefault()
                    return _vm.typeAheadUp($event)
                  },
                  function($event) {
                    if (
                      !("button" in $event) &&
                      _vm._k(
                        $event.keyCode,
                        "down",
                        40,
                        $event.key,
                        "ArrowDown"
                      )
                    ) {
                      return null
                    }
                    $event.preventDefault()
                    return _vm.typeAheadDown($event)
                  },
                  function($event) {
                    if (
                      !("button" in $event) &&
                      _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                    ) {
                      return null
                    }
                    $event.preventDefault()
                    return _vm.typeAheadSelect($event)
                  }
                ],
                keyup: function($event) {
                  if (
                    !("button" in $event) &&
                    _vm._k($event.keyCode, "esc", 27, $event.key, "Escape")
                  ) {
                    return null
                  }
                  return _vm.onEscape($event)
                },
                blur: _vm.onSearchBlur,
                focus: _vm.onSearchFocus,
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.search = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c(
              "button",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.showClearButton,
                    expression: "showClearButton"
                  }
                ],
                staticClass: "clear",
                attrs: {
                  disabled: _vm.disabled,
                  type: "button",
                  title: "Clear selection"
                },
                on: { click: _vm.clearSelection }
              },
              [_c("span", { attrs: { "aria-hidden": "true" } }, [_vm._v("×")])]
            ),
            _vm._v(" "),
            !_vm.noDrop
              ? _c("i", {
                  ref: "openIndicator",
                  staticClass: "open-indicator",
                  attrs: { role: "presentation" }
                })
              : _vm._e(),
            _vm._v(" "),
            _vm._t("spinner", [
              _c(
                "div",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: _vm.mutableLoading,
                      expression: "mutableLoading"
                    }
                  ],
                  staticClass: "spinner"
                },
                [_vm._v("Loading...")]
              )
            ])
          ],
          2
        ),
        _vm._v(" "),
        _c("transition", { attrs: { name: _vm.transition } }, [
          _vm.cvdropdownOpen
            ? _c(
                "ul",
                {
                  ref: "cvdropdownMenu",
                  staticClass: "cvdropdown-menu",
                  style: { "max-height": _vm.maxHeight }
                },
                [
                  _vm._l(_vm.filteredOptions, function(option, index) {
                    return _c(
                      "li",
                      {
                        key: index,
                        class: {
                          active: _vm.isOptionSelected(option),
                          highlight: index === _vm.typeAheadPointer
                        },
                        on: {
                          mouseover: function($event) {
                            _vm.typeAheadPointer = index
                          }
                        }
                      },
                      [
                        _c(
                          "a",
                          {
                            on: {
                              mousedown: function($event) {
                                $event.preventDefault()
                                _vm.select(option)
                              }
                            }
                          },
                          [
                            _vm._t(
                              "option",
                              [
                                _vm._v(
                                  "\n            " +
                                    _vm._s(_vm.getOptionLabel(option)) +
                                    "\n          "
                                )
                              ],
                              null,
                              typeof option === "object"
                                ? option
                                : ((_obj = {}),
                                  (_obj[_vm.label] = option),
                                  _obj)
                            )
                          ],
                          2
                        )
                      ]
                    )
                    var _obj
                  }),
                  _vm._v(" "),
                  !_vm.filteredOptions.length
                    ? _c(
                        "li",
                        { staticClass: "no-options" },
                        [
                          _vm._t("no-options", [
                            _vm._v("Sorry, no matching options.")
                          ])
                        ],
                        2
                      )
                    : _vm._e()
                ],
                2
              )
            : _vm._e()
        ])
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-16661640", module.exports)
  }
}

/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.options !== null
    ? _c(
        "div",
        { style: _vm.marginStyle !== null ? "margin:" + _vm.marginStyle : "" },
        [
          _c(
            "div",
            {
              staticStyle: {
                display: "flex",
                "justify-content": "space-between"
              }
            },
            [
              _c(
                "div",
                {
                  staticStyle: {
                    display: "flex",
                    "align-items": "center",
                    height: "38px"
                  },
                  style: "width: " + this.width + "%"
                },
                [
                  _c("label", {
                    class: { "has-text-danger": _vm.errorMutable.status },
                    staticStyle: { "text-transform": "capitalize" },
                    domProps: {
                      textContent: _vm._s(
                        _vm.width > 0 ? _vm.removeUnderscore(_vm.label) : ""
                      )
                    }
                  })
                ]
              ),
              _vm._v(" "),
              _c(
                "div",
                { style: "width: " + (100 - this.widthComputed) + "%" },
                [
                  _c("vv-select", {
                    style:
                      _vm.widthStyle !== null ? "width:" + _vm.widthStyle : "",
                    attrs: {
                      label: _vm.keyEnum,
                      options: _vm.options,
                      placeholder: _vm.removeUnderscore(_vm.placeholder),
                      value: _vm.value,
                      "error-class": _vm.errorMutable.status
                    },
                    on: {
                      input: function($event) {
                        _vm.change($event)
                      }
                    }
                  })
                ],
                1
              )
            ]
          ),
          _vm._v(" "),
          _vm.errorMutable.status
            ? _c("div", {
                staticClass: "has-text-danger",
                staticStyle: { "font-size": "0.8rem" },
                style: "padding-left:" + (+this.widthComputed + 1) + "%",
                domProps: { textContent: _vm._s(_vm.errorMutable.label) }
              })
            : _vm._e()
        ]
      )
    : _vm._e()
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-0a30bbb8", module.exports)
  }
}

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(178)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(180)
/* template */
var __vue_template__ = __webpack_require__(181)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/input.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-dc6aded4", Component.options)
  } else {
    hotAPI.reload("data-v-dc6aded4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(179);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("de5caaf8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-dc6aded4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./input.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-dc6aded4\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./input.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.w-150{\n    width: 150px;\n}\n", ""]);

// exports


/***/ }),
/* 180 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        name: {
            type: String,
            default: null
        },
        value: {
            default: ''
        },
        rules: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        max: {
            type: Number,
            default: null
        },
        min: {
            type: Number,
            default: null
        },
        icon: {
            type: String,
            default: null
        },
        iconRight: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: 'text'
        },
        helper: {
            type: String,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        }

    },
    data: function data() {
        return {

            //isFocused: (this.form.select === null || this.form.select.length === 0) ? false : true,
            isFocused: this.value === null || this.value.length === 0 ? false : true,
            focusFirst: false,
            //input: (this.form.select === null) ? '' : this.form.select,
            input: this.value !== null ? this.value : '',
            isErrorClass: false,
            errorMessage: '',
            errorBases: {
                'alphanumeric': 'Not alphanumeric',
                'email': 'invalid email',
                'match': 'Password doesn\'t match',
                'integer': 'value is not a number'
            }
        };
    },
    mounted: function mounted() {
        if (!this.value || this.value === null || this.value.length === 0) this.preventAutofill();
    },


    computed: {
        typeComputed: function typeComputed() {

            if (this.type === 'int') return 'number';

            return this.type;
        },
        classesInput: function classesInput() {
            return {
                'c-input-group--focused': this.isFocused,
                'c-input-group--error': this.isErrorClass,
                'c-input-group--prepend-icon': this.icon !== null ? true : false,
                'c-input-group--append-icon': this.iconRight !== null ? true : false,
                'w-150': this.type === 'int' ? true : false
            };
        },
        labelComputed: function labelComputed() {

            return this.label.replace('_', ' ');
        },

        //nameComputed() {
        //  return (this.name !== null) ? this.name : this.label.toLowerCase();
        //},
        getOpacity: function getOpacity() {
            var opacity = 'opacity : ';
            return this.isFocused ? opacity + 1 : opacity + 0;
        },
        counterComputed: function counterComputed() {
            if (this.type === 'number') return;
            var length = typeof this.input === 'number' ? this.input.toString().length : this.input.length;
            if (this.max === null) return length;
            return length + '/' + this.max;
        },
        isCounter: function isCounter() {
            return typeof this.max === 'number' && this.max > 0 || typeof this.min === 'number' && this.min > 0 ? true : false;
        },
        isMaxLength: function isMaxLength() {
            if (this.max === null) return false;
            if (this.type === 'number') {
                return this.input > this.max;
            }
            return this.input.length > this.max;
        },
        isMinLength: function isMinLength() {
            if (this.min === null) return true;
            return this.input.length >= this.min;
        },
        helperComputed: function helperComputed() {
            if (this.errorMutable.status) return this.errorMutable.label;
            if (this.helper !== null && (this.input.length === 0 || this.type === 'int')) return this.helper;
            if (this.required && this.input.length === 0) return 'Required field';
            return '';
        }
    },
    watch: {
        input: function input(val) {
            this.$emit('change', val);

            if (val === null || val === '') {
                this.clearError();
                return;
            }

            if (this.type === 'int' && this.max !== null) {
                //if (val.length > this.max) this.input = val.substring(0,2);
                if (val > this.max) this.input = this.max;
            }

            if (this.type === 'int' && val < 0) {
                this.input = '';
            }

            var valid = true;
            //legnth ? 
            if (this.isCounter) {
                if (this.isMaxLength) {

                    this.setError(this.type !== 'number' ? 'maximun characters: ' + this.max : 'max: ' + this.max);
                    valid = false;
                }
                if (!this.isMinLength) {

                    if (this.type === 'int') return;

                    this.setError('minimum characters: ' + this.min);

                    valid = false;
                }
            }

            if (this.rules.length > 0) {
                var k;
                for (k in this.rules) {
                    var _func = this.getFunction(this.rules[k]);
                    var func = _func.func;
                    var param = _func.param;
                    if (!this[func](param)) {
                        valid = false;
                        this.setError(this.errorBases[_func.mess]);
                    }
                }
            }

            if (valid) {
                this.clearError();
            }
        }
    },
    methods: {
        preventAutofill: function preventAutofill() {
            var _this = this;

            var i = document.getElementsByName(this.label)[0];

            i.addEventListener("focus", function () {

                setTimeout(function () {

                    if (_this.focusFirst) return;

                    _this.input = '';

                    _this.focusFirst = true;
                }, 10);
            });
        },
        isAlphanumeric: function isAlphanumeric() {
            if (this.input.length === 0) return true;
            return (/^[a-z\d\-_\s]+$/i.test(this.input)
            );
        },
        isEmail: function isEmail() {
            if (this.input.length === 0) return true;
            var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(String(this.input).toLowerCase());
        },
        isMatch: function isMatch(param) {
            if (this.input.length === 0) return true;
            if (document.getElementsByName(param)[0] === null || typeof document.getElementsByName(param)[0] === 'undefined') return true;

            var password = document.getElementsByName(param)[0].value;
            if (password.length === 0 || password === this.input) {
                //clear error:
                this.$parent.$refs[param][0].clearError();
                return true;
            }
            return false;
        },
        isInteger: function isInteger() {
            return this.input == parseInt(this.input);
        },
        getFunction: function getFunction(f) {
            var temp = f.split(':');
            var func = 'is' + temp[0].charAt(0).toUpperCase() + temp[0].slice(1);
            var param = temp.length > 1 ? temp[1] : null;
            return {
                func: func,
                param: param,
                mess: temp[0]
            };
        },
        clickInput: function clickInput() {
            this.isFocused = true;
        },
        clickOutsideInput: function clickOutsideInput() {
            if (this.input.length === 0) this.isFocused = false;
        }
    },
    directives: {
        'click-outside': {
            bind: function bind(el, binding, vNode) {
                // Provided expression must evaluate to a function.
                if (typeof binding.value !== 'function') {
                    var compName = vNode.context.name;
                    var warn = '[Vue-click-outside:] provided expression \'' + binding.expression + '\' is not a function, but has to be';
                    if (compName) {
                        warn += 'Found in component \'' + compName + '\'';
                    }

                    console.warn(warn);
                }
                // Define Handler and cache it on the element
                var bubble = binding.modifiers.bubble;
                var handler = function handler(e) {
                    if (bubble || !el.contains(e.target) && el !== e.target) {
                        binding.value(e);
                    }
                };
                el.__vueClickOutside__ = handler;

                // add Event Listeners
                document.addEventListener('click', handler);
            },

            unbind: function unbind(el, binding) {
                // Remove Event Listeners
                document.removeEventListener('click', el.__vueClickOutside__);
                el.__vueClickOutside__ = null;
            }
        }
    }
});

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "c-input-wrap" }, [
    _c(
      "div",
      {
        staticClass: "c-input-group  c-input-group--text-field",
        class: _vm.classesInput
      },
      [
        _c("label", {
          class: {
            "has-text-link": _vm.isFocused,
            "has-text-danger": _vm.errorMutable.status
          },
          staticStyle: { "text-transform": "capitalize" },
          domProps: { textContent: _vm._s(_vm.labelComputed) }
        }),
        _vm._v(" "),
        _c("div", { staticClass: "c-input-group__input" }, [
          _vm.icon !== null
            ? _c("i", {
                staticClass: "icon material-icons c-input-group__prepend-icon",
                class: {
                  "has-text-link": _vm.isFocused,
                  "has-text-danger": _vm.errorMutable.status
                },
                attrs: { "aria-hidden": "true" },
                domProps: { textContent: _vm._s(_vm.icon) }
              })
            : _vm._e(),
          _vm._v(" "),
          _vm.typeComputed === "checkbox"
            ? _c("input", {
                directives: [
                  {
                    name: "click-outside",
                    rawName: "v-click-outside",
                    value: _vm.clickOutsideInput,
                    expression: "clickOutsideInput"
                  },
                  {
                    name: "model",
                    rawName: "v-model",
                    value: _vm.input,
                    expression: "input"
                  }
                ],
                class: { "has-text-danger": _vm.errorMutable.status },
                style: _vm.getOpacity,
                attrs: {
                  name: _vm.label,
                  tabindex: "0",
                  "aria-label": "Hint Text",
                  autocomplete: "nope",
                  disabled: _vm.disabled,
                  type: "checkbox"
                },
                domProps: {
                  checked: Array.isArray(_vm.input)
                    ? _vm._i(_vm.input, null) > -1
                    : _vm.input
                },
                on: {
                  click: _vm.clickInput,
                  change: function($event) {
                    var $$a = _vm.input,
                      $$el = $event.target,
                      $$c = $$el.checked ? true : false
                    if (Array.isArray($$a)) {
                      var $$v = null,
                        $$i = _vm._i($$a, $$v)
                      if ($$el.checked) {
                        $$i < 0 && (_vm.input = $$a.concat([$$v]))
                      } else {
                        $$i > -1 &&
                          (_vm.input = $$a
                            .slice(0, $$i)
                            .concat($$a.slice($$i + 1)))
                      }
                    } else {
                      _vm.input = $$c
                    }
                  }
                }
              })
            : _vm.typeComputed === "radio"
              ? _c("input", {
                  directives: [
                    {
                      name: "click-outside",
                      rawName: "v-click-outside",
                      value: _vm.clickOutsideInput,
                      expression: "clickOutsideInput"
                    },
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.input,
                      expression: "input"
                    }
                  ],
                  class: { "has-text-danger": _vm.errorMutable.status },
                  style: _vm.getOpacity,
                  attrs: {
                    name: _vm.label,
                    tabindex: "0",
                    "aria-label": "Hint Text",
                    autocomplete: "nope",
                    disabled: _vm.disabled,
                    type: "radio"
                  },
                  domProps: { checked: _vm._q(_vm.input, null) },
                  on: {
                    click: _vm.clickInput,
                    change: function($event) {
                      _vm.input = null
                    }
                  }
                })
              : _c("input", {
                  directives: [
                    {
                      name: "click-outside",
                      rawName: "v-click-outside",
                      value: _vm.clickOutsideInput,
                      expression: "clickOutsideInput"
                    },
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.input,
                      expression: "input"
                    }
                  ],
                  class: { "has-text-danger": _vm.errorMutable.status },
                  style: _vm.getOpacity,
                  attrs: {
                    name: _vm.label,
                    tabindex: "0",
                    "aria-label": "Hint Text",
                    autocomplete: "nope",
                    disabled: _vm.disabled,
                    type: _vm.typeComputed
                  },
                  domProps: { value: _vm.input },
                  on: {
                    click: _vm.clickInput,
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.input = $event.target.value
                    }
                  }
                }),
          _vm._v(" "),
          _vm.iconRight !== null
            ? _c("i", {
                staticClass:
                  "pointer icon material-icons c-input-group__append-icon",
                staticStyle: { "font-size": "0.8rem" },
                attrs: { "aria-hidden": "true" },
                domProps: { textContent: _vm._s(_vm.iconRight) }
              })
            : _vm._e()
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "c-input-group__details" }, [
          _c("div", {
            staticClass: "c-input-group__messages c-input-group__error",
            class: { "has-text-danger": _vm.errorMutable.status },
            domProps: { textContent: _vm._s(_vm.helperComputed) }
          }),
          _vm._v(" "),
          _vm.isCounter
            ? _c("div", {
                staticClass:
                  "c-input-group__counter c-input-group__counter--error",
                class: {
                  "has-text-danger":
                    _vm.input.length > 0 &&
                    (_vm.isMaxLength || !_vm.isMinLength)
                },
                domProps: { textContent: _vm._s(_vm.counterComputed) }
              })
            : _vm._e()
        ])
      ]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-dc6aded4", module.exports)
  }
}

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(183)
/* template */
var __vue_template__ = __webpack_require__(184)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/gender.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1f854825", Component.options)
  } else {
    hotAPI.reload("data-v-1f854825", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 183 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//import {formControlMix} from '../form/formControlMix.js';


/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    data: function data() {
        return {
            radio: this.value !== null && ['f', 'm', 't'].indexOf(this.value) > -1 ? this.value : null
        };
    },

    computed: {
        input: function input() {
            return this.radio;
        }
    },
    watch: {
        radio: function radio(val) {
            if (val !== null) this.clearError();
        }
    }
});

/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _c(
          "div",
          {
            staticStyle: {
              display: "flex",
              "align-items": "center",
              height: "38px"
            },
            style: "width: " + this.width + "%"
          },
          [
            _c(
              "label",
              { class: { "has-text-danger": _vm.errorMutable.status } },
              [_vm._v("Gender")]
            )
          ]
        ),
        _vm._v(" "),
        _c("div", { style: "width: " + (100 - this.widthComputed - 1) + "%" }, [
          _c(
            "div",
            {
              staticClass: "block",
              staticStyle: {
                margin: "0",
                height: "38px",
                display: "flex",
                "align-items": "center"
              }
            },
            [
              _c(
                "b-radio",
                {
                  attrs: { "native-value": "f", type: "is-info" },
                  model: {
                    value: _vm.radio,
                    callback: function($$v) {
                      _vm.radio = $$v
                    },
                    expression: "radio"
                  }
                },
                [_vm._v("\n            Female\n        ")]
              ),
              _vm._v(" "),
              _c(
                "b-radio",
                {
                  attrs: { "native-value": "m" },
                  model: {
                    value: _vm.radio,
                    callback: function($$v) {
                      _vm.radio = $$v
                    },
                    expression: "radio"
                  }
                },
                [_vm._v("\n            Male\n        ")]
              ),
              _vm._v(" "),
              _c(
                "b-radio",
                {
                  attrs: { "native-value": "t" },
                  model: {
                    value: _vm.radio,
                    callback: function($$v) {
                      _vm.radio = $$v
                    },
                    expression: "radio"
                  }
                },
                [_vm._v("\n            Transgender\n        ")]
              )
            ],
            1
          )
        ])
      ]
    ),
    _vm._v(" "),
    _c("div", {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.errorMutable.status,
          expression: "errorMutable.status"
        }
      ],
      staticClass: "has-text-danger",
      staticStyle: { "font-size": "0.8rem" },
      style: "padding-left:" + (+this.widthComputed + 1) + "%",
      domProps: { textContent: _vm._s(_vm.errorMutable.label) }
    })
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1f854825", module.exports)
  }
}

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(186)
/* template */
var __vue_template__ = __webpack_require__(187)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/dateOfBirth.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-fc273134", Component.options)
  } else {
    hotAPI.reload("data-v-fc273134", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 186 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__form_select_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
    components: { 'vv-select': __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default.a },
    mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        data: {
            type: Object,
            default: function _default() {
                return {};
            }
        }
    },

    data: function data() {
        return {
            dob: {
                years: this.data.year,
                months: this.data.month,
                days: this.data.day
            },
            selected: {
                year: typeof this.year === 'undefined' ? null : this.year,
                month: typeof this.month === 'undefined' ? null : this.month,
                day: typeof this.day === 'undefined' ? null : this.day
            }
        };
    },


    computed: {
        input: function input() {
            if (this.selected.year === null || this.selected.month === null || this.selected.day === null) return null;
            return this.selected.year + '-' + this.selected.month + '-' + this.selected.day;
        },
        year: function year() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            if (this.dob.years.indexOf(s[0]) === -1) return null;
            return s[0];
        },
        month: function month() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var label = monthNames[s[1] - 1];
            var value = s[1].charAt(0) == 0 ? s[1].slice(1) : s[1];
            var month = {
                label: label,
                value: value
            };
            return month;
        },
        day: function day() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            if (s[2].charAt(0) == 0) s[2] = s[2].slice(1);
            if (this.dob.days.indexOf(s[2]) === -1) return null;
            return s[2];
        }
    },

    methods: {
        setErrorChild: function setErrorChild() {
            this.$refs.year.errorMutable = this.errorMutable;
        },
        change: function change(val, type) {
            this.clearError();
            this.setErrorChild();

            if (val === null) return;

            this.selected[type] = type === 'month' ? val.value : parseInt(val);
            var k,
                toCheck = true;
            for (k in this.selected) {
                if (this.selected[k] === null) toCheck = false;
            }

            if (toCheck && !this.checkDate()) {
                this.setError('AGE < 18 years !');
                console.warn(this.errorMutable);
                this.setErrorChild();
            }
        },
        checkDate: function checkDate() {
            var dob = this.selected.year + '-' + this.selected.month + '-' + this.selected.day;
            var date = new Date(dob);
            var ageDifMs = Date.now() - date.getTime();
            var ageDate = new Date(ageDifMs);
            var valid = Math.abs(ageDate.getUTCFullYear() - 1970) < 18 ? false : true;

            return valid;
        }
    }
});

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _c(
          "div",
          {
            staticStyle: {
              display: "flex",
              "align-items": "center",
              height: "38px"
            },
            style: "width: " + this.width + "%"
          },
          [
            _c(
              "label",
              { class: { "has-text-danger": _vm.errorMutable.status } },
              [_vm._v("Date of Birth")]
            )
          ]
        ),
        _vm._v(" "),
        _c("vv-select", {
          ref: "year",
          attrs: {
            options: _vm.dob.years,
            placeholder: "Year",
            width: Math.round((100 - this.widthComputed) / 3),
            value: _vm.year,
            "error-class": _vm.errorMutable.status
          },
          on: {
            input: function($event) {
              _vm.change($event, "year")
            }
          }
        }),
        _vm._v(" "),
        _c("vv-select", {
          ref: "month",
          attrs: {
            options: _vm.dob.months,
            placeholder: "Month",
            width: Math.round((100 - this.widthComputed) / 3) - 1,
            value: _vm.month,
            "error-class": _vm.errorMutable.status
          },
          on: {
            input: function($event) {
              _vm.change($event, "month")
            }
          }
        }),
        _vm._v(" "),
        _c("vv-select", {
          ref: "day",
          attrs: {
            options: _vm.dob.days,
            placeholder: "Day",
            width: Math.round((100 - this.widthComputed) / 3) - 1,
            value: _vm.day,
            "error-class": _vm.errorMutable.status
          },
          on: {
            input: function($event) {
              _vm.change($event, "day")
            }
          }
        })
      ],
      1
    ),
    _vm._v(" "),
    _vm.errorMutable.status
      ? _c("div", {
          staticClass: "has-text-danger",
          staticStyle: { "font-size": "0.8rem" },
          style: "padding-left:" + (+this.widthComputed + 1) + "%",
          domProps: { textContent: _vm._s(_vm.errorMutable.label) }
        })
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-fc273134", module.exports)
  }
}

/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(189)
/* template */
var __vue_template__ = __webpack_require__(190)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/dateYearMonth.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-426658fe", Component.options)
  } else {
    hotAPI.reload("data-v-426658fe", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 189 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__form_select_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
    components: { 'vv-select': __WEBPACK_IMPORTED_MODULE_0__form_select_vue___default.a },
    mixins: [__WEBPACK_IMPORTED_MODULE_1__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        data: {
            type: Object,
            default: function _default() {
                return {};
            }
        }
    },

    data: function data() {
        return {
            dob: {
                years: this.data.year,
                months: this.data.month
            },
            selected: {
                year: typeof this.year === 'undefined' ? null : this.year,
                month: typeof this.month === 'undefined' ? null : this.month
            }
        };
    },


    computed: {
        input: function input() {

            if (this.selected.year === null) return null;

            if (this.selected.month === null) return this.selected.year;

            return this.selected.year + '-' + this.selected.month;
        },
        year: function year() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            if (this.dob.years.indexOf(s[0]) === -1) return null;
            return s[0];
        },
        month: function month() {
            if (this.value === null || this.value.length === 0) return null;
            var s = this.value.split('-');
            var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var label = monthNames[s[1] - 1];
            var value = s[1].charAt(0) == 0 ? s[1].slice(1) : s[1];
            var month = {
                label: label,
                value: value
            };
            return month;
        }
    },

    methods: {
        setErrorChild: function setErrorChild() {
            this.$refs.year.errorMutable = this.errorMutable;
        },
        change: function change(val, type) {

            this.clearError();

            this.setErrorChild();

            if (val === null) return;

            this.selected[type] = type === 'month' ? val.value : parseInt(val);

            var k,
                toCheck = true;

            for (k in this.selected) {

                if (this.selected[k] === null) toCheck = false;
            }

            /*
            if (toCheck && !this.checkDate()) {
                this.setError('AGE < 18 years !');
                console.warn(this.errorMutable)
                this.setErrorChild();
            }
            */
        },
        checkDate: function checkDate() {
            var dob = this.selected.year + '-' + this.selected.month + '-' + this.selected.day;
            var date = new Date(dob);
            var ageDifMs = Date.now() - date.getTime();
            var ageDate = new Date(ageDifMs);
            var valid = Math.abs(ageDate.getUTCFullYear() - 1970) < 18 ? false : true;

            return valid;
        }
    }
});

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _c(
          "div",
          {
            staticStyle: {
              display: "flex",
              "align-items": "center",
              height: "38px"
            },
            style: "width: " + this.width + "%"
          },
          [
            _c(
              "label",
              { class: { "has-text-danger": _vm.errorMutable.status } },
              [_vm._v("Date")]
            )
          ]
        ),
        _vm._v(" "),
        _c("vv-select", {
          ref: "year",
          attrs: {
            options: _vm.dob.years,
            placeholder: "Year",
            width: Math.round((100 - this.widthComputed) / 2),
            value: _vm.year,
            "error-class": _vm.errorMutable.status
          },
          on: {
            input: function($event) {
              _vm.change($event, "year")
            }
          }
        }),
        _vm._v(" "),
        _c("vv-select", {
          ref: "month",
          attrs: {
            options: _vm.dob.months,
            placeholder: "Month",
            width: Math.round((100 - this.widthComputed) / 2) - 1,
            value: _vm.month,
            "error-class": _vm.errorMutable.status
          },
          on: {
            input: function($event) {
              _vm.change($event, "month")
            }
          }
        })
      ],
      1
    ),
    _vm._v(" "),
    _vm.errorMutable.status
      ? _c("div", {
          staticClass: "has-text-danger",
          staticStyle: { "font-size": "0.8rem" },
          style: "padding-left:" + (+this.widthComputed + 1) + "%",
          domProps: { textContent: _vm._s(_vm.errorMutable.label) }
        })
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-426658fe", module.exports)
  }
}

/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(192)
/* template */
var __vue_template__ = __webpack_require__(193)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/captcha.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4a503374", Component.options)
  } else {
    hotAPI.reload("data-v-4a503374", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 192 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        captcha: {
            type: String,
            default: null
        }
    },
    data: function data() {
        return {
            isLoading: false,
            captchaMutated: this.captcha,
            input: ''
        };
    },
    mounted: function mounted() {
        console.log(this.captcha);
    },

    methods: {
        refresh: function refresh() {
            var _this = this;

            this.isLoading = true;
            axios.get('/refresh_captcha').then(function (response) {
                _this.isLoading = false;
                _this.captchaMutated = response.data.captcha;
            }, function (error) {
                _this.isLoading = false;
            });
        }
    }
});

/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _c(
          "div",
          {
            staticStyle: {
              display: "flex",
              "align-items": "center",
              height: "38px"
            },
            style: "width: " + this.width + "%"
          },
          [
            _c(
              "label",
              { class: { "has-text-danger": _vm.errorMutable.status } },
              [_vm._v("Captcha")]
            )
          ]
        ),
        _vm._v(" "),
        _c("div", { style: "width: " + (100 - this.widthComputed) + "%" }, [
          _c("div", { staticClass: "v-c-captcha-wrapper" }, [
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.input,
                  expression: "input"
                }
              ],
              staticClass: "input",
              class: { "is-danger": _vm.errorMutable.status },
              attrs: { type: "text", name: "captcha", value: "" },
              domProps: { value: _vm.input },
              on: {
                keyup: _vm.clearError,
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.input = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c("div", { staticClass: "field has-addons" }, [
              _c("div", {
                staticClass: "control captcha",
                domProps: { innerHTML: _vm._s(_vm.captchaMutated) }
              }),
              _vm._v(" "),
              _c("div", { staticClass: "control" }, [
                _c(
                  "div",
                  {
                    staticClass: "button",
                    class: {
                      "tooltip is-tooltip-warning": !_vm.isLoading,
                      "is-loading": _vm.isLoading
                    },
                    attrs: {
                      "data-tooltip": "Refresh captcha",
                      id: "refresh-captcha"
                    },
                    on: { click: _vm.refresh }
                  },
                  [
                    _c("i", { staticClass: "material-icons" }, [
                      _vm._v("cached")
                    ])
                  ]
                )
              ])
            ])
          ])
        ])
      ]
    ),
    _vm._v(" "),
    _c("div", {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.errorMutable.status,
          expression: "errorMutable.status"
        }
      ],
      staticClass: "has-text-danger",
      staticStyle: { "font-size": "0.8rem" },
      style: "padding-left:" + (+this.widthComputed + 1) + "%",
      domProps: { textContent: _vm._s(_vm.errorMutable.label) }
    })
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4a503374", module.exports)
  }
}

/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(195)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(197)
/* template */
var __vue_template__ = __webpack_require__(207)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/tag.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1f85cd66", Component.options)
  } else {
    hotAPI.reload("data-v-1f85cd66", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(196);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("ffd9a948", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1f85cd66\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tag.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1f85cd66\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./tag.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.taginput .taginput-container.is-focusable{\n\n    border-width: 0px!important;\n    background: transparent!important;\n}\n", ""]);

// exports


/***/ }),
/* 197 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_debounce__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_debounce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_lodash_debounce__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        tags: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        allowNew: {
            type: Boolean,
            default: false
        },
        keyProp: {
            type: String,
            default: 'name'
        },
        url: {
            type: String,
            default: ''
        },
        placeholder: {},
        isArray: {
            type: Boolean,
            default: false
        },
        helper: {
            type: String,
            default: null
        }
    },

    mounted: function mounted() {

        this.values = this.temp = this.tags !== null ? this.tags : [];
    },


    computed: {
        isArrayComputed: function isArrayComputed() {
            return typeof this.isArray === 'undefined' || this.isArray === null ? false : this.isArray;
        },
        placeholderComputed: function placeholderComputed() {
            if (this.placeholder === null) return 'Add a ' + this.removeUnderscore(this.label.replace(/s+$/g, ''));
            if (!this.placeholder) return '';
            return this.removeUnderscore(this.placeholder);
        }
    },

    data: function data() {
        return {

            values: [],
            data: [],
            temp: [],

            filteredTags: this.tags,
            isSelectOnly: false,
            isFetching: false,
            input: this.tags,
            badTags: []
        };
    },


    watch: {
        tags: function tags(val) {
            this.input = val;
            this.$emit('change', val);
        }
    },

    methods: {
        beforeAdding: function beforeAdding(tag) {
            var _this = this;

            for (var k = 0; k < this.values.length; k++) {

                if (tag.id && tag.id == this.values[k].id) {
                    //console.error('SAME ID');
                    return false;
                }

                if (!tag.id && tag == this.values[k].name) {
                    //console.error('SAME NAME');
                    return false;
                }
            }

            var name = Object.prototype.toString.call(tag) === '[object Object]' && tag.hasOwnProperty('name') ? tag.name : tag;

            if (!/^[a-z\d\-_\s]+$/i.test(name)) {

                this.badTags.push(name);

                this.setError(this.removeUnderscore(this.label) + ' not alphanumeric!');

                setTimeout(function () {

                    _this.clearError();
                }, 3000);

                return false;
            }

            return true;
        },


        getAsyncData: __WEBPACK_IMPORTED_MODULE_1_lodash_debounce___default()(function (text) {
            var _this2 = this;

            if (text.length < 1 || this.url === null) return;

            this.isFetching = true;

            axios.get('/rest/' + this.url + '?q=' + text).then(function (response) {

                _this2.isFetching = false;

                var response = response.data.result;

                _this2.data = response.map(function (val) {
                    return val;
                });
            }, function (error) {

                _this2.isFetching = false;

                throw error;
            });
        }, 500),

        addTag: function addTag(value) {

            var name = '';

            if (typeof value === 'string') {

                name = value.replace(/\s+/g, '-').toLowerCase();

                //} else if (!value.hasOwnProperty('id')){
            } else {

                name = value.name.replace(/\s+/g, '-').toLowerCase();
            }

            var obj = !this.isArrayComputed ? { id: null, name: name } : name;

            this.values.pop();

            this.values.push(obj);

            this.clearError();
        },
        removeTag: function removeTag(value) {

            var index = this.badTags.indexOf(value.name);

            if (index > -1) this.badTags.splice(index);

            if (this.badTags.length === 0) this.clearError();
        }
    }
});

/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(24),
    now = __webpack_require__(199),
    toNumber = __webpack_require__(201);

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

module.exports = debounce;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(25);

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

module.exports = now;


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(24),
    isSymbol = __webpack_require__(202);

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(203),
    isObjectLike = __webpack_require__(206);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(26),
    getRawTag = __webpack_require__(204),
    objectToString = __webpack_require__(205);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(26);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 205 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 206 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _vm._t("tags"),
      _vm._v(" "),
      _c(
        "div",
        {
          staticStyle: { display: "flex", "justify-content": "space-between" }
        },
        [
          _vm.label !== ""
            ? _c(
                "div",
                {
                  staticStyle: {
                    display: "flex",
                    "align-items": "center",
                    height: "38px"
                  },
                  style: "width: " + this.width + "%"
                },
                [
                  _c("label", {
                    class: { "has-text-danger": _vm.errorMutable.status },
                    staticStyle: { "text-transform": "capitalize" },
                    domProps: {
                      textContent: _vm._s(_vm.removeUnderscore(_vm.label))
                    }
                  })
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _c(
            "div",
            {
              staticStyle: { position: "relative" },
              style: "width: " + (100 - this.widthComputed) + "%"
            },
            [
              _c(
                "b-taginput",
                {
                  attrs: {
                    type: "is-warning",
                    value: _vm.values,
                    data: _vm.data,
                    "allow-new": _vm.allowNew,
                    autocomplete: "",
                    field: "name",
                    icon: "label",
                    placeholder: _vm.placeholderComputed,
                    loading: _vm.isFetching,
                    "before-adding": _vm.beforeAdding
                  },
                  on: {
                    typing: _vm.getAsyncData,
                    add: _vm.addTag,
                    remove: _vm.removeTag
                  },
                  scopedSlots: _vm._u([
                    {
                      key: "default",
                      fn: function(props) {
                        return [
                          _vm._v(
                            "\n                         " +
                              _vm._s(props.option) +
                              "\n                     "
                          )
                        ]
                      }
                    }
                  ]),
                  model: {
                    value: _vm.tags,
                    callback: function($$v) {
                      _vm.tags = $$v
                    },
                    expression: "tags"
                  }
                },
                [
                  _c("template", { slot: "empty" }, [
                    _vm._v(
                      "\n                         No items found\n                         "
                    ),
                    _vm.allowNew
                      ? _c("span", { staticClass: "m-l-5" }, [
                          _vm._v("press ENTER to create a new one")
                        ])
                      : _vm._e()
                  ])
                ],
                2
              )
            ],
            1
          )
        ]
      ),
      _vm._v(" "),
      _vm.errorMutable.status
        ? _c("div", {
            staticClass: "has-text-danger",
            staticStyle: { "font-size": "0.8rem" },
            style: "padding-left:" + (+this.widthComputed + 1) + "%",
            domProps: { textContent: _vm._s(_vm.errorMutable.label) }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.helper !== null
        ? _c("div", {
            staticClass: "c s-8 has-text-grey",
            style: "padding-left:" + (+this.widthComputed + 1) + "%",
            domProps: { textContent: _vm._s(_vm.helper) }
          })
        : _vm._e()
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1f85cd66", module.exports)
  }
}

/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(209)
/* template */
var __vue_template__ = __webpack_require__(210)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/checkbox.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-582c7d27", Component.options)
  } else {
    hotAPI.reload("data-v-582c7d27", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 209 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




//import debounce from 'lodash/debounce'


/* harmony default export */ __webpack_exports__["default"] = ({
    mixins: [__WEBPACK_IMPORTED_MODULE_0__mixins_formControlMix_js__["a" /* formControlMix */]],
    props: {
        values: {
            type: Array,
            default: function _default() {
                return [];
            }
        },

        value: {
            type: Array,
            default: function _default() {
                return [];
            }
        },

        isVertical: {
            type: Boolean,
            default: false
        }
    },

    data: function data() {
        return {

            input: typeof this.value === 'undefined' || this.value === null ? [] : this.value

        };
    },


    watch: {
        input: function input(val) {

            if (val.length > 0) this.clearError();

            //console.warn('checkbox input : ', val)

            //this.$emit('change', val)
        }
    },

    methods: {}
});

/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticStyle: { display: "flex", "justify-content": "space-between" } },
      [
        _vm.label !== ""
          ? _c("div", { style: "width: " + this.width + "%" }, [
              _c("label", {
                class: { "has-text-danger": _vm.errorMutable.status },
                staticStyle: { "text-transform": "capitalize" },
                domProps: { textContent: _vm._s(_vm.labelComputed) }
              })
            ])
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          {
            staticClass: "flex flex-warp",
            class: { "flex-column": _vm.isVertical },
            style: "width: " + (100 - this.widthComputed) + "%"
          },
          _vm._l(_vm.values, function(checkbox, index) {
            return _c(
              "b-checkbox",
              {
                key: index,
                staticClass: "m-b-5",
                class: { "m-l-0": _vm.isVertical },
                attrs: { "native-value": checkbox, type: "is-info" },
                model: {
                  value: _vm.input,
                  callback: function($$v) {
                    _vm.input = $$v
                  },
                  expression: "input"
                }
              },
              [_vm._v("\n             " + _vm._s(checkbox) + "\n         ")]
            )
          })
        )
      ]
    ),
    _vm._v(" "),
    _vm.errorMutable.status
      ? _c("div", {
          staticClass: "has-text-danger",
          staticStyle: { "font-size": "0.8rem" },
          style: "padding-left:" + (+this.widthComputed + 1) + "%",
          domProps: { textContent: _vm._s(_vm.errorMutable.label) }
        })
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-582c7d27", module.exports)
  }
}

/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(212)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(214)
/* template */
var __vue_template__ = __webpack_require__(215)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/form.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1d970ba8", Component.options)
  } else {
    hotAPI.reload("data-v-1d970ba8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(213);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("032efe62", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1d970ba8\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./form.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1d970ba8\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./form.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\nform {\n    border-left: 1px solid hsl(0, 0%, 86%);\n    padding: 20px;\n}\nform button {\n    text-transform: uppercase;\n    margin-top: 40px;\n}\n.subformxxxxx{\n    border:4px solid green;\n    padding: 10px;\n}\n", ""]);

// exports


/***/ }),
/* 214 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_scrollto__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_scrollto___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue_scrollto__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({

    props: {

        p: {
            type: Object,
            default: null
        },
        label: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        },
        isAjax: {
            type: Boolean,
            default: true
        },

        reference: {
            type: String,
            default: null
        },

        isToggleSubform: {
            type: Boolean,
            default: false
        },

        maxWidth: {
            type: Number,
            default: 500
        }
    },

    data: function data() {
        return {

            isResponseAjax: false,
            responseAjax: '',
            isLoading: false,
            toggleSubform: false,
            error: {
                status: false,
                success: false,
                label: null
            },
            labelMutated: this.label
        };
    },


    computed: {
        form: function form() {
            return this.$store.state.form.form;
        },
        subform: function subform() {
            return this.$store.state.form.subform;
        },
        errors: function errors() {
            return this.$store.state.form.errors;
        },
        display: function display() {
            return this.$store.state.form.display;
        }
    },

    created: function created() {

        if (this.url !== null) this.$store.dispatch('form/setUrl', this.url);

        this.$store.dispatch('form/init');
    },
    mounted: function mounted() {

        this.iconTagsFix();
    },


    methods: {
        iconTagsFix: function iconTagsFix() {

            var c = document.querySelectorAll("i.mdi.mdi-label");

            if (typeof c === 'undefined' || c.length === 0) return;

            Array.from(c).forEach(function (div, i) {

                div.className = "material-icons";

                div.innerHTML = 'label';
            });
        },
        triggerSubform: function triggerSubform(val) {

            var upload = this.$store.state.form.upload;

            if (val && upload !== null && typeof upload !== 'undefined' && upload.settings.type === 'product') {

                var products = this.$store.state.form.c.datas.products;

                for (var k in this.form.subform) {

                    this.form.subform[k].enum = products[val][k];
                }

                //this.$store.commit('form/setSubform', this.form.subform)
            }

            if (this.isToggleSubform) this.toggleSubform = val;
        },
        disableUpload: function disableUpload(val) {

            if (val) {

                this.labelMutated = 'submit';

                this.$store.dispatch('form/changeCallback', 'submit');

                if (typeof _user !== 'undefined') {

                    this.$store.commit('form/appendData', ['user_id', _user.id]);
                }

                if (this.$store.state.form.hasOwnProperty('upload') && this.$store.state.form.upload.hasOwnProperty('settings')) {

                    this.$store.commit('form/appendData', ['media', this.$store.state.form.upload.settings.type]);
                }

                return;
            }

            this.labelMutated = 'next';

            this.$store.dispatch('form/changeCallback', 'next');

            this.$store.commit('form/removeData', 'user_id');

            this.$store.commit('form/removeData', 'media');
        },
        setSwitches: function setSwitches(obj) {},
        setSwitch: function setSwitch(val, index, ref, field, subform) {

            if (typeof subform === 'undefined' && this.isToggleProduced && field === 'type' && ref === 'produced') {

                this.toggleProduced = val;
            }

            if (!val) return;

            var _switches = subform ? this.form.subform[field].switches : this.form[field].switches;

            for (var k in _switches) {

                k = parseInt(k);

                if (k !== index) _switches[k].status = false;
            }

            //this.selectedSwitch = this.upload.switches[index]
        },
        check: function check(form) {
            var _this = this;

            for (var k in form) {

                var type = form[k].type;

                if (typeof this.$refs[k] === 'undefined') {

                    console.warn('testing k ::', k, this.$refs[k]);

                    continue;
                }

                var child = this.$refs[k][0];

                if (typeof child === 'undefined') continue;

                if ((!form[k].hasOwnProperty('disabled') || !form[k].disabled) && form[k].required && (child.input === null || child.input.length === 0 || !child.input)) {

                    child.setError('REQUIRED');

                    this.$store.dispatch('form/setError', k);
                }

                if (k === 'subform' && this.toggleSubform) this.check(form.subform);

                if (form[k].type === 'tag') {
                    (function () {

                        var tags = [];

                        //child.values.map(val => tags.push(JSON.stringify(val)));


                        child.values.map(function (val) {

                            // var t = (typeof val === 'string') ? val : JSON.stringify(val);

                            var t = val;

                            tags.push(t);
                        });

                        _this.$store.commit('form/appendData', [k, tags]);

                        /*
                        child.values.map((val) => {
                                                    
                            this.$store.commit('form/appendData', [k + '[]', JSON.stringify(val)])
                        });
                        */
                    })();
                } else this.$store.commit('form/appendData', [k, child.input]);
            }
        },
        submit: function submit() {
            var _this2 = this;

            this.check(this.form);

            if (!this.isAjax) {

                if (this.$store.state.form.errors.length > 0) return;

                document.forms['form-' + this.label].submit();

                return;
            }

            this.isLoading = true;

            this.$store.dispatch('form/' + this.$store.state.form.callback).then(function (r) {

                _this2.isLoading = false;

                if (_this2.label === null) _this2.$emit('done');

                //this.$store.dispatch('form/hideForm')

                _this2.error = { status: true, success: true, label: r.data.message };

                __WEBPACK_IMPORTED_MODULE_0_vue_scrollto___default.a.scrollTo(document.getElementById("header"), 1000, {});
            }).catch(function (e) {

                //console.error('e :::::::: => ', e)

                _this2.isLoading = false;

                if (_this2.label === null) _this2.$emit('done');

                var captcha = document.getElementById('refresh-captcha');

                if (!e.hasOwnProperty('response')) return;

                var status = e.response.status;

                if ([404, 403, 500].indexOf(status) > -1) _this2.error = { status: true, success: false, label: 'Error system' };

                if ([401].indexOf(status) > -1) _this2.error = { status: true, success: false, label: 'You need to be logged in' };

                if (captcha !== null) captcha.click();

                console.error('RESPONSE ERROR :: ', e.response.data);

                if (!e.response.data.hasOwnProperty('errors')) return;

                for (var k in e.response.data.errors) {

                    console.warn(k);

                    console.warn(e.response.data.errors[k]);

                    if (typeof _this2.$refs[k] !== 'undefined') {

                        _this2.$refs[k][0].setError(e.response.data.errors[k][0]);
                    } else _this2.error = { status: true, success: false, label: e.response.data.errors[k][0] };
                }

                console.warn('STORE: ', _this2.$store.state.form.errors);
            });
        }
    }

});

/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "elevation-8 center-auto",
      style: "max-width:" + _vm.maxWidth + "px"
    },
    [
      _c("b-notification", {
        staticClass: "elevation-8",
        attrs: { type: "is-link", active: _vm.isResponseAjax },
        domProps: { textContent: _vm._s(_vm.responseAjax) },
        on: {
          "update:active": function($event) {
            _vm.isResponseAjax = $event
          }
        }
      }),
      _vm._v(" "),
      _vm.display.form
        ? _c(
            "form",
            {
              attrs: {
                action: _vm.url,
                method: "POST",
                id: "form-" + _vm.label
              },
              on: {
                submit: function($event) {
                  $event.preventDefault()
                  return _vm.submit($event)
                }
              }
            },
            [
              _vm._t("default"),
              _vm._v(" "),
              _vm._l(_vm.form, function(item, field, index) {
                return _c(
                  "div",
                  {
                    class: field === "subform" ? "" : "c-input--" + field,
                    staticStyle: { "margin-bottom": "5px" }
                  },
                  [
                    item.type === "string" ||
                    item.type === "int" ||
                    item.type === "password"
                      ? _c("vv-input", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            value: item.value,
                            error: item.error,
                            required: item.required,
                            rules: item.rules,
                            helper: item.helper,
                            max: item.max,
                            min: item.min,
                            icon: item.icon,
                            type: item.type,
                            disabled: item.disabled
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "text"
                      ? _c("vv-textarea", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            value: item.value,
                            required: item.required
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "bool"
                      ? _c("vv-switch", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            name:
                              item.label && item.label.length > 0
                                ? item.label
                                : field,
                            "switch-prop": field + "Switch",
                            value: item.value == 1,
                            label: field
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "enum"
                      ? _c("vv-select-label", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            options: item.enum,
                            value: item.value,
                            required: item.required,
                            trigger: item.triggerSubform,
                            "width-style": item.widthStyle,
                            "margin-style": item.marginStyle
                          },
                          on: {
                            trigger: function($event) {
                              _vm.triggerSubform($event)
                            }
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "tag"
                      ? _c("vv-tag", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            tags: item.value,
                            required: item.required,
                            "allow-new": item.allowNew,
                            "key-prop": item.key,
                            "is-array": item.isArray,
                            helper: item.hasOwnProperty("helper")
                              ? item.helper
                              : null,
                            placeholder: item.hasOwnProperty("placeholder")
                              ? item.placeholder
                              : null,
                            url: item.url
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "gender"
                      ? _c("vv-gender", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            value: item.value,
                            error: item.error,
                            required: item.required
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "dob"
                      ? _c("vv-dob", {
                          ref: field,
                          refInFor: true,
                          staticStyle: { "margin-top": "20px" },
                          attrs: {
                            label: field,
                            data: item.datas,
                            value: item.value,
                            error: item.error,
                            required: item.required
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "date_year_month"
                      ? _c("vv-date-year-month", {
                          ref: field,
                          refInFor: true,
                          staticStyle: { "margin-top": "20px" },
                          attrs: {
                            label: field,
                            data: item.datas,
                            value: item.value,
                            error: item.error,
                            required: item.required
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "captcha"
                      ? _c("vv-captcha", {
                          ref: "captcha",
                          refInFor: true,
                          attrs: {
                            captcha: item.datas,
                            label: field,
                            error: item.error,
                            required: item.required
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "switches" &&
                    item.switches &&
                    item.switches.length > 1
                      ? _c("vv-switches", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            switches: item.switches,
                            label: field,
                            "is-vertical": "",
                            "is-center": ""
                          },
                          on: {
                            change: function($event) {
                              _vm.setSwitches($event)
                            },
                            trigger: function($event) {
                              _vm.triggerSubform($event)
                            },
                            disableUpload: function($event) {
                              _vm.disableUpload($event)
                            }
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    item.type === "checkbox" &&
                    item.enum &&
                    item.enum.length > 1
                      ? _c("vv-checkbox", {
                          ref: field,
                          refInFor: true,
                          attrs: {
                            label: field,
                            values: item.enum,
                            value: item.value,
                            "is-vertical": item.hasOwnProperty("vertical")
                              ? item.vertical
                              : false
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _c("transition", { attrs: { name: "fade" } }, [
                      field === "subform"
                        ? _c(
                            "div",
                            {
                              directives: [
                                {
                                  name: "show",
                                  rawName: "v-show",
                                  value: _vm.toggleSubform,
                                  expression: "toggleSubform"
                                }
                              ],
                              ref: "subform",
                              refInFor: true,
                              staticClass: "subform"
                            },
                            _vm._l(_vm.form.subform, function(sub, f, i) {
                              return _c(
                                "div",
                                { key: i },
                                [
                                  ["string", "int", "password"].indexOf(
                                    sub.type
                                  ) > -1
                                    ? _c("vv-input", {
                                        ref: f,
                                        refInFor: true,
                                        class: [
                                          { "m-b-30": f === "price" },
                                          { "m-t-20": f === "price" }
                                        ],
                                        attrs: {
                                          label: f,
                                          value: sub.value,
                                          error: sub.error,
                                          required: sub.required,
                                          rules: sub.rules,
                                          helper: sub.helper,
                                          max: sub.max,
                                          min: sub.min,
                                          icon: sub.icon,
                                          type: sub.type,
                                          disabled: sub.disabled
                                        }
                                      })
                                    : _vm._e(),
                                  _vm._v(" "),
                                  sub.type === "switches" &&
                                  sub.switches &&
                                  sub.switches.length > 1
                                    ? _c("vv-switches", {
                                        ref: f,
                                        refInFor: true,
                                        attrs: {
                                          switches: sub.switches,
                                          label: f,
                                          "is-vertical": ""
                                        }
                                      })
                                    : _vm._e(),
                                  _vm._v(" "),
                                  sub.type === "bool"
                                    ? _c("vv-switch", {
                                        ref: f,
                                        refInFor: true,
                                        attrs: {
                                          name:
                                            sub.label && sub.label.length > 0
                                              ? sub.label
                                              : f,
                                          "switch-prop": f + "Switch",
                                          value: sub.value == 1,
                                          label: f
                                        }
                                      })
                                    : _vm._e(),
                                  _vm._v(" "),
                                  sub.type === "enum" && sub.enum !== null
                                    ? _c("vv-select-label", {
                                        ref: f,
                                        refInFor: true,
                                        staticClass: "m-t-5",
                                        attrs: {
                                          width: 0,
                                          "width-style": sub.widthStyle,
                                          "margin-style": sub.marginStyle,
                                          label: f,
                                          options: sub.enum,
                                          value: sub.value,
                                          required: sub.required
                                        }
                                      })
                                    : _vm._e()
                                ],
                                1
                              )
                            })
                          )
                        : _vm._e()
                    ])
                  ],
                  1
                )
              }),
              _vm._v(" "),
              _vm.label !== null
                ? _c("button", {
                    staticClass: "button is-primary is-large",
                    class: { "is-loading": _vm.isLoading },
                    attrs: { disabled: _vm.errors.length > 0 },
                    domProps: { textContent: _vm._s(_vm.labelMutated) }
                  })
                : _vm._e(),
              _vm._v(" "),
              _vm._t("after")
            ],
            2
          )
        : _vm._e(),
      _vm._v(" "),
      _c("error", { attrs: { error: _vm.error } })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1d970ba8", module.exports)
  }
}

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(217)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(219)
/* template */
var __vue_template__ = __webpack_require__(229)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/upload.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4903c365", Component.options)
  } else {
    hotAPI.reload("data-v-4903c365", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(218);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("a93ea6e8", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4903c365\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./upload.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4903c365\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./upload.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.fade-enter-active, .fade-leave-active {\n  -webkit-transition: opacity 2s;\n  transition: opacity 2s;\n}\n.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {\n  opacity: 0;\n}\n.box-avatar-buttons{\n  border:0px solid red;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.box-avatar-buttons > div{\n  margin: 10px;\n}\n.modal-my-content{\n  border:10px solid green;\n  z-index: 20;\n  background-color: white;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  max-width: calc(100% - 15%);\n  max-height: 100vh;\n}\n.box-img{\n  border:0px solid red;\n  max-height: 70vh;\n  max-width: calc(100% - 15%);\n  padding: 0px;\n}\n/* Limit image width to avoid overflow the container */\n.box-img img {\n  max-width: 100%; /* This rule is very important, please do not ignore this! */\n}\n.box-preview{\n  overflow: hidden;\n  height: 200px;\n  width: 200px;\n  position: absolute;\n  top:4px;\n  left:4px;\n  border:4px solid orange;\n}\n.modal-close{\n  z-index:200;\n}\n.modal-box{\n  border:0px solid orange;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  z-index: 20;\n  padding: 5px;\n}\n.wrapper-media.notification{\n  padding: 1.25rem 5px 1.25rem 5px;\n}\n.wrapper-media .media-left{\n    border:4px solid red;\n}\n.wrapper-media .media-left > video{\n    height: 150px;\n}\n.wrapper-media .media-left > img{\n    height: 100px !important;\n}\n.wrapper-media .media-content{\n    border:4px solid green;\n}\n", ""]);

// exports


/***/ }),
/* 219 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inputFile_vue__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inputFile_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__inputFile_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_scrollto__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_scrollto___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_scrollto__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_cropperjs__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__social_mixins_mixError__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__blobMedia_vue__);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

//import Thumbs from '../../classes/thumbsClass'










/* harmony default export */ __webpack_exports__["default"] = ({

    mixins: [__WEBPACK_IMPORTED_MODULE_3__social_mixins_mixError__["a" /* mixError */]],

    components: {
        vsInputFile: __WEBPACK_IMPORTED_MODULE_0__inputFile_vue___default.a,
        blobMedia: __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue___default.a
    },

    props: {

        reference: {
            type: String,
            default: ''
        },

        label: {
            type: String,
            default: null
        }
    },

    data: function data() {
        return {

            files: [],
            error: {
                status: false,
                success: false,
                label: ''
            },

            isEdit: false,
            editLink: null,

            edit: false,
            cropper: null,
            isCropperLoading: true,
            selectedSwitch: null,
            directory: false,
            drop: true,
            dropDirectory: true,
            addIndex: false,
            thread: 3,
            name: 'file',
            headers: {
                'X-CSRF-TOKEN': token.content,
                //"Content-Type":"multipart/form-data" // WARNING::::::DOESNT WOrK!!!!!!!,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
                user_id: _user.id,
                //id: _user.uid + Date.now() + Math.random()
                id: _user.uid + new Date().valueOf() + Math.floor(Math.random() * 100000 + 1)
            },
            autoCompress: 1024 * 1024,
            uploadAuto: false,
            isOption: false,
            addData: {
                show: false,
                name: '',
                type: '',
                content: ''
            },
            editFile: {
                show: false,
                name: ''
            }
        };
    },
    mounted: function mounted() {
        var _this2 = this;

        this.setSelectedSwitch();

        this.$store.watch(function (state) {
            return _this2.$store.getters['form/getDisplay'];
        }, function (val) {

            if (val.upload) {
                _this2.data = _extends({}, _this2.data, _this2.$store.state.form.datas, { media: _this2.media });
                console.warn('DATA :::', _this2.data);
            }
        }, { deep: true });
    },


    computed: {
        upload: function upload() {
            return this.$store.state.form.upload;
        },
        switches: function switches() {
            return this.$store.state.form.upload.switches;
        },
        display: function display() {
            //return this.$store.state.form.display
            return this.$store.getters['form/getDisplay'];
        },
        media: function media() {
            return this.$store.state.form.upload.settings.type;
        },
        accept: function accept() {

            return '';

            var accept = '';

            for (var k in this.upload.settings.valid_file_upload) {

                accept += this.upload.settings.type + '/' + this.upload.settings.valid_file_upload[k];

                if (k < this.upload.settings.valid_file_upload.length - 1) accept += ',';
            }

            return accept;
        },
        multiple: function multiple() {

            if (['video', 'extract'].indexOf(this.upload.settings.type) > -1 || this.upload.cropper) return false;

            return true;
        },
        extensions: function extensions() {
            return this.upload.settings.valid_file_upload.toString();
        },
        minSize: function minSize() {
            return this.upload.settings.min_size_upload;
        },
        size: function size() {
            return this.upload.settings.max_size_upload;
        },
        postAction: function postAction() {
            return this.upload.settings.url;
        },
        putAction: function putAction() {
            return this.upload.settings.url;
        },
        maximum: function maximum() {
            return this.upload.settings.max_file_upload;
        }
    },

    filters: {
        formatSize: function formatSize(a) {
            var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

            if (0 == a) return "0 Bytes";
            var c = 1024,
                d = b || 2,
                e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
                f = Math.floor(Math.log(a) / Math.log(c));
            return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
        }
    },

    methods: {
        setSwitches: function setSwitches(obj) {

            if (obj.val) {

                this.selectedSwitch = this.upload.switches[obj.index];

                this.data.switch = this.selectedSwitch.ref;
            }
        },
        setSelectedSwitch: function setSelectedSwitch() {

            if (!this.upload.hasOwnProperty('switches') || this.upload.switches === null) return;

            for (var k in this.switches) {

                if (this.switches[k].status) {

                    this.selectedSwitch = this.upload.switches[k];

                    break;
                }
            }

            this.data.switch = this.selectedSwitch.ref;
        },
        remove: function remove(file) {

            if (this.files.length < 2) this.isEdit = false;

            this.$refs.upload.remove(file);
        },
        inputFile: function inputFile(newFile, oldFile) {
            var _this3 = this;

            /*
            | Cropper:
            */
            if (newFile && !oldFile && this.upload.cropper) {

                console.warn('INIT CROPPER', this.files);

                this.$nextTick(function () {
                    return _this3.edit = true;
                });

                return;

                //this.$nextTick(function () { this.edit = true })
            }

            if (newFile && oldFile) {

                /*
                // update
                if (newFile.active && !oldFile.active) {
                    // beforeSend
                    // min size
                    if (newFile.size >= 0 && this.minSize > 0 && newFile.size < this.minSize) {
                        this.$refs.upload.update(newFile, {
                            error: 'size'
                        })
                    }
                }
                */

                /*
                | RESPONSE AFTER UPLAOD :
                */
                if (!newFile.active && oldFile.active) {

                    /*
                    | ERROR :
                    */
                    if (newFile.error && oldFile.error) {

                        var _error = 'Error system';

                        console.error('newFile.response :::::::: => ', newFile.response);

                        if (newFile.xhr.status === 422) {

                            _error = 'Error: ';

                            for (var k in newFile.response.errors) {
                                _error += '<br />' + newFile.response.errors[k][0];
                            }
                        } else if (newFile.xhr.status === 401) _error = 'ERROR: You need to be logged in';else if (newFile.response.error) _error = 'ERROR: ' + newFile.response.error;

                        this.$refs.upload.update(oldFile, { error: _error, loading: false });
                    }
                }

                /*
                | PROGRESS :
                */
                if (newFile.progress !== oldFile.progress) {}
                // progress


                /*
                | SUCCESS (AFTER UPLOAD) :
                */
                if (newFile.success && !oldFile.success) {

                    if (this.upload.hasOwnProperty('edit') && this.upload.edit && this.upload.edit.length > 0) {

                        if (typeof newFile.response.slug !== 'undefined') {

                            this.editLink = this.upload.edit + newFile.response.slug;

                            this.isEdit = true;
                        }
                    }

                    this.$refs.upload.update(oldFile.id, { loading: false });

                    return;

                    /*
                    // THUMBS ::
                    if (this.uploadRoot.type === 'video'){
                        var file = this.$refs.upload.get(oldFile.id);
                        var id = newFile.response.files[0].vid;
                        var uid = newFile.response.files[0].id;
                        var slug = newFile.response.files[0].slug;
                        file.thumbs = new Thumbs(uid);
                        file.thumbs.start().then((response) => {
                            this.$refs.upload.update(file, {thumbs : { process : false, src : response}, editURL : this.uploadRoot.edit + id});
                        }).catch((e) => {
                            this.$refs.upload.update(file, {thumbs : { process : false}, editURL : this.uploadRoot.edit + slug});
                        });
                    }
                    */
                }
            }

            /*
            if (!newFile && oldFile) {
                // remove
                if (oldFile.success && oldFile.response.id) {
                    // $.ajax({
                    //   type: 'DELETE',
                    //   url: '/upload/delete?id=' + oldFile.response.id,
                    // })
                }
            }
            */

            /*
            // Automatically activate upload
            if (Boolean(newFile) !== Boolean(oldFile) || oldFile.error !== newFile.error) {
                if (this.uploadAuto && !this.$refs.upload.active) {
                    this.$refs.upload.active = true
                }
            }
            */

            this.$refs.upload.opacity = 1;
        },


        inputFilter: function inputFilter(newFile, oldFile, prevent) {

            if (newFile && !oldFile) {
                // Before adding a file

                this.clearError();

                //console.warn('newFile:', newFile)
                // Filter size
                if (newFile.size > this.size) {
                    this.setError('File too big : maximum allowed ' + this.$options.filters.formatSize(this.size));
                    return prevent();
                }

                if (newFile.size < this.minSizs) {
                    this.setError('File too small : minimun ' + this.$options.filters.formatSize(this.minSize));
                    return prevent();
                }

                // Filter system files or hide files
                if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                    return prevent();
                }

                // Filter php html js file
                if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                    return prevent();
                }

                //Filter non-image file
                var extensions = new RegExp('\\.(' + this.upload.settings.valid_file_upload.join('|').replace(/\./g, '\\.') + ')$', 'i');

                if (newFile.name.search(extensions) === -1) {
                    this.setError('Invalid extension : only ' + this.upload.settings.valid_file_upload.join(' '));
                    return prevent();
                }
            }

            // BLOB THUMBS !!!!
            /*
            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
                 // Create a blob field
                newFile.blob = ''
                let URL = window.URL || window.webkitURL
                if (URL && URL.createObjectURL) {
                    newFile.blob = URL.createObjectURL(newFile.file)
                }
                 // Video
                if (newFile.blob && newFile.type.substr(0, 6) === 'video/') {
                     newFile.src = newFile.blob;
                     setTimeout(() => {
                        var video = document.getElementsByTagName('video')[0];
                         video.load();
                        video.onloadeddata = function() {
                            //video.play();
                        }
                     }, 1000);
                }
                 // Thumbnails
                if (newFile.blob && newFile.type.substr(0, 6) === 'image/') {
                    newFile.thumb = newFile.blob
                }
            }
            */

            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {

                if (['video', 'extract', 'short'].indexOf(this.media) > -1) {

                    this.isEdit = false;
                }

                newFile.thumb = '';
                var URL = window.URL || window.webkitURL;
                if (URL && URL.createObjectURL) {
                    newFile.thumb = URL.createObjectURL(newFile.file);

                    newFile.cropper = newFile.thumb;
                }
            }
        },

        setError: function setError(label) {
            this.error.status = true;
            this.error.label = label;
        },
        clearError: function clearError(label) {
            this.error.status = false;
            this.error.label = '';

            if (typeof libel === 'undefined') return;

            console.error('EMIT CLEAR ERROR :: ' + label);
            console.warn('ERRORS BEFORE :', this.errors);
            var index = this.errors.indexOf(label);
            if (index > -1) this.errors.splice(index, 1);
            console.log('INDEX', index);
            console.warn('ERRORS AFTER :', this.errors);
        },
        cropperCancel: function cropperCancel() {

            this.cropper.destroy();

            this.cropper = false;

            this.remove(this.files[this.files.length - 1]);

            this.edit = false;

            this.isCropperLoading = true;
        },
        cropperSave: function cropperSave() {

            var oldFile = this.files[this.files.length - 1];

            this.edit = false;

            this.$refs.upload.update(oldFile.id, {
                active: true,
                data: this.data,
                loading: true,
                cropper: this.cropper.getCroppedCanvas().toDataURL(oldFile.type)
            });
        }
    },

    watch: {
        edit: function edit(value) {
            var _this4 = this;

            if (value) {

                //this.$nextTick(function () {

                setTimeout(function () {

                    if (!_this4.$refs.cropper) return;

                    var _this = _this4;

                    var aspect = _this4.selectedSwitch !== null ? _this4.selectedSwitch.aspect : 1;

                    var cropper = new __WEBPACK_IMPORTED_MODULE_2_cropperjs__["a" /* default */](_this4.$refs.cropper, {
                        aspectRatio: aspect,
                        viewMode: 1,
                        preview: '.box-preview',
                        background: false,
                        crop: function crop(e) {

                            _this.data.cropped_value = parseInt(e.detail.width) + "," + parseInt(e.detail.height) + "," + parseInt(e.detail.x) + "," + parseInt(e.detail.y) + "," + parseInt(e.detail.rotate);
                        },
                        ready: function ready() {
                            _this.isCropperLoading = false;
                        }
                    });

                    _this4.cropper = cropper;

                    console.warn('CROPPER REF SRC ::', _this4.$refs.cropper.src);
                }, 1);
                // })
            } else {
                if (this.cropper) {
                    this.cropper.destroy();
                    this.cropper = false;
                }
            }
        }
    }
});

/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(221);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("27c64f24", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-df2ac59c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./inputFile.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-df2ac59c\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./inputFile.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.file-max{\n    font-family: 'Yanone Kaffeesatz', sans-serif\n}\n", ""]);

// exports


/***/ }),
/* 222 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var CHUNK_DEFAULT_OPTIONS = {
    headers: {},
    action: '',
    minSize: 1048576,
    maxActive: 3,
    maxRetries: 5

    //handler: ChunkUploadDefaultHandler
};

/* harmony default export */ __webpack_exports__["default"] = ({
    props: {

        label: {
            type: String,
            default: 'Choose a file'
        },

        inputId: {
            type: String
        },

        name: {
            type: String,
            default: 'file'
        },

        accept: {
            type: String
        },

        capture: {},

        multiple: {
            type: Boolean
        },

        maximum: {
            type: Number,
            default: function _default() {
                return this.multiple ? 0 : 1;
            }
        },

        addIndex: {
            type: [Boolean, Number]
        },

        directory: {
            type: Boolean
        },

        postAction: {
            type: String
        },

        putAction: {
            type: String
        },

        customAction: {
            type: Function
        },

        headers: {
            type: Object,
            default: Object
        },

        data: {
            type: Object,
            default: Object
        },

        timeout: {
            type: Number,
            default: 0
        },

        drop: {
            default: false
        },

        dropDirectory: {
            type: Boolean,
            default: true
        },

        size: {
            type: Number,
            default: 0
        },

        extensions: {
            default: Array
        },

        value: {
            type: Array,
            default: Array
        },

        thread: {
            type: Number,
            default: 1
        },

        // Chunk upload enabled
        chunkEnabled: {
            type: Boolean,
            default: false
        },

        // Chunk upload properties
        chunk: {
            type: Object,
            default: function _default() {
                return CHUNK_DEFAULT_OPTIONS;
            }
        },

        cropper: {}

    },
    data: function data() {
        return {
            opacity: 0,
            files: this.value,
            features: {
                html5: true,
                directory: false,
                drag: false
            },
            active: false,
            dropActive: false,
            uploading: 0,
            destroy: false
        };
    },
    mounted: function mounted() {

        /*
        if (window.FormData && input.files) {
            if (typeof input.webkitdirectory === 'boolean' || typeof input.directory === 'boolean') {
                this.features.directory = true
            }
            if (this.features.html5 && typeof input.ondrop !== 'undefined') {
                this.features.drop = true
            }
        } else {
            this.features.html5 = false
        }
        */

        this.maps = {};

        /*
        this.$nextTick(function () {
             if (this.$parent) {
                this.$parent.$forceUpdate()
            }
             this.watchDrop(this.drop)
        })
        */
    },
    beforeDestroy: function beforeDestroy() {
        this.destroy = true;
        this.active = false;
    },


    computed: {
        labelComputed: function labelComputed() {

            if (this.multiple) return this.label + '(s)';

            return this.label;
        },
        uploaded: function uploaded() {
            var file = void 0;
            for (var i = 0; i < this.files.length; i++) {
                file = this.files[i];
                if (file.fileObject && !file.error && !file.success) {
                    return false;
                }
            }
            return true;
        }
    },
    watch: {
        active: function active(_active) {
            this.watchActive(_active);
        }
    },
    methods: {
        change: function change(e) {
            this.addInputFile(e.target);
        },
        addInputFile: function addInputFile(el) {
            var files = [];
            if (el.files) {
                for (var i = 0; i < el.files.length; i++) {
                    var file = el.files[i];
                    files.push({
                        size: file.size,
                        name: file.webkitRelativePath || file.relativePath || file.name,
                        type: file.type,
                        file: file,
                        el: el
                    });
                }
            } else {
                files.push({
                    name: el.value.replace(/^.*?([^\/\\\r\n]+)$/, '$1'),
                    el: el
                });
            }

            return this.add(files);
        },
        add: function add(_files) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.addIndex;


            var files = _files;
            var isArray = files instanceof Array;

            if (!isArray) {
                files = [files];
            }

            var addFiles = [];
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (this.features.html5 && file instanceof Blob) {
                    file = {
                        file: file,
                        size: file.size,
                        name: file.webkitRelativePath || file.relativePath || file.name || 'unknown',
                        type: file.type
                    };
                }
                var fileObject = false;
                if (file.fileObject === false) {
                    // false
                } else if (file.fileObject) {
                    fileObject = true;
                } else if (typeof Element !== 'undefined' && file.el instanceof Element) {
                    fileObject = true;
                } else if (typeof Blob !== 'undefined' && file.file instanceof Blob) {
                    fileObject = true;
                }

                if (fileObject) {
                    file = _extends({
                        fileObject: true,
                        size: -1,
                        name: 'Filename',
                        type: '',
                        active: false,
                        error: '',
                        success: false,
                        putAction: this.putAction,
                        postAction: this.postAction,
                        timeout: this.timeout
                    }, file, {
                        response: {},

                        progress: '0.00', // 只读
                        speed: 0 // 只读
                        // xhr: false,                // 只读
                        // iframe: false,             // 只读
                    });

                    file.data = _extends({}, this.data, file.data ? file.data : {});

                    file.headers = _extends({}, this.headers, file.headers ? file.headers : {});
                }

                if (!file.id) {
                    file.id = Math.random().toString(36).substr(2);
                }

                if (this.emitFilter(file, undefined)) {
                    continue;
                }

                if (this.maximum > 1 && addFiles.length + this.files.length >= this.maximum) {
                    break;
                }

                addFiles.push(file);

                if (this.maximum === 1) {
                    break;
                }
            }

            if (!addFiles.length) {
                return false;
            }

            if (this.maximum === 1) {
                this.clear();
            }

            var newFiles = void 0;
            if (index === true || index === 0) {
                newFiles = addFiles.concat(this.files);
            } else if (index) {
                newFiles = addFiles.concat([]);
                newFiles.splice(index, 0, addFiles);
            } else {
                newFiles = this.files.concat(addFiles);
            }

            this.files = newFiles;

            for (var _i = 0; _i < addFiles.length; _i++) {
                var _file2 = addFiles[_i];
                this.maps[_file2.id] = _file2;
            }

            this.emitInput();
            for (var _i2 = 0; _i2 < addFiles.length; _i2++) {

                this.emitFile(addFiles[_i2], undefined);
            }

            return isArray ? addFiles : addFiles[0];
        },
        emitFilter: function emitFilter(newFile, oldFile) {
            var isPrevent = false;
            this.$emit('input-filter', newFile, oldFile, function () {
                isPrevent = true;
                return isPrevent;
            });
            return isPrevent;
        },
        clear: function clear() {
            if (this.files.length) {
                var files = this.files;
                this.files = [];
                this.maps = {};
                this.emitInput();
                for (var i = 0; i < files.length; i++) {
                    this.emitFile(undefined, files[i]);
                }
            }
            return true;
        },
        remove: function remove(id) {
            var file = this.get(id);
            if (file) {
                if (this.emitFilter(undefined, file)) {
                    return false;
                }
                var files = this.files.concat([]);
                var index = files.indexOf(file);
                if (index === -1) {
                    return false;
                }
                files.splice(index, 1);
                this.files = files;

                delete this.maps[file.id];

                this.emitInput();
                this.emitFile(undefined, file);
            }
            return file;
        },
        emitInput: function emitInput() {
            this.$emit('input', this.files);
        },
        emitFile: function emitFile(newFile, oldFile) {
            this.$emit('input-file', newFile, oldFile);
            if (newFile && newFile.fileObject && newFile.active && (!oldFile || !oldFile.active)) {
                this.uploading++;
                // 激活
                this.$nextTick(function () {
                    var _this = this;

                    setTimeout(function () {
                        _this.upload(newFile).then(function () {
                            // eslint-disable-next-line
                            newFile = _this.get(newFile);
                            if (newFile && newFile.fileObject) {
                                _this.update(newFile, {
                                    active: false,
                                    success: !newFile.error
                                });
                            }
                        }).catch(function (e) {
                            _this.update(newFile, {
                                active: false,
                                success: false,
                                error: e.code || e.error || e.message || e
                            });
                        });
                    }, parseInt(Math.random() * 50 + 50, 10));
                });
            } else if ((!newFile || !newFile.fileObject || !newFile.active) && oldFile && oldFile.fileObject && oldFile.active) {
                // 停止
                this.uploading--;
            }

            // 自动延续激活
            if (this.active && (Boolean(newFile) !== Boolean(oldFile) || newFile.active !== oldFile.active)) {
                this.watchActive(true);
            }
        },
        watchActive: function watchActive(active) {
            var file = void 0;
            var index = 0;
            while (file = this.files[index]) {
                index++;
                if (!file.fileObject) {
                    // 不是文件对象
                } else if (active && !this.destroy) {
                    if (this.uploading >= this.thread || this.uploading && !this.features.html5) {
                        break;
                    }
                    if (!file.active && !file.error && !file.success) {
                        this.update(file, { active: true });
                    }
                } else {
                    if (file.active) {
                        this.update(file, { active: false });
                    }
                }
            }
            if (this.uploading === 0) {
                this.active = false;
            }
        },
        update: function update(id, data) {
            var file = this.get(id);
            if (file) {
                var newFile = _extends({}, file, data);

                if (file.fileObject && file.active && !newFile.active && !newFile.error && !newFile.success) {
                    newFile.error = 'abort';
                }

                if (this.emitFilter(newFile, file)) {
                    return false;
                }

                var files = this.files.concat([]);
                var index = files.indexOf(file);
                if (index === -1) {
                    console.error('update', file);
                    return false;
                }
                files.splice(index, 1, newFile);
                this.files = files;

                delete this.maps[file.id];
                this.maps[newFile.id] = newFile;

                this.emitInput();
                this.emitFile(newFile, file);
                return newFile;
            }
            return false;
        },
        get: function get(id) {
            if (!id) {
                return false;
            }

            if ((typeof id === 'undefined' ? 'undefined' : _typeof(id)) === 'object') {
                return this.maps[id.id] || false;
            }

            return this.maps[id] || false;
        },
        upload: function upload(id) {
            var file = this.get(id);
            if (!file) {
                return Promise.reject('not_exists');
            }
            if (!file.fileObject) {
                return Promise.reject('file_object');
            }
            if (file.error) {
                return Promise.reject(file.error);
            }
            if (file.success) {
                return Promise.resolve(file);
            }
            var extensions = this.extensions;
            if (extensions && (extensions.length || typeof extensions.length === 'undefined')) {
                if ((typeof extensions === 'undefined' ? 'undefined' : _typeof(extensions)) !== 'object' || !(extensions instanceof RegExp)) {
                    if (typeof extensions === 'string') {
                        extensions = extensions.split(',').map(function (value) {
                            return value.trim();
                        }).filter(function (value) {
                            return value;
                        });
                    }
                    extensions = new RegExp('\\.(' + extensions.join('|').replace(/\./g, '\\.') + ')$', 'i');
                }
                if (file.name.search(extensions) === -1) {
                    /********************************************************************************************/
                    //return Promise.reject('extension')
                }
            }

            if (this.size > 0 && file.size >= 0 && file.size > this.size) {
                return Promise.reject('size');
            }

            if (this.customAction) {
                return this.customAction(file, this);
            }

            if (this.features.html5) {
                if (this.shouldUseChunkUpload(file)) {
                    return this.uploadChunk(file);
                }

                /*
                if (file.putAction) {
                    return this.uploadPut(file)
                }
                */

                if (file.postAction) {
                    return this.uploadHtml5(file);
                }
            }
            if (file.postAction) {
                return this.uploadHtml4(file);
            }
            return Promise.reject('No action configured');
        },
        shouldUseChunkUpload: function shouldUseChunkUpload(file) {
            return this.chunkEnabled && !!this.chunkOptions.handler && file.size > this.chunkOptions.minSize;
        },
        uploadChunk: function uploadChunk(file) {
            var HandlerClass = this.chunkOptions.handler;
            file.chunk = new HandlerClass(file, this.chunkOptions);

            return file.chunk.upload();
        },
        uploadPut: function uploadPut(file) {

            var querys = [];
            var value = void 0;
            for (var key in file.data) {
                value = file.data[key];
                if (value !== null && value !== undefined) {
                    querys.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }

            var queryString = querys.length ? (file.putAction.indexOf('?') === -1 ? '?' : '&') + querys.join('&') : '';
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', file.putAction + queryString);
            return this.uploadXhr(xhr, file, file.file);
        },
        uploadHtml5: function uploadHtml5(file) {
            var form = new window.FormData();
            var value = void 0;
            for (var key in file.data) {
                value = file.data[key];
                //if (value && typeof value === 'object' && typeof value.toString !== 'function') {
                if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                    if (value instanceof File) {
                        form.append(key, value, value.name);
                    } else {
                        //form.append(key + '[]', JSON.stringify(value));
                        for (var i = 0; i < value.length; i++) {
                            form.append(key + '[]', JSON.stringify(value[i]));
                        }
                    }
                } else if (value !== null && value !== undefined) {
                    form.append(key, value);
                }
            }
            form.append(this.name, file.file, file.file.filename || file.name);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', file.postAction);
            return this.uploadXhr(xhr, file, form);
        },
        uploadXhr: function uploadXhr(xhr, _file, body) {
            var _this2 = this;

            var file = _file;
            var speedTime = 0;
            var speedLoaded = 0;

            xhr.upload.onprogress = function (e) {
                file = _this2.get(file);
                if (!e.lengthComputable || !file || !file.fileObject || !file.active) {
                    return;
                }

                var speedTime2 = Math.round(Date.now() / 1000);
                if (speedTime2 === speedTime) {
                    return;
                }
                speedTime = speedTime2;

                file = _this2.update(file, {
                    progress: (e.loaded / e.total * 100).toFixed(2),
                    speed: e.loaded - speedLoaded
                });
                speedLoaded = e.loaded;
            };

            var interval = setInterval(function () {
                file = _this2.get(file);
                if (file && file.fileObject && !file.success && !file.error && file.active) {
                    return;
                }

                if (interval) {
                    clearInterval(interval);
                    interval = false;
                }

                try {
                    xhr.abort();
                    xhr.timeout = 1;
                } catch (e) {}
            }, 100);

            return new Promise(function (resolve, reject) {
                var complete = void 0;
                var fn = function fn(e) {
                    if (complete) {
                        return;
                    }
                    complete = true;
                    if (interval) {
                        clearInterval(interval);
                        interval = false;
                    }

                    file = _this2.get(file);

                    if (!file) {
                        return reject('not_exists');
                    }
                    if (!file.fileObject) {
                        return reject('file_object');
                    }
                    if (file.error) {
                        return reject(file.error);
                    }
                    if (!file.active) {
                        return reject('abort');
                    }

                    if (file.success) {
                        return resolve(file);
                    }

                    var data = {};

                    switch (e.type) {
                        case 'timeout':
                        case 'abort':
                            data.error = e.type;
                            break;

                        case 'error':
                            if (!xhr.status) {
                                data.error = 'network';
                            } else if (xhr.status >= 500) {
                                data.error = 'server';
                            } else if (xhr.status >= 400) {
                                data.error = 'denied';
                            }
                            break;

                        default:
                            if (xhr.status >= 500) {
                                data.error = 'server';
                            } else if (xhr.status >= 400) {
                                data.error = 'denied';
                            } else {
                                data.progress = '100.00';
                            }
                    }

                    if (xhr.responseText) {
                        var contentType = xhr.getResponseHeader('Content-Type');
                        if (contentType && contentType.indexOf('/json') !== -1) {
                            //************************************************************************************************* TO FIX ??
                            data.response = JSON.parse(xhr.responseText);
                        } else {
                            data.response = xhr.responseText;
                        }
                    }

                    file = _this2.update(file, data);

                    if (file.error) {
                        return reject(file.error);
                    }

                    return resolve(file);
                };

                xhr.onload = fn;
                xhr.onerror = fn;
                xhr.onabort = fn;
                xhr.ontimeout = fn;

                if (file.timeout) {
                    xhr.timeout = file.timeout;
                }

                // headers
                for (var key in file.headers) {
                    xhr.setRequestHeader(key, file.headers[key]);
                }

                file = _this2.update(file, { xhr: xhr });

                xhr.send(body);
            });
        },
        uploadHtml4: function uploadHtml4(_file) {
            var _this3 = this;

            var file = _file;
            var onKeydown = function onKeydown(e) {
                if (e.keyCode === 27) {
                    e.preventDefault();
                }
            };

            var iframe = document.createElement('iframe');
            iframe.id = 'upload-iframe-' + file.id;
            iframe.name = 'upload-iframe-' + file.id;
            iframe.src = 'about:blank';
            iframe.setAttribute('style', 'width:1px;height:1px;top:-999em;position:absolute; margin-top:-999em;');

            var form = document.createElement('form');

            form.action = file.postAction;

            form.name = 'upload-form-' + file.id;

            form.setAttribute('method', 'POST');
            form.setAttribute('target', 'upload-iframe-' + file.id);
            form.setAttribute('enctype', 'multipart/form-data');

            var value = void 0;
            var input = void 0;
            for (var key in file.data) {
                value = file.data[key];
                if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.toString !== 'function') {
                    value = JSON.stringify(value);
                }
                if (value !== null && value !== undefined) {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }
            }
            form.appendChild(file.el);

            document.body.appendChild(iframe).appendChild(form);

            var getResponseData = function getResponseData() {
                var doc = void 0;
                try {
                    if (iframe.contentWindow) {
                        doc = iframe.contentWindow.document;
                    }
                } catch (err) {}
                if (!doc) {
                    try {
                        doc = iframe.contentDocument ? iframe.contentDocument : iframe.document;
                    } catch (err) {
                        doc = iframe.document;
                    }
                }
                if (doc && doc.body) {
                    return doc.body.innerHTML;
                }
                return null;
            };

            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    file = _this3.update(file, { iframe: iframe });

                    // 不存在
                    if (!file) {
                        return reject('not_exists');
                    }

                    // 定时检查
                    var interval = setInterval(function () {
                        file = _this3.get(file);
                        if (file && file.fileObject && !file.success && !file.error && file.active) {
                            return;
                        }

                        if (interval) {
                            clearInterval(interval);
                            interval = false;
                        }

                        iframe.onabort({ type: file ? 'abort' : 'not_exists' });
                    }, 100);

                    var complete = void 0;
                    var fn = function fn(e) {
                        // 已经处理过了
                        if (complete) {
                            return;
                        }
                        complete = true;

                        if (interval) {
                            clearInterval(interval);
                            interval = false;
                        }

                        // 关闭 esc 事件
                        document.body.removeEventListener('keydown', onKeydown);

                        file = _this3.get(file);

                        // 不存在直接响应
                        if (!file) {
                            return reject('not_exists');
                        }

                        // 不是文件对象
                        if (!file.fileObject) {
                            return reject('file_object');
                        }

                        // 有错误自动响应
                        if (file.error) {
                            return reject(file.error);
                        }

                        // 未激活
                        if (!file.active) {
                            return reject('abort');
                        }

                        // 已完成 直接相应
                        if (file.success) {
                            return resolve(file);
                        }

                        var response = getResponseData();
                        var data = {};
                        switch (e.type) {
                            case 'abort':
                                data.error = 'abort';
                                break;
                            case 'error':
                                if (file.error) {
                                    data.error = file.error;
                                } else if (response === null) {
                                    data.error = 'network';
                                } else {
                                    data.error = 'denied';
                                }
                                break;
                            default:
                                if (file.error) {
                                    data.error = file.error;
                                } else if (data === null) {
                                    data.error = 'network';
                                } else {
                                    data.progress = '100.00';
                                }
                        }

                        if (response !== null) {
                            if (response && response.substr(0, 1) === '{' && response.substr(response.length - 1, 1) === '}') {
                                try {
                                    response = JSON.parse(response);
                                } catch (err) {}
                            }
                            data.response = response;
                        }

                        // 更新
                        file = _this3.update(file, data);

                        if (file.error) {
                            return reject(file.error);
                        }

                        // 响应
                        return resolve(file);
                    };

                    // 添加事件
                    iframe.onload = fn;
                    iframe.onerror = fn;
                    iframe.onabort = fn;

                    // 禁止 esc 键
                    document.body.addEventListener('keydown', onKeydown);

                    // 提交
                    form.submit();
                }, 50);
            }).then(function (res) {
                iframe.parentNode && iframe.parentNode.removeChild(iframe);
                return res;
            }).catch(function (res) {
                iframe.parentNode && iframe.parentNode.removeChild(iframe);
                return res;
            });
        },
        mouseover: function mouseover() {
            this.isClassShadow = true;
        }
    }
});

/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "file has-name is-boxed",
      staticStyle: { margin: "8px 0px" }
    },
    [
      _c(
        "label",
        {
          staticClass: "file-label is-center",
          staticStyle: { margin: "auto" }
        },
        [
          _c("div", { staticClass: "fileupload-buttonbar" }, [
            _c("input", {
              staticClass: "file-input",
              attrs: {
                type: "file",
                name: _vm.name,
                id: _vm.inputId || _vm.name,
                accept: _vm.accept,
                capture: _vm.capture,
                webkitdirectory: _vm.directory && _vm.features.directory,
                directory: _vm.directory && _vm.features.directory,
                multiple: _vm.multiple && _vm.features.html5
              },
              on: { change: _vm.change }
            }),
            _vm._v(" "),
            _c(
              "span",
              {
                staticClass: "file-cta button",
                attrs: { vshow: "files.length < maximum" }
              },
              [
                _c(
                  "span",
                  {
                    staticClass: "file-icon",
                    style: !_vm.active ? "opacity:1" : "opacity:0"
                  },
                  [
                    _c("i", { staticClass: "material-icons" }, [
                      _vm._v("vertical_align_top")
                    ])
                  ]
                ),
                _vm._v(" "),
                _c(
                  "span",
                  {
                    staticClass: "file-label",
                    style: !_vm.active ? "opacity:1" : "opacity:0"
                  },
                  [
                    _vm._v(
                      "\n                     " +
                        _vm._s(_vm.labelComputed) +
                        "\n                 "
                    )
                  ]
                ),
                _vm._v(" "),
                _vm.maximum > 1
                  ? _c(
                      "span",
                      {
                        staticClass: "file-max",
                        style: !_vm.active ? "opacity:1" : "opacity:0"
                      },
                      [
                        _vm._v(
                          "\n                     maximum : " +
                            _vm._s(_vm.maximum) +
                            "\n                 "
                        )
                      ]
                    )
                  : _vm._e(),
                _vm._v(" "),
                _vm.maximum > 1
                  ? _c(
                      "span",
                      {
                        staticClass: "file-max is-size-7",
                        style: !_vm.active ? "opacity:1" : "opacity:0"
                      },
                      [
                        _vm._v(
                          "\n                     " +
                            _vm._s(_vm.files.length) +
                            " / " +
                            _vm._s(_vm.maximum) +
                            "\n                 "
                        )
                      ]
                    )
                  : _vm._e(),
                _vm._v(" "),
                _c("span", {
                  staticClass: "button is-large is-minimal is-loading",
                  staticStyle: { position: "absolute" },
                  style: _vm.active ? "opacity:1" : "opacity:0"
                })
              ]
            ),
            _vm._v(" "),
            !_vm.active &&
            !_vm.uploaded &&
            (_vm.cropper === null ||
              !_vm.cropper ||
              typeof _vm.cropper === "undefined")
              ? _c(
                  "span",
                  {
                    staticClass:
                      "file-name button is-primary has-text-centered anim-opacity ",
                    style: "opacity : " + _vm.opacity,
                    on: {
                      click: function($event) {
                        $event.preventDefault()
                        _vm.active = true
                      }
                    }
                  },
                  [_vm._v("Start Upload\n            ")]
                )
              : !_vm.uploaded &&
                (_vm.cropper === null ||
                  !_vm.cropper ||
                  typeof _vm.cropper === "undefined")
                ? _c(
                    "span",
                    {
                      staticClass:
                        "file-name button is-danger has-text-centered anim-opacity ",
                      style: "opacity : " + _vm.opacity,
                      on: {
                        click: function($event) {
                          $event.preventDefault()
                          _vm.active = false
                        }
                      }
                    },
                    [_vm._v("Stop Upload\n            ")]
                  )
                : _vm.cropper === null ||
                  !_vm.cropper ||
                  typeof _vm.cropper === "undefined"
                  ? _c(
                      "span",
                      {
                        staticClass:
                          "file-name button is-danger has-text-centered",
                        staticStyle: { opacity: "0" }
                      },
                      [_vm._v("Stop Upload\n            ")]
                    )
                  : _vm._e()
          ])
        ]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-df2ac59c", module.exports)
  }
}

/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(225);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("b15354ec", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-351b8293\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./blobMedia.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-351b8293\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./blobMedia.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.blob-media-delete{\n\ttop: 5px;\n\tright: 5px;\n\tz-index:10;\n\tcursor:pointer;\n\tbackground-colorxxx: rgba(50,50,50,0.5);\n}\n.blob-media-delete.delete--fullwidth{\n\theight:100%;\n\twidth:100%;\n}\n.blob-media:hover .blob-media-delete.none{\n\tdisplay: block;\n}\n.blob-media .loader-circular{\n\tbackground-color:rgba(200,200,200,0.8);\n\twidth:100%;\n\theight:100%;\n}\n/*\n.blob-media-x.h-150{\n\theight: 150px;\n}\n.blob-media-x.h-250{\n\theight: 250px;\n}\n.blob-media-x.w-150{\n\twidth:150px;\n}\n\n.blob-media-x .delete-blob-x{\n\theightxx:100%;\n\twidthxx:100%;\n\ttop: 5px;\n\tright: 5px;\n\tz-index:10;\n\tcursor:pointer;\n\tbackground-color: rgba(50,50,50,0.5);\n}\n.blob-media-x .delete-blob-x.none{\n\tdisplay: none;\n}\n.blob-media-x:hover .delete-blob-x.none{\n\tdisplay: flex;\n}\n\n.blob-media-x .loader-circular{\n\tbackground-color:rgba(200,200,200,0.8);\n\twidth:100%;\n\theight:100%;\n}\n\n.blob-media-x img, .blob-media-x video {\n\theight: 100%;\n}\n\n.blob-media-x .video-infos{\n\tbackground-color: whitesmoke;\n    padding: 1.25rem 2.5rem 1.25rem 1.5rem;\n    border:1px solid hsl(0, 0%, 86%);\n}\n\n\n\n\n\n\n.tooltip{\n\tfont-family: Anton!important;\n}\n\n\n.blob-media{\n\tborder: 10px solid red;\n\tdisplay: flex;\n\tflex-direction: column;\n\tpositionxxxx: relative;\n\t\n}\n.blob-media img,\n.blob-media video{\n\theight: 100px;\n}\n.blob-media-infos{\n\tborder: 0px solid green;\n}\n\n.blob-image{\n\theight: 150px;\n\tposition: relative;\n\tborder:0px solid purple;\n}\n.blob-image img,\n.blob-image video{\n\theight: 100%;\n}\n.blob-image video{\n\tmargin: 0 auto;\n}\n.blob-image .is-zip{\n\tdisplay: block;\n\twidth: 150px;\n\theight: 150px;\n\tborder: 1px solid purple;\n}\n.w-150{\n\twidth: 150px;\n}\n\n.blob-image:hover .delete-blob{\n\tdisplay: block;\n}\n.delete-blob{\n\tdisplay: none;\n}\n*/\n", ""]);

// exports


/***/ }),
/* 226 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue2_circle_progress__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue2_circle_progress___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue2_circle_progress__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({

	components: {
		VueCircle: __WEBPACK_IMPORTED_MODULE_0_vue2_circle_progress___default.a
	},

	props: {

		file: {
			type: Object,
			default: function _default() {
				return {};
			}
		},

		cropper: {},

		isVideo: {
			type: Boolean,
			default: false
		}
	},

	watch: {
		progress: function progress(val) {

			this.$refs.progress.updateProgress(parseInt(val));
		}
	},

	computed: {
		classComputed: function classComputed() {

			return {
				'has-background-info': this.isZip,
				'w-150': this.isZip,
				'h-150': !this.Video,
				'h-250': this.isVideo
			};
		},
		progress: function progress() {
			return parseInt(this.file.progress);
		},
		isCropper: function isCropper() {
			return this.cropper || typeof this.cropper === 'string' && this.cropper.length > 0 ? true : false;
		},
		successLink: function successLink() {
			return null;
		},
		isZip: function isZip() {

			if (this.isVideo || this.cropper) return false;

			var name = this.file.file.name;

			var type = this.file.file.type; // 'application/zip'

			var fileExtension = name.substring(name.lastIndexOf(".") + 1);

			return fileExtension.toLowerCase() === 'zip' ? true : false;
		}
	},

	methods: {
		remove: function remove() {
			this.$emit('remove', this.file);
		}
	},

	filters: {
		formatSize: function formatSize(a) {
			var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

			if (0 == a) return "0 Bytes";
			var c = 1024,
			    d = b || 2,
			    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
			    f = Math.floor(Math.log(a) / Math.log(c));
			return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
		}
	}
});

/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["vue-circle-progress"]=t():e["vue-circle-progress"]=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var i=n[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){var r,i,o={};n(9),r=n(2),i=n(7),e.exports=r||{},e.exports.__esModule&&(e.exports=e.exports.default);var a="function"==typeof e.exports?e.exports.options||(e.exports.options={}):e.exports;i&&(a.template=i),a.computed||(a.computed={}),Object.keys(o).forEach(function(e){var t=o[e];a.computed[e]=function(){return t}})},function(e,t,n){var r,i;/*!
	 * jQuery JavaScript Library v3.2.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright JS Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2017-03-20T18:59Z
	 */
!function(t,n){"use strict";"object"==typeof e&&"object"==typeof e.exports?e.exports=t.document?n(t,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return n(e)}:n(t)}("undefined"!=typeof window?window:this,function(n,o){"use strict";function a(e,t){t=t||ae;var n=t.createElement("script");n.text=e,t.head.appendChild(n).parentNode.removeChild(n)}function s(e){var t=!!e&&"length"in e&&e.length,n=xe.type(e);return"function"!==n&&!xe.isWindow(e)&&("array"===n||0===t||"number"==typeof t&&t>0&&t-1 in e)}function u(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}function c(e,t,n){return xe.isFunction(t)?xe.grep(e,function(e,r){return!!t.call(e,r,e)!==n}):t.nodeType?xe.grep(e,function(e){return e===t!==n}):"string"!=typeof t?xe.grep(e,function(e){return fe.call(t,e)>-1!==n}):je.test(t)?xe.filter(t,e,n):(t=xe.filter(t,e),xe.grep(e,function(e){return fe.call(t,e)>-1!==n&&1===e.nodeType}))}function l(e,t){for(;(e=e[t])&&1!==e.nodeType;);return e}function f(e){var t={};return xe.each(e.match(Pe)||[],function(e,n){t[n]=!0}),t}function p(e){return e}function d(e){throw e}function h(e,t,n,r){var i;try{e&&xe.isFunction(i=e.promise)?i.call(e).done(t).fail(n):e&&xe.isFunction(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}function g(){ae.removeEventListener("DOMContentLoaded",g),n.removeEventListener("load",g),xe.ready()}function v(){this.expando=xe.expando+v.uid++}function m(e){return"true"===e||"false"!==e&&("null"===e?null:e===+e+""?+e:$e.test(e)?JSON.parse(e):e)}function y(e,t,n){var r;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(_e,"-$&").toLowerCase(),n=e.getAttribute(r),"string"==typeof n){try{n=m(n)}catch(e){}We.set(e,t,n)}else n=void 0;return n}function x(e,t,n,r){var i,o=1,a=20,s=r?function(){return r.cur()}:function(){return xe.css(e,t,"")},u=s(),c=n&&n[3]||(xe.cssNumber[t]?"":"px"),l=(xe.cssNumber[t]||"px"!==c&&+u)&&Ve.exec(xe.css(e,t));if(l&&l[3]!==c){c=c||l[3],n=n||[],l=+u||1;do o=o||".5",l/=o,xe.style(e,t,l+c);while(o!==(o=s()/u)&&1!==o&&--a)}return n&&(l=+l||+u||0,i=n[1]?l+(n[1]+1)*n[2]:+n[2],r&&(r.unit=c,r.start=l,r.end=i)),i}function b(e){var t,n=e.ownerDocument,r=e.nodeName,i=Ge[r];return i?i:(t=n.body.appendChild(n.createElement(r)),i=xe.css(t,"display"),t.parentNode.removeChild(t),"none"===i&&(i="block"),Ge[r]=i,i)}function w(e,t){for(var n,r,i=[],o=0,a=e.length;o<a;o++)r=e[o],r.style&&(n=r.style.display,t?("none"===n&&(i[o]=Be.get(r,"display")||null,i[o]||(r.style.display="")),""===r.style.display&&Xe(r)&&(i[o]=b(r))):"none"!==n&&(i[o]="none",Be.set(r,"display",n)));for(o=0;o<a;o++)null!=i[o]&&(e[o].style.display=i[o]);return e}function T(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&u(e,t)?xe.merge([e],n):n}function C(e,t){for(var n=0,r=e.length;n<r;n++)Be.set(e[n],"globalEval",!t||Be.get(t[n],"globalEval"))}function k(e,t,n,r,i){for(var o,a,s,u,c,l,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if(o=e[d],o||0===o)if("object"===xe.type(o))xe.merge(p,o.nodeType?[o]:o);else if(et.test(o)){for(a=a||f.appendChild(t.createElement("div")),s=(Je.exec(o)||["",""])[1].toLowerCase(),u=Ze[s]||Ze._default,a.innerHTML=u[1]+xe.htmlPrefilter(o)+u[2],l=u[0];l--;)a=a.lastChild;xe.merge(p,a.childNodes),a=f.firstChild,a.textContent=""}else p.push(t.createTextNode(o));for(f.textContent="",d=0;o=p[d++];)if(r&&xe.inArray(o,r)>-1)i&&i.push(o);else if(c=xe.contains(o.ownerDocument,o),a=T(f.appendChild(o),"script"),c&&C(a),n)for(l=0;o=a[l++];)Ke.test(o.type||"")&&n.push(o);return f}function S(){return!0}function E(){return!1}function N(){try{return ae.activeElement}catch(e){}}function A(e,t,n,r,i,o){var a,s;if("object"==typeof t){"string"!=typeof n&&(r=r||n,n=void 0);for(s in t)A(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),i===!1)i=E;else if(!i)return e;return 1===o&&(a=i,i=function(e){return xe().off(e),a.apply(this,arguments)},i.guid=a.guid||(a.guid=xe.guid++)),e.each(function(){xe.event.add(this,t,i,r,n)})}function j(e,t){return u(e,"table")&&u(11!==t.nodeType?t:t.firstChild,"tr")?xe(">tbody",e)[0]||e:e}function D(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function M(e){var t=ut.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function q(e,t){var n,r,i,o,a,s,u,c;if(1===t.nodeType){if(Be.hasData(e)&&(o=Be.access(e),a=Be.set(t,o),c=o.events)){delete a.handle,a.events={};for(i in c)for(n=0,r=c[i].length;n<r;n++)xe.event.add(t,i,c[i][n])}We.hasData(e)&&(s=We.access(e),u=xe.extend({},s),We.set(t,u))}}function O(e,t){var n=t.nodeName.toLowerCase();"input"===n&&Ye.test(e.type)?t.checked=e.checked:"input"!==n&&"textarea"!==n||(t.defaultValue=e.defaultValue)}function L(e,t,n,r){t=ce.apply([],t);var i,o,s,u,c,l,f=0,p=e.length,d=p-1,h=t[0],g=xe.isFunction(h);if(g||p>1&&"string"==typeof h&&!me.checkClone&&st.test(h))return e.each(function(i){var o=e.eq(i);g&&(t[0]=h.call(this,i,o.html())),L(o,t,n,r)});if(p&&(i=k(t,e[0].ownerDocument,!1,e,r),o=i.firstChild,1===i.childNodes.length&&(i=o),o||r)){for(s=xe.map(T(i,"script"),D),u=s.length;f<p;f++)c=i,f!==d&&(c=xe.clone(c,!0,!0),u&&xe.merge(s,T(c,"script"))),n.call(e[f],c,f);if(u)for(l=s[s.length-1].ownerDocument,xe.map(s,M),f=0;f<u;f++)c=s[f],Ke.test(c.type||"")&&!Be.access(c,"globalEval")&&xe.contains(l,c)&&(c.src?xe._evalUrl&&xe._evalUrl(c.src):a(c.textContent.replace(ct,""),l))}return e}function P(e,t,n){for(var r,i=t?xe.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||xe.cleanData(T(r)),r.parentNode&&(n&&xe.contains(r.ownerDocument,r)&&C(T(r,"script")),r.parentNode.removeChild(r));return e}function F(e,t,n){var r,i,o,a,s=e.style;return n=n||pt(e),n&&(a=n.getPropertyValue(t)||n[t],""!==a||xe.contains(e.ownerDocument,e)||(a=xe.style(e,t)),!me.pixelMarginRight()&&ft.test(a)&&lt.test(t)&&(r=s.width,i=s.minWidth,o=s.maxWidth,s.minWidth=s.maxWidth=s.width=a,a=n.width,s.width=r,s.minWidth=i,s.maxWidth=o)),void 0!==a?a+"":a}function I(e,t){return{get:function(){return e()?void delete this.get:(this.get=t).apply(this,arguments)}}}function H(e){if(e in yt)return e;for(var t=e[0].toUpperCase()+e.slice(1),n=mt.length;n--;)if(e=mt[n]+t,e in yt)return e}function R(e){var t=xe.cssProps[e];return t||(t=xe.cssProps[e]=H(e)||e),t}function B(e,t,n){var r=Ve.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function W(e,t,n,r,i){var o,a=0;for(o=n===(r?"border":"content")?4:"width"===t?1:0;o<4;o+=2)"margin"===n&&(a+=xe.css(e,n+Ue[o],!0,i)),r?("content"===n&&(a-=xe.css(e,"padding"+Ue[o],!0,i)),"margin"!==n&&(a-=xe.css(e,"border"+Ue[o]+"Width",!0,i))):(a+=xe.css(e,"padding"+Ue[o],!0,i),"padding"!==n&&(a+=xe.css(e,"border"+Ue[o]+"Width",!0,i)));return a}function $(e,t,n){var r,i=pt(e),o=F(e,t,i),a="border-box"===xe.css(e,"boxSizing",!1,i);return ft.test(o)?o:(r=a&&(me.boxSizingReliable()||o===e.style[t]),"auto"===o&&(o=e["offset"+t[0].toUpperCase()+t.slice(1)]),o=parseFloat(o)||0,o+W(e,t,n||(a?"border":"content"),r,i)+"px")}function _(e,t,n,r,i){return new _.prototype.init(e,t,n,r,i)}function z(){bt&&(ae.hidden===!1&&n.requestAnimationFrame?n.requestAnimationFrame(z):n.setTimeout(z,xe.fx.interval),xe.fx.tick())}function V(){return n.setTimeout(function(){xt=void 0}),xt=xe.now()}function U(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)n=Ue[r],i["margin"+n]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function X(e,t,n){for(var r,i=(Y.tweeners[t]||[]).concat(Y.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function Q(e,t,n){var r,i,o,a,s,u,c,l,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&Xe(e),v=Be.get(e,"fxshow");n.queue||(a=xe._queueHooks(e,"fx"),null==a.unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,xe.queue(e,"fx").length||a.empty.fire()})}));for(r in t)if(i=t[r],wt.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||xe.style(e,r)}if(u=!xe.isEmptyObject(t),u||!xe.isEmptyObject(d)){f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],c=v&&v.display,null==c&&(c=Be.get(e,"display")),l=xe.css(e,"display"),"none"===l&&(c?l=c:(w([e],!0),c=e.style.display||c,l=xe.css(e,"display"),w([e]))),("inline"===l||"inline-block"===l&&null!=c)&&"none"===xe.css(e,"float")&&(u||(p.done(function(){h.display=c}),null==c&&(l=h.display,c="none"===l?"":l)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1;for(r in d)u||(v?"hidden"in v&&(g=v.hidden):v=Be.access(e,"fxshow",{display:c}),o&&(v.hidden=!g),g&&w([e],!0),p.done(function(){g||w([e]),Be.remove(e,"fxshow");for(r in d)xe.style(e,r,d[r])})),u=X(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}}function G(e,t){var n,r,i,o,a;for(n in e)if(r=xe.camelCase(n),i=t[r],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),a=xe.cssHooks[r],a&&"expand"in a){o=a.expand(o),delete e[r];for(n in o)n in e||(e[n]=o[n],t[n]=i)}else t[r]=i}function Y(e,t,n){var r,i,o=0,a=Y.prefilters.length,s=xe.Deferred().always(function(){delete u.elem}),u=function(){if(i)return!1;for(var t=xt||V(),n=Math.max(0,c.startTime+c.duration-t),r=n/c.duration||0,o=1-r,a=0,u=c.tweens.length;a<u;a++)c.tweens[a].run(o);return s.notifyWith(e,[c,o,n]),o<1&&u?n:(u||s.notifyWith(e,[c,1,0]),s.resolveWith(e,[c]),!1)},c=s.promise({elem:e,props:xe.extend({},t),opts:xe.extend(!0,{specialEasing:{},easing:xe.easing._default},n),originalProperties:t,originalOptions:n,startTime:xt||V(),duration:n.duration,tweens:[],createTween:function(t,n){var r=xe.Tween(e,c.opts,t,n,c.opts.specialEasing[t]||c.opts.easing);return c.tweens.push(r),r},stop:function(t){var n=0,r=t?c.tweens.length:0;if(i)return this;for(i=!0;n<r;n++)c.tweens[n].run(1);return t?(s.notifyWith(e,[c,1,0]),s.resolveWith(e,[c,t])):s.rejectWith(e,[c,t]),this}}),l=c.props;for(G(l,c.opts.specialEasing);o<a;o++)if(r=Y.prefilters[o].call(c,e,l,c.opts))return xe.isFunction(r.stop)&&(xe._queueHooks(c.elem,c.opts.queue).stop=xe.proxy(r.stop,r)),r;return xe.map(l,X,c),xe.isFunction(c.opts.start)&&c.opts.start.call(e,c),c.progress(c.opts.progress).done(c.opts.done,c.opts.complete).fail(c.opts.fail).always(c.opts.always),xe.fx.timer(xe.extend(u,{elem:e,anim:c,queue:c.opts.queue})),c}function J(e){var t=e.match(Pe)||[];return t.join(" ")}function K(e){return e.getAttribute&&e.getAttribute("class")||""}function Z(e,t,n,r){var i;if(Array.isArray(t))xe.each(t,function(t,i){n||qt.test(e)?r(e,i):Z(e+"["+("object"==typeof i&&null!=i?t:"")+"]",i,n,r)});else if(n||"object"!==xe.type(t))r(e,t);else for(i in t)Z(e+"["+i+"]",t[i],n,r)}function ee(e){return function(t,n){"string"!=typeof t&&(n=t,t="*");var r,i=0,o=t.toLowerCase().match(Pe)||[];if(xe.isFunction(n))for(;r=o[i++];)"+"===r[0]?(r=r.slice(1)||"*",(e[r]=e[r]||[]).unshift(n)):(e[r]=e[r]||[]).push(n)}}function te(e,t,n,r){function i(s){var u;return o[s]=!0,xe.each(e[s]||[],function(e,s){var c=s(t,n,r);return"string"!=typeof c||a||o[c]?a?!(u=c):void 0:(t.dataTypes.unshift(c),i(c),!1)}),u}var o={},a=e===zt;return i(t.dataTypes[0])||!o["*"]&&i("*")}function ne(e,t){var n,r,i=xe.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&xe.extend(!0,e,r),e}function re(e,t,n){for(var r,i,o,a,s=e.contents,u=e.dataTypes;"*"===u[0];)u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}function ie(e,t,n,r){var i,o,a,s,u,c={},l=e.dataTypes.slice();if(l[1])for(a in e.converters)c[a.toLowerCase()]=e.converters[a];for(o=l.shift();o;)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=l.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(a=c[u+" "+o]||c["* "+o],!a)for(i in c)if(s=i.split(" "),s[1]===o&&(a=c[u+" "+s[0]]||c["* "+s[0]])){a===!0?a=c[i]:c[i]!==!0&&(o=s[0],l.unshift(s[1]));break}if(a!==!0)if(a&&e.throws)t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}var oe=[],ae=n.document,se=Object.getPrototypeOf,ue=oe.slice,ce=oe.concat,le=oe.push,fe=oe.indexOf,pe={},de=pe.toString,he=pe.hasOwnProperty,ge=he.toString,ve=ge.call(Object),me={},ye="3.2.1",xe=function(e,t){return new xe.fn.init(e,t)},be=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,we=/^-ms-/,Te=/-([a-z])/g,Ce=function(e,t){return t.toUpperCase()};xe.fn=xe.prototype={jquery:ye,constructor:xe,length:0,toArray:function(){return ue.call(this)},get:function(e){return null==e?ue.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=xe.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return xe.each(this,e)},map:function(e){return this.pushStack(xe.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(ue.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(n>=0&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:le,sort:oe.sort,splice:oe.splice},xe.extend=xe.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,c=!1;for("boolean"==typeof a&&(c=a,a=arguments[s]||{},s++),"object"==typeof a||xe.isFunction(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)n=a[t],r=e[t],a!==r&&(c&&r&&(xe.isPlainObject(r)||(i=Array.isArray(r)))?(i?(i=!1,o=n&&Array.isArray(n)?n:[]):o=n&&xe.isPlainObject(n)?n:{},a[t]=xe.extend(c,o,r)):void 0!==r&&(a[t]=r));return a},xe.extend({expando:"jQuery"+(ye+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isFunction:function(e){return"function"===xe.type(e)},isWindow:function(e){return null!=e&&e===e.window},isNumeric:function(e){var t=xe.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==de.call(e))&&(!(t=se(e))||(n=he.call(t,"constructor")&&t.constructor,"function"==typeof n&&ge.call(n)===ve))},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},type:function(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?pe[de.call(e)]||"object":typeof e},globalEval:function(e){a(e)},camelCase:function(e){return e.replace(we,"ms-").replace(Te,Ce)},each:function(e,t){var n,r=0;if(s(e))for(n=e.length;r<n&&t.call(e[r],r,e[r])!==!1;r++);else for(r in e)if(t.call(e[r],r,e[r])===!1)break;return e},trim:function(e){return null==e?"":(e+"").replace(be,"")},makeArray:function(e,t){var n=t||[];return null!=e&&(s(Object(e))?xe.merge(n,"string"==typeof e?[e]:e):le.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:fe.call(t,e,n)},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r,i=[],o=0,a=e.length,s=!n;o<a;o++)r=!t(e[o],o),r!==s&&i.push(e[o]);return i},map:function(e,t,n){var r,i,o=0,a=[];if(s(e))for(r=e.length;o<r;o++)i=t(e[o],o,n),null!=i&&a.push(i);else for(o in e)i=t(e[o],o,n),null!=i&&a.push(i);return ce.apply([],a)},guid:1,proxy:function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),xe.isFunction(e))return r=ue.call(arguments,2),i=function(){return e.apply(t||this,r.concat(ue.call(arguments)))},i.guid=e.guid=e.guid||xe.guid++,i},now:Date.now,support:me}),"function"==typeof Symbol&&(xe.fn[Symbol.iterator]=oe[Symbol.iterator]),xe.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){pe["[object "+t+"]"]=t.toLowerCase()});var ke=/*!
	 * Sizzle CSS Selector Engine v2.3.3
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-08-08
	 */
function(e){function t(e,t,n,r){var i,o,a,s,u,c,l,p=t&&t.ownerDocument,h=t?t.nodeType:9;if(n=n||[],"string"!=typeof e||!e||1!==h&&9!==h&&11!==h)return n;if(!r&&((t?t.ownerDocument||t:W)!==O&&q(t),t=t||O,P)){if(11!==h&&(u=me.exec(e)))if(i=u[1]){if(9===h){if(!(a=t.getElementById(i)))return n;if(a.id===i)return n.push(a),n}else if(p&&(a=p.getElementById(i))&&R(t,a)&&a.id===i)return n.push(a),n}else{if(u[2])return K.apply(n,t.getElementsByTagName(e)),n;if((i=u[3])&&T.getElementsByClassName&&t.getElementsByClassName)return K.apply(n,t.getElementsByClassName(i)),n}if(T.qsa&&!U[e+" "]&&(!F||!F.test(e))){if(1!==h)p=t,l=e;else if("object"!==t.nodeName.toLowerCase()){for((s=t.getAttribute("id"))?s=s.replace(we,Te):t.setAttribute("id",s=B),c=E(e),o=c.length;o--;)c[o]="#"+s+" "+d(c[o]);l=c.join(","),p=ye.test(e)&&f(t.parentNode)||t}if(l)try{return K.apply(n,p.querySelectorAll(l)),n}catch(e){}finally{s===B&&t.removeAttribute("id")}}}return A(e.replace(se,"$1"),t,n,r)}function n(){function e(n,r){return t.push(n+" ")>C.cacheLength&&delete e[t.shift()],e[n+" "]=r}var t=[];return e}function r(e){return e[B]=!0,e}function i(e){var t=O.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function o(e,t){for(var n=e.split("|"),r=n.length;r--;)C.attrHandle[n[r]]=t}function a(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)for(;n=n.nextSibling;)if(n===t)return-1;return e?1:-1}function s(e){return function(t){var n=t.nodeName.toLowerCase();return"input"===n&&t.type===e}}function u(e){return function(t){var n=t.nodeName.toLowerCase();return("input"===n||"button"===n)&&t.type===e}}function c(e){return function(t){return"form"in t?t.parentNode&&t.disabled===!1?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ke(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function l(e){return r(function(t){return t=+t,r(function(n,r){for(var i,o=e([],n.length,t),a=o.length;a--;)n[i=o[a]]&&(n[i]=!(r[i]=n[i]))})})}function f(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}function p(){}function d(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function h(e,t,n){var r=t.dir,i=t.next,o=i||r,a=n&&"parentNode"===o,s=_++;return t.first?function(t,n,i){for(;t=t[r];)if(1===t.nodeType||a)return e(t,n,i);return!1}:function(t,n,u){var c,l,f,p=[$,s];if(u){for(;t=t[r];)if((1===t.nodeType||a)&&e(t,n,u))return!0}else for(;t=t[r];)if(1===t.nodeType||a)if(f=t[B]||(t[B]={}),l=f[t.uniqueID]||(f[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else{if((c=l[o])&&c[0]===$&&c[1]===s)return p[2]=c[2];if(l[o]=p,p[2]=e(t,n,u))return!0}return!1}}function g(e){return e.length>1?function(t,n,r){for(var i=e.length;i--;)if(!e[i](t,n,r))return!1;return!0}:e[0]}function v(e,n,r){for(var i=0,o=n.length;i<o;i++)t(e,n[i],r);return r}function m(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,c=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),c&&t.push(s)));return a}function y(e,t,n,i,o,a){return i&&!i[B]&&(i=y(i)),o&&!o[B]&&(o=y(o,a)),r(function(r,a,s,u){var c,l,f,p=[],d=[],h=a.length,g=r||v(t||"*",s.nodeType?[s]:s,[]),y=!e||!r&&t?g:m(g,p,e,s,u),x=n?o||(r?e:h||i)?[]:a:y;if(n&&n(y,x,s,u),i)for(c=m(x,d),i(c,[],s,u),l=c.length;l--;)(f=c[l])&&(x[d[l]]=!(y[d[l]]=f));if(r){if(o||e){if(o){for(c=[],l=x.length;l--;)(f=x[l])&&c.push(y[l]=f);o(null,x=[],c,u)}for(l=x.length;l--;)(f=x[l])&&(c=o?ee(r,f):p[l])>-1&&(r[c]=!(a[c]=f))}}else x=m(x===a?x.splice(h,x.length):x),o?o(null,a,x,u):K.apply(a,x)})}function x(e){for(var t,n,r,i=e.length,o=C.relative[e[0].type],a=o||C.relative[" "],s=o?1:0,u=h(function(e){return e===t},a,!0),c=h(function(e){return ee(t,e)>-1},a,!0),l=[function(e,n,r){var i=!o&&(r||n!==j)||((t=n).nodeType?u(e,n,r):c(e,n,r));return t=null,i}];s<i;s++)if(n=C.relative[e[s].type])l=[h(g(l),n)];else{if(n=C.filter[e[s].type].apply(null,e[s].matches),n[B]){for(r=++s;r<i&&!C.relative[e[r].type];r++);return y(s>1&&g(l),s>1&&d(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(se,"$1"),n,s<r&&x(e.slice(s,r)),r<i&&x(e=e.slice(r)),r<i&&d(e))}l.push(n)}return g(l)}function b(e,n){var i=n.length>0,o=e.length>0,a=function(r,a,s,u,c){var l,f,p,d=0,h="0",g=r&&[],v=[],y=j,x=r||o&&C.find.TAG("*",c),b=$+=null==y?1:Math.random()||.1,w=x.length;for(c&&(j=a===O||a||c);h!==w&&null!=(l=x[h]);h++){if(o&&l){for(f=0,a||l.ownerDocument===O||(q(l),s=!P);p=e[f++];)if(p(l,a||O,s)){u.push(l);break}c&&($=b)}i&&((l=!p&&l)&&d--,r&&g.push(l))}if(d+=h,i&&h!==d){for(f=0;p=n[f++];)p(g,v,a,s);if(r){if(d>0)for(;h--;)g[h]||v[h]||(v[h]=Y.call(u));v=m(v)}K.apply(u,v),c&&!r&&v.length>0&&d+n.length>1&&t.uniqueSort(u)}return c&&($=b,j=y),g};return i?r(a):a}var w,T,C,k,S,E,N,A,j,D,M,q,O,L,P,F,I,H,R,B="sizzle"+1*new Date,W=e.document,$=0,_=0,z=n(),V=n(),U=n(),X=function(e,t){return e===t&&(M=!0),0},Q={}.hasOwnProperty,G=[],Y=G.pop,J=G.push,K=G.push,Z=G.slice,ee=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return-1},te="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",ne="[\\x20\\t\\r\\n\\f]",re="(?:\\\\.|[\\w-]|[^\0-\\xa0])+",ie="\\["+ne+"*("+re+")(?:"+ne+"*([*^$|!~]?=)"+ne+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+re+"))|)"+ne+"*\\]",oe=":("+re+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+ie+")*)|.*)\\)|)",ae=new RegExp(ne+"+","g"),se=new RegExp("^"+ne+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ne+"+$","g"),ue=new RegExp("^"+ne+"*,"+ne+"*"),ce=new RegExp("^"+ne+"*([>+~]|"+ne+")"+ne+"*"),le=new RegExp("="+ne+"*([^\\]'\"]*?)"+ne+"*\\]","g"),fe=new RegExp(oe),pe=new RegExp("^"+re+"$"),de={ID:new RegExp("^#("+re+")"),CLASS:new RegExp("^\\.("+re+")"),TAG:new RegExp("^("+re+"|[*])"),ATTR:new RegExp("^"+ie),PSEUDO:new RegExp("^"+oe),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ne+"*(even|odd|(([+-]|)(\\d*)n|)"+ne+"*(?:([+-]|)"+ne+"*(\\d+)|))"+ne+"*\\)|)","i"),bool:new RegExp("^(?:"+te+")$","i"),needsContext:new RegExp("^"+ne+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ne+"*((?:-\\d)?\\d*)"+ne+"*\\)|)(?=[^-]|$)","i")},he=/^(?:input|select|textarea|button)$/i,ge=/^h\d$/i,ve=/^[^{]+\{\s*\[native \w/,me=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ye=/[+~]/,xe=new RegExp("\\\\([\\da-f]{1,6}"+ne+"?|("+ne+")|.)","ig"),be=function(e,t,n){var r="0x"+t-65536;return r!==r||n?t:r<0?String.fromCharCode(r+65536):String.fromCharCode(r>>10|55296,1023&r|56320)},we=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,Te=function(e,t){return t?"\0"===e?"�":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},Ce=function(){q()},ke=h(function(e){return e.disabled===!0&&("form"in e||"label"in e)},{dir:"parentNode",next:"legend"});try{K.apply(G=Z.call(W.childNodes),W.childNodes),G[W.childNodes.length].nodeType}catch(e){K={apply:G.length?function(e,t){J.apply(e,Z.call(t))}:function(e,t){for(var n=e.length,r=0;e[n++]=t[r++];);e.length=n-1}}}T=t.support={},S=t.isXML=function(e){var t=e&&(e.ownerDocument||e).documentElement;return!!t&&"HTML"!==t.nodeName},q=t.setDocument=function(e){var t,n,r=e?e.ownerDocument||e:W;return r!==O&&9===r.nodeType&&r.documentElement?(O=r,L=O.documentElement,P=!S(O),W!==O&&(n=O.defaultView)&&n.top!==n&&(n.addEventListener?n.addEventListener("unload",Ce,!1):n.attachEvent&&n.attachEvent("onunload",Ce)),T.attributes=i(function(e){return e.className="i",!e.getAttribute("className")}),T.getElementsByTagName=i(function(e){return e.appendChild(O.createComment("")),!e.getElementsByTagName("*").length}),T.getElementsByClassName=ve.test(O.getElementsByClassName),T.getById=i(function(e){return L.appendChild(e).id=B,!O.getElementsByName||!O.getElementsByName(B).length}),T.getById?(C.filter.ID=function(e){var t=e.replace(xe,be);return function(e){return e.getAttribute("id")===t}},C.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&P){var n=t.getElementById(e);return n?[n]:[]}}):(C.filter.ID=function(e){var t=e.replace(xe,be);return function(e){var n="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},C.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&P){var n,r,i,o=t.getElementById(e);if(o){if(n=o.getAttributeNode("id"),n&&n.value===e)return[o];for(i=t.getElementsByName(e),r=0;o=i[r++];)if(n=o.getAttributeNode("id"),n&&n.value===e)return[o]}return[]}}),C.find.TAG=T.getElementsByTagName?function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):T.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){for(;n=o[i++];)1===n.nodeType&&r.push(n);return r}return o},C.find.CLASS=T.getElementsByClassName&&function(e,t){if("undefined"!=typeof t.getElementsByClassName&&P)return t.getElementsByClassName(e)},I=[],F=[],(T.qsa=ve.test(O.querySelectorAll))&&(i(function(e){L.appendChild(e).innerHTML="<a id='"+B+"'></a><select id='"+B+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&F.push("[*^$]="+ne+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||F.push("\\["+ne+"*(?:value|"+te+")"),e.querySelectorAll("[id~="+B+"-]").length||F.push("~="),e.querySelectorAll(":checked").length||F.push(":checked"),e.querySelectorAll("a#"+B+"+*").length||F.push(".#.+[+~]")}),i(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=O.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&F.push("name"+ne+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&F.push(":enabled",":disabled"),L.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&F.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),F.push(",.*:")})),(T.matchesSelector=ve.test(H=L.matches||L.webkitMatchesSelector||L.mozMatchesSelector||L.oMatchesSelector||L.msMatchesSelector))&&i(function(e){T.disconnectedMatch=H.call(e,"*"),H.call(e,"[s!='']:x"),I.push("!=",oe)}),F=F.length&&new RegExp(F.join("|")),I=I.length&&new RegExp(I.join("|")),t=ve.test(L.compareDocumentPosition),R=t||ve.test(L.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)for(;t=t.parentNode;)if(t===e)return!0;return!1},X=t?function(e,t){if(e===t)return M=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n?n:(n=(e.ownerDocument||e)===(t.ownerDocument||t)?e.compareDocumentPosition(t):1,1&n||!T.sortDetached&&t.compareDocumentPosition(e)===n?e===O||e.ownerDocument===W&&R(W,e)?-1:t===O||t.ownerDocument===W&&R(W,t)?1:D?ee(D,e)-ee(D,t):0:4&n?-1:1)}:function(e,t){if(e===t)return M=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,s=[e],u=[t];if(!i||!o)return e===O?-1:t===O?1:i?-1:o?1:D?ee(D,e)-ee(D,t):0;if(i===o)return a(e,t);for(n=e;n=n.parentNode;)s.unshift(n);for(n=t;n=n.parentNode;)u.unshift(n);for(;s[r]===u[r];)r++;return r?a(s[r],u[r]):s[r]===W?-1:u[r]===W?1:0},O):O},t.matches=function(e,n){return t(e,null,null,n)},t.matchesSelector=function(e,n){if((e.ownerDocument||e)!==O&&q(e),n=n.replace(le,"='$1']"),T.matchesSelector&&P&&!U[n+" "]&&(!I||!I.test(n))&&(!F||!F.test(n)))try{var r=H.call(e,n);if(r||T.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){}return t(n,O,null,[e]).length>0},t.contains=function(e,t){return(e.ownerDocument||e)!==O&&q(e),R(e,t)},t.attr=function(e,t){(e.ownerDocument||e)!==O&&q(e);var n=C.attrHandle[t.toLowerCase()],r=n&&Q.call(C.attrHandle,t.toLowerCase())?n(e,t,!P):void 0;return void 0!==r?r:T.attributes||!P?e.getAttribute(t):(r=e.getAttributeNode(t))&&r.specified?r.value:null},t.escape=function(e){return(e+"").replace(we,Te)},t.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},t.uniqueSort=function(e){var t,n=[],r=0,i=0;if(M=!T.detectDuplicates,D=!T.sortStable&&e.slice(0),e.sort(X),M){for(;t=e[i++];)t===e[i]&&(r=n.push(i));for(;r--;)e.splice(n[r],1)}return D=null,e},k=t.getText=function(e){var t,n="",r=0,i=e.nodeType;if(i){if(1===i||9===i||11===i){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=k(e)}else if(3===i||4===i)return e.nodeValue}else for(;t=e[r++];)n+=k(t);return n},C=t.selectors={cacheLength:50,createPseudo:r,match:de,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(xe,be),e[3]=(e[3]||e[4]||e[5]||"").replace(xe,be),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||t.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&t.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return de.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&fe.test(n)&&(t=E(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(xe,be).toLowerCase();return"*"===e?function(){return!0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=z[e+" "];return t||(t=new RegExp("(^|"+ne+")"+e+"("+ne+"|$)"))&&z(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,n,r){return function(i){var o=t.attr(i,e);return null==o?"!="===n:!n||(o+="","="===n?o===r:"!="===n?o!==r:"^="===n?r&&0===o.indexOf(r):"*="===n?r&&o.indexOf(r)>-1:"$="===n?r&&o.slice(-r.length)===r:"~="===n?(" "+o.replace(ae," ")+" ").indexOf(r)>-1:"|="===n&&(o===r||o.slice(0,r.length+1)===r+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),a="last"!==e.slice(-4),s="of-type"===t;return 1===r&&0===i?function(e){return!!e.parentNode}:function(t,n,u){var c,l,f,p,d,h,g=o!==a?"nextSibling":"previousSibling",v=t.parentNode,m=s&&t.nodeName.toLowerCase(),y=!u&&!s,x=!1;if(v){if(o){for(;g;){for(p=t;p=p[g];)if(s?p.nodeName.toLowerCase()===m:1===p.nodeType)return!1;h=g="only"===e&&!h&&"nextSibling"}return!0}if(h=[a?v.firstChild:v.lastChild],a&&y){for(p=v,f=p[B]||(p[B]={}),l=f[p.uniqueID]||(f[p.uniqueID]={}),c=l[e]||[],d=c[0]===$&&c[1],x=d&&c[2],p=d&&v.childNodes[d];p=++d&&p&&p[g]||(x=d=0)||h.pop();)if(1===p.nodeType&&++x&&p===t){l[e]=[$,d,x];break}}else if(y&&(p=t,f=p[B]||(p[B]={}),l=f[p.uniqueID]||(f[p.uniqueID]={}),c=l[e]||[],d=c[0]===$&&c[1],x=d),x===!1)for(;(p=++d&&p&&p[g]||(x=d=0)||h.pop())&&((s?p.nodeName.toLowerCase()!==m:1!==p.nodeType)||!++x||(y&&(f=p[B]||(p[B]={}),l=f[p.uniqueID]||(f[p.uniqueID]={}),l[e]=[$,x]),p!==t)););return x-=i,x===r||x%r===0&&x/r>=0}}},PSEUDO:function(e,n){var i,o=C.pseudos[e]||C.setFilters[e.toLowerCase()]||t.error("unsupported pseudo: "+e);return o[B]?o(n):o.length>1?(i=[e,e,"",n],C.setFilters.hasOwnProperty(e.toLowerCase())?r(function(e,t){for(var r,i=o(e,n),a=i.length;a--;)r=ee(e,i[a]),e[r]=!(t[r]=i[a])}):function(e){return o(e,0,i)}):o}},pseudos:{not:r(function(e){var t=[],n=[],i=N(e.replace(se,"$1"));return i[B]?r(function(e,t,n,r){for(var o,a=i(e,null,r,[]),s=e.length;s--;)(o=a[s])&&(e[s]=!(t[s]=o))}):function(e,r,o){return t[0]=e,i(t,null,o,n),t[0]=null,!n.pop()}}),has:r(function(e){return function(n){return t(e,n).length>0}}),contains:r(function(e){return e=e.replace(xe,be),function(t){return(t.textContent||t.innerText||k(t)).indexOf(e)>-1}}),lang:r(function(e){return pe.test(e||"")||t.error("unsupported lang: "+e),e=e.replace(xe,be).toLowerCase(),function(t){var n;do if(n=P?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return n=n.toLowerCase(),n===e||0===n.indexOf(e+"-");while((t=t.parentNode)&&1===t.nodeType);return!1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===L},focus:function(e){return e===O.activeElement&&(!O.hasFocus||O.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:c(!1),disabled:c(!0),checked:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,e.selected===!0},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!C.pseudos.empty(e)},header:function(e){return ge.test(e.nodeName)},input:function(e){return he.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return"input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return"input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:l(function(){return[0]}),last:l(function(e,t){return[t-1]}),eq:l(function(e,t,n){return[n<0?n+t:n]}),even:l(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:l(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:l(function(e,t,n){for(var r=n<0?n+t:n;--r>=0;)e.push(r);return e}),gt:l(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}},C.pseudos.nth=C.pseudos.eq;for(w in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})C.pseudos[w]=s(w);for(w in{submit:!0,reset:!0})C.pseudos[w]=u(w);return p.prototype=C.filters=C.pseudos,C.setFilters=new p,E=t.tokenize=function(e,n){var r,i,o,a,s,u,c,l=V[e+" "];if(l)return n?0:l.slice(0);for(s=e,u=[],c=C.preFilter;s;){r&&!(i=ue.exec(s))||(i&&(s=s.slice(i[0].length)||s),u.push(o=[])),r=!1,(i=ce.exec(s))&&(r=i.shift(),o.push({value:r,type:i[0].replace(se," ")}),s=s.slice(r.length));for(a in C.filter)!(i=de[a].exec(s))||c[a]&&!(i=c[a](i))||(r=i.shift(),o.push({value:r,type:a,matches:i}),s=s.slice(r.length));if(!r)break}return n?s.length:s?t.error(e):V(e,u).slice(0)},N=t.compile=function(e,t){var n,r=[],i=[],o=U[e+" "];if(!o){for(t||(t=E(e)),n=t.length;n--;)o=x(t[n]),o[B]?r.push(o):i.push(o);o=U(e,b(i,r)),o.selector=e}return o},A=t.select=function(e,t,n,r){var i,o,a,s,u,c="function"==typeof e&&e,l=!r&&E(e=c.selector||e);if(n=n||[],1===l.length){if(o=l[0]=l[0].slice(0),o.length>2&&"ID"===(a=o[0]).type&&9===t.nodeType&&P&&C.relative[o[1].type]){if(t=(C.find.ID(a.matches[0].replace(xe,be),t)||[])[0],!t)return n;c&&(t=t.parentNode),e=e.slice(o.shift().value.length)}for(i=de.needsContext.test(e)?0:o.length;i--&&(a=o[i],!C.relative[s=a.type]);)if((u=C.find[s])&&(r=u(a.matches[0].replace(xe,be),ye.test(o[0].type)&&f(t.parentNode)||t))){if(o.splice(i,1),e=r.length&&d(o),!e)return K.apply(n,r),n;break}}return(c||N(e,l))(r,t,!P,n,!t||ye.test(e)&&f(t.parentNode)||t),n},T.sortStable=B.split("").sort(X).join("")===B,T.detectDuplicates=!!M,q(),T.sortDetached=i(function(e){return 1&e.compareDocumentPosition(O.createElement("fieldset"))}),i(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||o("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),T.attributes&&i(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||o("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),i(function(e){return null==e.getAttribute("disabled")})||o(te,function(e,t,n){var r;if(!n)return e[t]===!0?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null}),t}(n);xe.find=ke,xe.expr=ke.selectors,xe.expr[":"]=xe.expr.pseudos,xe.uniqueSort=xe.unique=ke.uniqueSort,xe.text=ke.getText,xe.isXMLDoc=ke.isXML,xe.contains=ke.contains,xe.escapeSelector=ke.escape;var Se=function(e,t,n){for(var r=[],i=void 0!==n;(e=e[t])&&9!==e.nodeType;)if(1===e.nodeType){if(i&&xe(e).is(n))break;r.push(e)}return r},Ee=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},Ne=xe.expr.match.needsContext,Ae=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,je=/^.[^:#\[\.,]*$/;xe.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?xe.find.matchesSelector(r,e)?[r]:[]:xe.find.matches(e,xe.grep(t,function(e){return 1===e.nodeType}))},xe.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(xe(e).filter(function(){for(t=0;t<r;t++)if(xe.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)xe.find(e,i[t],n);return r>1?xe.uniqueSort(n):n},filter:function(e){return this.pushStack(c(this,e||[],!1))},not:function(e){return this.pushStack(c(this,e||[],!0))},is:function(e){return!!c(this,"string"==typeof e&&Ne.test(e)?xe(e):e||[],!1).length}});var De,Me=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,qe=xe.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||De,"string"==typeof e){if(r="<"===e[0]&&">"===e[e.length-1]&&e.length>=3?[null,e,null]:Me.exec(e),!r||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof xe?t[0]:t,xe.merge(this,xe.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:ae,!0)),Ae.test(r[1])&&xe.isPlainObject(t))for(r in t)xe.isFunction(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return i=ae.getElementById(r[2]),i&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):xe.isFunction(e)?void 0!==n.ready?n.ready(e):e(xe):xe.makeArray(e,this)};qe.prototype=xe.fn,De=xe(ae);var Oe=/^(?:parents|prev(?:Until|All))/,Le={children:!0,contents:!0,next:!0,prev:!0};xe.fn.extend({has:function(e){var t=xe(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(xe.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&xe(e);if(!Ne.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?a.index(n)>-1:1===n.nodeType&&xe.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(o.length>1?xe.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?fe.call(xe(e),this[0]):fe.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(xe.uniqueSort(xe.merge(this.get(),xe(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),xe.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return Se(e,"parentNode")},parentsUntil:function(e,t,n){return Se(e,"parentNode",n)},next:function(e){return l(e,"nextSibling")},prev:function(e){return l(e,"previousSibling")},nextAll:function(e){return Se(e,"nextSibling")},prevAll:function(e){return Se(e,"previousSibling")},nextUntil:function(e,t,n){return Se(e,"nextSibling",n)},prevUntil:function(e,t,n){return Se(e,"previousSibling",n)},siblings:function(e){return Ee((e.parentNode||{}).firstChild,e)},children:function(e){return Ee(e.firstChild)},contents:function(e){return u(e,"iframe")?e.contentDocument:(u(e,"template")&&(e=e.content||e),xe.merge([],e.childNodes))}},function(e,t){xe.fn[e]=function(n,r){var i=xe.map(this,t,n);return"Until"!==e.slice(-5)&&(r=n),r&&"string"==typeof r&&(i=xe.filter(r,i)),this.length>1&&(Le[e]||xe.uniqueSort(i),Oe.test(e)&&i.reverse()),this.pushStack(i)}});var Pe=/[^\x20\t\r\n\f]+/g;xe.Callbacks=function(e){e="string"==typeof e?f(e):xe.extend({},e);var t,n,r,i,o=[],a=[],s=-1,u=function(){for(i=i||e.once,r=t=!0;a.length;s=-1)for(n=a.shift();++s<o.length;)o[s].apply(n[0],n[1])===!1&&e.stopOnFalse&&(s=o.length,n=!1);e.memory||(n=!1),t=!1,i&&(o=n?[]:"")},c={add:function(){return o&&(n&&!t&&(s=o.length-1,a.push(n)),function t(n){xe.each(n,function(n,r){xe.isFunction(r)?e.unique&&c.has(r)||o.push(r):r&&r.length&&"string"!==xe.type(r)&&t(r)})}(arguments),n&&!t&&u()),this},remove:function(){return xe.each(arguments,function(e,t){for(var n;(n=xe.inArray(t,o,n))>-1;)o.splice(n,1),n<=s&&s--}),this},has:function(e){return e?xe.inArray(e,o)>-1:o.length>0},empty:function(){return o&&(o=[]),this},disable:function(){return i=a=[],o=n="",this},disabled:function(){return!o},lock:function(){return i=a=[],n||t||(o=n=""),this},locked:function(){return!!i},fireWith:function(e,n){return i||(n=n||[],n=[e,n.slice?n.slice():n],a.push(n),t||u()),this},fire:function(){return c.fireWith(this,arguments),this},fired:function(){return!!r}};return c},xe.extend({Deferred:function(e){var t=[["notify","progress",xe.Callbacks("memory"),xe.Callbacks("memory"),2],["resolve","done",xe.Callbacks("once memory"),xe.Callbacks("once memory"),0,"resolved"],["reject","fail",xe.Callbacks("once memory"),xe.Callbacks("once memory"),1,"rejected"]],r="pending",i={state:function(){return r},always:function(){return o.done(arguments).fail(arguments),this},catch:function(e){return i.then(null,e)},pipe:function(){var e=arguments;return xe.Deferred(function(n){xe.each(t,function(t,r){var i=xe.isFunction(e[r[4]])&&e[r[4]];o[r[1]](function(){var e=i&&i.apply(this,arguments);e&&xe.isFunction(e.promise)?e.promise().progress(n.notify).done(n.resolve).fail(n.reject):n[r[0]+"With"](this,i?[e]:arguments)})}),e=null}).promise()},then:function(e,r,i){function o(e,t,r,i){return function(){var s=this,u=arguments,c=function(){var n,c;if(!(e<a)){if(n=r.apply(s,u),n===t.promise())throw new TypeError("Thenable self-resolution");c=n&&("object"==typeof n||"function"==typeof n)&&n.then,xe.isFunction(c)?i?c.call(n,o(a,t,p,i),o(a,t,d,i)):(a++,c.call(n,o(a,t,p,i),o(a,t,d,i),o(a,t,p,t.notifyWith))):(r!==p&&(s=void 0,u=[n]),(i||t.resolveWith)(s,u))}},l=i?c:function(){try{c()}catch(n){xe.Deferred.exceptionHook&&xe.Deferred.exceptionHook(n,l.stackTrace),e+1>=a&&(r!==d&&(s=void 0,u=[n]),t.rejectWith(s,u))}};e?l():(xe.Deferred.getStackHook&&(l.stackTrace=xe.Deferred.getStackHook()),n.setTimeout(l))}}var a=0;return xe.Deferred(function(n){t[0][3].add(o(0,n,xe.isFunction(i)?i:p,n.notifyWith)),t[1][3].add(o(0,n,xe.isFunction(e)?e:p)),t[2][3].add(o(0,n,xe.isFunction(r)?r:d))}).promise()},promise:function(e){return null!=e?xe.extend(e,i):i}},o={};return xe.each(t,function(e,n){var a=n[2],s=n[5];i[n[1]]=a.add,s&&a.add(function(){r=s},t[3-e][2].disable,t[0][2].lock),a.add(n[3].fire),o[n[0]]=function(){return o[n[0]+"With"](this===o?void 0:this,arguments),this},o[n[0]+"With"]=a.fireWith}),i.promise(o),e&&e.call(o,o),o},when:function(e){var t=arguments.length,n=t,r=Array(n),i=ue.call(arguments),o=xe.Deferred(),a=function(e){return function(n){r[e]=this,i[e]=arguments.length>1?ue.call(arguments):n,--t||o.resolveWith(r,i)}};if(t<=1&&(h(e,o.done(a(n)).resolve,o.reject,!t),"pending"===o.state()||xe.isFunction(i[n]&&i[n].then)))return o.then();for(;n--;)h(i[n],a(n),o.reject);return o.promise()}});var Fe=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;xe.Deferred.exceptionHook=function(e,t){n.console&&n.console.warn&&e&&Fe.test(e.name)&&n.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},xe.readyException=function(e){n.setTimeout(function(){throw e})};var Ie=xe.Deferred();xe.fn.ready=function(e){return Ie.then(e).catch(function(e){xe.readyException(e)}),this},xe.extend({isReady:!1,readyWait:1,ready:function(e){(e===!0?--xe.readyWait:xe.isReady)||(xe.isReady=!0,e!==!0&&--xe.readyWait>0||Ie.resolveWith(ae,[xe]))}}),xe.ready.then=Ie.then,"complete"===ae.readyState||"loading"!==ae.readyState&&!ae.documentElement.doScroll?n.setTimeout(xe.ready):(ae.addEventListener("DOMContentLoaded",g),n.addEventListener("load",g));var He=function(e,t,n,r,i,o,a){var s=0,u=e.length,c=null==n;if("object"===xe.type(n)){i=!0;for(s in n)He(e,t,s,n[s],!0,o,a)}else if(void 0!==r&&(i=!0,xe.isFunction(r)||(a=!0),c&&(a?(t.call(e,r),t=null):(c=t,t=function(e,t,n){return c.call(xe(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:c?t.call(e):u?t(e[0],n):o},Re=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};v.uid=1,v.prototype={cache:function(e){var t=e[this.expando];return t||(t={},Re(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[xe.camelCase(t)]=n;else for(r in t)i[xe.camelCase(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][xe.camelCase(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){Array.isArray(t)?t=t.map(xe.camelCase):(t=xe.camelCase(t),t=t in r?[t]:t.match(Pe)||[]),n=t.length;for(;n--;)delete r[t[n]]}(void 0===t||xe.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!xe.isEmptyObject(t)}};var Be=new v,We=new v,$e=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,_e=/[A-Z]/g;xe.extend({hasData:function(e){return We.hasData(e)||Be.hasData(e)},data:function(e,t,n){return We.access(e,t,n)},removeData:function(e,t){We.remove(e,t)},_data:function(e,t,n){return Be.access(e,t,n)},_removeData:function(e,t){Be.remove(e,t)}}),xe.fn.extend({data:function(e,t){var n,r,i,o=this[0],a=o&&o.attributes;if(void 0===e){if(this.length&&(i=We.get(o),1===o.nodeType&&!Be.get(o,"hasDataAttrs"))){for(n=a.length;n--;)a[n]&&(r=a[n].name,0===r.indexOf("data-")&&(r=xe.camelCase(r.slice(5)),y(o,r,i[r])));Be.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof e?this.each(function(){We.set(this,e)}):He(this,function(t){var n;if(o&&void 0===t){if(n=We.get(o,e),void 0!==n)return n;if(n=y(o,e),void 0!==n)return n}else this.each(function(){We.set(this,e,t)})},null,t,arguments.length>1,null,!0)},removeData:function(e){return this.each(function(){We.remove(this,e)})}}),xe.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=Be.get(e,t),n&&(!r||Array.isArray(n)?r=Be.access(e,t,xe.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=xe.queue(e,t),r=n.length,i=n.shift(),o=xe._queueHooks(e,t),a=function(){xe.dequeue(e,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,a,o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return Be.get(e,n)||Be.access(e,n,{empty:xe.Callbacks("once memory").add(function(){Be.remove(e,[t+"queue",n])})})}}),xe.fn.extend({queue:function(e,t){var n=2;return"string"!=typeof e&&(t=e,e="fx",n--),arguments.length<n?xe.queue(this[0],e):void 0===t?this:this.each(function(){var n=xe.queue(this,e,t);xe._queueHooks(this,e),"fx"===e&&"inprogress"!==n[0]&&xe.dequeue(this,e)})},dequeue:function(e){return this.each(function(){xe.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=xe.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};for("string"!=typeof e&&(t=e,e=void 0),e=e||"fx";a--;)n=Be.get(o[a],e+"queueHooks"),n&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var ze=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,Ve=new RegExp("^(?:([+-])=|)("+ze+")([a-z%]*)$","i"),Ue=["Top","Right","Bottom","Left"],Xe=function(e,t){return e=t||e,"none"===e.style.display||""===e.style.display&&xe.contains(e.ownerDocument,e)&&"none"===xe.css(e,"display")},Qe=function(e,t,n,r){var i,o,a={};for(o in t)a[o]=e.style[o],e.style[o]=t[o];i=n.apply(e,r||[]);for(o in t)e.style[o]=a[o];return i},Ge={};xe.fn.extend({show:function(){return w(this,!0)},hide:function(){return w(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){Xe(this)?xe(this).show():xe(this).hide()})}});var Ye=/^(?:checkbox|radio)$/i,Je=/<([a-z][^\/\0>\x20\t\r\n\f]+)/i,Ke=/^$|\/(?:java|ecma)script/i,Ze={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};Ze.optgroup=Ze.option,Ze.tbody=Ze.tfoot=Ze.colgroup=Ze.caption=Ze.thead,
Ze.th=Ze.td;var et=/<|&#?\w+;/;!function(){var e=ae.createDocumentFragment(),t=e.appendChild(ae.createElement("div")),n=ae.createElement("input");n.setAttribute("type","radio"),n.setAttribute("checked","checked"),n.setAttribute("name","t"),t.appendChild(n),me.checkClone=t.cloneNode(!0).cloneNode(!0).lastChild.checked,t.innerHTML="<textarea>x</textarea>",me.noCloneChecked=!!t.cloneNode(!0).lastChild.defaultValue}();var tt=ae.documentElement,nt=/^key/,rt=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,it=/^([^.]*)(?:\.(.+)|)/;xe.event={global:{},add:function(e,t,n,r,i){var o,a,s,u,c,l,f,p,d,h,g,v=Be.get(e);if(v)for(n.handler&&(o=n,n=o.handler,i=o.selector),i&&xe.find.matchesSelector(tt,i),n.guid||(n.guid=xe.guid++),(u=v.events)||(u=v.events={}),(a=v.handle)||(a=v.handle=function(t){return"undefined"!=typeof xe&&xe.event.triggered!==t.type?xe.event.dispatch.apply(e,arguments):void 0}),t=(t||"").match(Pe)||[""],c=t.length;c--;)s=it.exec(t[c])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d&&(f=xe.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=xe.event.special[d]||{},l=xe.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&xe.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||(p=u[d]=[],p.delegateCount=0,f.setup&&f.setup.call(e,r,h,a)!==!1||e.addEventListener&&e.addEventListener(d,a)),f.add&&(f.add.call(e,l),l.handler.guid||(l.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,l):p.push(l),xe.event.global[d]=!0)},remove:function(e,t,n,r,i){var o,a,s,u,c,l,f,p,d,h,g,v=Be.hasData(e)&&Be.get(e);if(v&&(u=v.events)){for(t=(t||"").match(Pe)||[""],c=t.length;c--;)if(s=it.exec(t[c])||[],d=g=s[1],h=(s[2]||"").split(".").sort(),d){for(f=xe.event.special[d]||{},d=(r?f.delegateType:f.bindType)||d,p=u[d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;o--;)l=p[o],!i&&g!==l.origType||n&&n.guid!==l.guid||s&&!s.test(l.namespace)||r&&r!==l.selector&&("**"!==r||!l.selector)||(p.splice(o,1),l.selector&&p.delegateCount--,f.remove&&f.remove.call(e,l));a&&!p.length&&(f.teardown&&f.teardown.call(e,h,v.handle)!==!1||xe.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)xe.event.remove(e,d+t[c],n,r,!0);xe.isEmptyObject(u)&&Be.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=xe.event.fix(e),u=new Array(arguments.length),c=(Be.get(this,"events")||{})[s.type]||[],l=xe.event.special[s.type]||{};for(u[0]=s,t=1;t<arguments.length;t++)u[t]=arguments[t];if(s.delegateTarget=this,!l.preDispatch||l.preDispatch.call(this,s)!==!1){for(a=xe.event.handlers.call(this,s,c),t=0;(i=a[t++])&&!s.isPropagationStopped();)for(s.currentTarget=i.elem,n=0;(o=i.handlers[n++])&&!s.isImmediatePropagationStopped();)s.rnamespace&&!s.rnamespace.test(o.namespace)||(s.handleObj=o,s.data=o.data,r=((xe.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,u),void 0!==r&&(s.result=r)===!1&&(s.preventDefault(),s.stopPropagation()));return l.postDispatch&&l.postDispatch.call(this,s),s.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,c=e.target;if(u&&c.nodeType&&!("click"===e.type&&e.button>=1))for(;c!==this;c=c.parentNode||this)if(1===c.nodeType&&("click"!==e.type||c.disabled!==!0)){for(o=[],a={},n=0;n<u;n++)r=t[n],i=r.selector+" ",void 0===a[i]&&(a[i]=r.needsContext?xe(i,this).index(c)>-1:xe.find(i,this,null,[c]).length),a[i]&&o.push(r);o.length&&s.push({elem:c,handlers:o})}return c=this,u<t.length&&s.push({elem:c,handlers:t.slice(u)}),s},addProp:function(e,t){Object.defineProperty(xe.Event.prototype,e,{enumerable:!0,configurable:!0,get:xe.isFunction(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(t){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:t})}})},fix:function(e){return e[xe.expando]?e:new xe.Event(e)},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==N()&&this.focus)return this.focus(),!1},delegateType:"focusin"},blur:{trigger:function(){if(this===N()&&this.blur)return this.blur(),!1},delegateType:"focusout"},click:{trigger:function(){if("checkbox"===this.type&&this.click&&u(this,"input"))return this.click(),!1},_default:function(e){return u(e.target,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},xe.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},xe.Event=function(e,t){return this instanceof xe.Event?(e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&e.returnValue===!1?S:E,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&xe.extend(this,t),this.timeStamp=e&&e.timeStamp||xe.now(),void(this[xe.expando]=!0)):new xe.Event(e,t)},xe.Event.prototype={constructor:xe.Event,isDefaultPrevented:E,isPropagationStopped:E,isImmediatePropagationStopped:E,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=S,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=S,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=S,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},xe.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:function(e){var t=e.button;return null==e.which&&nt.test(e.type)?null!=e.charCode?e.charCode:e.keyCode:!e.which&&void 0!==t&&rt.test(e.type)?1&t?1:2&t?3:4&t?2:0:e.which}},xe.event.addProp),xe.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){xe.event.special[e]={delegateType:t,bindType:t,handle:function(e){var n,r=this,i=e.relatedTarget,o=e.handleObj;return i&&(i===r||xe.contains(r,i))||(e.type=o.origType,n=o.handler.apply(this,arguments),e.type=t),n}}}),xe.fn.extend({on:function(e,t,n,r){return A(this,e,t,n,r)},one:function(e,t,n,r){return A(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,xe(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return t!==!1&&"function"!=typeof t||(n=t,t=void 0),n===!1&&(n=E),this.each(function(){xe.event.remove(this,e,n,t)})}});var ot=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,at=/<script|<style|<link/i,st=/checked\s*(?:[^=]|=\s*.checked.)/i,ut=/^true\/(.*)/,ct=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;xe.extend({htmlPrefilter:function(e){return e.replace(ot,"<$1></$2>")},clone:function(e,t,n){var r,i,o,a,s=e.cloneNode(!0),u=xe.contains(e.ownerDocument,e);if(!(me.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||xe.isXMLDoc(e)))for(a=T(s),o=T(e),r=0,i=o.length;r<i;r++)O(o[r],a[r]);if(t)if(n)for(o=o||T(e),a=a||T(s),r=0,i=o.length;r<i;r++)q(o[r],a[r]);else q(e,s);return a=T(s,"script"),a.length>0&&C(a,!u&&T(e,"script")),s},cleanData:function(e){for(var t,n,r,i=xe.event.special,o=0;void 0!==(n=e[o]);o++)if(Re(n)){if(t=n[Be.expando]){if(t.events)for(r in t.events)i[r]?xe.event.remove(n,r):xe.removeEvent(n,r,t.handle);n[Be.expando]=void 0}n[We.expando]&&(n[We.expando]=void 0)}}}),xe.fn.extend({detach:function(e){return P(this,e,!0)},remove:function(e){return P(this,e)},text:function(e){return He(this,function(e){return void 0===e?xe.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return L(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=j(this,e);t.appendChild(e)}})},prepend:function(){return L(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=j(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return L(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return L(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(xe.cleanData(T(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return xe.clone(this,e,t)})},html:function(e){return He(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!at.test(e)&&!Ze[(Je.exec(e)||["",""])[1].toLowerCase()]){e=xe.htmlPrefilter(e);try{for(;n<r;n++)t=this[n]||{},1===t.nodeType&&(xe.cleanData(T(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var e=[];return L(this,arguments,function(t){var n=this.parentNode;xe.inArray(this,e)<0&&(xe.cleanData(T(this)),n&&n.replaceChild(t,this))},e)}}),xe.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){xe.fn[e]=function(e){for(var n,r=[],i=xe(e),o=i.length-1,a=0;a<=o;a++)n=a===o?this:this.clone(!0),xe(i[a])[t](n),le.apply(r,n.get());return this.pushStack(r)}});var lt=/^margin/,ft=new RegExp("^("+ze+")(?!px)[a-z%]+$","i"),pt=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=n),t.getComputedStyle(e)};!function(){function e(){if(s){s.style.cssText="box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",s.innerHTML="",tt.appendChild(a);var e=n.getComputedStyle(s);t="1%"!==e.top,o="2px"===e.marginLeft,r="4px"===e.width,s.style.marginRight="50%",i="4px"===e.marginRight,tt.removeChild(a),s=null}}var t,r,i,o,a=ae.createElement("div"),s=ae.createElement("div");s.style&&(s.style.backgroundClip="content-box",s.cloneNode(!0).style.backgroundClip="",me.clearCloneStyle="content-box"===s.style.backgroundClip,a.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",a.appendChild(s),xe.extend(me,{pixelPosition:function(){return e(),t},boxSizingReliable:function(){return e(),r},pixelMarginRight:function(){return e(),i},reliableMarginLeft:function(){return e(),o}}))}();var dt=/^(none|table(?!-c[ea]).+)/,ht=/^--/,gt={position:"absolute",visibility:"hidden",display:"block"},vt={letterSpacing:"0",fontWeight:"400"},mt=["Webkit","Moz","ms"],yt=ae.createElement("div").style;xe.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=F(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{float:"cssFloat"},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=xe.camelCase(t),u=ht.test(t),c=e.style;return u||(t=R(s)),a=xe.cssHooks[t]||xe.cssHooks[s],void 0===n?a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:c[t]:(o=typeof n,"string"===o&&(i=Ve.exec(n))&&i[1]&&(n=x(e,t,i),o="number"),null!=n&&n===n&&("number"===o&&(n+=i&&i[3]||(xe.cssNumber[s]?"":"px")),me.clearCloneStyle||""!==n||0!==t.indexOf("background")||(c[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?c.setProperty(t,n):c[t]=n)),void 0)}},css:function(e,t,n,r){var i,o,a,s=xe.camelCase(t),u=ht.test(t);return u||(t=R(s)),a=xe.cssHooks[t]||xe.cssHooks[s],a&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=F(e,t,r)),"normal"===i&&t in vt&&(i=vt[t]),""===n||n?(o=parseFloat(i),n===!0||isFinite(o)?o||0:i):i}}),xe.each(["height","width"],function(e,t){xe.cssHooks[t]={get:function(e,n,r){if(n)return!dt.test(xe.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?$(e,t,r):Qe(e,gt,function(){return $(e,t,r)})},set:function(e,n,r){var i,o=r&&pt(e),a=r&&W(e,t,r,"border-box"===xe.css(e,"boxSizing",!1,o),o);return a&&(i=Ve.exec(n))&&"px"!==(i[3]||"px")&&(e.style[t]=n,n=xe.css(e,t)),B(e,n,a)}}}),xe.cssHooks.marginLeft=I(me.reliableMarginLeft,function(e,t){if(t)return(parseFloat(F(e,"marginLeft"))||e.getBoundingClientRect().left-Qe(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),xe.each({margin:"",padding:"",border:"Width"},function(e,t){xe.cssHooks[e+t]={expand:function(n){for(var r=0,i={},o="string"==typeof n?n.split(" "):[n];r<4;r++)i[e+Ue[r]+t]=o[r]||o[r-2]||o[0];return i}},lt.test(e)||(xe.cssHooks[e+t].set=B)}),xe.fn.extend({css:function(e,t){return He(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=pt(e),i=t.length;a<i;a++)o[t[a]]=xe.css(e,t[a],!1,r);return o}return void 0!==n?xe.style(e,t,n):xe.css(e,t)},e,t,arguments.length>1)}}),xe.Tween=_,_.prototype={constructor:_,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||xe.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(xe.cssNumber[n]?"":"px")},cur:function(){var e=_.propHooks[this.prop];return e&&e.get?e.get(this):_.propHooks._default.get(this)},run:function(e){var t,n=_.propHooks[this.prop];return this.options.duration?this.pos=t=xe.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):_.propHooks._default.set(this),this}},_.prototype.init.prototype=_.prototype,_.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=xe.css(e.elem,e.prop,""),t&&"auto"!==t?t:0)},set:function(e){xe.fx.step[e.prop]?xe.fx.step[e.prop](e):1!==e.elem.nodeType||null==e.elem.style[xe.cssProps[e.prop]]&&!xe.cssHooks[e.prop]?e.elem[e.prop]=e.now:xe.style(e.elem,e.prop,e.now+e.unit)}}},_.propHooks.scrollTop=_.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},xe.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},xe.fx=_.prototype.init,xe.fx.step={};var xt,bt,wt=/^(?:toggle|show|hide)$/,Tt=/queueHooks$/;xe.Animation=xe.extend(Y,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return x(n.elem,e,Ve.exec(t),n),n}]},tweener:function(e,t){xe.isFunction(e)?(t=e,e=["*"]):e=e.match(Pe);for(var n,r=0,i=e.length;r<i;r++)n=e[r],Y.tweeners[n]=Y.tweeners[n]||[],Y.tweeners[n].unshift(t)},prefilters:[Q],prefilter:function(e,t){t?Y.prefilters.unshift(e):Y.prefilters.push(e)}}),xe.speed=function(e,t,n){var r=e&&"object"==typeof e?xe.extend({},e):{complete:n||!n&&t||xe.isFunction(e)&&e,duration:e,easing:n&&t||t&&!xe.isFunction(t)&&t};return xe.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in xe.fx.speeds?r.duration=xe.fx.speeds[r.duration]:r.duration=xe.fx.speeds._default),null!=r.queue&&r.queue!==!0||(r.queue="fx"),r.old=r.complete,r.complete=function(){xe.isFunction(r.old)&&r.old.call(this),r.queue&&xe.dequeue(this,r.queue)},r},xe.fn.extend({fadeTo:function(e,t,n,r){return this.filter(Xe).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(e,t,n,r){var i=xe.isEmptyObject(e),o=xe.speed(t,n,r),a=function(){var t=Y(this,xe.extend({},e),o);(i||Be.get(this,"finish"))&&t.stop(!0)};return a.finish=a,i||o.queue===!1?this.each(a):this.queue(o.queue,a)},stop:function(e,t,n){var r=function(e){var t=e.stop;delete e.stop,t(n)};return"string"!=typeof e&&(n=t,t=e,e=void 0),t&&e!==!1&&this.queue(e||"fx",[]),this.each(function(){var t=!0,i=null!=e&&e+"queueHooks",o=xe.timers,a=Be.get(this);if(i)a[i]&&a[i].stop&&r(a[i]);else for(i in a)a[i]&&a[i].stop&&Tt.test(i)&&r(a[i]);for(i=o.length;i--;)o[i].elem!==this||null!=e&&o[i].queue!==e||(o[i].anim.stop(n),t=!1,o.splice(i,1));!t&&n||xe.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=Be.get(this),r=n[e+"queue"],i=n[e+"queueHooks"],o=xe.timers,a=r?r.length:0;for(n.finish=!0,xe.queue(this,e,[]),i&&i.stop&&i.stop.call(this,!0),t=o.length;t--;)o[t].elem===this&&o[t].queue===e&&(o[t].anim.stop(!0),o.splice(t,1));for(t=0;t<a;t++)r[t]&&r[t].finish&&r[t].finish.call(this);delete n.finish})}}),xe.each(["toggle","show","hide"],function(e,t){var n=xe.fn[t];xe.fn[t]=function(e,r,i){return null==e||"boolean"==typeof e?n.apply(this,arguments):this.animate(U(t,!0),e,r,i)}}),xe.each({slideDown:U("show"),slideUp:U("hide"),slideToggle:U("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){xe.fn[e]=function(e,n,r){return this.animate(t,e,n,r)}}),xe.timers=[],xe.fx.tick=function(){var e,t=0,n=xe.timers;for(xt=xe.now();t<n.length;t++)e=n[t],e()||n[t]!==e||n.splice(t--,1);n.length||xe.fx.stop(),xt=void 0},xe.fx.timer=function(e){xe.timers.push(e),xe.fx.start()},xe.fx.interval=13,xe.fx.start=function(){bt||(bt=!0,z())},xe.fx.stop=function(){bt=null},xe.fx.speeds={slow:600,fast:200,_default:400},xe.fn.delay=function(e,t){return e=xe.fx?xe.fx.speeds[e]||e:e,t=t||"fx",this.queue(t,function(t,r){var i=n.setTimeout(t,e);r.stop=function(){n.clearTimeout(i)}})},function(){var e=ae.createElement("input"),t=ae.createElement("select"),n=t.appendChild(ae.createElement("option"));e.type="checkbox",me.checkOn=""!==e.value,me.optSelected=n.selected,e=ae.createElement("input"),e.value="t",e.type="radio",me.radioValue="t"===e.value}();var Ct,kt=xe.expr.attrHandle;xe.fn.extend({attr:function(e,t){return He(this,xe.attr,e,t,arguments.length>1)},removeAttr:function(e){return this.each(function(){xe.removeAttr(this,e)})}}),xe.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?xe.prop(e,t,n):(1===o&&xe.isXMLDoc(e)||(i=xe.attrHooks[t.toLowerCase()]||(xe.expr.match.bool.test(t)?Ct:void 0)),void 0!==n?null===n?void xe.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:(r=xe.find.attr(e,t),null==r?void 0:r))},attrHooks:{type:{set:function(e,t){if(!me.radioValue&&"radio"===t&&u(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(Pe);if(i&&1===e.nodeType)for(;n=i[r++];)e.removeAttribute(n)}}),Ct={set:function(e,t,n){return t===!1?xe.removeAttr(e,n):e.setAttribute(n,n),n}},xe.each(xe.expr.match.bool.source.match(/\w+/g),function(e,t){var n=kt[t]||xe.find.attr;kt[t]=function(e,t,r){var i,o,a=t.toLowerCase();return r||(o=kt[a],kt[a]=i,i=null!=n(e,t,r)?a:null,kt[a]=o),i}});var St=/^(?:input|select|textarea|button)$/i,Et=/^(?:a|area)$/i;xe.fn.extend({prop:function(e,t){return He(this,xe.prop,e,t,arguments.length>1)},removeProp:function(e){return this.each(function(){delete this[xe.propFix[e]||e]})}}),xe.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&xe.isXMLDoc(e)||(t=xe.propFix[t]||t,i=xe.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=xe.find.attr(e,"tabindex");return t?parseInt(t,10):St.test(e.nodeName)||Et.test(e.nodeName)&&e.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),me.optSelected||(xe.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),xe.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){xe.propFix[this.toLowerCase()]=this}),xe.fn.extend({addClass:function(e){var t,n,r,i,o,a,s,u=0;if(xe.isFunction(e))return this.each(function(t){xe(this).addClass(e.call(this,t,K(this)))});if("string"==typeof e&&e)for(t=e.match(Pe)||[];n=this[u++];)if(i=K(n),r=1===n.nodeType&&" "+J(i)+" "){for(a=0;o=t[a++];)r.indexOf(" "+o+" ")<0&&(r+=o+" ");s=J(r),i!==s&&n.setAttribute("class",s)}return this},removeClass:function(e){var t,n,r,i,o,a,s,u=0;if(xe.isFunction(e))return this.each(function(t){xe(this).removeClass(e.call(this,t,K(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof e&&e)for(t=e.match(Pe)||[];n=this[u++];)if(i=K(n),r=1===n.nodeType&&" "+J(i)+" "){for(a=0;o=t[a++];)for(;r.indexOf(" "+o+" ")>-1;)r=r.replace(" "+o+" "," ");s=J(r),i!==s&&n.setAttribute("class",s)}return this},toggleClass:function(e,t){var n=typeof e;return"boolean"==typeof t&&"string"===n?t?this.addClass(e):this.removeClass(e):xe.isFunction(e)?this.each(function(n){xe(this).toggleClass(e.call(this,n,K(this),t),t)}):this.each(function(){var t,r,i,o;if("string"===n)for(r=0,i=xe(this),o=e.match(Pe)||[];t=o[r++];)i.hasClass(t)?i.removeClass(t):i.addClass(t);else void 0!==e&&"boolean"!==n||(t=K(this),t&&Be.set(this,"__className__",t),this.setAttribute&&this.setAttribute("class",t||e===!1?"":Be.get(this,"__className__")||""))})},hasClass:function(e){var t,n,r=0;for(t=" "+e+" ";n=this[r++];)if(1===n.nodeType&&(" "+J(K(n))+" ").indexOf(t)>-1)return!0;return!1}});var Nt=/\r/g;xe.fn.extend({val:function(e){var t,n,r,i=this[0];{if(arguments.length)return r=xe.isFunction(e),this.each(function(n){var i;1===this.nodeType&&(i=r?e.call(this,n,xe(this).val()):e,null==i?i="":"number"==typeof i?i+="":Array.isArray(i)&&(i=xe.map(i,function(e){return null==e?"":e+""})),t=xe.valHooks[this.type]||xe.valHooks[this.nodeName.toLowerCase()],t&&"set"in t&&void 0!==t.set(this,i,"value")||(this.value=i))});if(i)return t=xe.valHooks[i.type]||xe.valHooks[i.nodeName.toLowerCase()],t&&"get"in t&&void 0!==(n=t.get(i,"value"))?n:(n=i.value,"string"==typeof n?n.replace(Nt,""):null==n?"":n)}}}),xe.extend({valHooks:{option:{get:function(e){var t=xe.find.attr(e,"value");return null!=t?t:J(xe.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],c=a?o+1:i.length;for(r=o<0?c:a?o:0;r<c;r++)if(n=i[r],(n.selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!u(n.parentNode,"optgroup"))){if(t=xe(n).val(),a)return t;s.push(t)}return s},set:function(e,t){for(var n,r,i=e.options,o=xe.makeArray(t),a=i.length;a--;)r=i[a],(r.selected=xe.inArray(xe.valHooks.option.get(r),o)>-1)&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),xe.each(["radio","checkbox"],function(){xe.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=xe.inArray(xe(e).val(),t)>-1}},me.checkOn||(xe.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var At=/^(?:focusinfocus|focusoutblur)$/;xe.extend(xe.event,{trigger:function(e,t,r,i){var o,a,s,u,c,l,f,p=[r||ae],d=he.call(e,"type")?e.type:e,h=he.call(e,"namespace")?e.namespace.split("."):[];if(a=s=r=r||ae,3!==r.nodeType&&8!==r.nodeType&&!At.test(d+xe.event.triggered)&&(d.indexOf(".")>-1&&(h=d.split("."),d=h.shift(),h.sort()),c=d.indexOf(":")<0&&"on"+d,e=e[xe.expando]?e:new xe.Event(d,"object"==typeof e&&e),e.isTrigger=i?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=r),t=null==t?[e]:xe.makeArray(t,[e]),f=xe.event.special[d]||{},i||!f.trigger||f.trigger.apply(r,t)!==!1)){if(!i&&!f.noBubble&&!xe.isWindow(r)){for(u=f.delegateType||d,At.test(u+d)||(a=a.parentNode);a;a=a.parentNode)p.push(a),s=a;s===(r.ownerDocument||ae)&&p.push(s.defaultView||s.parentWindow||n)}for(o=0;(a=p[o++])&&!e.isPropagationStopped();)e.type=o>1?u:f.bindType||d,l=(Be.get(a,"events")||{})[e.type]&&Be.get(a,"handle"),l&&l.apply(a,t),l=c&&a[c],l&&l.apply&&Re(a)&&(e.result=l.apply(a,t),e.result===!1&&e.preventDefault());return e.type=d,i||e.isDefaultPrevented()||f._default&&f._default.apply(p.pop(),t)!==!1||!Re(r)||c&&xe.isFunction(r[d])&&!xe.isWindow(r)&&(s=r[c],s&&(r[c]=null),xe.event.triggered=d,r[d](),xe.event.triggered=void 0,s&&(r[c]=s)),e.result}},simulate:function(e,t,n){var r=xe.extend(new xe.Event,n,{type:e,isSimulated:!0});xe.event.trigger(r,null,t)}}),xe.fn.extend({trigger:function(e,t){return this.each(function(){xe.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return xe.event.trigger(e,t,n,!0)}}),xe.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){xe.fn[t]=function(e,n){return arguments.length>0?this.on(t,null,e,n):this.trigger(t)}}),xe.fn.extend({hover:function(e,t){return this.mouseenter(e).mouseleave(t||e)}}),me.focusin="onfocusin"in n,me.focusin||xe.each({focus:"focusin",blur:"focusout"},function(e,t){var n=function(e){xe.event.simulate(t,e.target,xe.event.fix(e))};xe.event.special[t]={setup:function(){var r=this.ownerDocument||this,i=Be.access(r,t);i||r.addEventListener(e,n,!0),Be.access(r,t,(i||0)+1)},teardown:function(){var r=this.ownerDocument||this,i=Be.access(r,t)-1;i?Be.access(r,t,i):(r.removeEventListener(e,n,!0),Be.remove(r,t))}}});var jt=n.location,Dt=xe.now(),Mt=/\?/;xe.parseXML=function(e){var t;if(!e||"string"!=typeof e)return null;try{t=(new n.DOMParser).parseFromString(e,"text/xml")}catch(e){t=void 0}return t&&!t.getElementsByTagName("parsererror").length||xe.error("Invalid XML: "+e),t};var qt=/\[\]$/,Ot=/\r?\n/g,Lt=/^(?:submit|button|image|reset|file)$/i,Pt=/^(?:input|select|textarea|keygen)/i;xe.param=function(e,t){var n,r=[],i=function(e,t){var n=xe.isFunction(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(Array.isArray(e)||e.jquery&&!xe.isPlainObject(e))xe.each(e,function(){i(this.name,this.value)});else for(n in e)Z(n,e[n],t,i);return r.join("&")},xe.fn.extend({serialize:function(){return xe.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=xe.prop(this,"elements");return e?xe.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!xe(this).is(":disabled")&&Pt.test(this.nodeName)&&!Lt.test(e)&&(this.checked||!Ye.test(e))}).map(function(e,t){var n=xe(this).val();return null==n?null:Array.isArray(n)?xe.map(n,function(e){return{name:t.name,value:e.replace(Ot,"\r\n")}}):{name:t.name,value:n.replace(Ot,"\r\n")}}).get()}});var Ft=/%20/g,It=/#.*$/,Ht=/([?&])_=[^&]*/,Rt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Bt=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Wt=/^(?:GET|HEAD)$/,$t=/^\/\//,_t={},zt={},Vt="*/".concat("*"),Ut=ae.createElement("a");Ut.href=jt.href,xe.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jt.href,type:"GET",isLocal:Bt.test(jt.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Vt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":xe.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?ne(ne(e,xe.ajaxSettings),t):ne(xe.ajaxSettings,e)},ajaxPrefilter:ee(_t),ajaxTransport:ee(zt),ajax:function(e,t){function r(e,t,r,s){var c,p,d,b,w,T=t;l||(l=!0,u&&n.clearTimeout(u),i=void 0,a=s||"",C.readyState=e>0?4:0,c=e>=200&&e<300||304===e,r&&(b=re(h,C,r)),b=ie(h,b,C,c),c?(h.ifModified&&(w=C.getResponseHeader("Last-Modified"),w&&(xe.lastModified[o]=w),w=C.getResponseHeader("etag"),w&&(xe.etag[o]=w)),204===e||"HEAD"===h.type?T="nocontent":304===e?T="notmodified":(T=b.state,p=b.data,d=b.error,c=!d)):(d=T,!e&&T||(T="error",e<0&&(e=0))),C.status=e,C.statusText=(t||T)+"",c?m.resolveWith(g,[p,T,C]):m.rejectWith(g,[C,T,d]),C.statusCode(x),x=void 0,f&&v.trigger(c?"ajaxSuccess":"ajaxError",[C,h,c?p:d]),y.fireWith(g,[C,T]),f&&(v.trigger("ajaxComplete",[C,h]),--xe.active||xe.event.trigger("ajaxStop")))}"object"==typeof e&&(t=e,e=void 0),t=t||{};var i,o,a,s,u,c,l,f,p,d,h=xe.ajaxSetup({},t),g=h.context||h,v=h.context&&(g.nodeType||g.jquery)?xe(g):xe.event,m=xe.Deferred(),y=xe.Callbacks("once memory"),x=h.statusCode||{},b={},w={},T="canceled",C={readyState:0,getResponseHeader:function(e){var t;if(l){if(!s)for(s={};t=Rt.exec(a);)s[t[1].toLowerCase()]=t[2];t=s[e.toLowerCase()]}return null==t?null:t},getAllResponseHeaders:function(){return l?a:null},setRequestHeader:function(e,t){return null==l&&(e=w[e.toLowerCase()]=w[e.toLowerCase()]||e,b[e]=t),this},overrideMimeType:function(e){return null==l&&(h.mimeType=e),this},statusCode:function(e){var t;if(e)if(l)C.always(e[C.status]);else for(t in e)x[t]=[x[t],e[t]];return this},abort:function(e){var t=e||T;return i&&i.abort(t),r(0,t),this}};if(m.promise(C),h.url=((e||h.url||jt.href)+"").replace($t,jt.protocol+"//"),h.type=t.method||t.type||h.method||h.type,h.dataTypes=(h.dataType||"*").toLowerCase().match(Pe)||[""],null==h.crossDomain){c=ae.createElement("a");try{c.href=h.url,c.href=c.href,h.crossDomain=Ut.protocol+"//"+Ut.host!=c.protocol+"//"+c.host}catch(e){h.crossDomain=!0}}if(h.data&&h.processData&&"string"!=typeof h.data&&(h.data=xe.param(h.data,h.traditional)),te(_t,h,t,C),l)return C;f=xe.event&&h.global,f&&0===xe.active++&&xe.event.trigger("ajaxStart"),h.type=h.type.toUpperCase(),h.hasContent=!Wt.test(h.type),o=h.url.replace(It,""),h.hasContent?h.data&&h.processData&&0===(h.contentType||"").indexOf("application/x-www-form-urlencoded")&&(h.data=h.data.replace(Ft,"+")):(d=h.url.slice(o.length),h.data&&(o+=(Mt.test(o)?"&":"?")+h.data,delete h.data),h.cache===!1&&(o=o.replace(Ht,"$1"),d=(Mt.test(o)?"&":"?")+"_="+Dt++ +d),h.url=o+d),h.ifModified&&(xe.lastModified[o]&&C.setRequestHeader("If-Modified-Since",xe.lastModified[o]),xe.etag[o]&&C.setRequestHeader("If-None-Match",xe.etag[o])),(h.data&&h.hasContent&&h.contentType!==!1||t.contentType)&&C.setRequestHeader("Content-Type",h.contentType),C.setRequestHeader("Accept",h.dataTypes[0]&&h.accepts[h.dataTypes[0]]?h.accepts[h.dataTypes[0]]+("*"!==h.dataTypes[0]?", "+Vt+"; q=0.01":""):h.accepts["*"]);for(p in h.headers)C.setRequestHeader(p,h.headers[p]);if(h.beforeSend&&(h.beforeSend.call(g,C,h)===!1||l))return C.abort();if(T="abort",y.add(h.complete),C.done(h.success),C.fail(h.error),i=te(zt,h,t,C)){if(C.readyState=1,f&&v.trigger("ajaxSend",[C,h]),l)return C;h.async&&h.timeout>0&&(u=n.setTimeout(function(){C.abort("timeout")},h.timeout));try{l=!1,i.send(b,r)}catch(e){if(l)throw e;r(-1,e)}}else r(-1,"No Transport");return C},getJSON:function(e,t,n){return xe.get(e,t,n,"json")},getScript:function(e,t){return xe.get(e,void 0,t,"script")}}),xe.each(["get","post"],function(e,t){xe[t]=function(e,n,r,i){return xe.isFunction(n)&&(i=i||r,r=n,n=void 0),xe.ajax(xe.extend({url:e,type:t,dataType:i,data:n,success:r},xe.isPlainObject(e)&&e))}}),xe._evalUrl=function(e){return xe.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,throws:!0})},xe.fn.extend({wrapAll:function(e){var t;return this[0]&&(xe.isFunction(e)&&(e=e.call(this[0])),t=xe(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){for(var e=this;e.firstElementChild;)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(e){return xe.isFunction(e)?this.each(function(t){xe(this).wrapInner(e.call(this,t))}):this.each(function(){var t=xe(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=xe.isFunction(e);return this.each(function(n){xe(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){xe(this).replaceWith(this.childNodes)}),this}}),xe.expr.pseudos.hidden=function(e){return!xe.expr.pseudos.visible(e)},xe.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
},xe.ajaxSettings.xhr=function(){try{return new n.XMLHttpRequest}catch(e){}};var Xt={0:200,1223:204},Qt=xe.ajaxSettings.xhr();me.cors=!!Qt&&"withCredentials"in Qt,me.ajax=Qt=!!Qt,xe.ajaxTransport(function(e){var t,r;if(me.cors||Qt&&!e.crossDomain)return{send:function(i,o){var a,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(a in e.xhrFields)s[a]=e.xhrFields[a];e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||i["X-Requested-With"]||(i["X-Requested-With"]="XMLHttpRequest");for(a in i)s.setRequestHeader(a,i[a]);t=function(e){return function(){t&&(t=r=s.onload=s.onerror=s.onabort=s.onreadystatechange=null,"abort"===e?s.abort():"error"===e?"number"!=typeof s.status?o(0,"error"):o(s.status,s.statusText):o(Xt[s.status]||s.status,s.statusText,"text"!==(s.responseType||"text")||"string"!=typeof s.responseText?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=t(),r=s.onerror=t("error"),void 0!==s.onabort?s.onabort=r:s.onreadystatechange=function(){4===s.readyState&&n.setTimeout(function(){t&&r()})},t=t("abort");try{s.send(e.hasContent&&e.data||null)}catch(e){if(t)throw e}},abort:function(){t&&t()}}}),xe.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),xe.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return xe.globalEval(e),e}}}),xe.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),xe.ajaxTransport("script",function(e){if(e.crossDomain){var t,n;return{send:function(r,i){t=xe("<script>").prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(e){t.remove(),n=null,e&&i("error"===e.type?404:200,e.type)}),ae.head.appendChild(t[0])},abort:function(){n&&n()}}}});var Gt=[],Yt=/(=)\?(?=&|$)|\?\?/;xe.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Gt.pop()||xe.expando+"_"+Dt++;return this[e]=!0,e}}),xe.ajaxPrefilter("json jsonp",function(e,t,r){var i,o,a,s=e.jsonp!==!1&&(Yt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Yt.test(e.data)&&"data");if(s||"jsonp"===e.dataTypes[0])return i=e.jsonpCallback=xe.isFunction(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,s?e[s]=e[s].replace(Yt,"$1"+i):e.jsonp!==!1&&(e.url+=(Mt.test(e.url)?"&":"?")+e.jsonp+"="+i),e.converters["script json"]=function(){return a||xe.error(i+" was not called"),a[0]},e.dataTypes[0]="json",o=n[i],n[i]=function(){a=arguments},r.always(function(){void 0===o?xe(n).removeProp(i):n[i]=o,e[i]&&(e.jsonpCallback=t.jsonpCallback,Gt.push(i)),a&&xe.isFunction(o)&&o(a[0]),a=o=void 0}),"script"}),me.createHTMLDocument=function(){var e=ae.implementation.createHTMLDocument("").body;return e.innerHTML="<form></form><form></form>",2===e.childNodes.length}(),xe.parseHTML=function(e,t,n){if("string"!=typeof e)return[];"boolean"==typeof t&&(n=t,t=!1);var r,i,o;return t||(me.createHTMLDocument?(t=ae.implementation.createHTMLDocument(""),r=t.createElement("base"),r.href=ae.location.href,t.head.appendChild(r)):t=ae),i=Ae.exec(e),o=!n&&[],i?[t.createElement(i[1])]:(i=k([e],t,o),o&&o.length&&xe(o).remove(),xe.merge([],i.childNodes))},xe.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return s>-1&&(r=J(e.slice(s)),e=e.slice(0,s)),xe.isFunction(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),a.length>0&&xe.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?xe("<div>").append(xe.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},xe.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){xe.fn[t]=function(e){return this.on(t,e)}}),xe.expr.pseudos.animated=function(e){return xe.grep(xe.timers,function(t){return e===t.elem}).length},xe.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,c,l=xe.css(e,"position"),f=xe(e),p={};"static"===l&&(e.style.position="relative"),s=f.offset(),o=xe.css(e,"top"),u=xe.css(e,"left"),c=("absolute"===l||"fixed"===l)&&(o+u).indexOf("auto")>-1,c?(r=f.position(),a=r.top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),xe.isFunction(t)&&(t=t.call(e,n,xe.extend({},s))),null!=t.top&&(p.top=t.top-s.top+a),null!=t.left&&(p.left=t.left-s.left+i),"using"in t?t.using.call(e,p):f.css(p)}},xe.fn.extend({offset:function(e){if(arguments.length)return void 0===e?this:this.each(function(t){xe.offset.setOffset(this,e,t)});var t,n,r,i,o=this[0];if(o)return o.getClientRects().length?(r=o.getBoundingClientRect(),t=o.ownerDocument,n=t.documentElement,i=t.defaultView,{top:r.top+i.pageYOffset-n.clientTop,left:r.left+i.pageXOffset-n.clientLeft}):{top:0,left:0}},position:function(){if(this[0]){var e,t,n=this[0],r={top:0,left:0};return"fixed"===xe.css(n,"position")?t=n.getBoundingClientRect():(e=this.offsetParent(),t=this.offset(),u(e[0],"html")||(r=e.offset()),r={top:r.top+xe.css(e[0],"borderTopWidth",!0),left:r.left+xe.css(e[0],"borderLeftWidth",!0)}),{top:t.top-r.top-xe.css(n,"marginTop",!0),left:t.left-r.left-xe.css(n,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var e=this.offsetParent;e&&"static"===xe.css(e,"position");)e=e.offsetParent;return e||tt})}}),xe.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n="pageYOffset"===t;xe.fn[e]=function(r){return He(this,function(e,r,i){var o;return xe.isWindow(e)?o=e:9===e.nodeType&&(o=e.defaultView),void 0===i?o?o[t]:e[r]:void(o?o.scrollTo(n?o.pageXOffset:i,n?i:o.pageYOffset):e[r]=i)},e,r,arguments.length)}}),xe.each(["top","left"],function(e,t){xe.cssHooks[t]=I(me.pixelPosition,function(e,n){if(n)return n=F(e,t),ft.test(n)?xe(e).position()[t]+"px":n})}),xe.each({Height:"height",Width:"width"},function(e,t){xe.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,r){xe.fn[r]=function(i,o){var a=arguments.length&&(n||"boolean"!=typeof i),s=n||(i===!0||o===!0?"margin":"border");return He(this,function(t,n,i){var o;return xe.isWindow(t)?0===r.indexOf("outer")?t["inner"+e]:t.document.documentElement["client"+e]:9===t.nodeType?(o=t.documentElement,Math.max(t.body["scroll"+e],o["scroll"+e],t.body["offset"+e],o["offset"+e],o["client"+e])):void 0===i?xe.css(t,n,s):xe.style(t,n,i,s)},t,a?i:void 0,a)}})}),xe.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)}}),xe.holdReady=function(e){e?xe.readyWait++:xe.ready(!0)},xe.isArray=Array.isArray,xe.parseJSON=JSON.parse,xe.nodeName=u,r=[],i=function(){return xe}.apply(t,r),!(void 0!==i&&(e.exports=i));var Jt=n.jQuery,Kt=n.$;return xe.noConflict=function(e){return n.$===xe&&(n.$=Kt),e&&n.jQuery===xe&&(n.jQuery=Jt),xe},o||(n.jQuery=n.$=xe),xe})},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(6);t.default={props:{progress:{type:Number,required:!0,default:.25},size:{type:Number,required:!1,default:150},startAngle:{type:Number},thickness:{type:Number},percentFontSize:{type:String,required:!1,default:function(){return(this.size/4).toString()+"px"}},animation:{required:!1,default:function(){return{duration:1200,easing:"circleProgressEasing"}},validator:function(e){return e instanceof Object||e===!1}},animationStartValue:{type:Number,required:!1,default:0},reverse:{type:Boolean,default:!1},lineCap:{type:String,default:"butt"},fill:{type:Object},emptyFill:{type:String},insertMode:{type:String},showPercent:{type:Boolean,default:!0}},mounted:function(){function e(e,n){n=n?n:t.progress,t.showPercent&&r(e).find("span.percent-text").html(Math.floor(100*n)+"%")}n(5);var t=this;r(t.$el).on("circle-inited",function(n){e(this,t.progress/100),t.$emit("vue-circle-init",n)}).circleProgress({value:this.convertedProgress(t.progress),size:t.size,startAngle:t.startAngle,reverse:t.reverse,lineCap:t.lineCap,fill:t.fill,emptyFill:t.emptyFill,animation:t.animation,animationStartValue:t.animationStartValue,insertMode:t.insertMode,thickness:t.thickness}).on("circle-animation-progress",function(n,r,i){e(this,i),t.$emit("vue-circle-progress",n,r,100*i)}).on("circle-animation-end",function(e){t.$emit("vue-circle-end",e)})},methods:{convertedProgress:function(e){return e/100},updateProgress:function(e){"number"===r.type(e)?r(this.$el).circleProgress("value",this.convertedProgress(e)):console.error("Passed Invalid Value. Number Expected. (Hint: use parseInt())")},updateFill:function(e){var t=r(this.$el).data("circle-progress");t.fill=e,t.initFill()}},beforeDestroy:function(){r(this.$el).remove()}}},function(e,t,n){t=e.exports=n(4)(),t.push([e.id,".circle[_v-31e92f67]{position:relative;display:inline-block}.circle-percent-text-body[_v-31e92f67]{position:absolute;width:100%;height:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.percent-text[_v-31e92f67]{font-weight:700}",""])},function(e,t){e.exports=function(){var e=[];return e.toString=function(){for(var e=[],t=0;t<this.length;t++){var n=this[t];n[2]?e.push("@media "+n[2]+"{"+n[1]+"}"):e.push(n[1])}return e.join("")},e.i=function(t,n){"string"==typeof t&&(t=[[null,t,""]]);for(var r={},i=0;i<this.length;i++){var o=this[i][0];"number"==typeof o&&(r[o]=!0)}for(i=0;i<t.length;i++){var a=t[i];"number"==typeof a[0]&&r[a[0]]||(n&&!a[2]?a[2]=n:n&&(a[2]="("+a[2]+") and ("+n+")"),e.push(a))}},e}},function(e,t,n){var r,i,o;/**
	 * jquery-circle-progress - jQuery Plugin to draw animated circular progress bars:
	 * {@link http://kottenator.github.io/jquery-circle-progress/}
	 *
	 * @author Rostyslav Bryzgunov <kottenator@gmail.com>
	 * @version 1.2.2
	 * @licence MIT
	 * @preserve
	 */
!function(a){i=[n(1)],r=a,o="function"==typeof r?r.apply(t,i):r,!(void 0!==o&&(e.exports=o))}(function(e){function t(e){this.init(e)}t.prototype={value:0,size:100,startAngle:-Math.PI,thickness:"auto",fill:{gradient:["#3aeabb","#fdd250"]},emptyFill:"rgba(0, 0, 0, .1)",animation:{duration:1200,easing:"circleProgressEasing"},animationStartValue:0,reverse:!1,lineCap:"butt",insertMode:"prepend",constructor:t,el:null,canvas:null,ctx:null,radius:0,arcFill:null,lastFrameValue:0,init:function(t){e.extend(this,t),this.radius=this.size/2,this.initWidget(),this.initFill(),this.draw(),this.el.trigger("circle-inited")},initWidget:function(){this.canvas||(this.canvas=e("<canvas>")["prepend"==this.insertMode?"prependTo":"appendTo"](this.el)[0]);var t=this.canvas;if(t.width=this.size,t.height=this.size,this.ctx=t.getContext("2d"),window.devicePixelRatio>1){var n=window.devicePixelRatio;t.style.width=t.style.height=this.size+"px",t.width=t.height=this.size*n,this.ctx.scale(n,n)}},initFill:function(){function t(){var t=e("<canvas>")[0];t.width=n.size,t.height=n.size,t.getContext("2d").drawImage(d,0,0,o,o),n.arcFill=n.ctx.createPattern(t,"no-repeat"),n.drawFrame(n.lastFrameValue)}var n=this,r=this.fill,i=this.ctx,o=this.size;if(!r)throw Error("The fill is not specified!");if("string"==typeof r&&(r={color:r}),r.color&&(this.arcFill=r.color),r.gradient){var a=r.gradient;if(1==a.length)this.arcFill=a[0];else if(a.length>1){for(var s=r.gradientAngle||0,u=r.gradientDirection||[o/2*(1-Math.cos(s)),o/2*(1+Math.sin(s)),o/2*(1+Math.cos(s)),o/2*(1-Math.sin(s))],c=i.createLinearGradient.apply(i,u),l=0;l<a.length;l++){var f=a[l],p=l/(a.length-1);e.isArray(f)&&(p=f[1],f=f[0]),c.addColorStop(p,f)}this.arcFill=c}}if(r.image){var d;r.image instanceof Image?d=r.image:(d=new Image,d.src=r.image),d.complete?t():d.onload=t}},draw:function(){this.animation?this.drawAnimated(this.value):this.drawFrame(this.value)},drawFrame:function(e){this.lastFrameValue=e,this.ctx.clearRect(0,0,this.size,this.size),this.drawEmptyArc(e),this.drawArc(e)},drawArc:function(e){if(0!==e){var t=this.ctx,n=this.radius,r=this.getThickness(),i=this.startAngle;t.save(),t.beginPath(),this.reverse?t.arc(n,n,n-r/2,i-2*Math.PI*e,i):t.arc(n,n,n-r/2,i,i+2*Math.PI*e),t.lineWidth=r,t.lineCap=this.lineCap,t.strokeStyle=this.arcFill,t.stroke(),t.restore()}},drawEmptyArc:function(e){var t=this.ctx,n=this.radius,r=this.getThickness(),i=this.startAngle;e<1&&(t.save(),t.beginPath(),e<=0?t.arc(n,n,n-r/2,0,2*Math.PI):this.reverse?t.arc(n,n,n-r/2,i,i-2*Math.PI*e):t.arc(n,n,n-r/2,i+2*Math.PI*e,i),t.lineWidth=r,t.strokeStyle=this.emptyFill,t.stroke(),t.restore())},drawAnimated:function(t){var n=this,r=this.el,i=e(this.canvas);i.stop(!0,!1),r.trigger("circle-animation-start"),i.css({animationProgress:0}).animate({animationProgress:1},e.extend({},this.animation,{step:function(e){var i=n.animationStartValue*(1-e)+t*e;n.drawFrame(i),r.trigger("circle-animation-progress",[e,i])}})).promise().always(function(){r.trigger("circle-animation-end")})},getThickness:function(){return e.isNumeric(this.thickness)?this.thickness:this.size/14},getValue:function(){return this.value},setValue:function(e){this.animation&&(this.animationStartValue=this.lastFrameValue),this.value=e,this.draw()}},e.circleProgress={defaults:t.prototype},e.easing.circleProgressEasing=function(e){return e<.5?(e*=2,.5*e*e*e):(e=2-2*e,1-.5*e*e*e)},e.fn.circleProgress=function(n,r){var i="circle-progress",o=this.data(i);if("widget"==n){if(!o)throw Error('Calling "widget" method on not initialized instance is forbidden');return o.canvas}if("value"==n){if(!o)throw Error('Calling "value" method on not initialized instance is forbidden');if("undefined"==typeof r)return o.getValue();var a=arguments[1];return this.each(function(){e(this).data(i).setValue(a)})}return this.each(function(){var r=e(this),o=r.data(i),a=e.isPlainObject(n)?n:{};if(o)o.init(a);else{var s=e.extend({},r.data());"string"==typeof s.fill&&(s.fill=JSON.parse(s.fill)),"string"==typeof s.animation&&(s.animation=JSON.parse(s.animation)),a=e.extend(s,a),a.el=r,o=new t(a),r.data(i,o)}})}})},function(e,t,n){var r,i;!function(o,a){r=[n(1)],i=function(e){return o.jQuery=a(e)}.apply(t,r),!(void 0!==i&&(e.exports=i))}(this,function(e){return e.easing.jswing=e.easing.swing,e.extend(e.easing,{def:"easeOutQuad",swing:function(t,n,r,i,o){return e.easing[e.easing.def](t,n,r,i,o)},easeInQuad:function(e,t,n,r,i){return r*(t/=i)*t+n},easeOutQuad:function(e,t,n,r,i){return-r*(t/=i)*(t-2)+n},easeInOutQuad:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t+n:-r/2*(--t*(t-2)-1)+n},easeInCubic:function(e,t,n,r,i){return r*(t/=i)*t*t+n},easeOutCubic:function(e,t,n,r,i){return r*((t=t/i-1)*t*t+1)+n},easeInOutCubic:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t+n:r/2*((t-=2)*t*t+2)+n},easeInQuart:function(e,t,n,r,i){return r*(t/=i)*t*t*t+n},easeOutQuart:function(e,t,n,r,i){return-r*((t=t/i-1)*t*t*t-1)+n},easeInOutQuart:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t*t+n:-r/2*((t-=2)*t*t*t-2)+n},easeInQuint:function(e,t,n,r,i){return r*(t/=i)*t*t*t*t+n},easeOutQuint:function(e,t,n,r,i){return r*((t=t/i-1)*t*t*t*t+1)+n},easeInOutQuint:function(e,t,n,r,i){return(t/=i/2)<1?r/2*t*t*t*t*t+n:r/2*((t-=2)*t*t*t*t+2)+n},easeInSine:function(e,t,n,r,i){return-r*Math.cos(t/i*(Math.PI/2))+r+n},easeOutSine:function(e,t,n,r,i){return r*Math.sin(t/i*(Math.PI/2))+n},easeInOutSine:function(e,t,n,r,i){return-r/2*(Math.cos(Math.PI*t/i)-1)+n},easeInExpo:function(e,t,n,r,i){return 0==t?n:r*Math.pow(2,10*(t/i-1))+n},easeOutExpo:function(e,t,n,r,i){return t==i?n+r:r*(-Math.pow(2,-10*t/i)+1)+n},easeInOutExpo:function(e,t,n,r,i){return 0==t?n:t==i?n+r:(t/=i/2)<1?r/2*Math.pow(2,10*(t-1))+n:r/2*(-Math.pow(2,-10*--t)+2)+n},easeInCirc:function(e,t,n,r,i){return-r*(Math.sqrt(1-(t/=i)*t)-1)+n},easeOutCirc:function(e,t,n,r,i){return r*Math.sqrt(1-(t=t/i-1)*t)+n},easeInOutCirc:function(e,t,n,r,i){return(t/=i/2)<1?-r/2*(Math.sqrt(1-t*t)-1)+n:r/2*(Math.sqrt(1-(t-=2)*t)+1)+n},easeInElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(1==(t/=i))return n+r;if(a||(a=.3*i),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return-(s*Math.pow(2,10*(t-=1))*Math.sin((t*i-o)*(2*Math.PI)/a))+n},easeOutElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(1==(t/=i))return n+r;if(a||(a=.3*i),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return s*Math.pow(2,-10*t)*Math.sin((t*i-o)*(2*Math.PI)/a)+r+n},easeInOutElastic:function(e,t,n,r,i){var o=1.70158,a=0,s=r;if(0==t)return n;if(2==(t/=i/2))return n+r;if(a||(a=i*(.3*1.5)),s<Math.abs(r)){s=r;var o=a/4}else var o=a/(2*Math.PI)*Math.asin(r/s);return t<1?-.5*(s*Math.pow(2,10*(t-=1))*Math.sin((t*i-o)*(2*Math.PI)/a))+n:s*Math.pow(2,-10*(t-=1))*Math.sin((t*i-o)*(2*Math.PI)/a)*.5+r+n},easeInBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),r*(t/=i)*t*((o+1)*t-o)+n},easeOutBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),r*((t=t/i-1)*t*((o+1)*t+o)+1)+n},easeInOutBack:function(e,t,n,r,i,o){return void 0==o&&(o=1.70158),(t/=i/2)<1?r/2*(t*t*(((o*=1.525)+1)*t-o))+n:r/2*((t-=2)*t*(((o*=1.525)+1)*t+o)+2)+n},easeInBounce:function(t,n,r,i,o){return i-e.easing.easeOutBounce(t,o-n,0,i,o)+r},easeOutBounce:function(e,t,n,r,i){return(t/=i)<1/2.75?r*(7.5625*t*t)+n:t<2/2.75?r*(7.5625*(t-=1.5/2.75)*t+.75)+n:t<2.5/2.75?r*(7.5625*(t-=2.25/2.75)*t+.9375)+n:r*(7.5625*(t-=2.625/2.75)*t+.984375)+n},easeInOutBounce:function(t,n,r,i,o){return n<o/2?.5*e.easing.easeInBounce(t,2*n,0,i,o)+r:.5*e.easing.easeOutBounce(t,2*n-o,0,i,o)+.5*i+r}}),e})},function(e,t){e.exports=' <div class=circle _v-31e92f67=""> <div class=circle-percent-text-body _v-31e92f67=""> <span class=percent-text :style="{ \'font-size\': percentFontSize }" _v-31e92f67=""></span> <slot _v-31e92f67=""></slot> </div> </div> '},function(e,t,n){function r(e,t){for(var n=0;n<e.length;n++){var r=e[n],i=f[r.id];if(i){i.refs++;for(var o=0;o<i.parts.length;o++)i.parts[o](r.parts[o]);for(;o<r.parts.length;o++)i.parts.push(u(r.parts[o],t))}else{for(var a=[],o=0;o<r.parts.length;o++)a.push(u(r.parts[o],t));f[r.id]={id:r.id,refs:1,parts:a}}}}function i(e){for(var t=[],n={},r=0;r<e.length;r++){var i=e[r],o=i[0],a=i[1],s=i[2],u=i[3],c={css:a,media:s,sourceMap:u};n[o]?n[o].parts.push(c):t.push(n[o]={id:o,parts:[c]})}return t}function o(e,t){var n=h(),r=m[m.length-1];if("top"===e.insertAt)r?r.nextSibling?n.insertBefore(t,r.nextSibling):n.appendChild(t):n.insertBefore(t,n.firstChild),m.push(t);else{if("bottom"!==e.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");n.appendChild(t)}}function a(e){e.parentNode.removeChild(e);var t=m.indexOf(e);t>=0&&m.splice(t,1)}function s(e){var t=document.createElement("style");return t.type="text/css",o(e,t),t}function u(e,t){var n,r,i;if(t.singleton){var o=v++;n=g||(g=s(t)),r=c.bind(null,n,o,!1),i=c.bind(null,n,o,!0)}else n=s(t),r=l.bind(null,n),i=function(){a(n)};return r(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;r(e=t)}else i()}}function c(e,t,n,r){var i=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=y(t,i);else{var o=document.createTextNode(i),a=e.childNodes;a[t]&&e.removeChild(a[t]),a.length?e.insertBefore(o,a[t]):e.appendChild(o)}}function l(e,t){var n=t.css,r=t.media,i=t.sourceMap;if(r&&e.setAttribute("media",r),i&&(n+="\n/*# sourceURL="+i.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(i))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}var f={},p=function(e){var t;return function(){return"undefined"==typeof t&&(t=e.apply(this,arguments)),t}},d=p(function(){return/msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase())}),h=p(function(){return document.head||document.getElementsByTagName("head")[0]}),g=null,v=0,m=[];e.exports=function(e,t){t=t||{},"undefined"==typeof t.singleton&&(t.singleton=d()),"undefined"==typeof t.insertAt&&(t.insertAt="bottom");var n=i(e);return r(n,t),function(e){for(var o=[],a=0;a<n.length;a++){var s=n[a],u=f[s.id];u.refs--,o.push(u)}if(e){var c=i(e);r(c,t)}for(var a=0;a<o.length;a++){var u=o[a];if(0===u.refs){for(var l=0;l<u.parts.length;l++)u.parts[l]();delete f[u.id]}}}};var y=function(){var e=[];return function(t,n){return e[t]=n,e.filter(Boolean).join("\n")}}()},function(e,t,n){var r=n(3);"string"==typeof r&&(r=[[e.id,r,""]]);n(8)(r,{});r.locals&&(e.exports=r.locals)}])});

/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "blob-media relative" },
    [
      (!_vm.isCropper && !_vm.file.success) || _vm.file.error
        ? _c(
            "div",
            {
              staticClass:
                "absolute blob-media-delete tooltip is-tooltip-danger",
              class: {
                none: !_vm.file.error,
                "flex flex-center": !_vm.isVideo,
                "is-round": _vm.isVideo,
                "delete--fullwidth": !_vm.isVideo
              },
              attrs: {
                "data-tooltip":
                  _vm.file.error && !_vm.isVideo
                    ? _vm.file.error.replace(/<br \/>/g, " ")
                    : "Delete"
              },
              on: { click: _vm.remove }
            },
            [
              _c(
                "i",
                {
                  staticClass: "material-icons has-text-danger",
                  staticStyle: { "font-size": "4rem" }
                },
                [_vm._v("clear")]
              )
            ]
          )
        : _vm._e(),
      _vm._v(" "),
      (_vm.file.active || _vm.file.success) && !_vm.file.error
        ? _c(
            "div",
            {
              staticClass: "flex flex-center absolute loader-circular z-20",
              style:
                _vm.file.active && _vm.progress >= 100
                  ? "opacity:0.6;background-color:transparent"
                  : "opacity:1;"
            },
            [
              _c(
                "vue-circle",
                {
                  ref: "progress",
                  attrs: {
                    progress: _vm.progress,
                    size: 100,
                    reverse: false,
                    "line-cap": "round",
                    fill: { color: "hsl(171, 100%, 41%)" },
                    "empty-fill": "rgba(0, 0, 0, .1)",
                    "animation-start-value": 0.0,
                    "start-angle": 0,
                    "insert-mode": "append",
                    thickness: 5,
                    "show-percent": true
                  }
                },
                [
                  _vm.file.success
                    ? _c("p", [
                        _c(
                          "i",
                          {
                            staticClass: "material-icons has-text-success",
                            staticStyle: { "font-size": "2rem" }
                          },
                          [_vm._v("done_outline")]
                        )
                      ])
                    : _vm._e()
                ]
              )
            ],
            1
          )
        : _vm._e(),
      _vm._v(" "),
      _c("b-loading", {
        attrs: {
          "is-full-page": false,
          active: _vm.file.active && _vm.progress >= 100
        },
        on: {
          "update:active": function($event) {
            _vm.$set(_vm.file, "active && progress >= 100", $event)
          }
        }
      }),
      _vm._v(" "),
      _vm.isVideo
        ? _c(
            "div",
            {
              staticClass: "aspect__ratio--16-9 has-background-black",
              staticStyle: { "min-width": "400px" }
            },
            [_c("video", { attrs: { src: _vm.file.cropper, controls: "" } })]
          )
        : !_vm.isZip
          ? _c(
              "div",
              { staticClass: "center-text", staticStyle: { height: "200px" } },
              [
                _c("img", {
                  staticStyle: { height: "100%" },
                  style: _vm.file.error ? "opacity:0.6" : "opacity:1",
                  attrs: { src: _vm.file.cropper }
                })
              ]
            )
          : _vm._e(),
      _vm._v(" "),
      _vm.isVideo
        ? _c("div", {}, [
            !_vm.file.error && !_vm.file.success
              ? _c("div", { staticClass: "video-infos" }, [
                  _c("strong", [_vm._v(_vm._s(_vm.file.name))]),
                  _vm._v(" "),
                  _c("small", { staticStyle: { "margin-left": "10px" } }, [
                    _vm._v(_vm._s(_vm._f("formatSize")(_vm.file.size)))
                  ])
                ])
              : _vm.file.error
                ? _c("div", {
                    staticClass: "notification is-danger",
                    domProps: { innerHTML: _vm._s(_vm.file.error) }
                  })
                : _vm.file.success
                  ? _c("div", {
                      domProps: { innerHTML: _vm._s(_vm.successLink) }
                    })
                  : _vm._e(),
            _vm._v(" "),
            _c("div", [
              (_vm.file.active || _vm.file.progress !== "0.00") &&
              !_vm.file.error &&
              !_vm.file.success
                ? _c(
                    "progress",
                    {
                      staticClass: "progress is-small is-primary",
                      class: { "is-danger": _vm.file.error },
                      attrs: { max: "100" },
                      domProps: { value: _vm.file.progress }
                    },
                    [
                      _vm._v(
                        _vm._s(_vm.file.progress) + "%\n                  "
                      )
                    ]
                  )
                : _vm._e()
            ])
          ])
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-351b8293", module.exports)
  }
}

/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("transition", { attrs: { name: "fade" } }, [
    _vm.display.upload
      ? _c("div", [
          _c(
            "form",
            {
              attrs: { id: "form-upload", enctype: "multipart/form-data" },
              on: {
                submit: function($event) {
                  $event.preventDefault()
                  return _vm.onSubmit($event)
                }
              }
            },
            [
              _vm.switches && _vm.switches.length > 1
                ? _c("vv-switches", {
                    ref: "switches",
                    attrs: {
                      switches: _vm.switches,
                      "is-vertical": "",
                      "is-center": ""
                    },
                    on: {
                      change: function($event) {
                        _vm.setSwitches($event)
                      }
                    }
                  })
                : _vm._e(),
              _vm._v(" "),
              _vm._t("default"),
              _vm._v(" "),
              _c("vs-input-file", {
                ref: "upload",
                attrs: {
                  "post-action": _vm.postAction,
                  "put-action": _vm.putAction,
                  extensions: _vm.extensions,
                  accept: _vm.accept,
                  multiple: _vm.multiple,
                  directory: _vm.directory,
                  size: _vm.size || 0,
                  thread: _vm.thread < 1 ? 1 : _vm.thread > 5 ? 5 : _vm.thread,
                  headers: _vm.headers,
                  data: _vm.data,
                  drop: _vm.drop,
                  "drop-directory": _vm.dropDirectory,
                  "add-index": _vm.addIndex,
                  maximum: _vm.maximum,
                  cropper: _vm.upload.cropper
                },
                on: {
                  "input-file": _vm.inputFile,
                  "input-filter": _vm.inputFilter
                },
                model: {
                  value: _vm.files,
                  callback: function($$v) {
                    _vm.files = $$v
                  },
                  expression: "files"
                }
              }),
              _vm._v(" "),
              _c("error", { attrs: { error: _vm.error } }),
              _vm._v(" "),
              _vm.isEdit
                ? _c("div", { staticClass: "m-b-10 flex flex-center" }, [
                    _c("div", [
                      _c("a", { attrs: { href: _vm.editLink } }, [
                        _c(
                          "i",
                          {
                            staticClass: "material-icons",
                            staticStyle: { position: "relative", top: "3px" }
                          },
                          [_vm._v("settings")]
                        )
                      ])
                    ]),
                    _vm._v(" "),
                    _c("div", [
                      _c("a", { attrs: { href: _vm.editLink } }, [
                        _vm._v("Edit your " + _vm._s(_vm.media))
                      ])
                    ])
                  ])
                : _vm._e(),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "flex flex-warp flex-center-x" },
                _vm._l(_vm.files, function(file, index) {
                  return _c("blob-media", {
                    key: index,
                    attrs: {
                      cropper: _vm.upload.cropper,
                      file: file,
                      isVideo:
                        ["video", "extract", "short"].indexOf(_vm.media) > -1
                          ? true
                          : false
                    },
                    on: {
                      remove: function($event) {
                        _vm.remove($event)
                      }
                    }
                  })
                })
              ),
              _vm._v(" "),
              _vm.files.length
                ? _c(
                    "div",
                    {
                      staticClass: "modal",
                      class: { "is-active": _vm.files.length && _vm.edit }
                    },
                    [
                      _c("div", { staticClass: "modal-background" }),
                      _vm._v(" "),
                      _c("div", { staticClass: "modal-box" }, [
                        _c("div", { staticClass: "modal-box-header" }),
                        _vm._v(" "),
                        _c(
                          "div",
                          { staticClass: "modal-box-content" },
                          [
                            _c("b-loading", {
                              attrs: {
                                "is-full-page": true,
                                active: _vm.isCropperLoading
                              },
                              on: {
                                "update:active": function($event) {
                                  _vm.isCropperLoading = $event
                                }
                              }
                            }),
                            _vm._v(" "),
                            _c(
                              "div",
                              {
                                staticClass: "box-img",
                                style: !_vm.isCropperLoading
                                  ? "opacity:1"
                                  : "opacity:0"
                              },
                              [
                                _c("img", {
                                  ref: "cropper",
                                  attrs: {
                                    src: _vm.files[_vm.files.length - 1].thumb
                                  }
                                })
                              ]
                            ),
                            _vm._v(" "),
                            _c("div", { staticClass: "box-preview" })
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "modal-box-footer center-text",
                            staticStyle: { "margin-top": "5px" }
                          },
                          [
                            _c(
                              "span",
                              {
                                staticClass: "button is-medium is-primary save",
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.cropperSave($event)
                                  }
                                }
                              },
                              [_vm._v("SAVE")]
                            ),
                            _vm._v(" "),
                            _c(
                              "span",
                              {
                                staticClass: "button is-medium cancel",
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.cropperCancel($event)
                                  }
                                }
                              },
                              [_vm._v("CANCEL")]
                            )
                          ]
                        )
                      ]),
                      _vm._v(" "),
                      _c("button", {
                        staticClass: "modal-close is-large",
                        attrs: { "aria-label": "close" },
                        on: {
                          click: function($event) {
                            $event.preventDefault()
                            return _vm.cropperCancel($event)
                          }
                        }
                      })
                    ]
                  )
                : _vm._e()
            ],
            2
          )
        ])
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4903c365", module.exports)
  }
}

/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(231)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(233)
/* template */
var __vue_template__ = __webpack_require__(234)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/form/uploadSimple.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-04ab1a77", Component.options)
  } else {
    hotAPI.reload("data-v-04ab1a77", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(232);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("dc13b1ac", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-04ab1a77\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./uploadSimple.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-04ab1a77\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./uploadSimple.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.modal-my-content{\n  border:10px solid green;\n  z-index: 20;\n  background-color: white;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  max-width: calc(100% - 15%);\n  max-height: 100vh;\n}\n.box-img{\n  border:0px solid red;\n  max-height: 70vh;\n  max-width: calc(100% - 15%);\n  padding: 0px;\n}\n.box-img img {\n  max-width: 100%;\n}\n.box-preview{\n  overflow: hidden;\n  height: 200px;\n  width: 200px;\n  position: absolute;\n  top:4px;\n  left:4px;\n  border:4px solid orange;\n}\n.modal-close{\n  z-index:200;\n}\n.modal-box{\n  border:0px solid orange;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  z-index: 20;\n  padding: 5px;\n}\n", ""]);

// exports


/***/ }),
/* 233 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inputFile_vue__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__inputFile_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__inputFile_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_scrollto__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_scrollto___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_scrollto__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_cropperjs__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__social_mixins_mixError__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__blobMedia_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//











/* harmony default export */ __webpack_exports__["default"] = ({

    mixins: [__WEBPACK_IMPORTED_MODULE_3__social_mixins_mixError__["a" /* mixError */]],

    components: {
        vsInputFile: __WEBPACK_IMPORTED_MODULE_0__inputFile_vue___default.a,
        blobMedia: __WEBPACK_IMPORTED_MODULE_4__blobMedia_vue___default.a
    },

    props: {

        nameUpload: {
            type: String,
            default: 'poster'
        },

        thumbId: {
            type: [Number, String]
        }

    },

    data: function data() {
        return {

            aspects: {
                poster: 1.78,
                thumb: 1.78,
                avatar: 1,
                cover: 3
            },

            files: [],
            error: {
                status: false,
                success: false,
                label: ''
            },
            edit: false,
            cropper: null,
            isCropperLoading: true,
            directory: false,
            drop: true,
            dropDirectory: true,
            addIndex: false,
            thread: 3,
            name: 'file',
            headers: {
                'X-CSRF-TOKEN': token.content,
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: {
                media: this.nameUpload,
                user_id: user.id,
                type: _upload.settings.type,
                thumbId: null
                //id: _user.uid + new Date().valueOf() + Math.floor((Math.random() * 100000) + 1),
            },
            autoCompress: 1024 * 1024,
            uploadAuto: false,
            isOption: false,
            addData: {
                show: false,
                name: '',
                type: '',
                content: ''
            },
            editFile: {
                show: false,
                name: ''
            }

        };
    },


    computed: {
        accept: function accept() {

            var accept = '';

            for (var k in _upload.settings.valid_file_upload) {

                accept += 'image/' + _upload.settings.valid_file_upload[k];

                if (k < _upload.settings.valid_file_upload.length - 1) accept += ',';
            }

            return accept;
        },
        extensions: function extensions() {
            return _upload.settings.valid_file_upload.toString();
        },
        minSize: function minSize() {
            return _upload.settings.min_size_upload;
        },
        size: function size() {
            return _upload.settings.max_size_upload;
        },
        postAction: function postAction() {
            return _upload.settings.url;
        },
        putAction: function putAction() {
            return _upload.settings.url;
        },
        isImages: function isImages() {

            if (!_upload.hasOwnProperty('images') || _upload.images.length < 1) return false;

            return true;
        },
        images: function images() {

            if (!_upload.hasOwnProperty('images') || _upload.images.length < 1) return [];

            return _upload.images;
        },
        ratio: function ratio() {
            return this.thumbId === 'hero' ? this.aspects.cover : this.aspects[this.nameUpload];
        }
    },

    methods: {
        remove: function remove(file) {

            if (this.files.length < 2) this.isEdit = false;

            this.$refs.upload.remove(file);
        },
        inputFile: function inputFile(newFile, oldFile) {
            var _this2 = this;

            this.data.thumbId = this.thumbId;

            if (newFile && !oldFile) {

                console.warn('INIT CROPPER', this.files);

                this.$nextTick(function () {
                    return _this2.edit = true;
                });

                return;
            }

            if (newFile && oldFile) {

                // RESPONSE AFTER UPLAOD :

                if (!newFile.active && oldFile.active) {

                    //ERROR :

                    if (newFile.error && oldFile.error) {

                        var _error = 'Error system';

                        console.error('newFile.response :::::::: => ', newFile.response);

                        if (newFile.xhr.status === 422) {

                            _error = 'Error: ';

                            for (var k in newFile.response.errors) {
                                _error += '<br />' + newFile.response.errors[k][0];
                            }
                        } else if (newFile.xhr.status === 401) _error = 'ERROR: You need to be logged in';else if (newFile.response.error) _error = 'ERROR: ' + newFile.response.error;

                        this.$refs.upload.update(oldFile, { error: _error, loading: false });
                    }
                }

                // PROGRESS :

                if (newFile.progress !== oldFile.progress) {}
                // progress


                // SUCCESS (AFTER UPLOAD) :

                if (newFile.success && !oldFile.success) {

                    this.$refs.upload.update(oldFile.id, { loading: false });

                    return;
                }
            }

            this.$refs.upload.opacity = 1;
        },


        inputFilter: function inputFilter(newFile, oldFile, prevent) {

            console.error(newFile);

            //this.setError('test')
            //return prevent()


            if (newFile && !oldFile) {

                // Before adding a file

                this.clearError();

                //console.warn('newFile:', newFile)
                // Filter size
                if (newFile.size > this.size) {
                    this.setError('File too big : maximum allowed ' + this.$options.filters.formatSize(this.size));
                    return prevent();
                }

                if (newFile.size < this.minSizs) {
                    this.setError('File too small : minimun ' + this.$options.filters.formatSize(this.minSize));
                    return prevent();
                }

                // Filter system files or hide files
                if (/(\/|^)(Thumbs\.db|desktop\.ini|\..+)$/.test(newFile.name)) {
                    return prevent();
                }

                // Filter php html js file
                if (/\.(php5?|html?|jsx?)$/i.test(newFile.name)) {
                    return prevent();
                }

                //Filter non-image file
                var extensions = new RegExp('\\.(' + _upload.settings.valid_file_upload.join('|').replace(/\./g, '\\.') + ')$', 'i');

                if (newFile.name.search(extensions) === -1) {
                    this.setError('Invalid extension : only ' + _upload.settings.valid_file_upload.join(' '));
                    return prevent();
                }
            }

            if (newFile && (!oldFile || newFile.file !== oldFile.file)) {

                newFile.thumb = '';
                var URL = window.URL || window.webkitURL;
                if (URL && URL.createObjectURL) {
                    newFile.thumb = URL.createObjectURL(newFile.file);

                    newFile.cropper = newFile.thumb;
                }
            }
        },

        setError: function setError(label) {
            this.error.status = true;
            this.error.label = label;
        },
        clearError: function clearError(label) {
            this.error.status = false;
            this.error.label = '';

            if (typeof libel === 'undefined') return;

            console.error('EMIT CLEAR ERROR :: ' + label);
            console.warn('ERRORS BEFORE :', this.errors);
            var index = this.errors.indexOf(label);
            if (index > -1) this.errors.splice(index, 1);
            console.log('INDEX', index);
            console.warn('ERRORS AFTER :', this.errors);
        },
        cropperCancel: function cropperCancel() {

            this.cropper.destroy();

            this.cropper = false;

            this.remove(this.files[this.files.length - 1]);

            this.edit = false;

            this.isCropperLoading = true;
        },
        cropperSave: function cropperSave() {

            this.data.thumbId = this.thumbId;

            var oldFile = this.files[this.files.length - 1];

            this.edit = false;

            this.$refs.upload.update(oldFile.id, {
                active: true,
                data: this.data,
                loading: true,
                cropper: this.cropper.getCroppedCanvas().toDataURL(oldFile.type)
            });
        },
        clickImage: function clickImage(img, event) {
            var _this3 = this;

            var src = event.target.getAttribute('src');

            console.warn('src ::', src);

            this.getImageFormUrl(src, function (blob) {

                //this.init(blob);
                console.warn(blob);

                var files = [];

                files.push({

                    size: blob.size,
                    name: src,
                    type: blob.type,
                    file: blob,
                    el: null
                });

                console.warn(files);

                _this3.$refs.upload.add(files);
            });
        },


        getImageFormUrl: function getImageFormUrl(url, callback) {

            var img = new Image();

            img.setAttribute('crossOrigin', 'anonymous');

            img.onload = function (a) {

                var canvas = document.createElement("canvas");

                canvas.width = this.width;

                canvas.height = this.height;

                var ctx = canvas.getContext("2d");

                ctx.drawImage(this, 0, 0);

                var dataURI = canvas.toDataURL("image/jpg");

                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString;

                if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);else byteString = unescape(dataURI.split(',')[1]);

                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                // write the bytes of the string to a typed array
                var ia = new Uint8Array(byteString.length);

                for (var i = 0; i < byteString.length; i++) {

                    ia[i] = byteString.charCodeAt(i);
                }

                return callback(new Blob([ia], { type: mimeString }));
            };

            img.src = url;
        }

    },

    watch: {
        edit: function edit(value) {
            var _this4 = this;

            if (value) {

                setTimeout(function () {

                    if (!_this4.$refs.cropper) return;

                    var _this = _this4;

                    var cropper = new __WEBPACK_IMPORTED_MODULE_2_cropperjs__["a" /* default */](_this4.$refs.cropper, {
                        aspectRatio: _this4.ratio,
                        viewMode: 1,
                        preview: '.box-preview',
                        background: false,
                        crop: function crop(e) {

                            _this.data.cropped_value = parseInt(e.detail.width) + "," + parseInt(e.detail.height) + "," + parseInt(e.detail.x) + "," + parseInt(e.detail.y) + "," + parseInt(e.detail.rotate);
                        },
                        ready: function ready() {
                            _this.isCropperLoading = false;
                        }
                    });

                    _this4.cropper = cropper;
                }, 1);
            } else {
                if (this.cropper) {
                    this.cropper.destroy();
                    this.cropper = false;
                }
            }
        }
    }
});

/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _vm._t("default"),
      _vm._v(" "),
      _vm.nameUpload !== null
        ? _c(
            "div",
            {
              staticClass:
                "anton s-10 c center-text is-fullwidth notification is-danger has-text-black"
            },
            [_vm._v("Upload a picture for your " + _vm._s(_vm.nameUpload))]
          )
        : _vm._e(),
      _vm._v(" "),
      _c(
        "form",
        {
          attrs: { id: "form-upload", enctype: "multipart/form-data" },
          on: {
            submit: function($event) {
              $event.preventDefault()
              return _vm.onSubmit($event)
            }
          }
        },
        [
          _c("vs-input-file", {
            ref: "upload",
            attrs: {
              "post-action": _vm.postAction,
              "put-action": _vm.putAction,
              extensions: _vm.extensions,
              accept: _vm.accept,
              multiple: false,
              directory: _vm.directory,
              size: _vm.size || 0,
              thread: _vm.thread < 1 ? 1 : _vm.thread > 5 ? 5 : _vm.thread,
              headers: _vm.headers,
              data: _vm.data,
              drop: _vm.drop,
              "drop-directory": _vm.dropDirectory,
              "add-index": _vm.addIndex,
              maximum: 1,
              cropper: true
            },
            on: {
              "input-file": _vm.inputFile,
              "input-filter": _vm.inputFilter
            },
            model: {
              value: _vm.files,
              callback: function($$v) {
                _vm.files = $$v
              },
              expression: "files"
            }
          }),
          _vm._v(" "),
          _c("error", { attrs: { error: _vm.error } }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "flex flex-warp flex-center-x" },
            _vm._l(_vm.files, function(file, index) {
              return _c("blob-media", {
                key: index,
                attrs: {
                  cropper: true,
                  file: file,
                  isVideo: false,
                  aspect: _vm.ratio
                },
                on: {
                  remove: function($event) {
                    _vm.remove($event)
                  }
                }
              })
            })
          ),
          _vm._v(" "),
          _vm.isImages
            ? _c(
                "div",
                { staticClass: "flex flex-warp m-t-20" },
                _vm._l(_vm.images, function(image, index) {
                  return _c("div", { staticClass: "p-1 pointer" }, [
                    _c("img", {
                      staticStyle: { width: "100%" },
                      attrs: { src: image },
                      on: {
                        click: function($event) {
                          _vm.clickImage(image, $event)
                        }
                      }
                    })
                  ])
                })
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.files.length
            ? _c(
                "div",
                {
                  staticClass: "modal",
                  class: { "is-active": _vm.files.length && _vm.edit }
                },
                [
                  _c("div", { staticClass: "modal-background" }),
                  _vm._v(" "),
                  _c("div", { staticClass: "modal-box" }, [
                    _c("div", { staticClass: "modal-box-header" }),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "modal-box-content" },
                      [
                        _c("b-loading", {
                          attrs: {
                            "is-full-page": true,
                            active: _vm.isCropperLoading
                          },
                          on: {
                            "update:active": function($event) {
                              _vm.isCropperLoading = $event
                            }
                          }
                        }),
                        _vm._v(" "),
                        _c(
                          "div",
                          {
                            staticClass: "box-img",
                            style: !_vm.isCropperLoading
                              ? "opacity:1"
                              : "opacity:0"
                          },
                          [
                            _c("img", {
                              ref: "cropper",
                              attrs: {
                                src: _vm.files[_vm.files.length - 1].thumb
                              }
                            })
                          ]
                        ),
                        _vm._v(" "),
                        _c("div", { staticClass: "box-preview" })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      {
                        staticClass: "modal-box-footer center-text",
                        staticStyle: { "margin-top": "5px" }
                      },
                      [
                        _c(
                          "span",
                          {
                            staticClass: "button is-medium is-primary save",
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                return _vm.cropperSave($event)
                              }
                            }
                          },
                          [_vm._v("SAVE")]
                        ),
                        _vm._v(" "),
                        _c(
                          "span",
                          {
                            staticClass: "button is-medium cancel",
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                return _vm.cropperCancel($event)
                              }
                            }
                          },
                          [_vm._v("CANCEL")]
                        )
                      ]
                    )
                  ]),
                  _vm._v(" "),
                  _c("button", {
                    staticClass: "modal-close is-large",
                    attrs: { "aria-label": "close" },
                    on: {
                      click: function($event) {
                        $event.preventDefault()
                        return _vm.cropperCancel($event)
                      }
                    }
                  })
                ]
              )
            : _vm._e()
        ],
        1
      )
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-04ab1a77", module.exports)
  }
}

/***/ }),
/* 235 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_form__ = __webpack_require__(236);
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };



var f = {};

if (window.hasOwnProperty('_form')) f = _form;

/* harmony default export */ __webpack_exports__["a"] = ({

	namespaced: true,

	state: {

		c: null,
		form: {},
		errors: [],
		callback: '',
		display: {
			form: true,
			upload: false
		},
		upload: null,
		url: null,
		datas: {}
	},

	getters: {

		getDisplay: function getDisplay(state) {
			return state.display;
		}

	},

	actions: {
		init: function init(_ref) {
			var commit = _ref.commit,
			    state = _ref.state,
			    dispatch = _ref.dispatch,
			    rootState = _ref.rootState;


			var c = new __WEBPACK_IMPORTED_MODULE_0__classes_form__["a" /* default */](f);

			commit('setForm', c);
		},
		setError: function setError(_ref2, e) {
			var commit = _ref2.commit,
			    state = _ref2.state;


			if (state.errors.indexOf(e) > -1) return;

			commit('addError', e);
		},
		clearError: function clearError(_ref3, e) {
			var commit = _ref3.commit,
			    state = _ref3.state;


			var index = state.errors.indexOf(e);

			if (index === -1) return;

			commit('removeError', index);
		},
		submit: function submit(_ref4, data) {
			var commit = _ref4.commit,
			    state = _ref4.state,
			    dispatch = _ref4.dispatch,
			    rootState = _ref4.rootState;


			if (state.errors.length > 0) return;

			var formData = new FormData();

			for (var key in state.datas) {

				if (_typeof(state.datas[key]) === 'object') {

					for (var j in state.datas[key]) {
						formData.append(key + '[]', state.datas[key][j]);
					}
				} else formData.append(key, state.datas[key]);
			}

			if (state.url === null && state.c.url !== null) commit('setUrl', state.c.url);

			//console.warn('datas ::', state.datas)
			//console.error(state.url)
			//console.error('TAGS ::', state.datas.tags)

			return new Promise(function (resolve, reject) {

				axios.post(state.url, formData).then(function (response) {

					if (!response.hasOwnProperty('data') || response.data === null) {

						commit('setDisplay', { value: false, type: 'form' });
					} else if (!response.data.hasOwnProperty('hide') || response.data.hide) {

						commit('setDisplay', { value: false, type: 'form' });
					}

					resolve(response);
				}, function (error) {
					return reject(error);
				});
			});
		},
		hideForm: function hideForm(_ref5) {
			var commit = _ref5.commit,
			    dispatch = _ref5.dispatch;


			commit('setDisplay', { value: false, type: 'form' });
		},
		next: function next(_ref6) {
			var commit = _ref6.commit,
			    state = _ref6.state;


			//for (var pair of state.datas.entries()) {
			//  console.log(pair[0]+ ', ' + pair[1]); 
			//}
			//console.warn('state error => ', state.errors)

			if (state.errors.length > 0) return;

			commit('setDisplay', { value: false, type: 'form' });
			commit('setDisplay', { value: true, type: 'upload' });
		},
		setUrl: function setUrl(_ref7, url) {
			var commit = _ref7.commit;


			commit('setUrl', url);
		},
		changeCallback: function changeCallback(_ref8, callback) {
			var commit = _ref8.commit;


			commit('changeCallback', callback);
		}
	},

	mutations: {
		setForm: function setForm(state, c) {

			state.c = c;
			state.form = c.form;
			state.callback = c.callback;
			state.upload = c.upload;

			if (c.form === null) state.display.form = false;

			if (c.upload !== null) state.display.upload = c.upload.display;
		},
		changeCallback: function changeCallback(state, callback) {

			state.callback = callback;
		},
		addError: function addError(state, e) {

			state.errors.push(e);
		},
		removeError: function removeError(state, index) {

			state.errors.splice(index, 1);
		},
		setDisplay: function setDisplay(state, obj) {

			state.display[obj.type] = obj.value;
		},
		appendData: function appendData(state, arr) {

			state.datas[arr[0]] = arr[1];
		},
		removeData: function removeData(state, key) {

			/*
   var index = state.datas.indexOf(key)
   	if (index > -1) state.datas.splice(index, 1);
   */
			delete state.datas[key];
		},
		setUrl: function setUrl(state, url) {

			state.url = url;
		}
	}

});

/***/ }),
/* 236 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Form = function () {
	function Form(datas) {
		_classCallCheck(this, Form);

		this.datas = datas;

		this.form = {};

		this.upload = null;

		this.callback = 'submit';

		this.formatDefault();

		this.formatForm();

		this.setUpload();

		this.setCallback();

		this.setUrl();
	}

	_createClass(Form, [{
		key: 'formatForm',
		value: function formatForm() {

			if (!this.datas.hasOwnProperty('form')) {

				this.form = null;

				return;
			}

			for (var k in this.datas.form) {

				this.form[k] = _extends({}, this.default[k], this.datas.form[k]);
			}
		}
	}, {
		key: 'setUpload',
		value: function setUpload() {

			if (!this.datas.hasOwnProperty('upload')) return;

			this.upload = this.datas.upload;

			if (!this.datas.upload.hasOwnProperty('display')) this.upload.display = true;
		}
	}, {
		key: 'setCallback',
		value: function setCallback() {

			if (!this.datas.hasOwnProperty('callback')) return;

			this.callback = this.datas.callback;
		}
	}, {
		key: 'setUrl',
		value: function setUrl() {

			if (!this.datas.hasOwnProperty('url')) this.url = null;

			this.url = this.datas.url;
		}
	}, {
		key: 'formatDefault',
		value: function formatDefault() {

			this.default = {};

			var d = this.getDefault();

			for (var k in d.default) {

				this.default[k] = _extends({}, d.template, d.default[k]);
			}
		}
	}, {
		key: 'getDefault',
		value: function getDefault() {

			return {

				template: {
					value: '',
					type: null,
					enum: false,
					keyEnum: null,
					required: false,
					icon: null,
					helper: null,
					errorxxxxxxxxxxxxxxxxxx: {
						status: false,
						libel: null
					},
					rules: [],
					max: null,
					min: null
				},

				default: {
					title: {
						//rules: ['alphanumeric']
					},
					username: {
						rules: ['alphanumeric'],
						icon: 'person',
						max: 20,
						min: 5
					},
					password: {
						rules: ['match:password_confirmation'],
						min: 5
					},
					password_confirmation: {
						rules: ['match:password'],
						min: 5
					},
					email: {
						rules: ['email'],
						icon: 'email'
					},
					dob: {
						rules: ['dob']
					},
					year: {
						rules: ['integer'],
						max: 4,
						min: 4
					},
					tags: {
						key: 'name',
						allowNew: false,
						url: ''
					}
				}
			};
		}
	}, {
		key: 'fetch',
		value: function fetch(page, tracker) {
			var _this = this;

			tracker = tracker !== null ? JSON.stringify(tracker) : '';

			return new Promise(function (resolve, reject) {

				axios.get(_this.url + '?page=' + page + '&t=' + tracker).then(function (response) {
					return resolve(response);
				}, function (error) {
					return reject(error);
				});
			});
		}
	}, {
		key: 'post',
		value: function post(data) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				axios.post(_this2.urlPost, data).then(function (response) {
					return resolve(response);
				}, function (error) {
					return reject(error);
				});
			});
		}
	}, {
		key: 'delete',
		value: function _delete() {}
	}]);

	return Form;
}();

/* harmony default export */ __webpack_exports__["a"] = (Form);

/***/ })
],[150]);