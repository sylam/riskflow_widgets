(self.webpackChunkriskflow_widgets=self.webpackChunkriskflow_widgets||[]).push([[261],{568:(t,e,r)=>{t.exports=r(928),t.exports.version=r(147).version},261:(t,e,r)=>{var n=r(568),o=r(337);t.exports={id:"riskflow_widgets:plugin",requires:[o.IJupyterWidgetRegistry],activate:function(t,e){e.registerWidget({name:"riskflow_widgets",version:n.version,exports:n})},autoStart:!0}},928:(t,e,r)=>{var n=r(337),o=r(431),i=r(755);r(827),r(333);var a=n.DOMWidgetView.extend({initialize:function(t){a.__super__.initialize.apply(this,arguments),this.loaded=!1},generateActionMethod:function(t,e,r,n){return function(o){e=t.create_node(e,{type:r,data:n}),t.edit(e,n+".")}},generateContextMethod:function(t,e,r){var n={};for(var o in r)r.hasOwnProperty(o)&&(n[o]={separator_before:!1,separator_after:!1,label:o,action:this.generateActionMethod(t,e,r[o],o)});return n},perform_update:function(t,e,r){i.parseJSON(this.model.get("context_menu")),t.jstree({core:{data:e,check_callback:!0},types:r,plugins:this.model.get("plugins")}).on("select_node.jstree",this.handle_select.bind(this))},update:function(){if(!this.loaded){var t=this.$tree,e=i.parseJSON(this.model.get("value")),r=i.parseJSON(this.model.get("type_data"));this.perform_update(t,e,r),this.$search.on("keyup",this.handle_search.bind(this)).on("paste",this.handle_search.bind(this)),this.loaded=!0,console.log("loaded data and type data")}return a.__super__.update.apply(this)},render:function(){this.$search=i('<input type="text" />').addClass("input").addClass("widget-text").appendTo(this.el),this.$tree=i("<div />").appendTo(this.el),this.to=!1,this.displayed.then(o.bind(this.update,this))},get_json_path:function(t){var e=this.$tree.jstree("get_path",t.node);return JSON.stringify(e.slice(1))},handle_search:function(t,e){var r=this;this.to&&clearTimeout(this.to),this.to=setTimeout((function(){var t=r.$search.val();r.$tree.jstree(!0).search(t)}),250)},handle_select:function(t,e){null!=e&&this.model.set("selected",this.get_json_path(e)),this.touch()},handle_tree_change:function(t,e){null!=e&&(0!=e.node.text.indexOf(e.node.data)&&this.$tree.jstree("rename_node",e.node,e.node.data+"."+e.node.text),this.model.set("created",this.get_json_path(e))),this.touch()},handle_delete:function(t,e){null!=e&&this.model.set("deleted",this.get_json_path(e)),this.touch()}}),s=n.DOMWidgetModel.extend({defaults:o.extend(n.DOMWidgetModel.prototype.defaults(),{_model_name:"TreeModel",_view_name:"TreeView",_model_module:"riskflow_widgets",_view_module:"riskflow_widgets",_model_module_version:"0.1.0",_view_module_version:"0.1.0",value:"",type_data:"",selected:"",created:"",deleted:"",plugins:[],context_menu:""})});t.exports={TreeModel:s,TreeView:a}},397:(t,e,r)=>{var n=r(456);(t.exports=r(252)(!1)).push([t.id,".vakata-context {\r\n z-index:2999 !important;\r\n}\r\n\r\n.widget-text { width: 500px !important; }\r\n.widget-label { min-width:35ex !important;  }\r\n.widget-textarea  { width: auto; }\r\n.widget-tenor-text{width:140px;margin:0 !important}\r\n.widget-datepicker { width: 380px !important; }\r\n.widget-select { width: 450px !important; }\r\n.widget-tenorlistbox{width:140px;margin-bottom:0}\r\n\r\n.flot-container {\r\n\tbox-sizing: border-box;\r\n\twidth: 850px;\r\n\theight: 450px;\r\n\tpadding: 20px 15px 15px 15px;\r\n\tmargin: 15px auto 30px auto;\r\n\tborder: 1px solid #ddd;\r\n\tbackground: #fff;\r\n\tbackground: linear-gradient(#f6f6f6 0, #fff 50px);\r\n\tbackground: -o-linear-gradient(#f6f6f6 0, #fff 50px);\r\n\tbackground: -ms-linear-gradient(#f6f6f6 0, #fff 50px);\r\n\tbackground: -moz-linear-gradient(#f6f6f6 0, #fff 50px);\r\n\tbackground: -webkit-linear-gradient(#f6f6f6 0, #fff 50px);\r\n\tbox-shadow: 0 3px 10px rgba(0,0,0,0.15);\r\n\t-o-box-shadow: 0 3px 10px rgba(0,0,0,0.1);\r\n\t-ms-box-shadow: 0 3px 10px rgba(0,0,0,0.1);\r\n\t-moz-box-shadow: 0 3px 10px rgba(0,0,0,0.1);\r\n\t-webkit-box-shadow: 0 3px 10px rgba(0,0,0,0.1);\r\n}\r\n.flotwrapper { position: relative; width: 800px; margin: auto; margin-top: 20px; font-size: 12pt; }\r\n.flottitle { color: #888; margin-left: 50px; }\r\n.flotgraph { position: relative; margin-top: 20px; }\r\n.flotlegend { position: absolute; right: 0; }\r\n.flotplot { width: 540px; height: 300px; }\r\n.handsonplot { overflow-y: auto; overflow-x: auto; height: 300px; max-width: 500px}\r\n.handsontable col.rowHeader {  width: 250px; }\r\n.container { width:95%; }\r\n.generictree{ max-width : 450px; overflow-y: auto; max-height: 700px; padding : 5px; border-style:outset }\r\n.genericframe{ padding : 5px; border-style:outset }\r\n/*.rightframe{ max-width: 1050px; overflow-y: auto; max-height: 700px }*/\r\n.rightframe{ overflow-y: auto; max-height: 700px }\r\n.mainframe{background-image:url("+n(r(351))+");background-repeat:repeat}\r\n",""])},252:t=>{t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var r=function(t,e){var r,n=t[1]||"",o=t[3];if(!o)return n;if(e&&"function"==typeof btoa){var i=(r=o,"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */"),a=o.sources.map((function(t){return"/*# sourceURL="+o.sourceRoot+t+" */"}));return[n].concat(a).concat([i]).join("\n")}return[n].join("\n")}(e,t);return e[2]?"@media "+e[2]+"{"+r+"}":r})).join("")},e.i=function(t,r){"string"==typeof t&&(t=[[null,t,""]]);for(var n={},o=0;o<this.length;o++){var i=this[o][0];"number"==typeof i&&(n[i]=!0)}for(o=0;o<t.length;o++){var a=t[o];"number"==typeof a[0]&&n[a[0]]||(r&&!a[2]?a[2]=r:r&&(a[2]="("+a[2]+") and ("+r+")"),e.push(a))}},e}},456:t=>{t.exports=function(t){return"string"!=typeof t?t:(/^['"].*['"]$/.test(t)&&(t=t.slice(1,-1)),/["'() \t\n]/.test(t)?'"'+t.replace(/"/g,'\\"').replace(/\n/g,"\\n")+'"':t)}},351:(t,e,r)=>{t.exports=r.p+"c1d41038c314e27127324b254cc2b844.png"},827:(t,e,r)=>{var n=r(397);"string"==typeof n&&(n=[[t.id,n,""]]);r(723)(n,{transform:void 0}),n.locals&&(t.exports=n.locals)},723:(t,e,r)=>{var n,o,i={},a=(n=function(){return window&&document&&document.all&&!window.atob},function(){return void 0===o&&(o=n.apply(this,arguments)),o}),s=function(t){var e={};return function(r){return void 0===e[r]&&(e[r]=t.call(this,r)),e[r]}}((function(t){return document.querySelector(t)})),d=null,p=0,l=[],f=r(947);function u(t,e){for(var r=0;r<t.length;r++){var n=t[r],o=i[n.id];if(o){o.refs++;for(var a=0;a<o.parts.length;a++)o.parts[a](n.parts[a]);for(;a<n.parts.length;a++)o.parts.push(v(n.parts[a],e))}else{var s=[];for(a=0;a<n.parts.length;a++)s.push(v(n.parts[a],e));i[n.id]={id:n.id,refs:1,parts:s}}}}function c(t,e){for(var r=[],n={},o=0;o<t.length;o++){var i=t[o],a=e.base?i[0]+e.base:i[0],s={css:i[1],media:i[2],sourceMap:i[3]};n[a]?n[a].parts.push(s):r.push(n[a]={id:a,parts:[s]})}return r}function h(t,e){var r=s(t.insertInto);if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var n=l[l.length-1];if("top"===t.insertAt)n?n.nextSibling?r.insertBefore(e,n.nextSibling):r.appendChild(e):r.insertBefore(e,r.firstChild),l.push(e);else{if("bottom"!==t.insertAt)throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");r.appendChild(e)}}function g(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var e=l.indexOf(t);e>=0&&l.splice(e,1)}function x(t){var e=document.createElement("style");return t.attrs.type="text/css",m(e,t.attrs),h(t,e),e}function m(t,e){Object.keys(e).forEach((function(r){t.setAttribute(r,e[r])}))}function v(t,e){var r,n,o,i;if(e.transform&&t.css){if(!(i=e.transform(t.css)))return function(){};t.css=i}if(e.singleton){var a=p++;r=d||(d=x(e)),n=_.bind(null,r,a,!1),o=_.bind(null,r,a,!0)}else t.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(r=function(t){var e=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",m(e,t.attrs),h(t,e),e}(e),n=k.bind(null,r,e),o=function(){g(r),r.href&&URL.revokeObjectURL(r.href)}):(r=x(e),n=y.bind(null,r),o=function(){g(r)});return n(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;n(t=e)}else o()}}t.exports=function(t,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");(e=e||{}).attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||(e.singleton=a()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var r=c(t,e);return u(r,e),function(t){for(var n=[],o=0;o<r.length;o++){var a=r[o];(s=i[a.id]).refs--,n.push(s)}for(t&&u(c(t,e),e),o=0;o<n.length;o++){var s;if(0===(s=n[o]).refs){for(var d=0;d<s.parts.length;d++)s.parts[d]();delete i[s.id]}}}};var b,w=(b=[],function(t,e){return b[t]=e,b.filter(Boolean).join("\n")});function _(t,e,r,n){var o=r?"":n.css;if(t.styleSheet)t.styleSheet.cssText=w(e,o);else{var i=document.createTextNode(o),a=t.childNodes;a[e]&&t.removeChild(a[e]),a.length?t.insertBefore(i,a[e]):t.appendChild(i)}}function y(t,e){var r=e.css,n=e.media;if(n&&t.setAttribute("media",n),t.styleSheet)t.styleSheet.cssText=r;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(r))}}function k(t,e,r){var n=r.css,o=r.sourceMap,i=void 0===e.convertToAbsoluteUrls&&o;(e.convertToAbsoluteUrls||i)&&(n=f(n)),o&&(n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var a=new Blob([n],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}},947:t=>{t.exports=function(t){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!t||"string"!=typeof t)return t;var r=e.protocol+"//"+e.host,n=r+e.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,(function(t,e){var o,i=e.trim().replace(/^"(.*)"$/,(function(t,e){return e})).replace(/^'(.*)'$/,(function(t,e){return e}));return/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(i)?t:(o=0===i.indexOf("//")?i:0===i.indexOf("/")?r+i:n+i.replace(/^\.\//,""),"url("+JSON.stringify(o)+")")}))}},147:t=>{"use strict";t.exports={version:"0.1.0"}}}]);