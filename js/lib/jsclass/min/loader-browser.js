var JS=void 0===this.JS?{}:this.JS;JS.Date=Date,function(e){var t="object"==typeof this.global?this.global:this,n="object"==typeof exports;n?(exports.JS=exports,JS=exports):t.JS=JS,e(t,JS)}(function(e,t){"use strict";var n=function(e){n._index(this),this._loader=e,this._names=new i,this._deps=new i,this._uses=new i,this._styles=new i,this._observers={},this._events={}};n.displayName="Package",n.toString=function(){return n.displayName},n.log=function(n){t.debug&&"undefined"!=typeof window&&("object"==typeof e.runtime&&runtime.trace(n),e.console&&console.info&&console.info(n))};var r=function(e){if(/^https?:/.test(e))return e;var n=t.ROOT;return n&&(e=(n+"/"+e).replace(/\/+/g,"/")),e},i=function(e){if(this._members=this.list=[],this._index={},e)for(var t=0,n=e.length;n>t;t++)this.push(e[t])};i.prototype.push=function(e){var t=void 0!==e.id?e.id:e,n=this._index;n.hasOwnProperty(t)||(n[t]=this._members.length,this._members.push(e))};var s=n.Deferred=function(){this._status="deferred",this._value=null,this._callbacks=[]};s.prototype.callback=function(e,t){"succeeded"===this._status?e.call(t,this._value):this._callbacks.push([e,t])},s.prototype.succeed=function(e){this._status="succeeded",this._value=e;for(var t;t=this._callbacks.shift();)t[0].call(t[1],e)},n.ENV=t.ENV=e,n.onerror=function(e){throw e},n._throw=function(e){n.onerror(Error(e))};for(var o=n.prototype,a=[["requires","_deps"],["uses","_uses"]],l=a.length;l--;)(function(e){var t=e[0],n=e[1];o[t]=function(){var e,t=arguments.length;for(e=0;t>e;e++)this[n].push(arguments[e]);return this}})(a[l]);o.provides=function(){var e,t=arguments.length;for(e=0;t>e;e++)this._names.push(arguments[e]),n._getFromCache(arguments[e]).pkg=this;return this},o.styling=function(){for(var e=0,t=arguments.length;t>e;e++)this._styles.push(r(arguments[e]))},o.setup=function(e){return this._onload=e,this},o._on=function(e,t,n){if(this._events[e])return t.call(n);var r=this._observers[e]=this._observers[e]||[];r.push([t,n]),this._load()},o._fire=function(e){if(this._events[e])return!1;this._events[e]=!0;var t=this._observers[e];if(!t)return!0;delete this._observers[e];for(var n=0,r=t.length;r>n;n++)t[n][0].call(t[n][1]);return!0},o._isLoaded=function(e){if(!e&&void 0!==this.__isLoaded)return this.__isLoaded;for(var t,r,i=this._names.list,s=i.length;s--;)if(t=i[s],r=n._getObject(t,this._exports),void 0===r)return e?n._throw("Expected package at "+this._loader+" to define "+t):this.__isLoaded=!1;return this.__isLoaded=!0},o._load=function(){if(this._fire("request")){this._isLoaded()||this._prefetch();var e=this._deps.list.concat(this._uses.list),t=this._source||[],r=(this._loader||{}).length,i=this;n.when({load:e}),n.when({complete:this._deps.list},function(){n.when({complete:e,load:[this]},function(){this._fire("complete")},this);var s=function(e){if(0===r)return o(e);r-=1;var a=i._loader.length-r-1;n.loader.loadFile(i._loader[a],s,t[a])},o=function(e){i._exports=e,i._onload&&i._onload(),i._isLoaded(!0),i._fire("load")};if(this._isLoaded())return this._fire("download"),this._fire("load");if(void 0===this._loader)return n._throw("No load path found for "+this._names.list[0]);if("function"==typeof this._loader?this._loader(o):s(),n.loader.loadStyle){for(var a=this._styles.list,l=a.length;l--;)n.loader.loadStyle(a[l]);this._fire("download")}},this)}},o._prefetch=function(){if(!this._source&&this._loader instanceof Array&&n.loader.fetch){this._source=[];for(var e=0,t=this._loader.length;t>e;e++)this._source[e]=n.loader.fetch(this._loader[e])}},o.toString=function(){return"Package:"+this._names.list.join(",")},n.when=function(e,t,r){var s,o,a,l=[],u={};for(s in e)if(e.hasOwnProperty(s))for(u[s]=[],o=new i(e[s]),a=o.list.length;a--;)l.push([s,o.list[a],a]);var c=a=l.length;if(0===c)return t&&t.call(r,u);for(;a--;)(function(e){var i=n._getByName(e[1]);i._on(e[0],function(){u[e[0]][e[2]]=n._getObject(e[1],i._exports),c-=1,0===c&&t&&t.call(r,u)})})(l[a])};var u=(e.JS||{}).Package||{};n._autoIncrement=u._autoIncrement||1,n._indexByPath=u._indexByPath||{},n._indexByName=u._indexByName||{},n._autoloaders=u._autoloaders||[],n._index=function(e){e.id=this._autoIncrement,this._autoIncrement+=1},n._getByPath=function(e){var t=""+e,n=this._indexByPath[t];return n?n:("string"==typeof e&&(e=[].slice.call(arguments)),n=this._indexByPath[t]=new this(e))},n._getByName=function(e){if("string"!=typeof e)return e;var t=this._getFromCache(e);if(t.pkg)return t.pkg;var n=this._manufacture(e);if(n)return n;var r=new this;return r.provides(e),r},n.remove=function(e){var t=this._getByName(e);delete this._indexByName[e],delete this._indexByPath[t._loader]},n._autoload=function(e,t){this._autoloaders.push([e,t])},n._manufacture=function(e){var t,n,r,i,s=this._autoloaders,o=s.length;for(t=0;o>t;t++)if(r=s[t],r[0].test(e)){i=r[1].from,"string"==typeof i&&(i=this._convertNameToPath(i));var a=new this([i(e)]);if(a.provides(e),i=r[1].require)for(i=[].concat(i),n=i.length;n--;)a.requires(e.replace(r[0],i[n]));return a}return null},n._convertNameToPath=function(e){return function(t){return e.replace(/\/?$/,"/")+t.replace(/([a-z])([A-Z])/g,function(e,t,n){return t+"_"+n}).replace(/\./g,"/").toLowerCase()+".js"}},n._getFromCache=function(e){return this._indexByName[e]=this._indexByName[e]||{}},n._getObject=function(e,t){if("string"!=typeof e)return void 0;var n=t?{}:this._getFromCache(e);if(void 0!==n.obj)return n.obj;for(var r,i=t||this.ENV,s=e.split(".");r=s.shift();)i=i&&i[r];return t&&void 0===i?this._getObject(e):n.obj=i},n.BrowserLoader={HOST_REGEX:/^(https?\:)?\/\/[^\/]+/i,usable:function(){return!!n._getObject("window.document.getElementsByTagName")&&"undefined"==typeof phantom},__FILE__:function(){var e=document.getElementsByTagName("script"),t=e[e.length-1].src,n=window.location.href;return/^\w+\:\/+/.test(t)?t:/^\//.test(t)?window.location.origin+t:n.replace(/[^\/]*$/g,"")+t},cacheBust:function(e){if(t.cache!==!1)return e;var n=(new JS.Date).getTime();return e+(/\?/.test(e)?"&":"?")+n},fetch:function(e){var t=e;e=this.cacheBust(e),this.HOST=this.HOST||this.HOST_REGEX.exec(window.location.href);var r=this.HOST_REGEX.exec(e);if(!this.HOST||r&&r[0]!==this.HOST[0])return null;n.log("[FETCH] "+e);var i=new n.Deferred,s=this,o=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest;return o.open("GET",e,!0),o.onreadystatechange=function(){4===o.readyState&&(o.onreadystatechange=s._K,i.succeed(o.responseText+"\n//@ sourceURL="+t),o=null)},o.send(null),i},loadFile:function(e,t,r){r||(e=this.cacheBust(e));var i=this,s=document.getElementsByTagName("head")[0],o=document.createElement("script");return o.type="text/javascript",r?r.callback(function(r){n.log("[EXEC]  "+e);var i=Function("code","eval(code)");i(r),t()}):(n.log("[LOAD] "+e),o.src=e,o.onload=o.onreadystatechange=function(){var e=o.readyState,n=o.status;(!e||"loaded"===e||"complete"===e||4===e&&200===n)&&(t(),o.onload=o.onreadystatechange=i._K,s=null,o=null)},void s.appendChild(o))},loadStyle:function(e){var t=document.createElement("link");t.rel="stylesheet",t.type="text/css",t.href=this.cacheBust(e),document.getElementsByTagName("head")[0].appendChild(t)},_K:function(){}},n.loader=n.BrowserLoader;var c={__FILE__:function(){return n.loader.__FILE__()},pkg:function(e,t){var r=t?n._getByPath(t):n._getByName(e);return r.provides(e),r},file:function(){for(var e=[],t=arguments.length;t--;)e[t]=r(arguments[t]);return n._getByPath.apply(n,e)},load:function(e,t){n.loader.loadFile(e,t)},autoload:function(e,t){n._autoload(e,t)}};c.files=c.file,c.loader=c.file;var _=function(e){e.call(c)},h=function(e){for(var t=[],n=0;"string"==typeof e[n];)t.push(e[n]),n+=1;return{files:t,callback:e[n],context:e[n+1]}};t.load=function(){var e=h(arguments),t=e.files.length,r=function(i){return i===t?e.callback.call(e.context):void n.loader.loadFile(e.files[i],function(){r(i+1)})};r(0)},t.require=function(){var e=h(arguments);return n.when({complete:e.files},function(t){e.callback&&e.callback.apply(e.context,t&&t.complete)}),this},t.Package=n,t.Packages=t.packages=_,t.DSL=c}),function(){var E="object"==typeof exports,P=E?exports:JS,Package=P.Package;P.packages(function(){with(this){Package.ENV.JSCLASS_PATH=Package.ENV.JSCLASS_PATH||__FILE__().replace(/[^\/]*$/g,"");var PATH=Package.ENV.JSCLASS_PATH;/\/$/.test(PATH)||(PATH+="/");var module=function(e){return file(PATH+e+".js")};module("core").provides("JS","JS.Module","JS.Class","JS.Method","JS.Kernel","JS.Singleton","JS.Interface");var test="JS.Test.Unit";module("test").provides("JS.Test","JS.Test.Context","JS.Test.Mocking","JS.Test.FakeClock","JS.Test.AsyncSteps","JS.Test.Helpers",test,test+".Assertions",test+".TestCase",test+".TestSuite",test+".TestResult").requires("JS.Module","JS.Class","JS.Console","JS.DOM","JS.Enumerable","JS.SortedSet","JS.Range","JS.Hash","JS.MethodChain","JS.Comparable","JS.StackTrace").styling(PATH+"assets/testui.css"),module("dom").provides("JS.DOM","JS.DOM.Builder").requires("JS.Class"),module("console").provides("JS.Console").requires("JS.Module","JS.Enumerable"),module("comparable").provides("JS.Comparable").requires("JS.Module"),module("constant_scope").provides("JS.ConstantScope").requires("JS.Module"),module("forwardable").provides("JS.Forwardable").requires("JS.Module"),module("enumerable").provides("JS.Enumerable").requires("JS.Module","JS.Class"),module("deferrable").provides("JS.Deferrable").requires("JS.Module"),module("observable").provides("JS.Observable").requires("JS.Module"),module("hash").provides("JS.Hash","JS.OrderedHash").requires("JS.Class","JS.Enumerable","JS.Comparable"),module("range").provides("JS.Range").requires("JS.Class","JS.Enumerable","JS.Hash"),module("set").provides("JS.Set","JS.HashSet","JS.OrderedSet","JS.SortedSet").requires("JS.Class","JS.Enumerable","JS.Hash"),module("linked_list").provides("JS.LinkedList","JS.LinkedList.Doubly","JS.LinkedList.Doubly.Circular").requires("JS.Class","JS.Enumerable"),module("command").provides("JS.Command","JS.Command.Stack").requires("JS.Class","JS.Enumerable","JS.Observable"),module("decorator").provides("JS.Decorator").requires("JS.Module","JS.Class"),module("method_chain").provides("JS.MethodChain").requires("JS.Module","JS.Kernel"),module("proxy").provides("JS.Proxy","JS.Proxy.Virtual").requires("JS.Module","JS.Class"),module("stack_trace").provides("JS.StackTrace").requires("JS.Module","JS.Singleton","JS.Observable","JS.Enumerable","JS.Console"),module("state").provides("JS.State").requires("JS.Module","JS.Class"),module("tsort").provides("JS.TSort").requires("JS.Module").requires("JS.Class").requires("JS.Hash")}})}();
//@ sourceMappingURL=loader-browser.js.map