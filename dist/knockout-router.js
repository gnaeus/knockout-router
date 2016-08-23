(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('knockout')) :
	typeof define === 'function' && define.amd ? define(['exports', 'knockout'], factory) :
	(factory((global.KnockoutRouter = global.KnockoutRouter || {}),global.ko));
}(this, (function (exports,ko) { 'use strict';

/**
 * Copyright (c) 2016 Dmitry Panyushkin
 * Available under MIT license
 */
function find(arr, predicate) {
    var i = 0, length = arr.length;
    while (i < length) {
        var el = arr[i++];
        if (predicate(el)) {
            return el;
        }
    }
}
function getPath(_a) {
    var pathname = _a.pathname, search = _a.search, hash = _a.hash;
    return pathname + search + (hash || "");
}
function eventWhich(event) {
    event = event || window.event;
    return null === event.which ? event.button : event.which;
}
function sameOrigin(href) {
    var origin = location.protocol + "//" + location.hostname;
    if (location.port) {
        origin += ":" + location.port;
    }
    return href && (0 === href.indexOf(origin));
}

var ComponentContext = (function () {
    function ComponentContext(context) {
        this.params = {};
        this.state = ko.observable();
        this.route = ko.observable();
        this.url = ko.observable();
        this.update(context);
    }
    ComponentContext.prototype.update = function (context) {
        var params = context.params, state = context.state, route = context.route, url = context.url;
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var value = params[key];
                var observable = this.params[key];
                if (observable) {
                    observable(value);
                }
                else {
                    this.params[key] = ko.observable(value);
                }
            }
        }
        for (var key in this.params) {
            if (this.params.hasOwnProperty(key) && !params.hasOwnProperty(key)) {
                this.params[key](null);
            }
        }
        this.state(state);
        this.route(route);
        this.url(url);
    };
    return ComponentContext;
}());

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$2 = createCommonjsModule(function (module) {
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};
});

var index$3 = interopDefault(index$2);


var require$$0 = Object.freeze({
  default: index$3
});

var index = createCommonjsModule(function (module) {
var isarray = interopDefault(require$$0)

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string} str
 * @return {!Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    var next = str[index]
    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var modifier = res[6]
    var asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var partial = prefix != null && next != null && next !== prefix
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = res[2] || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @return {!function(Object=, Object=)}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
    }
  }

  return function (obj, opts) {
    var path = ''
    var data = obj || {}
    var options = opts || {}
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}  tokens
 * @param  {Object=} options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = '(?:' + token.pattern + ')'

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys)
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}
});

var index$1 = interopDefault(index);

var utils = createCommonjsModule(function (module, exports) {
'use strict';

var hexTable = (function () {
    var array = new Array(256);
    for (var i = 0; i < 256; ++i) {
        array[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
    }

    return array;
}());

exports.arrayToObject = function (source, options) {
    var obj = options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            target[source] = true;
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x5A) || // a-z
            (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

exports.compact = function (obj, references) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var refs = references || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0; i < obj.length; ++i) {
            if (obj[i] && typeof obj[i] === 'object') {
                compacted.push(exports.compact(obj[i], refs));
            } else if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; ++j) {
        var key = keys[j];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};

exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};
});

var utils$1 = interopDefault(utils);
var isBuffer = utils.isBuffer;
var isRegExp = utils.isRegExp;
var compact = utils.compact;
var encode = utils.encode;
var decode = utils.decode;
var merge = utils.merge;
var arrayToObject = utils.arrayToObject;

var require$$0$1 = Object.freeze({
    default: utils$1,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    compact: compact,
    encode: encode,
    decode: decode,
    merge: merge,
    arrayToObject: arrayToObject
});

var stringify$1 = createCommonjsModule(function (module) {
'use strict';

var Utils = interopDefault(require$$0$1);

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var defaults = {
    delimiter: '&',
    strictNullHandling: false,
    skipNulls: false,
    encode: true,
    encoder: Utils.encode
};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = obj.toISOString();
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder ? encoder(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || Utils.isBuffer(obj)) {
        if (encoder) {
            return [encoder(prefix) + '=' + encoder(obj)];
        }
        return [prefix + '=' + String(obj)];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
        } else {
            values = values.concat(stringify(obj[key], prefix + (allowDots ? '.' + key : '[' + key + ']'), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts || {};
    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var objKeys;
    var filter;

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        objKeys = filter = options.filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots));
    }

    return keys.join(delimiter);
};
});

var stringify$2 = interopDefault(stringify$1);


var require$$1 = Object.freeze({
    default: stringify$2
});

var parse$2 = createCommonjsModule(function (module) {
'use strict';

var Utils = interopDefault(require$$0$1);

var has = Object.prototype.hasOwnProperty;

var defaults = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000,
    strictNullHandling: false,
    plainObjects: false,
    allowPrototypes: false,
    allowDots: false,
    decoder: Utils.decode
};

var parseValues = function parseValues(str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos));
            val = options.decoder(part.slice(pos + 1));
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObject(chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            (options.parseArrays && index <= options.arrayLimit)
        ) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
};

var parseKeys = function parseKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts || {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj, options);
    }

    return Utils.compact(obj);
};
});

var parse$3 = interopDefault(parse$2);


var require$$0$2 = Object.freeze({
    default: parse$3
});

var index$4 = createCommonjsModule(function (module) {
'use strict';

var Stringify = interopDefault(require$$1);
var Parse = interopDefault(require$$0$2);

module.exports = {
    stringify: Stringify,
    parse: Parse
};
});

interopDefault(index$4);
var stringify = index$4.stringify;
var parse$1 = index$4.parse;

// work-around typescript commonjs module export
var _pathToRegexp = index$1;
var Route = (function () {
    function Route(node, routePrefix, actions) {
        var _this = this;
        if (routePrefix === void 0) { routePrefix = ""; }
        if (actions === void 0) { actions = {}; }
        this.route = routePrefix + node.getAttribute("route");
        this.component = ko.components.getComponentNameForNode(node);
        this.action = noop$1;
        var actionKey = node.getAttribute("action");
        if (actionKey) {
            if (actions.hasOwnProperty(actionKey)) {
                this.action = actions[actionKey];
            }
            else {
                ko.components.defaultLoader.getConfig(this.component, function (config) {
                    if (config.hasOwnProperty(actionKey)) {
                        _this.action = config[actionKey];
                    }
                });
            }
        }
        this.re = _pathToRegexp(this.route);
        this.keys = this.re.keys.map(function (k) { return k.name; });
    }
    Route.prototype.dispatch = function (url) {
        var _a = url.split("?"), path = _a[0], queryString = _a[1];
        var matches = this.re.exec(path);
        if (!matches) {
            return false;
        }
        var params = {};
        for (var i = 1; i < matches.length; ++i) {
            params[this.keys[i - 1]] = matches[i];
        }
        var query = parse$1(queryString);
        for (var key in query) {
            if (query.hasOwnProperty(key)) {
                params[key] = query[key];
            }
        }
        this.context = {
            params: params,
            state: null,
            route: this.route,
            url: matches[0],
        };
        return true;
    };
    return Route;
}());
function noop$1() { }

ko.bindingHandlers['path'] =
    ko.bindingHandlers['query'] =
        ko.bindingHandlers['activePathCss'] = {
            init: function (el, va, ab, vm, ctx) {
                applyBinding.call(this, el, ab, ctx);
            }
        };
var bindingsCurrentPath = ko.observable(location.pathname);
function setBindingsCurrentPath(url) {
    url = url.split("#")[0].split("?")[0];
    bindingsCurrentPath(url);
}
function resolveUrl(rootUrl, path, query) {
    if (rootUrl === void 0) { rootUrl = ""; }
    if (path === void 0) { path = ""; }
    if (query === void 0) { query = null; }
    return (path.startsWith("~/") ? rootUrl + path.substr(1) : path)
        + (query ? "?" + stringify(ko.toJS(query)) : "");
}
function applyBinding(el, allBindings, ctx) {
    var $parents = ko.contextFor(el).$parents;
    var router = find($parents, function (ctx) { return ctx && ctx.rootUrl; });
    var rootUrl = router && router.rootUrl;
    var url = ko.pureComputed(function () { return resolveUrl(rootUrl, allBindings.get("path"), allBindings.get("query")); });
    var bindingsToApply = {};
    if (el.tagName.toLocaleUpperCase() === "A") {
        bindingsToApply['attr'] = { href: url };
    }
    else {
        bindingsToApply['click'] = function (data, e) {
            var debounce = 1 !== eventWhich(e);
            var hasOtherTarget = el.hasAttribute("target");
            var hasExternalRel = el.getAttribute("rel") === "external";
            var modifierKey = e.metaKey || e.ctrlKey || e.shiftKey;
            if (debounce || hasOtherTarget || hasExternalRel || modifierKey) {
                return true;
            }
            var handled = navigate(url());
            if (handled) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            return !handled;
        };
    }
    var activePathCss = allBindings.get("activePathCss");
    if (activePathCss) {
        bindingsToApply['css'] = (_a = {},
            _a[activePathCss] = ko.pureComputed(function () { return url() === bindingsCurrentPath(); }),
            _a
        );
    }
    // allow adjacent routers to initialize
    ko.tasks.schedule(function () { return ko.applyBindingsToNode(el, bindingsToApply, ctx); });
    var _a;
}

var CLICK_EVENT = typeof document !== "undefined" && document.ontouchstart
    ? "touchstart" : "click";
var ROUTERS = [];
var Router = (function () {
    function Router(element, routeNodes, _a) {
        var _this = this;
        var rootUrl = _a.rootUrl, routePrefix = _a.routePrefix, actions = _a.actions, onNavStart = _a.onNavStart, onNavFinish = _a.onNavFinish;
        this.route = null;
        this.routes = [];
        this.binding = ko.observable();
        ROUTERS.push(this);
        if (ROUTERS.length === 1) {
            addEventListener(CLICK_EVENT, onLinkClick, false);
            addEventListener("popstate", onPopState, false);
        }
        rootUrl = rootUrl || element.getAttribute("rootUrl");
        routePrefix = routePrefix || element.getAttribute("routePrefix");
        var parent = getParentRouter(element);
        if (!parent) {
            this.rootUrl = rootUrl || "";
            this.routePrefix = rootUrl + routePrefix || "";
            this.actions = actions || {};
        }
        else {
            if (typeof rootUrl === "string") {
                throw new Error("Only top-level router can specify 'rootUrl'");
            }
            // concatenated with parent
            this.routePrefix = parent.routePrefix + (routePrefix || "");
            // inherited from parent
            this.actions = actions || parent.actions;
        }
        this.onNavStart = onNavStart || noop;
        this.onNavFinish = onNavFinish || noop;
        this.routes = routeNodes.map(function (node) { return new Route(node, _this.routePrefix, _this.actions); });
        this.dispatchAndNavigate(getPath(location));
    }
    Router.prototype.dispose = function () {
        ROUTERS.splice(ROUTERS.indexOf(this), 1);
        if (ROUTERS.length === 0) {
            removeEventListener(CLICK_EVENT, onLinkClick, false);
            removeEventListener("popstate", onPopState, false);
        }
    };
    Router.prototype.dispatch = function (url) {
        this.onNavStart();
        this.route = find(this.routes, function (route) { return route.dispatch(url); });
        if (!this.route) {
            return;
        }
        var binding = this.binding();
        var _a = this.route, component = _a.component, context = _a.context, action = _a.action;
        if (binding && binding.component === component) {
            context.state = binding.params.state();
        }
        return action(context);
    };
    Router.prototype.navigate = function () {
        if (!this.route) {
            this.binding(null);
            this.onNavFinish();
            return;
        }
        var _a = this.route, component = _a.component, context = _a.context;
        var binding = this.binding();
        if (binding && binding.component === component) {
            binding.params.update(context);
        }
        else {
            this.binding({
                component: component,
                params: new ComponentContext(context),
            });
        }
        this.route = null;
        this.onNavFinish();
    };
    Router.prototype.dispatchAndNavigate = function (url) {
        var _this = this;
        var promise = this.dispatch(getPath(location));
        if (!promise) {
            this.navigate();
        }
        else {
            promise.then(function () { _this.navigate(); });
        }
    };
    return Router;
}());
function getParentRouter(element) {
    var $parents = ko.contextFor(element).$parents;
    return find($parents, function (vm) { return vm instanceof Router; });
}
function navigate(url, replace) {
    if (replace === void 0) { replace = false; }
    var promises = ROUTERS
        .map(function (router) { return router.dispatch(url); })
        .filter(function (promise) { return !!promise; });
    var status = !!find(ROUTERS, function (router) { return !!router.route; });
    // TODO: store and load history state
    if (status && typeof history !== "undefined") {
        if (replace) {
            history.replaceState(null, null, url);
        }
        else {
            history.pushState(null, null, url);
        }
    }
    var applyNavigation = function () {
        ROUTERS.forEach(function (router) { router.navigate(); });
        if (status) {
            setBindingsCurrentPath(url);
        }
    };
    if (promises.length == 0) {
        applyNavigation();
    }
    else {
        Promise.all(promises).then(applyNavigation);
    }
    return status;
}
function onPopState(event) {
    if (event.defaultPrevented) {
        return;
    }
    if (navigate(getPath(location), true)) {
        event.preventDefault();
    }
}
function onLinkClick(event) {
    var target = event.target;
    while (target && "A" !== target.nodeName) {
        target = target.parentNode;
    }
    if (!target || "A" !== target.nodeName) {
        return;
    }
    var isDoubleClick = 1 !== eventWhich(event);
    var hasModifier = event.metaKey || event.ctrlKey || event.shiftKey;
    var isDownload = target.hasAttribute("download");
    var hasOtherTarget = target.hasAttribute("target");
    var hasExternalRel = target.getAttribute("rel") === "external";
    var isMailto = ~(target.getAttribute("href") || "").indexOf("mailto:");
    var isCrossOrigin = !sameOrigin(target.href);
    var isEmptyHash = target.getAttribute("href") === "#";
    if (isCrossOrigin || isDoubleClick || isDownload || isEmptyHash ||
        isMailto || hasExternalRel || hasModifier || hasOtherTarget) {
        return;
    }
    if (navigate(getPath(target))) {
        event.preventDefault();
    }
}
function noop() { }
ko.components.register("knockout-router", {
    synchronous: true,
    viewModel: {
        createViewModel: function (params, _a) {
            var element = _a.element, templateNodes = _a.templateNodes;
            return new Router(element, templateNodes.filter(function (n) { return n.nodeType === 1; }), params);
        },
    },
    template: "\n        <!-- ko if: binding() -->\n            <!-- ko component: {\n                name: binding().component,\n                params: binding().params\n            } --><!-- /ko -->\n        <!-- /ko -->\n    ".replace(/\s+/g, " "),
});

exports.navigate = navigate;

Object.defineProperty(exports, '__esModule', { value: true });

})));