/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://enderjs.com)
  * Build: ender build isbn
  * Packages: ender-core@2.0.0 ender-commonjs@1.0.8 isbn@0.2.0
  * =============================================================
  */

(function () {

  /*!
    * Ender: open module JavaScript framework (client-lib)
    * http://enderjs.com
    * License MIT
    */
  
  /**
   * @constructor
   * @param  {*=}      item      selector|node|collection|callback|anything
   * @param  {Object=} root      node(s) from which to base selector queries
   */
  function Ender(item, root) {
    var i
    this.length = 0 // Ensure that instance owns length
  
    if (typeof item == 'string')
      // start with strings so the result parlays into the other checks
      // the .selector prop only applies to strings
      item = ender._select(this['selector'] = item, root)
  
    if (null == item) return this // Do not wrap null|undefined
  
    if (typeof item == 'function') ender._closure(item, root)
  
    // DOM node | scalar | not array-like
    else if (typeof item != 'object' || item.nodeType || (i = item.length) !== +i || item == item.window)
      this[this.length++] = item
  
    // array-like - bitwise ensures integer length
    else for (this.length = i = (i > 0 ? ~~i : 0); i--;)
      this[i] = item[i]
  }
  
  /**
   * @param  {*=}      item   selector|node|collection|callback|anything
   * @param  {Object=} root   node(s) from which to base selector queries
   * @return {Ender}
   */
  function ender(item, root) {
    return new Ender(item, root)
  }
  
  
  /**
   * @expose
   * sync the prototypes for jQuery compatibility
   */
  ender.fn = ender.prototype = Ender.prototype
  
  /**
   * @enum {number}  protects local symbols from being overwritten
   */
  ender._reserved = {
    reserved: 1,
    ender: 1,
    expose: 1,
    noConflict: 1,
    fn: 1
  }
  
  /**
   * @expose
   * handy reference to self
   */
  Ender.prototype.$ = ender
  
  /**
   * @expose
   * make webkit dev tools pretty-print ender instances like arrays
   */
  Ender.prototype.splice = function () { throw new Error('Not implemented') }
  
  /**
   * @expose
   * @param   {function(*, number, Ender)}  fn
   * @param   {object=}                     scope
   * @return  {Ender}
   */
  Ender.prototype.forEach = function (fn, scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }
  
  /**
   * @expose
   * @param {object|function} o
   * @param {boolean=}        chain
   */
  ender.ender = function (o, chain) {
    var o2 = chain ? Ender.prototype : ender
    for (var k in o) !(k in ender._reserved) && (o2[k] = o[k])
    return o2
  }
  
  /**
   * @expose
   * @param {string}  s
   * @param {Node=}   r
   */
  ender._select = function (s, r) {
    return s ? (r || document).querySelectorAll(s) : []
  }
  
  /**
   * @expose
   * @param {function} fn
   */
  ender._closure = function (fn) {
    fn.call(document, ender)
  }
  
  if (typeof module !== 'undefined' && module['exports']) module['exports'] = ender
  var $ = ender
  
  /**
   * @expose
   * @param {string} name
   * @param {*}      value
   */
  ender.expose = function (name, value) {
    ender.expose.old[name] = window[name]
    window[name] = value
  }
  
  /**
   * @expose
   */
  ender.expose.old = {}
  
  /**
   * @expose
   * @param {boolean} all   restore only $ or all ender globals
   */
  ender.noConflict = function (all) {
    window['$'] = ender.expose.old['$']
    if (all) for (var k in ender.expose.old) window[k] = ender.expose.old[k]
    return this
  }
  
  ender.expose('$', ender)
  ender.expose('ender', ender); // uglify needs this semi-colon between concating files
  
  /*!
    * Ender: open module JavaScript framework (module-lib)
    * http://enderjs.com
    * License MIT
    */
  
  var global = this
  
  /**
   * @param  {string}  id   module id to load
   * @return {object}
   */
  function require(id) {
    if ('$' + id in require._cache)
      return require._cache['$' + id]
    if ('$' + id in require._modules)
      return (require._cache['$' + id] = require._modules['$' + id]._load())
    if (id in window)
      return window[id]
  
    throw new Error('Requested module "' + id + '" has not been defined.')
  }
  
  /**
   * @param  {string}  id       module id to provide to require calls
   * @param  {object}  exports  the exports object to be returned
   */
  function provide(id, exports) {
    return (require._cache['$' + id] = exports)
  }
  
  /**
   * @expose
   * @dict
   */
  require._cache = {}
  
  /**
   * @expose
   * @dict
   */
  require._modules = {}
  
  /**
   * @constructor
   * @param  {string}                                          id   module id for this module
   * @param  {function(Module, object, function(id), object)}  fn   module definition
   */
  function Module(id, fn) {
    this.id = id
    this.fn = fn
    require._modules['$' + id] = this
  }
  
  /**
   * @expose
   * @param  {string}  id   module id to load from the local module context
   * @return {object}
   */
  Module.prototype.require = function (id) {
    var parts, i
  
    if (id.charAt(0) == '.') {
      parts = (this.id.replace(/\/.*?$/, '/') + id.replace(/\.js$/, '')).split('/')
  
      while (~(i = parts.indexOf('.')))
        parts.splice(i, 1)
  
      while ((i = parts.lastIndexOf('..')) > 0)
        parts.splice(i - 1, 2)
  
      id = parts.join('/')
    }
  
    return require(id)
  }
  
  /**
   * @expose
   * @return {object}
   */
   Module.prototype._load = function () {
     var m = this
     var dotdotslash = /^\.\.\//g
     var dotslash = /^\.\/[^\/]+$/g
     if (!m._loaded) {
       m._loaded = true
  
       /**
        * @expose
        */
       m.exports = {}
       m.fn.call(global, m, m.exports, function (id) {
         if (id.match(dotdotslash)) {
           id = m.id.replace(/[^\/]+\/[^\/]+$/, '') + id.replace(dotdotslash, '')
         }
         else if (id.match(dotslash)) {
           id = m.id.replace(/\/[^\/]+$/, '') + id.replace('.', '')
         }
         return m.require(id)
       }, global)
     }
  
     return m.exports
   }
  
  /**
   * @expose
   * @param  {string}                     id        main module id
   * @param  {Object.<string, function>}  modules   mapping of module ids to definitions
   * @param  {string}                     main      the id of the main module
   */
  Module.createPackage = function (id, modules, main) {
    var path, m
  
    for (path in modules) {
      new Module(id + '/' + path, modules[path])
      if (m = path.match(/^(.+)\/index$/)) new Module(id + '/' + m[1], modules[path])
    }
  
    if (main) require._modules['$' + id] = require._modules['$' + id + '/' + main]
  }
  
  if (ender && ender.expose) {
    /*global global,require,provide,Module */
    ender.expose('global', global)
    ender.expose('require', require)
    ender.expose('provide', provide)
    ender.expose('Module', Module)
  }
  
  Module.createPackage('isbn', {
    'isbn': function (module, exports, require, global) {
      (function () {
        "use strict";
      
      var ISBN = {
        VERSION: '0.01',
        GROUPS: {
          '0': {
            'name': 'English speaking area',
            'ranges': [['00', '19'], ['200', '699'], ['7000', '8499'], ['85000', '89999'], ['900000', '949999'], ['9500000', '9999999']]
          },
          '1': {
            'name': 'English speaking area',
            'ranges': [['00', '09'], ['100', '399'], ['4000', '5499'], ['55000', '86979'], ['869800', '998999']]
          },
          '4': {
            'name': 'Japan',
            'ranges': [['00','19'], ['200','699'], ['7000','8499'], ['85000','89999'], ['900000','949999'], ['9500000','9999999']]
          }
        },
      
        isbn: function () {
          this.initialize.apply(this, arguments);
        },
      
        parse: function(val, groups) {
          var me = new ISBN.isbn(val, groups ? groups : ISBN.GROUPS);
          return me.isValid() ? me : null;
        },
      
        hyphenate: function(val) {
          var me = ISBN.parse(val);
          return me ? me.isIsbn13() ? me.asIsbn13(true) : me.asIsbn10(true) : null;
        },
      
        asIsbn13: function(val, hyphen) {
          var me = ISBN.parse(val);
          return me ? me.asIsbn13(hyphen) : null;
        },
      
        asIsbn10: function(val, hyphen) {
          var me = ISBN.parse(val);
          return me ? me.asIsbn10(hyphen) : null;
        }
      };
      
      ISBN.isbn.prototype = {
        isValid: function() {
          return this.codes && this.codes.isValid;
        },
      
        isIsbn13: function() {
          return this.isValid() && this.codes.isIsbn13;
        },
      
        isIsbn10: function() {
          return this.isValid() && this.codes.isIsbn10;
        },
      
        asIsbn10: function(hyphen) {
          return this.isValid() ? hyphen ? this.codes.isbn10h : this.codes.isbn10 : null;
        },
      
        asIsbn13: function(hyphen) {
          return this.isValid() ? hyphen ? this.codes.isbn13h : this.codes.isbn13 : null;
        },
      
        initialize: function(val, groups) {
          this.groups = groups;
          this.codes = this.parse(val);
        },
      
        merge: function(lobj, robj) {
          var key;
          if (!lobj || !robj) {
            return null;
          }
          for (key in robj) {
            if (robj.hasOwnProperty(key)) {
              lobj[key] = robj[key];
            }
          }
          return lobj;
        },
      
        parse: function(val) {
          var ret;
      
          // coerce ISBN to string
          val += '';
      
          // correct for misplaced hyphens
          // val = val.replace(/ -/,'');
          ret =
            val.match(/^\d{9}[\dX]$/) ?
              this.fill(
                this.merge({source: val, isValid: true, isIsbn10: true, isIsbn13: false}, this.split(val))) :
            val.length === 13 && val.match(/^(\d+)-(\d+)-(\d+)-([\dX])$/) ?
              this.fill({
                source: val, isValid: true, isIsbn10: true, isIsbn13: false, group: RegExp.$1, publisher: RegExp.$2,
                article: RegExp.$3, check: RegExp.$4}) :
            val.match(/^(978|979)(\d{9}[\dX]$)/) ?
              this.fill(
                this.merge({source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1},
                this.split(RegExp.$2))) :
            val.length === 17 && val.match(/^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/) ?
              this.fill({
                source: val, isValid: true, isIsbn10: false, isIsbn13: true, prefix: RegExp.$1, group: RegExp.$2,
                publisher: RegExp.$3, article: RegExp.$4, check: RegExp.$5}) :
              null;
      
          if (!ret) {
            return {source: val, isValid: false};
          }
      
          return this.merge(ret, {isValid: ret.check === (ret.isIsbn13 ? ret.check13 : ret.check10)});
        },
      
        split: function(isbn) {
          return (
            !isbn ?
              null :
            isbn.length === 13 ?
              this.merge(this.split(isbn.substr(3)), {prefix: isbn.substr(0, 3)}) :
            isbn.length === 10 ?
              this.splitToObject(isbn) :
              null);
        },
      
        splitToArray: function(isbn10) {
          var rec, key, rest, i, m;
          rec = this.getGroupRecord(isbn10);
          if (!rec) {
            return null;
          }
      
          for (key, i = 0, m = rec.record.ranges.length; i < m; i += 1) {
            key = rec.rest.substr(0, rec.record.ranges[i][0].length);
            if (rec.record.ranges[i][0] <= key && rec.record.ranges[i][1] >= key) {
              rest = rec.rest.substr(key.length);
              return [rec.group, key, rest.substr(0, rest.length - 1), rest.charAt(rest.length - 1)];
            }
          }
          return null;
        },
      
        splitToObject: function(isbn10) {
          var a = this.splitToArray(isbn10);
          if (!a || a.length !== 4) {
            return null;
          }
          return {group: a[0], publisher: a[1], article: a[2], check: a[3]};
        },
      
        fill: function(codes) {
          var rec, prefix, ck10, ck13, parts13, parts10;
      
          if (!codes) {
            return null;
          }
      
          rec = this.groups[codes.group];
          if (!rec) {
            return null;
          }
      
          prefix = codes.prefix ? codes.prefix : '978';
          ck10 = this.calcCheckDigit([
            codes.group, codes.publisher, codes.article].join(''));
          if (!ck10) {
            return null;
          }
      
          ck13 = this.calcCheckDigit([prefix, codes.group, codes.publisher, codes.article].join(''));
          if (!ck13) {
            return null;
          }
      
          parts13 = [prefix, codes.group, codes.publisher, codes.article, ck13];
          this.merge(codes, {
            isbn13: parts13.join(''),
            isbn13h: parts13.join('-'),
            check10: ck10,
            check13: ck13,
            groupname: rec.name
          });
      
          if (prefix === '978') {
            parts10 = [codes.group, codes.publisher, codes.article, ck10];
            this.merge(codes, {isbn10: parts10.join(''), isbn10h: parts10.join('-')});
          }
      
          return codes;
        },
      
        getGroupRecord: function(isbn10) {
          var key;
          for (key in this.groups) {
            if (isbn10.match('^' + key + '(.+)')) {
              return {group: key, record: this.groups[key], rest: RegExp.$1};
            }
          }
          return null;
        },
      
        calcCheckDigit: function(isbn) {
          var c, n;
          if (isbn.match(/^\d{9}[\dX]?$/)) {
            c = 0;
            for (n = 0; n < 9; n += 1) {
              c += (10 - n) * isbn.charAt(n);
            }
            c = (11 - c % 11) % 11;
            return c === 10 ? 'X' : String(c);
      
          } else if (isbn.match(/(?:978|979)\d{9}[\dX]?/)) {
            c = 0;
            for (n = 0; n < 12; n += 2) {
              c += Number(isbn.charAt(n)) + 3 * isbn.charAt(n + 1);
            }
            return String((10 - c % 10) % 10);
          }
      
          return null;
        }
      };
        
        //var exports = window === void 0 ? module.exports : window;
        var exports = typeof window === 'object' && window ? window: module.exports;
        exports.ISBN = ISBN;
      }());
      
    }
  }, 'isbn');

  require('isbn');

}.call(window));
//# sourceMappingURL=ender.js.map
