// 由 scripts/build.mjs 生成。
window.__ModuleLoader__.load({id: "@dsh-external/dsh-layered-memory-status",factory(require){
const __DSH_LMD_D3__ = (function () {
	var exports = {};
	var module = { exports: exports };
/*! d3 v7.9.2 (bundled UMD build) | ISC License | https://github.com/d3/d3 | Copyright 2010-2026 Mike Bostock */
// https://d3js.org v7.9.2 Copyright 2010-2026 Mike Bostock
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t="undefined"!=typeof globalThis?globalThis:t||self).d3=t.d3||{})}(this,function(t){"use strict";function n(t,n){return null==t||null==n?NaN:t<n?-1:t>n?1:t>=n?0:NaN}function e(t,n){return null==t||null==n?NaN:n<t?-1:n>t?1:n>=t?0:NaN}function r(t){let r,o,a;function u(t,n,e=0,i=t.length){if(e<i){if(0!==r(n,n))return i;do{const r=e+i>>>1;o(t[r],n)<0?e=r+1:i=r}while(e<i)}return e}return 2!==t.length?(r=n,o=(e,r)=>n(t(e),r),a=(n,e)=>t(n)-e):(r=t===n||t===e?t:i,o=t,a=t),{left:u,center:function(t,n,e=0,r=t.length){const i=u(t,n,e,r-1);return i>e&&a(t[i-1],n)>-a(t[i],n)?i-1:i},right:function(t,n,e=0,i=t.length){if(e<i){if(0!==r(n,n))return i;do{const r=e+i>>>1;o(t[r],n)<=0?e=r+1:i=r}while(e<i)}return e}}}function i(){return 0}function o(t){return null===t?NaN:+t}const a=r(n),u=a.right,c=a.left,f=r(o).center;const s=h(g),l=h(function(t){const n=g(t);return(t,e,r,i,o)=>{n(t,e,(r<<=2)+0,(i<<=2)+0,o<<=2),n(t,e,r+1,i+1,o),n(t,e,r+2,i+2,o),n(t,e,r+3,i+3,o)}});function h(t){return function(n,e,r=e){if(!((e=+e)>=0))throw new RangeError("invalid rx");if(!((r=+r)>=0))throw new RangeError("invalid ry");let{data:i,width:o,height:a}=n;if(!((o=Math.floor(o))>=0))throw new RangeError("invalid width");if(!((a=Math.floor(void 0!==a?a:i.length/o))>=0))throw new RangeError("invalid height");if(!o||!a||!e&&!r)return n;const u=e&&t(e),c=r&&t(r),f=i.slice();return u&&c?(d(u,f,i,o,a),d(u,i,f,o,a),d(u,f,i,o,a),p(c,i,f,o,a),p(c,f,i,o,a),p(c,i,f,o,a)):u?(d(u,i,f,o,a),d(u,f,i,o,a),d(u,i,f,o,a)):c&&(p(c,i,f,o,a),p(c,f,i,o,a),p(c,i,f,o,a)),n}}function d(t,n,e,r,i){for(let o=0,a=r*i;o<a;)t(n,e,o,o+=r,1)}function p(t,n,e,r,i){for(let o=0,a=r*i;o<r;++o)t(n,e,o,o+a,r)}function g(t){const n=Math.floor(t);if(n===t)return function(t){const n=2*t+1;return(e,r,i,o,a)=>{if(!((o-=a)>=i))return;let u=t*r[i];const c=a*t;for(let t=i,n=i+c;t<n;t+=a)u+=r[Math.min(o,t)];for(let t=i,f=o;t<=f;t+=a)u+=r[Math.min(o,t+c)],e[t]=u/n,u-=r[Math.max(i,t-c)]}}(t);const e=t-n,r=2*t+1;return(t,i,o,a,u)=>{if(!((a-=u)>=o))return;let c=n*i[o];const f=u*n,s=f+u;for(let t=o,n=o+f;t<n;t+=u)c+=i[Math.min(a,t)];for(let n=o,l=a;n<=l;n+=u)c+=i[Math.min(a,n+f)],t[n]=(c+e*(i[Math.max(o,n-s)]+i[Math.min(a,n+s)]))/r,c-=i[Math.max(o,n-f)]}}function y(t,n){let e=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&++e;else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(i=+i)>=i&&++e}return e}function v(t){return 0|t.length}function _(t){return!(t>0)}function b(t){return"object"!=typeof t||"length"in t?t:Array.from(t)}function m(t,n){let e,r=0,i=0,o=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(e=n-i,i+=e/++r,o+=e*(n-i));else{let a=-1;for(let u of t)null!=(u=n(u,++a,t))&&(u=+u)>=u&&(e=u-i,i+=e/++r,o+=e*(u-i))}if(r>1)return o/(r-1)}function x(t,n){const e=m(t,n);return e?Math.sqrt(e):e}function w(t,n){let e,r;if(void 0===n)for(const n of t)null!=n&&(void 0===e?n>=n&&(e=r=n):(e>n&&(e=n),r<n&&(r=n)));else{let i=-1;for(let o of t)null!=(o=n(o,++i,t))&&(void 0===e?o>=o&&(e=r=o):(e>o&&(e=o),r<o&&(r=o)))}return[e,r]}class M{constructor(){this._partials=new Float64Array(32),this._n=0}add(t){const n=this._partials;let e=0;for(let r=0;r<this._n&&r<32;r++){const i=n[r],o=t+i,a=Math.abs(t)<Math.abs(i)?t-(o-i):i-(o-t);a&&(n[e++]=a),t=o}return n[e]=t,this._n=e+1,this}valueOf(){const t=this._partials;let n,e,r,i=this._n,o=0;if(i>0){for(o=t[--i];i>0&&(n=o,e=t[--i],o=n+e,r=e-(o-n),!r););i>0&&(r<0&&t[i-1]<0||r>0&&t[i-1]>0)&&(e=2*r,n=o+e,e==n-o&&(o=n))}return o}}class InternMap extends Map{constructor(t,n=E){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:n}}),null!=t)for(const[n,e]of t)this.set(n,e)}get(t){return super.get(A(this,t))}has(t){return super.has(A(this,t))}set(t,n){return super.set(T(this,t),n)}delete(t){return super.delete(S(this,t))}}class InternSet extends Set{constructor(t,n=E){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:n}}),null!=t)for(const n of t)this.add(n)}has(t){return super.has(A(this,t))}add(t){return super.add(T(this,t))}delete(t){return super.delete(S(this,t))}}function A({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):e}function T({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):(t.set(r,e),e)}function S({_intern:t,_key:n},e){const r=n(e);return t.has(r)&&(e=t.get(r),t.delete(r)),e}function E(t){return null!==t&&"object"==typeof t?t.valueOf():t}function N(t){return t}function k(t,...n){return R(t,N,N,n)}function C(t,...n){return R(t,Array.from,N,n)}function P(t,n){for(let e=1,r=n.length;e<r;++e)t=t.flatMap(t=>t.pop().map(([n,e])=>[...t,n,e]));return t}function z(t,n,...e){return R(t,N,n,e)}function $(t,n,...e){return R(t,Array.from,n,e)}function D(t){if(1!==t.length)throw new Error("duplicate key");return t[0]}function R(t,n,e,r){return function t(i,o){if(o>=r.length)return e(i);const a=new InternMap,u=r[o++];let c=-1;for(const t of i){const n=u(t,++c,i),e=a.get(n);e?e.push(t):a.set(n,[t])}for(const[n,e]of a)a.set(n,t(e,o));return n(a)}(t,0)}function F(t,n){return Array.from(n,n=>t[n])}function q(t,...n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");t=Array.from(t);let[e]=n;if(e&&2!==e.length||n.length>1){const r=Uint32Array.from(t,(t,n)=>n);return n.length>1?(n=n.map(n=>t.map(n)),r.sort((t,e)=>{for(const r of n){const n=U(r[t],r[e]);if(n)return n}})):(e=t.map(e),r.sort((t,n)=>U(e[t],e[n]))),F(t,r)}return t.sort(I(e))}function I(t=n){if(t===n)return U;if("function"!=typeof t)throw new TypeError("compare is not a function");return(n,e)=>{const r=t(n,e);return r||0===r?r:(0===t(e,e))-(0===t(n,n))}}function U(t,n){return(null==t||!(t>=t))-(null==n||!(n>=n))||(t<n?-1:t>n?1:0)}var O=Array.prototype.slice;function B(t){return()=>t}const Y=Math.sqrt(50),L=Math.sqrt(10),j=Math.sqrt(2);function H(t,n,e){const r=(n-t)/Math.max(0,e),i=Math.floor(Math.log10(r)),o=r/Math.pow(10,i),a=o>=Y?10:o>=L?5:o>=j?2:1;let u,c,f;return i<0?(f=Math.pow(10,-i)/a,u=Math.round(t*f),c=Math.round(n*f),u/f<t&&++u,c/f>n&&--c,f=-f):(f=Math.pow(10,i)*a,u=Math.round(t/f),c=Math.round(n/f),u*f<t&&++u,c*f>n&&--c),c<u&&.5<=e&&e<2?H(t,n,2*e):[u,c,f]}function X(t,n,e){if(!((e=+e)>0))return[];if((t=+t)===(n=+n))return[t];const r=n<t,[i,o,a]=r?H(n,t,e):H(t,n,e);if(!(o>=i))return[];const u=o-i+1,c=new Array(u);if(r)if(a<0)for(let t=0;t<u;++t)c[t]=(o-t)/-a;else for(let t=0;t<u;++t)c[t]=(o-t)*a;else if(a<0)for(let t=0;t<u;++t)c[t]=(i+t)/-a;else for(let t=0;t<u;++t)c[t]=(i+t)*a;return c}function G(t,n,e){return H(t=+t,n=+n,e=+e)[2]}function V(t,n,e){e=+e;const r=(n=+n)<(t=+t),i=r?G(n,t,e):G(t,n,e);return(r?-1:1)*(i<0?1/-i:i)}function W(t,n,e){let r;for(;;){const i=G(t,n,e);if(i===r||0===i||!isFinite(i))return[t,n];if(i>0){const e=Math.ceil(t/i),r=Math.floor(n/i);t=(e-(e*i>t))*i,n=(r+(r*i<n))*i}else if(i<0){const e=-i,r=Math.ceil(t*e),o=Math.floor(n*e);t=(r-(r/e>t))/e,n=(o+(o/e<n))/e}r=i}}function Z(t){return Math.max(1,Math.ceil(Math.log(y(t))/Math.LN2)+1)}function K(){var t=N,n=w,e=Z;function r(r){Array.isArray(r)||(r=Array.from(r));var i,o,a,c=r.length,f=new Array(c);for(i=0;i<c;++i)f[i]=t(r[i],i,r);var s=n(f),l=s[0],h=s[1],d=e(f,l,h);if(!Array.isArray(d)){const t=h,e=+d;if(n===w&&([l,h]=W(l,h,e)),(d=X(l,h,e))[0]<=l&&(a=G(l,h,e)),d[d.length-1]>=h)if(t>=h&&n===w){const t=G(l,h,e);isFinite(t)&&(t>0?h=(Math.floor(h/t)+1)*t:t<0&&(h=(Math.ceil(h*-t)+1)/-t))}else d.pop()}for(var p=d.length,g=0,y=p;d[g]<=l;)++g;for(;d[y-1]>h;)--y;(g||y<p)&&(d=d.slice(g,y),p=y-g);var v,_=new Array(p+1);for(i=0;i<=p;++i)(v=_[i]=[]).x0=i>0?d[i-1]:l,v.x1=i<p?d[i]:h;if(isFinite(a)){if(a>0)for(i=0;i<c;++i)null!=(o=f[i])&&l<=o&&o<=h&&_[Math.min(p,Math.floor((o-l)/a))].push(r[i]);else if(a<0)for(i=0;i<c;++i)if(null!=(o=f[i])&&l<=o&&o<=h){const t=Math.floor((l-o)*a);_[Math.min(p,t+(d[t]<=o))].push(r[i])}}else for(i=0;i<c;++i)null!=(o=f[i])&&l<=o&&o<=h&&_[u(d,o,0,p)].push(r[i]);return _}return r.value=function(n){return arguments.length?(t="function"==typeof n?n:B(n),r):t},r.domain=function(t){return arguments.length?(n="function"==typeof t?t:B([t[0],t[1]]),r):n},r.thresholds=function(t){return arguments.length?(e="function"==typeof t?t:B(Array.isArray(t)?O.call(t):t),r):e},r}function Q(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e<n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e<i||void 0===e&&i>=i)&&(e=i)}return e}function J(t,n){let e,r=-1,i=-1;if(void 0===n)for(const n of t)++i,null!=n&&(e<n||void 0===e&&n>=n)&&(e=n,r=i);else for(let o of t)null!=(o=n(o,++i,t))&&(e<o||void 0===e&&o>=o)&&(e=o,r=i);return r}function tt(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e>n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e>i||void 0===e&&i>=i)&&(e=i)}return e}function nt(t,n){let e,r=-1,i=-1;if(void 0===n)for(const n of t)++i,null!=n&&(e>n||void 0===e&&n>=n)&&(e=n,r=i);else for(let o of t)null!=(o=n(o,++i,t))&&(e>o||void 0===e&&o>=o)&&(e=o,r=i);return r}function et(t,n,e=0,r=1/0,i){if(n=Math.floor(n),e=Math.floor(Math.max(0,e)),r=Math.floor(Math.min(t.length-1,r)),!(e<=n&&n<=r))return t;for(i=void 0===i?U:I(i);r>e;){if(r-e>600){const o=r-e+1,a=n-e+1,u=Math.log(o),c=.5*Math.exp(2*u/3),f=.5*Math.sqrt(u*c*(o-c)/o)*(a-o/2<0?-1:1);et(t,n,Math.max(e,Math.floor(n-a*c/o+f)),Math.min(r,Math.floor(n+(o-a)*c/o+f)),i)}const o=t[n];let a=e,u=r;for(rt(t,e,n),i(t[r],o)>0&&rt(t,e,r);a<u;){for(rt(t,a,u),++a,--u;i(t[a],o)<0;)++a;for(;i(t[u],o)>0;)--u}0===i(t[e],o)?rt(t,e,u):(++u,rt(t,u,r)),u<=n&&(e=u+1),n<=u&&(r=u-1)}return t}function rt(t,n,e){const r=t[n];t[n]=t[e],t[e]=r}function it(t,e=n){let r,i=!1;if(1===e.length){let o;for(const a of t){const t=e(a);(i?n(t,o)>0:0===n(t,t))&&(r=a,o=t,i=!0)}}else for(const n of t)(i?e(n,r)>0:0===e(n,n))&&(r=n,i=!0);return r}function ot(t,n,e){if(t=Float64Array.from(function*(t,n){if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(yield n);else{let e=-1;for(let r of t)null!=(r=n(r,++e,t))&&(r=+r)>=r&&(yield r)}}(t,e)),(r=t.length)&&!isNaN(n=+n)){if(n<=0||r<2)return tt(t);if(n>=1)return Q(t);var r,i=(r-1)*n,o=Math.floor(i),a=Q(et(t,o).subarray(0,o+1));return a+(tt(t.subarray(o+1))-a)*(i-o)}}function at(t,n,e=o){if((r=t.length)&&!isNaN(n=+n)){if(n<=0||r<2)return+e(t[0],0,t);if(n>=1)return+e(t[r-1],r-1,t);var r,i=(r-1)*n,a=Math.floor(i),u=+e(t[a],a,t);return u+(+e(t[a+1],a+1,t)-u)*(i-a)}}function ut(t,n,e=o){if(!isNaN(n=+n)){if(r=Float64Array.from(t,(n,r)=>o(e(t[r],r,t))),n<=0)return nt(r);if(n>=1)return J(r);var r,i=Uint32Array.from(t,(t,n)=>n),a=r.length-1,u=Math.floor(a*n);return et(i,u,0,a,(t,n)=>U(r[t],r[n])),(u=it(i.subarray(0,u+1),t=>r[t]))>=0?u:-1}}function ct(t){return Array.from(function*(t){for(const n of t)yield*n}(t))}function ft(t,n){return[t,n]}function st(t,n,e){t=+t,n=+n,e=(i=arguments.length)<2?(n=t,t=0,1):i<3?1:+e;for(var r=-1,i=0|Math.max(0,Math.ceil((n-t)/e)),o=new Array(i);++r<i;)o[r]=t+r*e;return o}function lt(t,e=n){if(1===e.length)return nt(t,e);let r,i=-1,o=-1;for(const n of t)++o,(i<0?0===e(n,n):e(n,r)<0)&&(r=n,i=o);return i}var ht=dt(Math.random);function dt(t){return function(n,e=0,r=n.length){let i=r-(e=+e);for(;i;){const r=t()*i--|0,o=n[i+e];n[i+e]=n[r+e],n[r+e]=o}return n}}function pt(t){if(!(i=t.length))return[];for(var n=-1,e=tt(t,gt),r=new Array(e);++n<e;)for(var i,o=-1,a=r[n]=new Array(i);++o<i;)a[o]=t[o][n];return r}function gt(t){return t.length}function yt(t){return t instanceof InternSet?t:new InternSet(t)}function vt(t,n){const e=t[Symbol.iterator](),r=new Set;for(const t of n){const n=_t(t);if(r.has(n))continue;let i,o;for(;({value:i,done:o}=e.next());){if(o)return!1;const t=_t(i);if(r.add(t),Object.is(n,t))break}}return!0}function _t(t){return null!==t&&"object"==typeof t?t.valueOf():t}function bt(t){return t}var mt=1e-6;function xt(t){return"translate("+t+",0)"}function wt(t){return"translate(0,"+t+")"}function Mt(t){return n=>+t(n)}function At(t,n){return n=Math.max(0,t.bandwidth()-2*n)/2,t.round()&&(n=Math.round(n)),e=>+t(e)+n}function Tt(){return!this.__axis}function St(t,n){var e=[],r=null,i=null,o=6,a=6,u=3,c="undefined"!=typeof window&&window.devicePixelRatio>1?0:.5,f=1===t||4===t?-1:1,s=4===t||2===t?"x":"y",l=1===t||3===t?xt:wt;function h(h){var d=null==r?n.ticks?n.ticks.apply(n,e):n.domain():r,p=null==i?n.tickFormat?n.tickFormat.apply(n,e):bt:i,g=Math.max(o,0)+u,y=n.range(),v=+y[0]+c,_=+y[y.length-1]+c,b=(n.bandwidth?At:Mt)(n.copy(),c),m=h.selection?h.selection():h,x=m.selectAll(".domain").data([null]),w=m.selectAll(".tick").data(d,n).order(),M=w.exit(),A=w.enter().append("g").attr("class","tick"),T=w.select("line"),S=w.select("text");x=x.merge(x.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),w=w.merge(A),T=T.merge(A.append("line").attr("stroke","currentColor").attr(s+"2",f*o)),S=S.merge(A.append("text").attr("fill","currentColor").attr(s,f*g).attr("dy",1===t?"0em":3===t?"0.71em":"0.32em")),h!==m&&(x=x.transition(h),w=w.transition(h),T=T.transition(h),S=S.transition(h),M=M.transition(h).attr("opacity",mt).attr("transform",function(t){return isFinite(t=b(t))?l(t+c):this.getAttribute("transform")}),A.attr("opacity",mt).attr("transform",function(t){var n=this.parentNode.__axis;return l((n&&isFinite(n=n(t))?n:b(t))+c)})),M.remove(),x.attr("d",4===t||2===t?a?"M"+f*a+","+v+"H"+c+"V"+_+"H"+f*a:"M"+c+","+v+"V"+_:a?"M"+v+","+f*a+"V"+c+"H"+_+"V"+f*a:"M"+v+","+c+"H"+_),w.attr("opacity",1).attr("transform",function(t){return l(b(t)+c)}),T.attr(s+"2",f*o),S.attr(s,f*g).text(p),m.filter(Tt).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",2===t?"start":4===t?"end":"middle"),m.each(function(){this.__axis=b})}return h.scale=function(t){return arguments.length?(n=t,h):n},h.ticks=function(){return e=Array.from(arguments),h},h.tickArguments=function(t){return arguments.length?(e=null==t?[]:Array.from(t),h):e.slice()},h.tickValues=function(t){return arguments.length?(r=null==t?null:Array.from(t),h):r&&r.slice()},h.tickFormat=function(t){return arguments.length?(i=t,h):i},h.tickSize=function(t){return arguments.length?(o=a=+t,h):o},h.tickSizeInner=function(t){return arguments.length?(o=+t,h):o},h.tickSizeOuter=function(t){return arguments.length?(a=+t,h):a},h.tickPadding=function(t){return arguments.length?(u=+t,h):u},h.offset=function(t){return arguments.length?(c=+t,h):c},h}var Et={value:()=>{}};function Nt(){for(var t,n=0,e=arguments.length,r={};n<e;++n){if(!(t=arguments[n]+"")||t in r||/[\s.]/.test(t))throw new Error("illegal type: "+t);r[t]=[]}return new kt(r)}function kt(t){this._=t}function Ct(t,n){for(var e,r=0,i=t.length;r<i;++r)if((e=t[r]).name===n)return e.value}function Pt(t,n,e){for(var r=0,i=t.length;r<i;++r)if(t[r].name===n){t[r]=Et,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=e&&t.push({name:n,value:e}),t}kt.prototype=Nt.prototype={constructor:kt,on:function(t,n){var e,r,i=this._,o=(r=i,(t+"").trim().split(/^|\s+/).map(function(t){var n="",e=t.indexOf(".");if(e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),t&&!r.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:n}})),a=-1,u=o.length;if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++a<u;)if(e=(t=o[a]).type)i[e]=Pt(i[e],t.name,n);else if(null==n)for(e in i)i[e]=Pt(i[e],t.name,null);return this}for(;++a<u;)if((e=(t=o[a]).type)&&(e=Ct(i[e],t.name)))return e},copy:function(){var t={},n=this._;for(var e in n)t[e]=n[e].slice();return new kt(t)},call:function(t,n){if((e=arguments.length-2)>0)for(var e,r,i=new Array(e),o=0;o<e;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(o=0,e=(r=this._[t]).length;o<e;++o)r[o].value.apply(n,i)},apply:function(t,n,e){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,o=r.length;i<o;++i)r[i].value.apply(n,e)}};var zt="http://www.w3.org/1999/xhtml",$t={svg:"http://www.w3.org/2000/svg",xhtml:zt,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Dt(t){var n=t+="",e=n.indexOf(":");return e>=0&&"xmlns"!==(n=t.slice(0,e))&&(t=t.slice(e+1)),$t.hasOwnProperty(n)?{space:$t[n],local:t}:t}function Rt(t){return function(){var n=this.ownerDocument,e=this.namespaceURI;return e===zt&&n.documentElement.namespaceURI===zt?n.createElement(t):n.createElementNS(e,t)}}function Ft(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function qt(t){var n=Dt(t);return(n.local?Ft:Rt)(n)}function It(){}function Ut(t){return null==t?It:function(){return this.querySelector(t)}}function Ot(t){return null==t?[]:Array.isArray(t)?t:Array.from(t)}function Bt(){return[]}function Yt(t){return null==t?Bt:function(){return this.querySelectorAll(t)}}function Lt(t){return function(){return this.matches(t)}}function jt(t){return function(n){return n.matches(t)}}var Ht=Array.prototype.find;function Xt(){return this.firstElementChild}var Gt=Array.prototype.filter;function Vt(){return Array.from(this.children)}function Wt(t){return new Array(t.length)}function Zt(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function Kt(t,n,e,r,i,o){for(var a,u=0,c=n.length,f=o.length;u<f;++u)(a=n[u])?(a.__data__=o[u],r[u]=a):e[u]=new Zt(t,o[u]);for(;u<c;++u)(a=n[u])&&(i[u]=a)}function Qt(t,n,e,r,i,o,a){var u,c,f,s=new Map,l=n.length,h=o.length,d=new Array(l);for(u=0;u<l;++u)(c=n[u])&&(d[u]=f=a.call(c,c.__data__,u,n)+"",s.has(f)?i[u]=c:s.set(f,c));for(u=0;u<h;++u)f=a.call(t,o[u],u,o)+"",(c=s.get(f))?(r[u]=c,c.__data__=o[u],s.delete(f)):e[u]=new Zt(t,o[u]);for(u=0;u<l;++u)(c=n[u])&&s.get(d[u])===c&&(i[u]=c)}function Jt(t){return t.__data__}function tn(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function nn(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function en(t){return function(){this.removeAttribute(t)}}function rn(t){return function(){this.removeAttributeNS(t.space,t.local)}}function on(t,n){return function(){this.setAttribute(t,n)}}function an(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function un(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function cn(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function fn(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function sn(t){return function(){this.style.removeProperty(t)}}function ln(t,n,e){return function(){this.style.setProperty(t,n,e)}}function hn(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function dn(t,n){return t.style.getPropertyValue(n)||fn(t).getComputedStyle(t,null).getPropertyValue(n)}function pn(t){return function(){delete this[t]}}function gn(t,n){return function(){this[t]=n}}function yn(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function vn(t){return t.trim().split(/^|\s+/)}function _n(t){return t.classList||new bn(t)}function bn(t){this._node=t,this._names=vn(t.getAttribute("class")||"")}function mn(t,n){for(var e=_n(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function xn(t,n){for(var e=_n(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function wn(t){return function(){mn(this,t)}}function Mn(t){return function(){xn(this,t)}}function An(t,n){return function(){(n.apply(this,arguments)?mn:xn)(this,t)}}function Tn(){this.textContent=""}function Sn(t){return function(){this.textContent=t}}function En(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function Nn(){this.innerHTML=""}function kn(t){return function(){this.innerHTML=t}}function Cn(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function Pn(){this.nextSibling&&this.parentNode.appendChild(this)}function zn(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function $n(){return null}function Dn(){var t=this.parentNode;t&&t.removeChild(this)}function Rn(){var t=this.cloneNode(!1),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function Fn(){var t=this.cloneNode(!0),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function qn(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.options);++i?n.length=i:delete this.__on}}}function In(t,n,e){return function(){var r,i=this.__on,o=function(t){return function(n){t.call(this,n,this.__data__)}}(n);if(i)for(var a=0,u=i.length;a<u;++a)if((r=i[a]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=e),void(r.value=n);this.addEventListener(t.type,o,e),r={type:t.type,name:t.name,value:n,listener:o,options:e},i?i.push(r):this.__on=[r]}}function Un(t,n,e){var r=fn(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function On(t,n){return function(){return Un(this,t,n)}}function Bn(t,n){return function(){return Un(this,t,n.apply(this,arguments))}}Zt.prototype={constructor:Zt,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},bn.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var Yn=[null];function Ln(t,n){this._groups=t,this._parents=n}function jn(){return new Ln([[document.documentElement]],Yn)}function Hn(t){return"string"==typeof t?new Ln([[document.querySelector(t)]],[document.documentElement]):new Ln([[t]],Yn)}Ln.prototype=jn.prototype={constructor:Ln,select:function(t){"function"!=typeof t&&(t=Ut(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a,u=n[i],c=u.length,f=r[i]=new Array(c),s=0;s<c;++s)(o=u[s])&&(a=t.call(o,o.__data__,s,u))&&("__data__"in o&&(a.__data__=o.__data__),f[s]=a);return new Ln(r,this._parents)},selectAll:function(t){t="function"==typeof t?function(t){return function(){return Ot(t.apply(this,arguments))}}(t):Yt(t);for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var a,u=n[o],c=u.length,f=0;f<c;++f)(a=u[f])&&(r.push(t.call(a,a.__data__,f,u)),i.push(a));return new Ln(r,i)},selectChild:function(t){return this.select(null==t?Xt:function(t){return function(){return Ht.call(this.children,t)}}("function"==typeof t?t:jt(t)))},selectChildren:function(t){return this.selectAll(null==t?Vt:function(t){return function(){return Gt.call(this.children,t)}}("function"==typeof t?t:jt(t)))},filter:function(t){"function"!=typeof t&&(t=Lt(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,c=r[i]=[],f=0;f<u;++f)(o=a[f])&&t.call(o,o.__data__,f,a)&&c.push(o);return new Ln(r,this._parents)},data:function(t,n){if(!arguments.length)return Array.from(this,Jt);var e=n?Qt:Kt,r=this._parents,i=this._groups;"function"!=typeof t&&(t=function(t){return function(){return t}}(t));for(var o=i.length,a=new Array(o),u=new Array(o),c=new Array(o),f=0;f<o;++f){var s=r[f],l=i[f],h=l.length,d=tn(t.call(s,s&&s.__data__,f,r)),p=d.length,g=u[f]=new Array(p),y=a[f]=new Array(p);e(s,l,g,y,c[f]=new Array(h),d,n);for(var v,_,b=0,m=0;b<p;++b)if(v=g[b]){for(b>=m&&(m=b+1);!(_=y[m])&&++m<p;);v._next=_||null}}return(a=new Ln(a,r))._enter=u,a._exit=c,a},enter:function(){return new Ln(this._enter||this._groups.map(Wt),this._parents)},exit:function(){return new Ln(this._exit||this._groups.map(Wt),this._parents)},join:function(t,n,e){var r=this.enter(),i=this,o=this.exit();return"function"==typeof t?(r=t(r))&&(r=r.selection()):r=r.append(t+""),null!=n&&(i=n(i))&&(i=i.selection()),null==e?o.remove():e(o),r&&i?r.merge(i).order():i},merge:function(t){for(var n=t.selection?t.selection():t,e=this._groups,r=n._groups,i=e.length,o=r.length,a=Math.min(i,o),u=new Array(i),c=0;c<a;++c)for(var f,s=e[c],l=r[c],h=s.length,d=u[c]=new Array(h),p=0;p<h;++p)(f=s[p]||l[p])&&(d[p]=f);for(;c<i;++c)u[c]=e[c];return new Ln(u,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,a=i[o];--o>=0;)(r=i[o])&&(a&&4^r.compareDocumentPosition(a)&&a.parentNode.insertBefore(r,a),a=r);return this},sort:function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=nn);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var a,u=e[o],c=u.length,f=i[o]=new Array(c),s=0;s<c;++s)(a=u[s])&&(f[s]=a);f.sort(n)}return new Ln(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var a=r[i];if(a)return a}return null},size:function(){let t=0;for(const n of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],a=0,u=o.length;a<u;++a)(i=o[a])&&t.call(i,i.__data__,a,o);return this},attr:function(t,n){var e=Dt(t);if(arguments.length<2){var r=this.node();return e.local?r.getAttributeNS(e.space,e.local):r.getAttribute(e)}return this.each((null==n?e.local?rn:en:"function"==typeof n?e.local?cn:un:e.local?an:on)(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?sn:"function"==typeof n?hn:ln)(t,n,null==e?"":e)):dn(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?pn:"function"==typeof n?yn:gn)(t,n)):this.node()[t]},classed:function(t,n){var e=vn(t+"");if(arguments.length<2){for(var r=_n(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?An:n?wn:Mn)(e,n))},text:function(t){return arguments.length?this.each(null==t?Tn:("function"==typeof t?En:Sn)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?Nn:("function"==typeof t?Cn:kn)(t)):this.node().innerHTML},raise:function(){return this.each(Pn)},lower:function(){return this.each(zn)},append:function(t){var n="function"==typeof t?t:qt(t);return this.select(function(){return this.appendChild(n.apply(this,arguments))})},insert:function(t,n){var e="function"==typeof t?t:qt(t),r=null==n?$n:"function"==typeof n?n:Ut(n);return this.select(function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)})},remove:function(){return this.each(Dn)},clone:function(t){return this.select(t?Fn:Rn)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=function(t){return t.trim().split(/^|\s+/).map(function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}})}(t+""),a=o.length;if(!(arguments.length<2)){for(u=n?In:qn,r=0;r<a;++r)this.each(u(o[r],n,e));return this}var u=this.node().__on;if(u)for(var c,f=0,s=u.length;f<s;++f)for(r=0,c=u[f];r<a;++r)if((i=o[r]).type===c.type&&i.name===c.name)return c.value},dispatch:function(t,n){return this.each(("function"==typeof n?Bn:On)(t,n))},[Symbol.iterator]:function*(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r,i=t[n],o=0,a=i.length;o<a;++o)(r=i[o])&&(yield r)}};var Xn=0;function Gn(){return new Vn}function Vn(){this._="@"+(++Xn).toString(36)}function Wn(t){let n;for(;n=t.sourceEvent;)t=n;return t}function Zn(t,n){if(t=Wn(t),void 0===n&&(n=t.currentTarget),n){var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(n.getScreenCTM().inverse())).x,r.y]}if(n.getBoundingClientRect){var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}}return[t.pageX,t.pageY]}Vn.prototype=Gn.prototype={constructor:Vn,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}};const Kn={passive:!1},Qn={capture:!0,passive:!1};function Jn(t){t.stopImmediatePropagation()}function te(t){t.preventDefault(),t.stopImmediatePropagation()}function ne(t){var n=t.document.documentElement,e=Hn(t).on("dragstart.drag",te,Qn);"onselectstart"in n?e.on("selectstart.drag",te,Qn):(n.__noselect=n.style.MozUserSelect,n.style.MozUserSelect="none")}function ee(t,n){var e=t.document.documentElement,r=Hn(t).on("dragstart.drag",null);n&&(r.on("click.drag",te,Qn),setTimeout(function(){r.on("click.drag",null)},0)),"onselectstart"in e?r.on("selectstart.drag",null):(e.style.MozUserSelect=e.__noselect,delete e.__noselect)}var re=t=>()=>t;function ie(t,{sourceEvent:n,subject:e,target:r,identifier:i,active:o,x:a,y:u,dx:c,dy:f,dispatch:s}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},subject:{value:e,enumerable:!0,configurable:!0},target:{value:r,enumerable:!0,configurable:!0},identifier:{value:i,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:u,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:f,enumerable:!0,configurable:!0},_:{value:s}})}function oe(t){return!t.ctrlKey&&!t.button}function ae(){return this.parentNode}function ue(t,n){return null==n?{x:t.x,y:t.y}:n}function ce(){return navigator.maxTouchPoints||"ontouchstart"in this}function fe(t,n,e){t.prototype=n.prototype=e,e.constructor=t}function se(t,n){var e=Object.create(t.prototype);for(var r in n)e[r]=n[r];return e}function le(){}ie.prototype.on=function(){var t=this._.on.apply(this._,arguments);return t===this._?this:t};var he=.7,de=1/he,pe="\\s*([+-]?\\d+)\\s*",ge="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",ye="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",ve=/^#([0-9a-f]{3,8})$/,_e=new RegExp(`^rgb\\(${pe},${pe},${pe}\\)$`),be=new RegExp(`^rgb\\(${ye},${ye},${ye}\\)$`),me=new RegExp(`^rgba\\(${pe},${pe},${pe},${ge}\\)$`),xe=new RegExp(`^rgba\\(${ye},${ye},${ye},${ge}\\)$`),we=new RegExp(`^hsl\\(${ge},${ye},${ye}\\)$`),Me=new RegExp(`^hsla\\(${ge},${ye},${ye},${ge}\\)$`),Ae={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function Te(){return this.rgb().formatHex()}function Se(){return this.rgb().formatRgb()}function Ee(t){var n,e;return t=(t+"").trim().toLowerCase(),(n=ve.exec(t))?(e=n[1].length,n=parseInt(n[1],16),6===e?Ne(n):3===e?new ze(n>>8&15|n>>4&240,n>>4&15|240&n,(15&n)<<4|15&n,1):8===e?ke(n>>24&255,n>>16&255,n>>8&255,(255&n)/255):4===e?ke(n>>12&15|n>>8&240,n>>8&15|n>>4&240,n>>4&15|240&n,((15&n)<<4|15&n)/255):null):(n=_e.exec(t))?new ze(n[1],n[2],n[3],1):(n=be.exec(t))?new ze(255*n[1]/100,255*n[2]/100,255*n[3]/100,1):(n=me.exec(t))?ke(n[1],n[2],n[3],n[4]):(n=xe.exec(t))?ke(255*n[1]/100,255*n[2]/100,255*n[3]/100,n[4]):(n=we.exec(t))?Ie(n[1],n[2]/100,n[3]/100,1):(n=Me.exec(t))?Ie(n[1],n[2]/100,n[3]/100,n[4]):Ae.hasOwnProperty(t)?Ne(Ae[t]):"transparent"===t?new ze(NaN,NaN,NaN,0):null}function Ne(t){return new ze(t>>16&255,t>>8&255,255&t,1)}function ke(t,n,e,r){return r<=0&&(t=n=e=NaN),new ze(t,n,e,r)}function Ce(t){return t instanceof le||(t=Ee(t)),t?new ze((t=t.rgb()).r,t.g,t.b,t.opacity):new ze}function Pe(t,n,e,r){return 1===arguments.length?Ce(t):new ze(t,n,e,null==r?1:r)}function ze(t,n,e,r){this.r=+t,this.g=+n,this.b=+e,this.opacity=+r}function $e(){return`#${qe(this.r)}${qe(this.g)}${qe(this.b)}`}function De(){const t=Re(this.opacity);return`${1===t?"rgb(":"rgba("}${Fe(this.r)}, ${Fe(this.g)}, ${Fe(this.b)}${1===t?")":`, ${t})`}`}function Re(t){return isNaN(t)?1:Math.max(0,Math.min(1,t))}function Fe(t){return Math.max(0,Math.min(255,Math.round(t)||0))}function qe(t){return((t=Fe(t))<16?"0":"")+t.toString(16)}function Ie(t,n,e,r){return r<=0?t=n=e=NaN:e<=0||e>=1?t=n=NaN:n<=0&&(t=NaN),new Be(t,n,e,r)}function Ue(t){if(t instanceof Be)return new Be(t.h,t.s,t.l,t.opacity);if(t instanceof le||(t=Ee(t)),!t)return new Be;if(t instanceof Be)return t;var n=(t=t.rgb()).r/255,e=t.g/255,r=t.b/255,i=Math.min(n,e,r),o=Math.max(n,e,r),a=NaN,u=o-i,c=(o+i)/2;return u?(a=n===o?(e-r)/u+6*(e<r):e===o?(r-n)/u+2:(n-e)/u+4,u/=c<.5?o+i:2-o-i,a*=60):u=c>0&&c<1?0:a,new Be(a,u,c,t.opacity)}function Oe(t,n,e,r){return 1===arguments.length?Ue(t):new Be(t,n,e,null==r?1:r)}function Be(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Ye(t){return(t=(t||0)%360)<0?t+360:t}function Le(t){return Math.max(0,Math.min(1,t||0))}function je(t,n,e){return 255*(t<60?n+(e-n)*t/60:t<180?e:t<240?n+(e-n)*(240-t)/60:n)}fe(le,Ee,{copy(t){return Object.assign(new this.constructor,this,t)},displayable(){return this.rgb().displayable()},hex:Te,formatHex:Te,formatHex8:function(){return this.rgb().formatHex8()},formatHsl:function(){return Ue(this).formatHsl()},formatRgb:Se,toString:Se}),fe(ze,Pe,se(le,{brighter(t){return t=null==t?de:Math.pow(de,t),new ze(this.r*t,this.g*t,this.b*t,this.opacity)},darker(t){return t=null==t?he:Math.pow(he,t),new ze(this.r*t,this.g*t,this.b*t,this.opacity)},rgb(){return this},clamp(){return new ze(Fe(this.r),Fe(this.g),Fe(this.b),Re(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:$e,formatHex:$e,formatHex8:function(){return`#${qe(this.r)}${qe(this.g)}${qe(this.b)}${qe(255*(isNaN(this.opacity)?1:this.opacity))}`},formatRgb:De,toString:De})),fe(Be,Oe,se(le,{brighter(t){return t=null==t?de:Math.pow(de,t),new Be(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?he:Math.pow(he,t),new Be(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=this.h%360+360*(this.h<0),n=isNaN(t)||isNaN(this.s)?0:this.s,e=this.l,r=e+(e<.5?e:1-e)*n,i=2*e-r;return new ze(je(t>=240?t-240:t+120,i,r),je(t,i,r),je(t<120?t+240:t-120,i,r),this.opacity)},clamp(){return new Be(Ye(this.h),Le(this.s),Le(this.l),Re(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){const t=Re(this.opacity);return`${1===t?"hsl(":"hsla("}${Ye(this.h)}, ${100*Le(this.s)}%, ${100*Le(this.l)}%${1===t?")":`, ${t})`}`}}));const He=Math.PI/180,Xe=180/Math.PI,Ge=.96422,Ve=.82521,We=4/29,Ze=6/29,Ke=3*Ze*Ze,Qe=Ze*Ze*Ze;function Je(t){if(t instanceof nr)return new nr(t.l,t.a,t.b,t.opacity);if(t instanceof cr)return fr(t);t instanceof ze||(t=Ce(t));var n,e,r=or(t.r),i=or(t.g),o=or(t.b),a=er((.2225045*r+.7168786*i+.0606169*o)/1);return r===i&&i===o?n=e=a:(n=er((.4360747*r+.3850649*i+.1430804*o)/Ge),e=er((.0139322*r+.0971045*i+.7141733*o)/Ve)),new nr(116*a-16,500*(n-a),200*(a-e),t.opacity)}function tr(t,n,e,r){return 1===arguments.length?Je(t):new nr(t,n,e,null==r?1:r)}function nr(t,n,e,r){this.l=+t,this.a=+n,this.b=+e,this.opacity=+r}function er(t){return t>Qe?Math.pow(t,1/3):t/Ke+We}function rr(t){return t>Ze?t*t*t:Ke*(t-We)}function ir(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function or(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function ar(t){if(t instanceof cr)return new cr(t.h,t.c,t.l,t.opacity);if(t instanceof nr||(t=Je(t)),0===t.a&&0===t.b)return new cr(NaN,0<t.l&&t.l<100?0:NaN,t.l,t.opacity);var n=Math.atan2(t.b,t.a)*Xe;return new cr(n<0?n+360:n,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function ur(t,n,e,r){return 1===arguments.length?ar(t):new cr(t,n,e,null==r?1:r)}function cr(t,n,e,r){this.h=+t,this.c=+n,this.l=+e,this.opacity=+r}function fr(t){if(isNaN(t.h))return new nr(t.l,0,0,t.opacity);var n=t.h*He;return new nr(t.l,Math.cos(n)*t.c,Math.sin(n)*t.c,t.opacity)}fe(nr,tr,se(le,{brighter(t){return new nr(this.l+18*(null==t?1:t),this.a,this.b,this.opacity)},darker(t){return new nr(this.l-18*(null==t?1:t),this.a,this.b,this.opacity)},rgb(){var t=(this.l+16)/116,n=isNaN(this.a)?t:t+this.a/500,e=isNaN(this.b)?t:t-this.b/200;return new ze(ir(3.1338561*(n=Ge*rr(n))-1.6168667*(t=1*rr(t))-.4906146*(e=Ve*rr(e))),ir(-.9787684*n+1.9161415*t+.033454*e),ir(.0719453*n-.2289914*t+1.4052427*e),this.opacity)}})),fe(cr,ur,se(le,{brighter(t){return new cr(this.h,this.c,this.l+18*(null==t?1:t),this.opacity)},darker(t){return new cr(this.h,this.c,this.l-18*(null==t?1:t),this.opacity)},rgb(){return fr(this).rgb()}}));var sr=-.14861,lr=1.78277,hr=-.29227,dr=-.90649,pr=1.97294,gr=pr*dr,yr=pr*lr,vr=lr*hr-dr*sr;function _r(t,n,e,r){return 1===arguments.length?function(t){if(t instanceof br)return new br(t.h,t.s,t.l,t.opacity);t instanceof ze||(t=Ce(t));var n=t.r/255,e=t.g/255,r=t.b/255,i=(vr*r+gr*n-yr*e)/(vr+gr-yr),o=r-i,a=(pr*(e-i)-hr*o)/dr,u=Math.sqrt(a*a+o*o)/(pr*i*(1-i)),c=u?Math.atan2(a,o)*Xe-120:NaN;return new br(c<0?c+360:c,u,i,t.opacity)}(t):new br(t,n,e,null==r?1:r)}function br(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function mr(t,n,e,r,i){var o=t*t,a=o*t;return((1-3*t+3*o-a)*n+(4-6*o+3*a)*e+(1+3*t+3*o-3*a)*r+a*i)/6}function xr(t){var n=t.length-1;return function(e){var r=e<=0?e=0:e>=1?(e=1,n-1):Math.floor(e*n),i=t[r],o=t[r+1],a=r>0?t[r-1]:2*i-o,u=r<n-1?t[r+2]:2*o-i;return mr((e-r/n)*n,a,i,o,u)}}function wr(t){var n=t.length;return function(e){var r=Math.floor(((e%=1)<0?++e:e)*n),i=t[(r+n-1)%n],o=t[r%n],a=t[(r+1)%n],u=t[(r+2)%n];return mr((e-r/n)*n,i,o,a,u)}}fe(br,_r,se(le,{brighter(t){return t=null==t?de:Math.pow(de,t),new br(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?he:Math.pow(he,t),new br(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=isNaN(this.h)?0:(this.h+120)*He,n=+this.l,e=isNaN(this.s)?0:this.s*n*(1-n),r=Math.cos(t),i=Math.sin(t);return new ze(255*(n+e*(sr*r+lr*i)),255*(n+e*(hr*r+dr*i)),255*(n+e*(pr*r)),this.opacity)}}));var Mr=t=>()=>t;function Ar(t,n){return function(e){return t+e*n}}function Tr(t,n){var e=n-t;return e?Ar(t,e>180||e<-180?e-360*Math.round(e/360):e):Mr(isNaN(t)?n:t)}function Sr(t){return 1===(t=+t)?Er:function(n,e){return e-n?function(t,n,e){return t=Math.pow(t,e),n=Math.pow(n,e)-t,e=1/e,function(r){return Math.pow(t+r*n,e)}}(n,e,t):Mr(isNaN(n)?e:n)}}function Er(t,n){var e=n-t;return e?Ar(t,e):Mr(isNaN(t)?n:t)}var Nr=function t(n){var e=Sr(n);function r(t,n){var r=e((t=Pe(t)).r,(n=Pe(n)).r),i=e(t.g,n.g),o=e(t.b,n.b),a=Er(t.opacity,n.opacity);return function(n){return t.r=r(n),t.g=i(n),t.b=o(n),t.opacity=a(n),t+""}}return r.gamma=t,r}(1);function kr(t){return function(n){var e,r,i=n.length,o=new Array(i),a=new Array(i),u=new Array(i);for(e=0;e<i;++e)r=Pe(n[e]),o[e]=r.r||0,a[e]=r.g||0,u[e]=r.b||0;return o=t(o),a=t(a),u=t(u),r.opacity=1,function(t){return r.r=o(t),r.g=a(t),r.b=u(t),r+""}}}var Cr=kr(xr),Pr=kr(wr);function zr(t,n){n||(n=[]);var e,r=t?Math.min(n.length,t.length):0,i=n.slice();return function(o){for(e=0;e<r;++e)i[e]=t[e]*(1-o)+n[e]*o;return i}}function $r(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Dr(t,n){var e,r=n?n.length:0,i=t?Math.min(r,t.length):0,o=new Array(i),a=new Array(r);for(e=0;e<i;++e)o[e]=Br(t[e],n[e]);for(;e<r;++e)a[e]=n[e];return function(t){for(e=0;e<i;++e)a[e]=o[e](t);return a}}function Rr(t,n){var e=new Date;return t=+t,n=+n,function(r){return e.setTime(t*(1-r)+n*r),e}}function Fr(t,n){return t=+t,n=+n,function(e){return t*(1-e)+n*e}}function qr(t,n){var e,r={},i={};for(e in null!==t&&"object"==typeof t||(t={}),null!==n&&"object"==typeof n||(n={}),n)e in t?r[e]=Br(t[e],n[e]):i[e]=n[e];return function(t){for(e in r)i[e]=r[e](t);return i}}var Ir=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,Ur=new RegExp(Ir.source,"g");function Or(t,n){var e,r,i,o=Ir.lastIndex=Ur.lastIndex=0,a=-1,u=[],c=[];for(t+="",n+="";(e=Ir.exec(t))&&(r=Ur.exec(n));)(i=r.index)>o&&(i=n.slice(o,i),u[a]?u[a]+=i:u[++a]=i),(e=e[0])===(r=r[0])?u[a]?u[a]+=r:u[++a]=r:(u[++a]=null,c.push({i:a,x:Fr(e,r)})),o=Ur.lastIndex;return o<n.length&&(i=n.slice(o),u[a]?u[a]+=i:u[++a]=i),u.length<2?c[0]?function(t){return function(n){return t(n)+""}}(c[0].x):function(t){return function(){return t}}(n):(n=c.length,function(t){for(var e,r=0;r<n;++r)u[(e=c[r]).i]=e.x(t);return u.join("")})}function Br(t,n){var e,r=typeof n;return null==n||"boolean"===r?Mr(n):("number"===r?Fr:"string"===r?(e=Ee(n))?(n=e,Nr):Or:n instanceof Ee?Nr:n instanceof Date?Rr:$r(n)?zr:Array.isArray(n)?Dr:"function"!=typeof n.valueOf&&"function"!=typeof n.toString||isNaN(n)?qr:Fr)(t,n)}function Yr(t,n){return t=+t,n=+n,function(e){return Math.round(t*(1-e)+n*e)}}var Lr,jr=180/Math.PI,Hr={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Xr(t,n,e,r,i,o){var a,u,c;return(a=Math.sqrt(t*t+n*n))&&(t/=a,n/=a),(c=t*e+n*r)&&(e-=t*c,r-=n*c),(u=Math.sqrt(e*e+r*r))&&(e/=u,r/=u,c/=u),t*r<n*e&&(t=-t,n=-n,c=-c,a=-a),{translateX:i,translateY:o,rotate:Math.atan2(n,t)*jr,skewX:Math.atan(c)*jr,scaleX:a,scaleY:u}}function Gr(t,n,e,r){function i(t){return t.length?t.pop()+" ":""}return function(o,a){var u=[],c=[];return o=t(o),a=t(a),function(t,r,i,o,a,u){if(t!==i||r!==o){var c=a.push("translate(",null,n,null,e);u.push({i:c-4,x:Fr(t,i)},{i:c-2,x:Fr(r,o)})}else(i||o)&&a.push("translate("+i+n+o+e)}(o.translateX,o.translateY,a.translateX,a.translateY,u,c),function(t,n,e,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:e.push(i(e)+"rotate(",null,r)-2,x:Fr(t,n)})):n&&e.push(i(e)+"rotate("+n+r)}(o.rotate,a.rotate,u,c),function(t,n,e,o){t!==n?o.push({i:e.push(i(e)+"skewX(",null,r)-2,x:Fr(t,n)}):n&&e.push(i(e)+"skewX("+n+r)}(o.skewX,a.skewX,u,c),function(t,n,e,r,o,a){if(t!==e||n!==r){var u=o.push(i(o)+"scale(",null,",",null,")");a.push({i:u-4,x:Fr(t,e)},{i:u-2,x:Fr(n,r)})}else 1===e&&1===r||o.push(i(o)+"scale("+e+","+r+")")}(o.scaleX,o.scaleY,a.scaleX,a.scaleY,u,c),o=a=null,function(t){for(var n,e=-1,r=c.length;++e<r;)u[(n=c[e]).i]=n.x(t);return u.join("")}}}var Vr=Gr(function(t){const n=new("function"==typeof DOMMatrix?DOMMatrix:WebKitCSSMatrix)(t+"");return n.isIdentity?Hr:Xr(n.a,n.b,n.c,n.d,n.e,n.f)},"px, ","px)","deg)"),Wr=Gr(function(t){return null==t?Hr:(Lr||(Lr=document.createElementNS("http://www.w3.org/2000/svg","g")),Lr.setAttribute("transform",t),(t=Lr.transform.baseVal.consolidate())?Xr((t=t.matrix).a,t.b,t.c,t.d,t.e,t.f):Hr)},", ",")",")");function Zr(t){return((t=Math.exp(t))+1/t)/2}var Kr=function t(n,e,r){function i(t,i){var o,a,u=t[0],c=t[1],f=t[2],s=i[0],l=i[1],h=i[2],d=s-u,p=l-c,g=d*d+p*p;if(g<1e-12)a=Math.log(h/f)/n,o=function(t){return[u+t*d,c+t*p,f*Math.exp(n*t*a)]};else{var y=Math.sqrt(g),v=(h*h-f*f+r*g)/(2*f*e*y),_=(h*h-f*f-r*g)/(2*h*e*y),b=Math.log(Math.sqrt(v*v+1)-v),m=Math.log(Math.sqrt(_*_+1)-_);a=(m-b)/n,o=function(t){var r=t*a,i=Zr(b),o=f/(e*y)*(i*function(t){return((t=Math.exp(2*t))-1)/(t+1)}(n*r+b)-function(t){return((t=Math.exp(t))-1/t)/2}(b));return[u+o*d,c+o*p,f*i/Zr(n*r+b)]}}return o.duration=1e3*Math.abs(a)*n/Math.SQRT2,o}return i.rho=function(n){var e=Math.max(.001,+n),r=e*e;return t(e,r,r*r)},i}(Math.SQRT2,2,4);function Qr(t){return function(n,e){var r=t((n=Oe(n)).h,(e=Oe(e)).h),i=Er(n.s,e.s),o=Er(n.l,e.l),a=Er(n.opacity,e.opacity);return function(t){return n.h=r(t),n.s=i(t),n.l=o(t),n.opacity=a(t),n+""}}}var Jr=Qr(Tr),ti=Qr(Er);function ni(t){return function(n,e){var r=t((n=ur(n)).h,(e=ur(e)).h),i=Er(n.c,e.c),o=Er(n.l,e.l),a=Er(n.opacity,e.opacity);return function(t){return n.h=r(t),n.c=i(t),n.l=o(t),n.opacity=a(t),n+""}}}var ei=ni(Tr),ri=ni(Er);function ii(t){return function n(e){function r(n,r){var i=t((n=_r(n)).h,(r=_r(r)).h),o=Er(n.s,r.s),a=Er(n.l,r.l),u=Er(n.opacity,r.opacity);return function(t){return n.h=i(t),n.s=o(t),n.l=a(Math.pow(t,e)),n.opacity=u(t),n+""}}return e=+e,r.gamma=n,r}(1)}var oi=ii(Tr),ai=ii(Er);function ui(t,n){void 0===n&&(n=t,t=Br);for(var e=0,r=n.length-1,i=n[0],o=new Array(r<0?0:r);e<r;)o[e]=t(i,i=n[++e]);return function(t){var n=Math.max(0,Math.min(r-1,Math.floor(t*=r)));return o[n](t-n)}}var ci,fi,si=0,li=0,hi=0,di=0,pi=0,gi=0,yi="object"==typeof performance&&performance.now?performance:Date,vi="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function _i(){return pi||(vi(bi),pi=yi.now()+gi)}function bi(){pi=0}function mi(){this._call=this._time=this._next=null}function xi(t,n,e){var r=new mi;return r.restart(t,n,e),r}function wi(){_i(),++si;for(var t,n=ci;n;)(t=pi-n._time)>=0&&n._call.call(void 0,t),n=n._next;--si}function Mi(){pi=(di=yi.now())+gi,si=li=0;try{wi()}finally{si=0,function(){var t,n,e=ci,r=1/0;for(;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(n=e._next,e._next=null,e=t?t._next=n:ci=n);fi=t,Ti(r)}(),pi=0}}function Ai(){var t=yi.now(),n=t-di;n>1e3&&(gi-=n,di=t)}function Ti(t){si||(li&&(li=clearTimeout(li)),t-pi>24?(t<1/0&&(li=setTimeout(Mi,Math.ceil(t-yi.now()-gi)+1)),hi&&(hi=clearInterval(hi))):(hi||(di=yi.now(),hi=setInterval(Ai,1e3)),si=1,vi(Mi)))}function Si(t,n,e){var r=new mi;return n=null==n?0:+n,r.restart(e=>{r.stop(),t(e+n)},n,e),r}mi.prototype=xi.prototype={constructor:mi,restart:function(t,n,e){if("function"!=typeof t)throw new TypeError("callback is not a function");e=(null==e?_i():+e)+(null==n?0:+n),this._next||fi===this||(fi?fi._next=this:ci=this,fi=this),this._call=t,this._time=e,Ti()},stop:function(){this._call&&(this._call=null,this._time=1/0,Ti())}};function Ei(t){return((t*=2)<=1?t*t:--t*(2-t)+1)/2}function Ni(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}var ki=function t(n){function e(t){return Math.pow(t,n)}return n=+n,e.exponent=t,e}(3),Ci=function t(n){function e(t){return 1-Math.pow(1-t,n)}return n=+n,e.exponent=t,e}(3),Pi=function t(n){function e(t){return((t*=2)<=1?Math.pow(t,n):2-Math.pow(2-t,n))/2}return n=+n,e.exponent=t,e}(3),zi=Math.PI,$i=zi/2;function Di(t){return(1-Math.cos(zi*t))/2}function Ri(t){return 1.0009775171065494*(Math.pow(2,-10*t)-.0009765625)}function Fi(t){return((t*=2)<=1?Ri(1-t):2-Ri(t-1))/2}function qi(t){return((t*=2)<=1?1-Math.sqrt(1-t*t):Math.sqrt(1-(t-=2)*t)+1)/2}var Ii=4/11,Ui=6/11,Oi=8/11,Bi=9/11,Yi=10/11,Li=21/22,ji=7.5625;function Hi(t){return(t=+t)<Ii?ji*t*t:t<Oi?ji*(t-=Ui)*t+.75:t<Yi?ji*(t-=Bi)*t+.9375:ji*(t-=Li)*t+.984375}var Xi=1.70158,Gi=function t(n){function e(t){return(t=+t)*t*(n*(t-1)+t)}return n=+n,e.overshoot=t,e}(Xi),Vi=function t(n){function e(t){return--t*t*((t+1)*n+t)+1}return n=+n,e.overshoot=t,e}(Xi),Wi=function t(n){function e(t){return((t*=2)<1?t*t*((n+1)*t-n):(t-=2)*t*((n+1)*t+n)+2)/2}return n=+n,e.overshoot=t,e}(Xi),Zi=2*Math.PI,Ki=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=Zi);function i(t){return n*Ri(- --t)*Math.sin((r-t)/e)}return i.amplitude=function(n){return t(n,e*Zi)},i.period=function(e){return t(n,e)},i}(1,.3),Qi=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=Zi);function i(t){return 1-n*Ri(t=+t)*Math.sin((t+r)/e)}return i.amplitude=function(n){return t(n,e*Zi)},i.period=function(e){return t(n,e)},i}(1,.3),Ji=function t(n,e){var r=Math.asin(1/(n=Math.max(1,n)))*(e/=Zi);function i(t){return((t=2*t-1)<0?n*Ri(-t)*Math.sin((r-t)/e):2-n*Ri(t)*Math.sin((r+t)/e))/2}return i.amplitude=function(n){return t(n,e*Zi)},i.period=function(e){return t(n,e)},i}(1,.3),to=Nt("start","end","cancel","interrupt"),no=[];function eo(t,n,e,r,i,o){var a=t.__transition;if(a){if(e in a)return}else t.__transition={};!function(t,n,e){var r,i=t.__transition;function o(t){e.state=1,e.timer.restart(a,e.delay,e.time),e.delay<=t&&a(t-e.delay)}function a(o){var f,s,l,h;if(1!==e.state)return c();for(f in i)if((h=i[f]).name===e.name){if(3===h.state)return Si(a);4===h.state?(h.state=6,h.timer.stop(),h.on.call("interrupt",t,t.__data__,h.index,h.group),delete i[f]):+f<n&&(h.state=6,h.timer.stop(),h.on.call("cancel",t,t.__data__,h.index,h.group),delete i[f])}if(Si(function(){3===e.state&&(e.state=4,e.timer.restart(u,e.delay,e.time),u(o))}),e.state=2,e.on.call("start",t,t.__data__,e.index,e.group),2===e.state){for(e.state=3,r=new Array(l=e.tween.length),f=0,s=-1;f<l;++f)(h=e.tween[f].value.call(t,t.__data__,e.index,e.group))&&(r[++s]=h);r.length=s+1}}function u(n){for(var i=n<e.duration?e.ease.call(null,n/e.duration):(e.timer.restart(c),e.state=5,1),o=-1,a=r.length;++o<a;)r[o].call(t,i);5===e.state&&(e.on.call("end",t,t.__data__,e.index,e.group),c())}function c(){for(var r in e.state=6,e.timer.stop(),delete i[n],i)return;delete t.__transition}i[n]=e,e.timer=xi(o,0,e.time)}(t,e,{name:n,index:r,group:i,on:to,tween:no,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:0})}function ro(t,n){var e=oo(t,n);if(e.state>0)throw new Error("too late; already scheduled");return e}function io(t,n){var e=oo(t,n);if(e.state>3)throw new Error("too late; already running");return e}function oo(t,n){var e=t.__transition;if(!e||!(e=e[n]))throw new Error("transition not found");return e}function ao(t,n){var e,r,i,o=t.__transition,a=!0;if(o){for(i in n=null==n?null:n+"",o)(e=o[i]).name===n?(r=e.state>2&&e.state<5,e.state=6,e.timer.stop(),e.on.call(r?"interrupt":"cancel",t,t.__data__,e.index,e.group),delete o[i]):a=!1;a&&delete t.__transition}}function uo(t,n){var e,r;return function(){var i=io(this,t),o=i.tween;if(o!==e)for(var a=0,u=(r=e=o).length;a<u;++a)if(r[a].name===n){(r=r.slice()).splice(a,1);break}i.tween=r}}function co(t,n,e){var r,i;if("function"!=typeof e)throw new Error;return function(){var o=io(this,t),a=o.tween;if(a!==r){i=(r=a).slice();for(var u={name:n,value:e},c=0,f=i.length;c<f;++c)if(i[c].name===n){i[c]=u;break}c===f&&i.push(u)}o.tween=i}}function fo(t,n,e){var r=t._id;return t.each(function(){var t=io(this,r);(t.value||(t.value={}))[n]=e.apply(this,arguments)}),function(t){return oo(t,r).value[n]}}function so(t,n){var e;return("number"==typeof n?Fr:n instanceof Ee?Nr:(e=Ee(n))?(n=e,Nr):Or)(t,n)}function lo(t){return function(){this.removeAttribute(t)}}function ho(t){return function(){this.removeAttributeNS(t.space,t.local)}}function po(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttribute(t);return a===o?null:a===r?i:i=n(r=a,e)}}function go(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttributeNS(t.space,t.local);return a===o?null:a===r?i:i=n(r=a,e)}}function yo(t,n,e){var r,i,o;return function(){var a,u,c=e(this);if(null!=c)return(a=this.getAttribute(t))===(u=c+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,c));this.removeAttribute(t)}}function vo(t,n,e){var r,i,o;return function(){var a,u,c=e(this);if(null!=c)return(a=this.getAttributeNS(t.space,t.local))===(u=c+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,c));this.removeAttributeNS(t.space,t.local)}}function _o(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttributeNS(t.space,t.local,n.call(this,e))}}(t,i)),e}return i._value=n,i}function bo(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttribute(t,n.call(this,e))}}(t,i)),e}return i._value=n,i}function mo(t,n){return function(){ro(this,t).delay=+n.apply(this,arguments)}}function xo(t,n){return n=+n,function(){ro(this,t).delay=n}}function wo(t,n){return function(){io(this,t).duration=+n.apply(this,arguments)}}function Mo(t,n){return n=+n,function(){io(this,t).duration=n}}var Ao=jn.prototype.constructor;function To(t){return function(){this.style.removeProperty(t)}}var So=0;function Eo(t,n,e,r){this._groups=t,this._parents=n,this._name=e,this._id=r}function No(t){return jn().transition(t)}function ko(){return++So}var Co=jn.prototype;Eo.prototype=No.prototype={constructor:Eo,select:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=Ut(t));for(var r=this._groups,i=r.length,o=new Array(i),a=0;a<i;++a)for(var u,c,f=r[a],s=f.length,l=o[a]=new Array(s),h=0;h<s;++h)(u=f[h])&&(c=t.call(u,u.__data__,h,f))&&("__data__"in u&&(c.__data__=u.__data__),l[h]=c,eo(l[h],n,e,h,l,oo(u,e)));return new Eo(o,this._parents,n,e)},selectAll:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=Yt(t));for(var r=this._groups,i=r.length,o=[],a=[],u=0;u<i;++u)for(var c,f=r[u],s=f.length,l=0;l<s;++l)if(c=f[l]){for(var h,d=t.call(c,c.__data__,l,f),p=oo(c,e),g=0,y=d.length;g<y;++g)(h=d[g])&&eo(h,n,e,g,d,p);o.push(d),a.push(c)}return new Eo(o,a,n,e)},selectChild:Co.selectChild,selectChildren:Co.selectChildren,filter:function(t){"function"!=typeof t&&(t=Lt(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,c=r[i]=[],f=0;f<u;++f)(o=a[f])&&t.call(o,o.__data__,f,a)&&c.push(o);return new Eo(r,this._parents,this._name,this._id)},merge:function(t){if(t._id!==this._id)throw new Error;for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),a=new Array(r),u=0;u<o;++u)for(var c,f=n[u],s=e[u],l=f.length,h=a[u]=new Array(l),d=0;d<l;++d)(c=f[d]||s[d])&&(h[d]=c);for(;u<r;++u)a[u]=n[u];return new Eo(a,this._parents,this._name,this._id)},selection:function(){return new Ao(this._groups,this._parents)},transition:function(){for(var t=this._name,n=this._id,e=ko(),r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],c=u.length,f=0;f<c;++f)if(a=u[f]){var s=oo(a,n);eo(a,t,e,f,u,{time:s.time+s.delay+s.duration,delay:0,duration:s.duration,ease:s.ease})}return new Eo(r,this._parents,t,e)},call:Co.call,nodes:Co.nodes,node:Co.node,size:Co.size,empty:Co.empty,each:Co.each,on:function(t,n){var e=this._id;return arguments.length<2?oo(this.node(),e).on.on(t):this.each(function(t,n,e){var r,i,o=function(t){return(t+"").trim().split(/^|\s+/).every(function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||"start"===t})}(n)?ro:io;return function(){var a=o(this,t),u=a.on;u!==r&&(i=(r=u).copy()).on(n,e),a.on=i}}(e,t,n))},attr:function(t,n){var e=Dt(t),r="transform"===e?Wr:so;return this.attrTween(t,"function"==typeof n?(e.local?vo:yo)(e,r,fo(this,"attr."+t,n)):null==n?(e.local?ho:lo)(e):(e.local?go:po)(e,r,n))},attrTween:function(t,n){var e="attr."+t;if(arguments.length<2)return(e=this.tween(e))&&e._value;if(null==n)return this.tween(e,null);if("function"!=typeof n)throw new Error;var r=Dt(t);return this.tween(e,(r.local?_o:bo)(r,n))},style:function(t,n,e){var r="transform"==(t+="")?Vr:so;return null==n?this.styleTween(t,function(t,n){var e,r,i;return function(){var o=dn(this,t),a=(this.style.removeProperty(t),dn(this,t));return o===a?null:o===e&&a===r?i:i=n(e=o,r=a)}}(t,r)).on("end.style."+t,To(t)):"function"==typeof n?this.styleTween(t,function(t,n,e){var r,i,o;return function(){var a=dn(this,t),u=e(this),c=u+"";return null==u&&(this.style.removeProperty(t),c=u=dn(this,t)),a===c?null:a===r&&c===i?o:(i=c,o=n(r=a,u))}}(t,r,fo(this,"style."+t,n))).each(function(t,n){var e,r,i,o,a="style."+n,u="end."+a;return function(){var c=io(this,t),f=c.on,s=null==c.value[a]?o||(o=To(n)):void 0;f===e&&i===s||(r=(e=f).copy()).on(u,i=s),c.on=r}}(this._id,t)):this.styleTween(t,function(t,n,e){var r,i,o=e+"";return function(){var a=dn(this,t);return a===o?null:a===r?i:i=n(r=a,e)}}(t,r,n),e).on("end.style."+t,null)},styleTween:function(t,n,e){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==n)return this.tween(r,null);if("function"!=typeof n)throw new Error;return this.tween(r,function(t,n,e){var r,i;function o(){var o=n.apply(this,arguments);return o!==i&&(r=(i=o)&&function(t,n,e){return function(r){this.style.setProperty(t,n.call(this,r),e)}}(t,o,e)),r}return o._value=n,o}(t,n,null==e?"":e))},text:function(t){return this.tween("text","function"==typeof t?function(t){return function(){var n=t(this);this.textContent=null==n?"":n}}(fo(this,"text",t)):function(t){return function(){this.textContent=t}}(null==t?"":t+""))},textTween:function(t){var n="text";if(arguments.length<1)return(n=this.tween(n))&&n._value;if(null==t)return this.tween(n,null);if("function"!=typeof t)throw new Error;return this.tween(n,function(t){var n,e;function r(){var r=t.apply(this,arguments);return r!==e&&(n=(e=r)&&function(t){return function(n){this.textContent=t.call(this,n)}}(r)),n}return r._value=t,r}(t))},remove:function(){return this.on("end.remove",function(t){return function(){var n=this.parentNode;for(var e in this.__transition)if(+e!==t)return;n&&n.removeChild(this)}}(this._id))},tween:function(t,n){var e=this._id;if(t+="",arguments.length<2){for(var r,i=oo(this.node(),e).tween,o=0,a=i.length;o<a;++o)if((r=i[o]).name===t)return r.value;return null}return this.each((null==n?uo:co)(e,t,n))},delay:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?mo:xo)(n,t)):oo(this.node(),n).delay},duration:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?wo:Mo)(n,t)):oo(this.node(),n).duration},ease:function(t){var n=this._id;return arguments.length?this.each(function(t,n){if("function"!=typeof n)throw new Error;return function(){io(this,t).ease=n}}(n,t)):oo(this.node(),n).ease},easeVarying:function(t){if("function"!=typeof t)throw new Error;return this.each(function(t,n){return function(){var e=n.apply(this,arguments);if("function"!=typeof e)throw new Error;io(this,t).ease=e}}(this._id,t))},end:function(){var t,n,e=this,r=e._id,i=e.size();return new Promise(function(o,a){var u={value:a},c={value:function(){0===--i&&o()}};e.each(function(){var e=io(this,r),i=e.on;i!==t&&((n=(t=i).copy())._.cancel.push(u),n._.interrupt.push(u),n._.end.push(c)),e.on=n}),0===i&&o()})},[Symbol.iterator]:Co[Symbol.iterator]};var Po={time:null,delay:0,duration:250,ease:Ni};function zo(t,n){for(var e;!(e=t.__transition)||!(e=e[n]);)if(!(t=t.parentNode))throw new Error(`transition ${n} not found`);return e}jn.prototype.interrupt=function(t){return this.each(function(){ao(this,t)})},jn.prototype.transition=function(t){var n,e;t instanceof Eo?(n=t._id,t=t._name):(n=ko(),(e=Po).time=_i(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],c=u.length,f=0;f<c;++f)(a=u[f])&&eo(a,t,n,f,u,e||zo(a,n));return new Eo(r,this._parents,t,n)};var $o=[null];var Do=t=>()=>t;function Ro(t,{sourceEvent:n,target:e,selection:r,mode:i,dispatch:o}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},target:{value:e,enumerable:!0,configurable:!0},selection:{value:r,enumerable:!0,configurable:!0},mode:{value:i,enumerable:!0,configurable:!0},_:{value:o}})}function Fo(t){t.preventDefault(),t.stopImmediatePropagation()}var qo={name:"drag"},Io={name:"space"},Uo={name:"handle"},Oo={name:"center"};const{abs:Bo,max:Yo,min:Lo}=Math;function jo(t){return[+t[0],+t[1]]}function Ho(t){return[jo(t[0]),jo(t[1])]}var Xo={name:"x",handles:["w","e"].map(ta),input:function(t,n){return null==t?null:[[+t[0],n[0][1]],[+t[1],n[1][1]]]},output:function(t){return t&&[t[0][0],t[1][0]]}},Go={name:"y",handles:["n","s"].map(ta),input:function(t,n){return null==t?null:[[n[0][0],+t[0]],[n[1][0],+t[1]]]},output:function(t){return t&&[t[0][1],t[1][1]]}},Vo={name:"xy",handles:["n","w","e","s","nw","ne","sw","se"].map(ta),input:function(t){return null==t?null:Ho(t)},output:function(t){return t}},Wo={overlay:"crosshair",selection:"move",n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},Zo={e:"w",w:"e",nw:"ne",ne:"nw",se:"sw",sw:"se"},Ko={n:"s",s:"n",nw:"sw",ne:"se",se:"ne",sw:"nw"},Qo={overlay:1,selection:1,n:null,e:1,s:null,w:-1,nw:-1,ne:1,se:1,sw:-1},Jo={overlay:1,selection:1,n:-1,e:null,s:1,w:null,nw:-1,ne:-1,se:1,sw:1};function ta(t){return{type:t}}function na(t){return!t.ctrlKey&&!t.button}function ea(){var t=this.ownerSVGElement||this;return t.hasAttribute("viewBox")?[[(t=t.viewBox.baseVal).x,t.y],[t.x+t.width,t.y+t.height]]:[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]}function ra(){return navigator.maxTouchPoints||"ontouchstart"in this}function ia(t){for(;!t.__brush;)if(!(t=t.parentNode))return;return t.__brush}function oa(t){var n,e=ea,r=na,i=ra,o=!0,a=Nt("start","brush","end"),u=6;function c(n){var e=n.property("__brush",g).selectAll(".overlay").data([ta("overlay")]);e.enter().append("rect").attr("class","overlay").attr("pointer-events","all").attr("cursor",Wo.overlay).merge(e).each(function(){var t=ia(this).extent;Hn(this).attr("x",t[0][0]).attr("y",t[0][1]).attr("width",t[1][0]-t[0][0]).attr("height",t[1][1]-t[0][1])}),n.selectAll(".selection").data([ta("selection")]).enter().append("rect").attr("class","selection").attr("cursor",Wo.selection).attr("fill","#777").attr("fill-opacity",.3).attr("stroke","#fff").attr("shape-rendering","crispEdges");var r=n.selectAll(".handle").data(t.handles,function(t){return t.type});r.exit().remove(),r.enter().append("rect").attr("class",function(t){return"handle handle--"+t.type}).attr("cursor",function(t){return Wo[t.type]}),n.each(f).attr("fill","none").attr("pointer-events","all").on("mousedown.brush",h).filter(i).on("touchstart.brush",h).on("touchmove.brush",d).on("touchend.brush touchcancel.brush",p).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function f(){var t=Hn(this),n=ia(this).selection;n?(t.selectAll(".selection").style("display",null).attr("x",n[0][0]).attr("y",n[0][1]).attr("width",n[1][0]-n[0][0]).attr("height",n[1][1]-n[0][1]),t.selectAll(".handle").style("display",null).attr("x",function(t){return"e"===t.type[t.type.length-1]?n[1][0]-u/2:n[0][0]-u/2}).attr("y",function(t){return"s"===t.type[0]?n[1][1]-u/2:n[0][1]-u/2}).attr("width",function(t){return"n"===t.type||"s"===t.type?n[1][0]-n[0][0]+u:u}).attr("height",function(t){return"e"===t.type||"w"===t.type?n[1][1]-n[0][1]+u:u})):t.selectAll(".selection,.handle").style("display","none").attr("x",null).attr("y",null).attr("width",null).attr("height",null)}function s(t,n,e){var r=t.__brush.emitter;return!r||e&&r.clean?new l(t,n,e):r}function l(t,n,e){this.that=t,this.args=n,this.state=t.__brush,this.active=0,this.clean=e}function h(e){if((!n||e.touches)&&r.apply(this,arguments)){var i,a,u,c,l,h,d,p,g,y,v,_=this,b=e.target.__data__.type,m="selection"===(o&&e.metaKey?b="overlay":b)?qo:o&&e.altKey?Oo:Uo,x=t===Go?null:Qo[b],w=t===Xo?null:Jo[b],M=ia(_),A=M.extent,T=M.selection,S=A[0][0],E=A[0][1],N=A[1][0],k=A[1][1],C=0,P=0,z=x&&w&&o&&e.shiftKey,$=Array.from(e.touches||[e],t=>{const n=t.identifier;return(t=Zn(t,_)).point0=t.slice(),t.identifier=n,t});ao(_);var D=s(_,arguments,!0).beforestart();if("overlay"===b){T&&(g=!0);const n=[$[0],$[1]||$[0]];M.selection=T=[[i=t===Go?S:Lo(n[0][0],n[1][0]),u=t===Xo?E:Lo(n[0][1],n[1][1])],[l=t===Go?N:Yo(n[0][0],n[1][0]),d=t===Xo?k:Yo(n[0][1],n[1][1])]],$.length>1&&U(e)}else i=T[0][0],u=T[0][1],l=T[1][0],d=T[1][1];a=i,c=u,h=l,p=d;var R=Hn(_).attr("pointer-events","none"),F=R.selectAll(".overlay").attr("cursor",Wo[b]);if(e.touches)D.moved=I,D.ended=O;else{var q=Hn(e.view).on("mousemove.brush",I,!0).on("mouseup.brush",O,!0);o&&q.on("keydown.brush",function(t){switch(t.keyCode){case 16:z=x&&w;break;case 18:m===Uo&&(x&&(l=h-C*x,i=a+C*x),w&&(d=p-P*w,u=c+P*w),m=Oo,U(t));break;case 32:m!==Uo&&m!==Oo||(x<0?l=h-C:x>0&&(i=a-C),w<0?d=p-P:w>0&&(u=c-P),m=Io,F.attr("cursor",Wo.selection),U(t));break;default:return}Fo(t)},!0).on("keyup.brush",function(t){switch(t.keyCode){case 16:z&&(y=v=z=!1,U(t));break;case 18:m===Oo&&(x<0?l=h:x>0&&(i=a),w<0?d=p:w>0&&(u=c),m=Uo,U(t));break;case 32:m===Io&&(t.altKey?(x&&(l=h-C*x,i=a+C*x),w&&(d=p-P*w,u=c+P*w),m=Oo):(x<0?l=h:x>0&&(i=a),w<0?d=p:w>0&&(u=c),m=Uo),F.attr("cursor",Wo[b]),U(t));break;default:return}Fo(t)},!0),ne(e.view)}f.call(_),D.start(e,m.name)}function I(t){for(const n of t.changedTouches||[t])for(const t of $)t.identifier===n.identifier&&(t.cur=Zn(n,_));if(z&&!y&&!v&&1===$.length){const t=$[0];Bo(t.cur[0]-t[0])>Bo(t.cur[1]-t[1])?v=!0:y=!0}for(const t of $)t.cur&&(t[0]=t.cur[0],t[1]=t.cur[1]);g=!0,Fo(t),U(t)}function U(t){const n=$[0],e=n.point0;var r;switch(C=n[0]-e[0],P=n[1]-e[1],m){case Io:case qo:x&&(C=Yo(S-i,Lo(N-l,C)),a=i+C,h=l+C),w&&(P=Yo(E-u,Lo(k-d,P)),c=u+P,p=d+P);break;case Uo:$[1]?(x&&(a=Yo(S,Lo(N,$[0][0])),h=Yo(S,Lo(N,$[1][0])),x=1),w&&(c=Yo(E,Lo(k,$[0][1])),p=Yo(E,Lo(k,$[1][1])),w=1)):(x<0?(C=Yo(S-i,Lo(N-i,C)),a=i+C,h=l):x>0&&(C=Yo(S-l,Lo(N-l,C)),a=i,h=l+C),w<0?(P=Yo(E-u,Lo(k-u,P)),c=u+P,p=d):w>0&&(P=Yo(E-d,Lo(k-d,P)),c=u,p=d+P));break;case Oo:x&&(a=Yo(S,Lo(N,i-C*x)),h=Yo(S,Lo(N,l+C*x))),w&&(c=Yo(E,Lo(k,u-P*w)),p=Yo(E,Lo(k,d+P*w)))}h<a&&(x*=-1,r=i,i=l,l=r,r=a,a=h,h=r,b in Zo&&F.attr("cursor",Wo[b=Zo[b]])),p<c&&(w*=-1,r=u,u=d,d=r,r=c,c=p,p=r,b in Ko&&F.attr("cursor",Wo[b=Ko[b]])),M.selection&&(T=M.selection),y&&(a=T[0][0],h=T[1][0]),v&&(c=T[0][1],p=T[1][1]),T[0][0]===a&&T[0][1]===c&&T[1][0]===h&&T[1][1]===p||(M.selection=[[a,c],[h,p]],f.call(_),D.brush(t,m.name))}function O(t){if(function(t){t.stopImmediatePropagation()}(t),t.touches){if(t.touches.length)return;n&&clearTimeout(n),n=setTimeout(function(){n=null},500)}else ee(t.view,g),q.on("keydown.brush keyup.brush mousemove.brush mouseup.brush",null);R.attr("pointer-events","all"),F.attr("cursor",Wo.overlay),M.selection&&(T=M.selection),function(t){return t[0][0]===t[1][0]||t[0][1]===t[1][1]}(T)&&(M.selection=null,f.call(_)),D.end(t,m.name)}}function d(t){s(this,arguments).moved(t)}function p(t){s(this,arguments).ended(t)}function g(){var n=this.__brush||{selection:null};return n.extent=Ho(e.apply(this,arguments)),n.dim=t,n}return c.move=function(n,e,r){n.tween?n.on("start.brush",function(t){s(this,arguments).beforestart().start(t)}).on("interrupt.brush end.brush",function(t){s(this,arguments).end(t)}).tween("brush",function(){var n=this,r=n.__brush,i=s(n,arguments),o=r.selection,a=t.input("function"==typeof e?e.apply(this,arguments):e,r.extent),u=Br(o,a);function c(t){r.selection=1===t&&null===a?null:u(t),f.call(n),i.brush()}return null!==o&&null!==a?c:c(1)}):n.each(function(){var n=this,i=arguments,o=n.__brush,a=t.input("function"==typeof e?e.apply(n,i):e,o.extent),u=s(n,i).beforestart();ao(n),o.selection=null===a?null:a,f.call(n),u.start(r).brush(r).end(r)})},c.clear=function(t,n){c.move(t,null,n)},l.prototype={beforestart:function(){return 1===++this.active&&(this.state.emitter=this,this.starting=!0),this},start:function(t,n){return this.starting?(this.starting=!1,this.emit("start",t,n)):this.emit("brush",t),this},brush:function(t,n){return this.emit("brush",t,n),this},end:function(t,n){return 0===--this.active&&(delete this.state.emitter,this.emit("end",t,n)),this},emit:function(n,e,r){var i=Hn(this.that).datum();a.call(n,this.that,new Ro(n,{sourceEvent:e,target:c,selection:t.output(this.state.selection),mode:r,dispatch:a}),i)}},c.extent=function(t){return arguments.length?(e="function"==typeof t?t:Do(Ho(t)),c):e},c.filter=function(t){return arguments.length?(r="function"==typeof t?t:Do(!!t),c):r},c.touchable=function(t){return arguments.length?(i="function"==typeof t?t:Do(!!t),c):i},c.handleSize=function(t){return arguments.length?(u=+t,c):u},c.keyModifiers=function(t){return arguments.length?(o=!!t,c):o},c.on=function(){var t=a.on.apply(a,arguments);return t===a?c:t},c}const aa=Math.PI,ua=2*aa,ca=1e-6,fa=ua-ca;function sa(t){this._+=t[0];for(let n=1,e=t.length;n<e;++n)this._+=arguments[n]+t[n]}function la(t,n,e,r){return t===e&&n===r}let ha=class{constructor(t){this._x0=this._y0=this._x1=this._y1=null,this._="",this._append=null==t?sa:function(t){let n=Math.floor(t);if(!(n>=0))throw new Error(`invalid digits: ${t}`);if(n>15)return sa;const e=10**n;return function(t){this._+=t[0];for(let n=1,r=t.length;n<r;++n)this._+=Math.round(arguments[n]*e)/e+t[n]}}(t),this._equal=null==t?la:function(t){const n=Math.floor(t);if(!(n<=15))return la;const e=10**n,r=function(t){return Math.round(t*e)};return function(t,n,e,i){return r(t)===r(e)&&r(n)===r(i)}}(t)}moveTo(t,n){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}`}closePath(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._append`Z`)}lineTo(t,n){this._append`L${this._x1=+t},${this._y1=+n}`}quadraticCurveTo(t,n,e,r){this._append`Q${+t},${+n},${this._x1=+e},${this._y1=+r}`}bezierCurveTo(t,n,e,r,i,o){this._append`C${+t},${+n},${+e},${+r},${this._x1=+i},${this._y1=+o}`}arcTo(t,n,e,r,i){if(t=+t,n=+n,e=+e,r=+r,(i=+i)<0)throw new Error(`negative radius: ${i}`);let o=this._x1,a=this._y1,u=e-t,c=r-n,f=o-t,s=a-n,l=f*f+s*s;if(null===this._x1)this._append`M${this._x1=t},${this._y1=n}`;else if(l>ca)if(Math.abs(s*u-c*f)>ca&&i){let h=e-o,d=r-a,p=u*u+c*c,g=h*h+d*d,y=Math.sqrt(p),v=Math.sqrt(l),_=i*Math.tan((aa-Math.acos((p+l-g)/(2*y*v)))/2),b=_/v,m=_/y;Math.abs(b-1)>ca&&this._append`L${t+b*f},${n+b*s}`,this._append`A${i},${i},0,0,${+(s*h>f*d)},${this._x1=t+m*u},${this._y1=n+m*c}`}else this._append`L${this._x1=t},${this._y1=n}`;else;}arc(t,n,e,r,i,o){if(t=+t,n=+n,o=!!o,(e=+e)<0)throw new Error(`negative radius: ${e}`);let a=e*Math.cos(r),u=e*Math.sin(r),c=t+a,f=n+u,s=1^o,l=o?r-i:i-r;if(null===this._x1?this._append`M${c},${f}`:(Math.abs(this._x1-c)>ca||Math.abs(this._y1-f)>ca)&&this._append`L${c},${f}`,e)if(l<0&&(l=l%ua+ua),l>fa)this._append`A${e},${e},0,1,${s},${t-a},${n-u}A${e},${e},0,1,${s},${this._x1=c},${this._y1=f}`;else if(l>ca){const o=t+e*Math.cos(i),a=n+e*Math.sin(i);if(l>=aa&&this._equal(c,f,o,a)){l/=2;let i=r+l;this._append`A${e},${e},0,${+(l>=aa)},${s},${t+e*Math.cos(i)},${n+e*Math.sin(i)}`}this._append`A${e},${e},0,${+(l>=aa)},${s},${this._x1=o},${this._y1=a}`}}rect(t,n,e,r){this._append`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}h${e=+e}v${+r}h${-e}Z`}toString(){return this._}};function da(){return new ha}da.prototype=ha.prototype;var pa=Math.abs,ga=Math.cos,ya=Math.sin,va=Math.PI,_a=va/2,ba=2*va,ma=Math.max,xa=1e-12;function wa(t,n){return Array.from({length:n-t},(n,e)=>t+e)}function Ma(t,n){var e=0,r=null,i=null,o=null;function a(a){var u,c=a.length,f=new Array(c),s=wa(0,c),l=new Array(c*c),h=new Array(c),d=0;a=Float64Array.from({length:c*c},n?(t,n)=>a[n%c][n/c|0]:(t,n)=>a[n/c|0][n%c]);for(let n=0;n<c;++n){let e=0;for(let r=0;r<c;++r)e+=a[n*c+r]+t*a[r*c+n];d+=f[n]=e}u=(d=ma(0,ba-e*c)/d)?e:ba/c;{let n=0;r&&s.sort((t,n)=>r(f[t],f[n]));for(const e of s){const r=n;if(t){const t=wa(1+~c,c).filter(t=>t<0?a[~t*c+e]:a[e*c+t]);i&&t.sort((t,n)=>i(t<0?-a[~t*c+e]:a[e*c+t],n<0?-a[~n*c+e]:a[e*c+n]));for(const r of t)if(r<0){(l[~r*c+e]||(l[~r*c+e]={source:null,target:null})).target={index:e,startAngle:n,endAngle:n+=a[~r*c+e]*d,value:a[~r*c+e]}}else{(l[e*c+r]||(l[e*c+r]={source:null,target:null})).source={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]}}h[e]={index:e,startAngle:r,endAngle:n,value:f[e]}}else{const t=wa(0,c).filter(t=>a[e*c+t]||a[t*c+e]);i&&t.sort((t,n)=>i(a[e*c+t],a[e*c+n]));for(const r of t){let t;if(e<r?(t=l[e*c+r]||(l[e*c+r]={source:null,target:null}),t.source={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]}):(t=l[r*c+e]||(l[r*c+e]={source:null,target:null}),t.target={index:e,startAngle:n,endAngle:n+=a[e*c+r]*d,value:a[e*c+r]},e===r&&(t.source=t.target)),t.source&&t.target&&t.source.value<t.target.value){const n=t.source;t.source=t.target,t.target=n}}h[e]={index:e,startAngle:r,endAngle:n,value:f[e]}}n+=u}}return(l=Object.values(l)).groups=h,o?l.sort(o):l}return a.padAngle=function(t){return arguments.length?(e=ma(0,t),a):e},a.sortGroups=function(t){return arguments.length?(r=t,a):r},a.sortSubgroups=function(t){return arguments.length?(i=t,a):i},a.sortChords=function(t){return arguments.length?(null==t?o=null:(n=t,o=function(t,e){return n(t.source.value+t.target.value,e.source.value+e.target.value)})._=t,a):o&&o._;var n},a}var Aa=Array.prototype.slice;function Ta(t){return function(){return t}}function Sa(t){return t.source}function Ea(t){return t.target}function Na(t){return t.radius}function ka(t){return t.startAngle}function Ca(t){return t.endAngle}function Pa(){return 0}function za(){return 10}function $a(t){var n=Sa,e=Ea,r=Na,i=Na,o=ka,a=Ca,u=Pa,c=null;function f(){var f,s=n.apply(this,arguments),l=e.apply(this,arguments),h=u.apply(this,arguments)/2,d=Aa.call(arguments),p=+r.apply(this,(d[0]=s,d)),g=o.apply(this,d)-_a,y=a.apply(this,d)-_a,v=+i.apply(this,(d[0]=l,d)),_=o.apply(this,d)-_a,b=a.apply(this,d)-_a;if(c||(c=f=da()),h>xa&&(pa(y-g)>2*h+xa?y>g?(g+=h,y-=h):(g-=h,y+=h):g=y=(g+y)/2,pa(b-_)>2*h+xa?b>_?(_+=h,b-=h):(_-=h,b+=h):_=b=(_+b)/2),c.moveTo(p*ga(g),p*ya(g)),c.arc(0,0,p,g,y),g!==_||y!==b)if(t){var m=v-+t.apply(this,arguments),x=(_+b)/2;c.quadraticCurveTo(0,0,m*ga(_),m*ya(_)),c.lineTo(v*ga(x),v*ya(x)),c.lineTo(m*ga(b),m*ya(b))}else c.quadraticCurveTo(0,0,v*ga(_),v*ya(_)),c.arc(0,0,v,_,b);if(c.quadraticCurveTo(0,0,p*ga(g),p*ya(g)),c.closePath(),f)return c=null,f+""||null}return t&&(f.headRadius=function(n){return arguments.length?(t="function"==typeof n?n:Ta(+n),f):t}),f.radius=function(t){return arguments.length?(r=i="function"==typeof t?t:Ta(+t),f):r},f.sourceRadius=function(t){return arguments.length?(r="function"==typeof t?t:Ta(+t),f):r},f.targetRadius=function(t){return arguments.length?(i="function"==typeof t?t:Ta(+t),f):i},f.startAngle=function(t){return arguments.length?(o="function"==typeof t?t:Ta(+t),f):o},f.endAngle=function(t){return arguments.length?(a="function"==typeof t?t:Ta(+t),f):a},f.padAngle=function(t){return arguments.length?(u="function"==typeof t?t:Ta(+t),f):u},f.source=function(t){return arguments.length?(n=t,f):n},f.target=function(t){return arguments.length?(e=t,f):e},f.context=function(t){return arguments.length?(c=null==t?null:t,f):c},f}var Da=Array.prototype.slice;function Ra(t,n){return t-n}var Fa=t=>()=>t;function qa(t,n){for(var e,r=-1,i=n.length;++r<i;)if(e=Ia(t,n[r]))return e;return 0}function Ia(t,n){for(var e=n[0],r=n[1],i=-1,o=0,a=t.length,u=a-1;o<a;u=o++){var c=t[o],f=c[0],s=c[1],l=t[u],h=l[0],d=l[1];if(Ua(c,l,n))return 0;s>r!=d>r&&e<(h-f)*(r-s)/(d-s)+f&&(i=-i)}return i}function Ua(t,n,e){var r,i,o,a;return function(t,n,e){return(n[0]-t[0])*(e[1]-t[1])===(e[0]-t[0])*(n[1]-t[1])}(t,n,e)&&(i=t[r=+(t[0]===n[0])],o=e[r],a=n[r],i<=o&&o<=a||a<=o&&o<=i)}function Oa(){}var Ba=[[],[[[1,1.5],[.5,1]]],[[[1.5,1],[1,1.5]]],[[[1.5,1],[.5,1]]],[[[1,.5],[1.5,1]]],[[[1,1.5],[.5,1]],[[1,.5],[1.5,1]]],[[[1,.5],[1,1.5]]],[[[1,.5],[.5,1]]],[[[.5,1],[1,.5]]],[[[1,1.5],[1,.5]]],[[[.5,1],[1,.5]],[[1.5,1],[1,1.5]]],[[[1.5,1],[1,.5]]],[[[.5,1],[1.5,1]]],[[[1,1.5],[1.5,1]]],[[[.5,1],[1,1.5]]],[]];function Ya(){var t=1,n=1,e=Z,r=u;function i(t){var n=e(t);if(Array.isArray(n))n=n.slice().sort(Ra);else{const e=w(t,La);for(n=X(...W(e[0],e[1],n),n);n[n.length-1]>=e[1];)n.pop();for(;n[1]<e[0];)n.shift()}return n.map(n=>o(t,n))}function o(e,i){const o=null==i?NaN:+i;if(isNaN(o))throw new Error(`invalid value: ${i}`);var u=[],c=[];return function(e,r,i){var o,u,c,f,s,l,h=new Array,d=new Array;o=u=-1,f=ja(e[0],r),Ba[f<<1].forEach(p);for(;++o<t-1;)c=f,f=ja(e[o+1],r),Ba[c|f<<1].forEach(p);Ba[f|0].forEach(p);for(;++u<n-1;){for(o=-1,f=ja(e[u*t+t],r),s=ja(e[u*t],r),Ba[f<<1|s<<2].forEach(p);++o<t-1;)c=f,f=ja(e[u*t+t+o+1],r),l=s,s=ja(e[u*t+o+1],r),Ba[c|f<<1|s<<2|l<<3].forEach(p);Ba[f|s<<3].forEach(p)}o=-1,s=e[u*t]>=r,Ba[s<<2].forEach(p);for(;++o<t-1;)l=s,s=ja(e[u*t+o+1],r),Ba[s<<2|l<<3].forEach(p);function p(t){var n,e,r=[t[0][0]+o,t[0][1]+u],c=[t[1][0]+o,t[1][1]+u],f=a(r),s=a(c);(n=d[f])?(e=h[s])?(delete d[n.end],delete h[e.start],n===e?(n.ring.push(c),i(n.ring)):h[n.start]=d[e.end]={start:n.start,end:e.end,ring:n.ring.concat(e.ring)}):(delete d[n.end],n.ring.push(c),d[n.end=s]=n):(n=h[s])?(e=d[f])?(delete h[n.start],delete d[e.end],n===e?(n.ring.push(c),i(n.ring)):h[e.start]=d[n.end]={start:e.start,end:n.end,ring:e.ring.concat(n.ring)}):(delete h[n.start],n.ring.unshift(r),h[n.start=f]=n):h[f]=d[s]={start:f,end:s,ring:[r,c]}}Ba[s<<3].forEach(p)}(e,o,function(t){r(t,e,o),function(t){for(var n=0,e=t.length,r=t[e-1][1]*t[0][0]-t[e-1][0]*t[0][1];++n<e;)r+=t[n-1][1]*t[n][0]-t[n-1][0]*t[n][1];return r}(t)>0?u.push([t]):c.push(t)}),c.forEach(function(t){for(var n,e=0,r=u.length;e<r;++e)if(-1!==qa((n=u[e])[0],t))return void n.push(t)}),{type:"MultiPolygon",value:i,coordinates:u}}function a(n){return 2*n[0]+n[1]*(t+1)*4}function u(e,r,i){e.forEach(function(e){var o=e[0],a=e[1],u=0|o,c=0|a,f=Ha(r[c*t+u]);o>0&&o<t&&u===o&&(e[0]=Xa(o,Ha(r[c*t+u-1]),f,i)),a>0&&a<n&&c===a&&(e[1]=Xa(a,Ha(r[(c-1)*t+u]),f,i))})}return i.contour=o,i.size=function(e){if(!arguments.length)return[t,n];var r=Math.floor(e[0]),o=Math.floor(e[1]);if(!(r>=0&&o>=0))throw new Error("invalid size");return t=r,n=o,i},i.thresholds=function(t){return arguments.length?(e="function"==typeof t?t:Array.isArray(t)?Fa(Da.call(t)):Fa(t),i):e},i.smooth=function(t){return arguments.length?(r=t?u:Oa,i):r===u},i}function La(t){return isFinite(t)?t:NaN}function ja(t,n){return null!=t&&+t>=n}function Ha(t){return null==t||isNaN(t=+t)?-1/0:t}function Xa(t,n,e,r){const i=r-n,o=e-n,a=isFinite(i)||isFinite(o)?i/o:Math.sign(i)/Math.sign(o);return isNaN(a)?t:t+a-.5}function Ga(t){return t[0]}function Va(t){return t[1]}function Wa(){return 1}const Za=134217729;function Ka(t,n,e,r,i){let o,a,u,c,f=n[0],s=r[0],l=0,h=0;s>f==s>-f?(o=f,f=n[++l]):(o=s,s=r[++h]);let d=0;if(l<t&&h<e)for(s>f==s>-f?(a=f+o,u=o-(a-f),f=n[++l]):(a=s+o,u=o-(a-s),s=r[++h]),o=a,0!==u&&(i[d++]=u);l<t&&h<e;)s>f==s>-f?(a=o+f,c=a-o,u=o-(a-c)+(f-c),f=n[++l]):(a=o+s,c=a-o,u=o-(a-c)+(s-c),s=r[++h]),o=a,0!==u&&(i[d++]=u);for(;l<t;)a=o+f,c=a-o,u=o-(a-c)+(f-c),f=n[++l],o=a,0!==u&&(i[d++]=u);for(;h<e;)a=o+s,c=a-o,u=o-(a-c)+(s-c),s=r[++h],o=a,0!==u&&(i[d++]=u);return 0===o&&0!==d||(i[d++]=o),d}function Qa(t){return new Float64Array(t)}const Ja=Qa(4),tu=Qa(8),nu=Qa(12),eu=Qa(16),ru=Qa(4);function iu(t,n,e,r,i,o){const a=(n-o)*(e-i),u=(t-i)*(r-o),c=a-u,f=Math.abs(a+u);return Math.abs(c)>=33306690738754716e-32*f?c:-function(t,n,e,r,i,o,a){let u,c,f,s,l,h,d,p,g,y,v,_,b,m,x,w,M,A;const T=t-i,S=e-i,E=n-o,N=r-o;m=T*N,h=Za*T,d=h-(h-T),p=T-d,h=Za*N,g=h-(h-N),y=N-g,x=p*y-(m-d*g-p*g-d*y),w=E*S,h=Za*E,d=h-(h-E),p=E-d,h=Za*S,g=h-(h-S),y=S-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,Ja[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,Ja[1]=b-(v+l)+(l-w),A=_+v,l=A-_,Ja[2]=_-(A-l)+(v-l),Ja[3]=A;let k=function(t,n){let e=n[0];for(let r=1;r<t;r++)e+=n[r];return e}(4,Ja),C=22204460492503146e-32*a;if(k>=C||-k>=C)return k;if(l=t-T,u=t-(T+l)+(l-i),l=e-S,f=e-(S+l)+(l-i),l=n-E,c=n-(E+l)+(l-o),l=r-N,s=r-(N+l)+(l-o),0===u&&0===c&&0===f&&0===s)return k;if(C=11093356479670487e-47*a+33306690738754706e-32*Math.abs(k),k+=T*s+N*u-(E*f+S*c),k>=C||-k>=C)return k;m=u*N,h=Za*u,d=h-(h-u),p=u-d,h=Za*N,g=h-(h-N),y=N-g,x=p*y-(m-d*g-p*g-d*y),w=c*S,h=Za*c,d=h-(h-c),p=c-d,h=Za*S,g=h-(h-S),y=S-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,ru[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,ru[1]=b-(v+l)+(l-w),A=_+v,l=A-_,ru[2]=_-(A-l)+(v-l),ru[3]=A;const P=Ka(4,Ja,4,ru,tu);m=T*s,h=Za*T,d=h-(h-T),p=T-d,h=Za*s,g=h-(h-s),y=s-g,x=p*y-(m-d*g-p*g-d*y),w=E*f,h=Za*E,d=h-(h-E),p=E-d,h=Za*f,g=h-(h-f),y=f-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,ru[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,ru[1]=b-(v+l)+(l-w),A=_+v,l=A-_,ru[2]=_-(A-l)+(v-l),ru[3]=A;const z=Ka(P,tu,4,ru,nu);m=u*s,h=Za*u,d=h-(h-u),p=u-d,h=Za*s,g=h-(h-s),y=s-g,x=p*y-(m-d*g-p*g-d*y),w=c*f,h=Za*c,d=h-(h-c),p=c-d,h=Za*f,g=h-(h-f),y=f-g,M=p*y-(w-d*g-p*g-d*y),v=x-M,l=x-v,ru[0]=x-(v+l)+(l-M),_=m+v,l=_-m,b=m-(_-l)+(v-l),v=b-w,l=b-v,ru[1]=b-(v+l)+(l-w),A=_+v,l=A-_,ru[2]=_-(A-l)+(v-l),ru[3]=A;const $=Ka(z,nu,4,ru,eu);return eu[$-1]}(t,n,e,r,i,o,f)}Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(8),Qa(8),Qa(8),Qa(4),Qa(8),Qa(8),Qa(16),Qa(12),Qa(192),Qa(192),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(8),Qa(8),Qa(8),Qa(8),Qa(8),Qa(8),Qa(8),Qa(8),Qa(8),Qa(4),Qa(4),Qa(4),Qa(8),Qa(16),Qa(16),Qa(16),Qa(32),Qa(32),Qa(48),Qa(64),Qa(1152),Qa(1152),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(4),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(24),Qa(1152),Qa(1152),Qa(1152),Qa(1152),Qa(1152),Qa(2304),Qa(2304),Qa(3456),Qa(5760),Qa(8),Qa(8),Qa(8),Qa(16),Qa(24),Qa(48),Qa(48),Qa(96),Qa(192),Qa(384),Qa(384),Qa(384),Qa(768),Qa(96),Qa(96),Qa(96),Qa(1152);const ou=Math.pow(2,-52),au=new Uint32Array(512);class uu{static from(t,n=du,e=pu){const r=t.length,i=new Float64Array(2*r);for(let o=0;o<r;o++){const r=t[o];i[2*o]=n(r),i[2*o+1]=e(r)}return new uu(i)}constructor(t){const n=t.length>>1;if(n>0&&"number"!=typeof t[0])throw new Error("Expected coords to contain numbers.");this.coords=t;const e=Math.max(2*n-5,0);this._triangles=new Uint32Array(3*e),this._halfedges=new Int32Array(3*e),this._hashSize=Math.ceil(Math.sqrt(n)),this._hullPrev=new Uint32Array(n),this._hullNext=new Uint32Array(n),this._hullTri=new Uint32Array(n),this._hullHash=new Int32Array(this._hashSize),this._ids=new Uint32Array(n),this._dists=new Float64Array(n),this.trianglesLen=0,this._cx=0,this._cy=0,this._hullStart=0,this.hull=this._triangles,this.triangles=this._triangles,this.halfedges=this._halfedges,this.update()}update(){const{coords:t,_hullPrev:n,_hullNext:e,_hullTri:r,_hullHash:i}=this,o=t.length>>1;let a=1/0,u=1/0,c=-1/0,f=-1/0;for(let n=0;n<o;n++){const e=t[2*n],r=t[2*n+1];e<a&&(a=e),r<u&&(u=r),e>c&&(c=e),r>f&&(f=r),this._ids[n]=n}const s=(a+c)/2,l=(u+f)/2;let h=0,d=0,p=0;for(let n=0,e=1/0;n<o;n++){const r=cu(s,l,t[2*n],t[2*n+1]);r<e&&(h=n,e=r)}const g=t[2*h],y=t[2*h+1];for(let n=0,e=1/0;n<o;n++){if(n===h)continue;const r=cu(g,y,t[2*n],t[2*n+1]);r<e&&r>0&&(d=n,e=r)}let v=t[2*d],_=t[2*d+1],b=1/0;for(let n=0;n<o;n++){if(n===h||n===d)continue;const e=su(g,y,v,_,t[2*n],t[2*n+1]);e<b&&(p=n,b=e)}let m=t[2*p],x=t[2*p+1];if(b===1/0){for(let n=0;n<o;n++)this._dists[n]=t[2*n]-t[0]||t[2*n+1]-t[1];lu(this._ids,this._dists,0,o-1);const n=new Uint32Array(o);let e=0;for(let t=0,r=-1/0;t<o;t++){const i=this._ids[t],o=this._dists[i];o>r&&(n[e++]=i,r=o)}return this.hull=n.subarray(0,e),this.triangles=new Uint32Array(0),void(this.halfedges=new Int32Array(0))}if(iu(g,y,v,_,m,x)<0){const t=d,n=v,e=_;d=p,v=m,_=x,p=t,m=n,x=e}const w=function(t,n,e,r,i,o){const a=e-t,u=r-n,c=i-t,f=o-n,s=a*a+u*u,l=c*c+f*f,h=.5/(a*f-u*c),d=t+(f*s-u*l)*h,p=n+(a*l-c*s)*h;return{x:d,y:p}}(g,y,v,_,m,x);this._cx=w.x,this._cy=w.y;for(let n=0;n<o;n++)this._dists[n]=cu(t[2*n],t[2*n+1],w.x,w.y);lu(this._ids,this._dists,0,o-1),this._hullStart=h;let M=3;e[h]=n[p]=d,e[d]=n[h]=p,e[p]=n[d]=h,r[h]=0,r[d]=1,r[p]=2,i.fill(-1),i[this._hashKey(g,y)]=h,i[this._hashKey(v,_)]=d,i[this._hashKey(m,x)]=p,this.trianglesLen=0,this._addTriangle(h,d,p,-1,-1,-1);for(let o=0,a=0,u=0;o<this._ids.length;o++){const c=this._ids[o],f=t[2*c],s=t[2*c+1];if(o>0&&Math.abs(f-a)<=ou&&Math.abs(s-u)<=ou)continue;if(a=f,u=s,c===h||c===d||c===p)continue;let l=0;for(let t=0,n=this._hashKey(f,s);t<this._hashSize&&(l=i[(n+t)%this._hashSize],-1===l||l===e[l]);t++);l=n[l];let g,y=l;for(;g=e[y],iu(f,s,t[2*y],t[2*y+1],t[2*g],t[2*g+1])>=0;)if(y=g,y===l){y=-1;break}if(-1===y)continue;let v=this._addTriangle(y,c,e[y],-1,-1,r[y]);r[c]=this._legalize(v+2),r[y]=v,M++;let _=e[y];for(;g=e[_],iu(f,s,t[2*_],t[2*_+1],t[2*g],t[2*g+1])<0;)v=this._addTriangle(_,c,g,r[c],-1,r[_]),r[c]=this._legalize(v+2),e[_]=_,M--,_=g;if(y===l)for(;g=n[y],iu(f,s,t[2*g],t[2*g+1],t[2*y],t[2*y+1])<0;)v=this._addTriangle(g,c,y,-1,r[y],r[g]),this._legalize(v+2),r[g]=v,e[y]=y,M--,y=g;this._hullStart=n[c]=y,e[y]=n[_]=c,e[c]=_,i[this._hashKey(f,s)]=c,i[this._hashKey(t[2*y],t[2*y+1])]=y}this.hull=new Uint32Array(M);for(let t=0,n=this._hullStart;t<M;t++)this.hull[t]=n,n=e[n];this.triangles=this._triangles.subarray(0,this.trianglesLen),this.halfedges=this._halfedges.subarray(0,this.trianglesLen)}_hashKey(t,n){return Math.floor(function(t,n){const e=t/(Math.abs(t)+Math.abs(n));return(n>0?3-e:1+e)/4}(t-this._cx,n-this._cy)*this._hashSize)%this._hashSize}_legalize(t){const{_triangles:n,_halfedges:e,coords:r}=this;let i=0,o=0;for(;;){const a=e[t],u=t-t%3;if(o=u+(t+2)%3,-1===a){if(0===i)break;t=au[--i];continue}const c=a-a%3,f=u+(t+1)%3,s=c+(a+2)%3,l=n[o],h=n[t],d=n[f],p=n[s];if(fu(r[2*l],r[2*l+1],r[2*h],r[2*h+1],r[2*d],r[2*d+1],r[2*p],r[2*p+1])){n[t]=p,n[a]=l;const r=e[s];if(-1===r){let n=this._hullStart;do{if(this._hullTri[n]===s){this._hullTri[n]=t;break}n=this._hullPrev[n]}while(n!==this._hullStart)}this._link(t,r),this._link(a,e[o]),this._link(o,s);const u=c+(a+1)%3;i<au.length&&(au[i++]=u)}else{if(0===i)break;t=au[--i]}}return o}_link(t,n){this._halfedges[t]=n,-1!==n&&(this._halfedges[n]=t)}_addTriangle(t,n,e,r,i,o){const a=this.trianglesLen;return this._triangles[a]=t,this._triangles[a+1]=n,this._triangles[a+2]=e,this._link(a,r),this._link(a+1,i),this._link(a+2,o),this.trianglesLen+=3,a}}function cu(t,n,e,r){const i=t-e,o=n-r;return i*i+o*o}function fu(t,n,e,r,i,o,a,u){const c=t-a,f=n-u,s=e-a,l=r-u,h=i-a,d=o-u,p=s*s+l*l,g=h*h+d*d;return c*(l*g-p*d)-f*(s*g-p*h)+(c*c+f*f)*(s*d-l*h)<0}function su(t,n,e,r,i,o){const a=e-t,u=r-n,c=i-t,f=o-n,s=a*a+u*u,l=c*c+f*f,h=.5/(a*f-u*c),d=(f*s-u*l)*h,p=(a*l-c*s)*h;return d*d+p*p}function lu(t,n,e,r){if(r-e<=20)for(let i=e+1;i<=r;i++){const r=t[i],o=n[r];let a=i-1;for(;a>=e&&n[t[a]]>o;)t[a+1]=t[a--];t[a+1]=r}else{let i=e+1,o=r;hu(t,e+r>>1,i),n[t[e]]>n[t[r]]&&hu(t,e,r),n[t[i]]>n[t[r]]&&hu(t,i,r),n[t[e]]>n[t[i]]&&hu(t,e,i);const a=t[i],u=n[a];for(;;){do{i++}while(n[t[i]]<u);do{o--}while(n[t[o]]>u);if(o<i)break;hu(t,i,o)}t[e+1]=t[o],t[o]=a,r-i+1>=o-e?(lu(t,n,i,r),lu(t,n,e,o-1)):(lu(t,n,e,o-1),lu(t,n,i,r))}}function hu(t,n,e){const r=t[n];t[n]=t[e],t[e]=r}function du(t){return t[0]}function pu(t){return t[1]}const gu=1e-6;class yu{constructor(){this._x0=this._y0=this._x1=this._y1=null,this._=""}moveTo(t,n){this._+=`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}`}closePath(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")}lineTo(t,n){this._+=`L${this._x1=+t},${this._y1=+n}`}arc(t,n,e){const r=(t=+t)+(e=+e),i=n=+n;if(e<0)throw new Error("negative radius");null===this._x1?this._+=`M${r},${i}`:(Math.abs(this._x1-r)>gu||Math.abs(this._y1-i)>gu)&&(this._+="L"+r+","+i),e&&(this._+=`A${e},${e},0,1,1,${t-e},${n}A${e},${e},0,1,1,${this._x1=r},${this._y1=i}`)}rect(t,n,e,r){this._+=`M${this._x0=this._x1=+t},${this._y0=this._y1=+n}h${+e}v${+r}h${-e}Z`}value(){return this._||null}}class vu{constructor(){this._=[]}moveTo(t,n){this._.push([t,n])}closePath(){this._.push(this._[0].slice())}lineTo(t,n){this._.push([t,n])}value(){return this._.length?this._:null}}class _u{constructor(t,[n,e,r,i]=[0,0,960,500]){if(!((r=+r)>=(n=+n)&&(i=+i)>=(e=+e)))throw new Error("invalid bounds");this.delaunay=t,this._circumcenters=new Float64Array(2*t.points.length),this.vectors=new Float64Array(2*t.points.length),this.xmax=r,this.xmin=n,this.ymax=i,this.ymin=e,this._init()}update(){return this.delaunay.update(),this._init(),this}_init(){const{delaunay:{points:t,hull:n,triangles:e},vectors:r}=this;let i,o;const a=this.circumcenters=this._circumcenters.subarray(0,e.length/3*2);for(let r,u,c=0,f=0,s=e.length;c<s;c+=3,f+=2){const s=2*e[c],l=2*e[c+1],h=2*e[c+2],d=t[s],p=t[s+1],g=t[l],y=t[l+1],v=t[h],_=t[h+1],b=g-d,m=y-p,x=v-d,w=_-p,M=2*(b*w-m*x);if(Math.abs(M)<1e-9){if(void 0===i){i=o=0;for(const e of n)i+=t[2*e],o+=t[2*e+1];i/=n.length,o/=n.length}const e=1e9*Math.sign((i-d)*w-(o-p)*x);r=(d+v)/2-e*w,u=(p+_)/2+e*x}else{const t=1/M,n=b*b+m*m,e=x*x+w*w;r=d+(w*n-m*e)*t,u=p+(b*e-x*n)*t}a[f]=r,a[f+1]=u}let u,c,f,s=n[n.length-1],l=4*s,h=t[2*s],d=t[2*s+1];r.fill(0);for(let e=0;e<n.length;++e)s=n[e],u=l,c=h,f=d,l=4*s,h=t[2*s],d=t[2*s+1],r[u+2]=r[l]=f-d,r[u+3]=r[l+1]=h-c}render(t){const n=null==t?t=new yu:void 0,{delaunay:{halfedges:e,inedges:r,hull:i},circumcenters:o,vectors:a}=this;if(i.length<=1)return null;for(let n=0,r=e.length;n<r;++n){const r=e[n];if(r<n)continue;const i=2*Math.floor(n/3),a=2*Math.floor(r/3),u=o[i],c=o[i+1],f=o[a],s=o[a+1];this._renderSegment(u,c,f,s,t)}let u,c=i[i.length-1];for(let n=0;n<i.length;++n){u=c,c=i[n];const e=2*Math.floor(r[c]/3),f=o[e],s=o[e+1],l=4*u,h=this._project(f,s,a[l+2],a[l+3]);h&&this._renderSegment(f,s,h[0],h[1],t)}return n&&n.value()}renderBounds(t){const n=null==t?t=new yu:void 0;return t.rect(this.xmin,this.ymin,this.xmax-this.xmin,this.ymax-this.ymin),n&&n.value()}renderCell(t,n){const e=null==n?n=new yu:void 0,r=this._clip(t);if(null===r||!r.length)return;n.moveTo(r[0],r[1]);let i=r.length;for(;r[0]===r[i-2]&&r[1]===r[i-1]&&i>1;)i-=2;for(let t=2;t<i;t+=2)r[t]===r[t-2]&&r[t+1]===r[t-1]||n.lineTo(r[t],r[t+1]);return n.closePath(),e&&e.value()}*cellPolygons(){const{delaunay:{points:t}}=this;for(let n=0,e=t.length/2;n<e;++n){const t=this.cellPolygon(n);t&&(t.index=n,yield t)}}cellPolygon(t){const n=new vu;return this.renderCell(t,n),n.value()}_renderSegment(t,n,e,r,i){let o;const a=this._regioncode(t,n),u=this._regioncode(e,r);0===a&&0===u?(i.moveTo(t,n),i.lineTo(e,r)):(o=this._clipSegment(t,n,e,r,a,u))&&(i.moveTo(o[0],o[1]),i.lineTo(o[2],o[3]))}contains(t,n,e){return(n=+n)==n&&(e=+e)==e&&this.delaunay._step(t,n,e)===t}*neighbors(t){const n=this._clip(t);if(n)for(const e of this.delaunay.neighbors(t)){const t=this._clip(e);if(t)t:for(let r=0,i=n.length;r<i;r+=2)for(let o=0,a=t.length;o<a;o+=2)if(n[r]===t[o]&&n[r+1]===t[o+1]&&n[(r+2)%i]===t[(o+a-2)%a]&&n[(r+3)%i]===t[(o+a-1)%a]){yield e;break t}}}_cell(t){const{circumcenters:n,delaunay:{inedges:e,halfedges:r,triangles:i}}=this,o=e[t];if(-1===o)return null;const a=[];let u=o;do{const e=Math.floor(u/3);if(a.push(n[2*e],n[2*e+1]),u=u%3==2?u-2:u+1,i[u]!==t)break;u=r[u]}while(u!==o&&-1!==u);return a}_clip(t){if(0===t&&1===this.delaunay.hull.length)return[this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax,this.xmin,this.ymin];const n=this._cell(t);if(null===n)return null;const{vectors:e}=this,r=4*t;return this._simplify(e[r]||e[r+1]?this._clipInfinite(t,n,e[r],e[r+1],e[r+2],e[r+3]):this._clipFinite(t,n))}_clipFinite(t,n){const e=n.length;let r,i,o,a,u=null,c=n[e-2],f=n[e-1],s=this._regioncode(c,f),l=0;for(let h=0;h<e;h+=2)if(r=c,i=f,c=n[h],f=n[h+1],o=s,s=this._regioncode(c,f),0===o&&0===s)a=l,l=0,u?u.push(c,f):u=[c,f];else{let n,e,h,d,p;if(0===o){if(null===(n=this._clipSegment(r,i,c,f,o,s)))continue;[e,h,d,p]=n}else{if(null===(n=this._clipSegment(c,f,r,i,s,o)))continue;[d,p,e,h]=n,a=l,l=this._edgecode(e,h),a&&l&&this._edge(t,a,l,u,u.length),u?u.push(e,h):u=[e,h]}a=l,l=this._edgecode(d,p),a&&l&&this._edge(t,a,l,u,u.length),u?u.push(d,p):u=[d,p]}if(u)a=l,l=this._edgecode(u[0],u[1]),a&&l&&this._edge(t,a,l,u,u.length);else if(this.contains(t,(this.xmin+this.xmax)/2,(this.ymin+this.ymax)/2))return[this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax,this.xmin,this.ymin];return u}_clipSegment(t,n,e,r,i,o){const a=i<o;for(a&&([t,n,e,r,i,o]=[e,r,t,n,o,i]);;){if(0===i&&0===o)return a?[e,r,t,n]:[t,n,e,r];if(i&o)return null;let u,c,f=i||o;8&f?(u=t+(e-t)*(this.ymax-n)/(r-n),c=this.ymax):4&f?(u=t+(e-t)*(this.ymin-n)/(r-n),c=this.ymin):2&f?(c=n+(r-n)*(this.xmax-t)/(e-t),u=this.xmax):(c=n+(r-n)*(this.xmin-t)/(e-t),u=this.xmin),i?(t=u,n=c,i=this._regioncode(t,n)):(e=u,r=c,o=this._regioncode(e,r))}}_clipInfinite(t,n,e,r,i,o){let a,u=Array.from(n);if((a=this._project(u[0],u[1],e,r))&&u.unshift(a[0],a[1]),(a=this._project(u[u.length-2],u[u.length-1],i,o))&&u.push(a[0],a[1]),u=this._clipFinite(t,u))for(let n,e=0,r=u.length,i=this._edgecode(u[r-2],u[r-1]);e<r;e+=2)n=i,i=this._edgecode(u[e],u[e+1]),n&&i&&(e=this._edge(t,n,i,u,e),r=u.length);else this.contains(t,(this.xmin+this.xmax)/2,(this.ymin+this.ymax)/2)&&(u=[this.xmin,this.ymin,this.xmax,this.ymin,this.xmax,this.ymax,this.xmin,this.ymax]);return u}_edge(t,n,e,r,i){for(;n!==e;){let e,o;switch(n){case 5:n=4;continue;case 4:n=6,e=this.xmax,o=this.ymin;break;case 6:n=2;continue;case 2:n=10,e=this.xmax,o=this.ymax;break;case 10:n=8;continue;case 8:n=9,e=this.xmin,o=this.ymax;break;case 9:n=1;continue;case 1:n=5,e=this.xmin,o=this.ymin}r[i]===e&&r[i+1]===o||!this.contains(t,e,o)||(r.splice(i,0,e,o),i+=2)}return i}_project(t,n,e,r){let i,o,a,u=1/0;if(r<0){if(n<=this.ymin)return null;(i=(this.ymin-n)/r)<u&&(a=this.ymin,o=t+(u=i)*e)}else if(r>0){if(n>=this.ymax)return null;(i=(this.ymax-n)/r)<u&&(a=this.ymax,o=t+(u=i)*e)}if(e>0){if(t>=this.xmax)return null;(i=(this.xmax-t)/e)<u&&(o=this.xmax,a=n+(u=i)*r)}else if(e<0){if(t<=this.xmin)return null;(i=(this.xmin-t)/e)<u&&(o=this.xmin,a=n+(u=i)*r)}return[o,a]}_edgecode(t,n){return(t===this.xmin?1:t===this.xmax?2:0)|(n===this.ymin?4:n===this.ymax?8:0)}_regioncode(t,n){return(t<this.xmin?1:t>this.xmax?2:0)|(n<this.ymin?4:n>this.ymax?8:0)}_simplify(t){if(t&&t.length>4){for(let n=0;n<t.length;n+=2){const e=(n+2)%t.length,r=(n+4)%t.length;(t[n]===t[e]&&t[e]===t[r]||t[n+1]===t[e+1]&&t[e+1]===t[r+1])&&(t.splice(e,2),n-=2)}t.length||(t=null)}return t}}const bu=2*Math.PI,mu=Math.pow;function xu(t){return t[0]}function wu(t){return t[1]}function Mu(t,n,e){return[t+Math.sin(t+n)*e,n+Math.cos(t-n)*e]}class Au{static from(t,n=xu,e=wu,r){return new Au("length"in t?function(t,n,e,r){const i=t.length,o=new Float64Array(2*i);for(let a=0;a<i;++a){const i=t[a];o[2*a]=n.call(r,i,a,t),o[2*a+1]=e.call(r,i,a,t)}return o}(t,n,e,r):Float64Array.from(function*(t,n,e,r){let i=0;for(const o of t)yield n.call(r,o,i,t),yield e.call(r,o,i,t),++i}(t,n,e,r)))}constructor(t){this._delaunator=new uu(t),this.inedges=new Int32Array(t.length/2),this._hullIndex=new Int32Array(t.length/2),this.points=this._delaunator.coords,this._init()}update(){return this._delaunator.update(),this._init(),this}_init(){const t=this._delaunator,n=this.points;if(t.hull&&t.hull.length>2&&function(t){const{triangles:n,coords:e}=t;for(let t=0;t<n.length;t+=3){const r=2*n[t],i=2*n[t+1],o=2*n[t+2];if((e[o]-e[r])*(e[i+1]-e[r+1])-(e[i]-e[r])*(e[o+1]-e[r+1])>1e-10)return!1}return!0}(t)){this.collinear=Int32Array.from({length:n.length/2},(t,n)=>n).sort((t,e)=>n[2*t]-n[2*e]||n[2*t+1]-n[2*e+1]);const t=this.collinear[0],e=this.collinear[this.collinear.length-1],r=[n[2*t],n[2*t+1],n[2*e],n[2*e+1]],i=1e-8*Math.hypot(r[3]-r[1],r[2]-r[0]);for(let t=0,e=n.length/2;t<e;++t){const e=Mu(n[2*t],n[2*t+1],i);n[2*t]=e[0],n[2*t+1]=e[1]}this._delaunator=new uu(n)}else delete this.collinear;const e=this.halfedges=this._delaunator.halfedges,r=this.hull=this._delaunator.hull,i=this.triangles=this._delaunator.triangles,o=this.inedges.fill(-1),a=this._hullIndex.fill(-1);for(let t=0,n=e.length;t<n;++t){const n=i[t%3==2?t-2:t+1];-1!==e[t]&&-1!==o[n]||(o[n]=t)}for(let t=0,n=r.length;t<n;++t)a[r[t]]=t;r.length<=2&&r.length>0&&(this.triangles=new Int32Array(3).fill(-1),this.halfedges=new Int32Array(3).fill(-1),this.triangles[0]=r[0],o[r[0]]=1,2===r.length&&(o[r[1]]=0,this.triangles[1]=r[1],this.triangles[2]=r[1]))}voronoi(t){return new _u(this,t)}*neighbors(t){const{inedges:n,hull:e,_hullIndex:r,halfedges:i,triangles:o,collinear:a}=this;if(a){const n=a.indexOf(t);return n>0&&(yield a[n-1]),void(n<a.length-1&&(yield a[n+1]))}const u=n[t];if(-1===u)return;let c=u,f=-1;do{if(yield f=o[c],c=c%3==2?c-2:c+1,o[c]!==t)return;if(c=i[c],-1===c){const n=e[(r[t]+1)%e.length];return void(n!==f&&(yield n))}}while(c!==u)}find(t,n,e=0){if((t=+t)!=t||(n=+n)!=n)return-1;const r=e;let i;for(;(i=this._step(e,t,n))>=0&&i!==e&&i!==r;)e=i;return i}_step(t,n,e){const{inedges:r,hull:i,_hullIndex:o,halfedges:a,triangles:u,points:c}=this;if(c.length<2)return-1;if(-1===r[t])return(t+1)%(c.length>>1);let f=t,s=mu(n-c[2*t],2)+mu(e-c[2*t+1],2);const l=r[t];let h=l;do{let r=u[h];const l=mu(n-c[2*r],2)+mu(e-c[2*r+1],2);if(l<s&&(s=l,f=r),h=h%3==2?h-2:h+1,u[h]!==t)break;if(h=a[h],-1===h){if(h=i[(o[t]+1)%i.length],h!==r&&mu(n-c[2*h],2)+mu(e-c[2*h+1],2)<s)return h;break}}while(h!==l);return f}render(t){const n=null==t?t=new yu:void 0,{points:e,halfedges:r,triangles:i}=this;for(let n=0,o=r.length;n<o;++n){const o=r[n];if(o<n)continue;const a=2*i[n],u=2*i[o];t.moveTo(e[a],e[a+1]),t.lineTo(e[u],e[u+1])}return this.renderHull(t),n&&n.value()}renderPoints(t,n){void 0!==n||t&&"function"==typeof t.moveTo||(n=t,t=null),n=null==n?2:+n;const e=null==t?t=new yu:void 0,{points:r}=this;for(let e=0,i=-2&r.length;e<i;e+=2){const i=r[e],o=r[e+1];t.moveTo(i+n,o),t.arc(i,o,n,0,bu)}return e&&e.value()}renderHull(t){const n=null==t?t=new yu:void 0,{hull:e,points:r}=this,i=2*e[0],o=e.length;t.moveTo(r[i],r[i+1]);for(let n=1;n<o;++n){const i=2*e[n];t.lineTo(r[i],r[i+1])}return t.closePath(),n&&n.value()}hullPolygon(){const t=new vu;return this.renderHull(t),t.value()}renderTriangle(t,n){const e=null==n?n=new yu:void 0,{points:r,triangles:i}=this,o=2*i[t*=3],a=2*i[t+1],u=2*i[t+2];return n.moveTo(r[o],r[o+1]),n.lineTo(r[a],r[a+1]),n.lineTo(r[u],r[u+1]),n.closePath(),e&&e.value()}*trianglePolygons(){const{triangles:t}=this;for(let n=0,e=t.length/3;n<e;++n)yield this.trianglePolygon(n)}trianglePolygon(t){const n=new vu;return this.renderTriangle(t,n),n.value()}}var Tu={},Su={};function Eu(t){return new Function("d","return {"+t.map(function(t,n){return JSON.stringify(t)+": d["+n+'] || ""'}).join(",")+"}")}function Nu(t){var n=Object.create(null),e=[];return t.forEach(function(t){for(var r in t)r in n||e.push(n[r]=r)}),e}function ku(t,n){var e=t+"",r=e.length;return r<n?new Array(n-r+1).join(0)+e:e}function Cu(t){var n,e=t.getUTCHours(),r=t.getUTCMinutes(),i=t.getUTCSeconds(),o=t.getUTCMilliseconds();return isNaN(t)?"Invalid Date":((n=t.getUTCFullYear())<0?"-"+ku(-n,6):n>9999?"+"+ku(n,6):ku(n,4))+"-"+ku(t.getUTCMonth()+1,2)+"-"+ku(t.getUTCDate(),2)+(o?"T"+ku(e,2)+":"+ku(r,2)+":"+ku(i,2)+"."+ku(o,3)+"Z":i?"T"+ku(e,2)+":"+ku(r,2)+":"+ku(i,2)+"Z":r||e?"T"+ku(e,2)+":"+ku(r,2)+"Z":"")}function Pu(t){var n=new RegExp('["'+t+"\n\r]"),e=t.charCodeAt(0);function r(t,n){var r,i=[],o=t.length,a=0,u=0,c=o<=0,f=!1;function s(){if(c)return Su;if(f)return f=!1,Tu;var n,r,i=a;if(34===t.charCodeAt(i)){for(;a++<o&&34!==t.charCodeAt(a)||34===t.charCodeAt(++a););return(n=a)>=o?c=!0:10===(r=t.charCodeAt(a++))?f=!0:13===r&&(f=!0,10===t.charCodeAt(a)&&++a),t.slice(i+1,n-1).replace(/""/g,'"')}for(;a<o;){if(10===(r=t.charCodeAt(n=a++)))f=!0;else if(13===r)f=!0,10===t.charCodeAt(a)&&++a;else if(r!==e)continue;return t.slice(i,n)}return c=!0,t.slice(i,o)}for(10===t.charCodeAt(o-1)&&--o,13===t.charCodeAt(o-1)&&--o;(r=s())!==Su;){for(var l=[];r!==Tu&&r!==Su;)l.push(r),r=s();n&&null==(l=n(l,u++))||i.push(l)}return i}function i(n,e){return n.map(function(n){return e.map(function(t){return a(n[t])}).join(t)})}function o(n){return n.map(a).join(t)}function a(t){return null==t?"":t instanceof Date?Cu(t):n.test(t+="")?'"'+t.replace(/"/g,'""')+'"':t}return{parse:function(t,n){var e,i,o=r(t,function(t,r){if(e)return e(t,r-1);i=t,e=n?function(t,n){var e=Eu(t);return function(r,i){return n(e(r),i,t)}}(t,n):Eu(t)});return o.columns=i||[],o},parseRows:r,format:function(n,e){return null==e&&(e=Nu(n)),[e.map(a).join(t)].concat(i(n,e)).join("\n")},formatBody:function(t,n){return null==n&&(n=Nu(t)),i(t,n).join("\n")},formatRows:function(t){return t.map(o).join("\n")},formatRow:o,formatValue:a}}var zu=Pu(","),$u=zu.parse,Du=zu.parseRows,Ru=zu.format,Fu=zu.formatBody,qu=zu.formatRows,Iu=zu.formatRow,Uu=zu.formatValue,Ou=Pu("\t"),Bu=Ou.parse,Yu=Ou.parseRows,Lu=Ou.format,ju=Ou.formatBody,Hu=Ou.formatRows,Xu=Ou.formatRow,Gu=Ou.formatValue;const Vu=new Date("2019-01-01T00:00").getHours()||new Date("2019-07-01T00:00").getHours();function Wu(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.blob()}function Zu(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.arrayBuffer()}function Ku(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);return t.text()}function Qu(t,n){return fetch(t,n).then(Ku)}function Ju(t){return function(n,e,r){return 2===arguments.length&&"function"==typeof e&&(r=e,e=void 0),Qu(n,e).then(function(n){return t(n,r)})}}var tc=Ju($u),nc=Ju(Bu);function ec(t){if(!t.ok)throw new Error(t.status+" "+t.statusText);if(204!==t.status&&205!==t.status)return t.json()}function rc(t){return(n,e)=>Qu(n,e).then(n=>(new DOMParser).parseFromString(n,t))}var ic=rc("application/xml"),oc=rc("text/html"),ac=rc("image/svg+xml");function uc(t,n,e,r){if(isNaN(n)||isNaN(e))return t;var i,o,a,u,c,f,s,l,h,d=t._root,p={data:r},g=t._x0,y=t._y0,v=t._x1,_=t._y1;if(!d)return t._root=p,t;for(;d.length;)if((f=n>=(o=(g+v)/2))?g=o:v=o,(s=e>=(a=(y+_)/2))?y=a:_=a,i=d,!(d=d[l=s<<1|f]))return i[l]=p,t;if(u=+t._x.call(null,d.data),c=+t._y.call(null,d.data),n===u&&e===c)return p.next=d,i?i[l]=p:t._root=p,t;do{i=i?i[l]=new Array(4):t._root=new Array(4),(f=n>=(o=(g+v)/2))?g=o:v=o,(s=e>=(a=(y+_)/2))?y=a:_=a}while((l=s<<1|f)==(h=(c>=a)<<1|u>=o));return i[h]=d,i[l]=p,t}function cc(t,n,e,r,i){this.node=t,this.x0=n,this.y0=e,this.x1=r,this.y1=i}function fc(t){return t[0]}function sc(t){return t[1]}function lc(t,n,e){var r=new hc(null==n?fc:n,null==e?sc:e,NaN,NaN,NaN,NaN);return null==t?r:r.addAll(t)}function hc(t,n,e,r,i,o){this._x=t,this._y=n,this._x0=e,this._y0=r,this._x1=i,this._y1=o,this._root=void 0}function dc(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}var pc=lc.prototype=hc.prototype;function gc(t){return function(){return t}}function yc(t){return 1e-6*(t()-.5)}function vc(t){return t.x+t.vx}function _c(t){return t.y+t.vy}function bc(t){return t.index}function mc(t,n){var e=t.get(n);if(!e)throw new Error("node not found: "+n);return e}pc.copy=function(){var t,n,e=new hc(this._x,this._y,this._x0,this._y0,this._x1,this._y1),r=this._root;if(!r)return e;if(!r.length)return e._root=dc(r),e;for(t=[{source:r,target:e._root=new Array(4)}];r=t.pop();)for(var i=0;i<4;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(4)}):r.target[i]=dc(n));return e},pc.add=function(t){const n=+this._x.call(null,t),e=+this._y.call(null,t);return uc(this.cover(n,e),n,e,t)},pc.addAll=function(t){Array.isArray(t)||(t=Array.from(t));const n=t.length,e=new Float64Array(n),r=new Float64Array(n);let i=1/0,o=i,a=-i,u=a;for(let c,f,s,l=0;l<n;++l)isNaN(f=+this._x.call(null,c=t[l]))||isNaN(s=+this._y.call(null,c))?e[l]=NaN:(e[l]=f,r[l]=s,f<i&&(i=f),f>a&&(a=f),s<o&&(o=s),s>u&&(u=s));if(i>a||o>u)return this;this.cover(i,o).cover(a,u);for(let i=0;i<n;++i)uc(this,e[i],r[i],t[i]);return this},pc.cover=function(t,n){if(isNaN(t=+t)||isNaN(n=+n))return this;var e=this._x0,r=this._y0,i=this._x1,o=this._y1;if(isNaN(e))i=(e=Math.floor(t))+1,o=(r=Math.floor(n))+1;else{for(var a,u,c=i-e||1,f=this._root;e>t||t>=i||r>n||n>=o;)switch(u=(n<r)<<1|t<e,(a=new Array(4))[u]=f,f=a,c*=2,u){case 0:i=e+c,o=r+c;break;case 1:e=i-c,o=r+c;break;case 2:i=e+c,r=o-c;break;case 3:e=i-c,r=o-c}this._root&&this._root.length&&(this._root=f)}return this._x0=e,this._y0=r,this._x1=i,this._y1=o,this},pc.data=function(){var t=[];return this.visit(function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)}),t},pc.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]},pc.find=function(t,n,e){var r,i,o,a,u,c,f,s=this._x0,l=this._y0,h=this._x1,d=this._y1,p=[],g=this._root;for(g&&p.push(new cc(g,s,l,h,d)),null==e?e=1/0:(s=t-e,l=n-e,h=t+e,d=n+e,e*=e);c=p.pop();)if(!(!(g=c.node)||(i=c.x0)>h||(o=c.y0)>d||(a=c.x1)<s||(u=c.y1)<l))if(g.length){var y=(i+a)/2,v=(o+u)/2;p.push(new cc(g[3],y,v,a,u),new cc(g[2],i,v,y,u),new cc(g[1],y,o,a,v),new cc(g[0],i,o,y,v)),(f=(n>=v)<<1|t>=y)&&(c=p[p.length-1],p[p.length-1]=p[p.length-1-f],p[p.length-1-f]=c)}else{var _=t-+this._x.call(null,g.data),b=n-+this._y.call(null,g.data),m=_*_+b*b;if(m<e){var x=Math.sqrt(e=m);s=t-x,l=n-x,h=t+x,d=n+x,r=g.data}}return r},pc.remove=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(a=+this._y.call(null,t)))return this;var n,e,r,i,o,a,u,c,f,s,l,h,d=this._root,p=this._x0,g=this._y0,y=this._x1,v=this._y1;if(!d)return this;if(d.length)for(;;){if((f=o>=(u=(p+y)/2))?p=u:y=u,(s=a>=(c=(g+v)/2))?g=c:v=c,n=d,!(d=d[l=s<<1|f]))return this;if(!d.length)break;(n[l+1&3]||n[l+2&3]||n[l+3&3])&&(e=n,h=l)}for(;d.data!==t;)if(r=d,!(d=d.next))return this;return(i=d.next)&&delete d.next,r?(i?r.next=i:delete r.next,this):n?(i?n[l]=i:delete n[l],(d=n[0]||n[1]||n[2]||n[3])&&d===(n[3]||n[2]||n[1]||n[0])&&!d.length&&(e?e[h]=d:this._root=d),this):(this._root=i,this)},pc.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},pc.root=function(){return this._root},pc.size=function(){var t=0;return this.visit(function(n){if(!n.length)do{++t}while(n=n.next)}),t},pc.visit=function(t){var n,e,r,i,o,a,u=[],c=this._root;for(c&&u.push(new cc(c,this._x0,this._y0,this._x1,this._y1));n=u.pop();)if(!t(c=n.node,r=n.x0,i=n.y0,o=n.x1,a=n.y1)&&c.length){var f=(r+o)/2,s=(i+a)/2;(e=c[3])&&u.push(new cc(e,f,s,o,a)),(e=c[2])&&u.push(new cc(e,r,s,f,a)),(e=c[1])&&u.push(new cc(e,f,i,o,s)),(e=c[0])&&u.push(new cc(e,r,i,f,s))}return this},pc.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new cc(this._root,this._x0,this._y0,this._x1,this._y1));n=e.pop();){var i=n.node;if(i.length){var o,a=n.x0,u=n.y0,c=n.x1,f=n.y1,s=(a+c)/2,l=(u+f)/2;(o=i[0])&&e.push(new cc(o,a,u,s,l)),(o=i[1])&&e.push(new cc(o,s,u,c,l)),(o=i[2])&&e.push(new cc(o,a,l,s,f)),(o=i[3])&&e.push(new cc(o,s,l,c,f))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.x1,n.y1);return this},pc.x=function(t){return arguments.length?(this._x=t,this):this._x},pc.y=function(t){return arguments.length?(this._y=t,this):this._y};const xc=4294967296;function wc(t){return t.x}function Mc(t){return t.y}var Ac=Math.PI*(3-Math.sqrt(5));function Tc(t,n){if(!isFinite(t)||0===t)return null;var e=(t=n?t.toExponential(n-1):t.toExponential()).indexOf("e"),r=t.slice(0,e);return[r.length>1?r[0]+r.slice(2):r,+t.slice(e+1)]}function Sc(t){return(t=Tc(Math.abs(t)))?t[1]:NaN}var Ec,Nc=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function kc(t){if(!(n=Nc.exec(t)))throw new Error("invalid format: "+t);var n;return new Cc({fill:n[1],align:n[2],sign:n[3],symbol:n[4],zero:n[5],width:n[6],comma:n[7],precision:n[8]&&n[8].slice(1),trim:n[9],type:n[10]})}function Cc(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function Pc(t,n){var e=Tc(t,n);if(!e)return t+"";var r=e[0],i=e[1];return i<0?"0."+new Array(-i).join("0")+r:r.length>i+1?r.slice(0,i+1)+"."+r.slice(i+1):r+new Array(i-r.length+2).join("0")}kc.prototype=Cc.prototype,Cc.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var zc={"%":(t,n)=>(100*t).toFixed(n),b:t=>Math.round(t).toString(2),c:t=>t+"",d:function(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)},e:(t,n)=>t.toExponential(n),f:(t,n)=>t.toFixed(n),g:(t,n)=>t.toPrecision(n),o:t=>Math.round(t).toString(8),p:(t,n)=>Pc(100*t,n),r:Pc,s:function(t,n){var e=Tc(t,n);if(!e)return Ec=void 0,t.toPrecision(n);var r=e[0],i=e[1],o=i-(Ec=3*Math.max(-8,Math.min(8,Math.floor(i/3))))+1,a=r.length;return o===a?r:o>a?r+new Array(o-a+1).join("0"):o>0?r.slice(0,o)+"."+r.slice(o):"0."+new Array(1-o).join("0")+Tc(t,Math.max(0,n+o-1))[0]},X:t=>Math.round(t).toString(16).toUpperCase(),x:t=>Math.round(t).toString(16)};function $c(t){return t}var Dc,Rc=Array.prototype.map,Fc=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function qc(t){var n,e,r=void 0===t.grouping||void 0===t.thousands?$c:(n=Rc.call(t.grouping,Number),e=t.thousands+"",function(t,r){for(var i=t.length,o=[],a=0,u=n[0],c=0;i>0&&u>0&&(c+u+1>r&&(u=Math.max(1,r-c)),o.push(t.substring(i-=u,i+u)),!((c+=u+1)>r));)u=n[a=(a+1)%n.length];return o.reverse().join(e)}),i=void 0===t.currency?"":t.currency[0]+"",o=void 0===t.currency?"":t.currency[1]+"",a=void 0===t.decimal?".":t.decimal+"",u=void 0===t.numerals?$c:function(t){return function(n){return n.replace(/[0-9]/g,function(n){return t[+n]})}}(Rc.call(t.numerals,String)),c=void 0===t.percent?"%":t.percent+"",f=void 0===t.minus?"−":t.minus+"",s=void 0===t.nan?"NaN":t.nan+"";function l(t,n){var e=(t=kc(t)).fill,l=t.align,h=t.sign,d=t.symbol,p=t.zero,g=t.width,y=t.comma,v=t.precision,_=t.trim,b=t.type;"n"===b?(y=!0,b="g"):zc[b]||(void 0===v&&(v=12),_=!0,b="g"),(p||"0"===e&&"="===l)&&(p=!0,e="0",l="=");var m=(n&&void 0!==n.prefix?n.prefix:"")+("$"===d?i:"#"===d&&/[boxX]/.test(b)?"0"+b.toLowerCase():""),x=("$"===d?o:/[%p]/.test(b)?c:"")+(n&&void 0!==n.suffix?n.suffix:""),w=zc[b],M=/[defgprs%]/.test(b);function A(t){var n,i,o,c=m,d=x;if("c"===b)d=w(t)+d,t="";else{var A=(t=+t)<0||1/t<0;if(t=isNaN(t)?s:w(Math.abs(t),v),_&&(t=function(t){t:for(var n,e=t.length,r=1,i=-1;r<e;++r)switch(t[r]){case".":i=n=r;break;case"0":0===i&&(i=r),n=r;break;default:if(!+t[r])break t;i>0&&(i=0)}return i>0?t.slice(0,i)+t.slice(n+1):t}(t)),A&&0===+t&&"+"!==h&&(A=!1),c=(A?"("===h?h:f:"-"===h||"("===h?"":h)+c,d=("s"!==b||isNaN(t)||void 0===Ec?"":Fc[8+Ec/3])+d+(A&&"("===h?")":""),M)for(n=-1,i=t.length;++n<i;)if(48>(o=t.charCodeAt(n))||o>57){d=(46===o?a+t.slice(n+1):t.slice(n))+d,t=t.slice(0,n);break}}y&&!p&&(t=r(t,1/0));var T=c.length+t.length+d.length,S=T<g?new Array(g-T+1).join(e):"";switch(y&&p&&(t=r(S+t,S.length?g-d.length:1/0),S=""),l){case"<":t=c+t+d+S;break;case"=":t=c+S+t+d;break;case"^":t=S.slice(0,T=S.length>>1)+c+t+d+S.slice(T);break;default:t=S+c+t+d}return u(t)}return v=void 0===v?6:/[gprs]/.test(b)?Math.max(1,Math.min(21,v)):Math.max(0,Math.min(20,v)),A.toString=function(){return t+""},A}return{format:l,formatPrefix:function(t,n){var e=3*Math.max(-8,Math.min(8,Math.floor(Sc(n)/3))),r=Math.pow(10,-e),i=l(((t=kc(t)).type="f",t),{suffix:Fc[8+e/3]});return function(t){return i(r*t)}}}}function Ic(n){return Dc=qc(n),t.format=Dc.format,t.formatPrefix=Dc.formatPrefix,Dc}function Uc(t){return Math.max(0,-Sc(Math.abs(t)))}function Oc(t,n){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(Sc(n)/3)))-Sc(Math.abs(t)))}function Bc(t,n){return t=Math.abs(t),n=Math.abs(n)-t,Math.max(0,Sc(n)-Sc(t))+1}t.format=void 0,t.formatPrefix=void 0,Ic({thousands:",",grouping:[3],currency:["$",""]});var Yc=1e-6,Lc=1e-12,jc=Math.PI,Hc=jc/2,Xc=jc/4,Gc=2*jc,Vc=180/jc,Wc=jc/180,Zc=Math.abs,Kc=Math.atan,Qc=Math.atan2,Jc=Math.cos,tf=Math.ceil,nf=Math.exp,ef=Math.hypot,rf=Math.log,of=Math.pow,af=Math.sin,uf=Math.sign||function(t){return t>0?1:t<0?-1:0},cf=Math.sqrt,ff=Math.tan;function sf(t){return t>1?0:t<-1?jc:Math.acos(t)}function lf(t){return t>1?Hc:t<-1?-Hc:Math.asin(t)}function hf(t){return(t=af(t/2))*t}function df(){}function pf(t,n){t&&yf.hasOwnProperty(t.type)&&yf[t.type](t,n)}var gf={Feature:function(t,n){pf(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)pf(e[r].geometry,n)}},yf={Sphere:function(t,n){n.sphere()},Point:function(t,n){t=t.coordinates,n.point(t[0],t[1],t[2])},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)t=e[r],n.point(t[0],t[1],t[2])},LineString:function(t,n){vf(t.coordinates,n,0)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)vf(e[r],n,0)},Polygon:function(t,n){_f(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)_f(e[r],n)},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)pf(e[r],n)}};function vf(t,n,e){var r,i=-1,o=t.length-e;for(n.lineStart();++i<o;)r=t[i],n.point(r[0],r[1],r[2]);n.lineEnd()}function _f(t,n){var e=-1,r=t.length;for(n.polygonStart();++e<r;)vf(t[e],n,1);n.polygonEnd()}function bf(t,n){t&&gf.hasOwnProperty(t.type)?gf[t.type](t,n):pf(t,n)}var mf,xf,wf,Mf,Af,Tf,Sf,Ef,Nf,kf,Cf,Pf,zf,$f,Df,Rf,Ff=new M,qf=new M,If={point:df,lineStart:df,lineEnd:df,polygonStart:function(){Ff=new M,If.lineStart=Uf,If.lineEnd=Of},polygonEnd:function(){var t=+Ff;qf.add(t<0?Gc+t:t),this.lineStart=this.lineEnd=this.point=df},sphere:function(){qf.add(Gc)}};function Uf(){If.point=Bf}function Of(){Yf(mf,xf)}function Bf(t,n){If.point=Yf,mf=t,xf=n,wf=t*=Wc,Mf=Jc(n=(n*=Wc)/2+Xc),Af=af(n)}function Yf(t,n){var e=(t*=Wc)-wf,r=e>=0?1:-1,i=r*e,o=Jc(n=(n*=Wc)/2+Xc),a=af(n),u=Af*a,c=Mf*o+u*Jc(i),f=u*r*af(i);Ff.add(Qc(f,c)),wf=t,Mf=o,Af=a}function Lf(t){return[Qc(t[1],t[0]),lf(t[2])]}function jf(t){var n=t[0],e=t[1],r=Jc(e);return[r*Jc(n),r*af(n),af(e)]}function Hf(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function Xf(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function Gf(t,n){t[0]+=n[0],t[1]+=n[1],t[2]+=n[2]}function Vf(t,n){return[t[0]*n,t[1]*n,t[2]*n]}function Wf(t){var n=cf(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=n,t[1]/=n,t[2]/=n}var Zf,Kf,Qf,Jf,ts,ns,es,rs,is,os,as,us,cs,fs,ss,ls,hs={point:ds,lineStart:gs,lineEnd:ys,polygonStart:function(){hs.point=vs,hs.lineStart=_s,hs.lineEnd=bs,$f=new M,If.polygonStart()},polygonEnd:function(){If.polygonEnd(),hs.point=ds,hs.lineStart=gs,hs.lineEnd=ys,Ff<0?(Tf=-(Ef=180),Sf=-(Nf=90)):$f>Yc?Nf=90:$f<-1e-6&&(Sf=-90),Rf[0]=Tf,Rf[1]=Ef},sphere:function(){Tf=-(Ef=180),Sf=-(Nf=90)}};function ds(t,n){Df.push(Rf=[Tf=t,Ef=t]),n<Sf&&(Sf=n),n>Nf&&(Nf=n)}function ps(t,n){var e=jf([t*Wc,n*Wc]);if(zf){var r=Xf(zf,e),i=Xf([r[1],-r[0],0],r);Wf(i),i=Lf(i);var o,a=t-kf,u=a>0?1:-1,c=i[0]*Vc*u,f=Zc(a)>180;f^(u*kf<c&&c<u*t)?(o=i[1]*Vc)>Nf&&(Nf=o):f^(u*kf<(c=(c+360)%360-180)&&c<u*t)?(o=-i[1]*Vc)<Sf&&(Sf=o):(n<Sf&&(Sf=n),n>Nf&&(Nf=n)),f?t<kf?ms(Tf,t)>ms(Tf,Ef)&&(Ef=t):ms(t,Ef)>ms(Tf,Ef)&&(Tf=t):Ef>=Tf?(t<Tf&&(Tf=t),t>Ef&&(Ef=t)):t>kf?ms(Tf,t)>ms(Tf,Ef)&&(Ef=t):ms(t,Ef)>ms(Tf,Ef)&&(Tf=t)}else Df.push(Rf=[Tf=t,Ef=t]);n<Sf&&(Sf=n),n>Nf&&(Nf=n),zf=e,kf=t}function gs(){hs.point=ps}function ys(){Rf[0]=Tf,Rf[1]=Ef,hs.point=ds,zf=null}function vs(t,n){if(zf){var e=t-kf;$f.add(Zc(e)>180?e+(e>0?360:-360):e)}else Cf=t,Pf=n;If.point(t,n),ps(t,n)}function _s(){If.lineStart()}function bs(){vs(Cf,Pf),If.lineEnd(),Zc($f)>Yc&&(Tf=-(Ef=180)),Rf[0]=Tf,Rf[1]=Ef,zf=null}function ms(t,n){return(n-=t)<0?n+360:n}function xs(t,n){return t[0]-n[0]}function ws(t,n){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}var Ms={sphere:df,point:As,lineStart:Ss,lineEnd:ks,polygonStart:function(){Ms.lineStart=Cs,Ms.lineEnd=Ps},polygonEnd:function(){Ms.lineStart=Ss,Ms.lineEnd=ks}};function As(t,n){t*=Wc;var e=Jc(n*=Wc);Ts(e*Jc(t),e*af(t),af(n))}function Ts(t,n,e){++Zf,Qf+=(t-Qf)/Zf,Jf+=(n-Jf)/Zf,ts+=(e-ts)/Zf}function Ss(){Ms.point=Es}function Es(t,n){t*=Wc;var e=Jc(n*=Wc);fs=e*Jc(t),ss=e*af(t),ls=af(n),Ms.point=Ns,Ts(fs,ss,ls)}function Ns(t,n){t*=Wc;var e=Jc(n*=Wc),r=e*Jc(t),i=e*af(t),o=af(n),a=Qc(cf((a=ss*o-ls*i)*a+(a=ls*r-fs*o)*a+(a=fs*i-ss*r)*a),fs*r+ss*i+ls*o);Kf+=a,ns+=a*(fs+(fs=r)),es+=a*(ss+(ss=i)),rs+=a*(ls+(ls=o)),Ts(fs,ss,ls)}function ks(){Ms.point=As}function Cs(){Ms.point=zs}function Ps(){$s(us,cs),Ms.point=As}function zs(t,n){us=t,cs=n,t*=Wc,n*=Wc,Ms.point=$s;var e=Jc(n);fs=e*Jc(t),ss=e*af(t),ls=af(n),Ts(fs,ss,ls)}function $s(t,n){t*=Wc;var e=Jc(n*=Wc),r=e*Jc(t),i=e*af(t),o=af(n),a=ss*o-ls*i,u=ls*r-fs*o,c=fs*i-ss*r,f=ef(a,u,c),s=lf(f),l=f&&-s/f;is.add(l*a),os.add(l*u),as.add(l*c),Kf+=s,ns+=s*(fs+(fs=r)),es+=s*(ss+(ss=i)),rs+=s*(ls+(ls=o)),Ts(fs,ss,ls)}function Ds(t){return function(){return t}}function Rs(t,n){function e(e,r){return e=t(e,r),n(e[0],e[1])}return t.invert&&n.invert&&(e.invert=function(e,r){return(e=n.invert(e,r))&&t.invert(e[0],e[1])}),e}function Fs(t,n){return Zc(t)>jc&&(t-=Math.round(t/Gc)*Gc),[t,n]}function qs(t,n,e){return(t%=Gc)?n||e?Rs(Us(t),Os(n,e)):Us(t):n||e?Os(n,e):Fs}function Is(t){return function(n,e){return Zc(n+=t)>jc&&(n-=Math.round(n/Gc)*Gc),[n,e]}}function Us(t){var n=Is(t);return n.invert=Is(-t),n}function Os(t,n){var e=Jc(t),r=af(t),i=Jc(n),o=af(n);function a(t,n){var a=Jc(n),u=Jc(t)*a,c=af(t)*a,f=af(n),s=f*e+u*r;return[Qc(c*i-s*o,u*e-f*r),lf(s*i+c*o)]}return a.invert=function(t,n){var a=Jc(n),u=Jc(t)*a,c=af(t)*a,f=af(n),s=f*i-c*o;return[Qc(c*i+f*o,u*e+s*r),lf(s*e-u*r)]},a}function Bs(t){function n(n){return(n=t(n[0]*Wc,n[1]*Wc))[0]*=Vc,n[1]*=Vc,n}return t=qs(t[0]*Wc,t[1]*Wc,t.length>2?t[2]*Wc:0),n.invert=function(n){return(n=t.invert(n[0]*Wc,n[1]*Wc))[0]*=Vc,n[1]*=Vc,n},n}function Ys(t,n,e,r,i,o){if(e){var a=Jc(n),u=af(n),c=r*e;null==i?(i=n+r*Gc,o=n-c/2):(i=Ls(a,i),o=Ls(a,o),(r>0?i<o:i>o)&&(i+=r*Gc));for(var f,s=i;r>0?s>o:s<o;s-=c)f=Lf([a,-u*Jc(s),-u*af(s)]),t.point(f[0],f[1])}}function Ls(t,n){(n=jf(n))[0]-=t,Wf(n);var e=sf(-n[1]);return((-n[2]<0?-e:e)+Gc-Yc)%Gc}function js(){var t,n=[];return{point:function(n,e,r){t.push([n,e,r])},lineStart:function(){n.push(t=[])},lineEnd:df,rejoin:function(){n.length>1&&n.push(n.pop().concat(n.shift()))},result:function(){var e=n;return n=[],t=null,e}}}function Hs(t,n){return Zc(t[0]-n[0])<Yc&&Zc(t[1]-n[1])<Yc}function Xs(t,n,e,r){this.x=t,this.z=n,this.o=e,this.e=r,this.v=!1,this.n=this.p=null}function Gs(t,n,e,r,i){var o,a,u=[],c=[];if(t.forEach(function(t){if(!((n=t.length-1)<=0)){var n,e,r=t[0],a=t[n];if(Hs(r,a)){if(!r[2]&&!a[2]){for(i.lineStart(),o=0;o<n;++o)i.point((r=t[o])[0],r[1]);return void i.lineEnd()}a[0]+=2e-6}u.push(e=new Xs(r,t,null,!0)),c.push(e.o=new Xs(r,null,e,!1)),u.push(e=new Xs(a,t,null,!1)),c.push(e.o=new Xs(a,null,e,!0))}}),u.length){for(c.sort(n),Vs(u),Vs(c),o=0,a=c.length;o<a;++o)c[o].e=e=!e;for(var f,s,l=u[0];;){for(var h=l,d=!0;h.v;)if((h=h.n)===l)return;f=h.z,i.lineStart();do{if(h.v=h.o.v=!0,h.e){if(d)for(o=0,a=f.length;o<a;++o)i.point((s=f[o])[0],s[1]);else r(h.x,h.n.x,1,i);h=h.n}else{if(d)for(f=h.p.z,o=f.length-1;o>=0;--o)i.point((s=f[o])[0],s[1]);else r(h.x,h.p.x,-1,i);h=h.p}f=(h=h.o).z,d=!d}while(!h.v);i.lineEnd()}}}function Vs(t){if(n=t.length){for(var n,e,r=0,i=t[0];++r<n;)i.n=e=t[r],e.p=i,i=e;i.n=e=t[0],e.p=i}}function Ws(t){return Zc(t[0])<=jc?t[0]:uf(t[0])*((Zc(t[0])+jc)%Gc-jc)}function Zs(t,n){var e=Ws(n),r=n[1],i=af(r),o=[af(e),-Jc(e),0],a=0,u=0,c=new M;1===i?r=Hc+Yc:-1===i&&(r=-Hc-Yc);for(var f=0,s=t.length;f<s;++f)if(h=(l=t[f]).length)for(var l,h,d=l[h-1],p=Ws(d),g=d[1]/2+Xc,y=af(g),v=Jc(g),_=0;_<h;++_,p=m,y=w,v=A,d=b){var b=l[_],m=Ws(b),x=b[1]/2+Xc,w=af(x),A=Jc(x),T=m-p,S=T>=0?1:-1,E=S*T,N=E>jc,k=y*w;if(c.add(Qc(k*S*af(E),v*A+k*Jc(E))),a+=N?T+S*Gc:T,N^p>=e^m>=e){var C=Xf(jf(d),jf(b));Wf(C);var P=Xf(o,C);Wf(P);var z=(N^T>=0?-1:1)*lf(P[2]);(r>z||r===z&&(C[0]||C[1]))&&(u+=N^T>=0?1:-1)}}return(a<-1e-6||a<Yc&&c<-1e-12)^1&u}function Ks(t,n,e,r){return function(i){var o,a,u,c=n(i),f=js(),s=n(f),l=!1,h={point:d,lineStart:g,lineEnd:y,polygonStart:function(){h.point=v,h.lineStart=_,h.lineEnd=b,a=[],o=[]},polygonEnd:function(){h.point=d,h.lineStart=g,h.lineEnd=y,a=ct(a);var t=Zs(o,r);a.length?(l||(i.polygonStart(),l=!0),Gs(a,Js,t,e,i)):t&&(l||(i.polygonStart(),l=!0),i.lineStart(),e(null,null,1,i),i.lineEnd()),l&&(i.polygonEnd(),l=!1),a=o=null},sphere:function(){i.polygonStart(),i.lineStart(),e(null,null,1,i),i.lineEnd(),i.polygonEnd()}};function d(n,e){t(n,e)&&i.point(n,e)}function p(t,n){c.point(t,n)}function g(){h.point=p,c.lineStart()}function y(){h.point=d,c.lineEnd()}function v(t,n){u.push([t,n]),s.point(t,n)}function _(){s.lineStart(),u=[]}function b(){v(u[0][0],u[0][1]),s.lineEnd();var t,n,e,r,c=s.clean(),h=f.result(),d=h.length;if(u.pop(),o.push(u),u=null,d)if(1&c){if((n=(e=h[0]).length-1)>0){for(l||(i.polygonStart(),l=!0),i.lineStart(),t=0;t<n;++t)i.point((r=e[t])[0],r[1]);i.lineEnd()}}else d>1&&2&c&&h.push(h.pop().concat(h.shift())),a.push(h.filter(Qs))}return h}}function Qs(t){return t.length>1}function Js(t,n){return((t=t.x)[0]<0?t[1]-Hc-Yc:Hc-t[1])-((n=n.x)[0]<0?n[1]-Hc-Yc:Hc-n[1])}Fs.invert=Fs;var tl=Ks(function(){return!0},function(t){var n,e=NaN,r=NaN,i=NaN;return{lineStart:function(){t.lineStart(),n=1},point:function(o,a){var u=o>0?jc:-jc,c=Zc(o-e);Zc(c-jc)<Yc?(t.point(e,r=(r+a)/2>0?Hc:-Hc),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(u,r),t.point(o,r),n=0):i!==u&&c>=jc&&(Zc(e-i)<Yc&&(e-=i*Yc),Zc(o-u)<Yc&&(o-=u*Yc),r=function(t,n,e,r){var i,o,a=af(t-e);return Zc(a)>Yc?Kc((af(n)*(o=Jc(r))*af(e)-af(r)*(i=Jc(n))*af(t))/(i*o*a)):(n+r)/2}(e,r,o,a),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(u,r),n=0),t.point(e=o,r=a),i=u},lineEnd:function(){t.lineEnd(),e=r=NaN},clean:function(){return 2-n}}},function(t,n,e,r){var i;if(null==t)i=e*Hc,r.point(-jc,i),r.point(0,i),r.point(jc,i),r.point(jc,0),r.point(jc,-i),r.point(0,-i),r.point(-jc,-i),r.point(-jc,0),r.point(-jc,i);else if(Zc(t[0]-n[0])>Yc){var o=t[0]<n[0]?jc:-jc;i=e*o/2,r.point(-o,i),r.point(0,i),r.point(o,i)}else r.point(n[0],n[1])},[-jc,-Hc]);function nl(t){var n=Jc(t),e=2*Wc,r=n>0,i=Zc(n)>Yc;function o(t,e){return Jc(t)*Jc(e)>n}function a(t,e,r){var i=[1,0,0],o=Xf(jf(t),jf(e)),a=Hf(o,o),u=o[0],c=a-u*u;if(!c)return!r&&t;var f=n*a/c,s=-n*u/c,l=Xf(i,o),h=Vf(i,f);Gf(h,Vf(o,s));var d=l,p=Hf(h,d),g=Hf(d,d),y=p*p-g*(Hf(h,h)-1);if(!(y<0)){var v=cf(y),_=Vf(d,(-p-v)/g);if(Gf(_,h),_=Lf(_),!r)return _;var b,m=t[0],x=e[0],w=t[1],M=e[1];x<m&&(b=m,m=x,x=b);var A=x-m,T=Zc(A-jc)<Yc;if(!T&&M<w&&(b=w,w=M,M=b),T||A<Yc?T?w+M>0^_[1]<(Zc(_[0]-m)<Yc?w:M):w<=_[1]&&_[1]<=M:A>jc^(m<=_[0]&&_[0]<=x)){var S=Vf(d,(-p+v)/g);return Gf(S,h),[_,Lf(S)]}}}function u(n,e){var i=r?t:jc-t,o=0;return n<-i?o|=1:n>i&&(o|=2),e<-i?o|=4:e>i&&(o|=8),o}return Ks(o,function(t){var n,e,c,f,s;return{lineStart:function(){f=c=!1,s=1},point:function(l,h){var d,p=[l,h],g=o(l,h),y=r?g?0:u(l,h):g?u(l+(l<0?jc:-jc),h):0;if(!n&&(f=c=g)&&t.lineStart(),g!==c&&(!(d=a(n,p))||Hs(n,d)||Hs(p,d))&&(p[2]=1),g!==c)s=0,g?(t.lineStart(),d=a(p,n),t.point(d[0],d[1])):(d=a(n,p),t.point(d[0],d[1],2),t.lineEnd()),n=d;else if(i&&n&&r^g){var v;y&e||!(v=a(p,n,!0))||(s=0,r?(t.lineStart(),t.point(v[0][0],v[0][1]),t.point(v[1][0],v[1][1]),t.lineEnd()):(t.point(v[1][0],v[1][1]),t.lineEnd(),t.lineStart(),t.point(v[0][0],v[0][1],3)))}!g||n&&Hs(n,p)||t.point(p[0],p[1]),n=p,c=g,e=y},lineEnd:function(){c&&t.lineEnd(),n=null},clean:function(){return s|(f&&c)<<1}}},function(n,r,i,o){Ys(o,t,e,i,n,r)},r?[0,-t]:[-jc,t-jc])}var el,rl,il,ol,al=1e9,ul=-al;function cl(t,n,e,r){function i(i,o){return t<=i&&i<=e&&n<=o&&o<=r}function o(i,o,u,f){var s=0,l=0;if(null==i||(s=a(i,u))!==(l=a(o,u))||c(i,o)<0^u>0)do{f.point(0===s||3===s?t:e,s>1?r:n)}while((s=(s+u+4)%4)!==l);else f.point(o[0],o[1])}function a(r,i){return Zc(r[0]-t)<Yc?i>0?0:3:Zc(r[0]-e)<Yc?i>0?2:1:Zc(r[1]-n)<Yc?i>0?1:0:i>0?3:2}function u(t,n){return c(t.x,n.x)}function c(t,n){var e=a(t,1),r=a(n,1);return e!==r?e-r:0===e?n[1]-t[1]:1===e?t[0]-n[0]:2===e?t[1]-n[1]:n[0]-t[0]}return function(a){var c,f,s,l,h,d,p,g,y,v,_,b=a,m=js(),x={point:w,lineStart:function(){x.point=M,f&&f.push(s=[]);v=!0,y=!1,p=g=NaN},lineEnd:function(){c&&(M(l,h),d&&y&&m.rejoin(),c.push(m.result()));x.point=w,y&&b.lineEnd()},polygonStart:function(){b=m,c=[],f=[],_=!0},polygonEnd:function(){var n=function(){for(var n=0,e=0,i=f.length;e<i;++e)for(var o,a,u=f[e],c=1,s=u.length,l=u[0],h=l[0],d=l[1];c<s;++c)o=h,a=d,h=(l=u[c])[0],d=l[1],a<=r?d>r&&(h-o)*(r-a)>(d-a)*(t-o)&&++n:d<=r&&(h-o)*(r-a)<(d-a)*(t-o)&&--n;return n}(),e=_&&n,i=(c=ct(c)).length;(e||i)&&(a.polygonStart(),e&&(a.lineStart(),o(null,null,1,a),a.lineEnd()),i&&Gs(c,u,n,o,a),a.polygonEnd());b=a,c=f=s=null}};function w(t,n){i(t,n)&&b.point(t,n)}function M(o,a){var u=i(o,a);if(f&&s.push([o,a]),v)l=o,h=a,d=u,v=!1,u&&(b.lineStart(),b.point(o,a));else if(u&&y)b.point(o,a);else{var c=[p=Math.max(ul,Math.min(al,p)),g=Math.max(ul,Math.min(al,g))],m=[o=Math.max(ul,Math.min(al,o)),a=Math.max(ul,Math.min(al,a))];!function(t,n,e,r,i,o){var a,u=t[0],c=t[1],f=0,s=1,l=n[0]-u,h=n[1]-c;if(a=e-u,l||!(a>0)){if(a/=l,l<0){if(a<f)return;a<s&&(s=a)}else if(l>0){if(a>s)return;a>f&&(f=a)}if(a=i-u,l||!(a<0)){if(a/=l,l<0){if(a>s)return;a>f&&(f=a)}else if(l>0){if(a<f)return;a<s&&(s=a)}if(a=r-c,h||!(a>0)){if(a/=h,h<0){if(a<f)return;a<s&&(s=a)}else if(h>0){if(a>s)return;a>f&&(f=a)}if(a=o-c,h||!(a<0)){if(a/=h,h<0){if(a>s)return;a>f&&(f=a)}else if(h>0){if(a<f)return;a<s&&(s=a)}return f>0&&(t[0]=u+f*l,t[1]=c+f*h),s<1&&(n[0]=u+s*l,n[1]=c+s*h),!0}}}}}(c,m,t,n,e,r)?u&&(b.lineStart(),b.point(o,a),_=!1):(y||(b.lineStart(),b.point(c[0],c[1])),b.point(m[0],m[1]),u||b.lineEnd(),_=!1)}p=o,g=a,y=u}return x}}var fl={sphere:df,point:df,lineStart:function(){fl.point=ll,fl.lineEnd=sl},lineEnd:df,polygonStart:df,polygonEnd:df};function sl(){fl.point=fl.lineEnd=df}function ll(t,n){rl=t*=Wc,il=af(n*=Wc),ol=Jc(n),fl.point=hl}function hl(t,n){t*=Wc;var e=af(n*=Wc),r=Jc(n),i=Zc(t-rl),o=Jc(i),a=r*af(i),u=ol*e-il*r*o,c=il*e+ol*r*o;el.add(Qc(cf(a*a+u*u),c)),rl=t,il=e,ol=r}function dl(t){return el=new M,bf(t,fl),+el}var pl=[null,null],gl={type:"LineString",coordinates:pl};function yl(t,n){return pl[0]=t,pl[1]=n,dl(gl)}var vl={Feature:function(t,n){return bl(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)if(bl(e[r].geometry,n))return!0;return!1}},_l={Sphere:function(){return!0},Point:function(t,n){return ml(t.coordinates,n)},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(ml(e[r],n))return!0;return!1},LineString:function(t,n){return xl(t.coordinates,n)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(xl(e[r],n))return!0;return!1},Polygon:function(t,n){return wl(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(wl(e[r],n))return!0;return!1},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)if(bl(e[r],n))return!0;return!1}};function bl(t,n){return!(!t||!_l.hasOwnProperty(t.type))&&_l[t.type](t,n)}function ml(t,n){return 0===yl(t,n)}function xl(t,n){for(var e,r,i,o=0,a=t.length;o<a;o++){if(0===(r=yl(t[o],n)))return!0;if(o>0&&(i=yl(t[o],t[o-1]))>0&&e<=i&&r<=i&&(e+r-i)*(1-Math.pow((e-r)/i,2))<Lc*i)return!0;e=r}return!1}function wl(t,n){return!!Zs(t.map(Ml),Al(n))}function Ml(t){return(t=t.map(Al)).pop(),t}function Al(t){return[t[0]*Wc,t[1]*Wc]}function Tl(t,n,e){var r=st(t,n-Yc,e).concat(n);return function(t){return r.map(function(n){return[t,n]})}}function Sl(t,n,e){var r=st(t,n-Yc,e).concat(n);return function(t){return r.map(function(n){return[n,t]})}}function El(){var t,n,e,r,i,o,a,u,c,f,s,l,h=10,d=h,p=90,g=360,y=2.5;function v(){return{type:"MultiLineString",coordinates:_()}}function _(){return st(tf(r/p)*p,e,p).map(s).concat(st(tf(u/g)*g,a,g).map(l)).concat(st(tf(n/h)*h,t,h).filter(function(t){return Zc(t%p)>Yc}).map(c)).concat(st(tf(o/d)*d,i,d).filter(function(t){return Zc(t%g)>Yc}).map(f))}return v.lines=function(){return _().map(function(t){return{type:"LineString",coordinates:t}})},v.outline=function(){return{type:"Polygon",coordinates:[s(r).concat(l(a).slice(1),s(e).reverse().slice(1),l(u).reverse().slice(1))]}},v.extent=function(t){return arguments.length?v.extentMajor(t).extentMinor(t):v.extentMinor()},v.extentMajor=function(t){return arguments.length?(r=+t[0][0],e=+t[1][0],u=+t[0][1],a=+t[1][1],r>e&&(t=r,r=e,e=t),u>a&&(t=u,u=a,a=t),v.precision(y)):[[r,u],[e,a]]},v.extentMinor=function(e){return arguments.length?(n=+e[0][0],t=+e[1][0],o=+e[0][1],i=+e[1][1],n>t&&(e=n,n=t,t=e),o>i&&(e=o,o=i,i=e),v.precision(y)):[[n,o],[t,i]]},v.step=function(t){return arguments.length?v.stepMajor(t).stepMinor(t):v.stepMinor()},v.stepMajor=function(t){return arguments.length?(p=+t[0],g=+t[1],v):[p,g]},v.stepMinor=function(t){return arguments.length?(h=+t[0],d=+t[1],v):[h,d]},v.precision=function(h){return arguments.length?(y=+h,c=Tl(o,i,90),f=Sl(n,t,y),s=Tl(u,a,90),l=Sl(r,e,y),v):y},v.extentMajor([[-180,-89.999999],[180,89.999999]]).extentMinor([[-180,-80.000001],[180,80.000001]])}var Nl,kl,Cl,Pl,zl=t=>t,$l=new M,Dl=new M,Rl={point:df,lineStart:df,lineEnd:df,polygonStart:function(){Rl.lineStart=Fl,Rl.lineEnd=Ul},polygonEnd:function(){Rl.lineStart=Rl.lineEnd=Rl.point=df,$l.add(Zc(Dl)),Dl=new M},result:function(){var t=$l/2;return $l=new M,t}};function Fl(){Rl.point=ql}function ql(t,n){Rl.point=Il,Nl=Cl=t,kl=Pl=n}function Il(t,n){Dl.add(Pl*t-Cl*n),Cl=t,Pl=n}function Ul(){Il(Nl,kl)}var Ol=1/0,Bl=Ol,Yl=-Ol,Ll=Yl,jl={point:function(t,n){t<Ol&&(Ol=t);t>Yl&&(Yl=t);n<Bl&&(Bl=n);n>Ll&&(Ll=n)},lineStart:df,lineEnd:df,polygonStart:df,polygonEnd:df,result:function(){var t=[[Ol,Bl],[Yl,Ll]];return Yl=Ll=-(Bl=Ol=1/0),t}};var Hl,Xl,Gl,Vl,Wl=0,Zl=0,Kl=0,Ql=0,Jl=0,th=0,nh=0,eh=0,rh=0,ih={point:oh,lineStart:ah,lineEnd:fh,polygonStart:function(){ih.lineStart=sh,ih.lineEnd=lh},polygonEnd:function(){ih.point=oh,ih.lineStart=ah,ih.lineEnd=fh},result:function(){var t=rh?[nh/rh,eh/rh]:th?[Ql/th,Jl/th]:Kl?[Wl/Kl,Zl/Kl]:[NaN,NaN];return Wl=Zl=Kl=Ql=Jl=th=nh=eh=rh=0,t}};function oh(t,n){Wl+=t,Zl+=n,++Kl}function ah(){ih.point=uh}function uh(t,n){ih.point=ch,oh(Gl=t,Vl=n)}function ch(t,n){var e=t-Gl,r=n-Vl,i=cf(e*e+r*r);Ql+=i*(Gl+t)/2,Jl+=i*(Vl+n)/2,th+=i,oh(Gl=t,Vl=n)}function fh(){ih.point=oh}function sh(){ih.point=hh}function lh(){dh(Hl,Xl)}function hh(t,n){ih.point=dh,oh(Hl=Gl=t,Xl=Vl=n)}function dh(t,n){var e=t-Gl,r=n-Vl,i=cf(e*e+r*r);Ql+=i*(Gl+t)/2,Jl+=i*(Vl+n)/2,th+=i,nh+=(i=Vl*t-Gl*n)*(Gl+t),eh+=i*(Vl+n),rh+=3*i,oh(Gl=t,Vl=n)}function ph(t){this._context=t}ph.prototype={_radius:4.5,pointRadius:function(t){return this._radius=t,this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._context.closePath(),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._context.moveTo(t,n),this._point=1;break;case 1:this._context.lineTo(t,n);break;default:this._context.moveTo(t+this._radius,n),this._context.arc(t,n,this._radius,0,Gc)}},result:df};var gh,yh,vh,_h,bh,mh=new M,xh={point:df,lineStart:function(){xh.point=wh},lineEnd:function(){gh&&Mh(yh,vh),xh.point=df},polygonStart:function(){gh=!0},polygonEnd:function(){gh=null},result:function(){var t=+mh;return mh=new M,t}};function wh(t,n){xh.point=Mh,yh=_h=t,vh=bh=n}function Mh(t,n){_h-=t,bh-=n,mh.add(cf(_h*_h+bh*bh)),_h=t,bh=n}let Ah,Th,Sh,Eh;class Nh{constructor(t){this._append=null==t?kh:function(t){const n=Math.floor(t);if(!(n>=0))throw new RangeError(`invalid digits: ${t}`);if(n>15)return kh;if(n!==Ah){const t=10**n;Ah=n,Th=function(n){let e=1;this._+=n[0];for(const r=n.length;e<r;++e)this._+=Math.round(arguments[e]*t)/t+n[e]}}return Th}(t),this._radius=4.5,this._=""}pointRadius(t){return this._radius=+t,this}polygonStart(){this._line=0}polygonEnd(){this._line=NaN}lineStart(){this._point=0}lineEnd(){0===this._line&&(this._+="Z"),this._point=NaN}point(t,n){switch(this._point){case 0:this._append`M${t},${n}`,this._point=1;break;case 1:this._append`L${t},${n}`;break;default:if(this._append`M${t},${n}`,this._radius!==Sh||this._append!==Th){const t=this._radius,n=this._;this._="",this._append`m0,${t}a${t},${t} 0 1,1 0,${-2*t}a${t},${t} 0 1,1 0,${2*t}z`,Sh=t,Th=this._append,Eh=this._,this._=n}this._+=Eh}}result(){const t=this._;return this._="",t.length?t:null}}function kh(t){let n=1;this._+=t[0];for(const e=t.length;n<e;++n)this._+=arguments[n]+t[n]}function Ch(t){return function(n){var e=new Ph;for(var r in t)e[r]=t[r];return e.stream=n,e}}function Ph(){}function zh(t,n,e){var r=t.clipExtent&&t.clipExtent();return t.scale(150).translate([0,0]),null!=r&&t.clipExtent(null),bf(e,t.stream(jl)),n(jl.result()),null!=r&&t.clipExtent(r),t}function $h(t,n,e){return zh(t,function(e){var r=n[1][0]-n[0][0],i=n[1][1]-n[0][1],o=Math.min(r/(e[1][0]-e[0][0]),i/(e[1][1]-e[0][1])),a=+n[0][0]+(r-o*(e[1][0]+e[0][0]))/2,u=+n[0][1]+(i-o*(e[1][1]+e[0][1]))/2;t.scale(150*o).translate([a,u])},e)}function Dh(t,n,e){return $h(t,[[0,0],n],e)}function Rh(t,n,e){return zh(t,function(e){var r=+n,i=r/(e[1][0]-e[0][0]),o=(r-i*(e[1][0]+e[0][0]))/2,a=-i*e[0][1];t.scale(150*i).translate([o,a])},e)}function Fh(t,n,e){return zh(t,function(e){var r=+n,i=r/(e[1][1]-e[0][1]),o=-i*e[0][0],a=(r-i*(e[1][1]+e[0][1]))/2;t.scale(150*i).translate([o,a])},e)}Ph.prototype={constructor:Ph,point:function(t,n){this.stream.point(t,n)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}};var qh=Jc(30*Wc);function Ih(t,n){return+n?function(t,n){function e(r,i,o,a,u,c,f,s,l,h,d,p,g,y){var v=f-r,_=s-i,b=v*v+_*_;if(b>4*n&&g--){var m=a+h,x=u+d,w=c+p,M=cf(m*m+x*x+w*w),A=lf(w/=M),T=Zc(Zc(w)-1)<Yc||Zc(o-l)<Yc?(o+l)/2:Qc(x,m),S=t(T,A),E=S[0],N=S[1],k=E-r,C=N-i,P=_*k-v*C;(P*P/b>n||Zc((v*k+_*C)/b-.5)>.3||a*h+u*d+c*p<qh)&&(e(r,i,o,a,u,c,E,N,T,m/=M,x/=M,w,g,y),y.point(E,N),e(E,N,T,m,x,w,f,s,l,h,d,p,g,y))}}return function(n){var r,i,o,a,u,c,f,s,l,h,d,p,g={point:y,lineStart:v,lineEnd:b,polygonStart:function(){n.polygonStart(),g.lineStart=m},polygonEnd:function(){n.polygonEnd(),g.lineStart=v}};function y(e,r){e=t(e,r),n.point(e[0],e[1])}function v(){s=NaN,g.point=_,n.lineStart()}function _(r,i){var o=jf([r,i]),a=t(r,i);e(s,l,f,h,d,p,s=a[0],l=a[1],f=r,h=o[0],d=o[1],p=o[2],16,n),n.point(s,l)}function b(){g.point=y,n.lineEnd()}function m(){v(),g.point=x,g.lineEnd=w}function x(t,n){_(r=t,n),i=s,o=l,a=h,u=d,c=p,g.point=_}function w(){e(s,l,f,h,d,p,i,o,r,a,u,c,16,n),g.lineEnd=b,b()}return g}}(t,n):function(t){return Ch({point:function(n,e){n=t(n,e),this.stream.point(n[0],n[1])}})}(t)}var Uh=Ch({point:function(t,n){this.stream.point(t*Wc,n*Wc)}});function Oh(t,n,e,r,i,o){if(!o)return function(t,n,e,r,i){function o(o,a){return[n+t*(o*=r),e-t*(a*=i)]}return o.invert=function(o,a){return[(o-n)/t*r,(e-a)/t*i]},o}(t,n,e,r,i);var a=Jc(o),u=af(o),c=a*t,f=u*t,s=a/t,l=u/t,h=(u*e-a*n)/t,d=(u*n+a*e)/t;function p(t,o){return[c*(t*=r)-f*(o*=i)+n,e-f*t-c*o]}return p.invert=function(t,n){return[r*(s*t-l*n+h),i*(d-l*t-s*n)]},p}function Bh(t){return Yh(function(){return t})()}function Yh(t){var n,e,r,i,o,a,u,c,f,s,l=150,h=480,d=250,p=0,g=0,y=0,v=0,_=0,b=0,m=1,x=1,w=null,M=tl,A=null,T=zl,S=.5;function E(t){return c(t[0]*Wc,t[1]*Wc)}function N(t){return(t=c.invert(t[0],t[1]))&&[t[0]*Vc,t[1]*Vc]}function k(){var t=Oh(l,0,0,m,x,b).apply(null,n(p,g)),r=Oh(l,h-t[0],d-t[1],m,x,b);return e=qs(y,v,_),u=Rs(n,r),c=Rs(e,u),a=Ih(u,S),C()}function C(){return f=s=null,E}return E.stream=function(t){return f&&s===t?f:f=Uh(function(t){return Ch({point:function(n,e){var r=t(n,e);return this.stream.point(r[0],r[1])}})}(e)(M(a(T(s=t)))))},E.preclip=function(t){return arguments.length?(M=t,w=void 0,C()):M},E.postclip=function(t){return arguments.length?(T=t,A=r=i=o=null,C()):T},E.clipAngle=function(t){return arguments.length?(M=+t?nl(w=t*Wc):(w=null,tl),C()):w*Vc},E.clipExtent=function(t){return arguments.length?(T=null==t?(A=r=i=o=null,zl):cl(A=+t[0][0],r=+t[0][1],i=+t[1][0],o=+t[1][1]),C()):null==A?null:[[A,r],[i,o]]},E.scale=function(t){return arguments.length?(l=+t,k()):l},E.translate=function(t){return arguments.length?(h=+t[0],d=+t[1],k()):[h,d]},E.center=function(t){return arguments.length?(p=t[0]%360*Wc,g=t[1]%360*Wc,k()):[p*Vc,g*Vc]},E.rotate=function(t){return arguments.length?(y=t[0]%360*Wc,v=t[1]%360*Wc,_=t.length>2?t[2]%360*Wc:0,k()):[y*Vc,v*Vc,_*Vc]},E.angle=function(t){return arguments.length?(b=t%360*Wc,k()):b*Vc},E.reflectX=function(t){return arguments.length?(m=t?-1:1,k()):m<0},E.reflectY=function(t){return arguments.length?(x=t?-1:1,k()):x<0},E.precision=function(t){return arguments.length?(a=Ih(u,S=t*t),C()):cf(S)},E.fitExtent=function(t,n){return $h(E,t,n)},E.fitSize=function(t,n){return Dh(E,t,n)},E.fitWidth=function(t,n){return Rh(E,t,n)},E.fitHeight=function(t,n){return Fh(E,t,n)},function(){return n=t.apply(this,arguments),E.invert=n.invert&&N,k()}}function Lh(t){var n=0,e=jc/3,r=Yh(t),i=r(n,e);return i.parallels=function(t){return arguments.length?r(n=t[0]*Wc,e=t[1]*Wc):[n*Vc,e*Vc]},i}function jh(t,n){var e=af(t),r=(e+af(n))/2;if(Zc(r)<Yc)return function(t){var n=Jc(t);function e(t,e){return[t*n,af(e)/n]}return e.invert=function(t,e){return[t/n,lf(e*n)]},e}(t);var i=1+e*(2*r-e),o=cf(i)/r;function a(t,n){var e=cf(i-2*r*af(n))/r;return[e*af(t*=r),o-e*Jc(t)]}return a.invert=function(t,n){var e=o-n,a=Qc(t,Zc(e))*uf(e);return e*r<0&&(a-=jc*uf(t)*uf(e)),[a/r,lf((i-(t*t+e*e)*r*r)/(2*r))]},a}function Hh(){return Lh(jh).scale(155.424).center([0,33.6442])}function Xh(){return Hh().parallels([29.5,45.5]).scale(1070).translate([480,250]).rotate([96,0]).center([-.6,38.7])}function Gh(t){return function(n,e){var r=Jc(n),i=Jc(e),o=t(r*i);return o===1/0?[2,0]:[o*i*af(n),o*af(e)]}}function Vh(t){return function(n,e){var r=cf(n*n+e*e),i=t(r),o=af(i),a=Jc(i);return[Qc(n*o,r*a),lf(r&&e*o/r)]}}var Wh=Gh(function(t){return cf(2/(1+t))});Wh.invert=Vh(function(t){return 2*lf(t/2)});var Zh=Gh(function(t){return(t=sf(t))&&t/af(t)});function Kh(t,n){return[t,rf(ff((Hc+n)/2))]}function Qh(t){var n,e,r,i=Bh(t),o=i.center,a=i.scale,u=i.translate,c=i.clipExtent,f=null;function s(){var o=jc*a(),u=i(Bs(i.rotate()).invert([0,0]));return c(null==f?[[u[0]-o,u[1]-o],[u[0]+o,u[1]+o]]:t===Kh?[[Math.max(u[0]-o,f),n],[Math.min(u[0]+o,e),r]]:[[f,Math.max(u[1]-o,n)],[e,Math.min(u[1]+o,r)]])}return i.scale=function(t){return arguments.length?(a(t),s()):a()},i.translate=function(t){return arguments.length?(u(t),s()):u()},i.center=function(t){return arguments.length?(o(t),s()):o()},i.clipExtent=function(t){return arguments.length?(null==t?f=n=e=r=null:(f=+t[0][0],n=+t[0][1],e=+t[1][0],r=+t[1][1]),s()):null==f?null:[[f,n],[e,r]]},s()}function Jh(t){return ff((Hc+t)/2)}function td(t,n){var e=Jc(t),r=t===n?af(t):rf(e/Jc(n))/rf(Jh(n)/Jh(t)),i=e*of(Jh(t),r)/r;if(!r)return Kh;function o(t,n){i>0?n<-Hc+Yc&&(n=-Hc+Yc):n>Hc-Yc&&(n=Hc-Yc);var e=i/of(Jh(n),r);return[e*af(r*t),i-e*Jc(r*t)]}return o.invert=function(t,n){var e=i-n,o=uf(r)*cf(t*t+e*e),a=Qc(t,Zc(e))*uf(e);return e*r<0&&(a-=jc*uf(t)*uf(e)),[a/r,2*Kc(of(i/o,1/r))-Hc]},o}function nd(t,n){return[t,n]}function ed(t,n){var e=Jc(t),r=t===n?af(t):(e-Jc(n))/(n-t),i=e/r+t;if(Zc(r)<Yc)return nd;function o(t,n){var e=i-n,o=r*t;return[e*af(o),i-e*Jc(o)]}return o.invert=function(t,n){var e=i-n,o=Qc(t,Zc(e))*uf(e);return e*r<0&&(o-=jc*uf(t)*uf(e)),[o/r,i-uf(r)*cf(t*t+e*e)]},o}Zh.invert=Vh(function(t){return t}),Kh.invert=function(t,n){return[t,2*Kc(nf(n))-Hc]},nd.invert=nd;var rd=1.340264,id=-.081106,od=893e-6,ad=.003796,ud=cf(3)/2;function cd(t,n){var e=lf(ud*af(n)),r=e*e,i=r*r*r;return[t*Jc(e)/(ud*(rd+3*id*r+i*(7*od+9*ad*r))),e*(rd+id*r+i*(od+ad*r))]}function fd(t,n){var e=Jc(n),r=Jc(t)*e;return[e*af(t)/r,af(n)/r]}function sd(t,n){var e=n*n,r=e*e;return[t*(.8707-.131979*e+r*(r*(.003971*e-.001529*r)-.013791)),n*(1.007226+e*(.015085+r*(.028874*e-.044475-.005916*r)))]}function ld(t,n){return[Jc(n)*af(t),af(n)]}function hd(t,n){var e=Jc(n),r=1+Jc(t)*e;return[e*af(t)/r,af(n)/r]}function dd(t,n){return[rf(ff((Hc+n)/2)),-t]}function pd(t,n){return t.parent===n.parent?1:2}function gd(t,n){return t+n.x}function yd(t,n){return Math.max(t,n.y)}function vd(t){var n=0,e=t.children,r=e&&e.length;if(r)for(;--r>=0;)n+=e[r].value;else n=1;t.value=n}function _d(t,n){t instanceof Map?(t=[void 0,t],void 0===n&&(n=md)):void 0===n&&(n=bd);for(var e,r,i,o,a,u=new Md(t),c=[u];e=c.pop();)if((i=n(e.data))&&(a=(i=Array.from(i)).length))for(e.children=i,o=a-1;o>=0;--o)c.push(r=i[o]=new Md(i[o])),r.parent=e,r.depth=e.depth+1;return u.eachBefore(wd)}function bd(t){return t.children}function md(t){return Array.isArray(t)?t[1]:null}function xd(t){void 0!==t.data.value&&(t.value=t.data.value),t.data=t.data.data}function wd(t){var n=0;do{t.height=n}while((t=t.parent)&&t.height<++n)}function Md(t){this.data=t,this.depth=this.height=0,this.parent=null}function Ad(t){return null==t?null:Td(t)}function Td(t){if("function"!=typeof t)throw new Error;return t}function Sd(){return 0}function Ed(t){return function(){return t}}cd.invert=function(t,n){for(var e,r=n,i=r*r,o=i*i*i,a=0;a<12&&(o=(i=(r-=e=(r*(rd+id*i+o*(od+ad*i))-n)/(rd+3*id*i+o*(7*od+9*ad*i)))*r)*i*i,!(Zc(e)<Lc));++a);return[ud*t*(rd+3*id*i+o*(7*od+9*ad*i))/Jc(r),lf(af(r)/ud)]},fd.invert=Vh(Kc),sd.invert=function(t,n){var e,r=n,i=25;do{var o=r*r,a=o*o;r-=e=(r*(1.007226+o*(.015085+a*(.028874*o-.044475-.005916*a)))-n)/(1.007226+o*(.045255+a*(.259866*o-.311325-.005916*11*a)))}while(Zc(e)>Yc&&--i>0);return[t/(.8707+(o=r*r)*(o*(o*o*o*(.003971-.001529*o)-.013791)-.131979)),r]},ld.invert=Vh(lf),hd.invert=Vh(function(t){return 2*Kc(t)}),dd.invert=function(t,n){return[-n,2*Kc(nf(t))-Hc]},Md.prototype=_d.prototype={constructor:Md,count:function(){return this.eachAfter(vd)},each:function(t,n){let e=-1;for(const r of this)t.call(n,r,++e,this);return this},eachAfter:function(t,n){for(var e,r,i,o=this,a=[o],u=[],c=-1;o=a.pop();)if(u.push(o),e=o.children)for(r=0,i=e.length;r<i;++r)a.push(e[r]);for(;o=u.pop();)t.call(n,o,++c,this);return this},eachBefore:function(t,n){for(var e,r,i=this,o=[i],a=-1;i=o.pop();)if(t.call(n,i,++a,this),e=i.children)for(r=e.length-1;r>=0;--r)o.push(e[r]);return this},find:function(t,n){let e=-1;for(const r of this)if(t.call(n,r,++e,this))return r},sum:function(t){return this.eachAfter(function(n){for(var e=+t(n.data)||0,r=n.children,i=r&&r.length;--i>=0;)e+=r[i].value;n.value=e})},sort:function(t){return this.eachBefore(function(n){n.children&&n.children.sort(t)})},path:function(t){for(var n=this,e=function(t,n){if(t===n)return t;var e=t.ancestors(),r=n.ancestors(),i=null;t=e.pop(),n=r.pop();for(;t===n;)i=t,t=e.pop(),n=r.pop();return i}(n,t),r=[n];n!==e;)n=n.parent,r.push(n);for(var i=r.length;t!==e;)r.splice(i,0,t),t=t.parent;return r},ancestors:function(){for(var t=this,n=[t];t=t.parent;)n.push(t);return n},descendants:function(){return Array.from(this)},leaves:function(){var t=[];return this.eachBefore(function(n){n.children||t.push(n)}),t},links:function(){var t=this,n=[];return t.each(function(e){e!==t&&n.push({source:e.parent,target:e})}),n},copy:function(){return _d(this).eachBefore(xd)},[Symbol.iterator]:function*(){var t,n,e,r,i=this,o=[i];do{for(t=o.reverse(),o=[];i=t.pop();)if(yield i,n=i.children)for(e=0,r=n.length;e<r;++e)o.push(n[e])}while(o.length)}};const Nd=4294967296;function kd(){let t=1;return()=>(t=(1664525*t+1013904223)%Nd)/Nd}function Cd(t,n){for(var e,r,i=0,o=(t=function(t,n){let e,r,i=t.length;for(;i;)r=n()*i--|0,e=t[i],t[i]=t[r],t[r]=e;return t}(Array.from(t),n)).length,a=[];i<o;)e=t[i],r&&$d(r,e)?++i:(r=Rd(a=Pd(a,e)),i=0);return r}function Pd(t,n){var e,r;if(Dd(n,t))return[n];for(e=0;e<t.length;++e)if(zd(n,t[e])&&Dd(Fd(t[e],n),t))return[t[e],n];for(e=0;e<t.length-1;++e)for(r=e+1;r<t.length;++r)if(zd(Fd(t[e],t[r]),n)&&zd(Fd(t[e],n),t[r])&&zd(Fd(t[r],n),t[e])&&Dd(qd(t[e],t[r],n),t))return[t[e],t[r],n];throw new Error}function zd(t,n){var e=t.r-n.r,r=n.x-t.x,i=n.y-t.y;return e<0||e*e<r*r+i*i}function $d(t,n){var e=t.r-n.r+1e-9*Math.max(t.r,n.r,1),r=n.x-t.x,i=n.y-t.y;return e>0&&e*e>r*r+i*i}function Dd(t,n){for(var e=0;e<n.length;++e)if(!$d(t,n[e]))return!1;return!0}function Rd(t){switch(t.length){case 1:return function(t){return{x:t.x,y:t.y,r:t.r}}(t[0]);case 2:return Fd(t[0],t[1]);case 3:return qd(t[0],t[1],t[2])}}function Fd(t,n){var e=t.x,r=t.y,i=t.r,o=n.x,a=n.y,u=n.r,c=o-e,f=a-r,s=u-i,l=Math.sqrt(c*c+f*f);return{x:(e+o+c/l*s)/2,y:(r+a+f/l*s)/2,r:(l+i+u)/2}}function qd(t,n,e){var r=t.x,i=t.y,o=t.r,a=n.x,u=n.y,c=n.r,f=e.x,s=e.y,l=e.r,h=r-a,d=r-f,p=i-u,g=i-s,y=c-o,v=l-o,_=r*r+i*i-o*o,b=_-a*a-u*u+c*c,m=_-f*f-s*s+l*l,x=d*p-h*g,w=(p*m-g*b)/(2*x)-r,M=(g*y-p*v)/x,A=(d*b-h*m)/(2*x)-i,T=(h*v-d*y)/x,S=M*M+T*T-1,E=2*(o+w*M+A*T),N=w*w+A*A-o*o,k=-(Math.abs(S)>1e-6?(E+Math.sqrt(E*E-4*S*N))/(2*S):N/E);return{x:r+w+M*k,y:i+A+T*k,r:k}}function Id(t,n,e){var r,i,o,a,u=t.x-n.x,c=t.y-n.y,f=u*u+c*c;f?(i=n.r+e.r,i*=i,a=t.r+e.r,i>(a*=a)?(r=(f+a-i)/(2*f),o=Math.sqrt(Math.max(0,a/f-r*r)),e.x=t.x-r*u-o*c,e.y=t.y-r*c+o*u):(r=(f+i-a)/(2*f),o=Math.sqrt(Math.max(0,i/f-r*r)),e.x=n.x+r*u-o*c,e.y=n.y+r*c+o*u)):(e.x=n.x+e.r,e.y=n.y)}function Ud(t,n){var e=t.r+n.r-1e-6,r=n.x-t.x,i=n.y-t.y;return e>0&&e*e>r*r+i*i}function Od(t){var n=t._,e=t.next._,r=n.r+e.r,i=(n.x*e.r+e.x*n.r)/r,o=(n.y*e.r+e.y*n.r)/r;return i*i+o*o}function Bd(t){this._=t,this.next=null,this.previous=null}function Yd(t,n){if(!(o=(t=function(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}(t)).length))return 0;var e,r,i,o,a,u,c,f,s,l,h;if((e=t[0]).x=0,e.y=0,!(o>1))return e.r;if(r=t[1],e.x=-r.r,r.x=e.r,r.y=0,!(o>2))return e.r+r.r;Id(r,e,i=t[2]),e=new Bd(e),r=new Bd(r),i=new Bd(i),e.next=i.previous=r,r.next=e.previous=i,i.next=r.previous=e;t:for(c=3;c<o;++c){Id(e._,r._,i=t[c]),i=new Bd(i),f=r.next,s=e.previous,l=r._.r,h=e._.r;do{if(l<=h){if(Ud(f._,i._)){r=f,e.next=r,r.previous=e,--c;continue t}l+=f._.r,f=f.next}else{if(Ud(s._,i._)){(e=s).next=r,r.previous=e,--c;continue t}h+=s._.r,s=s.previous}}while(f!==s.next);for(i.previous=e,i.next=r,e.next=r.previous=r=i,a=Od(e);(i=i.next)!==r;)(u=Od(i))<a&&(e=i,a=u);r=e.next}for(e=[r._],i=r;(i=i.next)!==r;)e.push(i._);for(i=Cd(e,n),c=0;c<o;++c)(e=t[c]).x-=i.x,e.y-=i.y;return i.r}function Ld(t){return Math.sqrt(t.value)}function jd(t){return function(n){n.children||(n.r=Math.max(0,+t(n)||0))}}function Hd(t,n,e){return function(r){if(i=r.children){var i,o,a,u=i.length,c=t(r)*n||0;if(c)for(o=0;o<u;++o)i[o].r+=c;if(a=Yd(i,e),c)for(o=0;o<u;++o)i[o].r-=c;r.r=a+c}}}function Xd(t){return function(n){var e=n.parent;n.r*=t,e&&(n.x=e.x+t*n.x,n.y=e.y+t*n.y)}}function Gd(t){t.x0=Math.round(t.x0),t.y0=Math.round(t.y0),t.x1=Math.round(t.x1),t.y1=Math.round(t.y1)}function Vd(t,n,e,r,i){for(var o,a=t.children,u=-1,c=a.length,f=t.value&&(r-n)/t.value;++u<c;)(o=a[u]).y0=e,o.y1=i,o.x0=n,o.x1=n+=o.value*f}var Wd={depth:-1},Zd={},Kd={};function Qd(t){return t.id}function Jd(t){return t.parentId}function tp(t){let n=t.length;if(n<2)return"";for(;--n>1&&!np(t,n););return t.slice(0,n)}function np(t,n){if("/"===t[n]){let e=0;for(;n>0&&"\\"===t[--n];)++e;if(!(1&e))return!0}return!1}function ep(t,n){return t.parent===n.parent?1:2}function rp(t){var n=t.children;return n?n[0]:t.t}function ip(t){var n=t.children;return n?n[n.length-1]:t.t}function op(t,n,e){var r=e/(n.i-t.i);n.c-=r,n.s+=e,t.c+=r,n.z+=e,n.m+=e}function ap(t,n,e){return t.a.parent===n.parent?t.a:e}function up(t,n){this._=t,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=n}function cp(t,n,e,r,i){for(var o,a=t.children,u=-1,c=a.length,f=t.value&&(i-e)/t.value;++u<c;)(o=a[u]).x0=n,o.x1=r,o.y0=e,o.y1=e+=o.value*f}up.prototype=Object.create(Md.prototype);var fp=(1+Math.sqrt(5))/2;function sp(t,n,e,r,i,o){for(var a,u,c,f,s,l,h,d,p,g,y,v=[],_=n.children,b=0,m=0,x=_.length,w=n.value;b<x;){c=i-e,f=o-r;do{s=_[m++].value}while(!s&&m<x);for(l=h=s,y=s*s*(g=Math.max(f/c,c/f)/(w*t)),p=Math.max(h/y,y/l);m<x;++m){if(s+=u=_[m].value,u<l&&(l=u),u>h&&(h=u),y=s*s*g,(d=Math.max(h/y,y/l))>p){s-=u;break}p=d}v.push(a={value:s,dice:c<f,children:_.slice(b,m)}),a.dice?Vd(a,e,r,i,w?r+=f*s/w:o):cp(a,e,r,w?e+=c*s/w:i,o),w-=s,b=m}return v}var lp=function t(n){function e(t,e,r,i,o){sp(n,t,e,r,i,o)}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(fp);var hp=function t(n){function e(t,e,r,i,o){if((a=t._squarify)&&a.ratio===n)for(var a,u,c,f,s,l=-1,h=a.length,d=t.value;++l<h;){for(c=(u=a[l]).children,f=u.value=0,s=c.length;f<s;++f)u.value+=c[f].value;u.dice?Vd(u,e,r,i,d?r+=(o-r)*u.value/d:o):cp(u,e,r,d?e+=(i-e)*u.value/d:i,o),d-=u.value}else t._squarify=a=sp(n,t,e,r,i,o),a.ratio=n}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(fp);function dp(t,n,e){return(n[0]-t[0])*(e[1]-t[1])-(n[1]-t[1])*(e[0]-t[0])}function pp(t,n){return t[0]-n[0]||t[1]-n[1]}function gp(t){const n=t.length,e=[0,1];let r,i=2;for(r=2;r<n;++r){for(;i>1&&dp(t[e[i-2]],t[e[i-1]],t[r])<=0;)--i;e[i++]=r}return e.slice(0,i)}var yp=Math.random,vp=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,1===arguments.length?(e=t,t=0):e-=t,function(){return n()*e+t}}return e.source=t,e}(yp),_p=function t(n){function e(t,e){return arguments.length<2&&(e=t,t=0),t=Math.floor(t),e=Math.floor(e)-t,function(){return Math.floor(n()*e+t)}}return e.source=t,e}(yp),bp=function t(n){function e(t,e){var r,i;return t=null==t?0:+t,e=null==e?1:+e,function(){var o;if(null!=r)o=r,r=null;else do{r=2*n()-1,o=2*n()-1,i=r*r+o*o}while(!i||i>1);return t+e*o*Math.sqrt(-2*Math.log(i)/i)}}return e.source=t,e}(yp),mp=function t(n){var e=bp.source(n);function r(){var t=e.apply(this,arguments);return function(){return Math.exp(t())}}return r.source=t,r}(yp),xp=function t(n){function e(t){return(t=+t)<=0?()=>0:function(){for(var e=0,r=t;r>1;--r)e+=n();return e+r*n()}}return e.source=t,e}(yp),wp=function t(n){var e=xp.source(n);function r(t){if(0===(t=+t))return n;var r=e(t);return function(){return r()/t}}return r.source=t,r}(yp),Mp=function t(n){function e(t){return function(){return-Math.log1p(-n())/t}}return e.source=t,e}(yp),Ap=function t(n){function e(t){if((t=+t)<0)throw new RangeError("invalid alpha");return t=1/-t,function(){return Math.pow(1-n(),t)}}return e.source=t,e}(yp),Tp=function t(n){function e(t){if((t=+t)<0||t>1)throw new RangeError("invalid p");return function(){return Math.floor(n()+t)}}return e.source=t,e}(yp),Sp=function t(n){function e(t){if((t=+t)<0||t>1)throw new RangeError("invalid p");return 0===t?()=>1/0:1===t?()=>1:(t=Math.log1p(-t),function(){return 1+Math.floor(Math.log1p(-n())/t)})}return e.source=t,e}(yp),Ep=function t(n){var e=bp.source(n)();function r(t,r){if((t=+t)<0)throw new RangeError("invalid k");if(0===t)return()=>0;if(r=null==r?1:+r,1===t)return()=>-Math.log1p(-n())*r;var i=(t<1?t+1:t)-1/3,o=1/(3*Math.sqrt(i)),a=t<1?()=>Math.pow(n(),1/t):()=>1;return function(){do{do{var t=e(),u=1+o*t}while(u<=0);u*=u*u;var c=1-n()}while(c>=1-.0331*t*t*t*t&&Math.log(c)>=.5*t*t+i*(1-u+Math.log(u)));return i*u*a()*r}}return r.source=t,r}(yp),Np=function t(n){var e=Ep.source(n);function r(t,n){var r=e(t),i=e(n);return function(){var t=r();return 0===t?0:t/(t+i())}}return r.source=t,r}(yp),kp=function t(n){var e=Sp.source(n),r=Np.source(n);function i(t,n){return t=+t,(n=+n)>=1?()=>t:n<=0?()=>0:function(){for(var i=0,o=t,a=n;o*a>16&&o*(1-a)>16;){var u=Math.floor((o+1)*a),c=r(u,o-u+1)();c<=a?(i+=u,o-=u,a=(a-c)/(1-c)):(o=u-1,a/=c)}for(var f=a<.5,s=e(f?a:1-a),l=s(),h=0;l<=o;++h)l+=s();return i+(f?h:o-h)}}return i.source=t,i}(yp),Cp=function t(n){function e(t,e,r){var i;return 0===(t=+t)?i=t=>-Math.log(t):(t=1/t,i=n=>Math.pow(n,t)),e=null==e?0:+e,r=null==r?1:+r,function(){return e+r*i(-Math.log1p(-n()))}}return e.source=t,e}(yp),Pp=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,function(){return t+e*Math.tan(Math.PI*n())}}return e.source=t,e}(yp),zp=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,function(){var r=n();return t+e*Math.log(r/(1-r))}}return e.source=t,e}(yp),$p=function t(n){var e=Ep.source(n),r=kp.source(n);function i(t){return function(){for(var i=0,o=t;o>16;){var a=Math.floor(.875*o),u=e(a)();if(u>o)return i+r(a-1,o/u)();i+=a,o-=u}for(var c=-Math.log1p(-n()),f=0;c<=o;++f)c-=Math.log1p(-n());return i+f}}return i.source=t,i}(yp);const Dp=1/4294967296;const Rp=new Date,Fp=new Date;function qp(t,n,e,r){function i(n){return t(n=0===arguments.length?new Date:new Date(+n)),n}return i.floor=n=>(t(n=new Date(+n)),n),i.ceil=e=>(t(e=new Date(e-1)),n(e,1),t(e),e),i.round=t=>{const n=i(t),e=i.ceil(t);return t-n<e-t?n:e},i.offset=(t,e)=>(n(t=new Date(+t),null==e?1:Math.floor(e)),t),i.range=(e,r,o)=>{const a=[];if(e=i.ceil(e),o=null==o?1:Math.floor(o),!(e<r&&o>0))return a;let u;do{a.push(u=new Date(+e)),n(e,o),t(e)}while(u<e&&e<r);return a},i.filter=e=>qp(n=>{if(n>=n)for(;t(n),!e(n);)n.setTime(n-1)},(t,r)=>{if(t>=t)if(r<0)for(;++r<=0;)for(;n(t,-1),!e(t););else for(;--r>=0;)for(;n(t,1),!e(t););}),e&&(i.count=(n,r)=>(Rp.setTime(+n),Fp.setTime(+r),t(Rp),t(Fp),Math.floor(e(Rp,Fp))),i.every=t=>(t=Math.floor(t),isFinite(t)&&t>0?t>1?i.filter(r?n=>r(n)%t===0:n=>i.count(0,n)%t===0):i:null)),i}const Ip=qp(()=>{},(t,n)=>{t.setTime(+t+n)},(t,n)=>n-t);Ip.every=t=>(t=Math.floor(t),isFinite(t)&&t>0?t>1?qp(n=>{n.setTime(Math.floor(n/t)*t)},(n,e)=>{n.setTime(+n+e*t)},(n,e)=>(e-n)/t):Ip:null);const Up=Ip.range,Op=1e3,Bp=6e4,Yp=36e5,Lp=864e5,jp=6048e5,Hp=2592e6,Xp=31536e6,Gp=qp(t=>{t.setTime(t-t.getMilliseconds())},(t,n)=>{t.setTime(+t+n*Op)},(t,n)=>(n-t)/Op,t=>t.getUTCSeconds()),Vp=Gp.range,Wp=qp(t=>{t.setTime(t-t.getMilliseconds()-t.getSeconds()*Op)},(t,n)=>{t.setTime(+t+n*Bp)},(t,n)=>(n-t)/Bp,t=>t.getMinutes()),Zp=Wp.range,Kp=qp(t=>{t.setUTCSeconds(0,0)},(t,n)=>{t.setTime(+t+n*Bp)},(t,n)=>(n-t)/Bp,t=>t.getUTCMinutes()),Qp=Kp.range,Jp=qp(t=>{t.setTime(t-t.getMilliseconds()-t.getSeconds()*Op-t.getMinutes()*Bp)},(t,n)=>{t.setTime(+t+n*Yp)},(t,n)=>(n-t)/Yp,t=>t.getHours()),tg=Jp.range,ng=qp(t=>{t.setUTCMinutes(0,0,0)},(t,n)=>{t.setTime(+t+n*Yp)},(t,n)=>(n-t)/Yp,t=>t.getUTCHours()),eg=ng.range,rg=qp(t=>t.setHours(0,0,0,0),(t,n)=>t.setDate(t.getDate()+n),(t,n)=>(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*Bp)/Lp,t=>t.getDate()-1),ig=rg.range,og=qp(t=>{t.setUTCHours(0,0,0,0)},(t,n)=>{t.setUTCDate(t.getUTCDate()+n)},(t,n)=>(n-t)/Lp,t=>t.getUTCDate()-1),ag=og.range,ug=qp(t=>{t.setUTCHours(0,0,0,0)},(t,n)=>{t.setUTCDate(t.getUTCDate()+n)},(t,n)=>(n-t)/Lp,t=>Math.floor(t/Lp)),cg=ug.range;function fg(t){return qp(n=>{n.setDate(n.getDate()-(n.getDay()+7-t)%7),n.setHours(0,0,0,0)},(t,n)=>{t.setDate(t.getDate()+7*n)},(t,n)=>(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*Bp)/jp)}const sg=fg(0),lg=fg(1),hg=fg(2),dg=fg(3),pg=fg(4),gg=fg(5),yg=fg(6),vg=sg.range,_g=lg.range,bg=hg.range,mg=dg.range,xg=pg.range,wg=gg.range,Mg=yg.range;function Ag(t){return qp(n=>{n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-t)%7),n.setUTCHours(0,0,0,0)},(t,n)=>{t.setUTCDate(t.getUTCDate()+7*n)},(t,n)=>(n-t)/jp)}const Tg=Ag(0),Sg=Ag(1),Eg=Ag(2),Ng=Ag(3),kg=Ag(4),Cg=Ag(5),Pg=Ag(6),zg=Tg.range,$g=Sg.range,Dg=Eg.range,Rg=Ng.range,Fg=kg.range,qg=Cg.range,Ig=Pg.range,Ug=qp(t=>{t.setDate(1),t.setHours(0,0,0,0)},(t,n)=>{t.setMonth(t.getMonth()+n)},(t,n)=>n.getMonth()-t.getMonth()+12*(n.getFullYear()-t.getFullYear()),t=>t.getMonth()),Og=Ug.range,Bg=qp(t=>{t.setUTCDate(1),t.setUTCHours(0,0,0,0)},(t,n)=>{t.setUTCMonth(t.getUTCMonth()+n)},(t,n)=>n.getUTCMonth()-t.getUTCMonth()+12*(n.getUTCFullYear()-t.getUTCFullYear()),t=>t.getUTCMonth()),Yg=Bg.range,Lg=qp(t=>{t.setMonth(0,1),t.setHours(0,0,0,0)},(t,n)=>{t.setFullYear(t.getFullYear()+n)},(t,n)=>n.getFullYear()-t.getFullYear(),t=>t.getFullYear());Lg.every=t=>isFinite(t=Math.floor(t))&&t>0?qp(n=>{n.setFullYear(Math.floor(n.getFullYear()/t)*t),n.setMonth(0,1),n.setHours(0,0,0,0)},(n,e)=>{n.setFullYear(n.getFullYear()+e*t)}):null;const jg=Lg.range,Hg=qp(t=>{t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)},(t,n)=>{t.setUTCFullYear(t.getUTCFullYear()+n)},(t,n)=>n.getUTCFullYear()-t.getUTCFullYear(),t=>t.getUTCFullYear());Hg.every=t=>isFinite(t=Math.floor(t))&&t>0?qp(n=>{n.setUTCFullYear(Math.floor(n.getUTCFullYear()/t)*t),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},(n,e)=>{n.setUTCFullYear(n.getUTCFullYear()+e*t)}):null;const Xg=Hg.range;function Gg(t,n,e,i,o,a){const u=[[Gp,1,Op],[Gp,5,5e3],[Gp,15,15e3],[Gp,30,3e4],[a,1,Bp],[a,5,3e5],[a,15,9e5],[a,30,18e5],[o,1,Yp],[o,3,108e5],[o,6,216e5],[o,12,432e5],[i,1,Lp],[i,2,1728e5],[e,1,jp],[n,1,Hp],[n,3,7776e6],[t,1,Xp]];function c(n,e,i){const o=Math.abs(e-n)/i,a=r(([,,t])=>t).right(u,o);if(a===u.length)return t.every(V(n/Xp,e/Xp,i));if(0===a)return Ip.every(Math.max(V(n,e,i),1));const[c,f]=u[o/u[a-1][2]<u[a][2]/o?a-1:a];return c.every(f)}return[function(t,n,e){const r=n<t;r&&([t,n]=[n,t]);const i=e&&"function"==typeof e.range?e:c(t,n,e),o=i?i.range(t,+n+1):[];return r?o.reverse():o},c]}const[Vg,Wg]=Gg(Hg,Bg,Tg,ug,ng,Kp),[Zg,Kg]=Gg(Lg,Ug,sg,rg,Jp,Wp);function Qg(t){if(0<=t.y&&t.y<100){var n=new Date(-1,t.m,t.d,t.H,t.M,t.S,t.L);return n.setFullYear(t.y),n}return new Date(t.y,t.m,t.d,t.H,t.M,t.S,t.L)}function Jg(t){if(0<=t.y&&t.y<100){var n=new Date(Date.UTC(-1,t.m,t.d,t.H,t.M,t.S,t.L));return n.setUTCFullYear(t.y),n}return new Date(Date.UTC(t.y,t.m,t.d,t.H,t.M,t.S,t.L))}function ty(t,n,e){return{y:t,m:n,d:e,H:0,M:0,S:0,L:0}}function ny(t){var n=t.dateTime,e=t.date,r=t.time,i=t.periods,o=t.days,a=t.shortDays,u=t.months,c=t.shortMonths,f=fy(i),s=sy(i),l=fy(o),h=sy(o),d=fy(a),p=sy(a),g=fy(u),y=sy(u),v=fy(c),_=sy(c),b={a:function(t){return a[t.getDay()]},A:function(t){return o[t.getDay()]},b:function(t){return c[t.getMonth()]},B:function(t){return u[t.getMonth()]},c:null,d:Py,e:Py,f:Fy,g:Gy,G:Wy,H:zy,I:$y,j:Dy,L:Ry,m:qy,M:Iy,p:function(t){return i[+(t.getHours()>=12)]},q:function(t){return 1+~~(t.getMonth()/3)},Q:_v,s:bv,S:Uy,u:Oy,U:By,V:Ly,w:jy,W:Hy,x:null,X:null,y:Xy,Y:Vy,Z:Zy,"%":vv},m={a:function(t){return a[t.getUTCDay()]},A:function(t){return o[t.getUTCDay()]},b:function(t){return c[t.getUTCMonth()]},B:function(t){return u[t.getUTCMonth()]},c:null,d:Ky,e:Ky,f:ev,g:dv,G:gv,H:Qy,I:Jy,j:tv,L:nv,m:rv,M:iv,p:function(t){return i[+(t.getUTCHours()>=12)]},q:function(t){return 1+~~(t.getUTCMonth()/3)},Q:_v,s:bv,S:ov,u:av,U:uv,V:fv,w:sv,W:lv,x:null,X:null,y:hv,Y:pv,Z:yv,"%":vv},x={a:function(t,n,e){var r=d.exec(n.slice(e));return r?(t.w=p.get(r[0].toLowerCase()),e+r[0].length):-1},A:function(t,n,e){var r=l.exec(n.slice(e));return r?(t.w=h.get(r[0].toLowerCase()),e+r[0].length):-1},b:function(t,n,e){var r=v.exec(n.slice(e));return r?(t.m=_.get(r[0].toLowerCase()),e+r[0].length):-1},B:function(t,n,e){var r=g.exec(n.slice(e));return r?(t.m=y.get(r[0].toLowerCase()),e+r[0].length):-1},c:function(t,e,r){return A(t,n,e,r)},d:xy,e:xy,f:Ey,g:vy,G:yy,H:My,I:My,j:wy,L:Sy,m:my,M:Ay,p:function(t,n,e){var r=f.exec(n.slice(e));return r?(t.p=s.get(r[0].toLowerCase()),e+r[0].length):-1},q:by,Q:ky,s:Cy,S:Ty,u:hy,U:dy,V:py,w:ly,W:gy,x:function(t,n,r){return A(t,e,n,r)},X:function(t,n,e){return A(t,r,n,e)},y:vy,Y:yy,Z:_y,"%":Ny};function w(t,n){return function(e){var r,i,o,a=[],u=-1,c=0,f=t.length;for(e instanceof Date||(e=new Date(+e));++u<f;)37===t.charCodeAt(u)&&(a.push(t.slice(c,u)),null!=(i=ry[r=t.charAt(++u)])?r=t.charAt(++u):i="e"===r?" ":"0",(o=n[r])&&(r=o(e,i)),a.push(r),c=u+1);return a.push(t.slice(c,u)),a.join("")}}function M(t,n){return function(e){var r,i,o=ty(1900,void 0,1);if(A(o,t,e+="",0)!=e.length)return null;if("Q"in o)return new Date(o.Q);if("s"in o)return new Date(1e3*o.s+("L"in o?o.L:0));if(n&&!("Z"in o)&&(o.Z=0),"p"in o&&(o.H=o.H%12+12*o.p),void 0===o.m&&(o.m="q"in o?o.q:0),"V"in o){if(o.V<1||o.V>53)return null;"w"in o||(o.w=1),"Z"in o?(i=(r=Jg(ty(o.y,0,1))).getUTCDay(),r=i>4||0===i?Sg.ceil(r):Sg(r),r=og.offset(r,7*(o.V-1)),o.y=r.getUTCFullYear(),o.m=r.getUTCMonth(),o.d=r.getUTCDate()+(o.w+6)%7):(i=(r=Qg(ty(o.y,0,1))).getDay(),r=i>4||0===i?lg.ceil(r):lg(r),r=rg.offset(r,7*(o.V-1)),o.y=r.getFullYear(),o.m=r.getMonth(),o.d=r.getDate()+(o.w+6)%7)}else("W"in o||"U"in o)&&("w"in o||(o.w="u"in o?o.u%7:"W"in o?1:0),i="Z"in o?Jg(ty(o.y,0,1)).getUTCDay():Qg(ty(o.y,0,1)).getDay(),o.m=0,o.d="W"in o?(o.w+6)%7+7*o.W-(i+5)%7:o.w+7*o.U-(i+6)%7);return"Z"in o?(o.H+=o.Z/100|0,o.M+=o.Z%100,Jg(o)):Qg(o)}}function A(t,n,e,r){for(var i,o,a=0,u=n.length,c=e.length;a<u;){if(r>=c)return-1;if(37===(i=n.charCodeAt(a++))){if(i=n.charAt(a++),!(o=x[i in ry?n.charAt(a++):i])||(r=o(t,e,r))<0)return-1}else if(i!=e.charCodeAt(r++))return-1}return r}return b.x=w(e,b),b.X=w(r,b),b.c=w(n,b),m.x=w(e,m),m.X=w(r,m),m.c=w(n,m),{format:function(t){var n=w(t+="",b);return n.toString=function(){return t},n},parse:function(t){var n=M(t+="",!1);return n.toString=function(){return t},n},utcFormat:function(t){var n=w(t+="",m);return n.toString=function(){return t},n},utcParse:function(t){var n=M(t+="",!0);return n.toString=function(){return t},n}}}var ey,ry={"-":"",_:" ",0:"0"},iy=/^\s*\d+/,oy=/^%/,ay=/[\\^$*+?|[\]().{}]/g;function uy(t,n,e){var r=t<0?"-":"",i=(r?-t:t)+"",o=i.length;return r+(o<e?new Array(e-o+1).join(n)+i:i)}function cy(t){return t.replace(ay,"\\$&")}function fy(t){return new RegExp("^(?:"+t.map(cy).join("|")+")","i")}function sy(t){return new Map(t.map((t,n)=>[t.toLowerCase(),n]))}function ly(t,n,e){var r=iy.exec(n.slice(e,e+1));return r?(t.w=+r[0],e+r[0].length):-1}function hy(t,n,e){var r=iy.exec(n.slice(e,e+1));return r?(t.u=+r[0],e+r[0].length):-1}function dy(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.U=+r[0],e+r[0].length):-1}function py(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.V=+r[0],e+r[0].length):-1}function gy(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.W=+r[0],e+r[0].length):-1}function yy(t,n,e){var r=iy.exec(n.slice(e,e+4));return r?(t.y=+r[0],e+r[0].length):-1}function vy(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.y=+r[0]+(+r[0]>68?1900:2e3),e+r[0].length):-1}function _y(t,n,e){var r=/^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(n.slice(e,e+6));return r?(t.Z=r[1]?0:-(r[2]+(r[3]||"00")),e+r[0].length):-1}function by(t,n,e){var r=iy.exec(n.slice(e,e+1));return r?(t.q=3*r[0]-3,e+r[0].length):-1}function my(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.m=r[0]-1,e+r[0].length):-1}function xy(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.d=+r[0],e+r[0].length):-1}function wy(t,n,e){var r=iy.exec(n.slice(e,e+3));return r?(t.m=0,t.d=+r[0],e+r[0].length):-1}function My(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.H=+r[0],e+r[0].length):-1}function Ay(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.M=+r[0],e+r[0].length):-1}function Ty(t,n,e){var r=iy.exec(n.slice(e,e+2));return r?(t.S=+r[0],e+r[0].length):-1}function Sy(t,n,e){var r=iy.exec(n.slice(e,e+3));return r?(t.L=+r[0],e+r[0].length):-1}function Ey(t,n,e){var r=iy.exec(n.slice(e,e+6));return r?(t.L=Math.floor(r[0]/1e3),e+r[0].length):-1}function Ny(t,n,e){var r=oy.exec(n.slice(e,e+1));return r?e+r[0].length:-1}function ky(t,n,e){var r=iy.exec(n.slice(e));return r?(t.Q=+r[0],e+r[0].length):-1}function Cy(t,n,e){var r=iy.exec(n.slice(e));return r?(t.s=+r[0],e+r[0].length):-1}function Py(t,n){return uy(t.getDate(),n,2)}function zy(t,n){return uy(t.getHours(),n,2)}function $y(t,n){return uy(t.getHours()%12||12,n,2)}function Dy(t,n){return uy(1+rg.count(Lg(t),t),n,3)}function Ry(t,n){return uy(t.getMilliseconds(),n,3)}function Fy(t,n){return Ry(t,n)+"000"}function qy(t,n){return uy(t.getMonth()+1,n,2)}function Iy(t,n){return uy(t.getMinutes(),n,2)}function Uy(t,n){return uy(t.getSeconds(),n,2)}function Oy(t){var n=t.getDay();return 0===n?7:n}function By(t,n){return uy(sg.count(Lg(t)-1,t),n,2)}function Yy(t){var n=t.getDay();return n>=4||0===n?pg(t):pg.ceil(t)}function Ly(t,n){return t=Yy(t),uy(pg.count(Lg(t),t)+(4===Lg(t).getDay()),n,2)}function jy(t){return t.getDay()}function Hy(t,n){return uy(lg.count(Lg(t)-1,t),n,2)}function Xy(t,n){return uy(t.getFullYear()%100,n,2)}function Gy(t,n){return uy((t=Yy(t)).getFullYear()%100,n,2)}function Vy(t,n){return uy(t.getFullYear()%1e4,n,4)}function Wy(t,n){var e=t.getDay();return uy((t=e>=4||0===e?pg(t):pg.ceil(t)).getFullYear()%1e4,n,4)}function Zy(t){var n=t.getTimezoneOffset();return(n>0?"-":(n*=-1,"+"))+uy(n/60|0,"0",2)+uy(n%60,"0",2)}function Ky(t,n){return uy(t.getUTCDate(),n,2)}function Qy(t,n){return uy(t.getUTCHours(),n,2)}function Jy(t,n){return uy(t.getUTCHours()%12||12,n,2)}function tv(t,n){return uy(1+og.count(Hg(t),t),n,3)}function nv(t,n){return uy(t.getUTCMilliseconds(),n,3)}function ev(t,n){return nv(t,n)+"000"}function rv(t,n){return uy(t.getUTCMonth()+1,n,2)}function iv(t,n){return uy(t.getUTCMinutes(),n,2)}function ov(t,n){return uy(t.getUTCSeconds(),n,2)}function av(t){var n=t.getUTCDay();return 0===n?7:n}function uv(t,n){return uy(Tg.count(Hg(t)-1,t),n,2)}function cv(t){var n=t.getUTCDay();return n>=4||0===n?kg(t):kg.ceil(t)}function fv(t,n){return t=cv(t),uy(kg.count(Hg(t),t)+(4===Hg(t).getUTCDay()),n,2)}function sv(t){return t.getUTCDay()}function lv(t,n){return uy(Sg.count(Hg(t)-1,t),n,2)}function hv(t,n){return uy(t.getUTCFullYear()%100,n,2)}function dv(t,n){return uy((t=cv(t)).getUTCFullYear()%100,n,2)}function pv(t,n){return uy(t.getUTCFullYear()%1e4,n,4)}function gv(t,n){var e=t.getUTCDay();return uy((t=e>=4||0===e?kg(t):kg.ceil(t)).getUTCFullYear()%1e4,n,4)}function yv(){return"+0000"}function vv(){return"%"}function _v(t){return+t}function bv(t){return Math.floor(+t/1e3)}function mv(n){return ey=ny(n),t.timeFormat=ey.format,t.timeParse=ey.parse,t.utcFormat=ey.utcFormat,t.utcParse=ey.utcParse,ey}t.timeFormat=void 0,t.timeParse=void 0,t.utcFormat=void 0,t.utcParse=void 0,mv({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});var xv="%Y-%m-%dT%H:%M:%S.%LZ";var wv=Date.prototype.toISOString?function(t){return t.toISOString()}:t.utcFormat(xv);var Mv=+new Date("2000-01-01T00:00:00.000Z")?function(t){var n=new Date(t);return isNaN(n)?null:n}:t.utcParse(xv);function Av(t,n){switch(arguments.length){case 0:break;case 1:this.range(t);break;default:this.range(n).domain(t)}return this}function Tv(t,n){switch(arguments.length){case 0:break;case 1:"function"==typeof t?this.interpolator(t):this.range(t);break;default:this.domain(t),"function"==typeof n?this.interpolator(n):this.range(n)}return this}const Sv=Symbol("implicit");function Ev(){var t=new InternMap,n=[],e=[],r=Sv;function i(i){let o=t.get(i);if(void 0===o){if(r!==Sv)return r;t.set(i,o=n.push(i)-1)}return e[o%e.length]}return i.domain=function(e){if(!arguments.length)return n.slice();n=[],t=new InternMap;for(const r of e)t.has(r)||t.set(r,n.push(r)-1);return i},i.range=function(t){return arguments.length?(e=Array.from(t),i):e.slice()},i.unknown=function(t){return arguments.length?(r=t,i):r},i.copy=function(){return Ev(n,e).unknown(r)},Av.apply(i,arguments),i}function Nv(){var t,n,e=Ev().unknown(void 0),r=e.domain,i=e.range,o=0,a=1,u=!1,c=0,f=0,s=.5;function l(){var e=r().length,l=a<o,h=l?a:o,d=l?o:a;t=(d-h)/Math.max(1,e-c+2*f),u&&(t=Math.floor(t)),h+=(d-h-t*(e-c))*s,n=t*(1-c),u&&(h=Math.round(h),n=Math.round(n));var p=st(e).map(function(n){return h+t*n});return i(l?p.reverse():p)}return delete e.unknown,e.domain=function(t){return arguments.length?(r(t),l()):r()},e.range=function(t){return arguments.length?([o,a]=t,o=+o,a=+a,l()):[o,a]},e.rangeRound=function(t){return[o,a]=t,o=+o,a=+a,u=!0,l()},e.bandwidth=function(){return n},e.step=function(){return t},e.round=function(t){return arguments.length?(u=!!t,l()):u},e.padding=function(t){return arguments.length?(c=Math.min(1,f=+t),l()):c},e.paddingInner=function(t){return arguments.length?(c=Math.min(1,t),l()):c},e.paddingOuter=function(t){return arguments.length?(f=+t,l()):f},e.align=function(t){return arguments.length?(s=Math.max(0,Math.min(1,t)),l()):s},e.copy=function(){return Nv(r(),[o,a]).round(u).paddingInner(c).paddingOuter(f).align(s)},Av.apply(l(),arguments)}function kv(t){var n=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return kv(n())},t}function Cv(t){return+t}var Pv=[0,1];function zv(t){return t}function $v(t,n){return(n-=t=+t)?function(e){return(e-t)/n}:function(t){return function(){return t}}(isNaN(n)?NaN:.5)}function Dv(t,n,e){var r=t[0],i=t[1],o=n[0],a=n[1];return i<r?(r=$v(i,r),o=e(a,o)):(r=$v(r,i),o=e(o,a)),function(t){return o(r(t))}}function Rv(t,n,e){var r=Math.min(t.length,n.length)-1,i=new Array(r),o=new Array(r),a=-1;for(t[r]<t[0]&&(t=t.slice().reverse(),n=n.slice().reverse());++a<r;)i[a]=$v(t[a],t[a+1]),o[a]=e(n[a],n[a+1]);return function(n){var e=u(t,n,1,r)-1;return o[e](i[e](n))}}function Fv(t,n){return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp()).unknown(t.unknown())}function qv(){var t,n,e,r,i,o,a=Pv,u=Pv,c=Br,f=zv;function s(){var t=Math.min(a.length,u.length);return f!==zv&&(f=function(t,n){var e;return t>n&&(e=t,t=n,n=e),function(e){return Math.max(t,Math.min(n,e))}}(a[0],a[t-1])),r=t>2?Rv:Dv,i=o=null,l}function l(n){return null==n||isNaN(n=+n)?e:(i||(i=r(a.map(t),u,c)))(t(f(n)))}return l.invert=function(e){return f(n((o||(o=r(u,a.map(t),Fr)))(e)))},l.domain=function(t){return arguments.length?(a=Array.from(t,Cv),s()):a.slice()},l.range=function(t){return arguments.length?(u=Array.from(t),s()):u.slice()},l.rangeRound=function(t){return u=Array.from(t),c=Yr,s()},l.clamp=function(t){return arguments.length?(f=!!t||zv,s()):f!==zv},l.interpolate=function(t){return arguments.length?(c=t,s()):c},l.unknown=function(t){return arguments.length?(e=t,l):e},function(e,r){return t=e,n=r,s()}}function Iv(){return qv()(zv,zv)}function Uv(n,e,r,i){var o,a=V(n,e,r);switch((i=kc(null==i?",f":i)).type){case"s":var u=Math.max(Math.abs(n),Math.abs(e));return null!=i.precision||isNaN(o=Oc(a,u))||(i.precision=o),t.formatPrefix(i,u);case"":case"e":case"g":case"p":case"r":null!=i.precision||isNaN(o=Bc(a,Math.max(Math.abs(n),Math.abs(e))))||(i.precision=o-("e"===i.type));break;case"f":case"%":null!=i.precision||isNaN(o=Uc(a))||(i.precision=o-2*("%"===i.type))}return t.format(i)}function Ov(t){var n=t.domain;return t.ticks=function(t){var e=n();return X(e[0],e[e.length-1],null==t?10:t)},t.tickFormat=function(t,e){var r=n();return Uv(r[0],r[r.length-1],null==t?10:t,e)},t.nice=function(e){null==e&&(e=10);var r,i,o=n(),a=0,u=o.length-1,c=o[a],f=o[u],s=10;for(f<c&&(i=c,c=f,f=i,i=a,a=u,u=i);s-- >0;){if((i=G(c,f,e))===r)return o[a]=c,o[u]=f,n(o);if(i>0)c=Math.floor(c/i)*i,f=Math.ceil(f/i)*i;else{if(!(i<0))break;c=Math.ceil(c*i)/i,f=Math.floor(f*i)/i}r=i}return t},t}function Bv(t,n){var e,r=0,i=(t=t.slice()).length-1,o=t[r],a=t[i];return a<o&&(e=r,r=i,i=e,e=o,o=a,a=e),t[r]=n.floor(o),t[i]=n.ceil(a),t}function Yv(t){return Math.log(t)}function Lv(t){return Math.exp(t)}function jv(t){return-Math.log(-t)}function Hv(t){return-Math.exp(-t)}function Xv(t){return isFinite(t)?+("1e"+t):t<0?0:t}function Gv(t){return(n,e)=>-t(-n,e)}function Vv(n){const e=n(Yv,Lv),r=e.domain;let i,o,a=10;function u(){return i=function(t){return t===Math.E?Math.log:10===t&&Math.log10||2===t&&Math.log2||(t=Math.log(t),n=>Math.log(n)/t)}(a),o=function(t){return 10===t?Xv:t===Math.E?Math.exp:n=>Math.pow(t,n)}(a),r()[0]<0?(i=Gv(i),o=Gv(o),n(jv,Hv)):n(Yv,Lv),e}return e.base=function(t){return arguments.length?(a=+t,u()):a},e.domain=function(t){return arguments.length?(r(t),u()):r()},e.ticks=t=>{const n=r();let e=n[0],u=n[n.length-1];const c=u<e;c&&([e,u]=[u,e]);let f,s,l=i(e),h=i(u);const d=null==t?10:+t;let p=[];if(!(a%1)&&h-l<d){if(l=Math.floor(l),h=Math.ceil(h),e>0){for(;l<=h;++l)for(f=1;f<a;++f)if(s=l<0?f/o(-l):f*o(l),!(s<e)){if(s>u)break;p.push(s)}}else for(;l<=h;++l)for(f=a-1;f>=1;--f)if(s=l>0?f/o(-l):f*o(l),!(s<e)){if(s>u)break;p.push(s)}2*p.length<d&&(p=X(e,u,d))}else p=X(l,h,Math.min(h-l,d)).map(o);return c?p.reverse():p},e.tickFormat=(n,r)=>{if(null==n&&(n=10),null==r&&(r=10===a?"s":","),"function"!=typeof r&&(a%1||null!=(r=kc(r)).precision||(r.trim=!0),r=t.format(r)),n===1/0)return r;const u=Math.max(1,a*n/e.ticks().length);return t=>{let n=t/o(Math.round(i(t)));return n*a<a-.5&&(n*=a),n<=u?r(t):""}},e.nice=()=>r(Bv(r(),{floor:t=>o(Math.floor(i(t))),ceil:t=>o(Math.ceil(i(t)))})),e}function Wv(t){return function(n){return Math.sign(n)*Math.log1p(Math.abs(n/t))}}function Zv(t){return function(n){return Math.sign(n)*Math.expm1(Math.abs(n))*t}}function Kv(t){var n=1,e=t(Wv(n),Zv(n));return e.constant=function(e){return arguments.length?t(Wv(n=+e),Zv(n)):n},Ov(e)}function Qv(t){return function(n){return n<0?-Math.pow(-n,t):Math.pow(n,t)}}function Jv(t){return t<0?-Math.sqrt(-t):Math.sqrt(t)}function t_(t){return t<0?-t*t:t*t}function n_(t){var n=t(zv,zv),e=1;return n.exponent=function(n){return arguments.length?1===(e=+n)?t(zv,zv):.5===e?t(Jv,t_):t(Qv(e),Qv(1/e)):e},Ov(n)}function e_(){var t=n_(qv());return t.copy=function(){return Fv(t,e_()).exponent(t.exponent())},Av.apply(t,arguments),t}function r_(t){return Math.sign(t)*t*t}function i_(t){return new Date(t)}function o_(t){return t instanceof Date?+t:Math.round(t)}function a_(t,n,e,r,i,o,a,u,c,f){var s=Iv(),l=s.invert,h=s.domain,d=f(".%L"),p=f(":%S"),g=f("%I:%M"),y=f("%I %p"),v=f("%a %d"),_=f("%b %d"),b=f("%B"),m=f("%Y");function x(t){return(c(t)<t?d:u(t)<t?p:a(t)<t?g:o(t)<t?y:r(t)<t?i(t)<t?v:_:e(t)<t?b:m)(t)}return s.invert=function(t){return new Date(Math.round(l(t)))},s.domain=function(t){return arguments.length?h(Array.from(t,o_)):h().map(i_)},s.ticks=function(n){var e=h();return t(e[0],e[e.length-1],null==n?10:n)},s.tickFormat=function(t,n){return null==n?x:f(n)},s.nice=function(t){var e=h();return t&&"function"==typeof t.range||(t=n(e[0],e[e.length-1],null==t?10:t)),t?h(Bv(e,t)):s},s.copy=function(){return Fv(s,a_(t,n,e,r,i,o,a,u,c,f))},s}function u_(){var t,n,e,r,i,o=0,a=1,u=zv,c=!1;function f(n){return null==n||isNaN(n=+n)?i:u(0===e?.5:(n=(r(n)-t)*e,c?Math.max(0,Math.min(1,n)):n))}function s(t){return function(n){var e,r;return arguments.length?([e,r]=n,u=t(e,r),f):[u(0),u(1)]}}return f.domain=function(i){return arguments.length?([o,a]=i,t=r(o=+o),n=r(a=+a),e=t===n?0:1/(n-t),f):[o,a]},f.clamp=function(t){return arguments.length?(c=!!t,f):c},f.interpolator=function(t){return arguments.length?(u=t,f):u},f.range=s(Br),f.rangeRound=s(Yr),f.unknown=function(t){return arguments.length?(i=t,f):i},function(i){return r=i,t=i(o),n=i(a),e=t===n?0:1/(n-t),f}}function c_(t,n){return n.domain(t.domain()).interpolator(t.interpolator()).clamp(t.clamp()).unknown(t.unknown())}function f_(){var t=n_(u_());return t.copy=function(){return c_(t,f_()).exponent(t.exponent())},Tv.apply(t,arguments)}function s_(){var t,n,e,r,i,o,a,u=0,c=.5,f=1,s=1,l=zv,h=!1;function d(t){return null==t||isNaN(t=+t)?a:(t=.5+((t=+o(t))-n)*(s*t<s*n?r:i),l(h?Math.max(0,Math.min(1,t)):t))}function p(t){return function(n){var e,r,i;return arguments.length?([e,r,i]=n,l=ui(t,[e,r,i]),d):[l(0),l(.5),l(1)]}}return d.domain=function(a){return arguments.length?([u,c,f]=a,t=o(u=+u),n=o(c=+c),e=o(f=+f),r=t===n?0:.5/(n-t),i=n===e?0:.5/(e-n),s=n<t?-1:1,d):[u,c,f]},d.clamp=function(t){return arguments.length?(h=!!t,d):h},d.interpolator=function(t){return arguments.length?(l=t,d):l},d.range=p(Br),d.rangeRound=p(Yr),d.unknown=function(t){return arguments.length?(a=t,d):a},function(a){return o=a,t=a(u),n=a(c),e=a(f),r=t===n?0:.5/(n-t),i=n===e?0:.5/(e-n),s=n<t?-1:1,d}}function l_(){var t=n_(s_());return t.copy=function(){return c_(t,l_()).exponent(t.exponent())},Tv.apply(t,arguments)}function h_(t){for(var n=t.length/6|0,e=new Array(n),r=0;r<n;)e[r]="#"+t.slice(6*r,6*++r);return e}var d_=h_("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"),p_=h_("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666"),g_=h_("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666"),y_=h_("4269d0efb118ff725c6cc5b03ca951ff8ab7a463f297bbf59c6b4e9498a0"),v_=h_("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928"),__=h_("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2"),b_=h_("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc"),m_=h_("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999"),x_=h_("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3"),w_=h_("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f"),M_=h_("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab"),A_=t=>Cr(t[t.length-1]),T_=new Array(3).concat("d8b365f5f5f55ab4ac","a6611adfc27d80cdc1018571","a6611adfc27df5f5f580cdc1018571","8c510ad8b365f6e8c3c7eae55ab4ac01665e","8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e","8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e","8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e","5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30","5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30").map(h_),S_=A_(T_),E_=new Array(3).concat("af8dc3f7f7f77fbf7b","7b3294c2a5cfa6dba0008837","7b3294c2a5cff7f7f7a6dba0008837","762a83af8dc3e7d4e8d9f0d37fbf7b1b7837","762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837","762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837","762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837","40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b","40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b").map(h_),N_=A_(E_),k_=new Array(3).concat("e9a3c9f7f7f7a1d76a","d01c8bf1b6dab8e1864dac26","d01c8bf1b6daf7f7f7b8e1864dac26","c51b7de9a3c9fde0efe6f5d0a1d76a4d9221","c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221","c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221","c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221","8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419","8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419").map(h_),C_=A_(k_),P_=new Array(3).concat("998ec3f7f7f7f1a340","5e3c99b2abd2fdb863e66101","5e3c99b2abd2f7f7f7fdb863e66101","542788998ec3d8daebfee0b6f1a340b35806","542788998ec3d8daebf7f7f7fee0b6f1a340b35806","5427888073acb2abd2d8daebfee0b6fdb863e08214b35806","5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806","2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08","2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08").map(h_),z_=A_(P_),$_=new Array(3).concat("ef8a62f7f7f767a9cf","ca0020f4a58292c5de0571b0","ca0020f4a582f7f7f792c5de0571b0","b2182bef8a62fddbc7d1e5f067a9cf2166ac","b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac","b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac","b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac","67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061","67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061").map(h_),D_=A_($_),R_=new Array(3).concat("ef8a62ffffff999999","ca0020f4a582bababa404040","ca0020f4a582ffffffbababa404040","b2182bef8a62fddbc7e0e0e09999994d4d4d","b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d","b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d","b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d","67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a","67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a").map(h_),F_=A_(R_),q_=new Array(3).concat("fc8d59ffffbf91bfdb","d7191cfdae61abd9e92c7bb6","d7191cfdae61ffffbfabd9e92c7bb6","d73027fc8d59fee090e0f3f891bfdb4575b4","d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4","d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4","d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4","a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695","a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695").map(h_),I_=A_(q_),U_=new Array(3).concat("fc8d59ffffbf91cf60","d7191cfdae61a6d96a1a9641","d7191cfdae61ffffbfa6d96a1a9641","d73027fc8d59fee08bd9ef8b91cf601a9850","d73027fc8d59fee08bffffbfd9ef8b91cf601a9850","d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850","d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850","a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837","a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837").map(h_),O_=A_(U_),B_=new Array(3).concat("fc8d59ffffbf99d594","d7191cfdae61abdda42b83ba","d7191cfdae61ffffbfabdda42b83ba","d53e4ffc8d59fee08be6f59899d5943288bd","d53e4ffc8d59fee08bffffbfe6f59899d5943288bd","d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd","d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd","9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2","9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2").map(h_),Y_=A_(B_),L_=new Array(3).concat("e5f5f999d8c92ca25f","edf8fbb2e2e266c2a4238b45","edf8fbb2e2e266c2a42ca25f006d2c","edf8fbccece699d8c966c2a42ca25f006d2c","edf8fbccece699d8c966c2a441ae76238b45005824","f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824","f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b").map(h_),j_=A_(L_),H_=new Array(3).concat("e0ecf49ebcda8856a7","edf8fbb3cde38c96c688419d","edf8fbb3cde38c96c68856a7810f7c","edf8fbbfd3e69ebcda8c96c68856a7810f7c","edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b","f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b","f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b").map(h_),X_=A_(H_),G_=new Array(3).concat("e0f3dba8ddb543a2ca","f0f9e8bae4bc7bccc42b8cbe","f0f9e8bae4bc7bccc443a2ca0868ac","f0f9e8ccebc5a8ddb57bccc443a2ca0868ac","f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e","f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e","f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081").map(h_),V_=A_(G_),W_=new Array(3).concat("fee8c8fdbb84e34a33","fef0d9fdcc8afc8d59d7301f","fef0d9fdcc8afc8d59e34a33b30000","fef0d9fdd49efdbb84fc8d59e34a33b30000","fef0d9fdd49efdbb84fc8d59ef6548d7301f990000","fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000","fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000").map(h_),Z_=A_(W_),K_=new Array(3).concat("ece2f0a6bddb1c9099","f6eff7bdc9e167a9cf02818a","f6eff7bdc9e167a9cf1c9099016c59","f6eff7d0d1e6a6bddb67a9cf1c9099016c59","f6eff7d0d1e6a6bddb67a9cf3690c002818a016450","fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450","fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636").map(h_),Q_=A_(K_),J_=new Array(3).concat("ece7f2a6bddb2b8cbe","f1eef6bdc9e174a9cf0570b0","f1eef6bdc9e174a9cf2b8cbe045a8d","f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d","f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b","fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b","fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858").map(h_),tb=A_(J_),nb=new Array(3).concat("e7e1efc994c7dd1c77","f1eef6d7b5d8df65b0ce1256","f1eef6d7b5d8df65b0dd1c77980043","f1eef6d4b9dac994c7df65b0dd1c77980043","f1eef6d4b9dac994c7df65b0e7298ace125691003f","f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f","f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f").map(h_),eb=A_(nb),rb=new Array(3).concat("fde0ddfa9fb5c51b8a","feebe2fbb4b9f768a1ae017e","feebe2fbb4b9f768a1c51b8a7a0177","feebe2fcc5c0fa9fb5f768a1c51b8a7a0177","feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177","fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177","fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a").map(h_),ib=A_(rb),ob=new Array(3).concat("edf8b17fcdbb2c7fb8","ffffcca1dab441b6c4225ea8","ffffcca1dab441b6c42c7fb8253494","ffffccc7e9b47fcdbb41b6c42c7fb8253494","ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84","ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84","ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58").map(h_),ab=A_(ob),ub=new Array(3).concat("f7fcb9addd8e31a354","ffffccc2e69978c679238443","ffffccc2e69978c67931a354006837","ffffccd9f0a3addd8e78c67931a354006837","ffffccd9f0a3addd8e78c67941ab5d238443005a32","ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32","ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529").map(h_),cb=A_(ub),fb=new Array(3).concat("fff7bcfec44fd95f0e","ffffd4fed98efe9929cc4c02","ffffd4fed98efe9929d95f0e993404","ffffd4fee391fec44ffe9929d95f0e993404","ffffd4fee391fec44ffe9929ec7014cc4c028c2d04","ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04","ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506").map(h_),sb=A_(fb),lb=new Array(3).concat("ffeda0feb24cf03b20","ffffb2fecc5cfd8d3ce31a1c","ffffb2fecc5cfd8d3cf03b20bd0026","ffffb2fed976feb24cfd8d3cf03b20bd0026","ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026","ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026","ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026").map(h_),hb=A_(lb),db=new Array(3).concat("deebf79ecae13182bd","eff3ffbdd7e76baed62171b5","eff3ffbdd7e76baed63182bd08519c","eff3ffc6dbef9ecae16baed63182bd08519c","eff3ffc6dbef9ecae16baed64292c62171b5084594","f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594","f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b").map(h_),pb=A_(db),gb=new Array(3).concat("e5f5e0a1d99b31a354","edf8e9bae4b374c476238b45","edf8e9bae4b374c47631a354006d2c","edf8e9c7e9c0a1d99b74c47631a354006d2c","edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32","f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32","f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b").map(h_),yb=A_(gb),vb=new Array(3).concat("f0f0f0bdbdbd636363","f7f7f7cccccc969696525252","f7f7f7cccccc969696636363252525","f7f7f7d9d9d9bdbdbd969696636363252525","f7f7f7d9d9d9bdbdbd969696737373525252252525","fffffff0f0f0d9d9d9bdbdbd969696737373525252252525","fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000").map(h_),_b=A_(vb),bb=new Array(3).concat("efedf5bcbddc756bb1","f2f0f7cbc9e29e9ac86a51a3","f2f0f7cbc9e29e9ac8756bb154278f","f2f0f7dadaebbcbddc9e9ac8756bb154278f","f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486","fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486","fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d").map(h_),mb=A_(bb),xb=new Array(3).concat("fee0d2fc9272de2d26","fee5d9fcae91fb6a4acb181d","fee5d9fcae91fb6a4ade2d26a50f15","fee5d9fcbba1fc9272fb6a4ade2d26a50f15","fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d","fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d","fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d").map(h_),wb=A_(xb),Mb=new Array(3).concat("fee6cefdae6be6550d","feeddefdbe85fd8d3cd94701","feeddefdbe85fd8d3ce6550da63603","feeddefdd0a2fdae6bfd8d3ce6550da63603","feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04","fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04","fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704").map(h_),Ab=A_(Mb);var Tb=ai(_r(300,.5,0),_r(-240,.5,1)),Sb=ai(_r(-100,.75,.35),_r(80,1.5,.8)),Eb=ai(_r(260,.75,.35),_r(80,1.5,.8)),Nb=_r();var kb=Pe(),Cb=Math.PI/3,Pb=2*Math.PI/3;function zb(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}}var $b=zb(h_("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725")),Db=zb(h_("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf")),Rb=zb(h_("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4")),Fb=zb(h_("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));function qb(t){return function(){return t}}const Ib=Math.abs,Ub=Math.atan2,Ob=Math.cos,Bb=Math.max,Yb=Math.min,Lb=Math.sin,jb=Math.sqrt,Hb=1e-12,Xb=Math.PI,Gb=Xb/2,Vb=2*Xb;function Wb(t){return t>=1?Gb:t<=-1?-Gb:Math.asin(t)}function Zb(t){let n=3;return t.digits=function(e){if(!arguments.length)return n;if(null==e)n=null;else{const t=Math.floor(e);if(!(t>=0))throw new RangeError(`invalid digits: ${e}`);n=t}return t},()=>new ha(n)}function Kb(t){return t.innerRadius}function Qb(t){return t.outerRadius}function Jb(t){return t.startAngle}function tm(t){return t.endAngle}function nm(t){return t&&t.padAngle}function em(t,n,e,r,i,o,a){var u=t-e,c=n-r,f=(a?o:-o)/jb(u*u+c*c),s=f*c,l=-f*u,h=t+s,d=n+l,p=e+s,g=r+l,y=(h+p)/2,v=(d+g)/2,_=p-h,b=g-d,m=_*_+b*b,x=i-o,w=h*g-p*d,M=(b<0?-1:1)*jb(Bb(0,x*x*m-w*w)),A=(w*b-_*M)/m,T=(-w*_-b*M)/m,S=(w*b+_*M)/m,E=(-w*_+b*M)/m,N=A-y,k=T-v,C=S-y,P=E-v;return N*N+k*k>C*C+P*P&&(A=S,T=E),{cx:A,cy:T,x01:-s,y01:-l,x11:A*(i/x-1),y11:T*(i/x-1)}}var rm=Array.prototype.slice;function im(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function om(t){this._context=t}function am(t){return new om(t)}function um(t){return t[0]}function cm(t){return t[1]}function fm(t,n){var e=qb(!0),r=null,i=am,o=null,a=Zb(u);function u(u){var c,f,s,l=(u=im(u)).length,h=!1;for(null==r&&(o=i(s=a())),c=0;c<=l;++c)!(c<l&&e(f=u[c],c,u))===h&&((h=!h)?o.lineStart():o.lineEnd()),h&&o.point(+t(f,c,u),+n(f,c,u));if(s)return o=null,s+""||null}return t="function"==typeof t?t:void 0===t?um:qb(t),n="function"==typeof n?n:void 0===n?cm:qb(n),u.x=function(n){return arguments.length?(t="function"==typeof n?n:qb(+n),u):t},u.y=function(t){return arguments.length?(n="function"==typeof t?t:qb(+t),u):n},u.defined=function(t){return arguments.length?(e="function"==typeof t?t:qb(!!t),u):e},u.curve=function(t){return arguments.length?(i=t,null!=r&&(o=i(r)),u):i},u.context=function(t){return arguments.length?(null==t?r=o=null:o=i(r=t),u):r},u}function sm(t,n,e){var r=null,i=qb(!0),o=null,a=am,u=null,c=Zb(f);function f(f){var s,l,h,d,p,g=(f=im(f)).length,y=!1,v=new Array(g),_=new Array(g);for(null==o&&(u=a(p=c())),s=0;s<=g;++s){if(!(s<g&&i(d=f[s],s,f))===y)if(y=!y)l=s,u.areaStart(),u.lineStart();else{for(u.lineEnd(),u.lineStart(),h=s-1;h>=l;--h)u.point(v[h],_[h]);u.lineEnd(),u.areaEnd()}y&&(v[s]=+t(d,s,f),_[s]=+n(d,s,f),u.point(r?+r(d,s,f):v[s],e?+e(d,s,f):_[s]))}if(p)return u=null,p+""||null}function s(){return fm().defined(i).curve(a).context(o)}return t="function"==typeof t?t:void 0===t?um:qb(+t),n="function"==typeof n?n:qb(void 0===n?0:+n),e="function"==typeof e?e:void 0===e?cm:qb(+e),f.x=function(n){return arguments.length?(t="function"==typeof n?n:qb(+n),r=null,f):t},f.x0=function(n){return arguments.length?(t="function"==typeof n?n:qb(+n),f):t},f.x1=function(t){return arguments.length?(r=null==t?null:"function"==typeof t?t:qb(+t),f):r},f.y=function(t){return arguments.length?(n="function"==typeof t?t:qb(+t),e=null,f):n},f.y0=function(t){return arguments.length?(n="function"==typeof t?t:qb(+t),f):n},f.y1=function(t){return arguments.length?(e=null==t?null:"function"==typeof t?t:qb(+t),f):e},f.lineX0=f.lineY0=function(){return s().x(t).y(n)},f.lineY1=function(){return s().x(t).y(e)},f.lineX1=function(){return s().x(r).y(n)},f.defined=function(t){return arguments.length?(i="function"==typeof t?t:qb(!!t),f):i},f.curve=function(t){return arguments.length?(a=t,null!=o&&(u=a(o)),f):a},f.context=function(t){return arguments.length?(null==t?o=u=null:u=a(o=t),f):o},f}function lm(t,n){return n<t?-1:n>t?1:n>=t?0:NaN}function hm(t){return t}om.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._context.lineTo(t,n)}}};var dm=gm(am);function pm(t){this._curve=t}function gm(t){function n(n){return new pm(t(n))}return n._curve=t,n}function ym(t){var n=t.curve;return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t.curve=function(t){return arguments.length?n(gm(t)):n()._curve},t}function vm(){return ym(fm().curve(dm))}function _m(){var t=sm().curve(dm),n=t.curve,e=t.lineX0,r=t.lineX1,i=t.lineY0,o=t.lineY1;return t.angle=t.x,delete t.x,t.startAngle=t.x0,delete t.x0,t.endAngle=t.x1,delete t.x1,t.radius=t.y,delete t.y,t.innerRadius=t.y0,delete t.y0,t.outerRadius=t.y1,delete t.y1,t.lineStartAngle=function(){return ym(e())},delete t.lineX0,t.lineEndAngle=function(){return ym(r())},delete t.lineX1,t.lineInnerRadius=function(){return ym(i())},delete t.lineY0,t.lineOuterRadius=function(){return ym(o())},delete t.lineY1,t.curve=function(t){return arguments.length?n(gm(t)):n()._curve},t}function bm(t,n){return[(n=+n)*Math.cos(t-=Math.PI/2),n*Math.sin(t)]}pm.prototype={areaStart:function(){this._curve.areaStart()},areaEnd:function(){this._curve.areaEnd()},lineStart:function(){this._curve.lineStart()},lineEnd:function(){this._curve.lineEnd()},point:function(t,n){this._curve.point(n*Math.sin(t),n*-Math.cos(t))}};class mm{constructor(t,n){this._context=t,this._x=n}areaStart(){this._line=0}areaEnd(){this._line=NaN}lineStart(){this._point=0}lineEnd(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line}point(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._x?this._context.bezierCurveTo(this._x0=(this._x0+t)/2,this._y0,this._x0,n,t,n):this._context.bezierCurveTo(this._x0,this._y0=(this._y0+n)/2,t,this._y0,t,n)}this._x0=t,this._y0=n}}class xm{constructor(t){this._context=t}lineStart(){this._point=0}lineEnd(){}point(t,n){if(t=+t,n=+n,0===this._point)this._point=1;else{const e=bm(this._x0,this._y0),r=bm(this._x0,this._y0=(this._y0+n)/2),i=bm(t,this._y0),o=bm(t,n);this._context.moveTo(...e),this._context.bezierCurveTo(...r,...i,...o)}this._x0=t,this._y0=n}}function wm(t){return new mm(t,!0)}function Mm(t){return new mm(t,!1)}function Am(t){return new xm(t)}function Tm(t){return t.source}function Sm(t){return t.target}function Em(t){let n=Tm,e=Sm,r=um,i=cm,o=null,a=null,u=Zb(c);function c(){let c;const f=rm.call(arguments),s=n.apply(this,f),l=e.apply(this,f);if(null==o&&(a=t(c=u())),a.lineStart(),f[0]=s,a.point(+r.apply(this,f),+i.apply(this,f)),f[0]=l,a.point(+r.apply(this,f),+i.apply(this,f)),a.lineEnd(),c)return a=null,c+""||null}return c.source=function(t){return arguments.length?(n=t,c):n},c.target=function(t){return arguments.length?(e=t,c):e},c.x=function(t){return arguments.length?(r="function"==typeof t?t:qb(+t),c):r},c.y=function(t){return arguments.length?(i="function"==typeof t?t:qb(+t),c):i},c.context=function(n){return arguments.length?(null==n?o=a=null:a=t(o=n),c):o},c}const Nm=jb(3);var km={draw(t,n){const e=.59436*jb(n+Yb(n/28,.75)),r=e/2,i=r*Nm;t.moveTo(0,e),t.lineTo(0,-e),t.moveTo(-i,-r),t.lineTo(i,r),t.moveTo(-i,r),t.lineTo(i,-r)}},Cm={draw(t,n){const e=jb(n/Xb);t.moveTo(e,0),t.arc(0,0,e,0,Vb)}},Pm={draw(t,n){const e=jb(n/5)/2;t.moveTo(-3*e,-e),t.lineTo(-e,-e),t.lineTo(-e,-3*e),t.lineTo(e,-3*e),t.lineTo(e,-e),t.lineTo(3*e,-e),t.lineTo(3*e,e),t.lineTo(e,e),t.lineTo(e,3*e),t.lineTo(-e,3*e),t.lineTo(-e,e),t.lineTo(-3*e,e),t.closePath()}};const zm=jb(1/3),$m=2*zm;var Dm={draw(t,n){const e=jb(n/$m),r=e*zm;t.moveTo(0,-e),t.lineTo(r,0),t.lineTo(0,e),t.lineTo(-r,0),t.closePath()}},Rm={draw(t,n){const e=.62625*jb(n);t.moveTo(0,-e),t.lineTo(e,0),t.lineTo(0,e),t.lineTo(-e,0),t.closePath()}},Fm={draw(t,n){const e=.87559*jb(n-Yb(n/7,2));t.moveTo(-e,0),t.lineTo(e,0),t.moveTo(0,e),t.lineTo(0,-e)}},qm={draw(t,n){const e=jb(n),r=-e/2;t.rect(r,r,e,e)}},Im={draw(t,n){const e=.4431*jb(n);t.moveTo(e,e),t.lineTo(e,-e),t.lineTo(-e,-e),t.lineTo(-e,e),t.closePath()}};const Um=Lb(Xb/10)/Lb(7*Xb/10),Om=Lb(Vb/10)*Um,Bm=-Ob(Vb/10)*Um;var Ym={draw(t,n){const e=jb(.8908130915292852*n),r=Om*e,i=Bm*e;t.moveTo(0,-e),t.lineTo(r,i);for(let n=1;n<5;++n){const o=Vb*n/5,a=Ob(o),u=Lb(o);t.lineTo(u*e,-a*e),t.lineTo(a*r-u*i,u*r+a*i)}t.closePath()}};const Lm=jb(3);var jm={draw(t,n){const e=-jb(n/(3*Lm));t.moveTo(0,2*e),t.lineTo(-Lm*e,-e),t.lineTo(Lm*e,-e),t.closePath()}};const Hm=jb(3);var Xm={draw(t,n){const e=.6824*jb(n),r=e/2,i=e*Hm/2;t.moveTo(0,-e),t.lineTo(i,r),t.lineTo(-i,r),t.closePath()}};const Gm=-.5,Vm=jb(3)/2,Wm=1/jb(12),Zm=3*(Wm/2+1);var Km={draw(t,n){const e=jb(n/Zm),r=e/2,i=e*Wm,o=r,a=e*Wm+e,u=-o,c=a;t.moveTo(r,i),t.lineTo(o,a),t.lineTo(u,c),t.lineTo(Gm*r-Vm*i,Vm*r+Gm*i),t.lineTo(Gm*o-Vm*a,Vm*o+Gm*a),t.lineTo(Gm*u-Vm*c,Vm*u+Gm*c),t.lineTo(Gm*r+Vm*i,Gm*i-Vm*r),t.lineTo(Gm*o+Vm*a,Gm*a-Vm*o),t.lineTo(Gm*u+Vm*c,Gm*c-Vm*u),t.closePath()}},Qm={draw(t,n){const e=.6189*jb(n-Yb(n/6,1.7));t.moveTo(-e,-e),t.lineTo(e,e),t.moveTo(-e,e),t.lineTo(e,-e)}};const Jm=[Cm,Pm,Dm,qm,Ym,jm,Km],tx=[Cm,Fm,Qm,Xm,km,Im,Rm];function nx(){}function ex(t,n,e){t._context.bezierCurveTo((2*t._x0+t._x1)/3,(2*t._y0+t._y1)/3,(t._x0+2*t._x1)/3,(t._y0+2*t._y1)/3,(t._x0+4*t._x1+n)/6,(t._y0+4*t._y1+e)/6)}function rx(t){this._context=t}function ix(t){this._context=t}function ox(t){this._context=t}function ax(t,n){this._basis=new rx(t),this._beta=n}rx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){switch(this._point){case 3:ex(this,this._x1,this._y1);case 2:this._context.lineTo(this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,this._context.lineTo((5*this._x0+this._x1)/6,(5*this._y0+this._y1)/6);default:ex(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},ix.prototype={areaStart:nx,areaEnd:nx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._y0=this._y1=this._y2=this._y3=this._y4=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x2,this._y2),this._context.closePath();break;case 2:this._context.moveTo((this._x2+2*this._x3)/3,(this._y2+2*this._y3)/3),this._context.lineTo((this._x3+2*this._x2)/3,(this._y3+2*this._y2)/3),this._context.closePath();break;case 3:this.point(this._x2,this._y2),this.point(this._x3,this._y3),this.point(this._x4,this._y4)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x2=t,this._y2=n;break;case 1:this._point=2,this._x3=t,this._y3=n;break;case 2:this._point=3,this._x4=t,this._y4=n,this._context.moveTo((this._x0+4*this._x1+t)/6,(this._y0+4*this._y1+n)/6);break;default:ex(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},ox.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3;var e=(this._x0+4*this._x1+t)/6,r=(this._y0+4*this._y1+n)/6;this._line?this._context.lineTo(e,r):this._context.moveTo(e,r);break;case 3:this._point=4;default:ex(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}},ax.prototype={lineStart:function(){this._x=[],this._y=[],this._basis.lineStart()},lineEnd:function(){var t=this._x,n=this._y,e=t.length-1;if(e>0)for(var r,i=t[0],o=n[0],a=t[e]-i,u=n[e]-o,c=-1;++c<=e;)r=c/e,this._basis.point(this._beta*t[c]+(1-this._beta)*(i+r*a),this._beta*n[c]+(1-this._beta)*(o+r*u));this._x=this._y=null,this._basis.lineEnd()},point:function(t,n){this._x.push(+t),this._y.push(+n)}};var ux=function t(n){function e(t){return 1===n?new rx(t):new ax(t,n)}return e.beta=function(n){return t(+n)},e}(.85);function cx(t,n,e){t._context.bezierCurveTo(t._x1+t._k*(t._x2-t._x0),t._y1+t._k*(t._y2-t._y0),t._x2+t._k*(t._x1-n),t._y2+t._k*(t._y1-e),t._x2,t._y2)}function fx(t,n){this._context=t,this._k=(1-n)/6}fx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:cx(this,this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2,this._x1=t,this._y1=n;break;case 2:this._point=3;default:cx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var sx=function t(n){function e(t){return new fx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function lx(t,n){this._context=t,this._k=(1-n)/6}lx.prototype={areaStart:nx,areaEnd:nx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:cx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var hx=function t(n){function e(t){return new lx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function dx(t,n){this._context=t,this._k=(1-n)/6}dx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:cx(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var px=function t(n){function e(t){return new dx(t,n)}return e.tension=function(n){return t(+n)},e}(0);function gx(t,n,e){var r=t._x1,i=t._y1,o=t._x2,a=t._y2;if(t._l01_a>Hb){var u=2*t._l01_2a+3*t._l01_a*t._l12_a+t._l12_2a,c=3*t._l01_a*(t._l01_a+t._l12_a);r=(r*u-t._x0*t._l12_2a+t._x2*t._l01_2a)/c,i=(i*u-t._y0*t._l12_2a+t._y2*t._l01_2a)/c}if(t._l23_a>Hb){var f=2*t._l23_2a+3*t._l23_a*t._l12_a+t._l12_2a,s=3*t._l23_a*(t._l23_a+t._l12_a);o=(o*f+t._x1*t._l23_2a-n*t._l12_2a)/s,a=(a*f+t._y1*t._l23_2a-e*t._l12_2a)/s}t._context.bezierCurveTo(r,i,o,a,t._x2,t._y2)}function yx(t,n){this._context=t,this._alpha=n}yx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:this.point(this._x2,this._y2)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3;default:gx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var vx=function t(n){function e(t){return n?new yx(t,n):new fx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function _x(t,n){this._context=t,this._alpha=n}_x.prototype={areaStart:nx,areaEnd:nx,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:gx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var bx=function t(n){function e(t){return n?new _x(t,n):new lx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function mx(t,n){this._context=t,this._alpha=n}mx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:gx(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var xx=function t(n){function e(t){return n?new mx(t,n):new dx(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);function wx(t){this._context=t}function Mx(t){return t<0?-1:1}function Ax(t,n,e){var r=t._x1-t._x0,i=n-t._x1,o=(t._y1-t._y0)/(r||i<0&&-0),a=(e-t._y1)/(i||r<0&&-0),u=(o*i+a*r)/(r+i);return(Mx(o)+Mx(a))*Math.min(Math.abs(o),Math.abs(a),.5*Math.abs(u))||0}function Tx(t,n){var e=t._x1-t._x0;return e?(3*(t._y1-t._y0)/e-n)/2:n}function Sx(t,n,e){var r=t._x0,i=t._y0,o=t._x1,a=t._y1,u=(o-r)/3;t._context.bezierCurveTo(r+u,i+u*n,o-u,a-u*e,o,a)}function Ex(t){this._context=t}function Nx(t){this._context=new kx(t)}function kx(t){this._context=t}function Cx(t){this._context=t}function Px(t){var n,e,r=t.length-1,i=new Array(r),o=new Array(r),a=new Array(r);for(i[0]=0,o[0]=2,a[0]=t[0]+2*t[1],n=1;n<r-1;++n)i[n]=1,o[n]=4,a[n]=4*t[n]+2*t[n+1];for(i[r-1]=2,o[r-1]=7,a[r-1]=8*t[r-1]+t[r],n=1;n<r;++n)e=i[n]/o[n-1],o[n]-=e,a[n]-=e*a[n-1];for(i[r-1]=a[r-1]/o[r-1],n=r-2;n>=0;--n)i[n]=(a[n]-i[n+1])/o[n];for(o[r-1]=(t[r]+i[r-1])/2,n=0;n<r-1;++n)o[n]=2*t[n+1]-i[n+1];return[i,o]}function zx(t,n){this._context=t,this._t=n}function $x(t,n){if((i=t.length)>1)for(var e,r,i,o=1,a=t[n[0]],u=a.length;o<i;++o)for(r=a,a=t[n[o]],e=0;e<u;++e)a[e][1]+=a[e][0]=isNaN(r[e][1])?r[e][0]:r[e][1]}function Dx(t){for(var n=t.length,e=new Array(n);--n>=0;)e[n]=n;return e}function Rx(t,n){return t[n]}function Fx(t){const n=[];return n.key=t,n}function qx(t){var n=t.map(Ix);return Dx(t).sort(function(t,e){return n[t]-n[e]})}function Ix(t){for(var n,e=-1,r=0,i=t.length,o=-1/0;++e<i;)(n=+t[e][1])>o&&(o=n,r=e);return r}function Ux(t){var n=t.map(Ox);return Dx(t).sort(function(t,e){return n[t]-n[e]})}function Ox(t){for(var n,e=0,r=-1,i=t.length;++r<i;)(n=+t[r][1])&&(e+=n);return e}wx.prototype={areaStart:nx,areaEnd:nx,lineStart:function(){this._point=0},lineEnd:function(){this._point&&this._context.closePath()},point:function(t,n){t=+t,n=+n,this._point?this._context.lineTo(t,n):(this._point=1,this._context.moveTo(t,n))}},Ex.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:Sx(this,this._t0,Tx(this,this._t0))}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){var e=NaN;if(n=+n,(t=+t)!==this._x1||n!==this._y1){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,Sx(this,Tx(this,e=Ax(this,t,n)),e);break;default:Sx(this,this._t0,e=Ax(this,t,n))}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n,this._t0=e}}},(Nx.prototype=Object.create(Ex.prototype)).point=function(t,n){Ex.prototype.point.call(this,n,t)},kx.prototype={moveTo:function(t,n){this._context.moveTo(n,t)},closePath:function(){this._context.closePath()},lineTo:function(t,n){this._context.lineTo(n,t)},bezierCurveTo:function(t,n,e,r,i,o){this._context.bezierCurveTo(n,t,r,e,o,i)}},Cx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var t=this._x,n=this._y,e=t.length;if(e)if(this._line?this._context.lineTo(t[0],n[0]):this._context.moveTo(t[0],n[0]),2===e)this._context.lineTo(t[1],n[1]);else for(var r=Px(t),i=Px(n),o=0,a=1;a<e;++o,++a)this._context.bezierCurveTo(r[0][o],i[0][o],r[1][o],i[1][o],t[a],n[a]);(this._line||0!==this._line&&1===e)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(t,n){this._x.push(+t),this._y.push(+n)}},zx.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&2===this._point&&this._context.lineTo(this._x,this._y),(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:if(this._t<=0)this._context.lineTo(this._x,n),this._context.lineTo(t,n);else{var e=this._x*(1-this._t)+t*this._t;this._context.lineTo(e,this._y),this._context.lineTo(e,n)}}this._x=t,this._y=n}};var Bx=t=>()=>t;function Yx(t,{sourceEvent:n,target:e,transform:r,dispatch:i}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},target:{value:e,enumerable:!0,configurable:!0},transform:{value:r,enumerable:!0,configurable:!0},_:{value:i}})}function Lx(t,n,e){this.k=t,this.x=n,this.y=e}Lx.prototype={constructor:Lx,scale:function(t){return 1===t?this:new Lx(this.k*t,this.x,this.y)},translate:function(t,n){return 0===t&0===n?this:new Lx(this.k,this.x+this.k*t,this.y+this.k*n)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var jx=new Lx(1,0,0);function Hx(t){for(;!t.__zoom;)if(!(t=t.parentNode))return jx;return t.__zoom}function Xx(t){t.stopImmediatePropagation()}function Gx(t){t.preventDefault(),t.stopImmediatePropagation()}function Vx(t){return!(t.ctrlKey&&"wheel"!==t.type||t.button)}function Wx(){var t=this;return t instanceof SVGElement?(t=t.ownerSVGElement||t).hasAttribute("viewBox")?[[(t=t.viewBox.baseVal).x,t.y],[t.x+t.width,t.y+t.height]]:[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]:[[0,0],[t.clientWidth,t.clientHeight]]}function Zx(){return this.__zoom||jx}function Kx(t){return-t.deltaY*(1===t.deltaMode?.05:t.deltaMode?1:.002)*(t.ctrlKey?10:1)}function Qx(){return navigator.maxTouchPoints||"ontouchstart"in this}function Jx(t,n,e){var r=t.invertX(n[0][0])-e[0][0],i=t.invertX(n[1][0])-e[1][0],o=t.invertY(n[0][1])-e[0][1],a=t.invertY(n[1][1])-e[1][1];return t.translate(i>r?(r+i)/2:Math.min(0,r)||Math.max(0,i),a>o?(o+a)/2:Math.min(0,o)||Math.max(0,a))}Hx.prototype=Lx.prototype,t.Adder=M,t.Delaunay=Au,t.FormatSpecifier=Cc,t.InternMap=InternMap,t.InternSet=InternSet,t.Node=Md,t.Path=ha,t.Voronoi=_u,t.ZoomTransform=Lx,t.active=function(t,n){var e,r,i=t.__transition;if(i)for(r in n=null==n?null:n+"",i)if((e=i[r]).state>1&&e.name===n)return new Eo([[t]],$o,n,+r);return null},t.arc=function(){var t=Kb,n=Qb,e=qb(0),r=null,i=Jb,o=tm,a=nm,u=null,c=Zb(f);function f(){var f,s,l=+t.apply(this,arguments),h=+n.apply(this,arguments),d=i.apply(this,arguments)-Gb,p=o.apply(this,arguments)-Gb,g=Ib(p-d),y=p>d;if(u||(u=f=c()),h<l&&(s=h,h=l,l=s),h>Hb)if(g>Vb-Hb)u.moveTo(h*Ob(d),h*Lb(d)),u.arc(0,0,h,d,p,!y),l>Hb&&(u.moveTo(l*Ob(p),l*Lb(p)),u.arc(0,0,l,p,d,y));else{var v,_,b=d,m=p,x=d,w=p,M=g,A=g,T=a.apply(this,arguments)/2,S=T>Hb&&(r?+r.apply(this,arguments):jb(l*l+h*h)),E=Yb(Ib(h-l)/2,+e.apply(this,arguments)),N=E,k=E;if(S>Hb){var C=Wb(S/l*Lb(T)),P=Wb(S/h*Lb(T));(M-=2*C)>Hb?(x+=C*=y?1:-1,w-=C):(M=0,x=w=(d+p)/2),(A-=2*P)>Hb?(b+=P*=y?1:-1,m-=P):(A=0,b=m=(d+p)/2)}var z=h*Ob(b),$=h*Lb(b),D=l*Ob(w),R=l*Lb(w);if(E>Hb){var F,q=h*Ob(m),I=h*Lb(m),U=l*Ob(x),O=l*Lb(x);if(g<Xb)if(F=function(t,n,e,r,i,o,a,u){var c=e-t,f=r-n,s=a-i,l=u-o,h=l*c-s*f;if(!(h*h<Hb))return[t+(h=(s*(n-o)-l*(t-i))/h)*c,n+h*f]}(z,$,U,O,q,I,D,R)){var B=z-F[0],Y=$-F[1],L=q-F[0],j=I-F[1],H=1/Lb(function(t){return t>1?0:t<-1?Xb:Math.acos(t)}((B*L+Y*j)/(jb(B*B+Y*Y)*jb(L*L+j*j)))/2),X=jb(F[0]*F[0]+F[1]*F[1]);N=Yb(E,(l-X)/(H-1)),k=Yb(E,(h-X)/(H+1))}else N=k=0}A>Hb?k>Hb?(v=em(U,O,z,$,h,k,y),_=em(q,I,D,R,h,k,y),u.moveTo(v.cx+v.x01,v.cy+v.y01),k<E?u.arc(v.cx,v.cy,k,Ub(v.y01,v.x01),Ub(_.y01,_.x01),!y):(u.arc(v.cx,v.cy,k,Ub(v.y01,v.x01),Ub(v.y11,v.x11),!y),u.arc(0,0,h,Ub(v.cy+v.y11,v.cx+v.x11),Ub(_.cy+_.y11,_.cx+_.x11),!y),u.arc(_.cx,_.cy,k,Ub(_.y11,_.x11),Ub(_.y01,_.x01),!y))):(u.moveTo(z,$),u.arc(0,0,h,b,m,!y)):u.moveTo(z,$),l>Hb&&M>Hb?N>Hb?(v=em(D,R,q,I,l,-N,y),_=em(z,$,U,O,l,-N,y),u.lineTo(v.cx+v.x01,v.cy+v.y01),N<E?u.arc(v.cx,v.cy,N,Ub(v.y01,v.x01),Ub(_.y01,_.x01),!y):(u.arc(v.cx,v.cy,N,Ub(v.y01,v.x01),Ub(v.y11,v.x11),!y),u.arc(0,0,l,Ub(v.cy+v.y11,v.cx+v.x11),Ub(_.cy+_.y11,_.cx+_.x11),y),u.arc(_.cx,_.cy,N,Ub(_.y11,_.x11),Ub(_.y01,_.x01),!y))):u.arc(0,0,l,w,x,y):u.lineTo(D,R)}else u.moveTo(0,0);if(u.closePath(),f)return u=null,f+""||null}return f.centroid=function(){var e=(+t.apply(this,arguments)+ +n.apply(this,arguments))/2,r=(+i.apply(this,arguments)+ +o.apply(this,arguments))/2-Xb/2;return[Ob(r)*e,Lb(r)*e]},f.innerRadius=function(n){return arguments.length?(t="function"==typeof n?n:qb(+n),f):t},f.outerRadius=function(t){return arguments.length?(n="function"==typeof t?t:qb(+t),f):n},f.cornerRadius=function(t){return arguments.length?(e="function"==typeof t?t:qb(+t),f):e},f.padRadius=function(t){return arguments.length?(r=null==t?null:"function"==typeof t?t:qb(+t),f):r},f.startAngle=function(t){return arguments.length?(i="function"==typeof t?t:qb(+t),f):i},f.endAngle=function(t){return arguments.length?(o="function"==typeof t?t:qb(+t),f):o},f.padAngle=function(t){return arguments.length?(a="function"==typeof t?t:qb(+t),f):a},f.context=function(t){return arguments.length?(u=null==t?null:t,f):u},f},t.area=sm,t.areaRadial=_m,t.ascending=n,t.autoType=function(t){for(var n in t){var e,r,i=t[n].trim();if(i)if("true"===i)i=!0;else if("false"===i)i=!1;else if("NaN"===i)i=NaN;else if(isNaN(e=+i)){if(!(r=i.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)))continue;Vu&&r[4]&&!r[7]&&(i=i.replace(/-/g,"/").replace(/T/," ")),i=new Date(i)}else i=e;else i=null;t[n]=i}return t},t.axisBottom=function(t){return St(3,t)},t.axisLeft=function(t){return St(4,t)},t.axisRight=function(t){return St(2,t)},t.axisTop=function(t){return St(1,t)},t.bin=K,t.bisect=u,t.bisectCenter=f,t.bisectLeft=c,t.bisectRight=u,t.bisector=r,t.blob=function(t,n){return fetch(t,n).then(Wu)},t.blur=function(t,n){if(!((n=+n)>=0))throw new RangeError("invalid r");let e=t.length;if(!((e=Math.floor(e))>=0))throw new RangeError("invalid length");if(!e||!n)return t;const r=g(n),i=t.slice();return r(t,i,0,e,1),r(i,t,0,e,1),r(t,i,0,e,1),t},t.blur2=s,t.blurImage=l,t.brush=function(){return oa(Vo)},t.brushSelection=function(t){var n=t.__brush;return n?n.dim.output(n.selection):null},t.brushX=function(){return oa(Xo)},t.brushY=function(){return oa(Go)},t.buffer=function(t,n){return fetch(t,n).then(Zu)},t.chord=function(){return Ma(!1,!1)},t.chordDirected=function(){return Ma(!0,!1)},t.chordTranspose=function(){return Ma(!1,!0)},t.cluster=function(){var t=pd,n=1,e=1,r=!1;function i(i){var o,a=0;i.eachAfter(function(n){var e=n.children;e?(n.x=function(t){return t.reduce(gd,0)/t.length}(e),n.y=function(t){return 1+t.reduce(yd,0)}(e)):(n.x=o?a+=t(n,o):0,n.y=0,o=n)});var u=function(t){for(var n;n=t.children;)t=n[0];return t}(i),c=function(t){for(var n;n=t.children;)t=n[n.length-1];return t}(i),f=u.x-t(u,c)/2,s=c.x+t(c,u)/2;return i.eachAfter(r?function(t){t.x=(t.x-i.x)*n,t.y=(i.y-t.y)*e}:function(t){t.x=(t.x-f)/(s-f)*n,t.y=(1-(i.y?t.y/i.y:1))*e})}return i.separation=function(n){return arguments.length?(t=n,i):t},i.size=function(t){return arguments.length?(r=!1,n=+t[0],e=+t[1],i):r?null:[n,e]},i.nodeSize=function(t){return arguments.length?(r=!0,n=+t[0],e=+t[1],i):r?[n,e]:null},i},t.color=Ee,t.contourDensity=function(){var t=Ga,n=Va,e=Wa,r=960,i=500,o=20,a=2,u=3*o,c=r+2*u>>a,f=i+2*u>>a,l=Fa(20);function h(r){var i=new Float32Array(c*f),l=Math.pow(2,-a),h=-1;for(const o of r){var d=(t(o,++h,r)+u)*l,p=(n(o,h,r)+u)*l,g=+e(o,h,r);if(g&&d>=0&&d<c&&p>=0&&p<f){var y=Math.floor(d),v=Math.floor(p),_=d-y-.5,b=p-v-.5;i[y+v*c]+=(1-_)*(1-b)*g,i[y+1+v*c]+=_*(1-b)*g,i[y+1+(v+1)*c]+=_*b*g,i[y+(v+1)*c]+=(1-_)*b*g}}return s({data:i,width:c,height:f},o*l),i}function d(t){var n=h(t),e=l(n),r=Math.pow(2,2*a);return Array.isArray(e)||(e=X(Number.MIN_VALUE,Q(n)/r,e)),Ya().size([c,f]).thresholds(e.map(t=>t*r))(n).map((t,n)=>(t.value=+e[n],p(t)))}function p(t){return t.coordinates.forEach(g),t}function g(t){t.forEach(y)}function y(t){t.forEach(v)}function v(t){t[0]=t[0]*Math.pow(2,a)-u,t[1]=t[1]*Math.pow(2,a)-u}function _(){return c=r+2*(u=3*o)>>a,f=i+2*u>>a,d}return d.contours=function(t){var n=h(t),e=Ya().size([c,f]),r=Math.pow(2,2*a),i=t=>{t=+t;var i=p(e.contour(n,t*r));return i.value=t,i};return Object.defineProperty(i,"max",{get:()=>Q(n)/r}),i},d.x=function(n){return arguments.length?(t="function"==typeof n?n:Fa(+n),d):t},d.y=function(t){return arguments.length?(n="function"==typeof t?t:Fa(+t),d):n},d.weight=function(t){return arguments.length?(e="function"==typeof t?t:Fa(+t),d):e},d.size=function(t){if(!arguments.length)return[r,i];var n=+t[0],e=+t[1];if(!(n>=0&&e>=0))throw new Error("invalid size");return r=n,i=e,_()},d.cellSize=function(t){if(!arguments.length)return 1<<a;if(!((t=+t)>=1))throw new Error("invalid cell size");return a=Math.floor(Math.log(t)/Math.LN2),_()},d.thresholds=function(t){return arguments.length?(l="function"==typeof t?t:Array.isArray(t)?Fa(Da.call(t)):Fa(t),d):l},d.bandwidth=function(t){if(!arguments.length)return Math.sqrt(o*(o+1));if(!((t=+t)>=0))throw new Error("invalid bandwidth");return o=(Math.sqrt(4*t*t+1)-1)/2,_()},d},t.contours=Ya,t.count=y,t.create=function(t){return Hn(qt(t).call(document.documentElement))},t.creator=qt,t.cross=function(...t){const n="function"==typeof t[t.length-1]&&function(t){return n=>t(...n)}(t.pop()),e=(t=t.map(b)).map(v),r=t.length-1,i=new Array(r+1).fill(0),o=[];if(r<0||e.some(_))return o;for(;;){o.push(i.map((n,e)=>t[e][n]));let a=r;for(;++i[a]===e[a];){if(0===a)return n?o.map(n):o;i[a--]=0}}},t.csv=tc,t.csvFormat=Ru,t.csvFormatBody=Fu,t.csvFormatRow=Iu,t.csvFormatRows=qu,t.csvFormatValue=Uu,t.csvParse=$u,t.csvParseRows=Du,t.cubehelix=_r,t.cumsum=function(t,n){var e=0,r=0;return Float64Array.from(t,void 0===n?t=>e+=+t||0:i=>e+=+n(i,r++,t)||0)},t.curveBasis=function(t){return new rx(t)},t.curveBasisClosed=function(t){return new ix(t)},t.curveBasisOpen=function(t){return new ox(t)},t.curveBumpX=wm,t.curveBumpY=Mm,t.curveBundle=ux,t.curveCardinal=sx,t.curveCardinalClosed=hx,t.curveCardinalOpen=px,t.curveCatmullRom=vx,t.curveCatmullRomClosed=bx,t.curveCatmullRomOpen=xx,t.curveLinear=am,t.curveLinearClosed=function(t){return new wx(t)},t.curveMonotoneX=function(t){return new Ex(t)},t.curveMonotoneY=function(t){return new Nx(t)},t.curveNatural=function(t){return new Cx(t)},t.curveStep=function(t){return new zx(t,.5)},t.curveStepAfter=function(t){return new zx(t,1)},t.curveStepBefore=function(t){return new zx(t,0)},t.descending=e,t.deviation=x,t.difference=function(t,...n){t=new InternSet(t);for(const e of n)for(const n of e)t.delete(n);return t},t.disjoint=function(t,n){const e=n[Symbol.iterator](),r=new InternSet;for(const n of t){if(r.has(n))return!1;let t,i;for(;({value:t,done:i}=e.next())&&!i;){if(Object.is(n,t))return!1;r.add(t)}}return!0},t.dispatch=Nt,t.drag=function(){var t,n,e,r,i=oe,o=ae,a=ue,u=ce,c={},f=Nt("start","drag","end"),s=0,l=0;function h(t){t.on("mousedown.drag",d).filter(u).on("touchstart.drag",y).on("touchmove.drag",v,Kn).on("touchend.drag touchcancel.drag",_).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function d(a,u){if(!r&&i.call(this,a,u)){var c=b(this,o.call(this,a,u),a,u,"mouse");c&&(Hn(a.view).on("mousemove.drag",p,Qn).on("mouseup.drag",g,Qn),ne(a.view),Jn(a),e=!1,t=a.clientX,n=a.clientY,c("start",a))}}function p(r){if(te(r),!e){var i=r.clientX-t,o=r.clientY-n;e=i*i+o*o>l}c.mouse("drag",r)}function g(t){Hn(t.view).on("mousemove.drag mouseup.drag",null),ee(t.view,e),te(t),c.mouse("end",t)}function y(t,n){if(i.call(this,t,n)){var e,r,a=t.changedTouches,u=o.call(this,t,n),c=a.length;for(e=0;e<c;++e)(r=b(this,u,t,n,a[e].identifier,a[e]))&&(Jn(t),r("start",t,a[e]))}}function v(t){var n,e,r=t.changedTouches,i=r.length;for(n=0;n<i;++n)(e=c[r[n].identifier])&&(te(t),e("drag",t,r[n]))}function _(t){var n,e,i=t.changedTouches,o=i.length;for(r&&clearTimeout(r),r=setTimeout(function(){r=null},500),n=0;n<o;++n)(e=c[i[n].identifier])&&(Jn(t),e("end",t,i[n]))}function b(t,n,e,r,i,o){var u,l,d,p=f.copy(),g=Zn(o||e,n);if(null!=(d=a.call(t,new ie("beforestart",{sourceEvent:e,target:h,identifier:i,active:s,x:g[0],y:g[1],dx:0,dy:0,dispatch:p}),r)))return u=d.x-g[0]||0,l=d.y-g[1]||0,function e(o,a,f){var y,v=g;switch(o){case"start":c[i]=e,y=s++;break;case"end":delete c[i],--s;case"drag":g=Zn(f||a,n),y=s}p.call(o,t,new ie(o,{sourceEvent:a,subject:d,target:h,identifier:i,active:y,x:g[0]+u,y:g[1]+l,dx:g[0]-v[0],dy:g[1]-v[1],dispatch:p}),r)}}return h.filter=function(t){return arguments.length?(i="function"==typeof t?t:re(!!t),h):i},h.container=function(t){return arguments.length?(o="function"==typeof t?t:re(t),h):o},h.subject=function(t){return arguments.length?(a="function"==typeof t?t:re(t),h):a},h.touchable=function(t){return arguments.length?(u="function"==typeof t?t:re(!!t),h):u},h.on=function(){var t=f.on.apply(f,arguments);return t===f?h:t},h.clickDistance=function(t){return arguments.length?(l=(t=+t)*t,h):Math.sqrt(l)},h},t.dragDisable=ne,t.dragEnable=ee,t.dsv=function(t,n,e,r){3===arguments.length&&"function"==typeof e&&(r=e,e=void 0);var i=Pu(t);return Qu(n,e).then(function(t){return i.parse(t,r)})},t.dsvFormat=Pu,t.easeBack=Wi,t.easeBackIn=Gi,t.easeBackInOut=Wi,t.easeBackOut=Vi,t.easeBounce=Hi,t.easeBounceIn=function(t){return 1-Hi(1-t)},t.easeBounceInOut=function(t){return((t*=2)<=1?1-Hi(1-t):Hi(t-1)+1)/2},t.easeBounceOut=Hi,t.easeCircle=qi,t.easeCircleIn=function(t){return 1-Math.sqrt(1-t*t)},t.easeCircleInOut=qi,t.easeCircleOut=function(t){return Math.sqrt(1- --t*t)},t.easeCubic=Ni,t.easeCubicIn=function(t){return t*t*t},t.easeCubicInOut=Ni,t.easeCubicOut=function(t){return--t*t*t+1},t.easeElastic=Qi,t.easeElasticIn=Ki,t.easeElasticInOut=Ji,t.easeElasticOut=Qi,t.easeExp=Fi,t.easeExpIn=function(t){return Ri(1-+t)},t.easeExpInOut=Fi,t.easeExpOut=function(t){return 1-Ri(t)},t.easeLinear=t=>+t,t.easePoly=Pi,t.easePolyIn=ki,t.easePolyInOut=Pi,t.easePolyOut=Ci,t.easeQuad=Ei,t.easeQuadIn=function(t){return t*t},t.easeQuadInOut=Ei,t.easeQuadOut=function(t){return t*(2-t)},t.easeSin=Di,t.easeSinIn=function(t){return 1===+t?1:1-Math.cos(t*$i)},t.easeSinInOut=Di,t.easeSinOut=function(t){return Math.sin(t*$i)},t.every=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");let e=-1;for(const r of t)if(!n(r,++e,t))return!1;return!0},t.extent=w,t.fcumsum=function(t,n){const e=new M;let r=-1;return Float64Array.from(t,void 0===n?t=>e.add(+t||0):i=>e.add(+n(i,++r,t)||0))},t.filter=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");const e=[];let r=-1;for(const i of t)n(i,++r,t)&&e.push(i);return e},t.flatGroup=function(t,...n){return P(C(t,...n),n)},t.flatRollup=function(t,n,...e){return P($(t,n,...e),e)},t.forceCenter=function(t,n){var e,r=1;function i(){var i,o,a=e.length,u=0,c=0;for(i=0;i<a;++i)u+=(o=e[i]).x,c+=o.y;for(u=(u/a-t)*r,c=(c/a-n)*r,i=0;i<a;++i)(o=e[i]).x-=u,o.y-=c}return null==t&&(t=0),null==n&&(n=0),i.initialize=function(t){e=t},i.x=function(n){return arguments.length?(t=+n,i):t},i.y=function(t){return arguments.length?(n=+t,i):n},i.strength=function(t){return arguments.length?(r=+t,i):r},i},t.forceCollide=function(t){var n,e,r,i=1,o=1;function a(){for(var t,a,c,f,s,l,h,d=n.length,p=0;p<o;++p)for(a=lc(n,vc,_c).visitAfter(u),t=0;t<d;++t)c=n[t],l=e[c.index],h=l*l,f=c.x+c.vx,s=c.y+c.vy,a.visit(g);function g(t,n,e,o,a){var u=t.data,d=t.r,p=l+d;if(!u)return n>f+p||o<f-p||e>s+p||a<s-p;if(u.index>c.index){var g=f-u.x-u.vx,y=s-u.y-u.vy,v=g*g+y*y;v<p*p&&(0===g&&(v+=(g=yc(r))*g),0===y&&(v+=(y=yc(r))*y),v=(p-(v=Math.sqrt(v)))/v*i,c.vx+=(g*=v)*(p=(d*=d)/(h+d)),c.vy+=(y*=v)*p,u.vx-=g*(p=1-p),u.vy-=y*p)}}}function u(t){if(t.data)return t.r=e[t.data.index];for(var n=t.r=0;n<4;++n)t[n]&&t[n].r>t.r&&(t.r=t[n].r)}function c(){if(n){var r,i,o=n.length;for(e=new Array(o),r=0;r<o;++r)i=n[r],e[i.index]=+t(i,r,n)}}return"function"!=typeof t&&(t=gc(null==t?1:+t)),a.initialize=function(t,e){n=t,r=e,c()},a.iterations=function(t){return arguments.length?(o=+t,a):o},a.strength=function(t){return arguments.length?(i=+t,a):i},a.radius=function(n){return arguments.length?(t="function"==typeof n?n:gc(+n),c(),a):t},a},t.forceLink=function(t){var n,e,r,i,o,a,u=bc,c=function(t){return 1/Math.min(i[t.source.index],i[t.target.index])},f=gc(30),s=1;function l(r){for(var i=0,u=t.length;i<s;++i)for(var c,f,l,h,d,p,g,y=0;y<u;++y)f=(c=t[y]).source,h=(l=c.target).x+l.vx-f.x-f.vx||yc(a),d=l.y+l.vy-f.y-f.vy||yc(a),h*=p=((p=Math.sqrt(h*h+d*d))-e[y])/p*r*n[y],d*=p,l.vx-=h*(g=o[y]),l.vy-=d*g,f.vx+=h*(g=1-g),f.vy+=d*g}function h(){if(r){var a,c,f=r.length,s=t.length,l=new Map(r.map((t,n)=>[u(t,n,r),t]));for(a=0,i=new Array(f);a<s;++a)(c=t[a]).index=a,"object"!=typeof c.source&&(c.source=mc(l,c.source)),"object"!=typeof c.target&&(c.target=mc(l,c.target)),i[c.source.index]=(i[c.source.index]||0)+1,i[c.target.index]=(i[c.target.index]||0)+1;for(a=0,o=new Array(s);a<s;++a)c=t[a],o[a]=i[c.source.index]/(i[c.source.index]+i[c.target.index]);n=new Array(s),d(),e=new Array(s),p()}}function d(){if(r)for(var e=0,i=t.length;e<i;++e)n[e]=+c(t[e],e,t)}function p(){if(r)for(var n=0,i=t.length;n<i;++n)e[n]=+f(t[n],n,t)}return null==t&&(t=[]),l.initialize=function(t,n){r=t,a=n,h()},l.links=function(n){return arguments.length?(t=n,h(),l):t},l.id=function(t){return arguments.length?(u=t,l):u},l.iterations=function(t){return arguments.length?(s=+t,l):s},l.strength=function(t){return arguments.length?(c="function"==typeof t?t:gc(+t),d(),l):c},l.distance=function(t){return arguments.length?(f="function"==typeof t?t:gc(+t),p(),l):f},l},t.forceManyBody=function(){var t,n,e,r,i,o=gc(-30),a=1,u=1/0,c=.81;function f(e){var i,o=t.length,a=lc(t,wc,Mc).visitAfter(l);for(r=e,i=0;i<o;++i)n=t[i],a.visit(h)}function s(){if(t){var n,e,r=t.length;for(i=new Array(r),n=0;n<r;++n)e=t[n],i[e.index]=+o(e,n,t)}}function l(t){var n,e,r,o,a,u=0,c=0;if(t.length){for(r=o=a=0;a<4;++a)(n=t[a])&&(e=Math.abs(n.value))&&(u+=n.value,c+=e,r+=e*n.x,o+=e*n.y);t.x=r/c,t.y=o/c}else{(n=t).x=n.data.x,n.y=n.data.y;do{u+=i[n.data.index]}while(n=n.next)}t.value=u}function h(t,o,f,s){if(!t.value)return!0;var l=t.x-n.x,h=t.y-n.y,d=s-o,p=l*l+h*h;if(d*d/c<p)return p<u&&(0===l&&(p+=(l=yc(e))*l),0===h&&(p+=(h=yc(e))*h),p<a&&(p=Math.sqrt(a*p)),n.vx+=l*t.value*r/p,n.vy+=h*t.value*r/p),!0;if(!(t.length||p>=u)){(t.data!==n||t.next)&&(0===l&&(p+=(l=yc(e))*l),0===h&&(p+=(h=yc(e))*h),p<a&&(p=Math.sqrt(a*p)));do{t.data!==n&&(d=i[t.data.index]*r/p,n.vx+=l*d,n.vy+=h*d)}while(t=t.next)}}return f.initialize=function(n,r){t=n,e=r,s()},f.strength=function(t){return arguments.length?(o="function"==typeof t?t:gc(+t),s(),f):o},f.distanceMin=function(t){return arguments.length?(a=t*t,f):Math.sqrt(a)},f.distanceMax=function(t){return arguments.length?(u=t*t,f):Math.sqrt(u)},f.theta=function(t){return arguments.length?(c=t*t,f):Math.sqrt(c)},f},t.forceRadial=function(t,n,e){var r,i,o,a=gc(.1);function u(t){for(var a=0,u=r.length;a<u;++a){var c=r[a],f=c.x-n||1e-6,s=c.y-e||1e-6,l=Math.sqrt(f*f+s*s),h=(o[a]-l)*i[a]*t/l;c.vx+=f*h,c.vy+=s*h}}function c(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)o[n]=+t(r[n],n,r),i[n]=isNaN(o[n])?0:+a(r[n],n,r)}}return"function"!=typeof t&&(t=gc(+t)),null==n&&(n=0),null==e&&(e=0),u.initialize=function(t){r=t,c()},u.strength=function(t){return arguments.length?(a="function"==typeof t?t:gc(+t),c(),u):a},u.radius=function(n){return arguments.length?(t="function"==typeof n?n:gc(+n),c(),u):t},u.x=function(t){return arguments.length?(n=+t,u):n},u.y=function(t){return arguments.length?(e=+t,u):e},u},t.forceSimulation=function(t){var n,e=1,r=.001,i=1-Math.pow(r,1/300),o=0,a=.6,u=new Map,c=xi(l),f=Nt("tick","end"),s=function(){let t=1;return()=>(t=(1664525*t+1013904223)%xc)/xc}();function l(){h(),f.call("tick",n),e<r&&(c.stop(),f.call("end",n))}function h(r){var c,f,s=t.length;void 0===r&&(r=1);for(var l=0;l<r;++l)for(e+=(o-e)*i,u.forEach(function(t){t(e)}),c=0;c<s;++c)null==(f=t[c]).fx?f.x+=f.vx*=a:(f.x=f.fx,f.vx=0),null==f.fy?f.y+=f.vy*=a:(f.y=f.fy,f.vy=0);return n}function d(){for(var n,e=0,r=t.length;e<r;++e){if((n=t[e]).index=e,null!=n.fx&&(n.x=n.fx),null!=n.fy&&(n.y=n.fy),isNaN(n.x)||isNaN(n.y)){var i=10*Math.sqrt(.5+e),o=e*Ac;n.x=i*Math.cos(o),n.y=i*Math.sin(o)}(isNaN(n.vx)||isNaN(n.vy))&&(n.vx=n.vy=0)}}function p(n){return n.initialize&&n.initialize(t,s),n}return null==t&&(t=[]),d(),n={tick:h,restart:function(){return c.restart(l),n},stop:function(){return c.stop(),n},nodes:function(e){return arguments.length?(t=e,d(),u.forEach(p),n):t},alpha:function(t){return arguments.length?(e=+t,n):e},alphaMin:function(t){return arguments.length?(r=+t,n):r},alphaDecay:function(t){return arguments.length?(i=+t,n):+i},alphaTarget:function(t){return arguments.length?(o=+t,n):o},velocityDecay:function(t){return arguments.length?(a=1-t,n):1-a},randomSource:function(t){return arguments.length?(s=t,u.forEach(p),n):s},force:function(t,e){return arguments.length>1?(null==e?u.delete(t):u.set(t,p(e)),n):u.get(t)},find:function(n,e,r){var i,o,a,u,c,f=0,s=t.length;for(null==r?r=1/0:r*=r,f=0;f<s;++f)(a=(i=n-(u=t[f]).x)*i+(o=e-u.y)*o)<r&&(c=u,r=a);return c},on:function(t,e){return arguments.length>1?(f.on(t,e),n):f.on(t)}}},t.forceX=function(t){var n,e,r,i=gc(.1);function o(t){for(var i,o=0,a=n.length;o<a;++o)(i=n[o]).vx+=(r[o]-i.x)*e[o]*t}function a(){if(n){var o,a=n.length;for(e=new Array(a),r=new Array(a),o=0;o<a;++o)e[o]=isNaN(r[o]=+t(n[o],o,n))?0:+i(n[o],o,n)}}return"function"!=typeof t&&(t=gc(null==t?0:+t)),o.initialize=function(t){n=t,a()},o.strength=function(t){return arguments.length?(i="function"==typeof t?t:gc(+t),a(),o):i},o.x=function(n){return arguments.length?(t="function"==typeof n?n:gc(+n),a(),o):t},o},t.forceY=function(t){var n,e,r,i=gc(.1);function o(t){for(var i,o=0,a=n.length;o<a;++o)(i=n[o]).vy+=(r[o]-i.y)*e[o]*t}function a(){if(n){var o,a=n.length;for(e=new Array(a),r=new Array(a),o=0;o<a;++o)e[o]=isNaN(r[o]=+t(n[o],o,n))?0:+i(n[o],o,n)}}return"function"!=typeof t&&(t=gc(null==t?0:+t)),o.initialize=function(t){n=t,a()},o.strength=function(t){return arguments.length?(i="function"==typeof t?t:gc(+t),a(),o):i},o.y=function(n){return arguments.length?(t="function"==typeof n?n:gc(+n),a(),o):t},o},t.formatDefaultLocale=Ic,t.formatLocale=qc,t.formatSpecifier=kc,t.fsum=function(t,n){const e=new M;if(void 0===n)for(let n of t)(n=+n)&&e.add(n);else{let r=-1;for(let i of t)(i=+n(i,++r,t))&&e.add(i)}return+e},t.geoAlbers=Xh,t.geoAlbersUsa=function(){var t,n,e,r,i,o,a=Xh(),u=Hh().rotate([154,0]).center([-2,58.5]).parallels([55,65]),c=Hh().rotate([157,0]).center([-3,19.9]).parallels([8,18]),f={point:function(t,n){o=[t,n]}};function s(t){var n=t[0],a=t[1];return o=null,e.point(n,a),o||(r.point(n,a),o)||(i.point(n,a),o)}function l(){return t=n=null,s}return s.invert=function(t){var n=a.scale(),e=a.translate(),r=(t[0]-e[0])/n,i=(t[1]-e[1])/n;return(i>=.12&&i<.234&&r>=-.425&&r<-.214?u:i>=.166&&i<.234&&r>=-.214&&r<-.115?c:a).invert(t)},s.stream=function(e){return t&&n===e?t:(r=[a.stream(n=e),u.stream(e),c.stream(e)],i=r.length,t={point:function(t,n){for(var e=-1;++e<i;)r[e].point(t,n)},sphere:function(){for(var t=-1;++t<i;)r[t].sphere()},lineStart:function(){for(var t=-1;++t<i;)r[t].lineStart()},lineEnd:function(){for(var t=-1;++t<i;)r[t].lineEnd()},polygonStart:function(){for(var t=-1;++t<i;)r[t].polygonStart()},polygonEnd:function(){for(var t=-1;++t<i;)r[t].polygonEnd()}});var r,i},s.precision=function(t){return arguments.length?(a.precision(t),u.precision(t),c.precision(t),l()):a.precision()},s.scale=function(t){return arguments.length?(a.scale(t),u.scale(.35*t),c.scale(t),s.translate(a.translate())):a.scale()},s.translate=function(t){if(!arguments.length)return a.translate();var n=a.scale(),o=+t[0],s=+t[1];return e=a.translate(t).clipExtent([[o-.455*n,s-.238*n],[o+.455*n,s+.238*n]]).stream(f),r=u.translate([o-.307*n,s+.201*n]).clipExtent([[o-.425*n+Yc,s+.12*n+Yc],[o-.214*n-Yc,s+.234*n-Yc]]).stream(f),i=c.translate([o-.205*n,s+.212*n]).clipExtent([[o-.214*n+Yc,s+.166*n+Yc],[o-.115*n-Yc,s+.234*n-Yc]]).stream(f),l()},s.fitExtent=function(t,n){return $h(s,t,n)},s.fitSize=function(t,n){return Dh(s,t,n)},s.fitWidth=function(t,n){return Rh(s,t,n)},s.fitHeight=function(t,n){return Fh(s,t,n)},s.scale(1070)},t.geoArea=function(t){return qf=new M,bf(t,If),2*qf},t.geoAzimuthalEqualArea=function(){return Bh(Wh).scale(124.75).clipAngle(179.999)},t.geoAzimuthalEqualAreaRaw=Wh,t.geoAzimuthalEquidistant=function(){return Bh(Zh).scale(79.4188).clipAngle(179.999)},t.geoAzimuthalEquidistantRaw=Zh,t.geoBounds=function(t){var n,e,r,i,o,a,u;if(Nf=Ef=-(Tf=Sf=1/0),Df=[],bf(t,hs),e=Df.length){for(Df.sort(xs),n=1,o=[r=Df[0]];n<e;++n)ws(r,(i=Df[n])[0])||ws(r,i[1])?(ms(r[0],i[1])>ms(r[0],r[1])&&(r[1]=i[1]),ms(i[0],r[1])>ms(r[0],r[1])&&(r[0]=i[0])):o.push(r=i);for(a=-1/0,n=0,r=o[e=o.length-1];n<=e;r=i,++n)i=o[n],(u=ms(r[1],i[0]))>a&&(a=u,Tf=i[0],Ef=r[1])}return Df=Rf=null,Tf===1/0||Sf===1/0?[[NaN,NaN],[NaN,NaN]]:[[Tf,Sf],[Ef,Nf]]},t.geoCentroid=function(t){Zf=Kf=Qf=Jf=ts=ns=es=rs=0,is=new M,os=new M,as=new M,bf(t,Ms);var n=+is,e=+os,r=+as,i=ef(n,e,r);return i<Lc&&(n=ns,e=es,r=rs,Kf<Yc&&(n=Qf,e=Jf,r=ts),(i=ef(n,e,r))<Lc)?[NaN,NaN]:[Qc(e,n)*Vc,lf(r/i)*Vc]},t.geoCircle=function(){var t,n,e=Ds([0,0]),r=Ds(90),i=Ds(2),o={point:function(e,r){t.push(e=n(e,r)),e[0]*=Vc,e[1]*=Vc}};function a(){var a=e.apply(this,arguments),u=r.apply(this,arguments)*Wc,c=i.apply(this,arguments)*Wc;return t=[],n=qs(-a[0]*Wc,-a[1]*Wc,0).invert,Ys(o,u,c,1),a={type:"Polygon",coordinates:[t]},t=n=null,a}return a.center=function(t){return arguments.length?(e="function"==typeof t?t:Ds([+t[0],+t[1]]),a):e},a.radius=function(t){return arguments.length?(r="function"==typeof t?t:Ds(+t),a):r},a.precision=function(t){return arguments.length?(i="function"==typeof t?t:Ds(+t),a):i},a},t.geoClipAntimeridian=tl,t.geoClipCircle=nl,t.geoClipExtent=function(){var t,n,e,r=0,i=0,o=960,a=500;return e={stream:function(e){return t&&n===e?t:t=cl(r,i,o,a)(n=e)},extent:function(u){return arguments.length?(r=+u[0][0],i=+u[0][1],o=+u[1][0],a=+u[1][1],t=n=null,e):[[r,i],[o,a]]}}},t.geoClipRectangle=cl,t.geoConicConformal=function(){return Lh(td).scale(109.5).parallels([30,30])},t.geoConicConformalRaw=td,t.geoConicEqualArea=Hh,t.geoConicEqualAreaRaw=jh,t.geoConicEquidistant=function(){return Lh(ed).scale(131.154).center([0,13.9389])},t.geoConicEquidistantRaw=ed,t.geoContains=function(t,n){return(t&&vl.hasOwnProperty(t.type)?vl[t.type]:bl)(t,n)},t.geoDistance=yl,t.geoEqualEarth=function(){return Bh(cd).scale(177.158)},t.geoEqualEarthRaw=cd,t.geoEquirectangular=function(){return Bh(nd).scale(152.63)},t.geoEquirectangularRaw=nd,t.geoGnomonic=function(){return Bh(fd).scale(144.049).clipAngle(60)},t.geoGnomonicRaw=fd,t.geoGraticule=El,t.geoGraticule10=function(){return El()()},t.geoIdentity=function(){var t,n,e,r,i,o,a,u=1,c=0,f=0,s=1,l=1,h=0,d=null,p=1,g=1,y=Ch({point:function(t,n){var e=b([t,n]);this.stream.point(e[0],e[1])}}),v=zl;function _(){return p=u*s,g=u*l,o=a=null,b}function b(e){var r=e[0]*p,i=e[1]*g;if(h){var o=i*t-r*n;r=r*t+i*n,i=o}return[r+c,i+f]}return b.invert=function(e){var r=e[0]-c,i=e[1]-f;if(h){var o=i*t+r*n;r=r*t-i*n,i=o}return[r/p,i/g]},b.stream=function(t){return o&&a===t?o:o=y(v(a=t))},b.postclip=function(t){return arguments.length?(v=t,d=e=r=i=null,_()):v},b.clipExtent=function(t){return arguments.length?(v=null==t?(d=e=r=i=null,zl):cl(d=+t[0][0],e=+t[0][1],r=+t[1][0],i=+t[1][1]),_()):null==d?null:[[d,e],[r,i]]},b.scale=function(t){return arguments.length?(u=+t,_()):u},b.translate=function(t){return arguments.length?(c=+t[0],f=+t[1],_()):[c,f]},b.angle=function(e){return arguments.length?(n=af(h=e%360*Wc),t=Jc(h),_()):h*Vc},b.reflectX=function(t){return arguments.length?(s=t?-1:1,_()):s<0},b.reflectY=function(t){return arguments.length?(l=t?-1:1,_()):l<0},b.fitExtent=function(t,n){return $h(b,t,n)},b.fitSize=function(t,n){return Dh(b,t,n)},b.fitWidth=function(t,n){return Rh(b,t,n)},b.fitHeight=function(t,n){return Fh(b,t,n)},b},t.geoInterpolate=function(t,n){var e=t[0]*Wc,r=t[1]*Wc,i=n[0]*Wc,o=n[1]*Wc,a=Jc(r),u=af(r),c=Jc(o),f=af(o),s=a*Jc(e),l=a*af(e),h=c*Jc(i),d=c*af(i),p=2*lf(cf(hf(o-r)+a*c*hf(i-e))),g=af(p),y=p?function(t){var n=af(t*=p)/g,e=af(p-t)/g,r=e*s+n*h,i=e*l+n*d,o=e*u+n*f;return[Qc(i,r)*Vc,Qc(o,cf(r*r+i*i))*Vc]}:function(){return[e*Vc,r*Vc]};return y.distance=p,y},t.geoLength=dl,t.geoMercator=function(){return Qh(Kh).scale(961/Gc)},t.geoMercatorRaw=Kh,t.geoNaturalEarth1=function(){return Bh(sd).scale(175.295)},t.geoNaturalEarth1Raw=sd,t.geoOrthographic=function(){return Bh(ld).scale(249.5).clipAngle(90.000001)},t.geoOrthographicRaw=ld,t.geoPath=function(t,n){let e,r,i=3,o=4.5;function a(t){return t&&("function"==typeof o&&r.pointRadius(+o.apply(this,arguments)),bf(t,e(r))),r.result()}return a.area=function(t){return bf(t,e(Rl)),Rl.result()},a.measure=function(t){return bf(t,e(xh)),xh.result()},a.bounds=function(t){return bf(t,e(jl)),jl.result()},a.centroid=function(t){return bf(t,e(ih)),ih.result()},a.projection=function(n){return arguments.length?(e=null==n?(t=null,zl):(t=n).stream,a):t},a.context=function(t){return arguments.length?(r=null==t?(n=null,new Nh(i)):new ph(n=t),"function"!=typeof o&&r.pointRadius(o),a):n},a.pointRadius=function(t){return arguments.length?(o="function"==typeof t?t:(r.pointRadius(+t),+t),a):o},a.digits=function(t){if(!arguments.length)return i;if(null==t)i=null;else{const n=Math.floor(t);if(!(n>=0))throw new RangeError(`invalid digits: ${t}`);i=n}return null===n&&(r=new Nh(i)),a},a.projection(t).digits(i).context(n)},t.geoProjection=Bh,t.geoProjectionMutator=Yh,t.geoRotation=Bs,t.geoStereographic=function(){return Bh(hd).scale(250).clipAngle(142)},t.geoStereographicRaw=hd,t.geoStream=bf,t.geoTransform=function(t){return{stream:Ch(t)}},t.geoTransverseMercator=function(){var t=Qh(dd),n=t.center,e=t.rotate;return t.center=function(t){return arguments.length?n([-t[1],t[0]]):[(t=n())[1],-t[0]]},t.rotate=function(t){return arguments.length?e([t[0],t[1],t.length>2?t[2]+90:90]):[(t=e())[0],t[1],t[2]-90]},e([0,0,90]).scale(159.155)},t.geoTransverseMercatorRaw=dd,t.gray=function(t,n){return new nr(t,0,0,null==n?1:n)},t.greatest=it,t.greatestIndex=function(t,e=n){if(1===e.length)return J(t,e);let r,i=-1,o=-1;for(const n of t)++o,(i<0?0===e(n,n):e(n,r)>0)&&(r=n,i=o);return i},t.group=k,t.groupSort=function(t,e,r){return(2!==e.length?q(z(t,e,r),([t,e],[r,i])=>n(e,i)||n(t,r)):q(k(t,r),([t,r],[i,o])=>e(r,o)||n(t,i))).map(([t])=>t)},t.groups=C,t.hcl=ur,t.hierarchy=_d,t.histogram=K,t.hsl=Oe,t.html=oc,t.image=function(t,n){return new Promise(function(e,r){var i=new Image;for(var o in n)i[o]=n[o];i.onerror=r,i.onload=function(){e(i)},i.src=t})},t.index=function(t,...n){return R(t,N,D,n)},t.indexes=function(t,...n){return R(t,Array.from,D,n)},t.interpolate=Br,t.interpolateArray=function(t,n){return($r(n)?zr:Dr)(t,n)},t.interpolateBasis=xr,t.interpolateBasisClosed=wr,t.interpolateBlues=pb,t.interpolateBrBG=S_,t.interpolateBuGn=j_,t.interpolateBuPu=X_,t.interpolateCividis=function(t){return t=Math.max(0,Math.min(1,t)),"rgb("+Math.max(0,Math.min(255,Math.round(-4.54-t*(35.34-t*(2381.73-t*(6402.7-t*(7024.72-2710.57*t)))))))+", "+Math.max(0,Math.min(255,Math.round(32.49+t*(170.73+t*(52.82-t*(131.46-t*(176.58-67.37*t)))))))+", "+Math.max(0,Math.min(255,Math.round(81.24+t*(442.36-t*(2482.43-t*(6167.24-t*(6614.94-2475.67*t)))))))+")"},t.interpolateCool=Eb,t.interpolateCubehelix=oi,t.interpolateCubehelixDefault=Tb,t.interpolateCubehelixLong=ai,t.interpolateDate=Rr,t.interpolateDiscrete=function(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}},t.interpolateGnBu=V_,t.interpolateGreens=yb,t.interpolateGreys=_b,t.interpolateHcl=ei,t.interpolateHclLong=ri,t.interpolateHsl=Jr,t.interpolateHslLong=ti,t.interpolateHue=function(t,n){var e=Tr(+t,+n);return function(t){var n=e(t);return n-360*Math.floor(n/360)}},t.interpolateInferno=Rb,t.interpolateLab=function(t,n){var e=Er((t=tr(t)).l,(n=tr(n)).l),r=Er(t.a,n.a),i=Er(t.b,n.b),o=Er(t.opacity,n.opacity);return function(n){return t.l=e(n),t.a=r(n),t.b=i(n),t.opacity=o(n),t+""}},t.interpolateMagma=Db,t.interpolateNumber=Fr,t.interpolateNumberArray=zr,t.interpolateObject=qr,t.interpolateOrRd=Z_,t.interpolateOranges=Ab,t.interpolatePRGn=N_,t.interpolatePiYG=C_,t.interpolatePlasma=Fb,t.interpolatePuBu=tb,t.interpolatePuBuGn=Q_,t.interpolatePuOr=z_,t.interpolatePuRd=eb,t.interpolatePurples=mb,t.interpolateRainbow=function(t){(t<0||t>1)&&(t-=Math.floor(t));var n=Math.abs(t-.5);return Nb.h=360*t-100,Nb.s=1.5-1.5*n,Nb.l=.8-.9*n,Nb+""},t.interpolateRdBu=D_,t.interpolateRdGy=F_,t.interpolateRdPu=ib,t.interpolateRdYlBu=I_,t.interpolateRdYlGn=O_,t.interpolateReds=wb,t.interpolateRgb=Nr,t.interpolateRgbBasis=Cr,t.interpolateRgbBasisClosed=Pr,t.interpolateRound=Yr,t.interpolateSinebow=function(t){var n;return t=(.5-t)*Math.PI,kb.r=255*(n=Math.sin(t))*n,kb.g=255*(n=Math.sin(t+Cb))*n,kb.b=255*(n=Math.sin(t+Pb))*n,kb+""},t.interpolateSpectral=Y_,t.interpolateString=Or,t.interpolateTransformCss=Vr,t.interpolateTransformSvg=Wr,t.interpolateTurbo=function(t){return t=Math.max(0,Math.min(1,t)),"rgb("+Math.max(0,Math.min(255,Math.round(34.61+t*(1172.33-t*(10793.56-t*(33300.12-t*(38394.49-14825.05*t)))))))+", "+Math.max(0,Math.min(255,Math.round(23.31+t*(557.33+t*(1225.33-t*(3574.96-t*(1073.77+707.56*t)))))))+", "+Math.max(0,Math.min(255,Math.round(27.2+t*(3211.1-t*(15327.97-t*(27814-t*(22569.18-6838.66*t)))))))+")"},t.interpolateViridis=$b,t.interpolateWarm=Sb,t.interpolateYlGn=cb,t.interpolateYlGnBu=ab,t.interpolateYlOrBr=sb,t.interpolateYlOrRd=hb,t.interpolateZoom=Kr,t.interrupt=ao,t.intersection=function(t,...n){t=new InternSet(t),n=n.map(yt);t:for(const e of t)for(const r of n)if(!r.has(e)){t.delete(e);continue t}return t},t.interval=function(t,n,e){var r=new mi,i=n;return null==n?(r.restart(t,n,e),r):(r._restart=r.restart,r.restart=function(t,n,e){n=+n,e=null==e?_i():+e,r._restart(function o(a){a+=i,r._restart(o,i+=n,e),t(a)},n,e)},r.restart(t,n,e),r)},t.isoFormat=wv,t.isoParse=Mv,t.json=function(t,n){return fetch(t,n).then(ec)},t.lab=tr,t.lch=function(t,n,e,r){return 1===arguments.length?ar(t):new cr(e,n,t,null==r?1:r)},t.least=function(t,e=n){let r,i=!1;if(1===e.length){let o;for(const a of t){const t=e(a);(i?n(t,o)<0:0===n(t,t))&&(r=a,o=t,i=!0)}}else for(const n of t)(i?e(n,r)<0:0===e(n,n))&&(r=n,i=!0);return r},t.leastIndex=lt,t.line=fm,t.lineRadial=vm,t.link=Em,t.linkHorizontal=function(){return Em(wm)},t.linkRadial=function(){const t=Em(Am);return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t},t.linkVertical=function(){return Em(Mm)},t.local=Gn,t.map=function(t,n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");if("function"!=typeof n)throw new TypeError("mapper is not a function");return Array.from(t,(e,r)=>n(e,r,t))},t.matcher=Lt,t.max=Q,t.maxIndex=J,t.mean=function(t,n){let e=0,r=0;if(void 0===n)for(let n of t)null!=n&&(n=+n)>=n&&(++e,r+=n);else{let i=-1;for(let o of t)null!=(o=n(o,++i,t))&&(o=+o)>=o&&(++e,r+=o)}if(e)return r/e},t.median=function(t,n){return ot(t,.5,n)},t.medianIndex=function(t,n){return ut(t,.5,n)},t.merge=ct,t.min=tt,t.minIndex=nt,t.mode=function(t,n){const e=new InternMap;if(void 0===n)for(let n of t)null!=n&&n>=n&&e.set(n,(e.get(n)||0)+1);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&i>=i&&e.set(i,(e.get(i)||0)+1)}let r,i=0;for(const[t,n]of e)n>i&&(i=n,r=t);return r},t.namespace=Dt,t.namespaces=$t,t.nice=W,t.now=_i,t.pack=function(){var t=null,n=1,e=1,r=Sd;function i(i){const o=kd();return i.x=n/2,i.y=e/2,t?i.eachBefore(jd(t)).eachAfter(Hd(r,.5,o)).eachBefore(Xd(1)):i.eachBefore(jd(Ld)).eachAfter(Hd(Sd,1,o)).eachAfter(Hd(r,i.r/Math.min(n,e),o)).eachBefore(Xd(Math.min(n,e)/(2*i.r))),i}return i.radius=function(n){return arguments.length?(t=Ad(n),i):t},i.size=function(t){return arguments.length?(n=+t[0],e=+t[1],i):[n,e]},i.padding=function(t){return arguments.length?(r="function"==typeof t?t:Ed(+t),i):r},i},t.packEnclose=function(t){return Cd(t,kd())},t.packSiblings=function(t){return Yd(t,kd()),t},t.pairs=function(t,n=ft){const e=[];let r,i=!1;for(const o of t)i&&e.push(n(r,o)),r=o,i=!0;return e},t.partition=function(){var t=1,n=1,e=0,r=!1;function i(i){var o=i.height+1;return i.x0=i.y0=e,i.x1=t,i.y1=n/o,i.eachBefore(function(t,n){return function(r){r.children&&Vd(r,r.x0,t*(r.depth+1)/n,r.x1,t*(r.depth+2)/n);var i=r.x0,o=r.y0,a=r.x1-e,u=r.y1-e;a<i&&(i=a=(i+a)/2),u<o&&(o=u=(o+u)/2),r.x0=i,r.y0=o,r.x1=a,r.y1=u}}(n,o)),r&&i.eachBefore(Gd),i}return i.round=function(t){return arguments.length?(r=!!t,i):r},i.size=function(e){return arguments.length?(t=+e[0],n=+e[1],i):[t,n]},i.padding=function(t){return arguments.length?(e=+t,i):e},i},t.path=da,t.pathRound=function(t=3){return new ha(+t)},t.permute=F,t.pie=function(){var t=hm,n=lm,e=null,r=qb(0),i=qb(Vb),o=qb(0);function a(a){var u,c,f,s,l,h=(a=im(a)).length,d=0,p=new Array(h),g=new Array(h),y=+r.apply(this,arguments),v=Math.min(Vb,Math.max(-Vb,i.apply(this,arguments)-y)),_=Math.min(Math.abs(v)/h,o.apply(this,arguments)),b=_*(v<0?-1:1);for(u=0;u<h;++u)(l=g[p[u]=u]=+t(a[u],u,a))>0&&(d+=l);for(null!=n?p.sort(function(t,e){return n(g[t],g[e])}):null!=e&&p.sort(function(t,n){return e(a[t],a[n])}),u=0,f=d?(v-h*b)/d:0;u<h;++u,y=s)c=p[u],s=y+((l=g[c])>0?l*f:0)+b,g[c]={data:a[c],index:u,value:l,startAngle:y,endAngle:s,padAngle:_};return g}return a.value=function(n){return arguments.length?(t="function"==typeof n?n:qb(+n),a):t},a.sortValues=function(t){return arguments.length?(n=t,e=null,a):n},a.sort=function(t){return arguments.length?(e=t,n=null,a):e},a.startAngle=function(t){return arguments.length?(r="function"==typeof t?t:qb(+t),a):r},a.endAngle=function(t){return arguments.length?(i="function"==typeof t?t:qb(+t),a):i},a.padAngle=function(t){return arguments.length?(o="function"==typeof t?t:qb(+t),a):o},a},t.piecewise=ui,t.pointRadial=bm,t.pointer=Zn,t.pointers=function(t,n){return t.target&&(t=Wn(t),void 0===n&&(n=t.currentTarget),t=t.touches||[t]),Array.from(t,t=>Zn(t,n))},t.polygonArea=function(t){for(var n,e=-1,r=t.length,i=t[r-1],o=0;++e<r;)n=i,i=t[e],o+=n[1]*i[0]-n[0]*i[1];return o/2},t.polygonCentroid=function(t){for(var n,e,r=-1,i=t.length,o=0,a=0,u=t[i-1],c=0;++r<i;)n=u,u=t[r],c+=e=n[0]*u[1]-u[0]*n[1],o+=(n[0]+u[0])*e,a+=(n[1]+u[1])*e;return[o/(c*=3),a/c]},t.polygonContains=function(t,n){for(var e,r,i=t.length,o=t[i-1],a=n[0],u=n[1],c=o[0],f=o[1],s=!1,l=0;l<i;++l)e=(o=t[l])[0],(r=o[1])>u!=f>u&&a<(c-e)*(u-r)/(f-r)+e&&(s=!s),c=e,f=r;return s},t.polygonHull=function(t){if((e=t.length)<3)return null;var n,e,r=new Array(e),i=new Array(e);for(n=0;n<e;++n)r[n]=[+t[n][0],+t[n][1],n];for(r.sort(pp),n=0;n<e;++n)i[n]=[r[n][0],-r[n][1]];var o=gp(r),a=gp(i),u=a[0]===o[0],c=a[a.length-1]===o[o.length-1],f=[];for(n=o.length-1;n>=0;--n)f.push(t[r[o[n]][2]]);for(n=+u;n<a.length-c;++n)f.push(t[r[a[n]][2]]);return f},t.polygonLength=function(t){for(var n,e,r=-1,i=t.length,o=t[i-1],a=o[0],u=o[1],c=0;++r<i;)n=a,e=u,n-=a=(o=t[r])[0],e-=u=o[1],c+=Math.hypot(n,e);return c},t.precisionFixed=Uc,t.precisionPrefix=Oc,t.precisionRound=Bc,t.quadtree=lc,t.quantile=ot,t.quantileIndex=ut,t.quantileSorted=at,t.quantize=function(t,n){for(var e=new Array(n),r=0;r<n;++r)e[r]=t(r/(n-1));return e},t.quickselect=et,t.radialArea=_m,t.radialLine=vm,t.randomBates=wp,t.randomBernoulli=Tp,t.randomBeta=Np,t.randomBinomial=kp,t.randomCauchy=Pp,t.randomExponential=Mp,t.randomGamma=Ep,t.randomGeometric=Sp,t.randomInt=_p,t.randomIrwinHall=xp,t.randomLcg=function(t=Math.random()){let n=0|(0<=t&&t<1?t/Dp:Math.abs(t));return()=>(n=1664525*n+1013904223|0,Dp*(n>>>0))},t.randomLogNormal=mp,t.randomLogistic=zp,t.randomNormal=bp,t.randomPareto=Ap,t.randomPoisson=$p,t.randomUniform=vp,t.randomWeibull=Cp,t.range=st,t.rank=function(t,e=n){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");let r=Array.from(t);const i=new Float64Array(r.length);2!==e.length&&(r=r.map(e),e=n);const o=(t,n)=>e(r[t],r[n]);let a,u;return(t=Uint32Array.from(r,(t,n)=>n)).sort(e===n?(t,n)=>U(r[t],r[n]):I(o)),t.forEach((t,n)=>{const e=o(t,void 0===a?t:a);e>=0?((void 0===a||e>0)&&(a=t,u=n),i[t]=u):i[t]=NaN}),i},t.reduce=function(t,n,e){if("function"!=typeof n)throw new TypeError("reducer is not a function");const r=t[Symbol.iterator]();let i,o,a=-1;if(arguments.length<3){if(({done:i,value:e}=r.next()),i)return;++a}for(;({done:i,value:o}=r.next()),!i;)e=n(e,o,++a,t);return e},t.reverse=function(t){if("function"!=typeof t[Symbol.iterator])throw new TypeError("values is not iterable");return Array.from(t).reverse()},t.rgb=Pe,t.ribbon=function(){return $a()},t.ribbonArrow=function(){return $a(za)},t.rollup=z,t.rollups=$,t.scaleBand=Nv,t.scaleDiverging=function t(){var n=Ov(s_()(zv));return n.copy=function(){return c_(n,t())},Tv.apply(n,arguments)},t.scaleDivergingLog=function t(){var n=Vv(s_()).domain([.1,1,10]);return n.copy=function(){return c_(n,t()).base(n.base())},Tv.apply(n,arguments)},t.scaleDivergingPow=l_,t.scaleDivergingSqrt=function(){return l_.apply(null,arguments).exponent(.5)},t.scaleDivergingSymlog=function t(){var n=Kv(s_());return n.copy=function(){return c_(n,t()).constant(n.constant())},Tv.apply(n,arguments)},t.scaleIdentity=function t(n){var e;function r(t){return null==t||isNaN(t=+t)?e:t}return r.invert=r,r.domain=r.range=function(t){return arguments.length?(n=Array.from(t,Cv),r):n.slice()},r.unknown=function(t){return arguments.length?(e=t,r):e},r.copy=function(){return t(n).unknown(e)},n=arguments.length?Array.from(n,Cv):[0,1],Ov(r)},t.scaleImplicit=Sv,t.scaleLinear=function t(){var n=Iv();return n.copy=function(){return Fv(n,t())},Av.apply(n,arguments),Ov(n)},t.scaleLog=function t(){const n=Vv(qv()).domain([1,10]);return n.copy=()=>Fv(n,t()).base(n.base()),Av.apply(n,arguments),n},t.scaleOrdinal=Ev,t.scalePoint=function(){return kv(Nv.apply(null,arguments).paddingInner(1))},t.scalePow=e_,t.scaleQuantile=function t(){var e,r=[],i=[],o=[];function a(){var t=0,n=Math.max(1,i.length);for(o=new Array(n-1);++t<n;)o[t-1]=at(r,t/n);return c}function c(t){return null==t||isNaN(t=+t)?e:i[u(o,t)]}return c.invertExtent=function(t){var n=i.indexOf(t);return n<0?[NaN,NaN]:[n>0?o[n-1]:r[0],n<o.length?o[n]:r[r.length-1]]},c.domain=function(t){if(!arguments.length)return r.slice();r=[];for(let n of t)null==n||isNaN(n=+n)||r.push(n);return r.sort(n),a()},c.range=function(t){return arguments.length?(i=Array.from(t),a()):i.slice()},c.unknown=function(t){return arguments.length?(e=t,c):e},c.quantiles=function(){return o.slice()},c.copy=function(){return t().domain(r).range(i).unknown(e)},Av.apply(c,arguments)},t.scaleQuantize=function t(){var n,e=0,r=1,i=1,o=[.5],a=[0,1];function c(t){return null!=t&&t<=t?a[u(o,t,0,i)]:n}function f(){var t=-1;for(o=new Array(i);++t<i;)o[t]=((t+1)*r-(t-i)*e)/(i+1);return c}return c.domain=function(t){return arguments.length?([e,r]=t,e=+e,r=+r,f()):[e,r]},c.range=function(t){return arguments.length?(i=(a=Array.from(t)).length-1,f()):a.slice()},c.invertExtent=function(t){var n=a.indexOf(t);return n<0?[NaN,NaN]:n<1?[e,o[0]]:n>=i?[o[i-1],r]:[o[n-1],o[n]]},c.unknown=function(t){return arguments.length?(n=t,c):c},c.thresholds=function(){return o.slice()},c.copy=function(){return t().domain([e,r]).range(a).unknown(n)},Av.apply(Ov(c),arguments)},t.scaleRadial=function t(){var n,e=Iv(),r=[0,1],i=!1;function o(t){var r=function(t){return Math.sign(t)*Math.sqrt(Math.abs(t))}(e(t));return isNaN(r)?n:i?Math.round(r):r}return o.invert=function(t){return e.invert(r_(t))},o.domain=function(t){return arguments.length?(e.domain(t),o):e.domain()},o.range=function(t){return arguments.length?(e.range((r=Array.from(t,Cv)).map(r_)),o):r.slice()},o.rangeRound=function(t){return o.range(t).round(!0)},o.round=function(t){return arguments.length?(i=!!t,o):i},o.clamp=function(t){return arguments.length?(e.clamp(t),o):e.clamp()},o.unknown=function(t){return arguments.length?(n=t,o):n},o.copy=function(){return t(e.domain(),r).round(i).clamp(e.clamp()).unknown(n)},Av.apply(o,arguments),Ov(o)},t.scaleSequential=function t(){var n=Ov(u_()(zv));return n.copy=function(){return c_(n,t())},Tv.apply(n,arguments)},t.scaleSequentialLog=function t(){var n=Vv(u_()).domain([1,10]);return n.copy=function(){return c_(n,t()).base(n.base())},Tv.apply(n,arguments)},t.scaleSequentialPow=f_,t.scaleSequentialQuantile=function t(){var e=[],r=zv;function i(t){if(null!=t&&!isNaN(t=+t))return r((u(e,t,1)-1)/(e.length-1))}return i.domain=function(t){if(!arguments.length)return e.slice();e=[];for(let n of t)null==n||isNaN(n=+n)||e.push(n);return e.sort(n),i},i.interpolator=function(t){return arguments.length?(r=t,i):r},i.range=function(){return e.map((t,n)=>r(n/(e.length-1)))},i.quantiles=function(t){return Array.from({length:t+1},(n,r)=>ot(e,r/t))},i.copy=function(){return t(r).domain(e)},Tv.apply(i,arguments)},t.scaleSequentialSqrt=function(){return f_.apply(null,arguments).exponent(.5)},t.scaleSequentialSymlog=function t(){var n=Kv(u_());return n.copy=function(){return c_(n,t()).constant(n.constant())},Tv.apply(n,arguments)},t.scaleSqrt=function(){return e_.apply(null,arguments).exponent(.5)},t.scaleSymlog=function t(){var n=Kv(qv());return n.copy=function(){return Fv(n,t()).constant(n.constant())},Av.apply(n,arguments)},t.scaleThreshold=function t(){var n,e=[.5],r=[0,1],i=1;function o(t){return null!=t&&t<=t?r[u(e,t,0,i)]:n}return o.domain=function(t){return arguments.length?(e=Array.from(t),i=Math.min(e.length,r.length-1),o):e.slice()},o.range=function(t){return arguments.length?(r=Array.from(t),i=Math.min(e.length,r.length-1),o):r.slice()},o.invertExtent=function(t){var n=r.indexOf(t);return[e[n-1],e[n]]},o.unknown=function(t){return arguments.length?(n=t,o):n},o.copy=function(){return t().domain(e).range(r).unknown(n)},Av.apply(o,arguments)},t.scaleTime=function(){return Av.apply(a_(Zg,Kg,Lg,Ug,sg,rg,Jp,Wp,Gp,t.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)]),arguments)},t.scaleUtc=function(){return Av.apply(a_(Vg,Wg,Hg,Bg,Tg,og,ng,Kp,Gp,t.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)]),arguments)},t.scan=function(t,n){const e=lt(t,n);return e<0?void 0:e},t.schemeAccent=p_,t.schemeBlues=db,t.schemeBrBG=T_,t.schemeBuGn=L_,t.schemeBuPu=H_,t.schemeCategory10=d_,t.schemeDark2=g_,t.schemeGnBu=G_,t.schemeGreens=gb,t.schemeGreys=vb,t.schemeObservable10=y_,t.schemeOrRd=W_,t.schemeOranges=Mb,t.schemePRGn=E_,t.schemePaired=v_,t.schemePastel1=__,t.schemePastel2=b_,t.schemePiYG=k_,t.schemePuBu=J_,t.schemePuBuGn=K_,t.schemePuOr=P_,t.schemePuRd=nb,t.schemePurples=bb,t.schemeRdBu=$_,t.schemeRdGy=R_,t.schemeRdPu=rb,t.schemeRdYlBu=q_,t.schemeRdYlGn=U_,t.schemeReds=xb,t.schemeSet1=m_,t.schemeSet2=x_,t.schemeSet3=w_,t.schemeSpectral=B_,t.schemeTableau10=M_,t.schemeYlGn=ub,t.schemeYlGnBu=ob,t.schemeYlOrBr=fb,t.schemeYlOrRd=lb,t.select=Hn,t.selectAll=function(t){return"string"==typeof t?new Ln([document.querySelectorAll(t)],[document.documentElement]):new Ln([Ot(t)],Yn)},t.selection=jn,t.selector=Ut,t.selectorAll=Yt,t.shuffle=ht,t.shuffler=dt,t.some=function(t,n){if("function"!=typeof n)throw new TypeError("test is not a function");let e=-1;for(const r of t)if(n(r,++e,t))return!0;return!1},t.sort=q,t.stack=function(){var t=qb([]),n=Dx,e=$x,r=Rx;function i(i){var o,a,u=Array.from(t.apply(this,arguments),Fx),c=u.length,f=-1;for(const t of i)for(o=0,++f;o<c;++o)(u[o][f]=[0,+r(t,u[o].key,f,i)]).data=t;for(o=0,a=im(n(u));o<c;++o)u[a[o]].index=o;return e(u,a),u}return i.keys=function(n){return arguments.length?(t="function"==typeof n?n:qb(Array.from(n)),i):t},i.value=function(t){return arguments.length?(r="function"==typeof t?t:qb(+t),i):r},i.order=function(t){return arguments.length?(n=null==t?Dx:"function"==typeof t?t:qb(Array.from(t)),i):n},i.offset=function(t){return arguments.length?(e=null==t?$x:t,i):e},i},t.stackOffsetDiverging=function(t,n){if((u=t.length)>0)for(var e,r,i,o,a,u,c=0,f=t[n[0]].length;c<f;++c)for(o=a=0,e=0;e<u;++e)(i=(r=t[n[e]][c])[1]-r[0])>0?(r[0]=o,r[1]=o+=i):i<0?(r[1]=a,r[0]=a+=i):(r[0]=0,r[1]=i)},t.stackOffsetExpand=function(t,n){if((r=t.length)>0){for(var e,r,i,o=0,a=t[0].length;o<a;++o){for(i=e=0;e<r;++e)i+=t[e][o][1]||0;if(i)for(e=0;e<r;++e)t[e][o][1]/=i}$x(t,n)}},t.stackOffsetNone=$x,t.stackOffsetSilhouette=function(t,n){if((e=t.length)>0){for(var e,r=0,i=t[n[0]],o=i.length;r<o;++r){for(var a=0,u=0;a<e;++a)u+=t[a][r][1]||0;i[r][1]+=i[r][0]=-u/2}$x(t,n)}},t.stackOffsetWiggle=function(t,n){if((i=t.length)>0&&(r=(e=t[n[0]]).length)>0){for(var e,r,i,o=0,a=1;a<r;++a){for(var u=0,c=0,f=0;u<i;++u){for(var s=t[n[u]],l=s[a][1]||0,h=(l-(s[a-1][1]||0))/2,d=0;d<u;++d){var p=t[n[d]];h+=(p[a][1]||0)-(p[a-1][1]||0)}c+=l,f+=h*l}e[a-1][1]+=e[a-1][0]=o,c&&(o-=f/c)}e[a-1][1]+=e[a-1][0]=o,$x(t,n)}},t.stackOrderAppearance=qx,t.stackOrderAscending=Ux,t.stackOrderDescending=function(t){return Ux(t).reverse()},t.stackOrderInsideOut=function(t){var n,e,r=t.length,i=t.map(Ox),o=qx(t),a=0,u=0,c=[],f=[];for(n=0;n<r;++n)e=o[n],a<u?(a+=i[e],c.push(e)):(u+=i[e],f.push(e));return f.reverse().concat(c)},t.stackOrderNone=Dx,t.stackOrderReverse=function(t){return Dx(t).reverse()},t.stratify=function(){var t,n=Qd,e=Jd;function r(r){var i,o,a,u,c,f,s,l,h=Array.from(r),d=n,p=e,g=new Map;if(null!=t){const n=h.map((n,e)=>function(t){t=`${t}`;let n=t.length;np(t,n-1)&&!np(t,n-2)&&(t=t.slice(0,-1));return"/"===t[0]?t:`/${t}`}(t(n,e,r))),e=n.map(tp),i=new Set(n).add("");for(const t of e)i.has(t)||(i.add(t),n.push(t),e.push(tp(t)),h.push(Kd));d=(t,e)=>n[e],p=(t,n)=>e[n]}for(a=0,i=h.length;a<i;++a)o=h[a],f=h[a]=new Md(o),null!=(s=d(o,a,r))&&(s+="")&&(l=f.id=s,g.set(l,g.has(l)?Zd:f)),null!=(s=p(o,a,r))&&(s+="")&&(f.parent=s);for(a=0;a<i;++a)if(s=(f=h[a]).parent){if(!(c=g.get(s)))throw new Error("missing: "+s);if(c===Zd)throw new Error("ambiguous: "+s);c.children?c.children.push(f):c.children=[f],f.parent=c}else{if(u)throw new Error("multiple roots");u=f}if(!u)throw new Error("no root");if(null!=t){for(;u.data===Kd&&1===u.children.length;)u=u.children[0],--i;for(let t=h.length-1;t>=0&&(f=h[t]).data===Kd;--t)f.data=null}if(u.parent=Wd,u.eachBefore(function(t){t.depth=t.parent.depth+1,--i}).eachBefore(wd),u.parent=null,i>0)throw new Error("cycle");return u}return r.id=function(t){return arguments.length?(n=Ad(t),r):n},r.parentId=function(t){return arguments.length?(e=Ad(t),r):e},r.path=function(n){return arguments.length?(t=Ad(n),r):t},r},t.style=dn,t.subset=function(t,n){return vt(n,t)},t.sum=function(t,n){let e=0;if(void 0===n)for(let n of t)(n=+n)&&(e+=n);else{let r=-1;for(let i of t)(i=+n(i,++r,t))&&(e+=i)}return e},t.superset=vt,t.svg=ac,t.symbol=function(t,n){let e=null,r=Zb(i);function i(){let i;if(e||(e=i=r()),t.apply(this,arguments).draw(e,+n.apply(this,arguments)),i)return e=null,i+""||null}return t="function"==typeof t?t:qb(t||Cm),n="function"==typeof n?n:qb(void 0===n?64:+n),i.type=function(n){return arguments.length?(t="function"==typeof n?n:qb(n),i):t},i.size=function(t){return arguments.length?(n="function"==typeof t?t:qb(+t),i):n},i.context=function(t){return arguments.length?(e=null==t?null:t,i):e},i},t.symbolAsterisk=km,t.symbolCircle=Cm,t.symbolCross=Pm,t.symbolDiamond=Dm,t.symbolDiamond2=Rm,t.symbolPlus=Fm,t.symbolSquare=qm,t.symbolSquare2=Im,t.symbolStar=Ym,t.symbolTimes=Qm,t.symbolTriangle=jm,t.symbolTriangle2=Xm,t.symbolWye=Km,t.symbolX=Qm,t.symbols=Jm,t.symbolsFill=Jm,t.symbolsStroke=tx,t.text=Qu,t.thresholdFreedmanDiaconis=function(t,n,e){const r=y(t),i=ot(t,.75)-ot(t,.25);return r&&i?Math.ceil((e-n)/(2*i*Math.pow(r,-1/3))):1},t.thresholdScott=function(t,n,e){const r=y(t),i=x(t);return r&&i?Math.ceil((e-n)*Math.cbrt(r)/(3.49*i)):1},t.thresholdSturges=Z,t.tickFormat=Uv,t.tickIncrement=G,t.tickStep=V,t.ticks=X,t.timeDay=rg,t.timeDays=ig,t.timeFormatDefaultLocale=mv,t.timeFormatLocale=ny,t.timeFriday=gg,t.timeFridays=wg,t.timeHour=Jp,t.timeHours=tg,t.timeInterval=qp,t.timeMillisecond=Ip,t.timeMilliseconds=Up,t.timeMinute=Wp,t.timeMinutes=Zp,t.timeMonday=lg,t.timeMondays=_g,t.timeMonth=Ug,t.timeMonths=Og,t.timeSaturday=yg,t.timeSaturdays=Mg,t.timeSecond=Gp,t.timeSeconds=Vp,t.timeSunday=sg,t.timeSundays=vg,t.timeThursday=pg,t.timeThursdays=xg,t.timeTickInterval=Kg,t.timeTicks=Zg,t.timeTuesday=hg,t.timeTuesdays=bg,t.timeWednesday=dg,t.timeWednesdays=mg,t.timeWeek=sg,t.timeWeeks=vg,t.timeYear=Lg,t.timeYears=jg,t.timeout=Si,t.timer=xi,t.timerFlush=wi,t.transition=No,t.transpose=pt,t.tree=function(){var t=ep,n=1,e=1,r=null;function i(i){var c=function(t){for(var n,e,r,i,o,a=new up(t,0),u=[a];n=u.pop();)if(r=n._.children)for(n.children=new Array(o=r.length),i=o-1;i>=0;--i)u.push(e=n.children[i]=new up(r[i],i)),e.parent=n;return(a.parent=new up(null,0)).children=[a],a}(i);if(c.eachAfter(o),c.parent.m=-c.z,c.eachBefore(a),r)i.eachBefore(u);else{var f=i,s=i,l=i;i.eachBefore(function(t){t.x<f.x&&(f=t),t.x>s.x&&(s=t),t.depth>l.depth&&(l=t)});var h=f===s?1:t(f,s)/2,d=h-f.x,p=n/(s.x+h+d),g=e/(l.depth||1);i.eachBefore(function(t){t.x=(t.x+d)*p,t.y=t.depth*g})}return i}function o(n){var e=n.children,r=n.parent.children,i=n.i?r[n.i-1]:null;if(e){!function(t){for(var n,e=0,r=0,i=t.children,o=i.length;--o>=0;)(n=i[o]).z+=e,n.m+=e,e+=n.s+(r+=n.c)}(n);var o=(e[0].z+e[e.length-1].z)/2;i?(n.z=i.z+t(n._,i._),n.m=n.z-o):n.z=o}else i&&(n.z=i.z+t(n._,i._));n.parent.A=function(n,e,r){if(e){for(var i,o=n,a=n,u=e,c=o.parent.children[0],f=o.m,s=a.m,l=u.m,h=c.m;u=ip(u),o=rp(o),u&&o;)c=rp(c),(a=ip(a)).a=n,(i=u.z+l-o.z-f+t(u._,o._))>0&&(op(ap(u,n,r),n,i),f+=i,s+=i),l+=u.m,f+=o.m,h+=c.m,s+=a.m;u&&!ip(a)&&(a.t=u,a.m+=l-s),o&&!rp(c)&&(c.t=o,c.m+=f-h,r=n)}return r}(n,i,n.parent.A||r[0])}function a(t){t._.x=t.z+t.parent.m,t.m+=t.parent.m}function u(t){t.x*=n,t.y=t.depth*e}return i.separation=function(n){return arguments.length?(t=n,i):t},i.size=function(t){return arguments.length?(r=!1,n=+t[0],e=+t[1],i):r?null:[n,e]},i.nodeSize=function(t){return arguments.length?(r=!0,n=+t[0],e=+t[1],i):r?[n,e]:null},i},t.treemap=function(){var t=lp,n=!1,e=1,r=1,i=[0],o=Sd,a=Sd,u=Sd,c=Sd,f=Sd;function s(t){return t.x0=t.y0=0,t.x1=e,t.y1=r,t.eachBefore(l),i=[0],n&&t.eachBefore(Gd),t}function l(n){var e=i[n.depth],r=n.x0+e,s=n.y0+e,l=n.x1-e,h=n.y1-e;l<r&&(r=l=(r+l)/2),h<s&&(s=h=(s+h)/2),n.x0=r,n.y0=s,n.x1=l,n.y1=h,n.children&&(e=i[n.depth+1]=o(n)/2,r+=f(n)-e,s+=a(n)-e,(l-=u(n)-e)<r&&(r=l=(r+l)/2),(h-=c(n)-e)<s&&(s=h=(s+h)/2),t(n,r,s,l,h))}return s.round=function(t){return arguments.length?(n=!!t,s):n},s.size=function(t){return arguments.length?(e=+t[0],r=+t[1],s):[e,r]},s.tile=function(n){return arguments.length?(t=Td(n),s):t},s.padding=function(t){return arguments.length?s.paddingInner(t).paddingOuter(t):s.paddingInner()},s.paddingInner=function(t){return arguments.length?(o="function"==typeof t?t:Ed(+t),s):o},s.paddingOuter=function(t){return arguments.length?s.paddingTop(t).paddingRight(t).paddingBottom(t).paddingLeft(t):s.paddingTop()},s.paddingTop=function(t){return arguments.length?(a="function"==typeof t?t:Ed(+t),s):a},s.paddingRight=function(t){return arguments.length?(u="function"==typeof t?t:Ed(+t),s):u},s.paddingBottom=function(t){return arguments.length?(c="function"==typeof t?t:Ed(+t),s):c},s.paddingLeft=function(t){return arguments.length?(f="function"==typeof t?t:Ed(+t),s):f},s},t.treemapBinary=function(t,n,e,r,i){var o,a,u=t.children,c=u.length,f=new Array(c+1);for(f[0]=a=o=0;o<c;++o)f[o+1]=a+=u[o].value;!function t(n,e,r,i,o,a,c){if(n>=e-1){var s=u[n];return s.x0=i,s.y0=o,s.x1=a,void(s.y1=c)}var l=f[n],h=r/2+l,d=n+1,p=e-1;for(;d<p;){var g=d+p>>>1;f[g]<h?d=g+1:p=g}h-f[d-1]<f[d]-h&&n+1<d&&--d;var y=f[d]-l,v=r-y;if(a-i>c-o){var _=r?(i*v+a*y)/r:a;t(n,d,y,i,o,_,c),t(d,e,v,_,o,a,c)}else{var b=r?(o*v+c*y)/r:c;t(n,d,y,i,o,a,b),t(d,e,v,i,b,a,c)}}(0,c,t.value,n,e,r,i)},t.treemapDice=Vd,t.treemapResquarify=hp,t.treemapSlice=cp,t.treemapSliceDice=function(t,n,e,r,i){(1&t.depth?cp:Vd)(t,n,e,r,i)},t.treemapSquarify=lp,t.tsv=nc,t.tsvFormat=Lu,t.tsvFormatBody=ju,t.tsvFormatRow=Xu,t.tsvFormatRows=Hu,t.tsvFormatValue=Gu,t.tsvParse=Bu,t.tsvParseRows=Yu,t.union=function(...t){const n=new InternSet;for(const e of t)for(const t of e)n.add(t);return n},t.unixDay=ug,t.unixDays=cg,t.utcDay=og,t.utcDays=ag,t.utcFriday=Cg,t.utcFridays=qg,t.utcHour=ng,t.utcHours=eg,t.utcMillisecond=Ip,t.utcMilliseconds=Up,t.utcMinute=Kp,t.utcMinutes=Qp,t.utcMonday=Sg,t.utcMondays=$g,t.utcMonth=Bg,t.utcMonths=Yg,t.utcSaturday=Pg,t.utcSaturdays=Ig,t.utcSecond=Gp,t.utcSeconds=Vp,t.utcSunday=Tg,t.utcSundays=zg,t.utcThursday=kg,t.utcThursdays=Fg,t.utcTickInterval=Wg,t.utcTicks=Vg,t.utcTuesday=Eg,t.utcTuesdays=Dg,t.utcWednesday=Ng,t.utcWednesdays=Rg,t.utcWeek=Tg,t.utcWeeks=zg,t.utcYear=Hg,t.utcYears=Xg,t.variance=m,t.version="7.9.2",t.window=fn,t.xml=ic,t.zip=function(){return pt(arguments)},t.zoom=function(){var t,n,e,r=Vx,i=Wx,o=Jx,a=Kx,u=Qx,c=[0,1/0],f=[[-1/0,-1/0],[1/0,1/0]],s=250,l=Kr,h=Nt("start","zoom","end"),d=0,p=10;function g(t){t.property("__zoom",Zx).on("wheel.zoom",w,{passive:!1}).on("mousedown.zoom",M).on("dblclick.zoom",A).filter(u).on("touchstart.zoom",T).on("touchmove.zoom",S).on("touchend.zoom touchcancel.zoom",E).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function y(t,n){return(n=Math.max(c[0],Math.min(c[1],n)))===t.k?t:new Lx(n,t.x,t.y)}function v(t,n,e){var r=n[0]-e[0]*t.k,i=n[1]-e[1]*t.k;return r===t.x&&i===t.y?t:new Lx(t.k,r,i)}function _(t){return[(+t[0][0]+ +t[1][0])/2,(+t[0][1]+ +t[1][1])/2]}function b(t,n,e,r){t.on("start.zoom",function(){m(this,arguments).event(r).start()}).on("interrupt.zoom end.zoom",function(){m(this,arguments).event(r).end()}).tween("zoom",function(){var t=this,o=arguments,a=m(t,o).event(r),u=i.apply(t,o),c=null==e?_(u):"function"==typeof e?e.apply(t,o):e,f=Math.max(u[1][0]-u[0][0],u[1][1]-u[0][1]),s=t.__zoom,h="function"==typeof n?n.apply(t,o):n,d=l(s.invert(c).concat(f/s.k),h.invert(c).concat(f/h.k));return function(t){if(1===t)t=h;else{var n=d(t),e=f/n[2];t=new Lx(e,c[0]-n[0]*e,c[1]-n[1]*e)}a.zoom(null,t)}})}function m(t,n,e){return!e&&t.__zooming||new x(t,n)}function x(t,n){this.that=t,this.args=n,this.active=0,this.sourceEvent=null,this.extent=i.apply(t,n),this.taps=0}function w(t,...n){if(r.apply(this,arguments)){var e=m(this,n).event(t),i=this.__zoom,u=Math.max(c[0],Math.min(c[1],i.k*Math.pow(2,a.apply(this,arguments)))),s=Zn(t);if(e.wheel)e.mouse[0][0]===s[0]&&e.mouse[0][1]===s[1]||(e.mouse[1]=i.invert(e.mouse[0]=s)),clearTimeout(e.wheel);else{if(i.k===u)return;e.mouse=[s,i.invert(s)],ao(this),e.start()}Gx(t),e.wheel=setTimeout(function(){e.wheel=null,e.end()},150),e.zoom("mouse",o(v(y(i,u),e.mouse[0],e.mouse[1]),e.extent,f))}}function M(t,...n){if(!e&&r.apply(this,arguments)){var i=t.currentTarget,a=m(this,n,!0).event(t),u=Hn(t.view).on("mousemove.zoom",function(t){if(Gx(t),!a.moved){var n=t.clientX-s,e=t.clientY-l;a.moved=n*n+e*e>d}a.event(t).zoom("mouse",o(v(a.that.__zoom,a.mouse[0]=Zn(t,i),a.mouse[1]),a.extent,f))},!0).on("mouseup.zoom",function(t){u.on("mousemove.zoom mouseup.zoom",null),ee(t.view,a.moved),Gx(t),a.event(t).end()},!0),c=Zn(t,i),s=t.clientX,l=t.clientY;ne(t.view),Xx(t),a.mouse=[c,this.__zoom.invert(c)],ao(this),a.start()}}function A(t,...n){if(r.apply(this,arguments)){var e=this.__zoom,a=Zn(t.changedTouches?t.changedTouches[0]:t,this),u=e.invert(a),c=e.k*(t.shiftKey?.5:2),l=o(v(y(e,c),a,u),i.apply(this,n),f);Gx(t),s>0?Hn(this).transition().duration(s).call(b,l,a,t):Hn(this).call(g.transform,l,a,t)}}function T(e,...i){if(r.apply(this,arguments)){var o,a,u,c,f=e.touches,s=f.length,l=m(this,i,e.changedTouches.length===s).event(e);for(Xx(e),a=0;a<s;++a)c=[c=Zn(u=f[a],this),this.__zoom.invert(c),u.identifier],l.touch0?l.touch1||l.touch0[2]===c[2]||(l.touch1=c,l.taps=0):(l.touch0=c,o=!0,l.taps=1+!!t);t&&(t=clearTimeout(t)),o&&(l.taps<2&&(n=c[0],t=setTimeout(function(){t=null},500)),ao(this),l.start())}}function S(t,...n){if(this.__zooming){var e,r,i,a,u=m(this,n).event(t),c=t.changedTouches,s=c.length;for(Gx(t),e=0;e<s;++e)i=Zn(r=c[e],this),u.touch0&&u.touch0[2]===r.identifier?u.touch0[0]=i:u.touch1&&u.touch1[2]===r.identifier&&(u.touch1[0]=i);if(r=u.that.__zoom,u.touch1){var l=u.touch0[0],h=u.touch0[1],d=u.touch1[0],p=u.touch1[1],g=(g=d[0]-l[0])*g+(g=d[1]-l[1])*g,_=(_=p[0]-h[0])*_+(_=p[1]-h[1])*_;r=y(r,Math.sqrt(g/_)),i=[(l[0]+d[0])/2,(l[1]+d[1])/2],a=[(h[0]+p[0])/2,(h[1]+p[1])/2]}else{if(!u.touch0)return;i=u.touch0[0],a=u.touch0[1]}u.zoom("touch",o(v(r,i,a),u.extent,f))}}function E(t,...r){if(this.__zooming){var i,o,a=m(this,r).event(t),u=t.changedTouches,c=u.length;for(Xx(t),e&&clearTimeout(e),e=setTimeout(function(){e=null},500),i=0;i<c;++i)o=u[i],a.touch0&&a.touch0[2]===o.identifier?delete a.touch0:a.touch1&&a.touch1[2]===o.identifier&&delete a.touch1;if(a.touch1&&!a.touch0&&(a.touch0=a.touch1,delete a.touch1),a.touch0)a.touch0[1]=this.__zoom.invert(a.touch0[0]);else if(a.end(),2===a.taps&&(o=Zn(o,this),Math.hypot(n[0]-o[0],n[1]-o[1])<p)){var f=Hn(this).on("dblclick.zoom");f&&f.apply(this,arguments)}}}return g.transform=function(t,n,e,r){var i=t.selection?t.selection():t;i.property("__zoom",Zx),t!==i?b(t,n,e,r):i.interrupt().each(function(){m(this,arguments).event(r).start().zoom(null,"function"==typeof n?n.apply(this,arguments):n).end()})},g.scaleBy=function(t,n,e,r){g.scaleTo(t,function(){return this.__zoom.k*("function"==typeof n?n.apply(this,arguments):n)},e,r)},g.scaleTo=function(t,n,e,r){g.transform(t,function(){var t=i.apply(this,arguments),r=this.__zoom,a=null==e?_(t):"function"==typeof e?e.apply(this,arguments):e,u=r.invert(a),c="function"==typeof n?n.apply(this,arguments):n;return o(v(y(r,c),a,u),t,f)},e,r)},g.translateBy=function(t,n,e,r){g.transform(t,function(){return o(this.__zoom.translate("function"==typeof n?n.apply(this,arguments):n,"function"==typeof e?e.apply(this,arguments):e),i.apply(this,arguments),f)},null,r)},g.translateTo=function(t,n,e,r,a){g.transform(t,function(){var t=i.apply(this,arguments),a=this.__zoom,u=null==r?_(t):"function"==typeof r?r.apply(this,arguments):r;return o(jx.translate(u[0],u[1]).scale(a.k).translate("function"==typeof n?-n.apply(this,arguments):-n,"function"==typeof e?-e.apply(this,arguments):-e),t,f)},r,a)},x.prototype={event:function(t){return t&&(this.sourceEvent=t),this},start:function(){return 1===++this.active&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(t,n){return this.mouse&&"mouse"!==t&&(this.mouse[1]=n.invert(this.mouse[0])),this.touch0&&"touch"!==t&&(this.touch0[1]=n.invert(this.touch0[0])),this.touch1&&"touch"!==t&&(this.touch1[1]=n.invert(this.touch1[0])),this.that.__zoom=n,this.emit("zoom"),this},end:function(){return 0===--this.active&&(delete this.that.__zooming,this.emit("end")),this},emit:function(t){var n=Hn(this.that).datum();h.call(t,this.that,new Yx(t,{sourceEvent:this.sourceEvent,target:g,transform:this.that.__zoom,dispatch:h}),n)}},g.wheelDelta=function(t){return arguments.length?(a="function"==typeof t?t:Bx(+t),g):a},g.filter=function(t){return arguments.length?(r="function"==typeof t?t:Bx(!!t),g):r},g.touchable=function(t){return arguments.length?(u="function"==typeof t?t:Bx(!!t),g):u},g.extent=function(t){return arguments.length?(i="function"==typeof t?t:Bx([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),g):i},g.scaleExtent=function(t){return arguments.length?(c[0]=+t[0],c[1]=+t[1],g):[c[0],c[1]]},g.translateExtent=function(t){return arguments.length?(f[0][0]=+t[0][0],f[1][0]=+t[1][0],f[0][1]=+t[0][1],f[1][1]=+t[1][1],g):[[f[0][0],f[0][1]],[f[1][0],f[1][1]]]},g.constrain=function(t){return arguments.length?(o=t,g):o},g.duration=function(t){return arguments.length?(s=+t,g):s},g.interpolate=function(t){return arguments.length?(l=t,g):l},g.on=function(){var t=h.on.apply(h,arguments);return t===h?g:t},g.clickDistance=function(t){return arguments.length?(d=(t=+t)*t,g):Math.sqrt(d)},g.tapDistance=function(t){return arguments.length?(p=+t,g):p},g},t.zoomIdentity=jx,t.zoomTransform=Hx});

	return module.exports;
})();
var __LM_UI__=(()=>{var Ff=Object.create;var lr=Object.defineProperty;var Bf=Object.getOwnPropertyDescriptor;var Vf=Object.getOwnPropertyNames;var Ef=Object.getPrototypeOf,Of=Object.prototype.hasOwnProperty;var P=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,a)=>(typeof require<"u"?require:t)[a]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var qf=(e,t)=>{for(var a in t)lr(e,a,{get:t[a],enumerable:!0})},An=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Vf(t))!Of.call(e,r)&&r!==a&&lr(e,r,{get:()=>t[r],enumerable:!(o=Bf(t,r))||o.enumerable});return e};var Ka=(e,t,a)=>(a=e!=null?Ff(Ef(e)):{},An(t||!e||!e.__esModule?lr(a,"default",{value:e,enumerable:!0}):a,e)),Uf=e=>An(lr({},"__esModule",{value:!0}),e);var ih={};qf(ih,{createMemoryUiRuntime:()=>sh});var Ho=P("react/jsx-runtime"),Qe=P("react");var kn=P("react"),et=(0,kn.createContext)({});var Mn=P("react");function ve(e){let t=(0,Mn.useRef)(null);return t.current===null&&(t.current=e()),t.current}var ur=P("react");var Dn=typeof window<"u";var Pe=Dn?ur.useLayoutEffect:ur.useEffect;var ln=P("react/jsx-runtime"),$u=Ka(P("react"),1),wt=P("react");var Rn=P("react"),pt=(0,Rn.createContext)(null);var Zu=P("react/jsx-runtime");function Rt(e,t){e.indexOf(t)===-1&&e.push(t)}function Le(e,t){let a=e.indexOf(t);a>-1&&e.splice(a,1)}var se=(e,t,a)=>a>t?t:a<e?e:a;var Ee=()=>{},ie=()=>{};var pe={};var Ft=e=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e);var Bt=e=>typeof e=="object"&&e!==null;var Vt=e=>/^0[^.\s]+$/u.test(e);function Xa(e){let t;return()=>(t===void 0&&(t=e()),t)}var Q=e=>e;var Oe=(...e)=>e.reduce((t,a)=>o=>a(t(o)));var Te=(e,t,a)=>{let o=t-e;return o?(a-e)/o:1};var ze=class{constructor(){this.subscriptions=[]}add(t){return Rt(this.subscriptions,t),()=>this.remove(t)}remove(t){Le(this.subscriptions,t)}notify(t,a,o){let r=this.subscriptions.length;if(r)if(r===1)this.subscriptions[0](t,a,o);else for(let i=0;i<r;i++){let s=this.subscriptions[i];s&&s(t,a,o)}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}};var $=e=>e*1e3,le=e=>e/1e3;var Za=(e,t)=>t?e*(1e3/t):0;var Fn=(e,t,a)=>{let o=t-e;return((a-e)%o+o)%o+e};var Bn=(e,t,a)=>(((1-3*a+3*t)*e+(3*a-6*t))*e+3*t)*e,Nf=1e-7,Hf=12;function Gf(e,t,a,o,r){let i,s,n=0;do s=t+(a-t)/2,i=Bn(s,o,r)-e,i>0?a=s:t=s;while(Math.abs(i)>Nf&&++n<Hf);return s}function mt(e,t,a,o){if(e===t&&a===o)return Q;let r=i=>Gf(i,0,1,e,a);return i=>i===0||i===1?i:Bn(r(i),t,o)}var dr=e=>t=>t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2;var Et=e=>t=>1-e(1-t);var fr=mt(.33,1.53,.69,.99),ua=Et(fr),_a=dr(ua);var $a=e=>e>=1?1:(e*=2)<1?.5*ua(e):.5*(2-Math.pow(2,-10*(e-1)));var Ya=e=>1-Math.sin(Math.acos(e)),Qa=Et(Ya),Ja=dr(Ya);var Gs=mt(.42,0,1,1),zs=mt(0,0,.58,1),da=mt(.42,0,.58,1);var eo=e=>Array.isArray(e)&&typeof e[0]!="number";function to(e,t){return eo(e)?e[Fn(0,e.length,t)]:e}var ao=e=>Array.isArray(e)&&typeof e[0]=="number";var Vn={linear:Q,easeIn:Gs,easeInOut:da,easeOut:zs,circIn:Ya,circInOut:Ja,circOut:Qa,backIn:ua,backInOut:_a,backOut:fr,anticipate:$a},zf=e=>typeof e=="string",cr=e=>{if(ao(e)){ie(e.length===4,"Cubic bezier arrays must contain four numerical values.","cubic-bezier-length");let[t,a,o,r]=e;return mt(t,a,o,r)}else if(zf(e))return ie(Vn[e]!==void 0,`Invalid easing type '${e}'`,"invalid-easing-type"),Vn[e];return e};var W={delta:0,timestamp:0,isProcessing:!1};var pr;function Wf(){pr=void 0}var N={now:()=>(pr===void 0&&N.set(W.isProcessing||pe.useManualTiming?W.timestamp:performance.now()),pr),set:e=>{pr=e,queueMicrotask(Wf)}};var We=e=>Math.round(e*1e5)/1e5;var En=e=>t=>typeof t=="string"&&t.startsWith(e),mr=En("--"),jf=En("var(--"),fa=e=>jf(e)?Kf.test(e.split("/*")[0].trim()):!1,Kf=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function Ws(e){return typeof e!="string"?!1:e.split("/*")[0].includes("var(--")}var je={test:e=>typeof e=="number",parse:parseFloat,transform:e=>e},tt={...je,transform:e=>se(0,1,e)},oo={...je,default:1};var ca=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function On(e){return e==null}var qn=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;var pa=(e,t)=>a=>!!(typeof a=="string"&&qn.test(a)&&a.startsWith(e)||t&&!On(a)&&Object.prototype.hasOwnProperty.call(a,t)),hr=(e,t,a)=>o=>{if(typeof o!="string")return o;let[r,i,s,n]=o.match(ca);return{[e]:parseFloat(r),[t]:parseFloat(i),[a]:parseFloat(s),alpha:n!==void 0?parseFloat(n):1}};var Xf=e=>se(0,255,e),js={...je,transform:e=>Math.round(Xf(e))},Ke={test:pa("rgb","red"),parse:hr("red","green","blue"),transform:({red:e,green:t,blue:a,alpha:o=1})=>"rgba("+js.transform(e)+", "+js.transform(t)+", "+js.transform(a)+", "+We(tt.transform(o))+")"};function Zf(e){let t="",a="",o="",r="";return e.length>5?(t=e.substring(1,3),a=e.substring(3,5),o=e.substring(5,7),r=e.substring(7,9)):(t=e.substring(1,2),a=e.substring(2,3),o=e.substring(3,4),r=e.substring(4,5),t+=t,a+=a,o+=o,r+=r),{red:parseInt(t,16),green:parseInt(a,16),blue:parseInt(o,16),alpha:r?parseInt(r,16)/255:1}}var ro={test:pa("#"),parse:Zf,transform:Ke.transform};var so=e=>({test:t=>typeof t=="string"&&t.endsWith(e)&&t.split(" ").length===1,parse:parseFloat,transform:t=>`${t}${e}`}),Ae=so("deg"),he=so("%"),b=so("px"),Ks=so("vh"),Xs=so("vw"),xr={...he,parse:e=>he.parse(e)/100,transform:e=>he.transform(e*100)};var ht={test:pa("hsl","hue"),parse:hr("hue","saturation","lightness"),transform:({hue:e,saturation:t,lightness:a,alpha:o=1})=>"hsla("+Math.round(e)+", "+he.transform(We(t))+", "+he.transform(We(a))+", "+We(tt.transform(o))+")"};var Y={test:e=>Ke.test(e)||ro.test(e)||ht.test(e),parse:e=>Ke.test(e)?Ke.parse(e):ht.test(e)?ht.parse(e):ro.parse(e),transform:e=>typeof e=="string"?e:e.hasOwnProperty("red")?Ke.transform(e):ht.transform(e),getAnimatableNone:e=>{let t=Y.parse(e);return t.alpha=0,Y.transform(t)}};var Un=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;var Hn=new RegExp(ca.source),Gn=new RegExp(Un.source,"i");function _f(e){return isNaN(e)&&typeof e=="string"&&(Hn.test(e)||Gn.test(e))}var zn="number",Wn="color",$f="var",Yf="var(",Nn="${}",Qf=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function jn(e){let t=e.toString();return Hn.test(t)||Gn.test(t)}function ma(e){let t=e.toString(),a=[],o={color:[],number:[],var:[]},r=[],i=0,n=t.replace(Qf,u=>(Y.test(u)?(o.color.push(i),r.push(Wn),a.push(Y.parse(u))):u.startsWith(Yf)?(o.var.push(i),r.push($f),a.push(u)):(o.number.push(i),r.push(zn),a.push(parseFloat(u))),++i,Nn)).split(Nn);return{values:a,split:n,indexes:o,types:r}}function Jf(e){return ma(e).values}function Kn({split:e,types:t}){let a=e.length;return o=>{let r="";for(let i=0;i<a;i++)if(r+=e[i],o[i]!==void 0){let s=t[i];s===zn?r+=We(o[i]):s===Wn?r+=Y.transform(o[i]):r+=o[i]}return r}}function ec(e){return Kn(ma(e))}var tc=e=>typeof e=="number"?0:Y.test(e)?Y.getAnimatableNone(e):e,ac=(e,t)=>typeof e=="number"?t?.trim().endsWith("/")?e:0:tc(e);function oc(e){let t=ma(e);return Kn(t)(t.values.map((o,r)=>ac(o,t.split[r])))}var J={test:_f,parse:Jf,createTransformer:ec,getAnimatableNone:oc};function Zs(e,t,a){return a<0&&(a+=1),a>1&&(a-=1),a<1/6?e+(t-e)*6*a:a<1/2?t:a<2/3?e+(t-e)*(2/3-a)*6:e}function Xn({hue:e,saturation:t,lightness:a,alpha:o}){e/=360,t/=100,a/=100;let r=0,i=0,s=0;if(!t)r=i=s=a;else{let n=a<.5?a*(1+t):a+t-a*t,u=2*a-n;r=Zs(u,n,e+1/3),i=Zs(u,n,e),s=Zs(u,n,e-1/3)}return{red:Math.round(r*255),green:Math.round(i*255),blue:Math.round(s*255),alpha:o}}function ha(e,t){return a=>a>0?t:e}var D=(e,t,a)=>e+(t-e)*a;var _s=(e,t,a)=>{let o=e*e,r=a*(t*t-o)+o;return r<0?0:Math.sqrt(r)},rc=[ro,Ke,ht],sc=e=>rc.find(t=>t.test(e));function Zn(e){let t=sc(e);if(!t)return Ee(!1,`'${e}' is not an animatable color. Use the equivalent color code instead.`,"color-not-animatable"),!1;let a=t.parse(e);return t===ht&&(a=Xn(a)),a}var $s=(e,t)=>{let a=Zn(e),o=Zn(t);if(!a||!o)return ha(e,t);let r={...a};return i=>(r.red=_s(a.red,o.red,i),r.green=_s(a.green,o.green,i),r.blue=_s(a.blue,o.blue,i),r.alpha=D(a.alpha,o.alpha,i),Ke.transform(r))};var gr=new Set(["none","hidden"]);function _n(e,t){return gr.has(e)?a=>a<=0?e:t:a=>a>=1?t:e}function ic(e,t){return a=>D(e,t,a)}function Lr(e){return typeof e=="number"?ic:typeof e=="string"?fa(e)?ha:Y.test(e)?$s:uc:Array.isArray(e)?$n:typeof e=="object"?Y.test(e)?$s:nc:ha}function $n(e,t){let a=[...e],o=a.length,r=e.map((i,s)=>Lr(i)(i,t[s]));return i=>{for(let s=0;s<o;s++)a[s]=r[s](i);return a}}function nc(e,t){let a={...e,...t},o={};for(let r in a)e[r]!==void 0&&t[r]!==void 0&&(o[r]=Lr(e[r])(e[r],t[r]));return r=>{for(let i in o)a[i]=o[i](r);return a}}function lc(e,t){let a=[],o={color:0,var:0,number:0};for(let r=0;r<t.values.length;r++){let i=t.types[r],s=e.indexes[i][o[i]],n=e.values[s]??0;a[r]=n,o[i]++}return a}var uc=(e,t)=>{let a=J.createTransformer(t),o=ma(e),r=ma(t);return o.indexes.var.length===r.indexes.var.length&&o.indexes.color.length===r.indexes.color.length&&o.indexes.number.length>=r.indexes.number.length?gr.has(e)&&!r.values.length||gr.has(t)&&!o.values.length?_n(e,t):Oe($n(lc(o,r),r.values),a):(Ee(!0,`Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`,"complex-values-different"),ha(e,t))};var Yn=/^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;function dc(e,t){let a=Yn.exec(e);if(!a)return;let o=Yn.exec(t);if(!o||a[2]!==o[2])return;let r=a[2],i=parseFloat(a[1]),s=parseFloat(o[1]);return n=>We(D(i,s,n))+r}function xa(e,t,a){if(typeof e=="number"&&typeof t=="number"&&typeof a=="number")return D(e,t,a);if(typeof e=="string"&&typeof t=="string"){let r=dc(e,t);if(r)return r}return Lr(e)(e,t)}var io=["setup","read","resolveKeyframes","preUpdate","update","preRender","render","postRender"];function Qn(e){let t=new Set,a=new Set,o=!1,r=!1,i=new Set,s={delta:0,timestamp:0,isProcessing:!1};function n(l){i.has(l)&&(a.add(l),e()),l(s)}let u={schedule:(l,d=!1,f=!1)=>{let m=f&&o?t:a;return d&&i.add(l),m.add(l),l},cancel:l=>{a.delete(l),i.delete(l)},process:l=>{if(s=l,o){r=!0;return}o=!0;let d=t;t=a,a=d,t.forEach(n),t.clear(),o=!1,r&&(r=!1,u.process(l))}};return u}var fc=40;function Ir(e,t,a={delta:0,timestamp:0,isProcessing:!1}){let o=!1,r=!0,i=()=>o=!0,s=io.reduce((y,w)=>(y[w]=Qn(i),y),{}),{setup:n,read:u,resolveKeyframes:l,preUpdate:d,update:f,preRender:c,render:m,postRender:p}=s,x=()=>{let y=pe.useManualTiming,w=y?a.timestamp:performance.now();o=!1,y||(a.delta=r?1e3/60:Math.max(Math.min(w-a.timestamp,fc),1)),a.timestamp=w,a.isProcessing=!0,n.process(a),u.process(a),l.process(a),d.process(a),f.process(a),c.process(a),m.process(a),p.process(a),a.isProcessing=!1,o&&t&&(r=!1,e(x))},h=()=>{o=!0,r=!0,a.isProcessing||e(x)};return{schedule:io.reduce((y,w)=>{let v=s[w];return y[w]=(T,L=!1,S=!1)=>(o||h(),v.schedule(T,L,S)),y},{}),cancel:y=>{for(let w=0;w<io.length;w++)s[io[w]].cancel(y)},state:a,steps:s}}var{schedule:k,cancel:ue,steps:no}=Ir(typeof requestAnimationFrame<"u"?requestAnimationFrame:Q,!0,W);var Jn=e=>{let t=({timestamp:a})=>e(a);return{start:(a=!0)=>k.update(t,a),stop:()=>ue(t),now:()=>W.isProcessing?W.timestamp:N.now()}};var Cr=(e,t,a=10)=>{let o="",r=Math.max(Math.round(t/a),2);for(let i=0;i<r;i++)o+=Math.round(e(i/(r-1))*1e4)/1e4+", ";return`linear(${o.substring(0,o.length-2)})`};function ga(e,t=50,a=2e4,o){let r=0,i=e.next(r);for(o?.push(i.value);!i.done&&r<a;)r+=t,i=e.next(r),o?.push(i.value);return r>=a?1/0:r}function lo(e,t=100,a){let o=a({...e,keyframes:[0,t]}),r=Math.min(ga(o),2e4);return{type:"keyframes",ease:i=>o.next(r*i).value/t,duration:le(r)}}var de={stiffness:100,damping:10,mass:1,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05},el=e=>e<0?1/Math.max(1+e,de.minDamping):Math.max(1-e,de.minDamping);function tl(e,t){if(!(e>1))return 1;let a=Math.sqrt(e*e-1),o=e-a,r=e+a,i=2*a*Math.exp(-t)*(1+t);return al(s=>r*Math.exp(-o*s)-o*Math.exp(-r*s)-i,s=>Math.exp(-r*s)-Math.exp(-o*s),t)/t}function ei(e,t){return e*Math.sqrt(1-t*t)}var cc=12;function al(e,t,a){let o=a;for(let r=1;r<cc;r++)o=o-e(o)/t(o);return o}var Qs=.001;function pc({duration:e=de.duration,bounce:t=de.bounce}){let a,o;Ee(e<=$(de.maxDuration),"Spring duration must be 10 seconds or less","spring-duration-limit");let r=el(t);e=se(de.minDuration,de.maxDuration,le(e)),r<1?(a=l=>{let d=l*r,f=d*e,c=ei(l,r),m=Math.exp(-f);return Qs-d/c*m},o=l=>{let f=l*r*e,c=r*r*l*l*e,m=Math.exp(-f),p=ei(l*l,r);return(-a(l)+Qs>0?-1:1)*-c*m/p}):(a=l=>{let d=Math.exp(-l*e),f=l*e+1;return-Qs+d*f},o=l=>{let d=Math.exp(-l*e),f=-l*(e*e);return d*f});let i=5/e,s=al(a,o,i),n=s*tl(r,s*e),u=n*n;return{stiffness:u,damping:r*2*Math.sqrt(u),duration:$(e)}}var ti=(e,t)=>(t?e>=0:e>0)&&e<1/0;function Js(e,t){if(ti(e,t))return e}function mc(e){let t=Js(e.stiffness),a=Js(e.damping,!0),o=Js(e.mass),r={...e,stiffness:t??de.stiffness,damping:a??de.damping,mass:o??de.mass,isResolvedFromDuration:!1,isTimeDefined:(t??a??o)===void 0&&(e.duration!==void 0||e.bounce!==void 0)};if(r.isTimeDefined){if(e.visualDuration){let i=el(e.bounce||0),s=2*Math.PI/(e.visualDuration*1.2)*tl(i,2*Math.PI/1.2);r.stiffness=s*s,r.damping=2*i*Math.sqrt(r.stiffness)}else Object.assign(r,pc(r)),r.isResolvedFromDuration=!0;(!ti(r.stiffness)||!ti(r.damping,!0))&&(r.stiffness=de.stiffness,r.damping=de.damping)}return r}function qe(e=de.visualDuration,t=de.bounce){let a=typeof e!="object"?{visualDuration:e,keyframes:[0,1],bounce:t}:e,o=a.keyframes[0],r=a.keyframes[a.keyframes.length-1],i={done:!1,value:o},{stiffness:s,damping:n,mass:u,duration:l,isResolvedFromDuration:d,isTimeDefined:f}=mc({...a}),c=L=>f?0:-le(L),m=n/(2*Math.sqrt(s*u)),p=le(Math.sqrt(s/u)),x=m*p,h={target:r,delta:r-o,velocity:c(a.velocity||0)||0,restSpeed:0,restDelta:0},I=()=>{let L=Math.abs(h.delta)<5;h.restSpeed=a.restSpeed||(L?de.restSpeed.granular:de.restSpeed.default),h.restDelta=a.restDelta||(L?de.restDelta.granular:de.restDelta.default)};I();let C,y,w;if(m<1){let L=ei(p,m),S={A:0,sinC:0,cosC:0,t:-1,env:0,sin:0,cos:0};w=()=>{S.A=(h.velocity+x*h.delta)/L,S.sinC=x*S.A+h.delta*L,S.cosC=x*h.delta-S.A*L};let A=F=>{F!==S.t&&(S.t=F,S.env=Math.exp(-x*F),S.sin=Math.sin(L*F),S.cos=Math.cos(L*F))};C=F=>(A(F),h.target-S.env*(S.A*S.sin+h.delta*S.cos)),y=F=>(A(F),S.env*(S.sinC*S.sin+S.cosC*S.cos))}else if(m===1){C=S=>h.target-Math.exp(-p*S)*(h.delta+(h.velocity+p*h.delta)*S);let L={C:0};w=()=>{L.C=h.velocity+p*h.delta},y=S=>Math.exp(-p*S)*(p*L.C*S-h.velocity)}else{let L=p*Math.sqrt(m*m-1),S=x-L,A=x+L,F=f?1/0:300/L,G=(q,ee)=>Math.exp(ee>F?-q*F-x*(ee-F):-q*ee),oe={S:0,F:0};w=()=>{let q=(h.velocity+x*h.delta)/L;oe.S=(h.delta+q)/2,oe.F=(h.delta-q)/2},C=q=>h.target-oe.S*G(S,q)-oe.F*G(A,q),y=q=>S*oe.S*G(S,q)+A*oe.F*G(A,q)}w();let v=d&&l||null,T={calculatedDuration:v,retarget:(L,S)=>{h.target=L[L.length-1],h.delta=h.target-L[0],h.velocity=c(S),a.restSpeed&&a.restDelta||I(),T.calculatedDuration=v,i.done=!1,w()},velocity:L=>$(y(L)),next:L=>{let S=C(L);if(d)i.done=L>=l;else{let A=$(y(L));i.done=Math.abs(A)<=h.restSpeed&&Math.abs(h.target-S)<=h.restDelta}return i.value=i.done?h.target:S,i},toString:()=>{let L=Math.min(ga(T),2e4),S=Cr(A=>T.next(L*A).value,L,30);return L+"ms "+S},toTransition:()=>{}};return T}qe.applyToOptions=e=>{let t=lo(e,100,qe);return e.ease=t.ease,e.duration=$(t.duration),e.type="keyframes",e};function uo({keyframes:e,velocity:t=0,power:a=.8,timeConstant:o=325,bounceDamping:r=10,bounceStiffness:i=500,modifyTarget:s,min:n,max:u,restDelta:l=.5,restSpeed:d}){let f=e[0],c={done:!1,value:f},m=L=>L<n||L>u,p=L=>n===void 0?u:u===void 0||Math.abs(n-L)<Math.abs(u-L)?n:u,x=a*t,h=f+x,I=s===void 0?h:s(h);I!==h&&(x=I-f);let C=L=>-x*Math.exp(-L/o),y=L=>{let S=C(L);c.done=Math.abs(S)<=l,c.value=c.done?I:I+S},w,v,T=L=>{m(c.value)&&(w=L,v=qe({keyframes:[c.value,p(c.value)],velocity:-C(L)/o*1e3,damping:r,stiffness:i,restDelta:l,restSpeed:d}))};return T(0),{calculatedDuration:null,next:L=>{let S=!1;return!v&&w===void 0&&(S=!0,y(L),T(L)),w!==void 0&&L>=w?v.next(L-w):(!S&&y(L),c)}}}function hc(e,t,a){let o=[],r=a||pe.mix||xa,i=e.length-1;for(let s=0;s<i;s++){let n=r(e[s],e[s+1]);if(t){let u=Array.isArray(t)?t[s]||Q:t;n=Oe(u,n)}o.push(n)}return o}function yr(e,t,{clamp:a=!0,ease:o,mixer:r}={}){let i=e.length;if(ie(i===t.length,"Both input and output ranges must be the same length","range-length"),i===1)return()=>t[0];if(i===2&&t[0]===t[1])return()=>t[1];let s=e[0]===e[1];e[0]>e[i-1]&&(e=[...e].reverse(),t=[...t].reverse());let n=hc(t,o,r),u=n.length,l=d=>{if(s&&d<e[0])return t[0];let f=0;if(u>1)for(;f<e.length-2&&!(d<e[f+1]);f++);let c=Te(e[f],e[f+1],d);return n[f](c)};return a?d=>l(se(e[0],e[i-1],d)):l}function fo(e,t){let a=e[e.length-1];for(let o=1;o<=t;o++){let r=Te(0,t,o);e.push(D(a,1,r))}}function co(e){let t=[0];return fo(t,e.length-1),t}function ol(e,t){return e.map(a=>a*t)}function xc(e,t){return e.map(()=>t||da).splice(0,e.length-1)}function Ot({duration:e=300,keyframes:t,times:a,ease:o="easeInOut"}){let r=eo(o)?o.map(cr):cr(o)||da,i={done:!1,value:t[0]};if(t.length===2&&!Array.isArray(r)&&(!a||a.length!==2||a[0]===0&&a[1]===1)){let[u,l]=t,d=u===l?void 0:(pe.mix||xa)(u,l);return{calculatedDuration:e,next:f=>(i.value=d?d(r(e>0?se(0,1,f/e):1)):l,i.done=f>=e,i)}}let s=ol(a&&a.length===t.length?a:co(t),e),n=yr(s,t,{ease:Array.isArray(r)?r:xc(t,r)});return{calculatedDuration:e,next:u=>(i.value=n(u),i.done=u>=e,i)}}var gc=5;function Lc(e,t,a){let o=Math.max(t-gc,0);return Za(a-e(o),t-o)}function Sr(e,t,a=0){return t<=0?a:e.velocity?e.velocity(t):Lc(o=>e.next(o).value,t,e.next(t).value)}var Ic=e=>e!==null;function xt(e,{repeat:t,repeatType:a="loop"},o,r=1){let i=e.filter(Ic),n=r<0||t&&a!=="loop"&&t%2===1?0:i.length-1;return!n||o===void 0?i[n]:o}var Cc={decay:uo,inertia:uo,tween:Ot,keyframes:Ot,spring:qe};function wr(e){typeof e.type=="string"&&(e.type=Cc[e.type])}function rl(e,t){return{kind:e,animation:t,timestamp:N.now(),frameTimestamp:W.timestamp,frameIsProcessing:W.isProcessing}}function br(e,t,a){let o=globalThis.__MOTION_INSPECT__;if(o)try{o({...rl("animation-start",e),options:a?{...t,...a}:t})}catch{}}function sl(e,t){let a=globalThis.__MOTION_INSPECT__;if(a)try{a({...rl("layout-animation-start",e),node:t})}catch{}}var Xe=class{constructor(){this.isResolved=!1}get finished(){return this._finished||(this._finished=this.isResolved?Promise.resolve():new Promise(t=>{this._resolve=t})),this._finished}updateFinished(){this._finished=this._resolve=void 0,this.isResolved=!1}notifyFinished(){this.isResolved=!0,this._resolve?.()}then(t,a){return this.finished.then(t,a)}};var yc=e=>e/100,at=class extends Xe{constructor(t){super(),this.state="idle",this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.delayState={done:!1,value:void 0},this.stop=()=>{let{motionValue:a}=this.options;a&&a.updatedAt!==N.now()&&this.tick(N.now()),this.isStopped=!0,this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=t,this.initAnimation(),this.play(),t.autoplay===!1&&this.pause(),br(this,this.options)}initAnimation(){let{options:t}=this;wr(t);let{type:a=Ot,repeat:o=0,repeatDelay:r=0,repeatType:i,velocity:s=0}=t,{keyframes:n}=t,u=a||Ot;u!==Ot&&typeof n[0]!="number"&&(this.mixKeyframes=Oe(yc,xa(n[0],n[1])),n=[0,100]);let l=u(n===t.keyframes?t:{...t,keyframes:n});i==="mirror"&&(this.mirroredGenerator=u({...t,keyframes:[...n].reverse(),velocity:-s})),l.calculatedDuration===null&&(l.calculatedDuration=ga(l));let{calculatedDuration:d}=l;this.calculatedDuration=d,this.resolvedDuration=d+r,this.totalDuration=this.resolvedDuration*(o+1)-r,this.generator=l}updateTime(t){let a=Math.round(t-this.startTime)*this.playbackSpeed;this.holdTime!==null?this.currentTime=this.holdTime:this.currentTime=a}tick(t,a=!1){let{generator:o,totalDuration:r,mixKeyframes:i,mirroredGenerator:s,resolvedDuration:n,calculatedDuration:u}=this;if(this.startTime===null)return o.next(0);let{delay:l=0,keyframes:d,repeat:f,repeatType:c,repeatDelay:m,type:p,onUpdate:x,finalKeyframe:h}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,t):this.speed<0&&(this.startTime=Math.min(t-r/this.speed,this.startTime)),a?this.currentTime=t:this.updateTime(t);let I=this.currentTime-l*(this.playbackSpeed>=0?1:-1),C=this.playbackSpeed>=0?I<0:I>r;this.currentTime=Math.max(I,0),this.state==="finished"&&this.holdTime===null&&(this.currentTime=r);let y=this.currentTime,w=o;if(f){let S=Math.min(this.currentTime,r)/n,A=Math.floor(S),F=S%1;!F&&S>=1&&(F=1),F===1&&A--,A=Math.min(A,f+1),A%2&&(c==="reverse"?(F=1-F,m&&(F-=m/n)):c==="mirror"&&(w=s)),y=se(0,1,F)*n}let v;C?(this.delayState.value=d[0],v=this.delayState):v=w.next(y),i&&!C&&(v.value=i(v.value));let{done:T}=v;!C&&u!==null&&(T=this.playbackSpeed>=0?this.currentTime>=r:this.currentTime<=0);let L=this.holdTime===null&&(this.state==="finished"||this.state==="running"&&T);return L&&p!==uo&&(v.value=xt(d,this.options,h,this.speed)),x&&x(v.value),L&&this.finish(),v}then(t,a){return this.finished.then(t,a)}get duration(){return le(this.calculatedDuration)}get iterationDuration(){let{delay:t=0}=this.options||{};return this.duration+le(t)}get time(){return le(this.currentTime)}set time(t){t=$(t),this.currentTime=t,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=t:this.driver&&(this.startTime=this.driver.now()-t/this.playbackSpeed),this.driver?this.driver.start(!1):(this.startTime=0,this.state="paused",this.holdTime=t,this.tick(t))}getGeneratorVelocity(){return Sr(this.generator,this.currentTime,this.options.velocity)}get speed(){return this.playbackSpeed}set speed(t){let a=this.playbackSpeed!==t;a&&this.driver&&this.updateTime(N.now()),this.playbackSpeed=t,a&&this.driver&&(this.time=le(this.currentTime))}play(){if(this.isStopped)return;let{driver:t=Jn,startTime:a}=this.options;this.driver||(this.driver=t(r=>this.tick(r))),this.options.onPlay?.();let o=this.driver.now();this.state==="finished"?(this.updateFinished(),this.startTime=o):this.holdTime!==null?this.startTime=o-this.holdTime:this.startTime||(this.startTime=a??o),this.state==="finished"&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state="running",this.driver.start()}pause(){this.state="paused",this.updateTime(N.now()),this.holdTime=this.currentTime}complete(){this.state!=="running"&&this.play(),this.state="finished",this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state="finished",this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state="idle",this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&(this.driver.stop(),this.driver=void 0)}sample(t){return this.startTime=0,this.tick(t,!0)}attachTimeline(t){return this.options.allowFlatten&&(this.options.type="keyframes",this.options.ease="linear",this.initAnimation()),this.driver?.stop(),t.observe(this)}};var Sc=new Set(["brightness","contrast","saturate","opacity"]);function wc(e){let[t,a]=e.slice(0,-1).split("(");if(t==="drop-shadow")return e;let[o]=a.match(ca)||[];if(!o)return e;let r=a.replace(o,""),i=Sc.has(t)?1:0;return o!==a&&(i*=100),t+"("+i+r+")"}var bc=/\b([a-z-]*)\(.*?\)/gu,po={...J,getAnimatableNone:e=>{let t=e.match(bc);return t?t.map(wc).join(" "):e}};var mo={...J,getAnimatableNone:e=>{let t=J.parse(e);return J.createTransformer(e)(t.map(o=>typeof o=="number"?0:typeof o=="object"?{...o,alpha:1}:o))}};var ai={...je,transform:Math.round};var ho={rotate:Ae,pathRotation:Ae,rotateX:Ae,rotateY:Ae,rotateZ:Ae,scale:oo,scaleX:oo,scaleY:oo,scaleZ:oo,skew:Ae,skewX:Ae,skewY:Ae,distance:b,translateX:b,translateY:b,translateZ:b,x:b,y:b,z:b,perspective:b,transformPerspective:b,opacity:tt,originX:xr,originY:xr,originZ:b};var xe={borderWidth:b,borderTopWidth:b,borderRightWidth:b,borderBottomWidth:b,borderLeftWidth:b,borderRadius:b,borderTopLeftRadius:b,borderTopRightRadius:b,borderBottomRightRadius:b,borderBottomLeftRadius:b,width:b,maxWidth:b,height:b,maxHeight:b,top:b,right:b,bottom:b,left:b,inset:b,insetBlock:b,insetBlockStart:b,insetBlockEnd:b,insetInline:b,insetInlineStart:b,insetInlineEnd:b,padding:b,paddingTop:b,paddingRight:b,paddingBottom:b,paddingLeft:b,paddingBlock:b,paddingBlockStart:b,paddingBlockEnd:b,paddingInline:b,paddingInlineStart:b,paddingInlineEnd:b,margin:b,marginTop:b,marginRight:b,marginBottom:b,marginLeft:b,marginBlock:b,marginBlockStart:b,marginBlockEnd:b,marginInline:b,marginInlineStart:b,marginInlineEnd:b,fontSize:b,backgroundPositionX:b,backgroundPositionY:b,...ho,zIndex:ai,fillOpacity:tt,strokeOpacity:tt,numOctaves:ai};var vc={...xe,color:Y,backgroundColor:Y,outlineColor:Y,fill:Y,stroke:Y,borderColor:Y,borderTopColor:Y,borderRightColor:Y,borderBottomColor:Y,borderLeftColor:Y,filter:po,WebkitFilter:po,mask:mo,WebkitMask:mo},vr=e=>vc[e];var Pc=new Set([po,mo]);function La(e,t){let a=vr(e);return Pc.has(a)||(a=J),a.getAnimatableNone?a.getAnimatableNone(t):void 0}function il(e){for(let t=1;t<e.length;t++)e[t]??(e[t]=e[t-1])}var qt=e=>e*180/Math.PI,oi=e=>{let t=qt(Math.atan2(e[1],e[0]));return ri(t)},Tc={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:e=>(Math.abs(e[0])+Math.abs(e[3]))/2,rotate:oi,rotateZ:oi,skewX:e=>qt(Math.atan(e[1])),skewY:e=>qt(Math.atan(e[2])),skew:e=>(Math.abs(e[1])+Math.abs(e[2]))/2},ri=e=>(e=e%360,e<0&&(e+=360),e),nl=oi,ll=e=>Math.sqrt(e[0]*e[0]+e[1]*e[1]),ul=e=>Math.sqrt(e[4]*e[4]+e[5]*e[5]),Ac={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:ll,scaleY:ul,scale:e=>(ll(e)+ul(e))/2,rotateX:e=>ri(qt(Math.atan2(e[6],e[5]))),rotateY:e=>ri(qt(Math.atan2(-e[2],e[0]))),rotateZ:nl,rotate:nl,skewX:e=>qt(Math.atan(e[4])),skewY:e=>qt(Math.atan(e[1])),skew:e=>(Math.abs(e[1])+Math.abs(e[4]))/2};function Ut(e){return e.includes("scale")?1:0}function Pr(e,t){if(!e||e==="none")return Ut(t);let a=e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u),o,r;if(a)o=Ac,r=a;else{let n=e.match(/^matrix\(([-\d.e\s,]+)\)$/u);o=Tc,r=n}if(!r)return Ut(t);let i=o[t],s=r[1].split(",").map(kc);return typeof i=="function"?i(s):s[i]}var Tr=(e,t)=>{let{transform:a="none"}=getComputedStyle(e);return Pr(a,t)};function kc(e){return parseFloat(e.trim())}var ye=["transformPerspective","x","y","z","translateX","translateY","translateZ","scale","scaleX","scaleY","rotate","rotateX","rotateY","rotateZ","skew","skewX","skewY"],te=new Set([...ye,"pathRotation"]);var si=e=>e===je||e===b,Mc=new Set(["x","y","z"]),Dc=ye.filter(e=>!Mc.has(e));function fl(e){let t=[];return Dc.forEach(a=>{let o=e.getValue(a);if(o!==void 0){let r=o.get(),i=a.startsWith("scale")?1:0;if(r===i)return;t.push([a,r]),o.set(i)}}),t}var cl=new Set(["bottom","right"]);function dl(e,t,a,o,r,i){let s=parseFloat(e);if(!isNaN(s))return s;let{min:n,max:u}=t()[a],l=u-n;return i==="border-box"?l:l-parseFloat(o)-parseFloat(r)}var gt={width:({width:e,paddingLeft:t="0",paddingRight:a="0",boxSizing:o},r)=>dl(e,r,"x",t,a,o),height:({height:e,paddingTop:t="0",paddingBottom:a="0",boxSizing:o},r)=>dl(e,r,"y",t,a,o),top:({top:e})=>parseFloat(e),left:({left:e})=>parseFloat(e),bottom:({top:e},t)=>{let{y:a}=t();return parseFloat(e)+(a.max-a.min)},right:({left:e},t)=>{let{x:a}=t();return parseFloat(e)+(a.max-a.min)},x:({transform:e})=>Pr(e,"x"),y:({transform:e})=>Pr(e,"y")};gt.translateX=gt.x;gt.translateY=gt.y;var Nt=new Set,ii=!1,ni=!1,li=!1;function pl(){if(ni){let e=[],t=new Set,a=new Set;Nt.forEach(r=>{r.needsMeasurement&&(e.push(r),t.add(r.element),cl.has(r.name)&&a.add(r.element))});let o=new Map;a.forEach(r=>{let i=fl(r);i.length&&(o.set(r,i),r.render())}),e.forEach(r=>r.measureInitialState()),t.forEach(r=>{r.render();let i=o.get(r);i&&i.forEach(([s,n])=>{r.getValue(s)?.set(n)})}),e.forEach(r=>r.measureEndState()),e.forEach(r=>{r.suspendedScrollY!==void 0&&window.scrollTo(0,r.suspendedScrollY)})}ni=!1,ii=!1,Nt.forEach(e=>e.complete(li)),Nt.clear()}function ml(){Nt.forEach(e=>{e.readKeyframes(),e.needsMeasurement&&(ni=!0)})}function hl(){li=!0,ml(),pl(),li=!1}function Rc(e,t,a){if(typeof e=="string"){if(Ft(e)||Vt(e))return parseFloat(e);if(!J.test(e)&&J.test(a))return La(t,a)}return e??void 0}var Lt=class{constructor(t,a,o,r,i,s=!1){this.state="pending",this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...t],this.onComplete=a,this.name=o,this.motionValue=r,this.element=i,this.isAsync=s}scheduleResolve(){this.state="scheduled",this.isAsync?(Nt.add(this),ii||(ii=!0,k.read(ml),k.resolveKeyframes(pl))):(this.readKeyframes(),this.complete())}readKeyframes(){let{unresolvedKeyframes:t,name:a,element:o,motionValue:r}=this;if(t[0]===null){let i=r?.get(),s=t[t.length-1];if(i!==void 0)t[0]=i;else if(o&&a){let n=Rc(o.readValue(a,s),a,s);n!==void 0&&(t[0]=n)}t[0]===void 0&&(t[0]=s),r&&i===void 0&&r.set(t[0])}il(t)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(t=!1){this.state="complete",this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,t),Nt.delete(this)}cancel(){this.state==="scheduled"&&(Nt.delete(this),this.state="pending")}resume(){this.state==="pending"&&this.scheduleResolve()}};var It=e=>e.startsWith("--");function Ar(e,t,a){It(t)?e.style.setProperty(t,a):e.style[t]=a}var xl={};function kr(e,t){let a=Xa(e);return()=>xl[t]??a()}var gl=kr(()=>window.ScrollTimeline!==void 0,"scrollTimeline");var Mr=kr(()=>{try{document.createElement("div").animate({opacity:0},{easing:"linear(0, 1)"})}catch{return!1}return!0},"linearEasing");var Ht=([e,t,a,o])=>`cubic-bezier(${e}, ${t}, ${a}, ${o})`;var ui={linear:"linear",ease:"ease",easeIn:"ease-in",easeOut:"ease-out",easeInOut:"ease-in-out",circIn:Ht([0,.65,.55,1]),circOut:Ht([.55,0,1,.45]),backIn:Ht([.31,.01,.66,-.59]),backOut:Ht([.33,1.53,.69,.99])};function di(e,t){if(e)return typeof e=="function"?Mr()?Cr(e,t):"ease-out":ao(e)?Ht(e):Array.isArray(e)?e.map(a=>di(a,t)||ui.easeOut):ui[e]}function Ll(e,t,a,{delay:o=0,duration:r=300,repeat:i=0,repeatType:s="loop",ease:n="easeOut",times:u}={},l=void 0){let d={[t]:a};u&&(d.offset=u);let f=di(n,r);Array.isArray(f)&&(d.easing=f);let c={delay:o,duration:r,easing:Array.isArray(f)?"linear":f,fill:"both",iterations:i+1,direction:s==="reverse"?"alternate":"normal"};return l&&(c.pseudoElement=l),e.animate(d,c)}function Gt(e){return typeof e=="function"&&"applyToOptions"in e}function Il({type:e,...t}){return Gt(e)&&Mr()?e.applyToOptions(t):(t.duration??(t.duration=300),t.ease??(t.ease="easeOut"),t)}var Ia=class extends Xe{constructor(t){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!t)return;let{element:a,name:o,keyframes:r,pseudoElement:i,allowFlatten:s=!1,finalKeyframe:n,onComplete:u}=t;this.isPseudoElement=!!i,this.allowFlatten=s,this.options=t,ie(typeof t.type!="string",`Mini animate() doesn't support "type" as a string.`,"mini-spring");let l=Il(t);this.animation=Ll(a,o,r,l,i),l.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!i){let d=xt(r,this.options,n,this.speed);this.updateMotionValue&&this.updateMotionValue(d),Ar(a,o,d),this.animation.cancel()}u?.(),this.notifyFinished()},br(this,t,l)}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state==="finished"&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;let{state:t}=this;t==="idle"||t==="finished"||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){let t=this.options?.element;!this.isPseudoElement&&t?.isConnected&&this.animation.commitStyles?.()}get duration(){let t=this.animation.effect?.getComputedTiming?.().duration||0;return le(Number(t))}get iterationDuration(){let{delay:t=0}=this.options||{};return this.duration+le(t)}get time(){return le(Number(this.animation.currentTime)||0)}set time(t){let a=this.finishedTime!==null;this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=$(t),a&&this.animation.pause()}get speed(){return this.animation.playbackRate}set speed(t){t<0&&(this.finishedTime=null),this.animation.playbackRate=t}get state(){return this.finishedTime!==null?"finished":this.animation.playState}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(t){this.manualStartTime=this.animation.startTime=t}attachTimeline({timeline:t,onAttach:a,observe:o,...r}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:"linear"}),this.animation.onfinish=null,t&&gl()?(this.animation.timeline=t,Object.assign(this.animation,r),a?.(this.animation),Q):o(this)}};var Cl={anticipate:$a,backInOut:_a,circInOut:Ja};function Fc(e){return e in Cl}function yl(e){typeof e.ease=="string"&&Fc(e.ease)&&(e.ease=Cl[e.ease])}var fi=10,Dr=class extends Ia{constructor(t){yl(t),wr(t),super(t),t.startTime!==void 0&&t.autoplay!==!1&&(this.startTime=t.startTime),this.options=t}updateMotionValue(t){let{motionValue:a,onUpdate:o,onComplete:r,element:i,...s}=this.options;if(!a)return;if(t!==void 0){a.set(t);return}let n=new at({...s,autoplay:!1}),u=Math.max(fi,N.now()-this.startTime),l=se(0,fi,u-fi),d=n.sample(u).value,{name:f}=this.options;i&&f&&Ar(i,f,d),a.setWithVelocity(n.sample(Math.max(0,u-l)).value,d,l),n.stop()}};var ci=(e,t)=>t==="zIndex"?!1:!!(typeof e=="number"||Array.isArray(e)||typeof e=="string"&&(J.test(e)||e==="0")&&!e.startsWith("url("));function Bc(e){let t=e[0];if(e.length===1)return!0;for(let a=0;a<e.length;a++)if(e[a]!==t)return!0}function Sl(e,t,a,o){let r=e[0];if(r===null)return!1;if(t==="display"||t==="visibility")return!0;let i=e[e.length-1],s=ci(r,t),n=ci(i,t);return!s||!n?(s!==n&&Ee(!1,`You are trying to animate ${t} from "${r}" to "${i}". "${s?i:r}" is not an animatable value.`,"value-not-animatable"),!1):Bc(e)||(a==="spring"||Gt(a))&&o}function xo(e){e.duration=0,e.type="keyframes"}var go=new Set(["opacity","clipPath","filter","transform","backgroundColor"]);var Vc=/^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;function wl(e){for(let t=0;t<e.length;t++)if(typeof e[t]=="string"&&Vc.test(e[t]))return!0;return!1}var bl=new Set(["color","backgroundColor","outlineColor","fill","stroke","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"]),Ec=Xa(()=>Object.hasOwnProperty.call(Element.prototype,"animate"));function vl(e){let{motionValue:t,name:a,repeatDelay:o,repeatType:r,damping:i,type:s,keyframes:n}=e;if(!a||!(go.has(a)||bl.has(a)))return!1;let u=t?.owner?.current;if(!(u instanceof HTMLElement)&&!(u instanceof SVGElement))return!1;let{onUpdate:l,transformTemplate:d}=t.owner.getProps();return Ec()&&(go.has(a)||bl.has(a)&&wl(n))&&(a!=="transform"||!d)&&!l&&!o&&r!=="mirror"&&i!==0&&s!=="inertia"}var Oc=40,Rr=class extends Xe{constructor(t){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=N.now();let{keyframes:a,name:o,motionValue:r,element:i}=t,s=t;s.autoplay??(s.autoplay=!0),s.delay??(s.delay=0),s.type??(s.type="keyframes"),s.repeat??(s.repeat=0),s.repeatDelay??(s.repeatDelay=0),s.repeatType??(s.repeatType="loop");let n=i?.KeyframeResolver||Lt;this.keyframeResolver=new n(a,(u,l,d)=>this.onKeyframesResolved(u,l,s,!d),o,r,i),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(t,a,o,r){this.keyframeResolver=void 0;let{name:i,type:s,velocity:n,delay:u,isHandoff:l,onUpdate:d}=o;this.resolvedAt=N.now();let f=!0;Sl(t,i,s,n)||(f=!1,(pe.instantAnimations||!u)&&d?.(xt(t,o,a)),t[0]=t[t.length-1],xo(o),o.repeat=0);let c=r?this.resolvedAt?this.resolvedAt-this.createdAt>Oc?this.resolvedAt:this.createdAt:this.createdAt:void 0,{onComplete:m}=o;o.startTime??(o.startTime=c),o.finalKeyframe=a,o.keyframes=t,o.onComplete=()=>{m?.(),this.notifyFinished()};let p=f&&!l&&vl(o),x;if(p){o.element=o.motionValue?.owner?.current;try{x=new Dr(o)}catch{x=new at(o)}}else x=new at(o);this.pendingTimeline&&(this.stopTimeline=x.attachTimeline(this.pendingTimeline),this.pendingTimeline=void 0),this._animation=x}get finished(){return this._animation?this._animation.finished:super.finished}then(t,a){return this.finished.finally(t).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),hl()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(t){this.animation.time=t}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(t){this.animation.speed=t}get startTime(){return this.animation.startTime}attachTimeline(t){return this._animation?this.stopTimeline=this.animation.attachTimeline(t):this.pendingTimeline=t,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}};var Fr=class{constructor(t){this.stop=()=>this.runAll("stop"),this.animations=t.filter(Boolean)}get finished(){return Promise.all(this.animations.map(t=>t.finished))}getAll(t){return this.animations[0][t]}setAll(t,a){for(let o=0;o<this.animations.length;o++)this.animations[o][t]=a}attachTimeline(t){let a=this.animations.map(o=>o.attachTimeline(t));return()=>{a.forEach((o,r)=>{o&&o(),this.animations[r].stop()})}}get time(){return this.getAll("time")}set time(t){this.setAll("time",t)}get speed(){return this.getAll("speed")}set speed(t){this.setAll("speed",t)}get state(){return this.getAll("state")}get startTime(){return this.getAll("startTime")}get duration(){return Pl(this.animations,"duration")}get iterationDuration(){return Pl(this.animations,"iterationDuration")}runAll(t){this.animations.forEach(a=>a[t]())}play(){this.runAll("play")}pause(){this.runAll("pause")}cancel(){this.runAll("cancel")}complete(){this.runAll("complete")}};function Pl(e,t){let a=0;for(let o=0;o<e.length;o++){let r=e[o][t];r!==null&&r>a&&(a=r)}return a}var Lo=class extends Fr{then(t,a){return this.finished.finally(t).then(()=>{})}};function Br(e,t,a,o=0,r=1){let i=Array.from(e).sort((l,d)=>l.sortNodePosition(d)).indexOf(t),s=e.size,n=(s-1)*o;return typeof a=="function"?a(i,s):r===1?i*o:n-i*o}var Tl=30,qc=e=>!isNaN(parseFloat(e)),zt={current:void 0},Ze=class{constructor(t,a={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=o=>{let r=N.now();if(this.updatedAt!==r&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(o),this.current!==this.prev&&(this.notifyChange(),this.dependents))for(let i of this.dependents)i.dirty()},this.hasAnimated=!1,this.setCurrent(t),this.owner=a.owner}setCurrent(t){this.current=t,this.updatedAt=N.now(),this.canTrackVelocity===null&&t!==void 0&&(this.canTrackVelocity=qc(this.current))}setPrevFrameValue(t=this.current){this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt}onChange(t){return this.on("change",t)}on(t,a){var o;return t==="change"?this.onChangeSubscribe(a):((o=this.events)[t]||(o[t]=new ze)).add(a)}onChangeSubscribe(t){let{events:a}=this;return!a.change&&!this.changeSubscriber?this.changeSubscriber=t:(a.change||(a.change=new ze,a.change.add(this.changeSubscriber),this.changeSubscriber=void 0),a.change.add(t)),()=>{this.changeSubscriber===t?this.changeSubscriber=void 0:a.change?.remove(t),this.stopIfUnobserved()}}stopIfUnobserved(){k.read(()=>{!this.changeSubscriber&&!this.events.change?.getSize()&&this.stop()})}clearListeners(){this.changeSubscriber=void 0;for(let t in this.events)this.events[t].clear()}attach(t,a){this.passiveEffect=t,this.stopPassiveEffect=a}set(t){this.passiveEffect?this.passiveEffect(t,this.updateAndNotify):this.updateAndNotify(t)}setWithVelocity(t,a,o){this.set(a),this.prev=void 0,this.prevFrameValue=t,this.prevUpdatedAt=this.updatedAt-o}jump(t,a=!0){this.updateAndNotify(t),this.prev=t,this.prevUpdatedAt=this.prevFrameValue=void 0,a&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.notifyChange()}notifyChange(){let{current:t,changeSubscriber:a}=this;a?a(t):this.events.change?.notify(t)}addDependent(t){this.dependents||(this.dependents=new Set),this.dependents.add(t)}removeDependent(t){this.dependents&&this.dependents.delete(t)}get(){return zt.current&&zt.current.push(this),this.current}getPrevious(){return this.prev}getVelocity(){let t=N.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||t-this.updatedAt>Tl)return 0;let a=Math.min(this.updatedAt-this.prevUpdatedAt,Tl);return Za(parseFloat(this.current)-parseFloat(this.prevFrameValue),a)}start(t){return this.stop(),new Promise(a=>{this.hasAnimated=!0;let o=!1,r;r=t(()=>{o=!0,this.events.animationComplete?.notify(),this.animation===r&&this.clearAnimation(),a()}),o||(this.animation=r),this.events.animationStart?.notify()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){this.animation=void 0}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}};function fe(e,t){return new Ze(e,t)}function Vr(e,t){if(e?.inherit&&t){let{inherit:a,...o}=e;return{...t,...o}}return e}function Ca(e,t){let a=e?.[t]??e?.default??e;return a!==e?Vr(a,e):a}var Uc={type:"spring",stiffness:500,damping:25,restSpeed:10},Nc=e=>({type:"spring",stiffness:550,damping:e===0?2*Math.sqrt(550):30,restSpeed:10}),Hc={type:"keyframes",duration:.8},Gc={type:"keyframes",ease:[.25,.1,.35,1],duration:.3},Al=(e,{keyframes:t})=>t.length>2?Hc:te.has(e)?e.startsWith("scale")?Nc(t[1]):Uc:Gc;var zc=new Set(["when","delay","delayChildren","staggerChildren","staggerDirection","repeat","repeatType","repeatDelay","from","elapsed"]);function kl(e){for(let t in e)if(!zc.has(t))return!0;return!1}var ot=(e,t,a,o={},r,i)=>s=>{let n=Ca(o,e)||{},u=n.delay||o.delay||0,{elapsed:l=0}=o;l=l-$(u);let d={keyframes:Array.isArray(a)?a:[null,a],ease:"easeOut",velocity:t.getVelocity(),...n,delay:-l,onUpdate:c=>{t.set(c),n.onUpdate&&n.onUpdate(c)},onComplete:()=>{s(),n.onComplete&&n.onComplete()},name:e,motionValue:t,element:i?void 0:r};kl(n)||Object.assign(d,Al(e,d)),d.duration&&(d.duration=$(d.duration)),d.repeatDelay&&(d.repeatDelay=$(d.repeatDelay)),d.from!==void 0&&(d.keyframes[0]=d.from);let f=!1;if((d.type===!1||d.duration===0&&!d.repeatDelay)&&(xo(d),d.delay===0&&(f=!0)),(pe.instantAnimations||pe.skipAnimations||r?.shouldSkipAnimations||n.skipAnimations)&&(f=!0,xo(d),d.delay=0),d.allowFlatten=!n.type&&!n.ease,f&&!i&&t.get()!==void 0){let c=xt(d.keyframes,n);if(c!==void 0){k.update(()=>{d.onUpdate(c),d.onComplete()});return}}return n.isSync?new at(d):new Rr(d)};var Wc=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function jc(e){let t=Wc.exec(e);if(!t)return[,];let[,a,o,r]=t;return[`--${a??o}`,r]}var Kc=4;function pi(e,t,a=1){ie(a<=Kc,`Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`,"max-css-var-depth");let[o,r]=jc(e);if(!o)return;let i=window.getComputedStyle(t).getPropertyValue(o);if(i){let s=i.trim();return Ft(s)?parseFloat(s):s}return fa(r)?pi(r,t,a+1):r}function Xc(e){let t=[{},{}];return e?.values.forEach((a,o)=>{t[0][o]=a.get(),t[1][o]=a.getVelocity()}),t}function Io(e,t,a,o){let r=i=>typeof i=="function"?i(a!==void 0?a:e.custom,...Xc(o)):i;return t=r(t),typeof t=="string"&&(t=e.variants&&e.variants[t]),r(t)}function Se(e,t,a){return Io(e.getProps(),t,a,e)}var Er=(e,t)=>t==="exit"?e.presenceContext?.custom:void 0;var ya=new Set(["width","height","top","left","right","bottom",...ye]);var Ml=e=>Array.isArray(e);function Zc(e,t,a){e.hasValue(t)?e.getValue(t).set(a):e.addValue(t,fe(a))}function _c(e){return Ml(e)?e[e.length-1]||0:e}function Dl(e,t){let a=Se(e,t),{transitionEnd:o={},transition:r={},...i}=a||{};i={...i,...o};for(let s in i){let n=_c(i[s]);Zc(e,s,n)}}var V=e=>!!(e&&e.getVelocity);function Rl(e){return!!(V(e)&&e.add)}function Sa(e,t){let a=e.getValue("willChange");if(Rl(a))return a.add(t);if(!a&&pe.WillChange){let o=new pe.WillChange("auto");e.addValue("willChange",o),o.add(t)}}function Ue(e){return e.replace(/([A-Z])/g,t=>`-${t.toLowerCase()}`)}var Fl="framerAppearId",Co="data-"+Ue(Fl);function Or(e){return e.props[Co]}var $c=typeof window<"u";function Yc({protectedKeys:e,needsAnimating:t},a){let o=a in e&&!t[a];return t[a]=!1,o}function qr(e,t,{delay:a=0,transitionOverride:o,type:r}={}){let{transition:i,transitionEnd:s,...n}=t,u=e.getDefaultTransition();i=i?Vr(i,u):u;let l=i?.reduceMotion,d=i?.skipAnimations;o&&(i=o);let f=[],c=r&&e.animationState?.getState()[r],m=i?.path;m&&m.animateVisualElement(e,n,i,a,f);for(let p in n){let x=e.getValue(p,e.latestValues[p]??null),h=n[p];if(h===void 0||c&&Yc(c,p))continue;let I={delay:a,...Ca(i||{},p)};d&&(I.skipAnimations=!0);let C=x.get();if(C!==void 0&&!x.isAnimating()&&!Array.isArray(h)&&h===C&&!I.velocity){k.update(()=>x.set(h));continue}let y=!1;if($c&&window.MotionHandoffAnimation){let T=Or(e);if(T){let L=window.MotionHandoffAnimation(T,p,k);L!==null&&(I.startTime=L,y=!0)}}Sa(e,p);let w=l??e.shouldReduceMotion;x.start(ot(p,x,h,w&&ya.has(p)?{type:!1}:I,e,y));let v=x.animation;v&&f.push(v)}if(s){let p=()=>k.update(()=>{s&&Dl(e,s)});f.length?Promise.all(f).then(p):p()}return f}function Ur(e,t,a={}){let o=Se(e,t,Er(e,a.type)),r=a.transitionOverride||(o?.transition??(e.getDefaultTransition()||{})),i=()=>Promise.all(o?qr(e,o,a):[]),s=(u=0)=>{let{variantChildren:l}=e,{delayChildren:d=0,staggerChildren:f,staggerDirection:c}=r,m=[];return l?.forEach(p=>{p.notify("AnimationStart",t),m.push(Ur(p,t,{...a,delay:u+(typeof d=="function"?0:d)+Br(l,p,d,f,c)}).then(()=>p.notify("AnimationComplete",t)))}),Promise.all(m)},{when:n}=r;return n?n==="beforeChildren"?i().then(()=>s()):s().then(i):Promise.all([i(),s(a.delay)])}function Bl(e,t,a={}){return e.notify("AnimationStart",t),(Array.isArray(t)?Promise.all(t.map(r=>Ur(e,r,a))):typeof t=="string"?Ur(e,t,a):Promise.all(qr(e,Se(e,t,a.custom),a))).then(()=>{e.notify("AnimationComplete",t)})}var Vl={test:e=>e==="auto",parse:e=>e};var El=e=>t=>t.test(e);var Qc=[je,b,he,Ae,Xs,Ks,Vl],mi=e=>Qc.find(El(e));function Ol(e){return typeof e=="number"?e===0:e!==null?e==="none"||e==="0"||Vt(e):!0}var Jc=new Set(["auto","none","0"]);function ql(e,t,a){let o=0,r;for(;o<e.length&&!r;){let i=e[o];typeof i=="string"&&!Jc.has(i)&&jn(i)&&(r=e[o]),o++}if(r&&a)for(let i of t)e[i]!==r&&(e[i]=La(a,r))}var wa=class extends Lt{constructor(t,a,o,r,i){super(t,a,o,r,i,!0)}readKeyframes(){let{unresolvedKeyframes:t,element:a,name:o}=this;if(!a||!a.current)return;super.readKeyframes();for(let d=0;d<t.length;d++){let f=t[d];if(typeof f=="string"&&(f=f.trim(),fa(f))){let c=pi(f,a.current);c!==void 0&&(t[d]=c),d===t.length-1&&(this.finalKeyframe=f)}}if(this.resolveNoneKeyframes(),!ya.has(o)||t.length!==2)return;let[r,i]=t;if(typeof r=="number"&&typeof i=="number")return;let s=mi(r),n=mi(i),u=Ws(r),l=Ws(i);if(u!==l&&gt[o]){this.needsMeasurement=!0;return}if(s!==n)if(si(s)&&si(n))for(let d=0;d<t.length;d++){let f=t[d];typeof f=="string"&&(t[d]=parseFloat(f))}else gt[o]&&(this.needsMeasurement=!0)}resolveNoneKeyframes(){let{unresolvedKeyframes:t,name:a}=this,o=[];for(let r=0;r<t.length;r++)(t[r]===null||Ol(t[r]))&&o.push(r);o.length&&ql(t,o,a)}measure(){let{element:t,name:a}=this;return gt[a](window.getComputedStyle(t.current),()=>t.measureViewportBox())}measureInitialState(){let{element:t,unresolvedKeyframes:a,name:o}=this;if(!t||!t.current)return;o==="height"&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=this.measure(),a[0]=this.measuredOrigin;let r=a[a.length-1];r!==void 0&&this.motionValue?.jump(r,!1)}measureEndState(){let{element:t,unresolvedKeyframes:a}=this;if(!t||!t.current)return;this.motionValue?.jump(this.measuredOrigin,!1);let o=a.length-1,r=a[o];a[o]=this.measure(),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([i,s])=>{t.getValue(i).set(s)}),this.resolveNoneKeyframes()}};var yo=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"];var hi=[];function xi(e){ie(typeof e.test=="function"&&typeof e.read=="function","Effects passed to animate.addEffect() need test() and read().","effect-missing-test"),Nr(e),hi.unshift(e)}function Nr(e){Le(hi,e)}function gi(e){return hi.find(t=>t.test(e))}function Hr(e,t,a={},o){let r=[],{velocity:i}=a,s=a.reduceMotion??o?.shouldReduceMotion;for(let u in t){if(u==="transition"||u==="transitionEnd")continue;let l=t[u];if(l===void 0)continue;let d=e(u),f=d.get();if(f!==void 0&&!d.isAnimating()&&!Array.isArray(l)&&l===f&&!i){k.update(()=>d.set(l));continue}d.start(ot(u,d,l,s&&ya.has(u)?{type:!1}:a,o)),d.animation&&r.push(d.animation)}let{transitionEnd:n}=t;if(n){let u=()=>k.update(()=>{for(let l in n)e(l).set(n[l])});r.length?Promise.all(r).then(u):u()}return r}function So(e,t,a,o,r){return Hr(i=>{let s=e.get(t,i);if(!s){let n;if(!r){let u=a[i];n=ep(u)??e.read(t,i,u),ie(n!==void 0,`"${i}" can't be read from the animated subject. Provide [from, to] keyframes.`,"effect-unreadable-value")}s=fe(n,{owner:r}),e(t,{[i]:s})}return s},a,o,r)}function ep(e){let t=Array.isArray(e)?e[0]:void 0;return t===null?void 0:t}function _e(e){return Bt(e)&&"offsetHeight"in e&&!("ownerSVGElement"in e)}function ke(e){return Bt(e)&&"ownerSVGElement"in e}var Ie=(e,t)=>t&&typeof e=="number"?t.transform(e):e;function Wt(e,t,a){if(e==null)return[];if(e instanceof EventTarget)return[e];if(typeof e=="string"){let o=document;t&&(o=t.current);let r=a?.[e]??o.querySelectorAll(e);return r?Array.from(r):[]}return Array.from(e).filter(o=>o!=null)}var Gr=class{constructor(t=k.render){this.step=t,this.values=new Map,this.pending=[],this.numPending=0,this.flush=()=>{let{pending:a,numPending:o}=this;this.numPending=0;for(let r=0;r<o;r++)a[r]()}}set(t,a,o,r){if(this.values.get(t)?.onRemove(),r)for(let u of this.values.values())u.value===r&&(o=u.render);let i=()=>o&&this.schedule(o);a.get()!==void 0&&i();let s=a.on("change",i),n=()=>{s(),o&&!r&&this.cancel(o),this.values.get(t)?.onRemove===n&&this.values.delete(t)};return this.values.set(t,{value:a,render:r?void 0:o,onRemove:n}),n}get(t){return this.values.get(t)?.value}release(){let t=new Map;return this.values.forEach((a,o)=>{t.set(o,a.value),a.onRemove()}),this.transformKeys=this.transformValues=void 0,t}schedule(t){let{pending:a,numPending:o}=this;for(let r=0;r<o;r++)if(a[r]===t)return;o||this.step(this.flush),a[this.numPending++]=t}cancel(t){let{pending:a}=this;for(let o=0;o<this.numPending;o++)if(a[o]===t){a[o]=a[--this.numPending];return}}};function ba(e,{step:t,...a}={}){let o=new WeakMap;return Object.assign((i,s)=>{let n=o.get(i)??new Gr(t);o.set(i,n);let u=[];for(let l in s){let d=s[l],f=e(i,n,l,d);u.push(f)}return()=>{for(let l of u)l()}},a,{get:(i,s)=>o.get(i)?.get(s),flush:i=>o.get(i)?.flush(),state:i=>o.get(i)})}var tp={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},Ul={};function Nl(e){let t="",{transformKeys:a=[],transformValues:o={}}=e;for(let i=0;i<a.length;i++){let s=a[i],n=o[s].get();if(n===void 0)continue;(typeof n=="number"?n:parseFloat(n))!==(s.startsWith("scale")?1:0)&&(t+=(t&&" ")+(Ul[s]||(Ul[s]=(tp[s]||s)+"("))+Ie(n,ho[s])+")")}let r=e.get("pathRotation")?.get();return r&&(t+=(t&&" ")+"rotate("+Ie(r,ho.pathRotation)+")"),t||"none"}var Ii=new Set(["originX","originY","originZ"]),Li=(e,t)=>Ie(e.get(t)?.get(),xe[t]),zr=(e,t,a,o)=>{let r,i;if(te.has(a)){if(a!=="pathRotation"){let s=t.transformKeys??(t.transformKeys=[]);(t.transformValues??(t.transformValues={}))[a]=o,s.includes(a)||(s.push(a),s.sort((n,u)=>ye.indexOf(n)-ye.indexOf(u)))}t.get("transform")||(!_e(e)&&!t.get("transformBox")&&zr(e,t,"transformBox",new Ze("fill-box")),t.set("transform",new Ze("none"),()=>{e.style.transform=Nl(t)})),i=t.get("transform")}else Ii.has(a)?(t.get("transformOrigin")||t.set("transformOrigin",new Ze(""),()=>{let s=Li(t,"originX")??"50%",n=Li(t,"originY")??"50%",u=Li(t,"originZ")??0;e.style.transformOrigin=`${s} ${n} ${u}`}),i=t.get("transformOrigin")):It(a)?r=()=>{e.style.setProperty(a,o.get())}:r=()=>{e.style[a]=Ie(o.get(),xe[a])};return t.set(a,o,r,i)},ap=e=>_e(e)||ke(e),Ci=(e,t)=>{if(te.has(t))return Tr(e,t);let a=getComputedStyle(e),o=It(t)?a.getPropertyValue(t):a[t];return typeof o=="string"&&o.trim()||0},Hl=ba(zr,{test:ap,read:Ci});var op={x:"translateX",y:"translateY",z:"translateZ",transformPerspective:"perspective"},rp=ye.length;function Gl(e,t,a){let o="",r=!0;for(let s=0;s<rp;s++){let n=ye[s],u=e[n];if(u===void 0)continue;let l=!0;if(typeof u=="number")l=u===(n.startsWith("scale")?1:0);else{let d=parseFloat(u);l=n.startsWith("scale")?d===1:d===0}if(!l||a){let d=Ie(u,xe[n]);if(!l){r=!1;let f=op[n]||n;o+=`${f}(${d}) `}a&&(t[n]=d)}}let i=e.pathRotation;return i&&(r=!1,o+=`rotate(${Ie(i,xe.pathRotation)}) `),o=o.trim(),a?o=a(t,r?"":o):r&&(o="none"),o}function jt(e,t,a){let{style:o,vars:r,transformOrigin:i}=e,s=!1,n=!1;for(let u in t){let l=t[u];if(te.has(u)){s=!0;continue}else if(mr(u)){r[u]=l;continue}else{let d=Ie(l,xe[u]);u.startsWith("origin")?(n=!0,i[u]=d):o[u]=d}}if(t.transform||(s||a?o.transform=Gl(t,e.transform,a):o.transform&&(o.transform="none")),n){let{originX:u="50%",originY:l="50%",originZ:d=0}=i;o.transformOrigin=`${u} ${l} ${d}`}}var sp={offset:"stroke-dashoffset",array:"stroke-dasharray"},ip={offset:"strokeDashoffset",array:"strokeDasharray"};function zl(e,t,a=1,o=0,r=!0){e.pathLength=1;let i=r?sp:ip;e[i.offset]=`${-o}`,e[i.array]=`${t} ${a}`}var wo=["transform","opacity","offsetDistance","offsetPath","offsetRotate","offsetAnchor"];function bo(e,{attrX:t,attrY:a,attrScale:o,pathLength:r,pathSpacing:i=1,pathOffset:s=0,...n},u,l,d){if(jt(e,n,l),u){e.style.viewBox&&(e.attrs.viewBox=e.style.viewBox);return}e.attrs=e.style,e.style={};let{attrs:f,style:c}=e;for(let m of wo)f[m]!==void 0&&(c[m]=f[m],delete f[m]);(c.transform||f.transformOrigin)&&(c.transformOrigin=f.transformOrigin??"50% 50%",delete f.transformOrigin),c.transform&&(c.transformBox=d?.transformBox??"fill-box",delete f.transformBox),t!==void 0&&(f.x=t),a!==void 0&&(f.y=a),o!==void 0&&(f.scale=o),r!==void 0&&zl(f,r,i,s,!1)}function np(e,t){if(!(t in e))return!1;let a=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),t)||Object.getOwnPropertyDescriptor(e,t);return a&&typeof a.set=="function"}var yi=(e,t,a,o,r=a)=>{let i=np(e,r);!i&&(r.startsWith("data")||r.startsWith("aria"))&&(r=Ue(r));let s=xe[a]||xe[r],n=i?()=>{e[r]=Ie(o.get(),xe[a])}:()=>{let u=Ie(o.get(),s);u==null?e.removeAttribute(r):e.setAttribute(r,String(u))};return t.set(a,o,n)};function lp(e,t,a,o){return k.render(()=>e.setAttribute("pathLength","1")),a==="pathOffset"?t.set(a,o,()=>{let r=o.get();e.setAttribute("stroke-dashoffset",`${-r}`)}):(t.get("stroke-dasharray")||t.set("stroke-dasharray",new Ze("1 1"),()=>{let r=t.get("pathLength")?.get()??1,i=t.get("pathSpacing")?.get();e.setAttribute("stroke-dasharray",`${r} ${i??1-Number(r)}`)}),t.set(a,o,void 0,t.get("stroke-dasharray")))}var up=(e,t,a,o)=>a.startsWith("path")?lp(e,t,a,o):a.startsWith("attr")?yi(e,t,a,o,jl(a)):(te.has(a)||Ii.has(a)||It(a)||a in e.style?zr:yi)(e,t,a,o),dp=(e,t)=>te.has(t)?xe[t]?.default||0:It(t)||wo.includes(t)?Ci(e,t)||e.getAttribute(Ue(t))||0:(t=jl(t),e.getAttribute(Ue(t))??e.getAttribute(t)??void 0),Wl=ba(up,{test:ke,read:dp});function jl(e){return e.replace(/^attr([A-Z])/,(t,a)=>a.toLowerCase())}function vo({top:e,left:t,right:a,bottom:o}){return{x:{min:t,max:a},y:{min:e,max:o}}}function Si({x:e,y:t}){return{top:t.min,right:e.max,bottom:t.max,left:e.min}}function wi(e,t){if(!t)return e;let a=t({x:e.left,y:e.top}),o=t({x:e.right,y:e.bottom});return{top:a.y,left:a.x,bottom:o.y,right:o.x}}function bi(e){return e===void 0||e===1}function Wr({scale:e,scaleX:t,scaleY:a}){return!bi(e)||!bi(t)||!bi(a)}function rt(e){return Wr(e)||vi(e)||e.z||e.rotate||e.rotateX||e.rotateY||e.skewX||e.skewY}function vi(e){return Kl(e.x)||Kl(e.y)}function Kl(e){return e&&e!=="0%"}function Po(e,t,a){let o=e-a,r=t*o;return a+r}function Xl(e,t,a,o,r){return r!==void 0&&(e=Po(e,r,o)),Po(e,a,o)+t}function Pi(e,t=0,a=1,o,r){e.min=Xl(e.min,t,a,o,r),e.max=Xl(e.max,t,a,o,r)}function Ti(e,{x:t,y:a}){Pi(e.x,t.translate,t.scale,t.originPoint),Pi(e.y,a.translate,a.scale,a.originPoint)}var Zl=.999999999999,_l=1.0000000000001;function Ql(e,t,a,o=!1){let r=a.length;if(!r)return;t.x=t.y=1;let i,s;for(let n=0;n<r;n++){i=a[n],s=i.projectionDelta;let{visualElement:u}=i.options;u&&u.props.style&&u.props.style.display==="contents"||(o&&i.options.layoutScroll&&i.scroll&&i!==i.root&&(Me(e.x,-i.scroll.offset.x),Me(e.y,-i.scroll.offset.y)),s&&(t.x*=s.x.scale,t.y*=s.y.scale,Ti(e,s)),o&&rt(i.latestValues)&&To(e,i.latestValues,i.layout?.layoutBox))}t.x<_l&&t.x>Zl&&(t.x=1),t.y<_l&&t.y>Zl&&(t.y=1)}function Me(e,t){e.min+=t,e.max+=t}function $l(e,t,a,o,r=.5){let i=D(e.min,e.max,r);Pi(e,t,a,i,o)}function Yl(e,t){return typeof e=="string"?parseFloat(e)/100*(t.max-t.min):e}function To(e,t,a){let o=a??e;$l(e.x,Yl(t.x,o.x),t.scaleX,t.scale,t.originX),$l(e.y,Yl(t.y,o.y),t.scaleY,t.scale,t.originY)}function va(e,t){return vo(wi(e.getBoundingClientRect(),t))}function Ai(e,t,a){let o=va(e,a),{scroll:r}=t;return r&&(Me(o.x,r.offset.x),Me(o.y,r.offset.y)),o}var fp={},cp=e=>ke(e)?Wl:Hl,ki=class{constructor(t,a){this.effect=t,this.current=a,this.KeyframeResolver=wa}getValue(t){return this.effect.get(this.current,t)}readValue(t,a){return this.effect.read(this.current,t,a)}render(){this.effect.flush(this.current)}measureViewportBox(){return va(this.current)}getProps(){return fp}};function Mi(e,t,a,o){if(o)return Hr(i=>o.getValue(i,null),t,a,o);let r=cp(e);return So(r,e,t,a,new ki(r,e))}var Di=ba((e,t,a,o)=>t.set(a,o,()=>{e[a]=o.get()}),{test:e=>Bt(e),read:(e,t)=>{let a=e[t];return typeof a=="string"||typeof a=="number"?a:void 0}});var{schedule:Kt,cancel:pp}=Ir(queueMicrotask,!1);var De={x:!1,y:!1};function jr(){return De.x||De.y}function Ri(e){return e==="x"||e==="y"?De[e]?null:(De[e]=!0,()=>{De[e]=!1}):De.x||De.y?null:(De.x=De.y=!0,()=>{De.x=De.y=!1})}function Kr(e,t){let a=Wt(e),o=new AbortController,r={passive:!0,...t,signal:o.signal};return[a,r,()=>o.abort()]}function mp(e){return!(e.pointerType==="touch"||jr())}function Fi(e,t,a={}){let[o,r,i]=Kr(e,a);return o.forEach(s=>{let n=!1,u=!1,l,d=()=>{s.removeEventListener("pointerleave",p)},f=h=>{l&&(l(h),l=void 0),d()},c=h=>{n=!1,window.removeEventListener("pointerup",c),window.removeEventListener("pointercancel",c),u&&(u=!1,f(h))},m=()=>{n=!0,window.addEventListener("pointerup",c,r),window.addEventListener("pointercancel",c,r)},p=h=>{if(h.pointerType!=="touch"){if(n){u=!0;return}f(h)}},x=h=>{if(!mp(h))return;u=!1;let I=t(s,h);typeof I=="function"&&(l=I,s.addEventListener("pointerleave",p,r))};s.addEventListener("pointerenter",x,r),s.addEventListener("pointerdown",m,r)}),i}var Bi=(e,t)=>t?e===t?!0:Bi(e,t.parentElement):!1;var Xt=e=>e.pointerType==="mouse"?typeof e.button!="number"||e.button<=0:e.isPrimary!==!1;var hp=new Set(["BUTTON","INPUT","SELECT","TEXTAREA","A"]);function Vi(e){return hp.has(e.tagName)||e.isContentEditable===!0}var xp=new Set(["INPUT","SELECT","TEXTAREA"]);function Ei(e){return xp.has(e.tagName)||e.isContentEditable===!0}var Pa=new WeakSet;function Jl(e){return t=>{t.key==="Enter"&&e(t)}}function Oi(e,t){e.dispatchEvent(new PointerEvent("pointer"+t,{isPrimary:!0,bubbles:!0}))}var eu=(e,t)=>{let a=e.currentTarget;if(!a)return;let o=Jl(()=>{if(Pa.has(a))return;Oi(a,"down");let r=Jl(()=>{Oi(a,"up")}),i=()=>Oi(a,"cancel");a.addEventListener("keyup",r,t),a.addEventListener("blur",i,t)});a.addEventListener("keydown",o,t),a.addEventListener("blur",()=>a.removeEventListener("keydown",o),t)};function tu(e){return Xt(e)&&!jr()}var au=new WeakSet;function qi(e,t,a={}){let[o,r,i]=Kr(e,a),s=n=>{let u=n.currentTarget;if(!tu(n)||au.has(n))return;Pa.add(u),a.stopPropagation&&au.add(n);let l=t(u,n),d={...r,capture:!0},f=(p,x)=>{window.removeEventListener("pointerup",c,d),window.removeEventListener("pointercancel",m,d),Pa.has(u)&&Pa.delete(u),tu(p)&&typeof l=="function"&&l(p,{success:x})},c=p=>{f(p,u===window||u===document||a.useGlobalTarget||Bi(u,p.target))},m=p=>{f(p,!1)};window.addEventListener("pointerup",c,d),window.addEventListener("pointercancel",m,d)};return o.forEach(n=>{(a.useGlobalTarget?window:n).addEventListener("pointerdown",s,r),_e(n)&&(n.addEventListener("focus",l=>eu(l,r)),!Vi(n)&&!n.hasAttribute("tabindex")&&(n.tabIndex=0))}),i}var Xr=new WeakMap,Zr,ou=(e,t,a)=>(o,r)=>r&&r[0]?r[0][e+"Size"]:ke(o)&&"getBBox"in o?o.getBBox()[t]:o[a],gp=ou("inline","width","offsetWidth"),Lp=ou("block","height","offsetHeight");function Ip({target:e,borderBoxSize:t}){Xr.get(e)?.forEach(a=>{a(e,{get width(){return gp(e,t)},get height(){return Lp(e,t)}})})}function Cp(e){e.forEach(Ip)}function yp(){typeof ResizeObserver>"u"||(Zr=new ResizeObserver(Cp))}function ru(e,t){Zr||yp();let a=Wt(e);return a.forEach(o=>{let r=Xr.get(o);r||(r=new Set,Xr.set(o,r)),r.add(t),Zr?.observe(o)}),()=>{a.forEach(o=>{let r=Xr.get(o);r?.delete(t),r?.size||Zr?.unobserve(o)})}}var _r=new Set,Ta;function Sp(){Ta=()=>{let e={get width(){return window.innerWidth},get height(){return window.innerHeight}};_r.forEach(t=>t(e))},window.addEventListener("resize",Ta)}function su(e){return _r.add(e),Ta||Sp(),()=>{_r.delete(e),!_r.size&&typeof Ta=="function"&&(window.removeEventListener("resize",Ta),Ta=void 0)}}function $r(e,t){return typeof e=="function"?su(e):ru(e,t)}var Zt={value:null,addProjectionMetrics:null};function iu(e){return ke(e)&&e.tagName==="svg"}function Ui(...e){let t=!Array.isArray(e[0]),a=t?0:-1,o=e[0+a],r=e[1+a],i=e[2+a],s=e[3+a],n=yr(r,i,s);return t?n(o):n}var Ao=new Set,nu=({timestamp:e})=>{Ao.forEach(t=>t.tick(e))},Yr=class extends Xe{constructor(t){super(),this.state="idle",this.startTime=0,this.currentTime=0,this.started=!1,this.hasNextTarget=!1,this.nextTarget=0,this.stop=()=>{this.state!=="idle"&&(this.teardown(),this.options.onStop?.())},this.options=t,this.factory=t.type,this.generator=this.factory(t);let{driver:a}=t;a&&(this.driver=a(o=>this.tick(o))),this.startTime=this.now(),this.state="running",this.driver?this.driver.start():(Ao.size||k.update(nu,!0),Ao.add(this))}setTarget(t,a){this.nextTarget=t,this.nextVelocity=a,this.hasNextTarget=!0}retarget(t,a){let{options:o,generator:r}=this;o.keyframes=t,o.velocity=a,this.startTime=this.now(),this.currentTime=0,r.retarget?r.retarget(t,a):this.generator=this.factory(o)}tick(t){let{options:a,hasNextTarget:o}=this,{delay:r=0,onUpdate:i,onPlay:s}=a,n=Math.round(t-this.startTime)-r,u=this.currentTime=Math.max(0,n),l=this.generator.next(u),d=n<0?a.keyframes[0]:l.value;if(o){this.hasNextTarget=!1;let{keyframes:f}=a;f[0]=d,f[1]=this.nextTarget,this.retarget(f,this.nextVelocity??this.getGeneratorVelocity())}(o||!this.started)&&(this.started=!0,s?.()),this.state==="running"&&(i?.(d),l.done&&n>=0&&!o&&!this.hasNextTarget&&this.state==="running"&&(this.notifyFinished(),this.teardown(),this.state="finished",a.onComplete?.()))}getGeneratorVelocity(){return Sr(this.generator,this.currentTime,this.options.velocity)}now(){return this.driver?this.driver.now():N.now()}teardown(){this.state="idle",this.driver?this.driver.stop():(Ao.delete(this),Ao.size||ue(nu))}};var Aa=e=>typeof e=="number"?e:parseFloat(e);function uu(e,t,a){let o=e.get(),r=null,i,s=typeof o=="string"?o.replace(/[\d.-]/g,""):void 0,n=d=>i(s?d+s:d),u=()=>e.events.animationStart?.notify(),l=()=>{r&&(r.stop(),r=null),e.animation=void 0};if(e.attach((d,f)=>{i=f;let c=Aa(d);if(r?.state==="running"){r.setTarget(c,a.velocity);return}let m=Aa(e.get()),p=r?r.getGeneratorVelocity():e.getVelocity();if(l(),m===c)return;let x={keyframes:[m,c],velocity:p,restDelta:.001,restSpeed:.01,...a,onUpdate:n},h=r=new Yr({...x,onPlay:u});e.animation=h,h.then(()=>{r===h&&(r=null,e.animation=void 0,e.events.animationComplete?.notify())})},l),V(t)){let d=a.skipInitialAnimation===!0,f=t.on("change",m=>{d?(d=!1,e.jump(lu(m,s),!1)):e.set(lu(m,s))}),c=e.on("destroy",f);return()=>{f(),c()}}return l}function lu(e,t){return t?e+t:e}function Ni(e,t,a){return uu(e,t,{...a,type:qe})}var Hi=()=>({translate:0,scale:1,origin:0,originPoint:0}),Ct=()=>({x:Hi(),y:Hi()}),Gi=()=>({min:0,max:0}),X=()=>({x:Gi(),y:Gi()});var ko=new WeakMap;function st(e){return e!==null&&typeof e=="object"&&typeof e.start=="function"}function it(e){return typeof e=="string"||Array.isArray(e)}var Qr=["animate","whileInView","whileFocus","whileHover","whileTap","whileDrag","exit"],zi=["initial",...Qr];function yt(e){if(st(e.animate))return!0;for(let t=0;t<zi.length;t++)if(it(e[zi[t]]))return!0;return!1}function Mo(e){return!!(yt(e)||e.variants)}function du(e,t,a){for(let o in t){let r=t[o],i=a[o];if(V(r))e.addValue(o,r);else if(V(i))e.addValue(o,fe(r,{owner:e}));else if(i!==r)if(e.hasValue(o)){let s=e.getValue(o);s.liveStyle===!0?s.jump(r):s.hasAnimated||s.set(r)}else{let s=e.getStaticValue(o);e.addValue(o,fe(s!==void 0?s:r,{owner:e}))}}for(let o in a)t[o]===void 0&&e.removeValue(o);return t}var St={current:null},_t={current:!1};var wp=typeof window<"u";function Do(){if(_t.current=!0,!!wp)if(window.matchMedia){let e=window.matchMedia("(prefers-reduced-motion)"),t=()=>St.current=e.matches;e.addEventListener("change",t),t()}else St.current=!1}var fu=["AnimationStart","AnimationComplete","Update","BeforeLayoutMeasure","LayoutMeasure","LayoutAnimationStart","LayoutAnimationComplete"],Jr={};function Fo(e){Jr=e}function Wi(){return Jr}var Ro=class{scrapeMotionValuesFromProps(t,a,o){return{}}constructor({parent:t,props:a,presenceContext:o,reducedMotionConfig:r,skipAnimations:i,blockInitialAnimation:s,visualState:n},u={}){this.current=null,this.children=new Set,this.isVariantNode=!1,this.isControllingVariants=!1,this.shouldReduceMotion=null,this.shouldSkipAnimations=!1,this.values=new Map,this.KeyframeResolver=Lt,this.features={},this.valueSubscriptions=new Map,this.prevMotionValues={},this.hasBeenMounted=!1,this.events={},this.propEventSubscriptions={},this.notifyUpdate=()=>this.notify("Update",this.latestValues),this.render=()=>{this.current&&(this.triggerBuild(),this.renderInstance(this.current,this.renderState,this.props.style,this.projection))},this.renderScheduledAt=0,this.scheduleRender=()=>{let m=N.now();this.renderScheduledAt<m&&(this.renderScheduledAt=m,k.render(this.render,!1,!0))};let{latestValues:l,renderState:d}=n;this.latestValues=l,this.baseTarget={...l},this.initialValues=a.initial?{...l}:{},this.renderState=d,this.parent=t,this.props=a,this.presenceContext=o,this.depth=t?t.depth+1:0,this.reducedMotionConfig=r,this.skipAnimationsConfig=i,this.options=u,this.blockInitialAnimation=!!s,this.isControllingVariants=yt(a),this.isVariantNode=Mo(a),this.isVariantNode&&(this.variantChildren=new Set),this.manuallyAnimateOnMount=!!(t&&t.current);let{willChange:f,...c}=this.scrapeMotionValuesFromProps(a,{},this);for(let m in c){let p=c[m];l[m]!==void 0&&V(p)&&p.set(l[m])}}mount(t){if(this.hasBeenMounted)for(let a in this.initialValues)this.values.get(a)?.jump(this.initialValues[a]),this.latestValues[a]=this.initialValues[a];if(this.current=t,ko.set(t,this),this.projection&&!this.projection.instance&&this.projection.mount(t),this.isVariantNode&&!this.isControllingVariants){let a=this;do a=a.props.inherit!==!1&&a.parent;while(a&&!a.isVariantNode);if(a){let{variantChildren:o}=a;o.add(this),this.removeFromVariantTree=()=>o.delete(this)}}this.values.forEach((a,o)=>this.bindToMotionValue(o,a)),this.reducedMotionConfig==="never"?this.shouldReduceMotion=!1:this.reducedMotionConfig==="always"?this.shouldReduceMotion=!0:(_t.current||Do(),this.shouldReduceMotion=St.current),this.shouldSkipAnimations=this.skipAnimationsConfig??!1,this.parent?.addChild(this),this.update(this.props,this.presenceContext),this.hasBeenMounted=!0}unmount(){this.projection&&this.projection.unmount(),ue(this.notifyUpdate),ue(this.render),this.valueSubscriptions.forEach(t=>t()),this.valueSubscriptions.clear(),this.removeFromVariantTree&&this.removeFromVariantTree(),this.parent?.removeChild(this);for(let t in this.events)this.events[t].clear();for(let t in this.features){let a=this.features[t];a&&(a.unmount(),a.isMounted=!1)}this.current=null}addChild(t){this.children.add(t),this.enteringChildren??(this.enteringChildren=new Set),this.enteringChildren.add(t)}removeChild(t){this.children.delete(t),this.enteringChildren&&this.enteringChildren.delete(t)}bindToMotionValue(t,a){if(this.valueSubscriptions.has(t)&&this.valueSubscriptions.get(t)(),a.accelerate&&go.has(t)&&this.current instanceof HTMLElement){let{factory:s,keyframes:n,times:u,ease:l,duration:d}=a.accelerate,f=new Ia({element:this.current,name:t,keyframes:n,times:u,ease:l,duration:$(d)}),c=s(f);this.valueSubscriptions.set(t,()=>{c(),f.cancel()});return}let o=te.has(t);o&&this.onBindTransform&&this.onBindTransform();let r=a.on("change",s=>{this.latestValues[t]=s,this.props.onUpdate&&k.preRender(this.notifyUpdate),o&&this.projection&&(this.projection.isTransformDirty=!0),this.scheduleRender()}),i;typeof window<"u"&&window.MotionCheckAppearSync&&(i=window.MotionCheckAppearSync(this,t,a)),this.valueSubscriptions.set(t,()=>{r(),i&&i()})}sortNodePosition(t){return!this.current||!t.current||!this.sortInstanceNodePosition||this.type!==t.type?0:this.sortInstanceNodePosition(this.current,t.current)}updateFeatures(){let t="animation";for(t in Jr){let a=Jr[t];if(!a)continue;let{isEnabled:o,Feature:r}=a;if(!this.features[t]&&r&&o(this.props)&&(this.features[t]=new r(this)),this.features[t]){let i=this.features[t];i.isMounted?i.update():(i.mount(),i.isMounted=!0)}}}triggerBuild(){this.build(this.renderState,this.latestValues,this.props)}measureViewportBox(){return this.current?this.measureInstanceViewportBox(this.current,this.props):X()}getStaticValue(t){return this.latestValues[t]}setStaticValue(t,a){this.latestValues[t]=a}update(t,a){(t.transformTemplate||this.props.transformTemplate)&&this.scheduleRender(),this.prevProps=this.props,this.props=t,this.prevPresenceContext=this.presenceContext,this.presenceContext=a;for(let o=0;o<fu.length;o++){let r=fu[o];this.propEventSubscriptions[r]&&(this.propEventSubscriptions[r](),delete this.propEventSubscriptions[r]);let i="on"+r,s=t[i];s&&(this.propEventSubscriptions[r]=this.on(r,s))}this.prevMotionValues=du(this,this.scrapeMotionValuesFromProps(t,this.prevProps||{},this),this.prevMotionValues),this.handleChildMotionValue&&this.handleChildMotionValue()}getProps(){return this.props}getVariant(t){return this.props.variants?this.props.variants[t]:void 0}getDefaultTransition(){return this.props.transition}getTransformPagePoint(){return this.props.transformPagePoint}addValue(t,a){let o=this.values.get(t);if(a!==o){o&&this.removeValue(t),this.bindToMotionValue(t,a),this.values.set(t,a);let r=a.get();r!==void 0&&(this.latestValues[t]=r)}}removeValue(t){this.values.delete(t);let a=this.valueSubscriptions.get(t);a&&(a(),this.valueSubscriptions.delete(t)),delete this.latestValues[t],this.removeValueFromRenderState(t,this.renderState)}hasValue(t){return this.values.has(t)}getValue(t,a){if(this.props.values&&this.props.values[t])return this.props.values[t];let o=this.values.get(t);return o===void 0&&a!==void 0&&(o=fe(a??this.getDefaultValue?.(t),{owner:this}),this.addValue(t,o)),o}readValue(t,a){let o=this.latestValues[t]!==void 0||!this.current?this.latestValues[t]:this.getBaseTargetFromProps(this.props,t)??this.readValueFromInstance(this.current,t,this.options);return o!=null&&(typeof o=="string"&&(Ft(o)||Vt(o))?o=parseFloat(o):typeof o!="number"&&!J.test(o)&&J.test(a)&&(o=La(t,a)),this.setBaseTarget(t,V(o)?o.get():o)),V(o)?o.get():o}setBaseTarget(t,a){this.baseTarget[t]=a}on(t,a){return this.events[t]||(this.events[t]=new ze),this.events[t].add(a)}notify(t,...a){this.events[t]&&this.events[t].notify(...a)}scheduleRenderMicrotask(){Kt.render(this.render)}};var ka=class extends Ro{constructor(){super(...arguments),this.KeyframeResolver=wa}sortInstanceNodePosition(t,a){return t.compareDocumentPosition(a)&2?1:-1}getBaseTargetFromProps(t,a){let o=t.style;return o?o[a]:void 0}removeValueFromRenderState(t,{vars:a,style:o}){delete a[t],delete o[t]}handleChildMotionValue(){this.childSubscription&&(this.childSubscription(),delete this.childSubscription);let{children:t}=this.props;V(t)&&(this.childSubscription=t.on("change",a=>{this.current&&(this.current.textContent=`${a}`)}))}};var ne=class{constructor(t){this.isMounted=!1,this.node=t}update(){}};function es(e,{style:t,vars:a},o,r){let i=e.style,s;for(s in t)i[s]=t[s];r?.applyProjectionStyles(i,o);for(s in a)i.setProperty(s,a[s])}var $t={};function Bo(e,{layout:t,layoutId:a}){return te.has(e)||e.startsWith("origin")||(t||a!==void 0)&&(!!$t[e]||e==="opacity")}function Yt(e,t,a){let o=e.style,r=t?.style,i={};if(!o)return i;for(let s in o)(V(o[s])||r&&V(r[s])||Bo(s,e)||a?.getValue(s)?.liveStyle!==void 0)&&(i[s]=o[s]);return i}function bp(e){return window.getComputedStyle(e)}var Vo=class extends ka{constructor(){super(...arguments),this.type="html",this.renderInstance=es}mount(t){ie(!!t.style,"motion.create() components must forward their ref to a HTML or SVG element","custom-component-ref"),super.mount(t)}readValueFromInstance(t,a){if(te.has(a))return this.projection?.isProjecting?Ut(a):Tr(t,a);{let o=bp(t),r=(mr(a)?o.getPropertyValue(a):o[a])||0;return typeof r=="string"?r.trim():r}}measureInstanceViewportBox(t,{transformPagePoint:a}){return va(t,a)}build(t,a,o){jt(t,a,o.transformTemplate)}scrapeMotionValuesFromProps(t,a,o){return Yt(t,a,o)}};var ts=new Set(["baseFrequency","diffuseConstant","kernelMatrix","kernelUnitLength","keySplines","keyTimes","limitingConeAngle","markerHeight","markerWidth","numOctaves","targetX","targetY","surfaceScale","specularConstant","specularExponent","stdDeviation","tableValues","viewBox","gradientTransform","pathLength","startOffset","textLength","lengthAdjust"]);var Eo=e=>typeof e=="string"&&e.toLowerCase()==="svg";function cu(e,t,a,o){es(e,t,void 0,o);for(let r in t.attrs)e.setAttribute(ts.has(r)?r:Ue(r),t.attrs[r])}function Oo(e,t,a){let o=Yt(e,t,a);for(let r in e)if(V(e[r])||V(t[r])){let i=ye.indexOf(r)!==-1?"attr"+r.charAt(0).toUpperCase()+r.substring(1):r;o[i]=e[r]}return o}var qo=class extends ka{constructor(){super(...arguments),this.type="svg",this.isSVGTag=!1,this.measureInstanceViewportBox=X}getBaseTargetFromProps(t,a){return te.has(a)?super.getBaseTargetFromProps(t,a)??Ut(a):t[a]}getDefaultValue(t){return te.has(t)?this.latestValues[t]??Ut(t):void 0}readValueFromInstance(t,a){if(te.has(a)){let o=vr(a);return o&&o.default||0}if(wo.includes(a)){let r=getComputedStyle(t)[a];if(typeof r=="string"&&r)return r.trim()}return a=ts.has(a)?a:Ue(a),t.getAttribute(a)}scrapeMotionValuesFromProps(t,a,o){return Oo(t,a,o)}build(t,a,o){bo(t,a,this.isSVGTag,o.transformTemplate,o.style)}renderInstance(t,a,o,r){cu(t,a,o,r)}mount(t){this.isSVGTag=Eo(t.tagName),super.mount(t)}};function ji(e,t){if(!Array.isArray(t))return!1;let a=t.length;if(a!==e.length)return!1;for(let o=0;o<a;o++)if(t[o]!==e[o])return!1;return!0}var vp=[...Qr].reverse();function Ki(e){let t=n=>Promise.all(n.map(({animation:u,options:l})=>Bl(e,u,l))),a=pu(),o=!0,r=!1;function i(n){let{props:u,parent:l,manuallyAnimateOnMount:d}=e,f=o||r,c=[],m=new Set,p={},x=1/0,h=e;do h=h.props.inherit!==!1&&h.parent;while(h&&!h.isControllingVariants);if(vp.forEach((C,y)=>{let w=a[C],v=u[C],T=h&&h.props[C],L=v!==void 0?v:it(T)||T===!1?T:void 0,S=it(L),A=C===n?w.isActive:null;A===!1&&(x=y);let F=S&&v===void 0&&!(f&&d);if(w.protectedKeys={...p},!w.isActive&&A===null||!L&&!w.prevProp||st(L)||typeof L=="boolean")return;if(C==="exit"&&w.isActive&&A!==!0){p={...p,...w.prevResolvedValues};return}let G=mu(w.prevProp,L),oe=G||S&&(A&&!F||y>x),q=!1,ee=Array.isArray(L)?L:[L],M={};if(A!==!1)for(let R of ee){let{transition:U,transitionEnd:_,...z}=Se(e,R,Er(e,C))||{};M={...M,...z,..._}}let{prevResolvedValues:be}=w;for(let R in{...be,...M}){if(R in p)continue;let U=M[R],_=be[R],z=Array.isArray(U)&&Array.isArray(_)?!ji(U,_)||G:U!==_;if(z&&U==null)m.add(R);else if(z||U!==void 0&&m.has(R)){oe=!0,m.delete(R)&&(q=!0),w.needsAnimating[R]=!0;let Ce=e.getValue(R);Ce&&(Ce.liveStyle=!1)}else w.protectedKeys[R]=!0}if(w.prevProp=L,w.prevResolvedValues=M,w.isActive&&(p={...p,...M}),oe&&(!(F&&G)||q))for(let R of ee){let U={type:C};if(typeof R=="string"&&f&&d&&l?.enteringChildren){let _=Se(l,R)?.transition?.delayChildren;U.delay=Br(l.enteringChildren,e,_)}c.push({animation:R,options:U})}}),m.size){let{initial:C}=u,y={},w=typeof C!="boolean"&&Se(e,Array.isArray(C)?C[0]:C,e.presenceContext?.custom);w&&w.transition&&(y.transition=w.transition),m.forEach(v=>{let T=e.getValue(v);T&&(T.liveStyle=!0);let L=w&&!Array.isArray(C)?w[v]:void 0,S=e.getBaseTargetFromProps(u,v);y[v]=(L!==void 0?L:S!==void 0&&!V(S)?S:e.initialValues[v]===void 0?e.baseTarget[v]:void 0)??null}),c.push({animation:y})}let I=f&&e.blockInitialAnimation||o&&!d&&(u.initial===!1||u.initial===u.animate);return o=r=!1,!I&&c.length?t(c):Promise.resolve()}function s(n,u){if(a[n].isActive===u)return Promise.resolve();e.variantChildren?.forEach(d=>d.animationState?.setActive(n,u)),a[n].isActive=u;let l=i(n);for(let d in a)a[d].protectedKeys={};return l}return{animateChanges:i,setActive:s,setAnimateFunction:n=>{t=n(e)},getState:()=>a,reset:()=>{a=pu(),r=!0}}}function mu(e,t){return typeof t=="string"?t!==e:Array.isArray(t)?!ji(t,e):!1}function pu(){let e={};for(let t of Qr)e[t]={isActive:t==="animate",protectedKeys:{},needsAnimating:{},prevResolvedValues:{}};return e}function as(e,t){e.min=t.min,e.max=t.max}function Re(e,t){as(e.x,t.x),as(e.y,t.y)}function Xi(e,t){e.translate=t.translate,e.scale=t.scale,e.originPoint=t.originPoint,e.origin=t.origin}var hu=1e-4,Pp=1-hu,Tp=1+hu,xu=.01,Ap=0-xu,kp=0+xu;function ae(e){return e.max-e.min}function Yi(e,t,a){return Math.abs(e-t)<=a}function Zi(e,t,a,o=.5){e.origin=o,e.originPoint=D(t.min,t.max,e.origin),e.scale=ae(a)/ae(t),e.translate=D(a.min,a.max,e.origin)-e.originPoint,(e.scale>=Pp&&e.scale<=Tp||isNaN(e.scale))&&(e.scale=1),(e.translate>=Ap&&e.translate<=kp||isNaN(e.translate))&&(e.translate=0)}function Qt(e,t,a,o){Zi(e.x,t.x,a.x,o?o.originX:void 0),Zi(e.y,t.y,a.y,o?o.originY:void 0)}function _i(e,t,a,o=0){let r=o?D(a.min,a.max,o):a.min;e.min=r+t.min,e.max=e.min+ae(t)}function Qi(e,t,a,o){_i(e.x,t.x,a.x,o?.x),_i(e.y,t.y,a.y,o?.y)}function $i(e,t,a,o=0){let r=o?D(a.min,a.max,o):a.min;e.min=t.min-r,e.max=e.min+ae(t)}function Ma(e,t,a,o){$i(e.x,t.x,a.x,o?.x),$i(e.y,t.y,a.y,o?.y)}function gu(e,t,a,o,r){return e-=t,e=Po(e,1/a,o),r!==void 0&&(e=Po(e,1/r,o)),e}function Mp(e,t=0,a=1,o=.5,r,i=e,s=e){if(he.test(t)&&(t=parseFloat(t),t=D(s.min,s.max,t/100)-s.min),typeof t!="number")return;let n=D(i.min,i.max,o);e===i&&(n-=t),e.min=gu(e.min,t,a,n,r),e.max=gu(e.max,t,a,n,r)}function Lu(e,t,[a,o,r],i,s){Mp(e,t[a],t[o],t[r],t.scale,i,s)}var Dp=["x","scaleX","originX"],Rp=["y","scaleY","originY"];function Ji(e,t,a,o){Lu(e.x,t,Dp,a?a.x:void 0,o?o.x:void 0),Lu(e.y,t,Rp,a?a.y:void 0,o?o.y:void 0)}function Iu(e){return e.translate===0&&e.scale===1}function en(e){return Iu(e.x)&&Iu(e.y)}function Cu(e,t){return e.min===t.min&&e.max===t.max}function Su(e,t){return Cu(e.x,t.x)&&Cu(e.y,t.y)}function yu(e,t){return Math.round(e.min)===Math.round(t.min)&&Math.round(e.max)===Math.round(t.max)}function tn(e,t){return yu(e.x,t.x)&&yu(e.y,t.y)}function an(e){return ae(e.x)/ae(e.y)}function on(e,t){return e.translate===t.translate&&e.scale===t.scale&&e.originPoint===t.originPoint}function we(e){return[e("x"),e("y")]}function wu(e,t){return t.max===t.min?0:e/(t.max-t.min)*100}var Da={correct:(e,t)=>{if(!t.target)return e;if(typeof e=="string")if(b.test(e))e=parseFloat(e);else return e;let a=wu(e,t.target.x),o=wu(e,t.target.y);return`${a}% ${o}%`}};var bu={correct:(e,{treeScale:t,projectionDelta:a})=>{let o=e,r=J.parse(e);if(r.length>5)return o;let i=J.createTransformer(e),s=typeof r[0]!="number"?1:0,n=a.x.scale*t.x,u=a.y.scale*t.y;r[0+s]/=n,r[1+s]/=u;let l=D(n,u,.5);return typeof r[2+s]=="number"&&(r[2+s]/=l),typeof r[3+s]=="number"&&(r[3+s]/=l),i(r)}};function vu(e,t,a){let o="",r=e.x.translate/t.x,i=e.y.translate/t.y,s=a?.z||0;if((r||i||s)&&(o=`translate3d(${r}px, ${i}px, ${s}px) `),(t.x!==1||t.y!==1)&&(o+=`scale(${1/t.x}, ${1/t.y}) `),a){let{transformPerspective:l,rotate:d,pathRotation:f,rotateX:c,rotateY:m,skewX:p,skewY:x}=a;l&&(o=`perspective(${l}px) ${o}`),d&&(o+=`rotate(${d}deg) `),f&&(o+=`rotate(${f}deg) `),c&&(o+=`rotateX(${c}deg) `),m&&(o+=`rotateY(${m}deg) `),p&&(o+=`skewX(${p}deg) `),x&&(o+=`skewY(${x}deg) `)}let n=e.x.scale*t.x,u=e.y.scale*t.y;return(n!==1||u!==1)&&(o+=`scale(${n}, ${u})`),o||"none"}var Fp=yo.length,Pu=e=>typeof e=="number"||b.test(e);function Au(e,t,a,o,r,i){r?(e.opacity=D(0,a.opacity??1,Bp(o)),e.opacityExit=D(t.opacity??1,0,Vp(o))):i&&(e.opacity=D(t.opacity??1,a.opacity??1,o));for(let s=0;s<Fp;s++){let n=yo[s],u=Tu(t,n),l=Tu(a,n);if(u===void 0&&l===void 0)continue;u||(u=0),l||(l=0),u===0||l===0||Pu(u)===Pu(l)?(e[n]=Math.max(D(Aa(u),Aa(l),o),0),(he.test(l)||he.test(u))&&(e[n]+="%")):e[n]=l}(t.rotate||a.rotate)&&(e.rotate=D(t.rotate||0,a.rotate||0,o))}function Tu(e,t){return e[t]!==void 0?e[t]:e.borderRadius}var Bp=ku(0,.5,Qa),Vp=ku(.5,.95,Q);function ku(e,t,a){return o=>o<e?0:o>t?1:a(Te(e,t,o))}function Uo(e,t,a){let o=V(e)?e:fe(e);return o.start(ot("",o,t,a)),o.animation}function $e(e,t,a,o={passive:!0}){return e.addEventListener(t,a,o),()=>e.removeEventListener(t,a,o)}var Mu=(e,t)=>e.depth-t.depth;var os=class{constructor(){this.children=[],this.isDirty=!1}add(t){Rt(this.children,t),this.isDirty=!0}remove(t){Le(this.children,t),this.isDirty=!0}forEach(t){this.isDirty&&this.children.sort(Mu),this.isDirty=!1,this.children.forEach(t)}};function Du(e,t){let a=N.now(),o=({timestamp:r})=>{let i=r-a;i>=t&&(ue(o),e(i-t))};return k.setup(o,!0),()=>ue(o)}function Jt(e){return V(e)?e.get():e}var rs=class{constructor(){this.members=[]}add(t){Rt(this.members,t);for(let a=this.members.length-1;a>=0;a--){let o=this.members[a];if(o===t||o===this.lead||o===this.prevLead)continue;let r=o.instance;(!r||r.isConnected===!1)&&!o.snapshot&&(Le(this.members,o),o.unmount())}t.scheduleRender()}remove(t){if(Le(this.members,t),t===this.prevLead&&(this.prevLead=void 0),t===this.lead){let a=this.members[this.members.length-1];a&&this.promote(a)}}relegate(t){for(let a=this.members.indexOf(t)-1;a>=0;a--){let o=this.members[a];if(o.isPresent!==!1&&o.instance?.isConnected!==!1)return this.promote(o),!0}return!1}promote(t,a){let o=this.lead;if(t!==o&&(this.prevLead=o,this.lead=t,t.show(),o)){o.updateSnapshot(),t.scheduleRender();let{layoutDependency:r}=o.options,{layoutDependency:i}=t.options;(r===void 0||r!==i)&&(t.resumeFrom=o,a&&(o.preserveOpacity=!0),o.snapshot&&(t.snapshot=o.snapshot,t.snapshot.latestValues=o.animationValues||o.latestValues),t.root?.isUpdating&&(t.isLayoutDirty=!0)),t.options.crossfade===!1&&o.hide()}}exitAnimationComplete(){this.members.forEach(t=>{t.options.onExitComplete?.(),t.resumingFrom?.options.onExitComplete?.()})}scheduleRender(){this.members.forEach(t=>t.instance&&t.scheduleRender(!1))}removeLeadSnapshot(){this.lead?.snapshot&&(this.lead.snapshot=void 0)}};var Ru={borderRadius:{...Da,applyTo:[...yo]},borderTopLeftRadius:Da,borderTopRightRadius:Da,borderBottomLeftRadius:Da,borderBottomRightRadius:Da,boxShadow:bu};var ea={hasAnimatedSinceResize:!0,hasEverUpdated:!1};Object.assign($t,{...Ru,...$t});var ta={nodes:0,calculatedTargetDeltas:0,calculatedProjections:0},rn=["","X","Y","Z"],Ep=1e3,Op=0;function sn(e,t,a,o){let{latestValues:r}=t;r[e]&&(a[e]=r[e],t.setStaticValue(e,0),o&&(o[e]=0))}function Hu(e){if(e.hasCheckedOptimisedAppear=!0,e.root===e)return;let{visualElement:t}=e.options;if(!t)return;let a=Or(t);if(window.MotionHasOptimisedAnimation(a,"transform")){let{layout:r,layoutId:i}=e.options;window.MotionCancelOptimisedAnimation(a,"transform",k,!(r||i))}let{parent:o}=e;o&&!o.hasCheckedOptimisedAppear&&Hu(o)}function ss({attachResizeListener:e,defaultParent:t,measureScroll:a,checkIsScrollRoot:o,resetTransform:r}){return class{constructor(s={},n=t?.()){this.id=Op++,this.animationId=0,this.animationCommitId=0,this.children=new Set,this.options={},this.isTreeAnimating=!1,this.isAnimationBlocked=!1,this.isLayoutDirty=!1,this.isProjectionDirty=!1,this.isSharedProjectionDirty=!1,this.isTransformDirty=!1,this.updateManuallyBlocked=!1,this.updateBlockedByResize=!1,this.isUpdating=!1,this.isSVG=!1,this.needsReset=!1,this.shouldResetTransform=!1,this.hasCheckedOptimisedAppear=!1,this.treeScale={x:1,y:1},this.eventHandlers=new Map,this.hasTreeAnimated=!1,this.updateScheduled=!1,this.scheduleUpdate=()=>this.update(),this.projectionUpdateScheduled=!1,this.checkUpdateFailed=()=>{this.isUpdating&&(this.isUpdating=!1,this.clearAllSnapshots())},this.updateProjection=()=>{this.projectionUpdateScheduled=!1,Zt.value&&(ta.nodes=ta.calculatedTargetDeltas=ta.calculatedProjections=0),this.nodes.forEach(Np),this.nodes.forEach(Xp),this.nodes.forEach(Zp),this.nodes.forEach(Hp),Zt.addProjectionMetrics&&Zt.addProjectionMetrics(ta)},this.resolvedRelativeTargetAt=0,this.hasProjected=!1,this.isVisible=!0,this.animationProgress=0,this.sharedNodes=new Map,this.latestValues=s,this.root=n?n.root||n:this,this.path=n?[...n.path,n]:[],this.parent=n,this.depth=n?n.depth+1:0;for(let u=0;u<this.path.length;u++)this.path[u].shouldResetTransform=!0;this.root===this&&(this.nodes=new os)}addEventListener(s,n){return this.eventHandlers.has(s)||this.eventHandlers.set(s,new ze),this.eventHandlers.get(s).add(n)}notifyListeners(s,...n){let u=this.eventHandlers.get(s);u&&u.notify(...n)}hasListeners(s){return this.eventHandlers.has(s)}mount(s){if(this.instance)return;this.isSVG=ke(s)&&!iu(s),this.instance=s;let{layoutId:n,layout:u,visualElement:l}=this.options;if(l&&!l.current&&l.mount(s),this.root.nodes.add(this),this.parent&&this.parent.children.add(this),this.root.hasTreeAnimated&&(u||n)&&(this.isLayoutDirty=!0),e){let d,f=0,c=()=>this.root.updateBlockedByResize=!1;k.read(()=>{f=window.innerWidth}),e(s,()=>{let m=window.innerWidth;m!==f&&(f=m,this.root.updateBlockedByResize=!0,d&&d(),d=Du(c,250),ea.hasAnimatedSinceResize&&(ea.hasAnimatedSinceResize=!1,this.nodes.forEach(Vu)))})}n&&this.root.registerSharedNode(n,this),this.options.animate!==!1&&l&&(n||u)&&this.addEventListener("didUpdate",({delta:d,hasLayoutChanged:f,hasRelativeLayoutChanged:c,layout:m})=>{if(this.isTreeAnimationBlocked()){this.target=void 0,this.relativeTarget=void 0;return}let p=this.options.transition||l.getDefaultTransition()||Jp,{onLayoutAnimationStart:x,onLayoutAnimationComplete:h}=l.getProps(),I=!this.targetLayout||!tn(this.targetLayout,m),C=!f&&c;if(this.options.layoutRoot||this.resumeFrom||C||f&&(I||!this.currentAnimation)){this.resumeFrom&&(this.resumingFrom=this.resumeFrom,this.resumingFrom.resumingFrom=void 0);let y={...Ca(p,"layout"),onPlay:x,onComplete:h};(l.shouldReduceMotion||this.options.layoutRoot)&&(y.delay=0,y.type=!1),this.startAnimation(y),this.setAnimationOrigin(d,C,y.path)}else f||Vu(this),this.isLead()&&this.options.onExitComplete&&this.options.onExitComplete();this.targetLayout=m})}unmount(){this.options.layoutId&&this.willUpdate(),this.root.nodes.remove(this);let s=this.getStack();s&&s.remove(this),this.parent&&this.parent.children.delete(this),this.instance=void 0,this.eventHandlers.clear(),ue(this.updateProjection)}blockUpdate(){this.updateManuallyBlocked=!0}unblockUpdate(){this.updateManuallyBlocked=!1}isUpdateBlocked(){return this.updateManuallyBlocked||this.updateBlockedByResize}isTreeAnimationBlocked(){return this.isAnimationBlocked||this.parent&&this.parent.isTreeAnimationBlocked()||!1}startUpdate(){this.isUpdateBlocked()||(this.isUpdating=!0,this.nodes&&this.nodes.forEach(_p),this.animationId++)}getTransformTemplate(){let{visualElement:s}=this.options;return s&&s.getProps().transformTemplate}willUpdate(s=!0){if(this.root.hasTreeAnimated=!0,this.root.isUpdateBlocked()){this.options.onExitComplete&&this.options.onExitComplete();return}if(window.MotionCancelOptimisedAnimation&&!this.hasCheckedOptimisedAppear&&Hu(this),!this.root.isUpdating&&this.root.startUpdate(),this.isLayoutDirty)return;this.isLayoutDirty=!0;for(let d=0;d<this.path.length;d++){let f=this.path[d];f.shouldResetTransform=!0,(typeof f.latestValues.x=="string"||typeof f.latestValues.y=="string")&&(f.isLayoutDirty=!0),f.updateScroll("snapshot"),f.options.layoutRoot&&f.willUpdate(!1)}let{layoutId:n,layout:u}=this.options;if(n===void 0&&!u)return;let l=this.getTransformTemplate();this.prevTransformTemplateValue=l?l(this.latestValues,""):void 0,this.updateSnapshot(),s&&this.notifyListeners("willUpdate")}update(){if(this.updateScheduled=!1,this.isUpdateBlocked()){let u=this.updateBlockedByResize;this.unblockUpdate(),this.updateBlockedByResize=!1,this.clearAllSnapshots(),u&&this.nodes.forEach(zp),this.nodes.forEach(Fu);return}if(this.animationId<=this.animationCommitId){this.nodes.forEach(Bu);return}this.animationCommitId=this.animationId,this.isUpdating?(this.isUpdating=!1,this.nodes.forEach(Wp),this.nodes.forEach(jp),this.nodes.forEach(Kp),this.nodes.forEach(qp),this.nodes.forEach(Up)):this.nodes.forEach(Bu),this.clearAllSnapshots();let n=N.now();W.delta=se(0,1e3/60,n-W.timestamp),W.timestamp=n,W.isProcessing=!0,no.update.process(W),no.preRender.process(W),no.render.process(W),W.isProcessing=!1}didUpdate(){this.updateScheduled||(this.updateScheduled=!0,Kt.read(this.scheduleUpdate))}clearAllSnapshots(){this.nodes.forEach(Gp),this.sharedNodes.forEach($p)}scheduleUpdateProjection(){this.projectionUpdateScheduled||(this.projectionUpdateScheduled=!0,k.preRender(this.updateProjection,!1,!0))}scheduleCheckAfterUnmount(){k.postRender(()=>{this.isLayoutDirty?this.root.didUpdate():this.root.checkUpdateFailed()})}updateSnapshot(){this.snapshot||!this.instance||(this.snapshot=this.measure(),this.snapshot&&!ae(this.snapshot.measuredBox.x)&&!ae(this.snapshot.measuredBox.y)&&(this.snapshot=void 0))}updateLayout(){if(!this.instance||(this.updateScroll(),!(this.options.alwaysMeasureLayout&&this.isLead())&&!this.isLayoutDirty))return;if(this.resumeFrom&&!this.resumeFrom.instance)for(let u=0;u<this.path.length;u++)this.path[u].updateScroll();let s=this.layout;this.layout=this.measure(!1),this.layoutCorrected||(this.layoutCorrected=X()),this.isLayoutDirty=!1,this.projectionDelta=void 0,this.notifyListeners("measure",this.layout.layoutBox);let{visualElement:n}=this.options;n&&n.notify("LayoutMeasure",this.layout.layoutBox,s?s.layoutBox:void 0)}updateScroll(s="measure"){let n=!!(this.options.layoutScroll&&this.instance);if(this.scroll&&this.scroll.animationId===this.root.animationId&&this.scroll.phase===s&&(n=!1),n&&this.instance){let u=o(this.instance);this.scroll={animationId:this.root.animationId,phase:s,isRoot:u,offset:a(this.instance),wasRoot:this.scroll?this.scroll.isRoot:u}}}resetTransform(){if(!r)return;let s=this.isLayoutDirty||this.shouldResetTransform||this.options.alwaysMeasureLayout,n=this.projectionDelta&&!en(this.projectionDelta),u=this.getTransformTemplate(),l=u?u(this.latestValues,""):void 0,d=l!==this.prevTransformTemplateValue;s&&this.instance&&(n||rt(this.latestValues)||d)&&(r(this.instance,l),this.shouldResetTransform=!1,this.scheduleRender())}measure(s=!0){let n=this.measurePageBox(),u=this.removeElementScroll(n);return s&&(u=this.removeTransform(u)),em(u),{animationId:this.root.animationId,measuredBox:n,layoutBox:u,latestValues:{},source:this.id}}measurePageBox(){let{visualElement:s}=this.options;if(!s)return X();let n=s.measureViewportBox();if(!(this.scroll?.wasRoot||this.path.some(tm))){let{scroll:l}=this.root;l&&(Me(n.x,l.offset.x),Me(n.y,l.offset.y))}return n}removeElementScroll(s){let n=X();if(Re(n,s),this.scroll?.wasRoot)return n;for(let u=0;u<this.path.length;u++){let l=this.path[u],{scroll:d,options:f}=l;l!==this.root&&d&&f.layoutScroll&&(d.wasRoot&&Re(n,s),Me(n.x,d.offset.x),Me(n.y,d.offset.y))}return n}applyTransform(s,n=!1,u){let l=u||X();Re(l,s);for(let d=0;d<this.path.length;d++){let f=this.path[d];!n&&f.options.layoutScroll&&f.scroll&&f!==f.root&&(Me(l.x,-f.scroll.offset.x),Me(l.y,-f.scroll.offset.y)),rt(f.latestValues)&&To(l,f.latestValues,f.layout?.layoutBox)}return rt(this.latestValues)&&To(l,this.latestValues,this.layout?.layoutBox),l}removeTransform(s){let n=X();Re(n,s);for(let u=0;u<this.path.length;u++){let l=this.path[u];if(!rt(l.latestValues))continue;let d;l.instance&&(Wr(l.latestValues)&&l.updateSnapshot(),d=X(),Re(d,l.measurePageBox())),Ji(n,l.latestValues,l.snapshot?.layoutBox,d)}return rt(this.latestValues)&&Ji(n,this.latestValues),n}setTargetDelta(s){this.targetDelta=s,this.root.scheduleUpdateProjection(),this.isProjectionDirty=!0}setOptions(s){this.options={...this.options,...s,crossfade:s.crossfade!==void 0?s.crossfade:!0}}clearMeasurements(){this.scroll=void 0,this.layout=void 0,this.snapshot=void 0,this.prevTransformTemplateValue=void 0,this.targetDelta=void 0,this.target=void 0,this.isLayoutDirty=!1}forceRelativeParentToResolveTarget(){this.relativeParent&&this.relativeParent.resolvedRelativeTargetAt!==W.timestamp&&this.relativeParent.resolveTargetDelta(!0)}resolveTargetDelta(s=!1){let n=this.getLead();this.isProjectionDirty||(this.isProjectionDirty=n.isProjectionDirty),this.isTransformDirty||(this.isTransformDirty=n.isTransformDirty),this.isSharedProjectionDirty||(this.isSharedProjectionDirty=n.isSharedProjectionDirty);let u=!!this.resumingFrom||this!==n;if(!(s||u&&this.isSharedProjectionDirty||this.isProjectionDirty||this.parent?.isProjectionDirty||this.attemptToResolveRelativeTarget||this.root.updateBlockedByResize))return;let{layout:d,layoutId:f}=this.options;if(!this.layout||!(d||f))return;this.resolvedRelativeTargetAt=W.timestamp;let c=this.getClosestProjectingParent();!this.targetDelta&&!this.relativeTarget&&(this.options.layoutAnchor!==!1&&c&&c.layout?this.createRelativeTarget(c,this.layout.layoutBox,c.layout.layoutBox):this.removeRelativeTarget()),!(!this.relativeTarget&&!this.targetDelta)&&(this.target||(this.target=X(),this.targetWithTransforms=X()),this.relativeTarget&&this.relativeTargetOrigin&&this.relativeParent&&this.relativeParent.target?(this.forceRelativeParentToResolveTarget(),Qi(this.target,this.relativeTarget,this.relativeParent.target,this.options.layoutAnchor||void 0)):this.targetDelta?(this.resumingFrom?this.applyTransform(this.layout.layoutBox,!1,this.target):Re(this.target,this.layout.layoutBox),Ti(this.target,this.targetDelta)):Re(this.target,this.layout.layoutBox),this.attemptToResolveRelativeTarget&&(this.attemptToResolveRelativeTarget=!1,this.options.layoutAnchor!==!1&&c&&!!c.resumingFrom==!!this.resumingFrom&&!c.options.layoutScroll&&c.target&&this.animationProgress!==1?this.createRelativeTarget(c,this.target,c.target):this.relativeParent=this.relativeTarget=void 0),Zt.value&&ta.calculatedTargetDeltas++)}getClosestProjectingParent(){if(!(!this.parent||Wr(this.parent.latestValues)||vi(this.parent.latestValues)))return this.parent.isProjecting()?this.parent:this.parent.getClosestProjectingParent()}isProjecting(){return!!((this.relativeTarget||this.targetDelta||this.options.layoutRoot)&&this.layout)}createRelativeTarget(s,n,u){this.relativeParent=s,this.forceRelativeParentToResolveTarget(),this.relativeTarget=X(),this.relativeTargetOrigin=X(),Ma(this.relativeTargetOrigin,n,u,this.options.layoutAnchor||void 0),Re(this.relativeTarget,this.relativeTargetOrigin)}removeRelativeTarget(){this.relativeParent=this.relativeTarget=void 0}calcProjection(){let s=this.getLead(),n=!!this.resumingFrom||this!==s,u=!0;if((this.isProjectionDirty||this.parent?.isProjectionDirty)&&(u=!1),n&&(this.isSharedProjectionDirty||this.isTransformDirty)&&(u=!1),this.resolvedRelativeTargetAt===W.timestamp&&(u=!1),u)return;let{layout:l,layoutId:d}=this.options;if(this.isTreeAnimating=!!(this.parent&&this.parent.isTreeAnimating||this.currentAnimation||this.pendingAnimation),this.isTreeAnimating||(this.targetDelta=this.relativeTarget=void 0),!this.layout||!(l||d))return;Re(this.layoutCorrected,this.layout.layoutBox);let f=this.treeScale.x,c=this.treeScale.y;Ql(this.layoutCorrected,this.treeScale,this.path,n),s.layout&&!s.target&&(this.treeScale.x!==1||this.treeScale.y!==1)&&(s.target=s.layout.layoutBox,s.targetWithTransforms=X());let{target:m}=s;if(!m){this.prevProjectionDelta&&(this.createProjectionDeltas(),this.scheduleRender());return}!this.projectionDelta||!this.prevProjectionDelta?this.createProjectionDeltas():(Xi(this.prevProjectionDelta.x,this.projectionDelta.x),Xi(this.prevProjectionDelta.y,this.projectionDelta.y)),Qt(this.projectionDelta,this.layoutCorrected,m,this.latestValues),(this.treeScale.x!==f||this.treeScale.y!==c||!on(this.projectionDelta.x,this.prevProjectionDelta.x)||!on(this.projectionDelta.y,this.prevProjectionDelta.y))&&(this.hasProjected=!0,this.scheduleRender(),this.notifyListeners("projectionUpdate",m)),Zt.value&&ta.calculatedProjections++}hide(){this.isVisible=!1}show(){this.isVisible=!0}scheduleRender(s=!0){if(this.options.visualElement?.scheduleRender(),s){let n=this.getStack();n&&n.scheduleRender()}this.resumingFrom&&!this.resumingFrom.instance&&(this.resumingFrom=void 0)}createProjectionDeltas(){this.prevProjectionDelta=Ct(),this.projectionDelta=Ct(),this.projectionDeltaWithTransform=Ct()}setAnimationOrigin(s,n=!1,u){let l=this.snapshot,d=l?l.latestValues:{},f={...this.latestValues},c=Ct();(!this.relativeParent||!this.relativeParent.options.layoutRoot)&&(this.relativeTarget=this.relativeTargetOrigin=void 0),this.attemptToResolveRelativeTarget=!n;let m=X(),p=l?l.source:void 0,x=this.layout?this.layout.source:void 0,h=p!==x,I=this.getStack(),C=!I||I.members.length<=1,y=!!(h&&!C&&this.options.crossfade===!0&&!this.path.some(Qp));this.animationProgress=0;let w,v=u?.interpolateProjection(s);this.mixTargetDelta=T=>{let L=T/1e3,S=v?.(L);S?(c.x.translate=S.x,c.x.scale=D(s.x.scale,1,L),c.x.origin=s.x.origin,c.x.originPoint=s.x.originPoint,c.y.translate=S.y,c.y.scale=D(s.y.scale,1,L),c.y.origin=s.y.origin,c.y.originPoint=s.y.originPoint):(Eu(c.x,s.x,L),Eu(c.y,s.y,L)),this.setTargetDelta(c),this.relativeTarget&&this.relativeTargetOrigin&&this.layout&&this.relativeParent&&this.relativeParent.layout&&(Ma(m,this.layout.layoutBox,this.relativeParent.layout.layoutBox,this.options.layoutAnchor||void 0),Yp(this.relativeTarget,this.relativeTargetOrigin,m,L),w&&Su(this.relativeTarget,w)&&(this.isProjectionDirty=!1),w||(w=X()),Re(w,this.relativeTarget)),h&&(this.animationValues=f,Au(f,d,this.latestValues,L,y,C)),S&&S.rotate!==void 0&&(this.animationValues||(this.animationValues=f),this.animationValues.pathRotation=S.rotate),this.root.scheduleUpdateProjection(),this.scheduleRender(),this.animationProgress=L},this.mixTargetDelta(this.options.layoutRoot?1e3:0)}startAnimation(s){this.notifyListeners("animationStart"),this.currentAnimation?.stop(),this.resumingFrom?.currentAnimation?.stop(),this.pendingAnimation&&(ue(this.pendingAnimation),this.pendingAnimation=void 0),this.pendingAnimation=k.update(()=>{ea.hasAnimatedSinceResize=!0,this.motionValue||(this.motionValue=fe(0)),this.motionValue.jump(0,!1),this.currentAnimation=Uo(this.motionValue,[0,1e3],{...s,velocity:0,isSync:!0,onUpdate:n=>{this.mixTargetDelta(n),s.onUpdate&&s.onUpdate(n)},onComplete:()=>{s.onComplete&&s.onComplete(),this.completeAnimation()}}),sl(this.currentAnimation,this),this.resumingFrom&&(this.resumingFrom.currentAnimation=this.currentAnimation),this.pendingAnimation=void 0})}completeAnimation(){this.resumingFrom&&(this.resumingFrom.currentAnimation=void 0,this.resumingFrom.preserveOpacity=void 0);let s=this.getStack();s&&s.exitAnimationComplete(),this.resumingFrom=this.currentAnimation=this.animationValues=void 0,this.notifyListeners("animationComplete")}finishAnimation(){this.currentAnimation&&(this.mixTargetDelta&&this.mixTargetDelta(Ep),this.currentAnimation.stop()),this.completeAnimation()}applyTransformsToTarget(){let s=this.getLead(),{targetWithTransforms:n,layout:u,latestValues:l}=s,{target:d}=s;if(!(!n||!d||!u)){if(this!==s&&this.layout&&u&&Gu(this.options.animationType,this.layout.layoutBox,u.layoutBox)){d=this.target||X();let f=ae(this.layout.layoutBox.x);d.x.min=s.target.x.min,d.x.max=d.x.min+f;let c=ae(this.layout.layoutBox.y);d.y.min=s.target.y.min,d.y.max=d.y.min+c}Re(n,d),To(n,l),Qt(this.projectionDeltaWithTransform,this.layoutCorrected,n,l)}}registerSharedNode(s,n){this.sharedNodes.has(s)||this.sharedNodes.set(s,new rs),this.sharedNodes.get(s).add(n);let l=n.options.initialPromotionConfig;n.promote({transition:l?l.transition:void 0,preserveFollowOpacity:l&&l.shouldPreserveFollowOpacity?l.shouldPreserveFollowOpacity(n):void 0})}isLead(){let s=this.getStack();return s?s.lead===this:!0}getLead(){let{layoutId:s}=this.options;return s?this.getStack()?.lead||this:this}getPrevLead(){let{layoutId:s}=this.options;return s?this.getStack()?.prevLead:void 0}getStack(){let{layoutId:s}=this.options;if(s)return this.root.sharedNodes.get(s)}promote({needsReset:s,transition:n,preserveFollowOpacity:u}={}){let l=this.getStack();l&&l.promote(this,u),s&&(this.projectionDelta=void 0,this.needsReset=!0),n&&this.setOptions({transition:n})}relegate(){let s=this.getStack();return s?s.relegate(this):!1}resetSkewAndRotation(){let{visualElement:s}=this.options;if(!s)return;let n=!1,{latestValues:u}=s;if((u.z||u.rotate||u.rotateX||u.rotateY||u.rotateZ||u.skewX||u.skewY)&&(n=!0),!n)return;let l={};u.z&&sn("z",s,l,this.animationValues);for(let d=0;d<rn.length;d++)sn(`rotate${rn[d]}`,s,l,this.animationValues),sn(`skew${rn[d]}`,s,l,this.animationValues);s.render();for(let d in l)s.setStaticValue(d,l[d]),this.animationValues&&(this.animationValues[d]=l[d]);s.scheduleRender()}applyProjectionStyles(s,n){if(!this.instance||this.isSVG)return;if(!this.isVisible){s.visibility="hidden";return}let u=this.getTransformTemplate();if(this.needsReset){this.needsReset=!1,s.visibility="",s.opacity="",s.pointerEvents=Jt(n?.pointerEvents)||"",s.transform=u?u(this.latestValues,""):"none";return}let l=this.getLead();if(!this.projectionDelta||!this.layout||!l.target){this.options.layoutId&&(s.opacity=this.latestValues.opacity!==void 0?this.latestValues.opacity:1,s.pointerEvents=Jt(n?.pointerEvents)||""),this.hasProjected&&!rt(this.latestValues)&&(s.transform=u?u({},""):"none",this.hasProjected=!1);return}s.visibility="";let d=l.animationValues||l.latestValues;this.applyTransformsToTarget();let f=vu(this.projectionDeltaWithTransform,this.treeScale,d);u&&(f=u(d,f)),s.transform=f;let{x:c,y:m}=this.projectionDelta;s.transformOrigin=`${c.origin*100}% ${m.origin*100}% 0`,l.animationValues?s.opacity=l===this?d.opacity??this.latestValues.opacity??1:this.preserveOpacity?this.latestValues.opacity:d.opacityExit:s.opacity=l===this?d.opacity!==void 0?d.opacity:"":d.opacityExit!==void 0?d.opacityExit:0;for(let p in $t){if(d[p]===void 0)continue;let{correct:x,applyTo:h,isCSSVariable:I}=$t[p],C=f==="none"?d[p]:x(d[p],l);if(h){let y=h.length;for(let w=0;w<y;w++)s[h[w]]=C}else I?this.options.visualElement.renderState.vars[p]=C:s[p]=C}this.options.layoutId&&(s.pointerEvents=l===this?Jt(n?.pointerEvents)||"":"none")}clearSnapshot(){this.resumeFrom=this.snapshot=void 0}resetTree(){this.root.nodes.forEach(s=>s.currentAnimation?.stop()),this.root.nodes.forEach(Fu),this.root.sharedNodes.clear()}}}function qp(e){e.updateLayout()}function Up(e){let t=e.resumeFrom?.snapshot||e.snapshot;if(e.isLead()&&e.layout&&t&&e.hasListeners("didUpdate")){let{layoutBox:a,measuredBox:o}=e.layout,{animationType:r}=e.options,i=t.source!==e.layout.source;if(r==="size")we(d=>{let f=i?t.measuredBox[d]:t.layoutBox[d],c=ae(f);f.min=a[d].min,f.max=f.min+c});else if(r==="x"||r==="y"){let d=r==="x"?"y":"x";as(i?t.measuredBox[d]:t.layoutBox[d],a[d])}else Gu(r,t.layoutBox,a)&&we(d=>{let f=i?t.measuredBox[d]:t.layoutBox[d],c=ae(a[d]);f.max=f.min+c,e.relativeTarget&&!e.currentAnimation&&(e.isProjectionDirty=!0,e.relativeTarget[d].max=e.relativeTarget[d].min+c)});let s=Ct();Qt(s,a,t.layoutBox);let n=Ct();i?Qt(n,e.applyTransform(o,!0),t.measuredBox):Qt(n,a,t.layoutBox);let u=!en(s),l=!1;if(!e.resumeFrom){let d=e.getClosestProjectingParent();if(d&&!d.resumeFrom){let{snapshot:f,layout:c}=d;if(f&&c){let m=e.options.layoutAnchor||void 0,p=X();Ma(p,t.layoutBox,f.layoutBox,m);let x=X();Ma(x,a,c.layoutBox,m),tn(p,x)||(l=!0),d.options.layoutRoot&&(e.relativeTarget=x,e.relativeTargetOrigin=p,e.relativeParent=d)}}}e.notifyListeners("didUpdate",{layout:a,snapshot:t,delta:n,layoutDelta:s,hasLayoutChanged:u,hasRelativeLayoutChanged:l})}else if(e.isLead()){let{onExitComplete:a}=e.options;a&&a()}e.options.transition=void 0}function Np(e){Zt.value&&ta.nodes++,e.parent&&(e.isProjecting()||(e.isProjectionDirty=e.parent.isProjectionDirty),e.isSharedProjectionDirty||(e.isSharedProjectionDirty=!!(e.isProjectionDirty||e.parent.isProjectionDirty||e.parent.isSharedProjectionDirty)),e.isTransformDirty||(e.isTransformDirty=e.parent.isTransformDirty))}function Hp(e){e.isProjectionDirty=e.isSharedProjectionDirty=e.isTransformDirty=!1}function Gp(e){e.clearSnapshot()}function Fu(e){e.clearMeasurements()}function zp(e){e.isLayoutDirty=!0,e.updateLayout()}function Bu(e){e.isLayoutDirty=!1}function Wp(e){e.isAnimationBlocked&&e.layout&&!e.isLayoutDirty&&(e.snapshot=e.layout,e.isLayoutDirty=!0)}function jp(e){e.relativeTarget&&e.relativeParent?.isLayoutDirty&&(e.currentAnimation?e.isLayoutDirty=!0:(e.targetDelta=void 0,e.removeRelativeTarget()))}function Kp(e){let{visualElement:t}=e.options;t&&t.getProps().onBeforeLayoutMeasure&&t.notify("BeforeLayoutMeasure"),e.resetTransform()}function Vu(e){e.finishAnimation(),e.targetDelta=e.relativeTarget=e.target=void 0,e.isProjectionDirty=!0}function Xp(e){e.resolveTargetDelta()}function Zp(e){e.calcProjection()}function _p(e){e.resetSkewAndRotation()}function $p(e){e.removeLeadSnapshot()}function Eu(e,t,a){e.translate=D(t.translate,0,a),e.scale=D(t.scale,1,a),e.origin=t.origin,e.originPoint=t.originPoint}function Ou(e,t,a,o){e.min=D(t.min,a.min,o),e.max=D(t.max,a.max,o)}function Yp(e,t,a,o){Ou(e.x,t.x,a.x,o),Ou(e.y,t.y,a.y,o)}function Qp(e){return e.animationValues&&e.animationValues.opacityExit!==void 0}var Jp={duration:.45,ease:[.4,0,.1,1]},qu=e=>typeof navigator<"u"&&navigator.userAgent&&navigator.userAgent.toLowerCase().includes(e),Uu=qu("applewebkit/")&&!qu("chrome/")?Math.round:Q;function Nu(e){e.min=Uu(e.min),e.max=Uu(e.max)}function em(e){Nu(e.x),Nu(e.y)}function Gu(e,t,a){return e==="position"||e==="preserve-aspect"&&!Yi(an(t),an(a),.2)}function tm(e){return e!==e.root&&e.scroll?.wasRoot}var zu=ss({attachResizeListener:(e,t)=>$e(e,"resize",t),measureScroll:()=>({x:document.documentElement.scrollLeft||document.body?.scrollLeft||0,y:document.documentElement.scrollTop||document.body?.scrollTop||0}),checkIsScrollRoot:()=>!0});var am=e=>!e.isLayoutDirty&&e.willUpdate(!1);function is(){let e=new Set,t=new WeakMap,a=()=>e.forEach(am);return{add:o=>{e.add(o),t.set(o,o.addEventListener("willUpdate",a))},remove:o=>{e.delete(o);let r=t.get(o);r&&(r(),t.delete(o)),a()},dirty:a}}var ns={current:void 0},No=ss({measureScroll:e=>({x:e.scrollLeft,y:e.scrollTop}),defaultParent:()=>{if(!ns.current){let e=new zu({});e.mount(window),e.setOptions({layoutScroll:!0}),ns.current=e}return ns.current},resetTransform:(e,t)=>{e.style.transform=t!==void 0?t:"none"},checkIsScrollRoot:e=>window.getComputedStyle(e).position==="fixed"});var ls=Ka(P("react"),1),nt=P("react");var Wu=P("react"),Ye=(0,Wu.createContext)({transformPagePoint:e=>e,isStatic:!1,reducedMotion:"never"});var Ku=Ka(P("react"),1);function ju(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function om(...e){return t=>{let a=!1,o=e.map(r=>{let i=ju(r,t);return!a&&typeof i=="function"&&(a=!0),i});if(a)return()=>{for(let r=0;r<o.length;r++){let i=o[r];typeof i=="function"?i():ju(e[r],null)}}}}function Xu(...e){return Ku.useCallback(om(...e),e)}var nn=class extends ls.Component{getSnapshotBeforeUpdate(t){let a=this.props.childRef.current;if(_e(a)&&t.isPresent&&!this.props.isPresent&&this.props.pop!==!1){let o=a.offsetParent,r=_e(o)&&o.offsetWidth||0,i=_e(o)&&o.offsetHeight||0,s=getComputedStyle(a),n=this.props.sizeRef.current;n.height=parseFloat(s.height),n.width=parseFloat(s.width),n.top=a.offsetTop,n.left=a.offsetLeft,n.right=r-n.width-n.left,n.bottom=i-n.height-n.top,n.direction=s.direction}return null}componentDidUpdate(){}render(){return this.props.children}};function _u({children:e,isPresent:t,anchorX:a,anchorY:o,root:r,pop:i}){let s=(0,nt.useId)(),n=(0,nt.useRef)(null),u=(0,nt.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:l}=(0,nt.useContext)(Ye),d=i!==!1?e.props?.ref??e?.ref:void 0,f=Xu(n,d);return(0,nt.useInsertionEffect)(()=>{let{width:c,height:m,top:p,left:x,right:h,bottom:I,direction:C}=u.current;if(t||i===!1||!n.current||!c||!m)return;let y=C==="rtl",w=a==="left"?y?`right: ${h}`:`left: ${x}`:y?`left: ${x}`:`right: ${h}`,v=o==="bottom"?`bottom: ${I}`:`top: ${p}`;n.current.dataset.motionPopId=s;let T=document.createElement("style");l&&(T.nonce=l);let L=r??document.head;return L.appendChild(T),T.sheet&&T.sheet.insertRule(`
          [data-motion-pop-id="${s}"] {
            position: absolute !important;
            width: ${c}px !important;
            height: ${m}px !important;
            ${w}px !important;
            ${v}px !important;
          }
        `),()=>{n.current?.removeAttribute("data-motion-pop-id"),L.contains(T)&&L.removeChild(T)}},[t]),(0,Zu.jsx)(nn,{isPresent:t,childRef:n,sizeRef:u,pop:i,children:i===!1?e:ls.cloneElement(e,{ref:f})})}var Yu=({children:e,initial:t,isPresent:a,onExitComplete:o,custom:r,presenceAffectsLayout:i,mode:s,anchorX:n,anchorY:u,root:l})=>{let d=ve(rm),f=(0,wt.useId)(),c=(0,wt.useRef)(a),m=(0,wt.useRef)(o);Pe(()=>{c.current=a,m.current=o});let p=!0,x=(0,wt.useMemo)(()=>(p=!1,{id:f,initial:t,isPresent:a,custom:r,onExitComplete:h=>{d.set(h,!0);for(let I of d.values())if(!I)return;o&&o()},register:h=>(d.set(h,!1),()=>{d.delete(h),!c.current&&!d.size&&m.current?.()})}),[a,d,o]);return i&&p&&(x={...x}),(0,wt.useMemo)(()=>{d.forEach((h,I)=>d.set(I,!1))},[a]),$u.useEffect(()=>{!a&&!d.size&&o&&o()},[a]),e=(0,ln.jsx)(_u,{pop:s==="popLayout",isPresent:a,anchorX:n,anchorY:u,root:l,children:e}),(0,ln.jsx)(pt.Provider,{value:x,children:e})};function rm(){return new Map}var bt=P("react");function us(e=!0){let t=(0,bt.useContext)(pt);if(t===null)return[!0,null];let{isPresent:a,onExitComplete:o,register:r}=t,i=(0,bt.useId)();(0,bt.useEffect)(()=>{if(e)return r(i)},[e]);let s=(0,bt.useCallback)(()=>e&&o&&o(i),[i,o,e]);return!a&&o?[!1,s]:[!0]}var ds=P("react"),Ra=e=>e.key||"";function un(e){let t=[];return ds.Children.forEach(e,a=>{(0,ds.isValidElement)(a)&&t.push(a)}),t}var lt=({children:e,custom:t,initial:a=!0,onExitComplete:o,presenceAffectsLayout:r=!0,mode:i="sync",propagate:s=!1,anchorX:n="left",anchorY:u="top",root:l})=>{let[d,f]=us(s),c=(0,Qe.useMemo)(()=>un(e),[e]),m=s&&!d?[]:c.map(Ra),p=(0,Qe.useRef)(!0),x=ve(()=>new Map),h=(0,Qe.useRef)(new Set),[I,C]=(0,Qe.useState)(c),[y,w]=(0,Qe.useState)(c);Pe(()=>{s&&!d&&!y.length&&f?.()},[d,s,y.length,f]),Pe(()=>{p.current=!1;for(let L=0;L<y.length;L++){let S=Ra(y[L]);m.includes(S)?(x.delete(S),h.current.delete(S)):x.get(S)!==!0&&x.set(S,!1)}},[y,m.length,m.join("-")]);let v=[];if(c!==I){let L=[...c],S=0;for(let A of y){let F=m.indexOf(Ra(A));F===-1?(L.splice(S++,0,A),v.push(A)):S=F+v.length+1}return v.every(A=>x.get(Ra(A)))?L=c:i==="wait"&&(L=v),w(un(L)),C(c),null}let{forceRender:T}=(0,Qe.useContext)(et);return(0,Ho.jsx)(Ho.Fragment,{children:y.map(L=>{let S=Ra(L),A=s&&!d?!1:c===y||m.includes(S),F=()=>{if(h.current.has(S))return;if(x.has(S))h.current.add(S),x.set(S,!0);else return;let G=!0;x.forEach(oe=>{oe||(G=!1)}),G&&(T?.(),C([]),s&&f?.(),o&&o())};return(0,Ho.jsx)(Yu,{isPresent:A,initial:!p.current||a?void 0:!1,custom:t,presenceAffectsLayout:r,mode:i,root:l,onExitComplete:A?void 0:F,anchorX:n,anchorY:u,children:L},S)})})};var od=P("react/jsx-runtime"),aa=P("react");var Qu=P("react"),Ju=(0,Qu.createContext)(null);var Go=P("react");var ed=P("react");function td(){let e=(0,ed.useRef)(!1);return Pe(()=>(e.current=!0,()=>{e.current=!1}),[]),e}function ad(){let e=td(),[t,a]=(0,Go.useState)(0),o=(0,Go.useCallback)(()=>{e.current&&a(t+1)},[t]);return[(0,Go.useCallback)(()=>k.postRender(o),[o]),t]}var rd=e=>e===!0,sm=e=>rd(e===!0)||e==="id",dn=({children:e,id:t,inherit:a=!0})=>{let o=(0,aa.useContext)(et),r=(0,aa.useContext)(Ju),[i,s]=ad(),n=(0,aa.useRef)(null),u=o.id||r;n.current===null&&(sm(a)&&u&&(t=t?u+"-"+t:u),n.current={id:t,group:rd(a)?o.group||is():is()});let l=(0,aa.useMemo)(()=>({...n.current,forceRender:i}),[s]);return(0,od.jsx)(et.Provider,{value:l,children:e})};var sd=P("react"),fs=(0,sd.createContext)({strict:!1});var id={animation:["animate","variants","whileHover","whileTap","exit","whileInView","whileFocus","whileDrag"],exit:["exit"],drag:["drag","dragControls"],focus:["whileFocus"],hover:["whileHover","onHoverStart","onHoverEnd"],tap:["whileTap","onTap","onTapStart","onTapCancel"],pan:["onPan","onPanStart","onPanSessionStart","onPanEnd"],inView:["whileInView","onViewportEnter","onViewportLeave"],layout:["layout","layoutId"]},nd=!1;function im(){if(nd)return;let e={};for(let t in id)e[t]={isEnabled:a=>id[t].some(o=>!!a[o])};Fo(e),nd=!0}function cs(){return im(),Wi()}function ld(e){let t=cs();for(let a in e)t[a]={...t[a],...e[a]};Fo(t)}var gs=P("react/jsx-runtime");var Ea=P("react");var ud=P("react"),vt=(0,ud.createContext)({});var ps=P("react");function dd(e,t){if(yt(e)){let{initial:a,animate:o}=e;return{initial:a===!1||it(a)?a:void 0,animate:it(o)?o:void 0}}return e.inherit!==!1?t:{}}function cd(e){let{initial:t,animate:a}=dd(e,(0,ps.useContext)(vt));return(0,ps.useMemo)(()=>({initial:t,animate:a}),[fd(t),fd(a)])}function fd(e){return Array.isArray(e)?e.join(" "):e}var Va=P("react");var pd=P("react");var Fa=()=>({style:{},transform:{},transformOrigin:{},vars:{}});function fn(e,t,a){for(let o in t)!V(t[o])&&!Bo(o,a)&&(e[o]=t[o])}function nm({transformTemplate:e},t){return(0,pd.useMemo)(()=>{let a=Fa();return jt(a,t,e),Object.assign({},a.vars,a.style)},[t])}function lm(e,t){let a=e.style||{},o={};return fn(o,a,e),Object.assign(o,nm(e,t)),o}function md(e,t){let a={},o=lm(e,t);return e.drag&&e.dragListener!==!1&&(a.draggable=!1,o.userSelect=o.WebkitUserSelect=o.WebkitTouchCallout="none",o.touchAction=e.drag===!0?"none":`pan-${e.drag==="x"?"y":"x"}`),e.tabIndex===void 0&&(e.onTap||e.onTapStart||e.whileTap)&&(a.tabIndex=0),a.style=o,a}var hd=P("react");var ms=()=>({...Fa(),attrs:{}});function xd(e,t,a,o){let r=(0,hd.useMemo)(()=>{let i=ms();return bo(i,t,Eo(o),e.transformTemplate,e.style),{...i.attrs,style:{...i.style}}},[t]);if(e.style){let i={};fn(i,e.style,e),r.style={...i,...r.style}}return r}var um=new Set(["animate","exit","variants","initial","style","values","transition","transformTemplate","custom","inherit","onBeforeLayoutMeasure","onAnimationStart","onAnimationComplete","onUpdate","onDragStart","onDrag","onDragEnd","onMeasureDragConstraints","onDirectionLock","onDragTransitionEnd","_dragX","_dragY","onHoverStart","onHoverEnd","onViewportEnter","onViewportLeave","globalTapTarget","propagate","ignoreStrict","viewport"]);function zo(e){return e.startsWith("while")||e.startsWith("drag")&&e!=="draggable"||e.startsWith("layout")||e.startsWith("onTap")||e.startsWith("onPan")||e.startsWith("onLayout")||um.has(e)}function dm(e,t){return e.startsWith("on")?!zo(e):t?.(e)??!zo(e)}function gd(e,t,a,o){let r={};for(let i in e)i==="values"&&typeof e.values=="object"||V(e[i])||(dm(i,o)||a===!0&&zo(i)||!t&&!zo(i)||e.draggable&&i.startsWith("onDrag"))&&(r[i]=e[i]);return r}var Ld=["animate","circle","defs","desc","ellipse","g","image","line","filter","marker","mask","metadata","path","pattern","polygon","polyline","rect","stop","switch","symbol","svg","text","tspan","use","view"];function Ba(e){return typeof e!="string"||e.includes("-")?!1:!!(Ld.indexOf(e)>-1||/[A-Z]/u.test(e))}function Id(e,t,a,{latestValues:o},r,i=!1,s,n){let l=(s??Ba(e)?xd:md)(t,o,r,e),d=gd(t,typeof e=="string",i,n),f=e!==Va.Fragment?{...d,...l,ref:a}:{},{children:c}=t,m=(0,Va.useMemo)(()=>V(c)?c.get():c,[c]);return(0,Va.createElement)(e,{...f,children:m})}var cn=P("react");function fm({scrapeMotionValuesFromProps:e,createRenderState:t},a,o,r){return{latestValues:cm(a,o,r,e),renderState:t()}}function cm(e,t,a,o){let r={},i=o(e,{});for(let c in i)r[c]=Jt(i[c]);let{initial:s,animate:n}=e,u=yt(e),l=Mo(e);t&&l&&!u&&e.inherit!==!1&&(s===void 0&&(s=t.initial),n===void 0&&(n=t.animate));let d=a?a.initial===!1:!1;d=d||s===!1;let f=d?n:s;if(f&&typeof f!="boolean"&&!st(f)){let c=Array.isArray(f)?f:[f];for(let m=0;m<c.length;m++){let p=Io(e,c[m]);if(p){let{transitionEnd:x,transition:h,...I}=p;for(let C in I){let y=I[C];if(Array.isArray(y)){let w=d?y.length-1:0;y=y[w]}y!==null&&(r[C]=y)}for(let C in x)r[C]=x[C]}}}return r}var hs=e=>(t,a)=>{let o=(0,cn.useContext)(vt),r=(0,cn.useContext)(pt),i=()=>fm(e,t,o,r);return a?i():ve(i)};var Cd=hs({scrapeMotionValuesFromProps:Yt,createRenderState:Fa});var yd=hs({scrapeMotionValuesFromProps:Oo,createRenderState:ms});var Sd=Symbol.for("motionComponentSymbol");var oa=P("react");function wd(e,t,a){let o=(0,oa.useRef)(a);(0,oa.useInsertionEffect)(()=>{o.current=a});let r=(0,oa.useRef)(null);return(0,oa.useCallback)(i=>{i&&e.onMount?.(i),t&&(i?t.mount(i):t.unmount());let s=o.current;if(typeof s=="function")if(i){let n=s(i);typeof n=="function"&&(r.current=n)}else r.current?(r.current(),r.current=null):s(i);else s&&(s.current=i)},[t])}var ge=P("react");var bd=P("react"),xs=(0,bd.createContext)({});function Pt(e){return e&&typeof e=="object"&&Object.prototype.hasOwnProperty.call(e,"current")}function vd(e,t,a,o,r,i){let{visualElement:s}=(0,ge.useContext)(vt),n=(0,ge.useContext)(fs),u=(0,ge.useContext)(pt),l=(0,ge.useContext)(Ye),d=l.reducedMotion,f=l.skipAnimations,c=(0,ge.useRef)(null),m=(0,ge.useRef)(!1);o=o||n.renderer,!c.current&&o&&(c.current=o(e,{visualState:t,parent:s,props:a,presenceContext:u,blockInitialAnimation:u?u.initial===!1:!1,reducedMotionConfig:d,skipAnimations:f,isSVG:i}),m.current&&c.current&&(c.current.manuallyAnimateOnMount=!0));let p=c.current,x=(0,ge.useContext)(xs);p&&!p.projection&&r&&(p.type==="html"||p.type==="svg")&&pm(c.current,a,r,x);let h=(0,ge.useRef)(!1);(0,ge.useInsertionEffect)(()=>{p&&h.current&&p.update(a,u)});let I=a[Co],C=(0,ge.useRef)(!!I&&typeof window<"u"&&!window.MotionHandoffIsComplete?.(I)&&window.MotionHasOptimisedAnimation?.(I));return Pe(()=>{!m.current||!p||(p.animationState?.animateChanges(),p.enteringChildren=void 0)},[]),Pe(()=>{m.current=!0,p&&(h.current=!0,window.MotionIsMounted=!0,p.updateFeatures(),p.scheduleRenderMicrotask(),C.current&&p.animationState&&p.animationState.animateChanges())}),(0,ge.useEffect)(()=>{p&&(!C.current&&p.animationState&&p.animationState.animateChanges(),C.current&&(queueMicrotask(()=>{window.MotionHandoffMarkAsComplete?.(I)}),C.current=!1),p.enteringChildren=void 0)}),p}function pm(e,t,a,o){let{layoutId:r,layout:i,drag:s,dragConstraints:n,layoutScroll:u,layoutRoot:l,layoutAnchor:d,layoutCrossfade:f}=t;e.projection=new a(e.latestValues,t["data-framer-portal-id"]?void 0:Pd(e.parent)),e.projection.setOptions({layoutId:r,layout:i,alwaysMeasureLayout:!!s||n&&Pt(n),visualElement:e,animationType:typeof i=="string"?i:"both",initialPromotionConfig:o,crossfade:f,layoutScroll:u,layoutRoot:l,layoutAnchor:d})}function Pd(e){if(e)return e.options.allowProjection!==!1?e.projection:Pd(e.parent)}function Ls(e,{forwardMotionProps:t=!1,type:a}={},o,r){o&&ld(o);let i=a?a==="svg":Ba(e),s=i?yd:Cd;function n(l,d){let f,c={...(0,Ea.useContext)(Ye),...l,layoutId:mm(l)},{isStatic:m,isValidProp:p}=c,x=cd(l),h=s(l,m);if(!m&&typeof window<"u"){hm(c,o);let I=xm(c);f=I.MeasureLayout,x.visualElement=vd(e,h,c,r,I.ProjectionNode,i)}return(0,gs.jsxs)(vt.Provider,{value:x,children:[f&&x.visualElement?(0,gs.jsx)(f,{visualElement:x.visualElement,...c}):null,Id(e,l,wd(h,x.visualElement,d),h,m,t,i,p)]})}n.displayName=`motion.${typeof e=="string"?e:`create(${e.displayName??e.name??""})`}`;let u=(0,Ea.forwardRef)(n);return u[Sd]=e,u}function mm({layoutId:e}){let t=(0,Ea.useContext)(et).id;return t&&e!==void 0?t+"-"+e:e}function hm(e,t){let a=(0,Ea.useContext)(fs).strict}function xm(e){let t=cs(),{drag:a,layout:o}=t;if(!a&&!o)return{};let r={...a,...o};return{MeasureLayout:a?.isEnabled(e)||o?.isEnabled(e)?r.MeasureLayout:void 0,ProjectionNode:r.ProjectionNode}}function Td(e,t){if(typeof Proxy>"u")return Ls;let a=new Map,o=(i,s)=>Ls(i,s,e,t),r=(i,s)=>o(i,s);return new Proxy(r,{get:(i,s)=>s==="create"?o:(a.has(s)||a.set(s,Ls(s,void 0,e,t)),a.get(s))})}var Ad=P("react");var kd=(e,t)=>t.isSVG??Ba(e)?new qo(t):new Vo(t,{allowProjection:e!==Ad.Fragment});var Is=class extends ne{constructor(t){super(t),t.animationState||(t.animationState=Ki(t))}updateAnimationControlsSubscription(){let{animate:t}=this.node.getProps();st(t)&&(this.unmountControls=t.subscribe(this.node))}mount(){this.updateAnimationControlsSubscription()}update(){let{animate:t}=this.node.getProps(),{animate:a}=this.node.prevProps||{};t!==a&&this.updateAnimationControlsSubscription()}unmount(){this.node.animationState.reset(),this.unmountControls?.()}};var gm=0,Cs=class extends ne{constructor(){super(...arguments),this.id=gm++}update(){let{presenceContext:t,prevPresenceContext:a,animationState:o}=this.node;if(!t||!o)return;let{isPresent:r,onExitComplete:i}=t,s=a?.isPresent;if(r===s)return;if(r&&s===!1){if(this.exit===!0){let{initial:u}=this.node.getProps();if(u&&!Array.isArray(u)){let{transition:l,transitionEnd:d,...f}=Se(this.node,u)||{};for(let c in f)this.node.getValue(c)?.jump(f[c])}this.node.blockInitialAnimation=!1,o.reset(),o.animateChanges()}else o.setActive("exit",!1);this.exit=void 0;return}let n=this.exit=o.setActive("exit",!r);i&&!r&&n.then(()=>{this.exit===n&&(this.exit=!0,i(this.id))})}mount(){let{register:t,onExitComplete:a}=this.node.presenceContext||{};a&&a(this.id),t&&(this.unmount=t(this.id))}unmount(){}};var Md={animation:{Feature:Is},exit:{Feature:Cs}};function ra(e){return{point:{x:e.pageX,y:e.pageY}}}var Dd=e=>t=>Xt(t)&&e(t,ra(t));function Tt(e,t,a,o){return $e(e,t,Dd(a),o)}var ys=({current:e})=>e?e.ownerDocument.defaultView:null;var Rd=(e,t)=>Math.abs(e-t);function Fd(e,t){let a=Rd(e.x,t.x),o=Rd(e.y,t.y);return Math.sqrt(a**2+o**2)}var Bd=new Set(["auto","scroll"]),Oa=class{constructor(t,a,{transformPagePoint:o,contextWindow:r=window,dragSnapToOrigin:i=!1,distanceThreshold:s=3,element:n}={}){if(this.startEvent=null,this.lastMoveEvent=null,this.lastMoveEventInfo=null,this.lastRawMoveEventInfo=null,this.handlers={},this.contextWindow=window,this.scrollPositions=new Map,this.removeScrollListeners=null,this.onElementScroll=p=>{this.handleScroll(p.target)},this.onWindowScroll=()=>{this.handleScroll(window)},this.updatePoint=()=>{if(!(this.lastMoveEvent&&this.lastMoveEventInfo))return;this.hasPendingMove=!1,this.lastRawMoveEventInfo&&(this.lastMoveEventInfo=Ss(this.lastRawMoveEventInfo,this.transformPagePoint));let p=pn(this.lastMoveEventInfo,this.history),x=this.startEvent!==null,h=Fd(p.offset,{x:0,y:0})>=this.distanceThreshold;if(!x&&!h)return;let{point:I}=p;this.history.push({...I,timestamp:N.now()});let{onStart:C,onMove:y}=this.handlers;x||(C&&C(this.lastMoveEvent,p),this.startEvent=this.lastMoveEvent),y&&y(this.lastMoveEvent,p)},this.handlePointerMove=(p,x)=>{this.lastMoveEvent=p,this.lastRawMoveEventInfo=x,this.lastMoveEventInfo=Ss(x,this.transformPagePoint),this.hasPendingMove=!0,k.update(this.updatePoint,!0)},this.handlePointerUp=(p,x)=>{this.hasPendingMove&&this.updatePoint(),this.end();let{onEnd:h,onSessionEnd:I,resumeAnimation:C}=this.handlers;if((this.dragSnapToOrigin||!this.startEvent)&&C&&C(),!(this.lastMoveEvent&&this.lastMoveEventInfo))return;let y=pn(p.type==="pointercancel"?this.lastMoveEventInfo:Ss(x,this.transformPagePoint),this.history);this.startEvent&&h&&h(p,y),I&&I(p,y)},!Xt(t))return;this.dragSnapToOrigin=i,this.handlers=a,this.transformPagePoint=o,this.distanceThreshold=s,this.contextWindow=r||window;let u=ra(t),l=Ss(u,this.transformPagePoint),{point:d}=l,{timestamp:f}=W;this.history=[{...d,timestamp:f}];let{onSessionStart:c}=a;c&&c(t,pn(l,this.history));let m={passive:!0,capture:!0};this.removeListeners=Oe(Tt(this.contextWindow,"pointermove",this.handlePointerMove,m),Tt(this.contextWindow,"pointerup",this.handlePointerUp,m),Tt(this.contextWindow,"pointercancel",this.handlePointerUp,m)),n&&this.startScrollTracking(n)}startScrollTracking(t){let a=t.parentElement;for(;a;){let o=getComputedStyle(a);(Bd.has(o.overflowX)||Bd.has(o.overflowY))&&this.scrollPositions.set(a,{x:a.scrollLeft,y:a.scrollTop}),a=a.parentElement}this.scrollPositions.set(window,{x:window.scrollX,y:window.scrollY}),window.addEventListener("scroll",this.onElementScroll,{capture:!0}),window.addEventListener("scroll",this.onWindowScroll),this.removeScrollListeners=()=>{window.removeEventListener("scroll",this.onElementScroll,{capture:!0}),window.removeEventListener("scroll",this.onWindowScroll)}}handleScroll(t){let a=this.scrollPositions.get(t);if(!a)return;let o=t===window,r=o?{x:window.scrollX,y:window.scrollY}:{x:t.scrollLeft,y:t.scrollTop},i={x:r.x-a.x,y:r.y-a.y};i.x===0&&i.y===0||(o?this.lastMoveEventInfo&&(this.lastMoveEventInfo.point.x+=i.x,this.lastMoveEventInfo.point.y+=i.y):this.history.length>0&&(this.history[0].x-=i.x,this.history[0].y-=i.y),this.scrollPositions.set(t,r),k.update(this.updatePoint,!0))}updateHandlers(t){this.handlers=t}end(){this.removeListeners&&this.removeListeners(),this.removeScrollListeners&&this.removeScrollListeners(),this.scrollPositions.clear(),ue(this.updatePoint)}};function Ss(e,t){return t?{point:t(e.point)}:e}function Vd(e,t){return{x:e.x-t.x,y:e.y-t.y}}function pn({point:e},t){return{point:e,delta:Vd(e,Ed(t)),offset:Vd(e,Lm(t)),velocity:Im(t,.1)}}function Lm(e){return e[0]}function Ed(e){return e[e.length-1]}function Im(e,t){if(e.length<2)return{x:0,y:0};let a=e.length-1,o=null,r=Ed(e);for(;a>=0&&(o=e[a],!(r.timestamp-o.timestamp>$(t)));)a--;if(!o)return{x:0,y:0};o===e[0]&&e.length>2&&r.timestamp-o.timestamp>$(t)*2&&(o=e[1]);let i=le(r.timestamp-o.timestamp);if(i===0)return{x:0,y:0};let s={x:(r.x-o.x)/i,y:(r.y-o.y)/i};return s.x===1/0&&(s.x=0),s.y===1/0&&(s.y=0),s}function Hd(e,{min:t,max:a},o){return t!==void 0&&e<t?e=o?D(t,e,o.min):Math.max(e,t):a!==void 0&&e>a&&(e=o?D(a,e,o.max):Math.min(e,a)),e}function Od(e,t,a){return{min:t!==void 0?e.min+t:void 0,max:a!==void 0?e.max+a-(e.max-e.min):void 0}}function Gd(e,{top:t,left:a,bottom:o,right:r}){return{x:Od(e.x,a,r),y:Od(e.y,t,o)}}function qd(e,t){let a=t.min-e.min,o=t.max-e.max;return t.max-t.min<e.max-e.min&&([a,o]=[o,a]),{min:a,max:o}}function zd(e,t){return{x:qd(e.x,t.x),y:qd(e.y,t.y)}}function Wd(e,t){let a=.5,o=ae(e),r=ae(t);return r>o?a=Te(t.min,t.max-o,e.min):o>r&&(a=Te(e.min,e.max-r,t.min)),se(0,1,a)}function jd(e,t){let a={};return t.min!==void 0&&(a.min=t.min-e.min),t.max!==void 0&&(a.max=t.max-e.min),a}var ws=.35;function Kd(e=ws){return e===!1?e=0:e===!0&&(e=ws),{x:Ud(e,"left","right"),y:Ud(e,"top","bottom")}}function Ud(e,t,a){return{min:Nd(e,t),max:Nd(e,a)}}function Nd(e,t){return typeof e=="number"?e:e[t]||0}var Cm=new WeakMap,vs=class{constructor(t){this.openDragLock=null,this.isDragging=!1,this.currentDirection=null,this.originPoint={x:0,y:0},this.constraints=!1,this.hasMutatedConstraints=!1,this.elastic=X(),this.latestPointerEvent=null,this.latestPanInfo=null,this.visualElement=t}start(t,{snapToCursor:a=!1,distanceThreshold:o}={}){let{presenceContext:r}=this.visualElement;if(r&&r.isPresent===!1)return;let i=f=>{a&&this.snapToCursor(f),this.stopAnimation()},s=(f,c)=>{let{drag:m,dragPropagation:p,onDragStart:x}=this.getProps();if(m&&!p&&(this.openDragLock&&this.openDragLock(),this.openDragLock=Ri(m),!this.openDragLock))return;this.latestPointerEvent=f,this.latestPanInfo=c,this.isDragging=!0,this.currentDirection=null,this.resolveConstraints(),this.visualElement.projection&&(this.visualElement.projection.isAnimationBlocked=!0,this.visualElement.projection.target=void 0),we(I=>{let C=this.getAxisMotionValue(I).get()||0;if(he.test(C)){let{projection:y}=this.visualElement;if(y&&y.layout){let w=y.layout.layoutBox[I];w&&(C=ae(w)*(parseFloat(C)/100))}}this.originPoint[I]=C}),x&&k.update(()=>x(f,c),!1,!0),Sa(this.visualElement,"transform");let{animationState:h}=this.visualElement;h&&h.setActive("whileDrag",!0)},n=(f,c)=>{this.latestPointerEvent=f,this.latestPanInfo=c;let{dragPropagation:m,dragDirectionLock:p,onDirectionLock:x,onDrag:h}=this.getProps();if(!m&&!this.openDragLock)return;let{offset:I}=c;if(p&&this.currentDirection===null){this.currentDirection=Sm(I),this.currentDirection!==null&&x&&x(this.currentDirection);return}this.updateAxis("x",c.point,I),this.updateAxis("y",c.point,I),this.visualElement.render(),h&&k.update(()=>h(f,c),!1,!0)},u=(f,c)=>{this.latestPointerEvent=f,this.latestPanInfo=c,this.stop(f,c),this.latestPointerEvent=null,this.latestPanInfo=null},l=()=>{let{dragSnapToOrigin:f}=this.getProps();(f||this.constraints)&&this.startAnimation({x:0,y:0})},{dragSnapToOrigin:d}=this.getProps();this.panSession=new Oa(t,{onSessionStart:i,onStart:s,onMove:n,onSessionEnd:u,resumeAnimation:l},{transformPagePoint:this.visualElement.getTransformPagePoint(),dragSnapToOrigin:d,distanceThreshold:o,contextWindow:ys(this.visualElement),element:this.visualElement.current})}stop(t,a){let o=t||this.latestPointerEvent,r=a||this.latestPanInfo,i=this.isDragging;if(this.cancel(),!i||!r||!o)return;let{velocity:s}=r;this.startAnimation(s);let{onDragEnd:n}=this.getProps();n&&k.postRender(()=>n(o,r))}cancel(){this.isDragging=!1;let{projection:t,animationState:a}=this.visualElement;t&&(t.isAnimationBlocked=!1),this.endPanSession();let{dragPropagation:o}=this.getProps();!o&&this.openDragLock&&(this.openDragLock(),this.openDragLock=null),a&&a.setActive("whileDrag",!1)}endPanSession(){this.panSession&&this.panSession.end(),this.panSession=void 0}updateAxis(t,a,o){let{drag:r}=this.getProps();if(!o||!bs(t,r,this.currentDirection))return;let i=this.getAxisMotionValue(t),s=this.originPoint[t]+o[t];this.constraints&&this.constraints[t]&&(s=Hd(s,this.constraints[t],this.elastic[t])),i.set(s)}resolveConstraints(){let{dragConstraints:t,dragElastic:a}=this.getProps(),o=this.visualElement.projection&&!this.visualElement.projection.layout?this.visualElement.projection.measure(!1):this.visualElement.projection?.layout,r=this.constraints;t&&Pt(t)?this.constraints||(this.constraints=this.resolveRefConstraints()):t&&o?this.constraints=Gd(o.layoutBox,t):this.constraints=!1,this.elastic=Kd(a),r!==this.constraints&&!Pt(t)&&o&&this.constraints&&!this.hasMutatedConstraints&&we(i=>{this.constraints!==!1&&this.getAxisMotionValue(i)&&(this.constraints[i]=jd(o.layoutBox[i],this.constraints[i]))})}resolveRefConstraints(){let{dragConstraints:t,onMeasureDragConstraints:a}=this.getProps();if(!t||!Pt(t))return!1;let o=t.current;ie(o!==null,"If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.","drag-constraints-ref");let{projection:r}=this.visualElement;if(!r||!r.layout)return!1;r.root&&(r.root.scroll=void 0,r.root.updateScroll());let i=Ai(o,r.root,this.visualElement.getTransformPagePoint()),s=zd(r.layout.layoutBox,i);if(a){let n=a(Si(s));this.hasMutatedConstraints=!!n,n&&(s=vo(n))}return s}startAnimation(t){let{drag:a,dragMomentum:o,dragElastic:r,dragTransition:i,dragSnapToOrigin:s,onDragTransitionEnd:n}=this.getProps(),u=this.constraints||{},l=we(d=>{if(!bs(d,a,this.currentDirection))return;let f=u&&u[d]||{};(s===!0||s===d)&&(f={min:0,max:0});let c=r?200:1e6,m=r?40:1e7,p={type:"inertia",velocity:o?t[d]:0,bounceStiffness:c,bounceDamping:m,timeConstant:750,restDelta:1,restSpeed:10,...i,...f};return this.startAxisValueAnimation(d,p)});return Promise.all(l).then(n)}startAxisValueAnimation(t,a){let o=this.getAxisMotionValue(t);return Sa(this.visualElement,t),o.start(ot(t,o,0,a,this.visualElement,!1))}stopAnimation(){we(t=>this.getAxisMotionValue(t).stop())}getAxisMotionValue(t){let a=`_drag${t.toUpperCase()}`,r=this.visualElement.getProps()[a];return r||this.visualElement.getValue(t,this.visualElement.latestValues[t]??0)}snapToCursor({clientX:t,clientY:a}){let{drag:o}=this.getProps(),r={x:t,y:a},i=this.visualElement.getTransformPagePoint()?.(r)||r,s=this.visualElement.measureViewportBox();we(n=>{if(!bs(n,o,this.currentDirection))return;let u=this.getAxisMotionValue(n),{min:l,max:d}=s[n];u.set((u.get()||0)+i[n]-D(l,d,.5))})}scalePositionWithinConstraints(){if(!this.visualElement.current)return;let{drag:t,dragConstraints:a}=this.getProps(),{projection:o}=this.visualElement;if(!Pt(a)||!o||!this.constraints)return;this.stopAnimation();let r=this.constraints,i={x:0,y:0};we(n=>{let u=this.getAxisMotionValue(n).get();i[n]=Wd({min:u,max:u},r[n])});let{transformTemplate:s}=this.visualElement.getProps();this.visualElement.current.style.transform=s?s({},""):"none",o.root&&o.root.updateScroll(),o.updateLayout(),this.constraints=!1,this.resolveConstraints(),we(n=>{let u=this.getAxisMotionValue(n);if(!bs(n,t,null)||!u.get())return;let{min:l,max:d}=this.constraints[n];u.set(D(l,d,i[n]))}),this.visualElement.render()}addListeners(){if(!this.visualElement.current)return;Cm.set(this.visualElement,this);let t=this.visualElement.current,a=Tt(t,"pointerdown",l=>{let{drag:d,dragListener:f=!0}=this.getProps(),c=l.target,m=c!==t&&Ei(c);d&&f&&!m&&this.start(l)}),o,r=()=>{let{dragConstraints:l}=this.getProps();Pt(l)&&l.current&&(this.constraints=this.resolveRefConstraints(),o||(o=ym(t,l.current,()=>this.scalePositionWithinConstraints())))},{projection:i}=this.visualElement,s=i.addEventListener("measure",r);i&&!i.layout&&(i.root&&i.root.updateScroll(),i.updateLayout()),k.read(r);let n=$e(window,"resize",()=>this.scalePositionWithinConstraints()),u=i.addEventListener("didUpdate",(({delta:l,hasLayoutChanged:d})=>{this.isDragging&&d&&(we(f=>{let c=this.getAxisMotionValue(f);c&&(this.originPoint[f]+=l[f].translate,c.set(c.get()+l[f].translate))}),this.visualElement.render())}));return()=>{n(),a(),s(),u&&u(),o&&o()}}getProps(){let t=this.visualElement.getProps(),{drag:a=!1,dragDirectionLock:o=!1,dragPropagation:r=!1,dragConstraints:i=!1,dragElastic:s=ws,dragMomentum:n=!0}=t;return{...t,drag:a,dragDirectionLock:o,dragPropagation:r,dragConstraints:i,dragElastic:s,dragMomentum:n}}};function Xd(e){let t=!0;return()=>{if(t){t=!1;return}e()}}function ym(e,t,a){let o=$r(e,Xd(a)),r=$r(t,Xd(a));return()=>{o(),r()}}function bs(e,t,a){return(t===!0||t===e)&&(a===null||a===e)}function Sm(e,t=10){let a=null;return Math.abs(e.y)>t?a="y":Math.abs(e.x)>t&&(a="x"),a}var Ps=class extends ne{constructor(t){super(t),this.removeGroupControls=Q,this.removeListeners=Q,this.controls=new vs(t)}mount(){let{dragControls:t}=this.node.getProps();t&&(this.removeGroupControls=t.subscribe(this.controls)),this.removeListeners=this.controls.addListeners()||Q}update(){let{dragControls:t}=this.node.getProps(),{dragControls:a}=this.node.prevProps||{};t!==a&&(this.removeGroupControls(),t&&(this.removeGroupControls=t.subscribe(this.controls)))}unmount(){this.removeGroupControls(),this.removeListeners(),this.controls.isDragging||this.controls.endPanSession()}};var mn=e=>(t,a)=>{e&&k.update(()=>e(t,a),!1,!0)},Ts=class extends ne{constructor(){super(...arguments),this.removePointerDownListener=Q}onPointerDown(t){this.session=new Oa(t,this.createPanHandlers(),{transformPagePoint:this.node.getTransformPagePoint(),contextWindow:ys(this.node)})}createPanHandlers(){let{onPanSessionStart:t,onPanStart:a,onPan:o,onPanEnd:r}=this.node.getProps();return{onSessionStart:mn(t),onStart:mn(a),onMove:mn(o),onEnd:(i,s)=>{delete this.session,r&&k.postRender(()=>r(i,s))}}}mount(){this.removePointerDownListener=Tt(this.node.current,"pointerdown",t=>this.onPointerDown(t))}update(){this.session&&this.session.updateHandlers(this.createPanHandlers())}unmount(){this.removePointerDownListener(),this.session&&this.session.end()}};var Zd=P("react/jsx-runtime");var Wo=P("react");var hn=!1,xn=class extends Wo.Component{componentDidMount(){let{visualElement:t,layoutGroup:a,switchLayoutGroup:o,layoutId:r}=this.props,{projection:i}=t;i&&(a.group&&a.group.add(i),o&&o.register&&r&&o.register(i),hn&&i.root.didUpdate(),i.addEventListener("animationComplete",()=>{this.safeToRemove()}),i.setOptions({...i.options,layoutDependency:this.props.layoutDependency,onExitComplete:()=>this.safeToRemove()})),ea.hasEverUpdated=!0}getSnapshotBeforeUpdate(t){let{layoutDependency:a,visualElement:o,drag:r,isPresent:i}=this.props,{projection:s}=o;return s&&(s.isPresent=i,t.layoutDependency!==a&&s.setOptions({...s.options,layoutDependency:a}),hn=!0,r||t.layoutDependency!==a||a===void 0||t.isPresent!==i?s.willUpdate():this.safeToRemove(),t.isPresent!==i&&(i?s.promote():s.relegate()||k.postRender(()=>{let n=s.getStack();(!n||!n.members.length)&&this.safeToRemove()}))),null}componentDidUpdate(){let{visualElement:t,layoutAnchor:a}=this.props,{projection:o}=t;o&&(o.options.layoutAnchor=a,o.root.didUpdate(),Kt.postRender(()=>{!o.currentAnimation&&o.isLead()&&this.safeToRemove()}))}componentWillUnmount(){let{visualElement:t,layoutGroup:a,switchLayoutGroup:o}=this.props,{projection:r}=t;hn=!0,r&&(r.scheduleCheckAfterUnmount(),a&&a.group&&a.group.remove(r),o&&o.deregister&&o.deregister(r))}safeToRemove(){let{safeToRemove:t}=this.props;t&&t()}render(){return null}};function As(e){let[t,a]=us(),o=(0,Wo.useContext)(et);return(0,Zd.jsx)(xn,{...e,layoutGroup:o,switchLayoutGroup:(0,Wo.useContext)(xs),isPresent:t,safeToRemove:a})}var _d={pan:{Feature:Ts},drag:{Feature:Ps,ProjectionNode:No,MeasureLayout:As}};function $d(e,t,a){let{props:o}=e;e.animationState&&o.whileHover&&e.animationState.setActive("whileHover",a==="Start");let r="onHover"+a,i=o[r];i&&k.postRender(()=>i(t,ra(t)))}var ks=class extends ne{mount(){let{current:t}=this.node;t&&(this.unmount=Fi(t,(a,o)=>($d(this.node,o,"Start"),r=>$d(this.node,r,"End"))))}unmount(){}};var Ms=class extends ne{constructor(){super(...arguments),this.isActive=!1}onFocus(){let t=!1;try{t=this.node.current.matches(":focus-visible")}catch{t=!0}!t||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!0),this.isActive=!0)}onBlur(){!this.isActive||!this.node.animationState||(this.node.animationState.setActive("whileFocus",!1),this.isActive=!1)}mount(){this.unmount=Oe($e(this.node.current,"focus",()=>this.onFocus()),$e(this.node.current,"blur",()=>this.onBlur()))}unmount(){}};function Yd(e,t,a){let{props:o}=e;if(e.current instanceof HTMLButtonElement&&e.current.disabled)return;e.animationState&&o.whileTap&&e.animationState.setActive("whileTap",a==="Start");let r="onTap"+(a==="End"?"":a),i=o[r];i&&k.postRender(()=>i(t,ra(t)))}var Ds=class extends ne{mount(){let{current:t}=this.node;if(!t)return;let{globalTapTarget:a,propagate:o}=this.node.props;this.unmount=qi(t,(r,i)=>(Yd(this.node,i,"Start"),(s,{success:n})=>Yd(this.node,s,n?"End":"Cancel")),{useGlobalTarget:a,stopPropagation:o?.tap===!1})}unmount(){}};var Ln=new WeakMap,gn=new WeakMap,wm=e=>{let t=Ln.get(e.target);t&&t(e)},bm=e=>{e.forEach(wm)};function vm({root:e,...t}){let a=e||document;gn.has(a)||gn.set(a,{});let o=gn.get(a),r=JSON.stringify(t);return o[r]||(o[r]=new IntersectionObserver(bm,{root:e,...t})),o[r]}function Qd(e,t,a){let o=vm(t);return Ln.set(e,a),o.observe(e),()=>{Ln.delete(e),o.unobserve(e)}}var Pm={some:0,all:1},Rs=class extends ne{constructor(){super(...arguments),this.hasEnteredView=!1,this.isInView=!1}startObserver(){this.stopObserver?.();let{viewport:t={}}=this.node.getProps(),{root:a,margin:o,amount:r="some",once:i}=t,s={root:a?a.current:void 0,rootMargin:o,threshold:typeof r=="number"?r:Pm[r]},n=u=>{let{isIntersecting:l}=u;if(this.isInView===l||(this.isInView=l,i&&!l&&this.hasEnteredView))return;l&&(this.hasEnteredView=!0),this.node.animationState&&this.node.animationState.setActive("whileInView",l);let{onViewportEnter:d,onViewportLeave:f}=this.node.getProps(),c=l?d:f;c&&c(u)};this.stopObserver=Qd(this.node.current,s,n)}mount(){this.startObserver()}update(){if(typeof IntersectionObserver>"u")return;let{props:t,prevProps:a}=this.node;["amount","margin","root"].some(Tm(t,a))&&this.startObserver()}unmount(){this.stopObserver?.(),this.hasEnteredView=!1,this.isInView=!1}};function Tm({viewport:e={}},{viewport:t={}}={}){return a=>e[a]!==t[a]}var Jd={inView:{Feature:Rs},tap:{Feature:Ds},focus:{Feature:Ms},hover:{Feature:ks}};var ef={layout:{ProjectionNode:No,MeasureLayout:As}};var tf={...Md,...Jd,..._d,...ef};var j=Td(tf,kd);var qa=P("react");function sa(e){let t=ve(()=>fe(e)),{isStatic:a}=(0,qa.useContext)(Ye);if(a){let[,o]=(0,qa.useState)(e);(0,qa.useEffect)(()=>t.on("change",o),[])}return t}function Fs(e,t){let a=sa(t()),o=()=>a.set(t());return o(),Pe(()=>{let r=()=>k.preRender(o,!1,!0),i=e.map(s=>s.on("change",r));return()=>{i.forEach(s=>s()),ue(o)}}),a}var Bs=P("react");function af(e){zt.current=[],e();let t=Fs(zt.current,e);return zt.current=void 0,t}function Ua(e,t,a,o){if(typeof e=="function")return af(e);if(a!==void 0&&!Array.isArray(a)&&typeof t!="function")return Am(e,t,a,o);let s=typeof t=="function"?t:Ui(t,a,o),n=Array.isArray(e)?of(e,s):of([e],([l])=>s(l)),u=Array.isArray(e)?void 0:e.accelerate;if(u&&!u.isTransformed&&typeof t!="function"&&Array.isArray(a)&&o?.clamp!==!1){let l=o?.ease;n.accelerate={...u,times:[0,...t,1],keyframes:[a[0],...a,a[a.length-1]],isTransformed:!0,...l?{ease:Array.isArray(l)?[l[0],...l]:l}:{}}}return n}function of(e,t){let a=ve(()=>[]);return Fs(e,()=>{a.length=0;let o=e.length;for(let r=0;r<o;r++)a[r]=e[r].get();return t(a)})}function Am(e,t,a,o){let r=ve(()=>Object.keys(a)),i=ve(()=>({}));for(let s of r)i[s]=Ua(e,t,a[s],o);return i}function rf(e,t,a){let{isStatic:o}=(0,Bs.useContext)(Ye),r=()=>V(e)?e.get():e;if(o)return Ua(r);let i=sa(r());return(0,Bs.useInsertionEffect)(()=>a(i,e,t),[i,JSON.stringify(t)]),i}function Vs(e,t={}){return rf(e,t,Ni)}var sf=P("react");function At(){!_t.current&&Do();let[e]=(0,sf.useState)(St.current);return e}function jo(e){return typeof e=="object"&&!Array.isArray(e)}function Es(e,t,a,o){return e==null?[]:typeof e=="string"&&jo(t)?Wt(e,a,o):e instanceof NodeList?Array.from(e):Array.isArray(e)?e.filter(r=>r!=null):[e]}function nf(e,t,a){return e*(t+1)+a*t}function In(e,t,a,o){return typeof t=="number"?t:t.startsWith("-")||t.startsWith("+")?Math.max(0,e+parseFloat(t)):t==="<"?a:t.startsWith("<")?Math.max(0,a+parseFloat(t.slice(1))):o.get(t)??e}function km(e,t,a){for(let o=0;o<e.length;o++){let r=e[o];r.at>t&&r.at<a&&(Le(e,r),o--)}}function lf(e,t,a,o,r,i){km(e,r,i);for(let s=0;s<t.length;s++)e.push({value:t[s],at:D(r,i,o[s]),easing:to(a,s)})}function uf(e,t,a=0){let o=t+1+t*a;for(let r=0;r<e.length;r++)e[r]=e[r]/o}function df(e,t){return e.at===t.at?e.value===null?1:t.value===null?-1:0:e.at-t.at}var Mm="easeInOut",Cn=20;function pf(e,{defaultTransition:t={},...a}={},o,r){let i=t.duration||.3,s=new Map,n=new Map,u={},l=new Map,d=0,f=0,c=0;for(let m=0;m<e.length;m++){let p=e[m];if(typeof p=="string"){l.set(p,f);continue}else if(!Array.isArray(p)){l.set(p.name,In(f,p.at,d,l));continue}let[x,h,I={}]=p;I.at!==void 0&&(f=In(f,I.at,d,l));let C=0,y=(w,v,T,L=0,S=0)=>{let A=Dm(w),{delay:F=0,times:G=co(A),type:oe=t.type||"keyframes",repeat:q,repeatType:ee,repeatDelay:M=0,...be}=v,{ease:R=t.ease||"easeOut",duration:U}=v,_=typeof F=="function"?F(L,S):F,z=A.length,Ce=Gt(oe)?oe:r?.[oe||"keyframes"];if(z<=2&&Ce){let dt=100;if(z===2&&Bm(A)){let ft=A[1]-A[0];dt=Math.abs(ft)}let Ne={...t,...be};U!==void 0&&(Ne.duration=$(U));let He=lo(Ne,dt,Ce);R=He.ease,U=He.duration}U??(U=i);let Dt=f+_;G.length===1&&G[0]===0&&(G[1]=1);let me=G.length-A.length;if(me>0&&fo(G,me),A.length===1&&A.unshift(null),q&&Ee(q<Cn,`Sequence segments can't repeat ${q} times \u2014 ignoring repeat option. Use a value below ${Cn} or apply repeat at the sequence level instead.`),q&&q<Cn){let dt=U>0?M/U:0;U=nf(U,q,M);let Ne=[...A],He=[...G];R=Array.isArray(R)?[...R]:[R];let ft=[...R],la=ee==="reverse"||ee==="mirror",ir=Ne,nr=ft;la&&(ir=[...Ne].reverse(),ee==="reverse"&&(nr=[...ft].reverse().map(Ge=>typeof Ge=="function"?Et(Ge):Ge)));for(let Ge=0;Ge<q;Ge++){let B=la&&Ge%2===0,E=B?ir:Ne,O=B?nr:ft,re=(Ge+1)*(1+dt);dt>0&&(A.push(A[A.length-1]),G.push(re),R.push("linear")),A.push(...E);for(let ce=0;ce<E.length;ce++)G.push(He[ce]+re),R.push(ce===0?"linear":to(O,ce-1))}uf(G,q,dt)}let ut=Dt+U;lf(T,A,R,G,Dt,ut),C=Math.max(_+U,C),c=Math.max(ut,c)};if(V(x)){let w=ff(x,n);y(h,I,cf("default",w))}else{let w=Es(x,h,o,u),v=w.length;for(let T=0;T<v;T++){h=h,I=I;let L=w[T],S=ff(L,n);for(let A in h)y(h[A],Rm(I,A),cf(A,S),T,v)}}d=f,f+=C}return n.forEach((m,p)=>{for(let x in m){let h=m[x];h.sort(df);let I=[],C=[],y=[];for(let L=0;L<h.length;L++){let{at:S,value:A,easing:F}=h[L];I.push(A),C.push(Te(0,c,S)),y.push(F||"easeOut")}C[0]!==0&&(C.unshift(0),I.unshift(I[0]),y.unshift(Mm)),C[C.length-1]!==1&&(C.push(1),I.push(null)),s.has(p)||s.set(p,{keyframes:{},transition:{}});let w=s.get(p);w.keyframes[x]=I;let{type:v,...T}=t;w.transition[x]={...T,duration:c,ease:y,times:C,...a}}}),s}function ff(e,t){return!t.has(e)&&t.set(e,{}),t.get(e)}function cf(e,t){return t[e]||(t[e]=[]),t[e]}function Dm(e){return Array.isArray(e)?e:[e]}function Rm(e,t){return e&&e[t]?{...e,...e[t]}:{...e}}var Fm=e=>typeof e=="number",Bm=e=>e.every(Fm);function Vm(e,t){return V(e)||typeof e=="number"||typeof e=="string"&&!jo(t)}function Os(e,t,a,o){let r=[];if(Vm(e,t))r.push(Uo(e,jo(t)&&t.default||t,a&&(a.default||a)));else{if(e==null)return r;let i=Es(e,t,o),s=i.length;ie(!!s,"No valid elements provided.","no-valid-elements");for(let n=0;n<s;n++){let u=i[n],l={...a};"delay"in l&&typeof l.delay=="function"&&(l.delay=l.delay(n,s)),u instanceof Element?r.push(...Mi(u,t,l,ko.get(u))):r.push(...So(gi(u)??Di,u,t,l))}}return r}function mf(e,t,a){let o=[],r=e.map(s=>{if(Array.isArray(s)&&typeof s[0]=="function"){let n=s[0],u=fe(0);return u.on("change",n),s.length===1?[u,[0,1]]:s.length===2?[u,[0,1],s[1]]:[u,s[1],s[2]]}return s});return pf(r,t,a,{spring:qe}).forEach(({keyframes:s,transition:n},u)=>{o.push(...Os(u,s,n))}),o}function Em(e){return Array.isArray(e)&&e.some(Array.isArray)}function hf(e={}){let{scope:t,reduceMotion:a,skipAnimations:o}=e;function r(i,s,n){let u=[],l,d={};if(a!==void 0&&(d.reduceMotion=a),o!==void 0&&(d.skipAnimations=o),Em(i)){let{onComplete:c,...m}=s||{};typeof c=="function"&&(l=c),u=mf(i,{...d,...m},t)}else{let{onComplete:c,...m}=n||{};typeof c=="function"&&(l=c),u=Os(i,s,{...d,...m},t)}let f=new Lo(u);return l&&f.finished.then(l),t&&(t.animations.push(f),f.finished.then(()=>{Le(t.animations,f)})),f}return r}var yn=Object.assign(hf(),{addEffect:xi,removeEffect:Nr});var K=Ka(P("react"),1);var Ns=P("react");/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var qs=(...e)=>e.filter((t,a,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===a).join(" ").trim();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var xf=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var gf=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,a,o)=>o?o.toUpperCase():a.toLowerCase());/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Sn=e=>{let t=gf(e);return t.charAt(0).toUpperCase()+t.slice(1)};var Ko=P("react");/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Us={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Lf=e=>{for(let t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};var Na=P("react");/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Om=(0,Na.createContext)({});var If=()=>(0,Na.useContext)(Om);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Cf=(0,Ko.forwardRef)(({color:e,size:t,strokeWidth:a,absoluteStrokeWidth:o,className:r="",children:i,iconNode:s,...n},u)=>{let{size:l=24,strokeWidth:d=2,absoluteStrokeWidth:f=!1,color:c="currentColor",className:m=""}=If()??{},p=o??f?Number(a??d)*24/Number(t??l):a??d;return(0,Ko.createElement)("svg",{ref:u,...Us,width:t??l??Us.width,height:t??l??Us.height,stroke:e??c,strokeWidth:p,className:qs("lucide",m,r),...!i&&!Lf(n)&&{"aria-hidden":"true"},...n},[...s.map(([x,h])=>(0,Ko.createElement)(x,h)),...Array.isArray(i)?i:[i]])});/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var H=(e,t)=>{let a=(0,Ns.forwardRef)(({className:o,...r},i)=>(0,Ns.createElement)(Cf,{ref:i,iconNode:t,className:qs(`lucide-${xf(Sn(e))}`,`lucide-${e}`,o),...r}));return a.displayName=Sn(e),a};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var qm=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],ia=H("chevron-down",qm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Um=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Xo=H("chevron-left",Um);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Nm=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],na=H("chevron-right",Nm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Hm=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],Zo=H("chevron-up",Hm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Gm=[["path",{d:"m11 17-5-5 5-5",key:"13zhaf"}],["path",{d:"m18 17-5-5 5-5",key:"h8a8et"}]],_o=H("chevrons-left",Gm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var zm=[["path",{d:"m6 17 5-5-5-5",key:"xnjwq"}],["path",{d:"m13 17 5-5-5-5",key:"17xmmf"}]],$o=H("chevrons-right",zm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Wm=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],Yo=H("chevrons-up-down",Wm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var jm=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],kt=H("circle-alert",jm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Km=[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]],Qo=H("download",Km);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Xm=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]],Jo=H("layout-grid",Xm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Zm=[["path",{d:"M3 5h.01",key:"18ugdj"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 19h.01",key:"noohij"}],["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 19h13",key:"m83p4d"}]],er=H("list",Zm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var _m=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],Ha=H("search",_m);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var $m=[["path",{d:"M10 5H3",key:"1qgfaw"}],["path",{d:"M12 19H3",key:"yhmn1j"}],["path",{d:"M14 3v4",key:"1sua03"}],["path",{d:"M16 17v4",key:"1q0r14"}],["path",{d:"M21 12h-9",key:"1o4lsq"}],["path",{d:"M21 19h-5",key:"1rlt1p"}],["path",{d:"M21 5h-7",key:"1oszz2"}],["path",{d:"M8 10v4",key:"tgpxqk"}],["path",{d:"M8 12H3",key:"a7s4jb"}]],tr=H("sliders-horizontal",$m);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ym=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],ar=H("trash-2",Ym);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Qm=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],or=H("x",Qm);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Z(...e){return e.filter(Boolean).join(" ")}var g=P("react/jsx-runtime"),rr={type:"spring",stiffness:300,damping:32,mass:.6},yf=(0,K.createContext)(null);function Ga(){let e=(0,K.useContext)(yf);if(!e)throw new Error("useDataTable must be used within <DataTable>");return e}var wn=({title:e,searchPlaceholder:t="Search...",onBulkDelete:a,onBulkExport:o,className:r})=>{let{searchTerm:i,setSearchTerm:s,selectedRowIds:n,columns:u,hiddenColumnIds:l,toggleColumnVisibility:d,viewMode:f,setViewMode:c}=Ga(),[m,p]=(0,K.useState)(!1),x=n.size,h=At();return(0,g.jsxs)("div",{className:Z("lm-eui-dt-toolbar",r),children:[(0,g.jsxs)("div",{className:"lm-eui-dt-toolbar-row",children:[(0,g.jsxs)("div",{className:"lm-eui-dt-toolbar-lead",children:[e&&(0,g.jsx)("h3",{className:"lm-eui-dt-title",children:e}),x>0&&(0,g.jsxs)("span",{className:"lm-eui-dt-selected-count",children:[(0,g.jsx)("span",{className:"lm-eui-dt-selected-dot"}),x," selected"]})]}),(0,g.jsxs)("div",{className:"lm-eui-dt-toolbar-controls",children:[t!==null&&(0,g.jsxs)("div",{className:"lm-eui-dt-search-wrap",children:[(0,g.jsx)(Ha,{className:"lm-eui-dt-search-icon"}),(0,g.jsx)("input",{type:"text",value:i,onChange:I=>s(I.target.value),placeholder:t??void 0,"aria-label":t??void 0,className:"lm-eui-dt-search"}),i&&(0,g.jsx)("button",{type:"button",onClick:()=>s(""),className:"lm-eui-dt-search-clear","aria-label":"Clear search",children:(0,g.jsx)(or,{className:"lm-eui-icon"})})]}),(0,g.jsx)(j.button,{type:"button",whileTap:h?void 0:{scale:.96},onClick:()=>c(f==="cards"?"table":"cards"),className:"lm-eui-dt-icon-btn",title:f==="cards"?"Switch to Table view":"Switch to Cards view","aria-label":"Toggle view mode",children:f==="cards"?(0,g.jsx)(er,{className:"lm-eui-icon"}):(0,g.jsx)(Jo,{className:"lm-eui-icon"})}),(0,g.jsxs)("div",{className:"lm-eui-dt-colmenu-wrap",children:[(0,g.jsx)(j.button,{type:"button",whileTap:h?void 0:{scale:.96},onClick:()=>p(!m),className:"lm-eui-dt-icon-btn",title:"Toggle columns","aria-label":"Toggle visible columns","aria-expanded":m,children:(0,g.jsx)(tr,{className:"lm-eui-icon"})}),m&&(0,g.jsxs)("div",{className:"lm-eui-dt-colmenu",children:[(0,g.jsx)("div",{className:"lm-eui-dt-colmenu-title",children:"Columns"}),(0,g.jsx)("div",{className:"lm-eui-dt-colmenu-list",children:u.map(I=>{let C=!l.has(I.id);return(0,g.jsxs)("label",{className:"lm-eui-dt-colmenu-item",children:[(0,g.jsx)("input",{type:"checkbox",checked:C,onChange:()=>d(I.id),"aria-label":`Toggle column ${I.header}`}),(0,g.jsx)("span",{className:"lm-eui-dt-colmenu-name",children:I.header})]},I.id)})})]})]})]})]}),(0,g.jsx)(lt,{children:x>0&&(0,g.jsx)(j.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},transition:rr,className:"lm-eui-dt-bulk-clip",children:(0,g.jsxs)("div",{className:"lm-eui-dt-bulk",children:[(0,g.jsxs)("span",{className:"lm-eui-dt-bulk-label",children:[x," item",x===1?"":"s"," selected:"]}),(0,g.jsxs)("div",{className:"lm-eui-dt-bulk-actions",children:[o&&(0,g.jsxs)(j.button,{type:"button",whileTap:h?void 0:{scale:.96},onClick:()=>o(Array.from(n)),className:"lm-eui-dt-bulk-btn",children:[(0,g.jsx)(Qo,{className:"lm-eui-icon"}),(0,g.jsx)("span",{children:"Export"})]}),a&&(0,g.jsxs)(j.button,{type:"button",whileTap:h?void 0:{scale:.96},onClick:()=>a(Array.from(n)),className:"lm-eui-dt-bulk-btn is-danger",children:[(0,g.jsx)(ar,{className:"lm-eui-icon"}),(0,g.jsx)("span",{children:"Delete"})]})]})]})})})]})},bn=({className:e})=>{let{columns:t,activeFilters:a,toggleFilter:o,clearFilters:r,onClearFilters:i}=Ga(),s=i??r,n=t.filter(l=>l.filterable&&l.filterOptions&&l.filterOptions.length>0),u=Object.values(a).reduce((l,d)=>l+d.length,0);return n.length===0?null:(0,g.jsxs)("div",{className:Z("lm-eui-dt-filters",e),children:[(0,g.jsx)("span",{className:"lm-eui-dt-filters-label",children:"Filters:"}),n.map(l=>{let d=a[l.id]||[];return(0,g.jsxs)("div",{className:"lm-eui-dt-filter-group",children:[(0,g.jsxs)("span",{className:"lm-eui-dt-filter-label",children:[l.header,":"]}),l.filterOptions?.map(f=>{let c=d.includes(f.value);return(0,g.jsx)("button",{type:"button","aria-pressed":c,onClick:()=>o(l.id,f.value),className:Z("lm-eui-dt-filter-chip",c&&"is-on"),children:f.label},f.value)})]},l.id)}),u>0&&(0,g.jsxs)("button",{type:"button",onClick:s,className:"lm-eui-dt-filter-reset",children:["Reset (",u,")"]})]})},vn=({className:e,emptyTitle:t="No matching records found",emptyDescription:a="Try adjusting your search criteria or filters to locate what you are looking for.",emptyActionLabel:o="Clear filters",onClearFilters:r,errorTitle:i="Failed to load data",errorDetail:s,errorDetailLabel:n="Details"})=>{let{columns:u,paginatedData:l,hiddenColumnIds:d,getRowId:f,sortColumn:c,sortDirection:m,handleSort:p,selectedRowIds:x,toggleRowSelection:h,toggleSelectAll:I,isAllSelected:C,isIndeterminate:y,expandedRowIds:w,toggleRowExpansion:v,renderSubComponent:T,viewMode:L,isLoading:S,error:A,clearFilters:F,onClearFilters:G}=Ga(),oe=r??G??F,q=s!==void 0?s:A,ee=(0,K.useMemo)(()=>u.filter(M=>!d.has(M.id)),[u,d]);return A?(0,g.jsxs)("div",{className:"lm-eui-dt-error",children:[(0,g.jsx)(kt,{className:"lm-eui-dt-error-icon"}),i?(0,g.jsx)("p",{className:"lm-eui-dt-error-title",children:i}):null,q?(0,g.jsxs)("details",{className:"lm-eui-dt-error-details",children:[(0,g.jsx)("summary",{className:"lm-eui-dt-error-summary",children:n}),(0,g.jsx)("p",{className:"lm-eui-dt-error-text",children:q})]}):null]}):S?(0,g.jsx)("div",{className:"lm-eui-dt-skeleton",children:[1,2,3,4,5].map(M=>(0,g.jsx)("div",{className:"lm-eui-dt-skeleton-row"},M))}):l.length===0?(0,g.jsxs)("div",{className:"lm-eui-dt-empty",children:[(0,g.jsx)("div",{className:"lm-eui-dt-empty-icon",children:(0,g.jsx)(Ha,{className:"lm-eui-icon"})}),(0,g.jsx)("h4",{className:"lm-eui-dt-empty-title",children:t}),a?(0,g.jsx)("p",{className:"lm-eui-dt-empty-text",children:a}):null,o?(0,g.jsx)("button",{type:"button",onClick:oe,className:"lm-eui-dt-empty-action",children:o}):null]}):L==="cards"?(0,g.jsx)("div",{className:Z("lm-eui-dt-cards",e),children:l.map((M,be)=>{let R=f(M,be),U=x.has(R),_=w.has(R),z=ee[0],Ce=z?.accessorKey?M[z.accessorKey]:z?.accessorFn?z.accessorFn(M):null,Dt=ee.slice(1);return(0,g.jsxs)("div",{className:Z("lm-eui-dt-card",U&&"is-selected"),children:[(0,g.jsxs)("div",{className:"lm-eui-dt-card-head",children:[(0,g.jsxs)("div",{className:"lm-eui-dt-card-lead",children:[(0,g.jsx)("input",{type:"checkbox",checked:U,onChange:()=>h(R),"aria-label":`Select row ${R}`,className:"lm-eui-dt-check"}),(0,g.jsx)("span",{className:"lm-eui-dt-card-title",children:z?.cell?z.cell({row:M,value:Ce}):String(Ce??"")})]}),T&&(0,g.jsx)("button",{type:"button",onClick:()=>v(R),className:"lm-eui-dt-expand-btn","aria-expanded":_,"aria-label":_?"Collapse row details":"Expand row details",children:(0,g.jsx)(j.div,{animate:{rotate:_?90:0},transition:rr,children:(0,g.jsx)(na,{className:"lm-eui-icon"})})})]}),Dt.length>0&&(0,g.jsx)("div",{className:"lm-eui-dt-card-grid",children:Dt.map(me=>{let ut=me.accessorKey?M[me.accessorKey]:me.accessorFn?me.accessorFn(M):null;return(0,g.jsxs)("div",{className:"lm-eui-dt-card-cell",children:[(0,g.jsx)("span",{className:"lm-eui-dt-card-cell-label",children:me.header}),(0,g.jsx)("div",{className:"lm-eui-dt-card-cell-value",children:me.cell?me.cell({row:M,value:ut}):String(ut??"\u2014")})]},me.id)})}),T&&_&&(0,g.jsx)(j.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},transition:rr,className:"lm-eui-dt-card-detail",children:T(M)})]},R)})}):(0,g.jsx)("div",{className:Z("lm-eui-dt-table-wrap",e),children:(0,g.jsxs)("table",{className:"lm-eui-dt-table",children:[(0,g.jsx)("thead",{children:(0,g.jsxs)("tr",{className:"lm-eui-dt-head-row",children:[(0,g.jsx)("th",{className:"lm-eui-dt-th lm-eui-dt-th-check",children:(0,g.jsx)("input",{type:"checkbox",checked:C,ref:M=>{M&&(M.indeterminate=y)},onChange:I,"aria-label":"Select all rows",className:"lm-eui-dt-check"})}),T&&(0,g.jsx)("th",{className:"lm-eui-dt-th lm-eui-dt-th-expand"}),ee.map(M=>{let be=c===M.id;return(0,g.jsx)("th",{style:{width:M.width},className:Z("lm-eui-dt-th",M.align==="right"&&"is-right",M.align==="center"&&"is-center"),children:M.sortable?(0,g.jsxs)("button",{type:"button",onClick:()=>p(M.id),"aria-label":`Sort by ${M.header}`,className:"lm-eui-dt-th-btn",children:[(0,g.jsx)("span",{children:M.header}),be?m==="asc"?(0,g.jsx)(Zo,{className:"lm-eui-icon lm-eui-dt-sort is-on"}):(0,g.jsx)(ia,{className:"lm-eui-icon lm-eui-dt-sort is-on"}):(0,g.jsx)(Yo,{className:"lm-eui-icon lm-eui-dt-sort"})]}):(0,g.jsx)("span",{children:M.header})},M.id)})]})}),(0,g.jsx)("tbody",{children:l.map((M,be)=>{let R=f(M,be),U=x.has(R),_=w.has(R);return(0,g.jsxs)(K.default.Fragment,{children:[(0,g.jsxs)("tr",{className:Z("lm-eui-dt-row",U&&"is-selected"),children:[(0,g.jsx)("td",{className:"lm-eui-dt-td lm-eui-dt-td-check",children:(0,g.jsx)("input",{type:"checkbox",checked:U,onChange:()=>h(R),"aria-label":`Select row ${R}`,className:"lm-eui-dt-check"})}),T&&(0,g.jsx)("td",{className:"lm-eui-dt-td lm-eui-dt-td-expand",children:(0,g.jsx)("button",{type:"button",onClick:()=>v(R),className:"lm-eui-dt-expand-btn","aria-expanded":_,"aria-label":_?"Collapse row details":"Expand row details",children:(0,g.jsx)(j.div,{animate:{rotate:_?90:0},transition:rr,children:(0,g.jsx)(na,{className:"lm-eui-icon"})})})}),ee.map(z=>{let Ce=z.accessorKey?M[z.accessorKey]:z.accessorFn?z.accessorFn(M):null;return(0,g.jsx)("td",{className:Z("lm-eui-dt-td",z.align==="right"&&"is-right",z.align==="center"&&"is-center"),children:z.cell?z.cell({row:M,value:Ce}):String(Ce??"")},z.id)})]}),T&&_&&(0,g.jsx)("tr",{className:"lm-eui-dt-subrow",children:(0,g.jsx)("td",{colSpan:ee.length+2,className:"lm-eui-dt-subrow-cell",children:(0,g.jsx)(j.div,{initial:{opacity:0,height:0},animate:{opacity:1,height:"auto"},exit:{opacity:0,height:0},transition:rr,className:"lm-eui-dt-subrow-inner",children:T(M)})})})]},R)})})]})})},Pn=({pageSizeOptions:e=[5,10,20,50],className:t})=>{let{currentPage:a,setCurrentPage:o,pageSize:r,setPageSize:i,totalPages:s,totalFilteredCount:n}=Ga(),u=At(),l=n===0?0:(a-1)*r+1,d=Math.min(a*r,n);return(0,g.jsxs)("div",{className:Z("lm-eui-dt-pager",t),children:[(0,g.jsxs)("div",{className:"lm-eui-dt-pager-count",children:["Showing ",(0,g.jsxs)("span",{className:"lm-eui-dt-pager-strong",children:[l,"\u2013",d]})," of"," ",(0,g.jsx)("span",{className:"lm-eui-dt-pager-strong",children:n})," records"]}),(0,g.jsxs)("div",{className:"lm-eui-dt-pager-side",children:[(0,g.jsxs)("div",{className:"lm-eui-dt-pagesize-wrap",children:[(0,g.jsx)("span",{className:"lm-eui-dt-pagesize-label",children:"Rows per page:"}),(0,g.jsx)("select",{value:r,onChange:f=>{i(Number(f.target.value)),o(1)},"aria-label":"Rows per page",className:"lm-eui-dt-pagesize",children:e.map(f=>(0,g.jsx)("option",{value:f,children:f},f))})]}),(0,g.jsxs)("div",{className:"lm-eui-dt-pager-nav",children:[(0,g.jsx)(j.button,{type:"button",whileTap:u?void 0:{scale:.96},onClick:()=>o(1),disabled:a<=1,"aria-label":"First page",className:"lm-eui-dt-page-btn",children:(0,g.jsx)(_o,{className:"lm-eui-icon"})}),(0,g.jsx)(j.button,{type:"button",whileTap:u?void 0:{scale:.96},onClick:()=>o(a-1),disabled:a<=1,"aria-label":"Previous page",className:"lm-eui-dt-page-btn",children:(0,g.jsx)(Xo,{className:"lm-eui-icon"})}),(0,g.jsxs)("span",{className:"lm-eui-dt-page-indicator",children:[a,"/",s||1]}),(0,g.jsx)(j.button,{type:"button",whileTap:u?void 0:{scale:.96},onClick:()=>o(a+1),disabled:a>=s,"aria-label":"Next page",className:"lm-eui-dt-page-btn",children:(0,g.jsx)(na,{className:"lm-eui-icon"})}),(0,g.jsx)(j.button,{type:"button",whileTap:u?void 0:{scale:.96},onClick:()=>o(s),disabled:a>=s,"aria-label":"Last page",className:"lm-eui-dt-page-btn",children:(0,g.jsx)($o,{className:"lm-eui-icon"})})]})]})]})};function Sf({data:e,columns:t,getRowId:a=(m,p)=>m.id||`row-${p}`,defaultPageSize:o=10,defaultViewMode:r="auto",hidePagination:i=!1,contentProps:s,accentColor:n,renderSubComponent:u,isLoading:l,error:d,className:f,children:c}){let[m,p]=(0,K.useState)(()=>r==="auto"?typeof window<"u"&&window.innerWidth<640?"cards":"table":r);(0,K.useEffect)(()=>{if(r!=="auto")return;let B=()=>{p(E=>{let O=window.innerWidth<640;return O&&E==="table"?"cards":!O&&E==="cards"?"table":E})};return window.addEventListener("resize",B),()=>window.removeEventListener("resize",B)},[r]);let[x,h]=(0,K.useState)(null),[I,C]=(0,K.useState)(null),[y,w]=(0,K.useState)(""),[v,T]=(0,K.useState)({}),[L,S]=(0,K.useState)(new Set),[A,F]=(0,K.useState)(new Set),[G,oe]=(0,K.useState)(new Set),[q,ee]=(0,K.useState)(1),[M,be]=(0,K.useState)(o),R=B=>{x!==B?(h(B),C("asc")):I==="asc"?C("desc"):(h(null),C(null))},U=(B,E)=>{T(O=>{let re=O[B]||[],ce=re.includes(E)?re.filter(ct=>ct!==E):[...re,E];return{...O,[B]:ce}}),ee(1)},_=()=>{T({}),w(""),ee(1)},z=B=>{S(E=>{let O=new Set(E);return O.has(B)?O.delete(B):O.add(B),O})},Ce=B=>{F(E=>{let O=new Set(E);return O.has(B)?O.delete(B):O.add(B),O})},Dt=B=>{oe(E=>{let O=new Set(E);return O.has(B)?O.delete(B):O.add(B),O})},me=(0,K.useMemo)(()=>{let B=[...e];if(y.trim()){let E=y.toLowerCase();B=B.filter(O=>Object.values(O).some(re=>typeof re=="string"||typeof re=="number"?String(re).toLowerCase().includes(E):!1))}if(Object.entries(v).forEach(([E,O])=>{if(O.length===0)return;let re=t.find(ce=>ce.id===E);re&&(B=B.filter(ce=>{let ct=re.accessorKey?ce[re.accessorKey]:re.accessorFn?re.accessorFn(ce):"";return O.includes(String(ct))}))}),x&&I){let E=t.find(O=>O.id===x);E&&B.sort((O,re)=>{let ce=E.accessorKey?O[E.accessorKey]:E.accessorFn?E.accessorFn(O):"",ct=E.accessorKey?re[E.accessorKey]:E.accessorFn?E.accessorFn(re):"";if(ce===ct)return 0;if(ce==null)return 1;if(ct==null)return-1;let Tn=ce>ct?1:-1;return I==="asc"?Tn:-Tn})}return B},[e,t,y,v,x,I]),ut=me.length,dt=i?1:Math.ceil(ut/M),Ne=(0,K.useMemo)(()=>{if(i)return me;let B=(q-1)*M;return me.slice(B,B+M)},[me,q,M,i]),He=(0,K.useMemo)(()=>Ne.map((B,E)=>a(B,E)),[Ne,a]),ft=He.filter(B=>L.has(B)),la=He.length>0&&ft.length===He.length,ir=ft.length>0&&!la,nr=()=>{S(B=>{let E=new Set(B);return la?He.forEach(O=>E.delete(O)):He.forEach(O=>E.add(O)),E})},Ge={data:e,columns:t,getRowId:a,viewMode:m,setViewMode:p,sortColumn:x,sortDirection:I,handleSort:R,searchTerm:y,setSearchTerm:w,activeFilters:v,toggleFilter:U,clearFilters:_,onClearFilters:s?.onClearFilters,selectedRowIds:L,toggleRowSelection:z,toggleSelectAll:nr,isAllSelected:la,isIndeterminate:ir,expandedRowIds:A,toggleRowExpansion:Ce,renderSubComponent:u,hiddenColumnIds:G,toggleColumnVisibility:Dt,currentPage:q,setCurrentPage:ee,pageSize:M,setPageSize:be,totalPages:dt,totalFilteredCount:ut,paginatedData:Ne,isLoading:l,error:d,accentColor:n};return(0,g.jsx)(yf.Provider,{value:Ge,children:(0,g.jsx)("div",{style:n?{"--lm-eui-accent":n}:void 0,className:Z("lm-eui-dt",f),children:c||(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(wn,{}),(0,g.jsx)(bn,{}),(0,g.jsx)(vn,{...s}),!i&&(0,g.jsx)(Pn,{})]})})})}var sr=Ka(P("react"),1);var za={springGentle:{type:"spring",stiffness:170,damping:26,mass:.9},springSmooth:{type:"spring",stiffness:200,damping:28,mass:.85},springSnappy:{type:"spring",stiffness:380,damping:30,mass:.5},springMorph:{type:"spring",stiffness:220,damping:32,mass:1},springResponsive:{type:"spring",stiffness:320,damping:24,mass:.7},springSoft:{type:"spring",stiffness:150,damping:22,mass:.9},easeSoft:{duration:.32,ease:[.22,1,.36,1]},easeFast:{duration:.2,ease:[.2,0,0,1]}};var Fe=P("react/jsx-runtime"),wf=({tabs:e,defaultTab:t,activeTab:a,onChange:o,className:r,tabsContainerClassName:i,renderContent:s=!0,layoutId:n,variant:u="default"})=>{let[l,d]=(0,sr.useState)(t||e[0]?.id||""),f=a!==void 0?a:l,c=sr.default.useId(),m=n||`active-tab-indicator-${c}`;sr.default.useEffect(()=>{t&&a===void 0&&d(t)},[t,a]);let p=I=>{a===void 0&&d(I),o?.(I)},x=e.find(I=>I.id===f),h=u==="glass"||u==="pill";return(0,Fe.jsxs)("div",{className:Z("lm-eui-tabs",r),children:[(0,Fe.jsx)("div",{role:"tablist",className:Z("lm-eui-tablist",h&&"is-glass",i),children:e.map(I=>{let C=f===I.id;return(0,Fe.jsxs)("button",{type:"button",role:"tab","aria-selected":C,onClick:()=>p(I.id),className:Z("lm-eui-tab",C&&"is-active"),children:[C&&(0,Fe.jsx)(j.div,{layoutId:m,className:Z("lm-eui-tab-indicator",h&&"is-glass"),transition:za.springMorph}),(0,Fe.jsxs)("span",{className:"lm-eui-tab-body",children:[I.icon&&(0,Fe.jsx)("span",{children:I.icon}),I.label,I.badge&&(0,Fe.jsx)("span",{className:"lm-eui-tab-badge",children:I.badge})]})]},I.id)})}),s&&(0,Fe.jsx)("div",{className:"lm-eui-tabpanel",children:(0,Fe.jsx)(lt,{mode:"wait",children:x?.content&&(0,Fe.jsx)(j.div,{initial:{opacity:0,y:6},animate:{opacity:1,y:0},exit:{opacity:0,y:-6},transition:za.springGentle,className:"lm-eui-tabpanel-content",children:x.content},f)})})]})};var Hs=P("react");var Be=P("react/jsx-runtime"),bf=({title:e,open:t=!1,onOpenChange:a,children:o,id:r,count:i,className:s,renderHeader:n,rootRef:u,bodyClassName:l})=>{let d=(0,Hs.useId)(),f=r||`lm-disclosure-${d}`,c=t===!0,m=At(),p=m?{duration:0}:za.springGentle,x=m?{duration:0}:za.springSnappy,h=(0,Hs.useCallback)(()=>a?.(!c),[c,a]);return(0,Be.jsxs)("div",{ref:u,className:Z("lm-eui-disclosure",s),"data-open":c?"true":"false",children:[n?n({open:c,toggle:h,contentId:f}):(0,Be.jsxs)("button",{type:"button","aria-expanded":c,"aria-controls":f,onClick:h,className:"lm-eui-disclosure-trigger",children:[(0,Be.jsxs)("span",{className:"lm-eui-disclosure-heading",children:[(0,Be.jsx)("span",{className:"lm-eui-disclosure-title",children:e}),typeof i=="number"&&(0,Be.jsx)("span",{className:"lm-eui-disclosure-count",children:i})]}),(0,Be.jsx)(j.span,{"aria-hidden":!0,animate:{rotate:c?180:0},transition:x,className:"lm-eui-disclosure-chevron",children:(0,Be.jsx)(ia,{className:"lm-eui-icon"})})]}),(0,Be.jsx)("div",{id:f,className:"lm-eui-disclosure-panel","aria-hidden":c?void 0:!0,inert:c?void 0:"",children:(0,Be.jsx)(lt,{initial:!1,children:c&&(0,Be.jsx)(j.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},transition:p,className:Z("lm-eui-disclosure-body",!l&&"lm-eui-disclosure-body-default",l),children:o},"content")})})]})};var Wa=P("react");var Je=P("react/jsx-runtime");var vf=(...e)=>e.filter(Boolean).join(" "),GB=new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}),zB=new Intl.NumberFormat("en-US",{maximumFractionDigits:1});function Pf({title:e,description:t,actions:a,children:o,className:r=""}){return(0,Je.jsxs)("section",{className:vf("lm-eui-card",r),children:[(0,Je.jsxs)("header",{className:"lm-eui-card-head",children:[(0,Je.jsxs)("div",{className:"lm-eui-card-headings",children:[(0,Je.jsx)("h3",{className:"lm-eui-card-title",children:e}),t&&(0,Je.jsx)("p",{className:"lm-eui-card-desc",children:t})]}),a]}),o]})}function Tf({value:e,onChange:t,options:a,label:o}){let r=(0,Wa.useId)();return(0,Je.jsx)("div",{role:"radiogroup","aria-label":o,className:"lm-eui-segmented",children:a.map(i=>{let s=i.value===e;return(0,Je.jsxs)("button",{type:"button",role:"radio","aria-checked":s,onClick:()=>t(i.value),className:vf("lm-eui-segmented-item",s&&"is-on"),children:[s&&(0,Je.jsx)(j.span,{layoutId:r,className:"lm-eui-segmented-thumb",transition:{type:"spring",duration:.3,bounce:.15}}),i.label]},i.value)})})}var Ve=P("react"),Af=P("react-dom"),ja=P("@deepseek-ai/dsh-client-ui-primitives");var Mt=P("react/jsx-runtime"),Jm={position:"fixed",top:0,left:0,visibility:"hidden",pointerEvents:"none"},kf=({title:e,open:t=!1,onOpenChange:a,children:o,id:r,count:i,className:s,panelClassName:n,align:u="end",side:l="bottom",ariaLabel:d})=>{let f=(0,Ve.useId)(),c=r||`lm-toolbar-popover-${f}`,m=`${c}-trigger`,p=(0,Ve.useRef)(null),x=(0,Ve.useRef)(null),h=(0,Ve.useRef)(null),I=(0,Ve.useRef)(!1),C=t===!0,y=(0,Ve.useCallback)(v=>{a?.(v)},[a]),w=(0,ja.useAnchoredPosition)({open:C,anchorRef:p,panelRef:x,side:l,align:u,gap:8,margin:12});return(0,ja.useDismissOnOutsidePointer)(p,C,y,x),(0,Ve.useEffect)(()=>{if(!C)return;let v=T=>{T.key==="Escape"&&(T.preventDefault(),T.stopPropagation(),y(!1),p.current?.focus())};return document.addEventListener("keydown",v,!0),()=>document.removeEventListener("keydown",v,!0)},[C,y]),(0,Ve.useEffect)(()=>{if(!C){I.current=!1;return}I.current||w&&(I.current=!0,h.current?.focus({preventScroll:!0}))},[C,w]),(0,Mt.jsxs)("span",{className:Z("lm-eui-toolbar-popover",s),children:[(0,Mt.jsxs)("button",{type:"button",id:m,ref:p,"aria-expanded":C,"aria-haspopup":"dialog","aria-controls":c,className:"lm-eui-toolbar-popover-trigger",onClick:()=>y(!C),children:[(0,Mt.jsx)("span",{className:"lm-eui-toolbar-popover-label",children:e}),typeof i=="number"&&(0,Mt.jsx)("span",{className:"lm-eui-toolbar-popover-count",children:i})]}),C?(0,Af.createPortal)((0,Mt.jsx)(ja.MenuSurface,{ref:x,id:c,phase:"enter",className:Z("lm-eui-toolbar-popover-panel",n),style:{...w??Jm,position:"fixed"},children:(0,Mt.jsx)("div",{ref:h,className:"lm-eui-toolbar-popover-body",role:"dialog",tabIndex:-1,"aria-label":d,"aria-labelledby":d?void 0:m,children:o})}),document.body):null]})};var Mf=`/* Theme layer for the vendored EasyUI (MIT) components.
 *
 * The upstream components are written against Tailwind utility classes. This
 * plugin ships no Tailwind build, so every upstream utility class was mapped
 * to an explicit DSH-token class (\`lm-eui-*\`) in the component sources. This
 * file is that mapping's other half: the actual declarations, expressed with
 * the host design tokens so the vendored components follow the DSH theme
 * (including its dark mode) instead of hard-coded colours.
 *
 * Scope: everything is prefixed \`lm-eui-\` so it cannot leak into, or be
 * affected by, the surrounding plugin styles.
 */

.lm-eui-dt,
.lm-eui-donut,
.lm-eui-tabs,
.lm-eui-spnav {
	color: var(--dsw-alias-label-primary);
	font-size: 12px;
	line-height: 1.5;
}

.lm-eui-icon {
	width: 14px;
	height: 14px;
	flex: none;
}

/* ------------------------------------------------------------------ shared */

.lm-eui-ring {
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-muted {
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-focus {
	outline: none;
}

.lm-eui-focus:focus-visible {
	outline: 2px solid var(--dsw-static-blue-450);
	outline-offset: 2px;
}

.lm-eui-empty {
	padding: 40px 0;
	text-align: center;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 999px;
	flex: none;
}

.lm-eui-tooltip {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 20;
	min-width: 112px;
	padding: 8px 12px;
	border-radius: 12px;
	background: var(--dsw-alias-bg-layer-1);
	color: var(--dsw-alias-label-primary);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
	pointer-events: none;
}

.lm-eui-card {
	min-width: 0;
	padding: 16px;
	border-radius: 16px;
	background: var(--dsw-alias-bg-layer-1);
	color: var(--dsw-alias-label-primary);
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-card-head {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 16px;
}

.lm-eui-card-headings {
	min-width: 0;
}

.lm-eui-card-title {
	margin: 0;
	font-size: 13px;
	font-weight: 500;
}

.lm-eui-card-desc {
	margin: 2px 0 0;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-segmented {
	position: relative;
	display: inline-flex;
	flex: none;
	padding: 2px;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-segmented-item {
	position: relative;
	z-index: 10;
	height: 28px;
	padding: 0 14px;
	border: 0;
	border-radius: 999px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	font: inherit;
	font-size: 12px;
	cursor: pointer;
	transition: color 150ms;
}

.lm-eui-segmented-item.is-on {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-segmented-thumb {
	position: absolute;
	inset: 0;
	z-index: -1;
	border-radius: 999px;
	background: var(--dsw-alias-bg-base);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
}

/* --------------------------------------------------------------- data table */

.lm-eui-dt {
	width: 100%;
	overflow: hidden;
	border-radius: 14px;
	background: var(--dsw-alias-bg-layer-1);
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-dt-toolbar {
	padding: 10px 14px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
}

.lm-eui-dt-toolbar-row {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

@media (min-width: 640px) {
	.lm-eui-dt-toolbar-row {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
}

.lm-eui-dt-toolbar-lead {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
}

.lm-eui-dt-title {
	margin: 0;
	font-size: 13px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.lm-eui-dt-selected-count {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 10px;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-hover);
	font-size: 12px;
}

.lm-eui-dt-selected-dot {
	width: 6px;
	height: 6px;
	border-radius: 999px;
	background: var(--dsw-alias-label-primary);
}

.lm-eui-dt-toolbar-controls {
	display: flex;
	align-items: center;
	gap: 6px;
	width: 100%;
	min-width: 0;
}

@media (min-width: 640px) {
	.lm-eui-dt-toolbar-controls {
		width: auto;
	}
}

.lm-eui-dt-search-wrap {
	position: relative;
	flex: 1;
	min-width: 0;
}

@media (min-width: 640px) {
	.lm-eui-dt-search-wrap {
		flex: none;
		width: 256px;
	}
}

.lm-eui-dt-search-icon {
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	width: 14px;
	height: 14px;
	color: var(--dsw-alias-label-tertiary);
	pointer-events: none;
}

.lm-eui-dt-search {
	width: 100%;
	padding: 6px 28px 6px 32px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 8px;
	background: var(--dsw-alias-bg-base);
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
}

.lm-eui-dt-search::placeholder {
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-search-clear {
	position: absolute;
	right: 6px;
	top: 50%;
	transform: translateY(-50%);
	display: inline-flex;
	padding: 2px;
	border: 0;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
}

.lm-eui-dt-search-clear:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-icon-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: none;
	padding: 6px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 8px;
	background: var(--dsw-alias-bg-base);
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
	transition: color 150ms, border-color 150ms;
}

.lm-eui-dt-icon-btn:hover {
	color: var(--dsw-alias-label-primary);
	border-color: var(--dsw-alias-border-l3);
}

.lm-eui-dt-colmenu-wrap {
	position: relative;
	flex: none;
}

.lm-eui-dt-colmenu {
	position: absolute;
	right: 0;
	top: calc(100% + 8px);
	z-index: 30;
	width: 192px;
	max-height: 240px;
	overflow-y: auto;
	padding: 8px;
	border-radius: 12px;
	background: var(--dsw-alias-bg-layer-1);
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28), inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-dt-colmenu-title {
	padding: 4px 8px;
	font-size: 12px;
	font-weight: 500;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-colmenu-list {
	display: flex;
	flex-direction: column;
}

.lm-eui-dt-colmenu-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	border-radius: 6px;
	font-size: 12px;
	color: var(--dsw-alias-label-secondary);
	cursor: pointer;
}

.lm-eui-dt-colmenu-item:hover {
	background: var(--dsw-alias-interactive-bg-hover);
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-colmenu-name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-dt-bulk-clip {
	overflow: hidden;
}

.lm-eui-dt-bulk {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-top: 8px;
	padding: 8px 10px;
	border-radius: 8px;
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-dt-bulk-label {
	font-size: 12px;
	color: var(--dsw-alias-label-secondary);
}

.lm-eui-dt-bulk-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.lm-eui-dt-bulk-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 10px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: transparent;
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
	cursor: pointer;
}

.lm-eui-dt-bulk-btn:hover {
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-dt-bulk-btn.is-danger {
	border-color: var(--dsw-alias-state-error-primary);
	color: var(--dsw-alias-state-error-primary);
}

.lm-eui-dt-filters {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
	overflow-x: auto;
}

.lm-eui-dt-filters-label {
	flex: none;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-filter-group {
	display: flex;
	align-items: center;
	gap: 4px;
	flex: none;
	padding: 2px;
	border-radius: 8px;
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-dt-filter-label {
	padding: 0 8px;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-filter-chip {
	padding: 2px 8px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	font: inherit;
	font-size: 12px;
	cursor: pointer;
	transition: background-color 150ms, color 150ms;
}

.lm-eui-dt-filter-chip:hover {
	background: var(--dsw-alias-interactive-bg-active);
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-filter-chip.is-on {
	background: var(--dsw-alias-label-primary);
	color: var(--dsw-alias-bg-base);
}

.lm-eui-dt-filter-reset {
	flex: none;
	margin-left: auto;
	border: 0;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	font: inherit;
	font-size: 12px;
	cursor: pointer;
}

.lm-eui-dt-filter-reset:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-error {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 48px 24px;
	text-align: center;
}

.lm-eui-dt-error-icon {
	width: 20px;
	height: 20px;
	color: var(--dsw-alias-state-error-primary);
}

.lm-eui-dt-error-title {
	margin: 0;
	font-size: 13px;
	font-weight: 500;
}

.lm-eui-dt-error-text {
	margin: 0;
	max-width: 360px;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

/* Technical detail stays collapsed until the reader asks for it. */
.lm-eui-dt-error-details {
	margin-top: 6px;
}

.lm-eui-dt-error-summary {
	cursor: pointer;
	font-size: 11px;
	color: var(--dsw-alias-label-tertiary);
	text-decoration: underline dotted;
	text-underline-offset: 2px;
}

.lm-eui-dt-error-summary:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-error-details .lm-eui-dt-error-text {
	margin-top: 6px;
	overflow-wrap: anywhere;
}

.lm-eui-dt-skeleton {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 24px;
}

.lm-eui-dt-skeleton-row {
	height: 36px;
	border-radius: 8px;
	background: var(--dsw-alias-interactive-bg-hover);
	animation: lm-eui-pulse 1.4s ease-in-out infinite;
}

@keyframes lm-eui-pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.45; }
}

.lm-eui-dt-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	padding: 48px 24px;
	text-align: center;
}

.lm-eui-dt-empty-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	margin-bottom: 4px;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-hover);
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-empty-title {
	margin: 0;
	font-size: 13px;
	font-weight: 500;
}

.lm-eui-dt-empty-text {
	margin: 0;
	max-width: 320px;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-empty-action {
	margin-top: 8px;
	padding: 6px 12px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: transparent;
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
	cursor: pointer;
}

.lm-eui-dt-cards {
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 12px;
}

.lm-eui-dt-card {
	padding: 14px;
	border-radius: 12px;
	background: var(--dsw-alias-bg-base);
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-dt-card.is-selected {
	background: var(--dsw-alias-interactive-bg-active);
}

.lm-eui-dt-card-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.lm-eui-dt-card-lead {
	display: flex;
	align-items: center;
	gap: 10px;
	min-width: 0;
}

.lm-eui-dt-card-title {
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-dt-expand-btn {
	display: inline-flex;
	padding: 4px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
}

.lm-eui-dt-expand-btn:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-card-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 10px;
	padding-top: 10px;
	border-top: 1px solid var(--dsw-alias-border-l2);
}

.lm-eui-dt-card-cell {
	min-width: 0;
}

.lm-eui-dt-card-cell-label {
	display: block;
	font-size: 11px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-card-cell-value {
	margin-top: 2px;
	color: var(--dsw-alias-label-secondary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-dt-card-detail {
	padding-top: 10px;
	border-top: 1px solid var(--dsw-alias-border-l2);
	overflow: hidden;
}

.lm-eui-dt-table-wrap {
	overflow-x: auto;
}

.lm-eui-dt-table {
	width: 100%;
	min-width: 480px;
	border-collapse: collapse;
	text-align: left;
	font-size: 12px;
}

.lm-eui-dt-head-row {
	background: var(--dsw-alias-interactive-bg-hover);
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-th {
	padding: 10px 14px;
	font-weight: 500;
	white-space: nowrap;
}

.lm-eui-dt-th.is-right { text-align: right; }
.lm-eui-dt-th.is-center { text-align: center; }
.lm-eui-dt-th-check { width: 40px; }
.lm-eui-dt-th-expand { width: 28px; }

.lm-eui-dt-th-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	border: 0;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
}

.lm-eui-dt-th-btn:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-sort {
	width: 12px;
	height: 12px;
	opacity: 0.35;
}

.lm-eui-dt-sort.is-on {
	opacity: 1;
	color: var(--dsw-alias-label-primary);
}

.lm-eui-dt-row {
	transition: background-color 120ms;
}

.lm-eui-dt-row:hover {
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-dt-row.is-selected {
	background: var(--dsw-alias-interactive-bg-active);
}

.lm-eui-dt-td {
	padding: 10px 14px;
	color: var(--dsw-alias-label-secondary);
	white-space: nowrap;
}

.lm-eui-dt-td.is-right { text-align: right; font-variant-numeric: tabular-nums; }
.lm-eui-dt-td.is-center { text-align: center; }
.lm-eui-dt-td-check { width: 40px; }
.lm-eui-dt-td-expand { width: 28px; }

.lm-eui-dt-check {
	width: 14px;
	height: 14px;
	accent-color: var(--dsw-static-blue-450);
	cursor: pointer;
}

.lm-eui-dt-subrow {
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-dt-subrow-cell {
	padding: 0;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
}

.lm-eui-dt-subrow-inner {
	padding: 14px;
	border-top: 1px solid var(--dsw-alias-border-l2);
	overflow: hidden;
}

.lm-eui-dt-pager {
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	border-top: 1px solid var(--dsw-alias-border-l2);
}

@media (min-width: 640px) {
	.lm-eui-dt-pager {
		flex-direction: row;
	}
}

.lm-eui-dt-pager-count {
	color: var(--dsw-alias-label-tertiary);
	font-variant-numeric: tabular-nums;
}

.lm-eui-dt-pager-strong {
	color: var(--dsw-alias-label-primary);
	font-weight: 500;
}

.lm-eui-dt-pager-side {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	width: 100%;
}

@media (min-width: 640px) {
	.lm-eui-dt-pager-side {
		justify-content: flex-end;
		width: auto;
	}
}

.lm-eui-dt-pagesize-wrap {
	display: flex;
	align-items: center;
	gap: 8px;
}

.lm-eui-dt-pagesize-label {
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-dt-pagesize {
	padding: 4px 8px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: var(--dsw-alias-bg-base);
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
}

.lm-eui-dt-pager-nav {
	display: flex;
	align-items: center;
	gap: 4px;
}

.lm-eui-dt-page-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: var(--dsw-alias-bg-base);
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
}

.lm-eui-dt-page-btn:hover:not(:disabled) {
	color: var(--dsw-alias-label-primary);
	border-color: var(--dsw-alias-border-l3);
}

.lm-eui-dt-page-btn:disabled {
	opacity: 0.25;
	cursor: not-allowed;
}

.lm-eui-dt-page-indicator {
	padding: 0 8px;
	color: var(--dsw-alias-label-primary);
	font-variant-numeric: tabular-nums;
}

/* ---------------------------------------------------------------- disclosure */
/* Adapted from EasyUI "Smooth Accordion" (MIT): a real button trigger with
   aria-expanded, a spring-animated chevron and a height-animated panel. */

.lm-eui-disclosure {
	width: 100%;
	min-width: 0;
}

.lm-eui-disclosure-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	width: 100%;
	min-height: 36px;
	padding: 8px 4px;
	border: 0;
	border-radius: 8px;
	background: transparent;
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 13px;
	text-align: left;
	cursor: pointer;
	transition: background-color 120ms;
}

.lm-eui-disclosure-trigger:hover {
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-disclosure-trigger:focus-visible {
	outline: 2px solid var(--dsw-static-blue-450);
	outline-offset: 2px;
}

.lm-eui-disclosure-heading {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
}

.lm-eui-disclosure-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-disclosure-count {
	flex: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 18px;
	padding: 0 6px;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-hover);
	color: var(--dsw-alias-label-secondary);
	font-size: 11px;
	font-variant-numeric: tabular-nums;
}

.lm-eui-disclosure-chevron {
	flex: none;
	display: inline-flex;
	color: var(--dsw-alias-label-tertiary);
}

/* The expanded region takes the space a flex-column root has left over, so a
   card that hosts the disclosure can keep the body scrolling inside itself
   instead of letting it grow the page. Outside a flex parent these
   declarations do not apply. */
.lm-eui-disclosure-panel {
	min-width: 0;
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	min-height: 0;
	overflow: hidden;
}

/* The height animation needs the body clipped while it collapses. The
   selector carries no specificity so a caller that owns the body region can
   replace the clipping with its own scrolling. */
:where(.lm-eui-disclosure-body) {
	overflow: hidden;
}

/* Default body content. A caller that passes its own body class owns the
   region completely and gets none of these. */
.lm-eui-disclosure-body-default {
	padding: 2px 0 10px;
	color: var(--dsw-alias-label-secondary);
	font-size: 13px;
	line-height: 1.6;
}

@media (max-width: 700px) {
	.lm-eui-disclosure-trigger {
		min-height: 44px;
	}
}


.lm-eui-donut {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	width: 100%;
}

@media (min-width: 520px) {
	.lm-eui-donut.is-side {
		flex-direction: row;
		align-items: center;
		gap: 32px;
	}
}

.lm-eui-donut-figure {
	position: relative;
	flex: none;
}

.lm-eui-donut-svg {
	display: block;
	overflow: visible;
}

.lm-eui-donut-track {
	stroke: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-donut-center {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	pointer-events: none;
}

.lm-eui-donut-center.is-semi {
	inset: auto 0 0 0;
	justify-content: flex-end;
}

.lm-eui-donut-readout {
	max-width: 70%;
}

.lm-eui-donut-label {
	margin: 0;
	font-size: 12px;
	color: var(--dsw-alias-label-tertiary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-donut-value {
	margin: 0;
	font-weight: 600;
	letter-spacing: -0.02em;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-primary);
}

.lm-eui-donut-share {
	margin: 0;
	font-size: 12px;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-legend {
	width: 100%;
	margin: 0;
	padding: 0;
	list-style: none;
}

@media (min-width: 520px) {
	.lm-eui-legend.is-side {
		max-width: 280px;
		flex: 1;
	}
}

.lm-eui-legend-item {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	height: 40px;
	padding: 0 8px;
	border: 0;
	border-radius: 10px;
	background: transparent;
	color: var(--dsw-alias-label-secondary);
	font: inherit;
	font-size: 12px;
	text-align: left;
	cursor: pointer;
	transition: background-color 150ms, opacity 150ms;
}

.lm-eui-legend-item:hover {
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-legend-item.is-off {
	opacity: 0.45;
}

.lm-eui-legend-label {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-legend-item.is-off .lm-eui-legend-label {
	text-decoration: line-through;
}

.lm-eui-legend-value {
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-primary);
}

.lm-eui-legend-share {
	width: 36px;
	text-align: right;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-tertiary);
}

/* ------------------------------------------------------------ scroll progress */

.lm-eui-spnav {
	font-family: inherit;
	user-select: none;
}

.lm-eui-spnav.is-fixed {
	position: fixed;
	z-index: 40;
	max-width: 95vw;
}

.lm-eui-spnav.is-fixed.is-top-center { top: 24px; left: 50%; transform: translateX(-50%); }
.lm-eui-spnav.is-fixed.is-bottom-center { bottom: 24px; left: 50%; transform: translateX(-50%); }
.lm-eui-spnav.is-fixed.is-top-right { top: 24px; right: 24px; }

.lm-eui-spnav.is-sticky {
	position: sticky;
	top: 12px;
	z-index: 20;
	width: fit-content;
	margin: 0 auto;
}

.lm-eui-spnav.is-inline {
	position: relative;
	width: fit-content;
	margin: 0 auto;
}

.lm-eui-spnav-bar {
	position: relative;
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px;
	border-radius: 999px;
	background: var(--dsw-alias-bg-layer-1);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28), inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-spnav-track {
	position: absolute;
	inset: 0;
	border-radius: 999px;
	overflow: hidden;
	pointer-events: none;
}

.lm-eui-spnav-progress {
	position: absolute;
	top: 0;
	left: 0;
	height: 2px;
	background: var(--dsw-alias-label-primary);
	transition: width 150ms;
}

.lm-eui-spnav-compact {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px;
}

@media (min-width: 768px) {
	.lm-eui-spnav-compact {
		display: none;
	}
}

.lm-eui-spnav-compact-index {
	font-size: 10px;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-spnav-compact-label {
	font-size: 12px;
	font-weight: 500;
}

.lm-eui-spnav-toggle {
	display: inline-flex;
	padding: 4px;
	border: 0;
	border-radius: 999px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
}

.lm-eui-spnav-toggle:hover {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-spnav-toggle .lm-eui-icon.is-open {
	transform: rotate(90deg);
}

.lm-eui-spnav-items {
	display: none;
	align-items: center;
	gap: 2px;
}

.lm-eui-spnav-items.is-expanded {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	position: absolute;
	top: 48px;
	left: 0;
	right: 0;
	padding: 8px;
	border-radius: 14px;
	background: var(--dsw-alias-bg-layer-1);
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28), inset 0 0 0 1px var(--dsw-alias-border-l2);
}

@media (min-width: 768px) {
	.lm-eui-spnav-items {
		display: flex;
		flex-direction: row;
		position: static;
		padding: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
	}
}

.lm-eui-spnav-item {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border: 0;
	border-radius: 999px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	font: inherit;
	font-size: 12px;
	white-space: nowrap;
	cursor: pointer;
	transition: color 150ms;
}

.lm-eui-spnav-item:hover {
	color: var(--dsw-alias-label-secondary);
}

.lm-eui-spnav-item.is-active {
	color: var(--dsw-alias-label-primary);
}

.lm-eui-spnav-pill {
	position: absolute;
	inset: 0;
	z-index: 0;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-active);
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-spnav-index,
.lm-eui-spnav-label {
	position: relative;
	z-index: 10;
}

.lm-eui-spnav-index {
	font-size: 10px;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-tertiary);
}

.lm-eui-spnav-item.is-active .lm-eui-spnav-index {
	color: var(--dsw-alias-label-secondary);
}

.lm-eui-spnav-top {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: none;
	width: 24px;
	height: 24px;
	margin-left: 2px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-hover);
	color: var(--dsw-alias-label-tertiary);
	cursor: pointer;
}

.lm-eui-spnav-top:hover {
	color: var(--dsw-alias-label-primary);
	border-color: var(--dsw-alias-border-l3);
}

/* --------------------------------------------------------------------- tabs */

.lm-eui-tabs {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.lm-eui-tablist {
	display: flex;
	align-items: center;
	gap: 4px;
	align-self: flex-start;
	padding: 4px;
	border-radius: 10px;
	background: var(--dsw-alias-interactive-bg-hover);
}

.lm-eui-tablist.is-glass {
	border-radius: 999px;
	backdrop-filter: blur(12px);
}

.lm-eui-tab {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 14px;
	border: 0;
	border-radius: 8px;
	background: transparent;
	color: var(--dsw-alias-label-tertiary);
	font: inherit;
	font-size: 13px;
	cursor: pointer;
	transition: color 150ms;
}

.lm-eui-tablist.is-glass .lm-eui-tab {
	border-radius: 999px;
	padding: 6px 16px;
}

.lm-eui-tab:hover {
	color: var(--dsw-alias-label-secondary);
}

.lm-eui-tab.is-active {
	color: var(--dsw-alias-label-primary);
	font-weight: 500;
}

.lm-eui-tab-indicator {
	position: absolute;
	inset: 0;
	border-radius: 8px;
	background: var(--dsw-alias-bg-layer-1);
	box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
}

.lm-eui-tab-indicator.is-glass {
	border-radius: 999px;
}

.lm-eui-tab-body {
	position: relative;
	z-index: 10;
	display: inline-flex;
	align-items: center;
	gap: 8px;
}

.lm-eui-tab-badge {
	padding: 1px 6px;
	border-radius: 6px;
	background: var(--dsw-alias-interactive-bg-hover);
	font-size: 10px;
	font-variant-numeric: tabular-nums;
	color: var(--dsw-alias-label-secondary);
}

.lm-eui-tabpanel {
	position: relative;
	min-height: 60px;
}

.lm-eui-tabpanel-content {
	font-size: 13px;
	color: var(--dsw-alias-label-secondary);
}

@media (prefers-reduced-motion: reduce) {
	.lm-eui-dt-skeleton-row {
		animation: none;
	}
	.lm-eui-spnav-progress {
		transition: none;
	}
}
`;var Df=`/* Toolbar popover \u2014 host primitives adapter.
   The trigger stays inline in the toolbar; the panel is portalled by the
   host's MenuSurface and positioned by the host's anchor hook, so only
   surface styling belongs here. */

.lm-eui-toolbar-popover {
	display: inline-flex;
	align-items: center;
	min-width: 0;
}

.lm-eui-toolbar-popover-trigger {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-height: 32px;
	padding: 4px 10px;
	border: 1px solid var(--dsw-alias-border-l3);
	border-radius: 8px;
	background: transparent;
	color: var(--dsw-alias-label-primary);
	font: inherit;
	font-size: 12px;
	line-height: 1.4;
	cursor: pointer;
	transition: background-color 120ms, border-color 120ms;
}

.lm-eui-toolbar-popover-trigger:hover {
	background: var(--dsw-alias-interactive-bg-hover);
	border-color: var(--dsw-alias-border-l2);
}

.lm-eui-toolbar-popover-trigger:focus-visible {
	outline: 2px solid var(--dsw-static-blue-450);
	outline-offset: 2px;
}

.lm-eui-toolbar-popover-label {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lm-eui-toolbar-popover-count {
	flex: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 18px;
	height: 16px;
	padding: 0 5px;
	border-radius: 999px;
	background: var(--dsw-alias-interactive-bg-active);
	color: var(--dsw-alias-label-secondary);
	font-size: 11px;
	font-variant-numeric: tabular-nums;
}

/* The panel is mounted to the document body by this adapter, so it must not
   rely on any ancestor selector. It is pinned to the viewport: the anchor
   hook reports viewport coordinates and the host surface is relative.

   Surface treatment mirrors the host's own menu card: the translucent fill
   and the backdrop blur come from the host \`MenuSurface\` material layer,
   while the hairline stroke and the elevation shadow come from the host
   elevation tokens. The layer sits on the host's submenu step (101) \u2014 above
   the anchored list and tooltip layer (100) and above the app chrome, and
   below the host modal overlay (1000). */
.lm-eui-toolbar-popover-panel {
	position: fixed;
	z-index: 101;
	max-width: min(320px, calc(100vw - 24px));
	/* The host surface root already carries this radius (MenuSurface.module.css
	   sets \`.surface { border-radius: var(--dsw-radius-lg) }\`, and the material
	   layer only inherits it). Stating it here keeps the panel's shape in this
	   stylesheet instead of depending on the host class staying on the element. */
	border-radius: var(--dsw-radius-lg);
	border: 0;
	--dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
	box-shadow: var(--dsw-elevation-prominent);
}

/* The viewport fit follows the host's scrollable menu: the card stops short
   of the viewport edges and taller content scrolls inside. */
.lm-eui-toolbar-popover-body {
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-height: 0;
	max-height: calc(100vh - 12px - max(12px, var(--dsh-frame-overlay-top, 12px)));
	overflow-y: auto;
	overscroll-behavior: contain;
	padding: 10px 12px;
	color: var(--dsw-alias-label-secondary);
	font-size: 12px;
	line-height: 1.5;
}

@media (max-width: 700px) {
	.lm-eui-toolbar-popover-trigger {
		min-height: 44px;
	}
}
`;var ah="lm-easyui-styles",oh="lm-toolbar-popover-styles";function Rf(e,t){if(typeof document>"u"||document.getElementById(e))return;let a=document.createElement("style");a.id=e,a.textContent=t,document.head.appendChild(a)}function rh(){return typeof window>"u"||typeof window.matchMedia!="function"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches}function sh(e,t){let a=e("react"),o=e("@deepseek-ai/dsh-client-ui-primitives"),r=t&&t.d3||(typeof globalThis<"u"?globalThis.d3:void 0);return Rf(ah,Mf),Rf(oh,Df),{React:a,ui:o,motion:j,AnimatePresence:lt,LayoutGroup:dn,useReducedMotion:At,useMotionValue:sa,useTransform:Ua,useSpring:Vs,animate:yn,d3:r,components:{DataTable:Sf,DataTableToolbar:wn,DataTableFilters:bn,DataTableContent:vn,DataTablePagination:Pn,AnimatedTabs:wf,Disclosure:bf,ToolbarPopover:kf,ChartCard:Pf,SegmentedControl:Tf},useDataTable:Ga,reducedMotion:rh}}return Uf(ih);})();

const STATUS_PACKAGE = "@dsh-external/dsh-layered-memory-status";
const STATUS_SERVICE = "layeredMemoryStatus";

function exactObject(value, keys) {
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) throw new TypeError("记忆状态对象字段不匹配");
	return value;
}
function text(value) {
	if (typeof value !== "string" || !value) throw new TypeError("记忆状态标识必须是非空字符串");
	return value;
}
function count(value) {
	if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("记忆状态计数必须是非负整数");
	return value;
}
function number(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("记忆状态数值必须是有限数字");
	return value;
}
function boolean(value) {
	if (typeof value !== "boolean") throw new TypeError("记忆状态标记必须是布尔值");
	return value;
}
function nullableText(value) { return value === null ? null : text(value); }
function item(value) {
	if (value === null) return value;
	exactObject(value, ["id", "namespace", "purpose", "status", "sessionId", "workerId", "legacy", "phase", "startedAt", "finishedAt", "changedEntries", "retainedEntries", "waitingEntries", "remainingEntries", "summary"]);
	for (const key of ["id", "namespace", "purpose", "status", "startedAt"]) text(value[key]);
	for (const key of ["sessionId", "workerId", "phase", "finishedAt", "summary"]) nullableText(value[key]);
	boolean(value.legacy);
	for (const key of ["changedEntries", "retainedEntries", "waitingEntries"]) count(value[key]);
	if (value.remainingEntries !== null) count(value.remainingEntries);
	return value;
}
function parseActivitySnapshot(value) {
	exactObject(value, ["parentSessionId", "revision", "reflection", "running", "latestChanged", "latestFailure", "records"]);
	text(value.parentSessionId);
	count(value.revision);
	if (!Array.isArray(value.reflection)) throw new TypeError("空间整理状态必须是数组");
	for (const state of value.reflection) {
		exactObject(state, ["namespace", "nextEligibleAt", "retryCount", "retryReason"]);
		text(state.namespace);
		nullableText(state.nextEligibleAt);
		count(state.retryCount);
		nullableText(state.retryReason);
	}
	for (const key of ["running", "records"]) {
		if (!Array.isArray(value[key])) throw new TypeError("运行状态必须是数组");
		for (const row of value[key]) { if (row === null) throw new TypeError("运行状态缺少记录"); item(row); }
	}
	item(value.latestChanged);
	item(value.latestFailure);
	return value;
}
function parseActivityFrame(value) {
	exactObject(value, ["type", "snapshot"]);
	if (value.type !== "snapshot" && value.type !== "update") throw new TypeError("未知的记忆状态帧");
	parseActivitySnapshot(value.snapshot);
	return value;
}
function parseWorkers(value) {
	if (!Array.isArray(value)) throw new TypeError("维护会话必须是数组");
	for (const worker of value) {
		exactObject(worker, ["id", "purpose", "parentSessionId", "status", "runId", "phase", "canStop"]);
		nullableText(worker.id);
		text(worker.parentSessionId);
		if (!["turn_review", "batch"].includes(worker.purpose)) throw new TypeError("未知的维护会话用途");
		if (!["idle", "running", "stopping"].includes(worker.status)) throw new TypeError("未知的维护会话状态");
		nullableText(worker.runId);
		nullableText(worker.phase);
		boolean(worker.canStop);
	}
	return value;
}
function parseWorkerHistory(value) {
	exactObject(value, ["workerId", "purpose", "rows", "offset", "nextOffset", "hasMore", "hasPrevious", "totalEvents", "minOffset"]);
	text(value.workerId);
	text(value.purpose);
	for (const key of ["offset", "nextOffset", "totalEvents", "minOffset"]) count(value[key]);
	boolean(value.hasMore);
	boolean(value.hasPrevious);
	if (!Array.isArray(value.rows)) throw new TypeError("会话记录必须是数组");
	for (const row of value.rows) {
		exactObject(row, ["id", "kind", "text", "at"]);
		text(row.id);
		if (!["assistant", "reasoning", "tool", "result", "notice"].includes(row.kind)) throw new TypeError("未知的会话记录类型");
		text(row.text);
		nullableText(row.at);
	}
	return value;
}
function parseStop(value) { exactObject(value, ["stopped"]); boolean(value.stopped); return value; }
const codec = (name, parse) => ({ mode: "strict", typeSymbol: STATUS_PACKAGE + "#" + name, create: () => ({ parse }) });
const parameter = { name: "sessionId", wire: "sessionId", source: "json", codec: codec("SessionId", text) };
const workerParameter = { name: "workerId", wire: "workerId", source: "json", codec: codec("WorkerId", text) };
const offsetParameter = { name: "offset", wire: "offset", source: "json", codec: codec("HistoryOffset", value => value === null ? null : count(value)) };
const limitParameter = { name: "limit", wire: "limit", source: "json", codec: codec("HistoryLimit", count) };
const STATUS_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		{ id: STATUS_PACKAGE + "#getSnapshot", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "getSnapshot", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivitySnapshot", parseActivitySnapshot) },
		{ id: STATUS_PACKAGE + "#watch", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "watch", mode: "stream", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("ActivityFrame", parseActivityFrame) },
		{ id: STATUS_PACKAGE + "#listWorkers", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "listWorkers", invocation: { kind: "direct" }, parameters: [parameter], cancellation: { parameter: "signal" }, result: codec("MaintenanceWorkers", parseWorkers) },
		{ id: STATUS_PACKAGE + "#readWorker", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "readWorker", invocation: { kind: "direct" }, parameters: [parameter, workerParameter, offsetParameter, limitParameter], cancellation: { parameter: "signal" }, result: codec("WorkerHistory", parseWorkerHistory) },
		{ id: STATUS_PACKAGE + "#stopWorker", service: STATUS_SERVICE, namespace: STATUS_SERVICE, method: "stopWorker", invocation: { kind: "direct" }, parameters: [parameter, workerParameter], cancellation: { parameter: "signal" }, result: codec("WorkerStop", parseStop) },
	],
};

function stringValue(value) {
	if (typeof value !== "string") throw new TypeError("记忆文本必须是字符串");
	return value;
}
function inputObject(value, required, optional = []) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆参数必须是对象");
	const allowed = new Set([...required, ...optional]);
	if (Object.keys(value).some(key => !allowed.has(key)) || required.some(key => !Object.hasOwn(value, key))) throw new TypeError("记忆参数字段不匹配");
	return value;
}
function parseEntry(value) {
	exactObject(value, ["namespace", "kind", "key"]);
	text(value.namespace);
	if (!["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	text(value.key);
	return value;
}
function parseListEntriesInput(value) {
	inputObject(value, ["namespace"], ["kind", "query", "includeArchived"]);
	text(value.namespace);
	if (value.kind !== undefined && !["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	if (value.query !== undefined) stringValue(value.query);
	if (value.includeArchived !== undefined) boolean(value.includeArchived);
	return value;
}
function parseEntryInput(value) {
	inputObject(value, ["entry"]);
	parseEntry(value.entry);
	return value;
}
function parseCreateInput(value) {
	inputObject(value, ["namespace", "kind", "topic", "content", "evidence"]);
	text(value.namespace);
	if (!["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	text(value.topic);
	stringValue(value.content);
	stringValue(value.evidence);
	return value;
}
function parseUpdateInput(value) {
	inputObject(value, ["entry", "content"], ["evidence", "ifRevision"]);
	parseEntry(value.entry);
	stringValue(value.content);
	if (value.evidence !== undefined) stringValue(value.evidence);
	if (value.ifRevision !== undefined) stringValue(value.ifRevision);
	return value;
}
function parseArchivedInput(value) {
	inputObject(value, ["entry", "archived"]);
	parseEntry(value.entry);
	boolean(value.archived);
	return value;
}
function parseRollbackInput(value) {
	inputObject(value, ["entry", "snapshotId"]);
	parseEntry(value.entry);
	text(value.snapshotId);
	return value;
}
function parseNamespaces(value) {
	if (!Array.isArray(value)) throw new TypeError("命名空间列表必须是数组");
	for (const row of value) {
		exactObject(row, ["namespace", "workspace"]);
		text(row.namespace);
		nullableText(row.workspace);
	}
	return value;
}
function parseNamespaceInput(value) {
	inputObject(value, ["namespace"]);
	text(value.namespace);
	return value;
}
function parseListEntriesPageInput(value) {
	inputObject(value, ["namespace"], ["kind", "query", "includeArchived", "offset", "limit"]);
	text(value.namespace);
	if (value.kind !== undefined && !["rule", "fact", "sop"].includes(value.kind)) throw new TypeError("未知的记忆类型");
	if (value.query !== undefined) stringValue(value.query);
	if (value.includeArchived !== undefined) boolean(value.includeArchived);
	if (value.offset !== undefined) count(value.offset);
	if (value.limit !== undefined) count(value.limit);
	return value;
}
function parseInjectionInput(value) {
	inputObject(value, ["namespace"], ["query"]);
	text(value.namespace);
	if (value.query !== undefined) stringValue(value.query);
	return value;
}
// 容错解析：缺字段或类型不符按 0 处理，避免旧服务端数据让整个面板报错。
function parseNamespaceStats(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("索引占用统计必须是对象");
	const chars = key => (Number.isSafeInteger(value[key]) && value[key] >= 0 ? value[key] : 0);
	return {
		namespace: typeof value.namespace === "string" ? value.namespace : "",
		indexChars: chars("indexChars"),
		budgetChars: chars("budgetChars"),
		headChars: chars("headChars"),
		rulesChars: chars("rulesChars"),
		factsChars: chars("factsChars"),
		sopsChars: chars("sopsChars"),
		rulesLines: chars("rulesLines"),
		ruleCount: chars("ruleCount"),
		factCount: chars("factCount"),
		sopCount: chars("sopCount"),
	};
}
function parseRelatedList(value) {
	if (!Array.isArray(value)) throw new TypeError("关联列表必须是数组");
	for (const row of value) {
		if (!row || typeof row !== "object") throw new TypeError("关联项必须是对象");
		text(row.namespace);
		text(row.kind);
		text(row.key);
	}
	return value;
}
function parseEntryRow(value) {
	if (!value || typeof value !== "object") throw new TypeError("记忆条目必须是对象");
	parseEntry(value.entry);
	text(value.title);
	boolean(value.archived);
	nullableText(value.updatedAt);
	count(value.chars);
	if (value.heat !== undefined) number(value.heat);
	if (value.accessCount !== undefined) count(value.accessCount);
	nullableText(value.lastAt);
	if (value.related !== undefined) parseRelatedList(value.related);
	if (value.relatedCount !== undefined) count(value.relatedCount);
	stringValue(value.summary);
	if (value.rank !== null && value.rank !== undefined) count(value.rank);
	if (!["rule", "cold", "hot", "archived"].includes(value.injectionStatus)) throw new TypeError("未知的记忆注入状态");
	return value;
}
function parseEntries(value) {
	if (!Array.isArray(value)) throw new TypeError("记忆列表必须是数组");
	for (const row of value) parseEntryRow(row);
	return value;
}
function parseKindCounts(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆分类统计必须是对象");
	for (const key of ["rule", "fact", "sop", "total"]) count(value[key]);
	return value;
}
function parseEntriesPage(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("记忆列表分页必须是对象");
	text(value.namespace);
	if (!Array.isArray(value.entries)) throw new TypeError("记忆列表必须是数组");
	for (const row of value.entries) parseEntryRow(row);
	const facets = value.facets;
	if (!facets || typeof facets !== "object" || Array.isArray(facets)) throw new TypeError("记忆库存统计必须是对象");
	count(facets.total);
	parseKindCounts(facets.active);
	parseKindCounts(facets.archived);
	for (const key of ["matched", "returned", "offset", "limit"]) count(value[key]);
	boolean(value.truncated);
	return value;
}
function parseReadEntry(value) {
	if (!value || typeof value !== "object") throw new TypeError("记忆条目详情必须是对象");
	parseEntry(value.entry);
	text(value.title);
	stringValue(value.content);
	text(value.revision);
	boolean(value.archived);
	stringValue(value.evidence);
	nullableText(value.sourceSession);
	nullableText(value.createdAt);
	nullableText(value.updatedAt);
	return value;
}
function parseCreatedEntry(value) {
	exactObject(value, ["entry", "revision"]);
	parseEntry(value.entry);
	text(value.revision);
	return value;
}
function parseRevision(value) {
	exactObject(value, ["revision"]);
	text(value.revision);
	return value;
}
function parseArchived(value) {
	exactObject(value, ["ok"]);
	if (value.ok !== true) throw new TypeError("记忆归档结果不正确");
	return value;
}
function parseHistoryChange(value) {
	exactObject(value, ["contentDelta", "evidenceChanged", "initial"]);
	if (value.contentDelta !== null) {
		if (!Number.isSafeInteger(value.contentDelta)) throw new TypeError("内容变化量必须是整数");
	}
	boolean(value.evidenceChanged);
	boolean(value.initial);
	return value;
}
function parseHistory(value) {
	if (!Array.isArray(value)) throw new TypeError("历史快照列表必须是数组");
	for (const row of value) {
		exactObject(row, ["snapshotId", "createdAt", "revision", "chars", "summary", "preview", "change"]);
		text(row.snapshotId);
		text(row.createdAt);
		text(row.revision);
		count(row.chars);
		stringValue(row.summary);
		stringValue(row.preview);
		parseHistoryChange(row.change);
	}
	return value;
}

function parseInjectionItem(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("注入条目必须是对象");
	text(value.kind);
	text(value.key);
	text(value.title);
	count(value.chars);
	number(value.heat);
	if (value.rank !== null && value.rank !== undefined) count(value.rank);
	if (!["rule", "included", "cold", "recall", "partial", "omitted", "unknown"].includes(value.status)) throw new TypeError("未知的注入状态");
	boolean(value.included);
	if (!["body", "title", null].includes(value.promptLevel)) throw new TypeError("未知的提示词层级");
	nullableText(value.promptToken);
	nullableText(value.promptNamespace);
	if (value.promptLine !== null && value.promptLine !== undefined) count(value.promptLine);
	count(value.relatedCount);
	parseRelatedList(value.related);
	return value;
}
function parseInjectionState(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("注入预览必须是对象");
	text(value.namespace);
	boolean(value.preview);
	text(value.previewKind);
	text(value.disclaimer);
	boolean(value.sessionTracked);
	const basis = value.basis;
	if (!basis || typeof basis !== "object" || Array.isArray(basis)) throw new TypeError("注入预览依据必须是对象");
	for (const key of ["heatHalfLifeDays", "heatRecencyWindowDays", "relatedBonus", "relatedCap", "newEntryDays", "newEntryBonus", "rulesMinRatio", "coldRatio", "coldMax", "coldPoolStart", "recallLimit", "indexTargetRatio"]) number(basis[key]);
	text(basis.coldSeedScope);
	nullableText(basis.recallQuery);
	boolean(basis.rulesAttributed);
	boolean(basis.coldRatioApplied);
	stringValue(value.combinedText);
	if (!Array.isArray(value.sections)) throw new TypeError("注入分段必须是数组");
	for (const section of value.sections) {
		if (!section || typeof section !== "object") throw new TypeError("注入分段必须是对象");
		text(section.namespace);
		stringValue(section.text);
		count(section.totalChars);
		count(section.shownChars);
		count(section.maxChars);
		boolean(section.overLimit);
		count(section.entryCount);
		count(section.includedCount);
		count(section.omittedCount);
		boolean(section.coldRatioApplied);
	}
	for (const key of ["budgetChars", "indexChars", "targetChars", "triggerChars", "coldCount", "coldIncludedCount", "rankedCount", "includedCount", "omittedCount", "partialCount", "recallCount", "combinedIncludedCount"]) count(value[key]);
	const counts = value.counts;
	if (!counts || typeof counts !== "object" || Array.isArray(counts)) throw new TypeError("注入条目统计必须是对象");
	for (const key of ["total", "active", "archived", "rule", "fact", "sop"]) count(counts[key]);
	if (!Array.isArray(value.items)) throw new TypeError("注入条目必须是数组");
	for (const item of value.items) parseInjectionItem(item);
	return value;
}
function parseMaintenanceReport(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("维护报告必须是对象");
	const graph = value.graph;
	if (!graph || typeof graph !== "object" || Array.isArray(graph)) throw new TypeError("关系图谱必须是对象");
	if (!Array.isArray(graph.nodes)) throw new TypeError("关系图节点必须是数组");
	for (const node of graph.nodes) {
		if (!node || typeof node !== "object") throw new TypeError("关系图节点必须是对象");
		text(node.id);
		text(node.namespace);
		text(node.kind);
		text(node.key);
		text(node.title);
		number(node.heat);
		count(node.chars);
		count(node.degree);
	}
	if (!Array.isArray(graph.edges)) throw new TypeError("关系图边必须是数组");
	for (const edge of graph.edges) {
		if (!edge || typeof edge !== "object") throw new TypeError("关系图边必须是对象");
		text(edge.source);
		text(edge.target);
		text(edge.type);
		text(edge.sourceNamespace);
		text(edge.targetNamespace);
		if (edge.similarity !== null && edge.similarity !== undefined) number(edge.similarity);
	}
	count(graph.nodeCount);
	count(graph.edgeCount);
	if (graph.skipped !== undefined) {
		if (!Array.isArray(graph.skipped)) throw new TypeError("跳过的边必须是数组");
		for (const row of graph.skipped) {
			if (!row || typeof row !== "object") throw new TypeError("跳过的边必须是对象");
			text(row.source);
			text(row.target);
			text(row.type);
			text(row.reason);
		}
	}
	return value;
}
const storeParameter = (name, parse) => ({ name: "args", wire: "args", source: "json", codec: codec(name, parse) });
const storeDescriptor = (method, parseResult, parseInput) => ({
	id: STATUS_PACKAGE + "#" + method,
	service: STATUS_SERVICE,
	namespace: STATUS_SERVICE,
	method,
	invocation: { kind: "direct" },
	parameters: parseInput ? [storeParameter(method + "Input", parseInput)] : [],
	cancellation: { parameter: "signal" },
	result: codec(method + "Result", parseResult),
});
const STORE_REMOTE = {
	package: STATUS_PACKAGE,
	descriptors: [
		storeDescriptor("listNamespaces", parseNamespaces),
		storeDescriptor("namespaceStats", parseNamespaceStats, parseNamespaceInput),
		storeDescriptor("listEntries", parseEntries, parseListEntriesInput),
		storeDescriptor("listEntriesPage", parseEntriesPage, parseListEntriesPageInput),
		storeDescriptor("readEntry", parseReadEntry, parseEntryInput),
		storeDescriptor("createEntry", parseCreatedEntry, parseCreateInput),
		storeDescriptor("updateEntry", parseRevision, parseUpdateInput),
		storeDescriptor("setArchived", parseArchived, parseArchivedInput),
		storeDescriptor("entryHistory", parseHistory, parseEntryInput),
		storeDescriptor("rollbackEntry", parseRevision, parseRollbackInput),
		storeDescriptor("getInjectionState", parseInjectionState, parseInjectionInput),
		storeDescriptor("getMaintenanceReport", parseMaintenanceReport, parseNamespaceInput),
	],
};

function createStatusClient(require, styles) {
	const React = require("react");
	const { createPortal } = require("react-dom");
	const { Button, SegmentedControl, IconWarningOutlineRegular, useAnchoredPosition, useDismissOnOutsidePointer } = require("@deepseek-ai/dsh-client-ui-primitives");
	const { RemoteSnapshotStream, RemoteStreamCarrierError } = require("@deepseek-ai/dsh-api-gateway/client");
	const h = React.createElement;
	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}
	const locale = "layered-memory-status";
	const dictionaries = {
		zh: {
			"retrySchedule": "自动整理计划", "nextEligibleAt": "最早可重试时间", "retryCount": "连续退避 {count} 次", "retryReason": "原因", "retry-failed": "运行失败", "retry-timeout": "运行超时", "retry-deferred": "尚未完成", "retry-no_progress": "本轮无进展", "retry-interrupted": "运行中断", "retry-user_stopped": "本次已停止", "retry-cooldown": "共享冷却",
			reviewing: "正在核对记忆", organizing: "正在整理记忆", changed: "记忆已整理 {count} 条",
			settled: "记忆核对完成", awaitingEvidence: "记忆等待补充证据", idle: "记忆待命", initializing: "记忆状态加载中",
			stoppedReview: "记忆核对已停止", stoppedBatch: "记忆整理已停止",
			failed: "上次记忆核对未完成", partial: "记忆已整理 {count} 条 · 上次核对未完成", details: "查看记忆活动",
			unavailable: "记忆状态暂不可用", concurrent: "还有 {count} 项记忆任务运行中",
			activity: "记忆活动", runs: "运行记录", current: "当前任务", reviewWorker: "核对会话", batchWorker: "整理会话",
			review: "本轮核对", batch: "批量整理", legacy: "旧记录", empty: "还没有维护记录", historyEmpty: "暂无可显示的记录",
			loading: "正在读取…", refresh: "更新", older: "更早记录", stopping: "停止中…", stop: "停止", notStarted: "尚未开始",
			changedCount: "变更 {count} 条", retainedCount: "保留 {count} 条", waitingCount: "待证据 {count} 条", remainingCount: "未完成 {count} 条",
			"phase-preparing": "准备中", "phase-compacting": "压缩会话", "phase-running": "执行中", "phase-finishing": "保存结果", "phase-stopping": "正在停止", "phase-stopped": "已停止",
			"state-running": "运行中", "state-reviewed": "已完成", "state-unchanged": "无需更新", "state-waiting_evidence": "等待证据", "state-deferred": "未完成", "state-failed": "失败", "state-idle": "空闲", "state-stopped": "已停止",
			"trace-assistant": "回复", "trace-reasoning": "思考", "trace-tool": "工具调用", "trace-result": "工具结果", "trace-notice": "运行事件",
		},
		en: {
			"retrySchedule": "Organization schedule", "nextEligibleAt": "Next eligible time", "retryCount": "Backoff count: {count}", "retryReason": "Reason", "retry-failed": "Run failed", "retry-timeout": "Run timed out", "retry-deferred": "Incomplete", "retry-no_progress": "No progress", "retry-interrupted": "Run interrupted", "retry-user_stopped": "Current run stopped", "retry-cooldown": "Shared cooldown",
			reviewing: "Reviewing memory", organizing: "Organizing memory", changed: "Organized {count} memory entries",
			settled: "Memory review complete", awaitingEvidence: "Memory awaiting evidence", idle: "Memory ready", initializing: "Loading memory status",
			stoppedReview: "Memory review stopped", stoppedBatch: "Memory organization stopped",
			failed: "Last memory review incomplete", partial: "Organized {count} entries · last review incomplete", details: "View memory activity",
			unavailable: "Memory status unavailable", concurrent: "{count} more memory tasks running",
			activity: "Memory activity", runs: "Runs", current: "Current task", reviewWorker: "Review session", batchWorker: "Organization session",
			review: "Turn review", batch: "Memory organization", legacy: "Legacy", empty: "No maintenance runs yet", historyEmpty: "No records to display",
			loading: "Loading…", refresh: "Refresh", older: "Earlier records", stopping: "Stopping…", stop: "Stop", notStarted: "Not started",
			changedCount: "{count} changed", retainedCount: "{count} retained", waitingCount: "{count} awaiting evidence", remainingCount: "{count} remaining",
			"phase-preparing": "Preparing", "phase-compacting": "Compacting session", "phase-running": "Running", "phase-finishing": "Saving results", "phase-stopping": "Stopping", "phase-stopped": "Stopped",
			"state-running": "Running", "state-reviewed": "Completed", "state-unchanged": "No changes needed", "state-waiting_evidence": "Awaiting evidence", "state-deferred": "Incomplete", "state-failed": "Failed", "state-idle": "Idle", "state-stopped": "Stopped",
			"trace-assistant": "Reply", "trace-reasoning": "Thinking", "trace-tool": "Tool call", "trace-result": "Tool result", "trace-notice": "Run event",
		},
		ja: {
			"retrySchedule": "整理の再実行予定", "nextEligibleAt": "次回実行可能時刻", "retryCount": "連続待機 {count} 回", "retryReason": "理由", "retry-failed": "実行失敗", "retry-timeout": "実行タイムアウト", "retry-deferred": "未完了", "retry-no_progress": "進展なし", "retry-interrupted": "実行中断", "retry-user_stopped": "今回の実行を停止", "retry-cooldown": "共通クールダウン",
			"reviewing": "メモリを確認中", "organizing": "メモリを整理中", "changed": "メモリを {count} 件整理しました",
			"settled": "メモリ確認完了", "awaitingEvidence": "メモリは根拠待ち", "idle": "メモリ待機中", "initializing": "メモリ状態を読み込み中",
			"stoppedReview": "メモリ確認を停止しました", "stoppedBatch": "メモリ整理を停止しました",
			"failed": "前回のメモリ確認は未完了", "partial": "メモリを {count} 件整理 · 前回の確認は未完了", "details": "メモリ活動を表示",
			"unavailable": "メモリ状態は利用できません", "concurrent": "他に {count} 件のメモリタスクが実行中",
			"activity": "メモリ活動", "runs": "実行記録", "current": "現在のタスク", "reviewWorker": "確認セッション", "batchWorker": "整理セッション",
			"review": "今回の確認", "batch": "一括整理", "legacy": "旧記録", "empty": "まだメンテナンス記録がありません", "historyEmpty": "表示できる記録がありません",
			"loading": "読み込み中…", "refresh": "更新", "older": "以前の記録", "stopping": "停止中…", "stop": "停止", "notStarted": "未開始",
			"changedCount": "変更 {count} 件", "retainedCount": "保持 {count} 件", "waitingCount": "根拠待ち {count} 件", "remainingCount": "未完了 {count} 件",
			"phase-preparing": "準備中", "phase-compacting": "セッションを圧縮", "phase-running": "実行中", "phase-finishing": "結果を保存", "phase-stopping": "停止中", "phase-stopped": "停止済み",
			"state-running": "実行中", "state-reviewed": "完了", "state-unchanged": "更新不要", "state-waiting_evidence": "根拠待ち", "state-deferred": "未完了", "state-failed": "失敗", "state-idle": "アイドル", "state-stopped": "停止済み",
			"trace-assistant": "返信", "trace-reasoning": "思考", "trace-tool": "ツール呼び出し", "trace-result": "ツール結果", "trace-notice": "実行イベント",
		},
		es: {
			"retrySchedule": "Plan de organización", "nextEligibleAt": "Próxima hora elegible", "retryCount": "Esperas consecutivas: {count}", "retryReason": "Motivo", "retry-failed": "Ejecución fallida", "retry-timeout": "Tiempo agotado", "retry-deferred": "Incompleto", "retry-no_progress": "Sin progreso", "retry-interrupted": "Ejecución interrumpida", "retry-user_stopped": "Ejecución actual detenida", "retry-cooldown": "Espera compartida",
			"reviewing": "Revisando memoria", "organizing": "Organizando memoria", "changed": "Se organizaron {count} entradas",
			"settled": "Revisión de memoria completa", "awaitingEvidence": "Memoria esperando evidencia", "idle": "Memoria lista", "initializing": "Cargando estado de memoria",
			"stoppedReview": "Revisión de memoria detenida", "stoppedBatch": "Organización detenida",
			"failed": "La última revisión quedó incompleta", "partial": "{count} entradas organizadas · última revisión incompleta", "details": "Ver actividad de memoria",
			"unavailable": "Estado de memoria no disponible", "concurrent": "{count} tareas de memoria en ejecución",
			"activity": "Actividad de memoria", "runs": "Ejecuciones", "current": "Tarea actual", "reviewWorker": "Sesión de revisión", "batchWorker": "Sesión de organización",
			"review": "Revisión del turno", "batch": "Organización por lotes", "legacy": "Histórico", "empty": "Aún no hay registros de mantenimiento", "historyEmpty": "No hay registros que mostrar",
			"loading": "Cargando…", "refresh": "Actualizar", "older": "Registros anteriores", "stopping": "Deteniendo…", "stop": "Detener", "notStarted": "Sin empezar",
			"changedCount": "{count} cambiadas", "retainedCount": "{count} retenidas", "waitingCount": "{count} esperando evidencia", "remainingCount": "{count} pendientes",
			"phase-preparing": "Preparando", "phase-compacting": "Compactando sesión", "phase-running": "En ejecución", "phase-finishing": "Guardando resultados", "phase-stopping": "Deteniendo", "phase-stopped": "Detenido",
			"state-running": "En ejecución", "state-reviewed": "Completado", "state-unchanged": "Sin cambios", "state-waiting_evidence": "Esperando evidencia", "state-deferred": "Incompleto", "state-failed": "Fallido", "state-idle": "Inactivo", "state-stopped": "Detenido",
			"trace-assistant": "Respuesta", "trace-reasoning": "Pensamiento", "trace-tool": "Llamada a herramienta", "trace-result": "Resultado de herramienta", "trace-notice": "Evento de ejecución",
		},
		fr: {
			"retrySchedule": "Plan d’organisation", "nextEligibleAt": "Prochaine heure admissible", "retryCount": "Attentes consécutives : {count}", "retryReason": "Motif", "retry-failed": "Échec de l’exécution", "retry-timeout": "Délai dépassé", "retry-deferred": "Incomplet", "retry-no_progress": "Aucun progrès", "retry-interrupted": "Exécution interrompue", "retry-user_stopped": "Exécution actuelle arrêtée", "retry-cooldown": "Délai partagé",
			"reviewing": "Vérification de la mémoire", "organizing": "Organisation de la mémoire", "changed": "{count} entrées organisées",
			"settled": "Vérification terminée", "awaitingEvidence": "Mémoire en attente de preuve", "idle": "Mémoire prête", "initializing": "Chargement de l’état",
			"stoppedReview": "Vérification arrêtée", "stoppedBatch": "Organisation arrêtée",
			"failed": "La dernière vérification est incomplète", "partial": "{count} entrées organisées · vérification incomplète", "details": "Voir l’activité",
			"unavailable": "État de la mémoire indisponible", "concurrent": "{count} autres tâches en cours",
			"activity": "Activité mémoire", "runs": "Exécutions", "current": "Tâche actuelle", "reviewWorker": "Session de vérification", "batchWorker": "Session d’organisation",
			"review": "Vérification du tour", "batch": "Organisation par lot", "legacy": "Anciens enregistrements", "empty": "Aucun entretien enregistré", "historyEmpty": "Aucun enregistrement à afficher",
			"loading": "Chargement…", "refresh": "Actualiser", "older": "Enregistrements antérieurs", "stopping": "Arrêt…", "stop": "Arrêter", "notStarted": "Non démarré",
			"changedCount": "{count} modifiées", "retainedCount": "{count} conservées", "waitingCount": "{count} en attente de preuve", "remainingCount": "{count} restantes",
			"phase-preparing": "Préparation", "phase-compacting": "Compactage de la session", "phase-running": "En cours", "phase-finishing": "Enregistrement des résultats", "phase-stopping": "Arrêt", "phase-stopped": "Arrêté",
			"state-running": "En cours", "state-reviewed": "Terminé", "state-unchanged": "Aucun changement", "state-waiting_evidence": "En attente de preuve", "state-deferred": "Incomplet", "state-failed": "Échec", "state-idle": "Inactif", "state-stopped": "Arrêté",
			"trace-assistant": "Réponse", "trace-reasoning": "Réflexion", "trace-tool": "Appel d’outil", "trace-result": "Résultat d’outil", "trace-notice": "Événement d’exécution",
		},
		de: {
			"retrySchedule": "Organisationsplan", "nextEligibleAt": "Nächster möglicher Start", "retryCount": "Wartefolgen: {count}", "retryReason": "Grund", "retry-failed": "Lauf fehlgeschlagen", "retry-timeout": "Zeitüberschreitung", "retry-deferred": "Unvollständig", "retry-no_progress": "Kein Fortschritt", "retry-interrupted": "Lauf unterbrochen", "retry-user_stopped": "Aktueller Lauf gestoppt", "retry-cooldown": "Gemeinsame Wartezeit",
			"reviewing": "Speicher wird geprüft", "organizing": "Speicher wird organisiert", "changed": "{count} Einträge organisiert",
			"settled": "Speicherprüfung abgeschlossen", "awaitingEvidence": "Speicher wartet auf Nachweis", "idle": "Speicher bereit", "initializing": "Speicherstatus wird geladen",
			"stoppedReview": "Speicherprüfung gestoppt", "stoppedBatch": "Speicherorganisation gestoppt",
			"failed": "Letzte Speicherprüfung unvollständig", "partial": "{count} Einträge organisiert · letzte Prüfung unvollständig", "details": "Speicheraktivität anzeigen",
			"unavailable": "Speicherstatus nicht verfügbar", "concurrent": "{count} weitere Speicheraufgaben laufen",
			"activity": "Speicheraktivität", "runs": "Läufe", "current": "Aktuelle Aufgabe", "reviewWorker": "Prüfsitzung", "batchWorker": "Organisationssitzung",
			"review": "Prüfung dieses Turns", "batch": "Sammelorganisation", "legacy": "Altbestand", "empty": "Noch keine Wartungsläufe", "historyEmpty": "Keine Einträge anzuzeigen",
			"loading": "Wird geladen…", "refresh": "Aktualisieren", "older": "Frühere Einträge", "stopping": "Wird gestoppt…", "stop": "Stoppen", "notStarted": "Nicht gestartet",
			"changedCount": "{count} geändert", "retainedCount": "{count} behalten", "waitingCount": "{count} warten auf Nachweis", "remainingCount": "{count} offen",
			"phase-preparing": "Vorbereitung", "phase-compacting": "Sitzung wird komprimiert", "phase-running": "Läuft", "phase-finishing": "Ergebnisse werden gespeichert", "phase-stopping": "Wird gestoppt", "phase-stopped": "Gestoppt",
			"state-running": "Läuft", "state-reviewed": "Abgeschlossen", "state-unchanged": "Keine Änderungen", "state-waiting_evidence": "Wartet auf Nachweis", "state-deferred": "Unvollständig", "state-failed": "Fehlgeschlagen", "state-idle": "Leerlauf", "state-stopped": "Gestoppt",
			"trace-assistant": "Antwort", "trace-reasoning": "Denken", "trace-tool": "Werkzeugaufruf", "trace-result": "Werkzeugergebnis", "trace-notice": "Laufereignis",
		},
		ru: {
			"retrySchedule": "План организации", "nextEligibleAt": "Следующее допустимое время", "retryCount": "Отсрочек подряд: {count}", "retryReason": "Причина", "retry-failed": "Сбой запуска", "retry-timeout": "Время истекло", "retry-deferred": "Не завершено", "retry-no_progress": "Нет прогресса", "retry-interrupted": "Запуск прерван", "retry-user_stopped": "Текущий запуск остановлен", "retry-cooldown": "Общая пауза",
			"reviewing": "Проверка памяти", "organizing": "Организация памяти", "changed": "Организовано {count} записей",
			"settled": "Проверка памяти завершена", "awaitingEvidence": "Память ждёт доказательств", "idle": "Память готова", "initializing": "Загрузка состояния памяти",
			"stoppedReview": "Проверка памяти остановлена", "stoppedBatch": "Организация остановлена",
			"failed": "Прошлая проверка не завершена", "partial": "Организовано {count} записей · проверка не завершена", "details": "Показать активность памяти",
			"unavailable": "Состояние памяти недоступно", "concurrent": "Ещё {count} задач памяти выполняется",
			"activity": "Активность памяти", "runs": "Запуски", "current": "Текущая задача", "reviewWorker": "Сеанс проверки", "batchWorker": "Сеанс организации",
			"review": "Проверка хода", "batch": "Пакетная организация", "legacy": "Старые записи", "empty": "Записей обслуживания пока нет", "historyEmpty": "Нет записей для отображения",
			"loading": "Загрузка…", "refresh": "Обновить", "older": "Ранние записи", "stopping": "Остановка…", "stop": "Остановить", "notStarted": "Не начато",
			"changedCount": "Изменено {count}", "retainedCount": "Сохранено {count}", "waitingCount": "Ждут доказательств {count}", "remainingCount": "Осталось {count}",
			"phase-preparing": "Подготовка", "phase-compacting": "Сжатие сеанса", "phase-running": "Выполнение", "phase-finishing": "Сохранение результатов", "phase-stopping": "Остановка", "phase-stopped": "Остановлено",
			"state-running": "Выполняется", "state-reviewed": "Завершено", "state-unchanged": "Без изменений", "state-waiting_evidence": "Ждёт доказательств", "state-deferred": "Не завершено", "state-failed": "Ошибка", "state-idle": "Простой", "state-stopped": "Остановлено",
			"trace-assistant": "Ответ", "trace-reasoning": "Размышление", "trace-tool": "Вызов инструмента", "trace-result": "Результат инструмента", "trace-notice": "Событие запуска",
		},
		pt: {
			"retrySchedule": "Plano de organização", "nextEligibleAt": "Próximo horário elegível", "retryCount": "Esperas consecutivas: {count}", "retryReason": "Motivo", "retry-failed": "Falha na execução", "retry-timeout": "Tempo esgotado", "retry-deferred": "Incompleto", "retry-no_progress": "Sem progresso", "retry-interrupted": "Execução interrompida", "retry-user_stopped": "Execução atual interrompida", "retry-cooldown": "Espera compartilhada",
			"reviewing": "Revisando memória", "organizing": "Organizando memória", "changed": "{count} entradas organizadas",
			"settled": "Revisão da memória concluída", "awaitingEvidence": "Memória aguardando evidência", "idle": "Memória pronta", "initializing": "Carregando estado da memória",
			"stoppedReview": "Revisão da memória interrompida", "stoppedBatch": "Organização interrompida",
			"failed": "A última revisão ficou incompleta", "partial": "{count} entradas organizadas · revisão incompleta", "details": "Ver atividade da memória",
			"unavailable": "Estado da memória indisponível", "concurrent": "Mais {count} tarefas de memória em execução",
			"activity": "Atividade da memória", "runs": "Execuções", "current": "Tarefa atual", "reviewWorker": "Sessão de revisão", "batchWorker": "Sessão de organização",
			"review": "Revisão do turno", "batch": "Organização em lote", "legacy": "Registros antigos", "empty": "Ainda não há registros de manutenção", "historyEmpty": "Sem registros para exibir",
			"loading": "Carregando…", "refresh": "Atualizar", "older": "Registros anteriores", "stopping": "Parando…", "stop": "Parar", "notStarted": "Não iniciado",
			"changedCount": "{count} alteradas", "retainedCount": "{count} mantidas", "waitingCount": "{count} aguardando evidência", "remainingCount": "{count} restantes",
			"phase-preparing": "Preparando", "phase-compacting": "Compactando sessão", "phase-running": "Em execução", "phase-finishing": "Salvando resultados", "phase-stopping": "Parando", "phase-stopped": "Parado",
			"state-running": "Em execução", "state-reviewed": "Concluído", "state-unchanged": "Sem alterações", "state-waiting_evidence": "Aguardando evidência", "state-deferred": "Incompleto", "state-failed": "Falhou", "state-idle": "Ocioso", "state-stopped": "Parado",
			"trace-assistant": "Resposta", "trace-reasoning": "Raciocínio", "trace-tool": "Chamada de ferramenta", "trace-result": "Resultado da ferramenta", "trace-notice": "Evento de execução",
		},
	};
	function createStore(remote, sessionId, stores) {
		let value = { snapshot: null, error: false };
		let stream;
		let closing = Promise.resolve();
		const listeners = new Set();
		const publish = next => { value = next; for (const listener of listeners) listener(); };
		const accept = frame => {
			const snapshot = parseActivityFrame(frame).snapshot;
			if (snapshot.parentSessionId !== sessionId) throw new Error("记忆状态所属会话不匹配");
			publish({ snapshot, error: false });
		};
		const fail = () => publish({ ...value, error: true });
		function start() {
			stores.add(store);
			stream = new RemoteSnapshotStream(remote.$stream({
				name: "layered memory status",
				open: signal => remote.layeredMemoryStatus.watch(sessionId, signal),
				ended: accepted => accepted ? new RemoteStreamCarrierError("记忆状态流已断开") : new Error("记忆状态流缺少初始快照"),
				carrierFailed: fail,
			}), { name: "layered memory status", isSnapshot: frame => frame.type === "snapshot", replace: accept, update: accept, failed: fail });
			stream.start();
		}
		function stop() {
			stores.delete(store);
			const current = stream;
			stream = undefined;
			if (current) closing = Promise.all([closing, current.dispose()]).then(() => undefined);
			return closing;
		}
		const store = {
			getSnapshot: () => value,
			async refresh(signal) { accept({ type: "update", snapshot: await resultValue(remote.layeredMemoryStatus.getSnapshot(sessionId, signal)) }); },
			subscribe(listener) {
				listeners.add(listener);
				if (listeners.size === 1) start();
				return () => { listeners.delete(listener); if (!listeners.size) void stop().catch(fail); };
			},
			dispose: stop,
		};
		return store;
	}
	function Brain() {
		return h("svg", { className: "lm-status-glyph", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M12 18V6a3 3 0 0 0-5.7-1.3A4 4 0 0 0 3 11a4 4 0 0 0 1.5 7.5A4 4 0 0 0 12 20a4 4 0 0 0 7.5-1.5A4 4 0 0 0 21 11a4 4 0 0 0-3.3-6.3A3 3 0 0 0 12 6" }),
			h("path", { d: "M8 8a3 3 0 0 1-3 3m14 0a3 3 0 0 1-3-3M8 16a3 3 0 0 0-3 2m14 0a3 3 0 0 0-3-2" }));
	}
	const time = value => new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
	function Counts({ run, t }) {
		return h("div", { className: "lm-run-counts" },
			h("span", null, t("changedCount", { count: run.changedEntries })),
			run.retainedEntries ? h("span", null, t("retainedCount", { count: run.retainedEntries })) : null,
			run.waitingEntries ? h("span", null, t("waitingCount", { count: run.waitingEntries })) : null,
			run.remainingEntries ? h("span", null, t("remainingCount", { count: run.remainingEntries })) : null);
	}
	function ActivityPanel({ open, snapshot, controls, panelRef, panelId, position, t }) {
		const [workers, setWorkers] = React.useState([]);
		const [workersError, setWorkersError] = React.useState(null);
		const [refresh, setRefresh] = React.useState(0);
		const [workerId, setWorkerId] = React.useState(null);
		const [history, setHistory] = React.useState({ page: null, busy: false, error: null });
		const [historyRevision, setHistoryRevision] = React.useState(0);
		const [stopping, setStopping] = React.useState(null);
		const [stopError, setStopError] = React.useState(null);
		const historyRequest = React.useRef(null);
		const stopRequest = React.useRef(null);
		const historyEnd = React.useRef(null);
		React.useEffect(() => {
			if (!open) return;
			const controller = new AbortController();
			controls.refresh(controller.signal).catch(error => { if (!controller.signal.aborted) setWorkersError(error.message); });
			return () => controller.abort();
		}, [open, controls]);
		React.useEffect(() => {
			if (!open) return;
			const controller = new AbortController();
			controls.list(controller.signal).then(value => { setWorkers(parseWorkers(value)); setWorkersError(null); }).catch(error => { if (!controller.signal.aborted) setWorkersError(error.message); });
			return () => controller.abort();
		}, [open, snapshot?.revision, refresh, controls]);
		React.useEffect(() => {
			if (!open || !workerId) return;
			const controller = new AbortController();
			historyRequest.current = controller;
			setHistory({ page: null, busy: true, error: null });
			controls.read(workerId, null, 60, controller.signal).then(value => setHistory({ page: parseWorkerHistory(value), busy: false, error: null })).catch(error => { if (!controller.signal.aborted) setHistory({ page: null, busy: false, error: error.message }); });
			return () => historyRequest.current.abort();
		}, [open, workerId, historyRevision, controls]);
		React.useEffect(() => { historyEnd.current?.scrollIntoView({ block: "nearest" }); }, [history.page?.nextOffset, workerId]);
		React.useEffect(() => () => stopRequest.current?.abort(), []);
		async function loadOlder() {
			const page = history.page;
			const offset = Math.max(page.minOffset, page.offset - 60);
			const controller = new AbortController();
			historyRequest.current = controller;
			setHistory(value => ({ ...value, busy: true, error: null }));
			try {
				const earlier = parseWorkerHistory(await controls.read(workerId, offset, page.offset - offset, controller.signal));
				setHistory({ page: { ...page, rows: [...earlier.rows, ...page.rows], offset: earlier.offset, hasPrevious: earlier.hasPrevious }, busy: false, error: null });
			} catch (error) { if (!controller.signal.aborted) setHistory(value => ({ ...value, busy: false, error: error.message })); }
		}
		async function stop(worker) {
			const controller = new AbortController();
			stopRequest.current = controller;
			setStopping(worker.id);
			setStopError(null);
			try { await controls.stop(worker.id, controller.signal); setRefresh(value => value + 1); }
			catch (error) { if (!controller.signal.aborted) setStopError(error.message); }
			finally { setStopping(null); }
		}
		function stopButton(worker) {
			return worker?.canStop ? h(Button, { variant: "ghost", size: "sm", className: "lm-stop", disabled: Boolean(stopping), onClick: () => stop(worker), "data-memory-stop": worker.purpose }, stopping === worker.id ? t("stopping") : t("stop")) : null;
		}
		function runBody(run) {
			return h(React.Fragment, null, h(Counts, { run, t }), run.summary ? h("p", { className: "lm-run-summary" }, run.summary) : null);
		}
		const worker = workers.find(value => value.id === workerId);
		const finished = snapshot?.records.filter(run => run.finishedAt !== null) || [];
		const retries = snapshot?.reflection.filter(state => state.nextEligibleAt || state.retryCount || state.retryReason) || [];
		const retryRows = retries.map(state => h("details", { key: "retry-" + state.namespace, className: "lm-finished-run", "data-memory-retry": true, "data-namespace": state.namespace },
			h("summary", null,
				h("span", null, t("retrySchedule")),
				state.retryReason ? h("span", { className: "lm-run-state", "data-state": state.retryReason }, t("retry-" + state.retryReason)) : null,
				state.retryCount > 0 ? h("span", { className: "lm-run-state" }, t("retryCount", { count: state.retryCount })) : null,
				state.nextEligibleAt ? h("time", { dateTime: state.nextEligibleAt, title: state.nextEligibleAt }, time(state.nextEligibleAt)) : null),
			h("div", { className: "lm-run-counts" },
				h("span", null, state.namespace),
				state.nextEligibleAt ? h("span", null, t("nextEligibleAt"), " ", time(state.nextEligibleAt)) : null)));
		const view = workerId || "runs";
		const tabsId = panelId + "-views";
		return h("div", { ref: panelRef, id: panelId, role: "dialog", "aria-label": t("activity"), className: "lm-activity-panel", "data-memory-details": true, style: position || { visibility: "hidden", left: 0, top: 0 } },
			h("header", { className: "lm-activity-heading" },
				h("span", { className: "lm-activity-title" }, h(Brain), t("activity"))),
			h("div", { className: "lm-activity-rule", "aria-hidden": true }),
			h(SegmentedControl, {
				id: tabsId, value: view, label: t("activity"), className: "lm-activity-tabs",
				onChange: value => setWorkerId(value === "runs" ? null : value),
				options: [{ value: "runs", label: t("runs") }, ...workers.map(value => ({ value: value.id || value.purpose, label: t(value.purpose === "turn_review" ? "reviewWorker" : "batchWorker"), disabled: !value.id, title: value.id ? undefined : t("notStarted") }))],
			}),
			workersError ? h("p", { className: "lm-activity-error", role: "alert" }, workersError) : null,
			stopError ? h("p", { className: "lm-activity-error", role: "alert" }, stopError) : null,
			h("div", { className: "lm-activity-body", role: "tabpanel", id: tabsId + "-" + view + "-panel", "aria-labelledby": tabsId + "-" + view },
			workerId === null ? h("div", { className: "lm-activity-content" },
				snapshot?.running.length ? h("section", { className: "lm-current-runs" }, h("h3", null, t("current")), ...snapshot.running.map(run => h("article", { key: run.id, className: "lm-current-run", "data-memory-run": run.id, "data-phase": run.phase },
					h("div", { className: "lm-run-heading" }, h("strong", null, t(run.purpose === "turn_review" ? "review" : "batch")), h("span", { className: "lm-run-state" }, t(run.phase ? "phase-" + run.phase : "state-running")), stopButton(workers.find(value => value.runId === run.id))), runBody(run)))) : null,
				retryRows.length || finished.length ? h("section", null, retryRows, ...finished.map(run => h("details", { key: run.id, className: "lm-finished-run", open: run.id === snapshot.latestFailure?.id, "data-memory-run": run.id, "data-run-status": run.status },
					h("summary", null, h("span", null, t(run.purpose === "turn_review" ? "review" : "batch")), h("span", { className: "lm-run-state", "data-state": run.status }, t("state-" + run.status)), run.changedEntries ? h("span", { className: "lm-run-state" }, t("changedCount", { count: run.changedEntries })) : null, h("time", { dateTime: run.finishedAt, title: run.finishedAt }, time(run.finishedAt)), run.legacy ? h("span", { className: "lm-legacy", title: run.sessionId }, t("legacy")) : null), runBody(run)))) : !snapshot?.running.length ? h("p", { className: "lm-activity-empty" }, t("empty")) : null)
				: h(React.Fragment, null,
					h("div", { className: "lm-history-heading" }, h("span", null, t(worker.phase ? "phase-" + worker.phase : "state-" + worker.status)), stopButton(worker), h(Button, { variant: "ghost", size: "sm", onClick: () => setHistoryRevision(value => value + 1), disabled: history.busy }, t("refresh"))),
					h("div", { className: "lm-activity-content lm-history", "data-memory-history": workerId },
						history.page?.hasPrevious ? h(Button, { variant: "ghost", size: "sm", className: "lm-history-older", disabled: history.busy, onClick: loadOlder }, t("older")) : null,
						history.error ? h("p", { className: "lm-activity-error", role: "alert" }, history.error) : null,
						history.busy ? h("p", { className: "lm-activity-empty", role: "status" }, t("loading")) : null,
						...((history.page?.rows || []).map(row => row.kind === "assistant" ? h("article", { key: row.id, className: "lm-history-message", "data-memory-history-row": row.id }, h("div", { className: "lm-history-label" }, t("trace-" + row.kind), row.at ? h("time", { dateTime: row.at }, time(row.at)) : null), h("div", { className: "lm-history-body" }, row.text))
							: h("details", { key: row.id, className: "lm-history-event", "data-memory-history-row": row.id }, h("summary", null, t("trace-" + row.kind), row.at ? h("time", { dateTime: row.at }, time(row.at)) : null), h("pre", { className: "lm-history-body" }, row.text)))),
						!history.busy && history.page && !history.page.rows.length ? h("p", { className: "lm-activity-empty" }, t("historyEmpty")) : null,
						h("div", { ref: historyEnd })))));
	}
	function MemoryStatus({ activityStore, controls, t }) {
		const buttonRef = React.useRef(null);
		const panelRef = React.useRef(null);
		const panelId = React.useId();
		const [open, setOpen] = React.useState(false);
		const position = useAnchoredPosition({ open, anchorRef: buttonRef, panelRef, side: "top", gap: 8, margin: 12 });
		useDismissOnOutsidePointer(buttonRef, open, setOpen, panelRef);
		React.useEffect(() => {
			if (!open) return;
			const keydown = event => { if (event.key === "Escape") setOpen(false); };
			const click = event => {
				if (!buttonRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
			};
			document.addEventListener("keydown", keydown);
			document.addEventListener("click", click, true);
			return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("click", click, true); };
		}, [open]);
		const value = React.useSyncExternalStore(activityStore.subscribe, activityStore.getSnapshot);
		const snapshot = value.snapshot;
		const running = snapshot?.running[0];
		const failure = snapshot?.latestFailure;
		const latestFinished = snapshot?.records.find(run => run.finishedAt !== null);
		const waiting = latestFinished?.status === "waiting_evidence" ? latestFinished : null;
		const stopped = latestFinished?.status === "stopped" ? latestFinished : null;
		const item = running || failure || waiting || stopped || snapshot?.latestChanged || snapshot?.records[0];
		const isFailure = value.error || (!running && Boolean(failure));
		let label = t(snapshot ? "idle" : "initializing");
		if (value.error) label = t("unavailable");
		else if (running) label = t(running.purpose === "turn_review" ? "reviewing" : "organizing");
		else if (failure) label = failure.changedEntries ? t("partial", { count: failure.changedEntries }) : t("failed");
		else if (waiting) label = t("awaitingEvidence");
		else if (stopped) label = t(stopped.purpose === "turn_review" ? "stoppedReview" : "stoppedBatch");
		else if (item) label = item.changedEntries ? t("changed", { count: item.changedEntries }) : t("settled");
		const clickable = !value.error && snapshot !== null;
		const title = [label, !running && (failure?.summary || waiting?.summary || stopped?.summary), !running && (waiting || stopped)?.changedEntries ? t("changedCount", { count: (waiting || stopped).changedEntries }) : "", clickable ? t("details") : "", running && snapshot.running.length > 1 ? t("concurrent", { count: snapshot.running.length - 1 }) : ""].filter(Boolean).join(" · ");
		return h(React.Fragment, null,
			h("style", null, styles),
			h("span", { className: "lm-status-seat", "data-memory-status": value.error ? "unavailable" : running ? "running" : failure ? "failed" : waiting ? "waiting" : stopped ? "stopped" : item ? item.changedEntries ? "changed" : "reviewed" : snapshot ? "idle" : "loading" },
				h(clickable ? "button" : "span", {
					className: "lm-status-line" + (running && !value.error ? " is-running" : "") + (isFailure ? " is-failed" : ""),
					...(clickable ? { ref: buttonRef, type: "button", onClick: () => setOpen(!open), "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": panelId } : {}),
					title, "aria-label": title,
				}, h(Brain), h("span", { className: "lm-status-text", role: "status", "aria-live": "polite" }, label),
					isFailure ? h(IconWarningOutlineRegular, { className: "lm-status-failure", size: 14 }) : null)),
			open && createPortal(h(ActivityPanel, { open, snapshot, controls, panelRef, panelId, position, t }), document.body));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			// 状态与管理页的描述符合并挂载，避免同 package 两次 $mount
			const unmountRemote = await ctx.remote.$mount({ package: STATUS_PACKAGE, descriptors: [...STATUS_REMOTE.descriptors, ...STORE_REMOTE.descriptors] });
			const stores = new Set();
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-status: locale");
				scope.slots.inject("conversation.composer.dock", () => scope.slots.register({
					name: "conversation.composer.dock", id: "layered-memory-status", order: 5, locale,
					inject: sessionId => {
						const store = createStore(scope.remote, sessionId, stores);
						return {
							activityStore: store,
							controls: {
								refresh: signal => store.refresh(signal),
								list: signal => resultValue(scope.remote.layeredMemoryStatus.listWorkers(sessionId, signal)),
								read: (workerId, offset, limit, signal) => resultValue(scope.remote.layeredMemoryStatus.readWorker(sessionId, workerId, offset, limit, signal)),
								stop: (workerId, signal) => resultValue(scope.remote.layeredMemoryStatus.stopWorker(sessionId, workerId, signal)),
							},
						};
					},
				}, MemoryStatus));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); await unmountRemote(); throw error; }
			return async () => { await ui.dispose(); await Promise.all([...stores].map(store => store.dispose())); await unmountRemote(); };
		},
	};
}

const GRAPH_VIEW_CSS = "/* 关系图谱视图样式（配套 client/graph-view.js）\n   颜色尽量取宿主主题变量，缺失时回落到与旧图谱一致的分类色。 */\n\n.lm-graph-view {\n\tdisplay: flex;\n\tflex: 1;\n\theight: 100%;\n\tmin-height: 0;\n\toverflow: hidden;\n\tposition: relative;\n\tcolor: var(--dsw-alias-label-primary, #e5e7eb);\n}\n\n.lm-graph-stage {\n\tposition: relative;\n\tflex: 1;\n\tmin-width: 0;\n\tmin-height: 0;\n\toverflow: hidden;\n\tbackground: var(--dsw-alias-bg-base, #050505);\n\tborder-radius: 10px;\n\tuser-select: none;\n\t-webkit-user-select: none;\n}\n\n.lm-graph-canvas {\n\tdisplay: block;\n\twidth: 100%;\n\theight: 100%;\n\tcursor: grab;\n\ttouch-action: none;\n\toutline: none;\n}\n\n.lm-graph-canvas:active,\n.lm-graph-stage.lm-graph-is-panning .lm-graph-canvas {\n\tcursor: grabbing;\n}\n\n/* 分类色：规则 / 事实 / 经验 */\n.lm-graph-kind-rule { --lm-graph-color: #a855f7; }\n.lm-graph-kind-fact { --lm-graph-color: #3b82f6; }\n.lm-graph-kind-sop { --lm-graph-color: #b78535; }\n.lm-graph-kind-other { --lm-graph-color: #94a3b8; }\n\n/* 工具栏 */\n/* 工具栏 = 一张可展开的卡片：一套 surface、稳定宽度、限高在 stage 内。\n   header 行常驻不收缩，展开区接在同卡片下缘、同宽、同水平内距、内部滚动。 */\n.lm-graph-toolbar-card {\n\tposition: absolute;\n\ttop: 10px;\n\tleft: 10px;\n\tz-index: 6;\n\tdisplay: flex;\n\tflex-direction: column;\n\twidth: 320px;\n\tmax-width: calc(100% - 20px);\n\tmax-height: calc(100% - 20px);\n\tmin-height: 0;\n\tbackground: var(--dsw-alias-bg-layer-1, #0e0e0e);\n\tborder-radius: var(--dsw-radius-md, 12px);\n\tbox-shadow: var(--dsw-elevation-panel, 0 1px 2px rgba(0, 0, 0, .14));\n}\n\n/* 展开态的卡片提到本画布 UI 最上层（角落缩放 6 / 详情 7 / 提示 8），\n   收起时仍是原来的 6。 */\n.lm-graph-toolbar-card[data-open=\"true\"] {\n\tz-index: 9;\n}\n\n.lm-graph-toolbar-header {\n\tflex: none;\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 8px;\n\tmin-width: 0;\n\tpadding: 8px 10px;\n}\n\n.lm-graph-toolbar-body {\n\tflex: 1 1 auto;\n\tmin-height: 0;\n\toverflow: auto;\n\tpadding: 0 10px 10px;\n}\n\n\n.lm-graph-options-body {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 10px;\n}\n\n.lm-graph-options-group {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 5px;\n}\n\n.lm-graph-options-label {\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n}\n\n.lm-graph-options-foot {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tgap: 8px;\n\tpadding-top: 8px;\n\tborder-top: 0.5px solid var(--dsw-alias-border-l3, #1f1f1f);\n}\n\n/* 角落紧凑缩放控件 */\n.lm-graph-zoom-cluster {\n\tposition: absolute;\n\tright: 12px;\n\tbottom: 12px;\n\tz-index: 6;\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 6px;\n}\n\n.lm-graph-zoom-cluster .lm-graph-btn {\n\tmin-width: 44px;\n\tmin-height: 44px;\n}\n\n.lm-graph-search {\n\tflex: 1 1 200px;\n\tmin-width: 120px;\n\tmax-width: 260px;\n}\n\n.lm-graph-search,\n.lm-graph-search input {\n\tmin-height: 36px;\n}\n\n.lm-graph-chips {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tgap: 4px;\n}\n\n.lm-graph-chip {\n\tappearance: none;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tborder: 0.5px solid var(--dsw-alias-border-l3, #1f1f1f);\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tborder-radius: 999px;\n\tmin-height: 36px;\n\tpadding: 0 12px;\n\tfont-size: 11px;\n\tline-height: 1.6;\n\tcursor: pointer;\n\ttransition: background .16s ease, color .16s ease, border-color .16s ease;\n}\n\n.lm-graph-chip:hover {\n\tcolor: var(--dsw-alias-label-primary, #fafafa);\n\tborder-color: var(--dsw-alias-border-l2, #333);\n}\n\n.lm-graph-chip.is-active {\n\tbackground: color-mix(in srgb, var(--lm-graph-color, #3b82f6) 26%, transparent);\n\tborder-color: color-mix(in srgb, var(--dsw-state-business-primary, #3b82f6) 60%, transparent);\n\tcolor: var(--dsw-alias-label-primary, #fafafa);\n}\n\n.lm-graph-switch {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tmin-height: 36px;\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tcursor: pointer;\n\twhite-space: nowrap;\n}\n\n.lm-graph-btn {\n\tmin-width: 36px;\n\tmin-height: 36px;\n\twhite-space: nowrap;\n}\n\n/* 固定宽度的按钮（适屏、显示选项）：基础文案永不收缩，\n   空间不够时先收搜索框与后面的条件后缀。 */\n.lm-graph-btn.is-fixed {\n\tflex: none;\n}\n\n/* 生效条件后缀：优先被省略，完整内容留在 title 与按钮的 aria-label */\n.lm-graph-options-state {\n\tflex: 0 1 auto;\n\tmin-width: 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n}\n\n.lm-graph-btn.is-active {\n\tborder-color: var(--dsw-state-business-primary, #3b82f6);\n}\n\n.lm-graph-counts {\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n\toverflow-wrap: anywhere;\n}\n\n/* 图例 */\n.lm-graph-legend {\n\tposition: absolute;\n\tleft: 12px;\n\tbottom: 12px;\n\tz-index: 5;\n\tdisplay: flex;\n\tgap: 10px;\n\tpadding: 5px 9px;\n\tborder-radius: 8px;\n\tbackground: color-mix(in srgb, var(--dsw-alias-bg-layer-1, #0e0e0e) 78%, transparent);\n\tborder: 0.5px solid var(--dsw-alias-border-l3, #1f1f1f);\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tpointer-events: none;\n}\n\n.lm-graph-legend-item {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 4px;\n}\n\n.lm-graph-legend-swatch {\n\twidth: 9px;\n\theight: 9px;\n\tborder-radius: 50%;\n\tbackground: var(--lm-graph-color, #94a3b8);\n}\n\n/* 节点与边 */\n.lm-graph-node {\n\tcursor: pointer;\n\ttransition: opacity .18s ease;\n}\n\n.lm-graph-node:focus {\n\toutline: none;\n}\n\n.lm-graph-dot {\n\tfill: var(--lm-graph-color, #94a3b8);\n\tstroke: color-mix(in srgb, var(--lm-graph-color, #94a3b8) 40%, transparent);\n\tstroke-width: 1;\n}\n\n.lm-graph-halo {\n\tfill: transparent;\n\tstroke: transparent;\n\tstroke-width: 1;\n}\n\n.lm-graph-ring {\n\tfill: none;\n\tstroke: transparent;\n\tstroke-width: 1.5;\n}\n\n.lm-graph-node.is-active .lm-graph-dot {\n\tstroke: #ffffff;\n\tstroke-width: 2;\n}\n\n.lm-graph-node.is-active .lm-graph-ring {\n\tstroke: color-mix(in srgb, var(--lm-graph-color, #3b82f6) 70%, transparent);\n}\n\n.lm-graph-node.is-linked .lm-graph-ring {\n\tstroke: color-mix(in srgb, var(--lm-graph-color, #3b82f6) 45%, transparent);\n}\n\n.lm-graph-node.is-muted {\n\topacity: .22;\n}\n\n.lm-graph-node.is-dim {\n\topacity: .18;\n}\n\n.lm-graph-node.is-active {\n\topacity: 1;\n}\n\n.lm-graph-node.is-dragging {\n\tcursor: grabbing;\n}\n\n.lm-graph-node.is-dragging .lm-graph-dot {\n\tstroke: #ffffff;\n}\n\n.lm-graph-edge {\n\tfill: none;\n\tstroke: var(--dsw-alias-border-l2, #2a2a2a);\n\tstroke-width: 1.2;\n\tstroke-linecap: round;\n\ttransition: opacity .18s ease, stroke .18s ease;\n}\n\n.lm-graph-edge-similar {\n\tstroke: color-mix(in srgb, #b78535 70%, transparent);\n\tstroke-dasharray: 4 4;\n}\n\n.lm-graph-edge-related {\n\tstroke: color-mix(in srgb, #3b82f6 55%, transparent);\n}\n\n.lm-graph-edge.is-active {\n\tstroke: var(--dsw-state-business-primary, #3b82f6);\n\tstroke-width: 2;\n\tstroke-dasharray: none;\n}\n\n.lm-graph-edge.is-muted {\n\topacity: .22;\n}\n\n.lm-graph-edge.is-dim {\n\topacity: .1;\n}\n\n.lm-graph-label {\n\tfill: var(--dsw-alias-label-primary, #fafafa);\n\tfont-size: 11px;\n\tpaint-order: stroke;\n\tstroke: color-mix(in srgb, var(--dsw-alias-bg-base, #050505) 94%, transparent);\n\tstroke-width: 3.5px;\n\tstroke-linejoin: round;\n\tpointer-events: none;\n\ttransition: opacity .18s ease;\n}\n\n.lm-graph-label.is-active {\n\tfont-weight: 700;\n}\n\n/* 悬停提示 */\n.lm-graph-tooltip {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tz-index: 8;\n\tmax-width: 260px;\n\tpadding: 8px 10px;\n\tborder-radius: var(--dsw-radius-md, 12px);\n\tbackground: var(--dsw-alias-bg-layer-1, #0e0e0e);\n\tborder: 0;\n\tbox-shadow: var(--dsw-elevation-soft, 0 4px 16px rgba(0, 0, 0, .12));\n\tfont-size: 12px;\n\tline-height: 1.5;\n\tpointer-events: none;\n}\n\n.lm-graph-tooltip-title {\n\tfont-weight: 600;\n\tmargin-bottom: 3px;\n\tword-break: break-word;\n}\n\n.lm-graph-tooltip-row {\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tfont-size: 11px;\n}\n\n.lm-graph-tooltip-kind {\n\tdisplay: inline-block;\n\tpadding: 0 6px;\n\tborder-radius: 999px;\n\tcolor: var(--lm-graph-color, #94a3b8);\n\tborder: 0.5px solid color-mix(in srgb, var(--lm-graph-color, #94a3b8) 55%, transparent);\n}\n\n/* 详情面板 */\n.lm-graph-panel {\n\tposition: absolute;\n\ttop: var(--lm-graph-panel-top, 72px);\n\tright: 12px;\n\tz-index: 7;\n\twidth: min(300px, calc(100% - 24px));\n\tmax-height: calc(100% - 96px);\n\toverflow: auto;\n\tpadding: 12px;\n\tborder-radius: var(--dsw-radius-lg, 16px);\n\tbackground: var(--dsw-alias-bg-layer-1, #0e0e0e);\n\tborder: 0;\n\tbox-shadow: var(--dsw-elevation-soft, 0 4px 16px rgba(0, 0, 0, .12));\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 10px;\n\tfont-size: 12px;\n}\n\n.lm-graph-panel-head {\n\tdisplay: flex;\n\talign-items: flex-start;\n\tjustify-content: space-between;\n\tgap: 8px;\n}\n\n.lm-graph-panel-title {\n\tmargin: 0;\n\tfont-size: 14px;\n\tline-height: 1.4;\n\tword-break: break-word;\n}\n\n.lm-graph-panel-titles {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 4px;\n\tmin-width: 0;\n}\n\n.lm-graph-panel-kind {\n\talign-self: flex-start;\n\tpadding: 1px 8px;\n\tborder-radius: 999px;\n\tfont-size: 11px;\n\tcolor: var(--lm-graph-color, #94a3b8);\n\tborder: 0.5px solid color-mix(in srgb, var(--lm-graph-color, #94a3b8) 55%, transparent);\n}\n\n.lm-graph-neighbor-list {\n\tlist-style: none;\n\tmargin: 0;\n\tpadding: 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 3px;\n\tmax-height: 180px;\n\toverflow: auto;\n}\n\n.lm-graph-panel-locate {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 2px;\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tword-break: break-all;\n}\n\n/* 本地兜底折叠（共享 Disclosure 缺席时使用） */\n.lm-graph-disclosure-local {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 4px;\n}\n\n.lm-graph-disclosure-local-trigger {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tgap: 8px;\n\twidth: 100%;\n\tmin-height: 36px;\n\tpadding: 4px 8px;\n\tborder: 0.5px solid var(--dsw-alias-border-l3, #1f1f1f);\n\tborder-radius: 8px;\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tfont-size: 12px;\n\ttext-align: left;\n\tcursor: pointer;\n}\n\n.lm-graph-disclosure-local-count {\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n}\n\n/* 内距/限高/滚动由 bodyClassName 指定的 class 接管，这里不重复设置 */\n.lm-graph-disclosure-local-body {\n\tdisplay: flex;\n\tflex-direction: column;\n\tgap: 4px;\n}\n\n.lm-graph-neighbor-link {\n\tappearance: none;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tmin-height: 36px;\n\tborder: none;\n\tbackground: transparent;\n\tpadding: 2px 0;\n\tcolor: var(--dsw-alias-label-primary, #fafafa);\n\tfont-size: 12px;\n\ttext-align: left;\n\tcursor: pointer;\n\ttext-decoration: underline;\n\ttext-decoration-style: dotted;\n\ttext-underline-offset: 2px;\n}\n\n.lm-graph-neighbor-link:hover {\n\tcolor: var(--dsw-state-business-primary, #3b82f6);\n}\n\n.lm-graph-neighbor-sim {\n\tmargin-left: 6px;\n\tfont-size: 10px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n}\n\n.lm-graph-panel-empty {\n\tmargin: 0;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n\tfont-size: 11px;\n}\n\n/* 状态图标：直接用宿主 primitives 的图标，这里只管排版、颜色与读取中的旋转 */\n.lm-graph-state-icon {\n\tdisplay: block;\n\tmargin: 0 auto 2px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n}\n\n.lm-graph-state-icon.is-error {\n\tcolor: var(--dsw-state-danger, #ef4444);\n}\n\n.lm-graph-state-icon.is-loading {\n\tanimation: lm-graph-spin 1s linear infinite;\n}\n\n@keyframes lm-graph-spin {\n\tto {\n\t\ttransform: rotate(360deg);\n\t}\n}\n\n/* 覆盖层：加载 / 失败 / 空态 */\n.lm-graph-overlay {\n\tposition: absolute;\n\tinset: 0;\n\tz-index: 5;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: center;\n\tjustify-content: center;\n\tgap: 8px;\n\tpadding: 20px;\n\ttext-align: center;\n\tfont-size: 13px;\n\tcolor: var(--dsw-alias-label-secondary, #a1a1a1);\n\tbackground: color-mix(in srgb, var(--dsw-alias-bg-base, #050505) 72%, transparent);\n}\n\n.lm-graph-overlay-actions {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tgap: 6px;\n\tjustify-content: center;\n}\n\n.lm-graph-overlay-detail {\n\tmargin: 0;\n\tmax-width: 320px;\n\tfont-size: 11px;\n\tcolor: var(--dsw-alias-label-tertiary, #737373);\n\tword-break: break-word;\n}\n\n.lm-graph-overlay-title {\n\tmargin: 0;\n\tfont-size: 14px;\n\tfont-weight: 600;\n\tcolor: var(--dsw-alias-label-primary, #fafafa);\n}\n\n.lm-graph-overlay-error .lm-graph-overlay-title {\n\tcolor: var(--dsw-state-danger, #ef4444);\n}\n\n/* 窄屏 */\n@media (max-width: 560px) {\n\t.lm-graph-toolbar-card {\n\t\ttop: 8px;\n\t\tleft: 8px;\n\t\twidth: min(320px, calc(100% - 16px));\n\t\tmax-width: calc(100% - 16px);\n\t\tmax-height: calc(100% - 16px);\n\t}\n\n\t.lm-graph-toolbar-header {\n\t\tgap: 6px;\n\t\tpadding: 7px 8px;\n\t}\n\n\t.lm-graph-toolbar-body {\n\t\tpadding: 0 8px 8px;\n\t}\n\n\t.lm-graph-search {\n\t\tflex: 1 1 120px;\n\t\tmin-width: 96px;\n\t\tmax-width: none;\n\t}\n\n\n\t.lm-graph-zoom-cluster {\n\t\tright: 8px;\n\t\tbottom: 8px;\n\t}\n\n\t.lm-graph-counts {\n\t\tflex: 1 1 100%;\n\t\twhite-space: normal;\n\t}\n\n\t.lm-graph-btn {\n\t\tmin-width: 44px;\n\t\tmin-height: 44px;\n\t}\n\n\t.lm-graph-chip {\n\t\tmin-height: 44px;\n\t\tpadding: 0 14px;\n\t\tfont-size: 12px;\n\t}\n\n\t.lm-graph-search,\n\t.lm-graph-search input {\n\t\tmin-height: 44px;\n\t}\n\n\t.lm-graph-switch {\n\t\tmin-height: 44px;\n\t}\n\n\t.lm-graph-neighbor-link {\n\t\tmin-height: 44px;\n\t}\n\n\t.lm-graph-legend {\n\t\tleft: 8px;\n\t\tbottom: 10px;\n\t}\n\n\t.lm-graph-panel {\n\t\ttop: auto;\n\t\tleft: 8px;\n\t\tright: 8px;\n\t\tbottom: 8px;\n\t\twidth: auto;\n\t\tmax-height: 46%;\n\t}\n}\n\n@media (prefers-reduced-motion: reduce) {\n\t.lm-graph-node,\n\t.lm-graph-edge,\n\t.lm-graph-label,\n\t.lm-graph-chip,\n\t.lm-graph-btn {\n\t\ttransition: none !important;\n\t}\n\n\t.lm-graph-state-icon.is-loading {\n\t\tanimation: none;\n\t}\n}\n";
/**
 * 关系图谱视图工厂。
 *
 * 调用签名（两种都支持）：
 * - createMemoryGraphView(require, runtime) —— 与宿主 UI runtime 对齐；
 * - createMemoryGraphView(React, ui, deps) —— 独立调试用。
 * runtime 可提供 { React, ui, d3, styles, reducedMotion() }。
 *
 * 渲染栈：
 * - 布局 / 视口 / 碰撞 / 路径：vendored d3@7.9.2（ISC，client/vendor/graph/d3.min.js）
 * - hover 邻居高亮、点击钉住、贝塞尔边的交互语义：移植 EasyUI Dependency Trace
 *   （MIT，client/vendor/graph/easyui/DependencyTrace.tsx，Copyright (c) 2026 Suraj Maurya）
 *
 * 本文件不依赖宿主打包器：d3 由构建脚本前置拼接为全局 d3，组件通过
 * deps.d3 或 globalThis.d3 取用；缺失时渲染显式错误态而不是崩溃。
 */

function createMemoryGraphView(requireOrReact, runtimeOrUi, dependencies) {
	const isRequire = typeof requireOrReact === "function";
	const React = isRequire ? requireOrReact("react") : requireOrReact;
	const runtime = isRequire ? (runtimeOrUi || {}) : {};
	let ui = isRequire ? runtime.ui : (runtimeOrUi || {});
	if (!ui && isRequire) {
		try {
			ui = requireOrReact("@deepseek-ai/dsh-client-ui-primitives") || {};
		} catch {
			ui = {};
		}
	}
	const deps = {
		d3: runtime.d3,
		styles: runtime.styles,
		...(dependencies || {}),
	};
	const {
		Button, Input, Switch,
		IconLoadingOutlineRegular, IconSearchOutlineRegular, IconWarningOutlineRegular,
		IconArchiveOutlineRegular, IconRefreshOutlineRegular, IconCloseOutlineRegular,
		IconSlidersTwoOutlineRegular, useDismissOnOutsidePointer,
	} = ui || {};
	// 宿主提供的钩子；缺席时退化为空实现（不影响其它行为）。
	const useOutsideDismiss = typeof useDismissOnOutsidePointer === "function" ? useDismissOnOutsidePointer : () => {};
	const h = React.createElement;
	const { useCallback, useEffect, useMemo, useRef, useState } = React;

	const STRINGS = {
		zh: {
			graphLabel: "记忆关系图谱",
			loading: "读取中",
			loadFailed: "读取失败",
			retry: "重试",
			detail: "详情",
			empty: "没有记忆条目",
			noNamespace: "未选择命名空间",
			engineMissing: "图谱组件加载失败",
			reload: "刷新页面",
			search: "搜索节点",
			displayOptions: "显示选项",
			typeFilter: "类型",
			relationFilter: "关系",
			fitShort: "适屏",
			relations: "关联",
			locate: "定位",
			all: "全部",
			kindRule: "规则",
			kindFact: "事实",
			kindSop: "经验",
			onlyConnected: "仅看有边节点",
			explicit: "显式关联",
			similar: "相似关系",
			zoomIn: "放大",
			zoomOut: "缩小",
			fit: "适应窗口",
			reset: "重置视图",
			close: "关闭",
			counts: "{nodes} / {totalNodes} 节点 · {edges} / {totalEdges} 边",
			legend: "图例",
			detail: "节点详情",
			openEntry: "打开条目",
			noNeighbors: "无邻居",
			noMatch: "没有匹配的节点",
			clearFilters: "清除筛选",
			similarity: "相似度",
		},
		en: {
			graphLabel: "Memory relationship graph",
			loading: "Loading",
			loadFailed: "Failed to load",
			retry: "Retry",
			detail: "Details",
			empty: "No memory entries",
			noNamespace: "No namespace",
			engineMissing: "Graph component failed to load",
			reload: "Reload page",
			search: "Search nodes",
			displayOptions: "Display options",
			typeFilter: "Type",
			relationFilter: "Relations",
			fitShort: "Fit",
			relations: "Related",
			locate: "Locate",
			all: "All",
			kindRule: "Rule",
			kindFact: "Fact",
			kindSop: "Skill",
			onlyConnected: "Connected only",
			explicit: "Explicit link",
			similar: "Similarity",
			zoomIn: "Zoom in",
			zoomOut: "Zoom out",
			fit: "Fit",
			reset: "Reset view",
			close: "Close",
			counts: "{nodes} / {totalNodes} nodes · {edges} / {totalEdges} edges",
			legend: "Legend",
			detail: "Node details",
			openEntry: "Open entry",
			noNeighbors: "No neighbors",
			noMatch: "No matching node",
			clearFilters: "Clear filters",
			similarity: "Similarity",
		},
	};

	const KIND_ORDER = ["rule", "fact", "sop"];
	const EDGE_TYPES = ["related", "similar"];
	const LABEL_LIMIT = 10;
	const LABEL_TEXT_LIMIT = 14;
	const HUB_LABEL_LIMIT = 8;
	const NEIGHBOR_LABEL_LIMIT = 4;
	const ZOOM_MIN = 0.15;
	const ZOOM_MAX = 6;
	const LABEL_FONT_PX = 11;
	const LABEL_FONT = "11px system-ui, -apple-system, 'Segoe UI', sans-serif";

	const hashSeed = text => {
		let hash = 2166136261;
		const value = String(text || "");
		for (let index = 0; index < value.length; index++) {
			hash ^= value.charCodeAt(index);
			hash = Math.imul(hash, 16777619);
		}
		return hash >>> 0;
	};

	let measureContext = null;
	const measureText = (text, font) => {
		const fallback = String(text || "").length * 6.2;
		if (typeof document === "undefined") return fallback;
		if (!measureContext) {
			const canvas = document.createElement("canvas");
			measureContext = canvas.getContext ? canvas.getContext("2d") : null;
		}
		if (!measureContext) return fallback;
		measureContext.font = font || LABEL_FONT;
		return measureContext.measureText(String(text || "")).width;
	};

	const nodeRadius = node => {
		const heat = Number(node && node.heat) || 0;
		const degree = Number(node && node.degree) || 0;
		return Math.max(5, Math.min(13, 4.5 + Math.min(heat, 6) * 0.9 + Math.min(degree, 12) * 0.35));
	};

	// 画布上的标签用短标题：完整标题在 tooltip 与详情面板里给，
	// 长标题会让标签矩形宽到必然压住邻居，导致一个都放不下。
	const labelText = node => {
		const raw = String((node && (node.title || node.key)) || "");
		return raw.length > LABEL_TEXT_LIMIT ? raw.slice(0, LABEL_TEXT_LIMIT) + "…" : raw;
	};

	const rectsOverlap = (a, b, margin) => {
		const gap = margin == null ? 2 : margin;
		return !(a.x1 + gap < b.x0 || b.x1 + gap < a.x0 || a.y1 + gap < b.y0 || b.y1 + gap < a.y0);
	};

	const resolveD3 = () => {
		const candidate = deps.d3 || (typeof globalThis !== "undefined" ? globalThis.d3 : undefined);
		return candidate && candidate.forceSimulation && candidate.zoom ? candidate : null;
	};

	const ActionButton = ({ label, onClick, title, ariaLabel, ariaExpanded, ariaControls, icon, active, disabled, variant, extraClass, buttonRef }) => {
		const className = "lm-graph-btn" + (extraClass ? " " + extraClass : "") + (active ? " is-active" : "");
		if (Button) {
			return h(Button, {
				variant: variant || "outline",
				size: "sm",
				type: "button",
				className,
				title: title || label,
				"aria-label": ariaLabel || title || (typeof label === "string" ? label : undefined),
				"aria-pressed": active === undefined ? undefined : Boolean(active),
				"aria-expanded": ariaExpanded === undefined ? undefined : Boolean(ariaExpanded),
				"aria-controls": ariaControls,
				disabled: Boolean(disabled),
				icon,
				ref: buttonRef,
				onClick,
			}, label);
		}
		return h("button", {
			type: "button",
			className,
			title: title || label,
			"aria-label": ariaLabel || title || (typeof label === "string" ? label : undefined),
			"aria-pressed": active === undefined ? undefined : Boolean(active),
			"aria-expanded": ariaExpanded === undefined ? undefined : Boolean(ariaExpanded),
			"aria-controls": ariaControls,
			disabled: Boolean(disabled),
			ref: buttonRef,
			onClick,
		}, label);
	};

	// 状态标记直接用宿主 primitives 的既有图标：读取中 / 搜索无结果 / 警告 / 归档盒，
	// 不再为状态自绘 SVG。
	const StateIcon = ({ kind }) => {
		const Icon = kind === "loading" ? IconLoadingOutlineRegular
			: kind === "filtered" ? IconSearchOutlineRegular
				: kind === "error" ? IconWarningOutlineRegular
					: IconArchiveOutlineRegular;
		if (!Icon) return null;
		return h(Icon, {
			size: 28,
			className: "lm-graph-state-icon"
				+ (kind === "loading" ? " is-loading" : "")
				+ (kind === "error" ? " is-error" : ""),
		});
	};

	// 折叠区优先用 runtime 提供的共享 Disclosure；没有时退化为最小可访问折叠
	// （按钮 + aria-controls 区域），不另造弹层。
	// 兜底折叠：与共享 Disclosure 同样的 props 形状（含 renderHeader 槽）。
	const LocalDisclosure = ({ title, open, onOpenChange, children, id, count, className, renderHeader, rootRef, bodyClassName }) => {
		const contentId = id || "lm-disclosure-local";
		const toggle = () => { if (onOpenChange) onOpenChange(!open); };
		const header = renderHeader
			? renderHeader({ open: Boolean(open), toggle, contentId })
			: h("button", {
				type: "button",
				className: "lm-graph-disclosure-local-trigger",
				"aria-expanded": Boolean(open),
				"aria-controls": contentId,
				onClick: toggle,
			}, title, count != null ? h("span", { className: "lm-graph-disclosure-local-count" }, String(count)) : null);
		return h("div", {
			ref: rootRef,
			className: "lm-graph-disclosure-local" + (className ? " " + className : ""),
			"data-open": open ? "true" : "false",
		},
			header,
			h("div", { id: contentId, className: "lm-graph-disclosure-local-body" + (bodyClassName ? " " + bodyClassName : "") },
				open ? children : null));
	};

	const ToggleButton = ({ label, active, onClick, title, disabled }) => h("button", {
		type: "button",
		className: "lm-graph-chip" + (active ? " is-active" : ""),
		"aria-pressed": Boolean(active),
		"aria-disabled": Boolean(disabled),
		title: title || label,
		disabled: Boolean(disabled),
		onClick,
	}, label);

	// 共享组件：优先用 runtime 提供的实现，缺席时退回本地最小版本。
	const DisclosureView = (runtime && runtime.components && runtime.components.Disclosure) || LocalDisclosure;

	function MemoryGraphView(props) {
		const { controls, namespace, onJumpEntry, locale = "zh", kind: kindProp, onKindChange } = props;
		const s = STRINGS[locale] || STRINGS.zh;

		const [status, setStatus] = useState("loading");
		const [error, setError] = useState(null);
		const [graph, setGraph] = useState(null);
		const [query, setQuery] = useState("");
		const [onlyConnected, setOnlyConnected] = useState(false);
		const [edgeTypes, setEdgeTypes] = useState({ related: true, similar: true });
		const [hoverId, setHoverId] = useState(null);
		const [selectedId, setSelectedId] = useState(null);
		const [detailOpen, setDetailOpen] = useState(false);
		const [optionsOpen, setOptionsOpen] = useState(false);
		const [sections, setSections] = useState({});
		const [sceneVersion, setSceneVersion] = useState(0);

		const stageRef = useRef(null);
		const svgRef = useRef(null);
		const toolbarRef = useRef(null);
		const tooltipRef = useRef(null);
		const sceneRef = useRef(null);
		const suppressClickRef = useRef(false);
		const tooltipSizeRef = useRef({ width: 240, height: 72 });
		const firstFitRef = useRef(true);
		const [toolbarHeight, setToolbarHeight] = useState(0);
		const optionsCardRef = useRef(null);
		const optionsTriggerRef = useRef(null);
		const hoverIdRef = useRef(null);
		const selectedIdRef = useRef(null);
		const neighborIdsRef = useRef(new Set());

		// 类型过滤可由外部共享状态驱动（kind prop + onKindChange），也可在图谱内自行切换。
		const kindControlled = kindProp !== undefined;
		const [localKind, setLocalKind] = useState("");
		const kindFilter = kindControlled ? (kindProp || "") : localKind;
		const applyKind = useCallback(next => {
			if (typeof onKindChange === "function") onKindChange(next);
			if (!kindControlled) setLocalKind(next);
		}, [kindControlled, onKindChange]);

		const reducedMotion = useMemo(() => {
			if (runtime && typeof runtime.reducedMotion === "function") return Boolean(runtime.reducedMotion());
			if (typeof window === "undefined" || !window.matchMedia) return false;
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		}, []);

		const engineReady = useMemo(() => Boolean(resolveD3()), []);

		useEffect(() => { hoverIdRef.current = hoverId; }, [hoverId]);
		useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

		const load = useCallback(async () => {
			if (!namespace) {
				setStatus("no-namespace");
				return;
			}
			setStatus("loading");
			setError(null);
			setDetailOpen(false);
			try {
				const report = await controls.getMaintenanceReport({ namespace });
				const source = report && report.graph ? report.graph : {};
				const nodes = Array.isArray(source.nodes) ? source.nodes.filter(node => node && node.id) : [];
				const edges = Array.isArray(source.edges) ? source.edges.filter(edge => edge && edge.source && edge.target) : [];
				setGraph({ nodes, edges });
				setStatus("ready");
			} catch (failure) {
				setError(failure);
				setStatus("error");
			}
		}, [controls, namespace]);

		useEffect(() => {
			load();
		}, [load]);

		// 切换命名空间等于换一份图：清掉上一个命名空间留下的悬停、选中与过滤状态，
		// 免得旧状态在新图上表现为「联动假高亮」。
		useEffect(() => {
			setHoverId(null);
			setSelectedId(null);
			setLocalKind("");
			setQuery("");
			setDetailOpen(false);
			setOptionsOpen(false);
			setSections({});
		}, [namespace]);

		// 换一个节点就回到默认闭合，按需内容重新打开。
		useEffect(() => {
			setSections({});
		}, [selectedId]);

		const filtered = useMemo(() => {
			const nodes = graph ? graph.nodes : [];
			const edges = graph ? graph.edges : [];
			const connected = new Set();
			for (const edge of edges) {
				connected.add(edge.source);
				connected.add(edge.target);
			}
			const needle = query.trim().toLowerCase();
			const baseNodes = nodes.filter(node => {
				if (onlyConnected && !connected.has(node.id)) return false;
				if (needle) {
					const haystack = `${node.title || ""} ${node.key || ""} ${node.kind || ""}`.toLowerCase();
					if (!haystack.includes(needle)) return false;
				}
				return true;
			});
			const kindMatched = kindFilter ? baseNodes.filter(node => node.kind === kindFilter) : baseNodes;
			const baseIds = new Set(baseNodes.map(node => node.id));
			const edgeCounts = { related: 0, similar: 0 };
			for (const edge of edges) {
				if (!baseIds.has(edge.source) || !baseIds.has(edge.target)) continue;
				if (edgeCounts[edge.type] !== undefined) edgeCounts[edge.type] += 1;
			}
			const visibleEdges = edges.filter(edge => (
				edgeTypes[edge.type] !== false && baseIds.has(edge.source) && baseIds.has(edge.target)
			));
			return {
				nodes: baseNodes,
				kindMatched,
				edges: visibleEdges,
				base: baseNodes,
				edgeCounts,
				removingKey: baseNodes.map(node => node.id).join("|"),
				kindKey: kindMatched.map(node => node.id).join("|"),
			};
		}, [graph, kindFilter, query, onlyConnected, edgeTypes]);

		const selectedNode = useMemo(() => {
			if (!graph || !selectedId) return null;
			return graph.nodes.find(node => node.id === selectedId) || null;
		}, [graph, selectedId]);

		const hoveredNode = useMemo(() => {
			if (!graph || !hoverId) return null;
			return graph.nodes.find(node => node.id === hoverId) || null;
		}, [graph, hoverId]);

		const neighborsOf = useCallback(id => {
			if (!graph || !id) return [];
			const out = [];
			const seen = new Set();
			for (const edge of graph.edges) {
				let other = null;
				if (edge.source === id) other = edge.target;
				else if (edge.target === id) other = edge.source;
				if (!other || seen.has(other)) continue;
				seen.add(other);
				const node = graph.nodes.find(item => item.id === other);
				if (node) out.push({ node, edge });
			}
			return out;
		}, [graph]);

		const styleText = deps.styles != null
			? deps.styles
			: (typeof GRAPH_VIEW_CSS !== "undefined" ? GRAPH_VIEW_CSS : "");

		const buildScene = useCallback(() => {
			const d3 = resolveD3();
			const svgNode = svgRef.current;
			const stage = stageRef.current;
			if (!d3 || !svgNode || !stage || !graph) return undefined;

			// 容器尺寸只从当前可见的 stage 现读，布局、fit、宽高比修正共用同一来源。
			const measureStage = () => {
				const rect = stage.getBoundingClientRect();
				return {
					width: Math.max(280, rect.width || stage.clientWidth || 640),
					height: Math.max(240, rect.height || stage.clientHeight || 480),
				};
			};
			const initialSize = measureStage();
			const width = initialSize.width;
			const height = initialSize.height;

			const nodes = graph.nodes.map(node => ({ ...node, r: nodeRadius(node) }));
			const nodeIds = new Set(nodes.map(node => node.id));
			const links = graph.edges
				.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target))
				.map(edge => ({ source: edge.source, target: edge.target, type: edge.type, similarity: edge.similarity }));

			// 可视区：顶部预留工具栏高度，避免标签被工具栏压住。
			const computeFitArea = size => {
				const toolbar = toolbarRef.current;
				const reserve = toolbar ? Math.min(toolbar.getBoundingClientRect().height + 12, size.height * 0.4) : 0;
				return {
					reserve,
					areaWidth: Math.max(80, size.width - 24),
					areaHeight: Math.max(80, size.height - reserve - 16),
				};
			};

			const seed = hashSeed(`${namespace || ""}|${nodes.map(node => node.id).sort().join(",")}`);
			// 布局按当前可视区的宽高比塑形：宽屏时纵向约束更强，布局自然摊成宽形，
			// 不需要事后仿射拉伸（那会把节点压扁、造成挤团）。
			const layoutAspectFor = size => {
				const area = computeFitArea(size);
				return Math.max(0.7, Math.min(2.4, area.areaWidth / area.areaHeight));
			};
			let layoutAspect = layoutAspectFor(initialSize);
			const runLayout = size => {
				const aspect = layoutAspectFor(size);
				layoutAspect = aspect;
				for (const node of nodes) {
					delete node.x;
					delete node.y;
					delete node.vx;
					delete node.vy;
				}
				const simulation = d3.forceSimulation(nodes)
					.force("link", d3.forceLink(links).id(node => node.id).distance(link => (link.type === "similar" ? 88 : 46)).strength(0.45))
					.force("charge", d3.forceManyBody().strength(-28).distanceMax(260))
					.force("collide", d3.forceCollide(node => node.r + 3))
					.force("x", d3.forceX(size.width / 2).strength(0.11 / Math.sqrt(aspect)))
					.force("y", d3.forceY(size.height / 2).strength(0.11 * Math.sqrt(aspect)))
					.randomSource(d3.randomLcg(seed))
					.stop();
				for (let tick = 0; tick < 320; tick++) simulation.tick();
				simulation.stop();
			};
			runLayout(initialSize);
			for (const node of nodes) {
				node.baseX = node.x;
				node.baseY = node.y;
			}


			const svg = d3.select(svgNode);
			svg.selectAll("*").remove();
			svg.attr("width", "100%").attr("height", "100%");

			const viewport = svg.append("g").attr("class", "lm-graph-viewport");
			const edgeLayer = viewport.append("g").attr("class", "lm-graph-edges");
			const nodeLayer = viewport.append("g").attr("class", "lm-graph-nodes");
			const labelLayer = viewport.append("g").attr("class", "lm-graph-labels");

			// 贝塞尔边：沿用 EasyUI Dependency Trace 的中点偏移公式（MIT）。
			const edgePath = link => {
				const path = d3.path();
				path.moveTo(link.source.x, link.source.y);
				path.quadraticCurveTo(
					(link.source.x + link.target.x) / 2,
					(link.source.y + link.target.y) / 2 - 15,
					link.target.x,
					link.target.y,
				);
				return path.toString();
			};

			const edgeSelection = edgeLayer.selectAll("path")
				.data(links, link => `${link.source.id || link.source}->${link.target.id || link.target}:${link.type}`)
				.join("path")
				.attr("class", link => "lm-graph-edge lm-graph-edge-" + (link.type || "related"))
				.attr("d", edgePath);

			const nodeSelection = nodeLayer.selectAll("g")
				.data(nodes, node => node.id)
				.join("g")
				.attr("class", node => "lm-graph-node lm-graph-kind-" + (node.kind || "other"))
				.attr("transform", node => `translate(${node.x},${node.y})`)
				.attr("role", "button")
				.attr("aria-label", node => `${node.title || node.key} · ${node.kind || ""}`)
				.attr("tabindex", -1);

			nodeSelection.append("circle").attr("class", "lm-graph-halo").attr("r", node => node.r + 7);
			nodeSelection.append("circle").attr("class", "lm-graph-dot").attr("r", node => node.r);
			nodeSelection.append("circle").attr("class", "lm-graph-ring").attr("r", node => node.r + 4);

			const labelSelection = labelLayer.selectAll("text")
				.data(nodes, node => node.id)
				.join("text")
				.attr("class", "lm-graph-label")
				.attr("dy", "0.34em")
				.text(node => labelText(node))
				.attr("visibility", "hidden");

			const visibleSet = new Set(nodes.map(node => node.id));
			const emphasisSet = new Set(nodes.map(node => node.id));

			const importantNodes = [...nodes].sort((a, b) => (
				(Number(b.degree) || 0) - (Number(a.degree) || 0)
				|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
			)).slice(0, LABEL_LIMIT);

			let labelFontSize = LABEL_FONT_PX;
			const labelRect = (node, option) => {
				const width = measureText(labelText(node), `${labelFontSize}px system-ui, -apple-system, 'Segoe UI', sans-serif`);
				const x0 = option.anchor === "start" ? option.x : option.anchor === "end" ? option.x - width : option.x - width / 2;
				return { x0, x1: x0 + width, y0: option.y - 11, y1: option.y + 3 };
			};

			// 标签之间不互相压住即可；不再要求标签避开节点圆——密集布局下这条会把
			// 所有候选位置否掉，结果一个标签都出不来。文字自带描边底色，压到节点也读得清。
			const placeLabels = (candidates, activeId, neighborIds, forcedIds) => {
				const placed = [];
				const result = new Map();
				const priority = node => (
					node.id === activeId ? 4
						: forcedIds.has(node.id) ? 3
							: neighborIds.has(node.id) ? 2
								: 1
				);
				const ordered = [...candidates].sort((a, b) => (
					priority(b) - priority(a)
					|| (Number(b.degree) || 0) - (Number(a.degree) || 0)
					|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
				));
				for (const node of ordered) {
					const options = [
						{ x: node.x + node.r + 6, y: node.y + 4, anchor: "start" },
						{ x: node.x - node.r - 6, y: node.y + 4, anchor: "end" },
						{ x: node.x, y: node.y - node.r - 8, anchor: "middle" },
						{ x: node.x, y: node.y + node.r + 15, anchor: "middle" },
						{ x: node.x + node.r + 4, y: node.y - node.r - 4, anchor: "start" },
						{ x: node.x + node.r + 4, y: node.y + node.r + 14, anchor: "start" },
						{ x: node.x - node.r - 4, y: node.y - node.r - 4, anchor: "end" },
						{ x: node.x - node.r - 4, y: node.y + node.r + 14, anchor: "end" },
					];
					let chosen = null;
					for (const option of options) {
						const rect = labelRect(node, option);
						if (placed.some(other => rectsOverlap(other, rect, 2))) continue;
						chosen = { option, rect };
						break;
					}
					if (!chosen && priority(node) >= 3) {
						// 焦点节点与重点节点保底：宁可轻微压到别的标签也要显示出来
						const option = options[0];
						chosen = { option, rect: labelRect(node, option) };
					}
					if (!chosen) continue;
					placed.push(chosen.rect);
					result.set(node.id, chosen);
				}
				return result;
			};

			const applyLabels = (activeId, neighborIds) => {
				const candidates = new Map();
				for (const node of importantNodes) candidates.set(node.id, node);
				if (activeId) {
					const active = nodes.find(node => node.id === activeId);
					if (active) candidates.set(active.id, active);
					// 邻居只取前几个，避免悬停一个枢纽时冒出一片文字。
					const neighborNodes = [...neighborIds]
						.map(id => nodes.find(item => item.id === id))
						.filter(Boolean)
						.sort((a, b) => (
							(Number(b.degree) || 0) - (Number(a.degree) || 0)
							|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
						))
						.slice(0, NEIGHBOR_LABEL_LIMIT);
					for (const node of neighborNodes) candidates.set(node.id, node);
				}
				const allowed = [...candidates.values()].filter(node => (
					visibleSet.has(node.id) && (emphasisSet.has(node.id) || node.id === activeId)
				));
				// 必显的一批：当前可见且未被类型过滤排除的节点里，连接度与热度最高的几个。
				const forcedIds = new Set([...allowed]
					.sort((a, b) => (
						(Number(b.degree) || 0) - (Number(a.degree) || 0)
						|| (Number(b.heat) || 0) - (Number(a.heat) || 0)
					))
					.slice(0, HUB_LABEL_LIMIT)
					.map(node => node.id));
				const placed = placeLabels(allowed, activeId, neighborIds, forcedIds);
				labelSelection
					.attr("font-size", labelFontSize)
					.attr("visibility", node => (placed.has(node.id) ? "visible" : "hidden"))
					.attr("x", node => (placed.get(node.id) ? placed.get(node.id).option.x : node.x))
					.attr("y", node => (placed.get(node.id) ? placed.get(node.id).option.y : node.y))
					.attr("text-anchor", node => (placed.get(node.id) ? placed.get(node.id).option.anchor : "middle"));
				nodeSelection.attr("tabindex", node => (placed.has(node.id) ? 0 : -1));
				return placed;
			};

			const redraw = () => {
				nodeSelection.attr("transform", node => `translate(${node.x},${node.y})`);
				edgeSelection.attr("d", edgePath);
				applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
			};

			const drag = d3.drag()
				.on("start", (event, node) => {
					node.fx = node.x;
					node.fy = node.y;
					nodeSelection.classed("is-dragging", item => item.id === node.id);
				})
				.on("drag", (event, node) => {
					node.fx = event.x;
					node.fy = event.y;
					node.x = event.x;
					node.y = event.y;
					redraw();
				})
				.on("end", (event, node) => {
					node.fx = node.x;
					node.fy = node.y;
					nodeSelection.classed("is-dragging", false);
				});

			nodeSelection.call(drag);

			let pointerStart = null;
			const zoom = d3.zoom()
				.scaleExtent([ZOOM_MIN, ZOOM_MAX])
				.on("start", event => {
					if (event.sourceEvent) {
						pointerStart = d3.pointer(event.sourceEvent, svgNode);
						suppressClickRef.current = false;
						if (event.sourceEvent.type === "mousedown") stage.classList.add("lm-graph-is-panning");
					}
				})
				.on("zoom", event => {
					viewport.attr("transform", event.transform);
				})
				.on("end", event => {
					stage.classList.remove("lm-graph-is-panning");
					if (event.sourceEvent && pointerStart) {
						const end = d3.pointer(event.sourceEvent, svgNode);
						const moved = Math.abs(end[0] - pointerStart[0]) + Math.abs(end[1] - pointerStart[1]);
						suppressClickRef.current = moved > 4;
					}
				});
			svg.call(zoom);
			svg.on("dblclick.zoom", null);
			const endWindowGesture = () => {
				d3.select(window).on("mousemove.zoom mouseup.zoom", null);
			};
			window.addEventListener("pointerup", endWindowGesture, true);
			window.addEventListener("pointercancel", endWindowGesture, true);
			window.addEventListener("blur", endWindowGesture);
			svg.on("click", () => {
				const suppressed = suppressClickRef.current;
				suppressClickRef.current = false;
				if (suppressed) return;
				setSelectedId(null);
			});

			nodeSelection
				.on("mouseenter", (event, node) => setHoverId(node.id))
				.on("mouseleave", () => setHoverId(null))
				.on("focus", (event, node) => setHoverId(node.id))
				.on("blur", () => setHoverId(null))
				.on("click", (event, node) => {
					event.stopPropagation();
					setSelectedId(node.id);
				})
				.on("keydown", (event, node) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						event.stopPropagation();
						setSelectedId(node.id);
					}
				});

			const moveTooltip = node => {
				const tooltip = tooltipRef.current;
				if (!tooltip) return;
				const transform = d3.zoomTransform(svgNode);
				const x = node.x * transform.k + transform.x;
				const y = node.y * transform.k + transform.y;
				const bounds = stage.getBoundingClientRect();
				const rect = tooltip.getBoundingClientRect();
				const width = rect.width || tooltipSizeRef.current.width;
				const height = rect.height || tooltipSizeRef.current.height;
				// 提示框不压顶部工具栏卡片：卡片展开时按整张卡的下沿避让。
				const card = optionsCardRef.current;
				const toolbarBottom = card ? card.getBoundingClientRect().bottom - bounds.top + 6 : 8;
				const bottomLimit = bounds.height - 8 - height;
				let left = x + 16;
				let top = y - height / 2;
				if (left + width > bounds.width - 8) left = x - width - 16;
				if (left < 8) left = 8;
				if (top < toolbarBottom) top = toolbarBottom;
				if (top > bottomLimit) top = Math.max(toolbarBottom, bottomLimit);
				tooltip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
			};

			nodeSelection.on("mousemove", (event, node) => moveTooltip(node));

			const scene = {
				d3, svg, viewport, nodes, links, nodeSelection, edgeSelection, labelSelection,
				zoom, redraw, placeLabels, applyLabels, importantNodes, moveTooltip,
				visible: visibleSet,
				size: { width, height },
			};

			scene.setEmphasis = emphasisIds => {
				emphasisSet.clear();
				for (const id of emphasisIds) emphasisSet.add(id);
				nodeSelection.classed("is-muted", node => visibleSet.has(node.id) && !emphasisSet.has(node.id));
				edgeSelection.classed("is-muted", link => !emphasisSet.has(link.source.id) || !emphasisSet.has(link.target.id));
				applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
			};

			scene.setVisible = visibleIds => {
				visibleSet.clear();
				for (const id of visibleIds) visibleSet.add(id);
				nodeSelection.style("display", node => (visibleSet.has(node.id) ? null : "none"));
				edgeSelection.style("display", link => (
					visibleSet.has(link.source.id) && visibleSet.has(link.target.id) ? null : "none"
				));
				labelSelection.style("display", node => (visibleSet.has(node.id) ? null : "none"));
			};

			scene.fit = animated => {
				const visibleNodes = nodes.filter(node => visibleSet.has(node.id));
				if (!visibleNodes.length) return;
				const size = measureStage();
				const area = computeFitArea(size);
				let x0 = Infinity;
				let y0 = Infinity;
				let x1 = -Infinity;
				let y1 = -Infinity;
				for (const node of visibleNodes) {
					x0 = Math.min(x0, node.x - node.r);
					y0 = Math.min(y0, node.y - node.r);
					x1 = Math.max(x1, node.x + node.r);
					y1 = Math.max(y1, node.y + node.r);
				}
				// 字号与画布利用率分开处理：先用节点包围盒估出缩放比，
				// 再把标签的世界字号放大到「屏上不小于基准字号」，标签始终读得清。
				const nodeBoxWidth = Math.max(1, x1 - x0);
				const nodeBoxHeight = Math.max(1, y1 - y0);
				const scaleHint = Math.min(area.areaWidth / nodeBoxWidth, area.areaHeight / nodeBoxHeight);
				labelFontSize = Math.max(LABEL_FONT_PX, Math.min(LABEL_FONT_PX * 2, LABEL_FONT_PX / Math.min(1, scaleHint)));
				const placed = applyLabels(hoverIdRef.current || selectedIdRef.current, neighborIdsRef.current);
				for (const entry of placed.values()) {
					x0 = Math.min(x0, entry.rect.x0);
					y0 = Math.min(y0, entry.rect.y0);
					x1 = Math.max(x1, entry.rect.x1);
					y1 = Math.max(y1, entry.rect.y1);
				}
				const reserve = area.reserve;
				const areaWidth = area.areaWidth;
				const areaHeight = area.areaHeight;
				const boxWidth = Math.max(1, x1 - x0);
				const boxHeight = Math.max(1, y1 - y0);
				const scale = Math.max(ZOOM_MIN, Math.min(2, 0.94 * Math.min(areaWidth / boxWidth, areaHeight / boxHeight)));
				const transform = d3.zoomIdentity
					.translate(size.width / 2, reserve + areaHeight / 2)
					.scale(scale)
					.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
				svg.interrupt();
				if (animated && !reducedMotion) {
					svg.transition().duration(360).ease(d3.easeCubicOut).call(zoom.transform, transform);
				} else {
					svg.call(zoom.transform, transform);
				}
			};

			scene.reset = () => {
				const visibleNodes = nodes.filter(node => visibleSet.has(node.id));
				if (!visibleNodes.length) return;
				const size = measureStage();
				let x0 = Infinity;
				let y0 = Infinity;
				let x1 = -Infinity;
				let y1 = -Infinity;
				for (const node of visibleNodes) {
					x0 = Math.min(x0, node.x - node.r);
					y0 = Math.min(y0, node.y - node.r);
					x1 = Math.max(x1, node.x + node.r);
					y1 = Math.max(y1, node.y + node.r);
				}
				const transform = d3.zoomIdentity
					.translate(size.width / 2, size.height / 2)
					.scale(1)
					.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
				svg.interrupt();
				if (reducedMotion) svg.call(zoom.transform, transform);
				else svg.transition().duration(320).ease(d3.easeCubicOut).call(zoom.transform, transform);
			};

			// 容器尺寸变化（侧栏开合、宽窄屏、浏览器缩放）时：按当前容器重算宽高比，
			// 再重新适屏；布局本身不重跑，节点不会因为尺寸变化而重新洗牌。
			scene.applyViewport = animated => {
				const size = measureStage();
				const nextAspect = layoutAspectFor(size);
				if (Math.abs(nextAspect - layoutAspect) / layoutAspect > 0.08) {
					// 可视区比例明显变化（侧栏开合、宽窄屏切换）：按新比例重排，
					// 同一 seed 结果稳定，再重新适屏。
					runLayout(size);
					redraw();
				}
				scene.fit(animated);
			};

			scene.zoomBy = factor => {
				svg.interrupt();
				if (reducedMotion) svg.call(zoom.scaleBy, factor);
				else svg.transition().duration(220).ease(d3.easeCubicOut).call(zoom.scaleBy, factor);
			};

			sceneRef.current = scene;
			firstFitRef.current = true;
			applyLabels(null, new Set());
			scene.fit(false);

			if (!reducedMotion) {
				nodeSelection.attr("opacity", 0)
					.transition()
					.duration(420)
					.delay((node, index) => Math.min(index * 5, 320))
					.ease(d3.easeCubicOut)
					.attr("opacity", 1);
				nodeSelection.select(".lm-graph-dot").attr("r", 0)
					.transition()
					.duration(300)
					.delay((node, index) => Math.min(index * 5, 320))
					.ease(d3.easeCubicOut)
					.attr("r", node => node.r);
				edgeSelection.attr("opacity", 0).transition().duration(520).attr("opacity", null);
			} else {
				nodeSelection.attr("opacity", 1);
				nodeSelection.select(".lm-graph-dot").attr("r", node => node.r);
				edgeSelection.attr("opacity", null);
			}

			setSceneVersion(version => version + 1);

			return () => {
				svg.interrupt();
				window.removeEventListener("pointerup", endWindowGesture, true);
				window.removeEventListener("pointercancel", endWindowGesture, true);
				window.removeEventListener("blur", endWindowGesture);
				d3.select(window).on("mousemove.zoom mouseup.zoom", null);
				svg.on(".zoom", null);
				svg.on("click", null);
				svg.selectAll("*").remove();
				if (sceneRef.current === scene) sceneRef.current = null;
			};
		}, [graph, namespace, reducedMotion]);

		useEffect(() => {
			// 把 buildScene 的清理函数交回 React：场景重建或卸载时，
			// 原生 window 监听、缩放行为与场景 DOM 才会真正释放。
			return buildScene();
		}, [buildScene]);

		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			const activeId = hoverId || selectedId;
			const neighborIds = new Set();
			if (activeId) {
				neighborIds.add(activeId);
				for (const link of scene.links) {
					if (link.source.id === activeId) neighborIds.add(link.target.id);
					if (link.target.id === activeId) neighborIds.add(link.source.id);
				}
			}
			neighborIdsRef.current = neighborIds;
			scene.nodeSelection
				.classed("is-active", node => node.id === activeId)
				.classed("is-linked", node => Boolean(activeId) && node.id !== activeId && neighborIds.has(node.id))
				.classed("is-dim", node => Boolean(activeId) && !neighborIds.has(node.id));
			scene.edgeSelection
				.classed("is-active", link => Boolean(activeId) && (link.source.id === activeId || link.target.id === activeId))
				.classed("is-dim", link => Boolean(activeId) && !(link.source.id === activeId || link.target.id === activeId));
			scene.labelSelection
				.classed("is-active", node => node.id === activeId)
				.classed("is-linked", node => Boolean(activeId) && node.id !== activeId && neighborIds.has(node.id));
			scene.applyLabels(activeId, neighborIds);
			if (hoverId) {
				const active = scene.nodes.find(node => node.id === hoverId);
				if (active) scene.moveTooltip(active);
			}
		}, [hoverId, selectedId, sceneVersion]);

		// 用内容签名做依赖：只有真正移除节点的过滤（搜索 / 仅看有边）才重新适屏，
		// 类型强调只改明暗，不动视口，避免筛选时画面跳动。
		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			scene.setVisible(new Set(filtered.nodes.map(node => node.id)));
			const animate = !firstFitRef.current;
			firstFitRef.current = false;
			scene.fit(animate);
		}, [filtered.removingKey, sceneVersion]);

		useEffect(() => {
			const scene = sceneRef.current;
			if (!scene) return;
			scene.setEmphasis(new Set(filtered.kindMatched.map(node => node.id)));
		}, [filtered.kindKey, sceneVersion]);

		useEffect(() => {
			const scene = sceneRef.current;
			const stage = stageRef.current;
			if (!scene || !stage || typeof ResizeObserver === "undefined") return undefined;
			let frame = 0;
			const observer = new ResizeObserver(() => {
				if (frame) cancelAnimationFrame(frame);
				frame = requestAnimationFrame(() => {
					const current = sceneRef.current;
					if (!current) return;
					current.applyViewport(true);
				});
			});
			observer.observe(stage);
			return () => {
				if (frame) cancelAnimationFrame(frame);
				observer.disconnect();
			};
		}, [sceneVersion]);

		const closeOptions = useCallback(restoreFocus => {
			setOptionsOpen(false);
			if (restoreFocus && optionsTriggerRef.current) {
				optionsTriggerRef.current.focus({ preventScroll: true });
			}
		}, []);
		const dismissOptions = useCallback(() => closeOptions(false), [closeOptions]);
		// 外点关闭：卡片根同时充当“内部”判定，卡片内（header 与展开区）的点击不会误关。
		useOutsideDismiss(optionsCardRef, optionsOpen, dismissOptions, optionsCardRef);

		useEffect(() => {
			const stage = stageRef.current;
			if (!stage) return undefined;
			const onKeyDown = event => {
				if (event.key === "Escape") {
					setSelectedId(null);
					setHoverId(null);
					closeOptions(true);
				}
			};
			stage.addEventListener("keydown", onKeyDown);
			return () => stage.removeEventListener("keydown", onKeyDown);
		}, []);

		useEffect(() => {
			const tooltip = tooltipRef.current;
			if (!tooltip) return;
			const rect = tooltip.getBoundingClientRect();
			tooltipSizeRef.current = { width: rect.width || 240, height: rect.height || 72 };
		}, [hoverId, selectedId]);

		const kindLabel = kind => {
			if (kind === "rule") return s.kindRule;
			if (kind === "fact") return s.kindFact;
			if (kind === "sop") return s.kindSop;
			return kind || "—";
		};

		const kindLocked = kindControlled && typeof onKindChange !== "function";
		// 类型 chip 上的数字是当前命名空间的库存数（不受搜索 / 仅看有边影响），
		// 与条目表的 facets 口径一致；搜索造成的可见数量变化由下面的节点计数体现。
		const kindCounts = useMemo(() => {
			const counts = { rule: 0, fact: 0, sop: 0 };
			for (const node of graph ? graph.nodes : []) {
				if (counts[node.kind] !== undefined) counts[node.kind] += 1;
			}
			return counts;
		}, [graph]);

		const countsText = s.counts
			.replace("{nodes}", String(filtered.nodes.length))
			.replace("{totalNodes}", String(graph ? graph.nodes.length : 0))
			.replace("{edges}", String(filtered.edges.length))
			.replace("{totalEdges}", String(graph ? graph.edges.length : 0));

		const activeConditions = (kindFilter ? 1 : 0)
			+ (edgeTypes.related === false || edgeTypes.similar === false ? 1 : 0)
			+ (onlyConnected ? 1 : 0);
		// 基础文案与生效条件后缀分开：基础文案永不收缩，后缀先被省略。
		const optionsSuffix = `${kindFilter ? " · " + kindLabel(kindFilter) : ""}${activeConditions ? " (" + activeConditions + ")" : ""}`;
		const optionsLabel = `${s.displayOptions}${optionsSuffix}`;

		const searchInput = Input
			? h(Input, {
				type: "search",
				className: "lm-graph-search",
				placeholder: s.search,
				value: query,
				onChange: event => setQuery(event.target.value),
			})
			: h("input", {
				type: "search",
				className: "lm-graph-search",
				placeholder: s.search,
				value: query,
				onChange: event => setQuery(event.target.value),
			});

		// 显示选项的内容：类型强调、关系类型、仅看有边、重置与计数。
		const optionsContent = h("div", { className: "lm-graph-options-body" },
			h("div", { className: "lm-graph-options-group" },
				h("span", { className: "lm-graph-options-label" }, s.typeFilter),
				h("div", { className: "lm-graph-chips" },
					h(ToggleButton, {
						label: `${s.all} (${graph ? graph.nodes.length : 0})`,
						active: kindFilter === "",
						disabled: kindLocked,
						onClick: () => applyKind(""),
					}),
					KIND_ORDER.map(kind => h(ToggleButton, {
						key: kind,
						label: `${kindLabel(kind)} (${kindCounts[kind] || 0})`,
						active: kindFilter === kind,
						disabled: kindLocked,
						onClick: () => applyKind(kindFilter === kind ? "" : kind),
					})))),
			h("div", { className: "lm-graph-options-group" },
				h("span", { className: "lm-graph-options-label" }, s.relationFilter),
				h("div", { className: "lm-graph-chips" },
					EDGE_TYPES.map(type => h(ToggleButton, {
						key: type,
						label: `${type === "similar" ? s.similar : s.explicit} (${filtered.edgeCounts[type] || 0})`,
						active: edgeTypes[type] !== false,
						onClick: () => setEdgeTypes(current => ({ ...current, [type]: current[type] === false })),
					})))),
			h("div", { className: "lm-graph-options-group" },
				Switch
					? h("label", { className: "lm-graph-switch" },
						h(Switch, { checked: onlyConnected, onChange: value => setOnlyConnected(Boolean(value)) }),
						h("span", null, s.onlyConnected))
					: h("label", { className: "lm-graph-switch" },
						h("input", { type: "checkbox", checked: onlyConnected, onChange: event => setOnlyConnected(event.target.checked) }),
						h("span", null, s.onlyConnected))),
			h("div", { className: "lm-graph-options-foot" },
				h(ActionButton, {
					label: s.reset,
					variant: "ghost",
					title: s.reset,
					onClick: () => sceneRef.current && sceneRef.current.reset(),
				}),
				h("span", { className: "lm-graph-counts" }, countsText)));

		// 一张可展开的卡片：header 行（搜索 + 适屏 + 显示选项入口）常驻，
		// 展开区接在同卡片下缘、同宽、内部滚动。
		// toolbarRef 只挂 header 行——适屏预留与 observer 只看它，
		// 展开高度因此不会触发 refit、也不会推动画布。
		const toolbar = h(DisclosureView, {
			open: optionsOpen,
			onOpenChange: next => setOptionsOpen(Boolean(next)),
			id: "lm-graph-options",
			rootRef: optionsCardRef,
			className: "lm-graph-toolbar-card",
			bodyClassName: "lm-graph-toolbar-body",
			renderHeader: ({ open, toggle, contentId }) => h("div", {
				className: "lm-graph-toolbar-header",
				ref: toolbarRef,
			},
				searchInput,
				h(ActionButton, {
					label: s.fitShort,
					title: s.fit,
					ariaLabel: s.fit,
					extraClass: "is-fixed",
					onClick: () => sceneRef.current && sceneRef.current.fit(true),
				}),
				h(ActionButton, {
					label: s.displayOptions,
					title: optionsLabel,
					ariaLabel: optionsLabel,
					ariaExpanded: open,
					ariaControls: contentId,
					extraClass: (open || activeConditions ? "is-active " : "") + "is-fixed",
					icon: IconSlidersTwoOutlineRegular ? h(IconSlidersTwoOutlineRegular, { size: 13 }) : undefined,
					buttonRef: optionsTriggerRef,
					onClick: toggle,
				}),
				optionsSuffix
					? h("span", { className: "lm-graph-options-state", title: optionsSuffix, "aria-hidden": "true" }, optionsSuffix)
					: null),
			children: optionsContent,
		});

		// 缩放做成地图角落的紧凑控件，键盘与触屏都能按到。
		const zoomCluster = h("div", { className: "lm-graph-zoom-cluster" },
			h(ActionButton, {
				label: "+",
				title: s.zoomIn,
				ariaLabel: s.zoomIn,
				onClick: () => sceneRef.current && sceneRef.current.zoomBy(1.4),
			}),
			h(ActionButton, {
				label: "−",
				title: s.zoomOut,
				ariaLabel: s.zoomOut,
				onClick: () => sceneRef.current && sceneRef.current.zoomBy(1 / 1.4),
			}));

		const legend = h("div", { className: "lm-graph-legend", "aria-label": s.legend },
			KIND_ORDER.map(kind => h("span", { key: kind, className: "lm-graph-legend-item" },
				h("span", { className: "lm-graph-legend-swatch lm-graph-kind-" + kind }),
				kindLabel(kind))));

		const hoveredNeighbors = hoveredNode ? neighborsOf(hoveredNode.id).length : 0;
		const tooltip = hoveredNode
			? h("div", { className: "lm-graph-tooltip", ref: tooltipRef, role: "status" },
				h("div", { className: "lm-graph-tooltip-title" }, hoveredNode.title || hoveredNode.key),
				h("div", { className: "lm-graph-tooltip-row" },
					h("span", { className: "lm-graph-tooltip-kind lm-graph-kind-" + (hoveredNode.kind || "other") }, kindLabel(hoveredNode.kind)),
					h("span", null, ` · ${s.relations} ${hoveredNeighbors}`)))
			: null;

		const neighbors = selectedNode ? neighborsOf(selectedNode.id) : [];

		const disclosure = (key, title, count, children, id) => h(DisclosureView, {
			title,
			open: Boolean(sections[key]),
			onOpenChange: next => setSections(current => ({ ...current, [key]: Boolean(next) })),
			children,
			id,
			count,
			className: "lm-graph-disclosure",
		});

		// 选中面板默认只留标题、类型、打开条目；关联与定位信息按需展开。
		const panel = selectedNode
			? h("aside", {
				key: selectedNode.id,
				className: "lm-graph-panel",
				"aria-label": s.detail,
				style: { "--lm-graph-panel-top": Math.round(toolbarHeight + 20) + "px" },
			},
				h("div", { className: "lm-graph-panel-head" },
					h("div", { className: "lm-graph-panel-titles" },
						h("h3", { className: "lm-graph-panel-title" }, selectedNode.title || selectedNode.key),
						h("span", { className: "lm-graph-panel-kind lm-graph-kind-" + (selectedNode.kind || "other") }, kindLabel(selectedNode.kind))),
					h(ActionButton, {
						label: IconCloseOutlineRegular ? null : "✕",
						title: s.close,
						ariaLabel: s.close,
						variant: "ghost",
						icon: IconCloseOutlineRegular ? h(IconCloseOutlineRegular, { size: 13 }) : undefined,
						onClick: () => setSelectedId(null),
					})),
				h(ActionButton, {
					label: s.openEntry,
					variant: "primary",
					onClick: () => {
						if (!onJumpEntry) return;
						onJumpEntry({
							namespace: selectedNode.namespace || namespace,
							kind: selectedNode.kind,
							key: selectedNode.key,
						});
					},
				}),
				disclosure("relations", s.relations, neighbors.length,
					neighbors.length
						? h("ul", { className: "lm-graph-neighbor-list" }, neighbors.map(entry => h("li", { key: entry.node.id },
							h("button", {
								type: "button",
								className: "lm-graph-neighbor-link",
								onClick: () => setSelectedId(entry.node.id),
							}, entry.node.title || entry.node.key),
							entry.edge.type === "similar" && entry.edge.similarity != null
								? h("span", { className: "lm-graph-neighbor-sim" }, `${s.similarity} ${Math.round(Number(entry.edge.similarity) * 100)}%`)
								: null)))
						: h("p", { className: "lm-graph-panel-empty" }, s.noNeighbors),
					"lm-graph-panel-relations"),
				disclosure("locate", s.locate, null,
					h("div", { className: "lm-graph-panel-locate" },
						h("span", null, selectedNode.namespace || namespace || "—"),
						h("span", null, selectedNode.kind || "—"),
						h("span", null, selectedNode.key || "—")),
					"lm-graph-panel-locate"))
			: null;

		const hasFilters = Boolean(query.trim())
			|| Boolean(kindFilter)
			|| onlyConnected
			|| edgeTypes.related === false
			|| edgeTypes.similar === false;
		const clearFilters = useCallback(() => {
			setQuery("");
			setOnlyConnected(false);
			setEdgeTypes({ related: true, similar: true });
			applyKind("");
		}, [applyKind]);
		const errorDetail = error && error.message ? error.message : "";

		const refreshIcon = IconRefreshOutlineRegular ? h(IconRefreshOutlineRegular, { size: 13 }) : undefined;
		const overlay = status === "loading"
			? h("div", { className: "lm-graph-overlay" },
				h(StateIcon, { kind: "loading" }),
				h("p", { className: "lm-graph-overlay-title" }, s.loading))
			: status === "error"
				? h("div", { className: "lm-graph-overlay lm-graph-overlay-error" },
					h(StateIcon, { kind: "error" }),
					h("p", { className: "lm-graph-overlay-title" }, s.loadFailed),
					h("div", { className: "lm-graph-overlay-actions" },
						h(ActionButton, {
							label: s.retry,
							variant: "primary",
							ariaLabel: s.retry,
							icon: refreshIcon,
							onClick: () => load(),
						}),
						errorDetail
							? h(ActionButton, {
								label: s.detail,
								variant: "ghost",
								ariaLabel: s.detail,
								ariaExpanded: detailOpen,
								onClick: () => setDetailOpen(open => !open),
							})
							: null),
					detailOpen && errorDetail
						? h("p", { className: "lm-graph-overlay-detail" }, errorDetail)
						: null)
				: status === "no-namespace"
					? h("div", { className: "lm-graph-overlay" },
						h(StateIcon, { kind: "empty" }),
						h("p", { className: "lm-graph-overlay-title" }, s.noNamespace))
					: status === "ready" && !engineReady
						? h("div", { className: "lm-graph-overlay lm-graph-overlay-error" },
							h(StateIcon, { kind: "error" }),
							h("p", { className: "lm-graph-overlay-title" }, s.engineMissing),
							h(ActionButton, {
								label: s.reload,
								variant: "primary",
								ariaLabel: s.reload,
								icon: refreshIcon,
								onClick: () => { if (typeof window !== "undefined") window.location.reload(); },
							}))
						: status === "ready" && (!filtered.nodes.length || (kindFilter && !filtered.kindMatched.length))
							? h("div", { className: "lm-graph-overlay" },
								h(StateIcon, { kind: graph && graph.nodes.length ? "filtered" : "empty" }),
								h("p", { className: "lm-graph-overlay-title" }, graph && graph.nodes.length ? s.noMatch : s.empty),
								hasFilters
									? h(ActionButton, { label: s.clearFilters, variant: "outline", onClick: () => clearFilters() })
									: null)
							: null;

		return h("div", { className: "lm-graph-view" },
			h("style", null, styleText),
			h("div", { className: "lm-graph-stage", ref: stageRef },
				h("svg", {
					className: "lm-graph-canvas",
					ref: svgRef,
					role: "img",
					"aria-label": s.graphLabel,
					tabIndex: 0,
				}),
				toolbar,
				zoomCluster,
				legend,
				tooltip,
				panel,
				overlay));
	}

	return MemoryGraphView;
}

function createMemoryBrowserClient(require, styles, runtime) {
	const React = require("react");
	const {
		Button, Input, Menu, MenuItemButton, Switch, Tooltip,
		IconPlusOutlineRegular, IconSearchOutlineRegular, IconCloseOutlineRegular,
		IconChevronDownOutlineRegular, IconCheckOutlineRegular,
	} = require("@deepseek-ai/dsh-client-ui-primitives");
	// runtime 由 scripts/build.mjs 注入；未注入时各视图退回本文件内的实现。
	const runtimeComponents = (runtime && runtime.components) || {};
	const DataTable = runtimeComponents.DataTable || null;
	const DataTableContent = runtimeComponents.DataTableContent || null;
	const SegmentedControl = runtimeComponents.SegmentedControl || null;
	const Disclosure = runtimeComponents.Disclosure || LocalDisclosure;
	const ToolbarPopover = runtimeComponents.ToolbarPopover || null;
	const h = React.createElement;
	const locale = "layered-memory";

	const dictionaries = {
		zh: {
			ruleContentCount: "当前 {count} / {limit} 字符", ruleContentNearLimit: "接近规则正文上限，请保留完整适用条件。", ruleContentOverLimit: "规则正文超过 {limit} 字符，请精简后保存。",
			title: "记忆系统工作台", newEntry: "新建条目", namespace: "命名空间", search: "搜索记忆", searchPlaceholder: "搜索标题、正文或关键词", clearSearch: "清空",
			all: "全部", showArchived: "已归档", entries: "条目表格", loading: "正在读取…", empty: "没有匹配的记忆条目", emptyDetail: "从左侧列表选择条目查看详情",
			archived: "已归档", content: "正文内容", evidence: "证据与溯源", save: "保存", saving: "保存中…", archive: "归档", restore: "恢复",
			noHistory: "暂无历史快照", rollback: "回滚版本", rollbackConfirm: "确认回滚", cancel: "取消",
			rollbackWarning: "回滚将覆盖当前内容。", requiredFields: "标题、内容、依据都必须填写", loadTimeout: "记忆数据加载超时", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照", preview: "对比", collapse: "收起", initialVersion: "初始版本", evidenceUpdated: "证据更新", contentDelta: "内容 {delta} 字符", noContentChange: "无正文变化", noSummary: "（空内容）", noPreview: "该快照没有可预览的正文", editMode: "编辑",
			reload: "重新加载", conflict: "条目已被修改，请重新加载后再保存。", createTitle: "新建记忆条目", topic: "标识 / 标题",
			topicPlaceholder: "输入条目标题或唯一标识", contentPlaceholder: "输入记忆正文", evidencePlaceholder: "输入本次写入的证据来源", create: "创建条目", creating: "创建中…",
			created: "条目已创建", close: "关闭", createdAt: "创建时间", updatedAt: "更新时间", characters: "{count} 字符",
			listFailed: "条目列表读取失败", detailFailed: "条目详情读取失败", historyFailed: "历史快照读取失败", noNamespace: "暂无可用命名空间",
			"usage.used": "索引已用", "usage.total": "{used} / {budget} 字符", "usage.over": "已超预算",
			"usage.count": "{count} 条", "usage.share": "占已用 {share}%",
			"usage.label.head": "说明", "usage.label.rules": "规则", "usage.label.facts": "事实目录", "usage.label.sops": "经验目录",
			"kind.rule": "规则", "kind.fact": "事实", "kind.sop": "经验", kindLabel: "类型", ruleEvidencePlaceholder: "输入规则依据，例如用户的明确指令",
			"usage.tip.head": "索引头部说明", "usage.tip.rules": "L0 红线规则", "usage.tip.facts": "事实条目目录 (facts.md)", "usage.tip.sops": "任务经验目录 (sops/)",
			tabEntries: "条目表格", tabInjection: "注入透视", tabGraph: "关系图谱",
			backToList: "← 返回列表",
			heatLabel: "热度", accessLabel: "访问", statusLabel: "流态",
			inventoryLabel: "库存", resultCount: "{count} 条结果", clearFilter: "清除筛选",
			inventoryChipTitle: "库存：活跃 {active} · 归档 {archived}",
			loadMore: "加载更多",
			recallQuery: "召回预览词", recallPlaceholder: "输入词，模拟本地召回",
			statusUnknown: "未判定",
			previewScope: "空间预览", coldCandidateTitle: "候选",
			sourceBudget: "预算", sourceTarget: "目标", sourceColdRatio: "冷比例", sourceRecall: "召回词",
			copyReferenceFailed: "复制失败，请从「来源与依据」手动复制引用", noCandidates: "本次检查未发现候选",
			storeEntriesTitle: "条目",
			retry: "重试", loadFailed: "读取失败", loadFailedHint: "请求失败，可以重试。", details: "详情", emptyEntries: "没有匹配的条目",
			rawPrompt: "原文", groupedPrompt: "分组", copyPrompt: "复制原文", copied: "已复制", copyFailed: "复制失败，请手动选择原文",
			groupRules: "规则", groupFacts: "事实目录", groupSops: "经验目录",
			notEntry: "索引头部，不是条目类型", openEntry: "打开条目", space: "空间", sidebarTitle: "记忆",
			draftSwitchWarning: "有未保存的修改，切换会丢弃。",
			ruleOverLimit: "规则正文超过 100 字符，无法保存",
			confirmTitle: "请确认", confirm: "继续", injectionEmpty: "当前筛选没有条目",
			sourceTitle: "来源与依据", relatedTitle: "关联", historyTitle: "历史",
			moreActions: "更多", copyReference: "复制引用", referenceCopied: "已复制引用",
			entryKey: "标识", noEvidence: "暂无依据",
			filters: "筛选", advancedTitle: "高级设置",
			injectionPaneLabel: "切换面板", injectionListPane: "名单", injectionPreviewPane: "预览",
		},
		en: {
			ruleContentCount: "Current {count} / {limit} chars", ruleContentNearLimit: "Approaching rule limit.", ruleContentOverLimit: "Rule exceeds {limit} chars.",
			title: "Memory Workspace", newEntry: "New Entry", namespace: "Namespace", search: "Search", searchPlaceholder: "Search title, body or keyword", clearSearch: "Clear",
			all: "All", showArchived: "Archived", entries: "Data Table", loading: "Loading…", empty: "No matching entries", emptyDetail: "Select an entry to view details",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			noHistory: "No history", rollback: "Rollback", rollbackConfirm: "Confirm", cancel: "Cancel",
			rollbackWarning: "Rollback overwrites the current content.", requiredFields: "Title, content and evidence are required", loadTimeout: "Timed out", saved: "Saved", archivedDone: "Archive updated", rolledBack: "Rolled back", preview: "Diff", collapse: "Collapse", initialVersion: "Initial", evidenceUpdated: "Evidence updated", contentDelta: "{delta} chars", noContentChange: "No change", noSummary: "(empty)", noPreview: "No preview", editMode: "Edit",
			reload: "Reload", conflict: "Conflict detected.", createTitle: "New Memory Entry", topic: "Title / Key",
			topicPlaceholder: "Enter title or key", contentPlaceholder: "Enter content", evidencePlaceholder: "Enter evidence", create: "Create", creating: "Creating…",
			created: "Created", close: "Close", createdAt: "Created", updatedAt: "Updated", characters: "{count} chars",
			listFailed: "Failed to load", detailFailed: "Failed to load detail", historyFailed: "Failed to load history", noNamespace: "No namespace",
			"usage.used": "Index Used", "usage.total": "{used} / {budget} chars", "usage.over": "Over Budget",
			"usage.count": "{count} entries", "usage.share": "{share}%",
			"usage.label.head": "Header", "usage.label.rules": "Rules", "usage.label.facts": "Facts", "usage.label.sops": "Skills",
			"kind.rule": "Rule", "kind.fact": "Fact", "kind.sop": "Skill", kindLabel: "Type", ruleEvidencePlaceholder: "Rule evidence",
			"usage.tip.head": "Index header", "usage.tip.rules": "L0 Rules", "usage.tip.facts": "Facts (facts.md)", "usage.tip.sops": "Skills (sops/)",
			tabEntries: "Data Table", tabInjection: "Injection Flow", tabGraph: "Memory Graph",
			backToList: "← Back",
			heatLabel: "Heat", accessLabel: "Access", statusLabel: "Status",
			inventoryLabel: "Inventory", resultCount: "{count} results", clearFilter: "Clear filter",
			inventoryChipTitle: "Inventory: {active} active · {archived} archived",
			loadMore: "Load more",
			recallQuery: "Recall preview", recallPlaceholder: "Type a term to preview local recall",
			statusUnknown: "Undetermined",
			previewScope: "Space preview", coldCandidateTitle: "Candidates",
			sourceBudget: "Budget", sourceTarget: "Target", sourceColdRatio: "Cold ratio", sourceRecall: "Recall query",
			copyReferenceFailed: "Copy failed, copy the reference manually from Source", noCandidates: "No candidates found in this check",
			storeEntriesTitle: "Entries",
			retry: "Retry", loadFailed: "Failed to load", loadFailedHint: "The request failed. You can retry.", details: "Details", emptyEntries: "No matching entries",
			rawPrompt: "Raw", groupedPrompt: "Grouped", copyPrompt: "Copy raw text", copied: "Copied", copyFailed: "Copy failed, select the raw text manually",
			groupRules: "Rules", groupFacts: "Facts", groupSops: "Skills",
			notEntry: "Index header, not an entry type", openEntry: "Open entry", space: "Space", sidebarTitle: "Memory",
			draftSwitchWarning: "Unsaved changes will be discarded.",
			ruleOverLimit: "Rule content exceeds 100 characters and cannot be saved.",
			confirmTitle: "Please confirm", confirm: "Continue", injectionEmpty: "No entries in the current filter",
			sourceTitle: "Source & evidence", relatedTitle: "Related", historyTitle: "History",
			moreActions: "More", copyReference: "Copy reference", referenceCopied: "Reference copied",
			entryKey: "Key", noEvidence: "No evidence",
			filters: "Filters", advancedTitle: "Advanced",
			injectionPaneLabel: "Switch pane", injectionListPane: "List", injectionPreviewPane: "Preview",
		}
	};

	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}

	const identity = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
	const time = value => {
		if (!value) return "—";
		const date = new Date(value);
		const diffMs = Date.now() - date.getTime();
		const diffMin = Math.round(diffMs / 60000);
		if (diffMin < 1) return "刚刚";
		if (diffMin < 60) return `${diffMin}分钟前`;
		const diffHour = Math.round(diffMin / 60);
		if (diffHour < 24) return `${diffHour}小时前`;
		return `${Math.round(diffHour / 24)}天前`;
	};

	const ruleContentLimit = 100;
	const ruleContentLength = content => Array.from(String(content || "").trim()).length;
	const ruleContentOverLimit = (kind, content) => kind === "rule" && ruleContentLength(content) > ruleContentLimit;
	const entryKinds = ["rule", "fact", "sop"];
	const kindText = (kind, t) => (entryKinds.includes(kind) ? t("kind." + kind) : kind);

	const RING_PATH = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";

	function compactChars(value) {
		const number = Number(value);
		if (!Number.isFinite(number) || number <= 0) return "0";
		if (number < 1000) return String(Math.round(number));
		const scaled = number / 1000;
		return (scaled >= 100 ? String(Math.round(scaled)) : scaled.toFixed(1)) + "K";
	}

	function highlightText(text, query) {
		if (!query || !text) return text;
		const parts = String(text).split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
		return parts.map((part, index) => part.toLowerCase() === query.toLowerCase()
			? h("mark", { key: index, className: "lm-highlight-match" }, part)
			: part);
	}

	// 完整 Markdown 渲染（包含标题、列表、代码块、行内格式）
	function renderMarkdown(text) {
		const lines = String(text || "").split(/\r?\n/);
		const elements = [];
		let inCode = false;
		let codeBuffer = [];

		lines.forEach((line, index) => {
			if (line.startsWith("```")) {
				if (inCode) {
					elements.push(h("pre", { key: "code-" + index, style: { background: "var(--dsw-alias-bg-layer-1)", padding: 10, borderRadius: 8, overflow: "auto" } },
						h("code", null, codeBuffer.join("\n"))));
					codeBuffer = [];
					inCode = false;
				} else {
					inCode = true;
				}
				return;
			}
			if (inCode) {
				codeBuffer.push(line);
				return;
			}
			if (line.startsWith("### ")) {
				elements.push(h("h3", { key: index, style: { margin: "10px 0 4px", fontSize: 14, fontWeight: 600 } }, line.slice(4)));
			} else if (line.startsWith("## ")) {
				elements.push(h("h2", { key: index, style: { margin: "14px 0 6px", fontSize: 16, fontWeight: 600 } }, line.slice(3)));
			} else if (line.startsWith("# ")) {
				elements.push(h("h1", { key: index, style: { margin: "16px 0 8px", fontSize: 18, fontWeight: 600 } }, line.slice(2)));
			} else if (line.startsWith("- ") || line.startsWith("* ")) {
				elements.push(h("li", { key: index, style: { marginLeft: 16, margin: "2px 0" } }, line.slice(2)));
			} else if (line.trim() === "") {
				elements.push(h("div", { key: index, style: { height: 6 } }));
			} else {
				elements.push(h("p", { key: index, style: { margin: "4px 0" } }, line));
			}
		});
		return elements;
	}

	function MemoryBrowserIcon({ size = 20 }) {
		return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" }),
			h("path", { d: "M5 4.5v17M8.5 6H16M8.5 10H16M8.5 14H13" }));
	}

	// BounceNav 弹性导航条
	function BounceNav({ currentTab, onSelect, t }) {
		const tabs = [
			{ id: "entries", label: t("tabEntries") },
			{ id: "injection", label: t("tabInjection") },
			{ id: "graph", label: t("tabGraph") },
			];
		const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === currentTab));
		const containerRef = React.useRef(null);
		const [tabWidth, setTabWidth] = React.useState(98);
		React.useEffect(() => {
			const element = containerRef.current;
			if (!element) return undefined;
			const measure = () => {
				const width = element.clientWidth;
				if (width > 0) setTabWidth(Math.max(64, Math.floor((width - 8) / tabs.length)));
			};
			measure();
			if (typeof ResizeObserver === "undefined") return undefined;
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => observer.disconnect();
		}, []);
		return h("div", { className: "lm-bounce-tabs", ref: containerRef },
			h("div", { className: "lm-bounce-pill", style: { width: tabWidth + "px", transform: `translateX(${activeIndex * (tabWidth + 2)}px)` } }),
			tabs.map(tab => h("button", {
				key: tab.id,
				type: "button",
				style: { width: tabWidth + "px" },
				className: "lm-bounce-tab" + (currentTab === tab.id ? " is-active" : ""),
				onClick: () => onSelect(tab.id),
			}, h("span", { className: "lm-bounce-tab-label" }, tab.label))));
	}

	function LocalDisclosure({ title, open, onOpenChange, count, children, className = "" }) {
		return h("div", { className: ("lm-disclosure " + className).trim() },
			h("button", {
				type: "button",
				className: "lm-disclosure-head",
				"aria-expanded": Boolean(open),
				onClick: () => onOpenChange && onOpenChange(!open),
			},
				h("span", { className: "lm-disclosure-caret", "aria-hidden": "true" }, open ? "▾" : "▸"),
				h("span", { className: "lm-disclosure-title" }, title),
				count === undefined || count === null ? null : h("span", { className: "lm-disclosure-count" }, count)),
			open ? h("div", { className: "lm-disclosure-body" }, children) : null);
	}

	function Field({ label, children, className = "" }) {
		return h("label", { className: "lm-browser-field " + className }, h("span", { className: "lm-browser-field-label" }, label), children);
	}

	function SelectMenu({ value, options, disabled, onChange, ariaLabel, triggerClassName }) {
		const [open, setOpen] = React.useState(false);
		const current = options.find(option => option.value === value);
		return h(Menu, {
			open,
			onClose: () => setOpen(false),
			align: "start",
			portal: true,
			autoFocus: true,
			listClassName: "lm-browser-select-menu",
			anchor: h(Button, {
				variant: "outline",
				size: "sm",
				type: "button",
				className: "lm-browser-select-trigger" + (triggerClassName ? " " + triggerClassName : ""),
				disabled,
				"aria-label": ariaLabel,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen(value => !value),
			},
				h("span", { className: "lm-browser-select-value" }, current ? current.label : (options[0]?.label ?? "")),
				h(IconChevronDownOutlineRegular, { size: 12, "aria-hidden": "true" })),
		}, options.map(option => h(MenuItemButton, {
			key: option.value,
			icon: option.value === value ? h(IconCheckOutlineRegular, { size: 14 }) : undefined,
			onSelect: () => { setOpen(false); onChange(option.value); },
		}, option.label)));
	}

	function CreateDialog({ open, form, setForm, namespaces, busy, error, onClose, onSubmit, t }) {
		if (!open) return null;
		const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
		const ruleTooLong = ruleContentOverLimit(form.kind, form.content);
		const kindOptions = entryKinds.map(value => ({
			value,
			label: h("span", { className: "lm-kind-option" },
				h("span", { className: "lm-browser-kind-dot lm-browser-kind-dot-" + value }),
				kindText(value, t)),
		}));

		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget && !busy) onClose(); } },
			h("section", { className: "lm-browser-modal", role: "dialog", "aria-modal": true },
				h("div", { className: "lm-browser-modal-heading" },
					h("h2", null, t("createTitle")),
					h(Button, { variant: "ghost", size: "sm", "aria-label": t("close"), disabled: busy, onClick: onClose }, h(IconCloseOutlineRegular, { size: 16 }))),
				h("form", { onSubmit: event => { event.preventDefault(); onSubmit(); } },
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h("div", { className: "lm-browser-field" },
						h("span", { className: "lm-browser-field-label" }, t("space")),
						h("div", { className: "lm-create-namespace" }, form.namespace || "-")),
					h(Field, { label: t("kindLabel") }, h(SelectMenu, { value: form.kind, options: kindOptions, disabled: busy, onChange: value => update("kind", value), ariaLabel: t("kindLabel"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h(Input, { value: form.topic, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") },
						h("textarea", { className: "lm-browser-textarea", value: form.content, placeholder: t("contentPlaceholder"), disabled: busy, onChange: event => update("content", event.target.value) }),
						form.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" + (ruleTooLong ? " is-over" : "") },
							h("div", { className: "lm-browser-rule-meter-track" },
								h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(form.content)) + "%" } })),
							h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(form.content)} / 100`),
							ruleTooLong ? h("span", { className: "lm-browser-rule-error", role: "alert" }, t("ruleOverLimit")) : null) : null),
					h(Field, { label: t("evidence") }, h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: form.evidence, placeholder: t(form.kind === "rule" ? "ruleEvidencePlaceholder" : "evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					h("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 } },
						h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")),
						h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace || ruleTooLong }, busy ? t("creating") : t("create"))))));
	}

	function ErrorNotice({ title, message, onRetry, t }) {
		return h("div", { className: "lm-inline-error", role: "alert" },
			h("strong", null, title),
			onRetry ? h(Button, { variant: "outline", size: "sm", onClick: onRetry }, t("retry")) : null,
			message ? h("details", { className: "lm-error-details" },
				h("summary", null, t("details")),
				h("pre", null, message)) : null);
	}

	function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
		if (!open) return null;
		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget) onCancel(); } },
			h("section", { className: "lm-browser-modal lm-confirm-modal", role: "dialog", "aria-modal": true },
				h("div", { className: "lm-browser-modal-heading" },
					h("h2", null, title)),
				h("div", { className: "lm-confirm-body" }, message),
				h("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 } },
					h(Button, { variant: "outline", type: "button", onClick: onCancel }, cancelLabel),
					h(Button, { variant: "primary", type: "button", onClick: onConfirm }, confirmLabel))));
	}

	function IndexUsage({ stats, t, kind, onKindChange }) {
		const [open, setOpen] = React.useState(false);
		const [hovered, setHovered] = React.useState(null);
		const used = Number(stats?.indexChars) || 0;
		const budget = Number(stats?.budgetChars) || 0;
		if (!stats || used <= 0 || budget <= 0) return null;
		const percent = Math.round((used / budget) * 100);
		const over = percent > 100;

		const parts = [
			{ key: "head", label: t("usage.label.head"), chars: Number(stats.headChars) || 0, count: null, kind: null },
			{ key: "rules", label: t("usage.label.rules"), chars: Number(stats.rulesChars) || 0, count: Number(stats.ruleCount) || 0, kind: "rule" },
			{ key: "facts", label: t("usage.label.facts"), chars: Number(stats.factsChars) || 0, count: Number(stats.factCount) || 0, kind: "fact" },
			{ key: "sops", label: t("usage.label.sops"), chars: Number(stats.sopsChars) || 0, count: Number(stats.sopCount) || 0, kind: "sop" },
		];

		const toggleKind = part => {
			if (!part.kind || !onKindChange) return;
			onKindChange(kind === part.kind ? "" : part.kind);
		};

		const segmentClass = part => "lm-usage-segment lm-usage-color-" + part.key
			+ (hovered === part.key ? " is-active" : "")
			+ (hovered && hovered !== part.key ? " is-dim" : "");

		const hoverProps = part => ({
			onMouseEnter: () => setHovered(part.key),
			onMouseLeave: () => setHovered(null),
			onFocus: () => setHovered(part.key),
			onBlur: () => setHovered(null),
		});

		const bar = h("span", { className: "lm-usage-bar" },
			parts.map(part => part.kind
				? h("button", {
					key: part.key,
					type: "button",
					className: segmentClass(part),
					style: { width: (percent * part.chars / used) + "%" },
					"aria-pressed": kind === part.kind,
					"aria-label": `${part.label} · ${part.count || 0} 条 · ${compactChars(part.chars)} · ${Math.round((part.chars / used) * 100)}%`,
					onClick: event => { event.stopPropagation(); toggleKind(part); },
					...hoverProps(part),
				})
				: h("span", {
					key: part.key,
					className: segmentClass(part),
					style: { width: (percent * part.chars / used) + "%" },
					title: t("notEntry"),
					...hoverProps(part),
				})));

		const legend = h("div", { className: "lm-usage-legend" },
			parts.map(part => {
				const share = used > 0 ? Math.round((part.chars / used) * 100) : 0;
				const figures = `${part.count ? part.count + " 条 · " : ""}${compactChars(part.chars)}`;
				const tooltip = `${part.label} · ${figures} · ${share}%`;
				const swatch = h("span", { className: "lm-usage-swatch lm-usage-color-" + part.key });
				const label = h("span", { className: "lm-usage-legend-label" }, part.label);
				const chars = h("span", { className: "lm-usage-legend-chars" }, figures);
				if (!part.kind) {
					return h("span", { key: part.key, className: "lm-usage-legend-wrap" },
						h(Tooltip, { label: tooltip + " · " + t("notEntry") },
							h("span", { className: "lm-usage-legend-item" }, swatch, label, chars)));
				}
				return h("span", { key: part.key, className: "lm-usage-legend-wrap" },
					h(Tooltip, { label: tooltip },
						h("button", {
							type: "button",
							className: "lm-usage-legend-item is-clickable"
								+ (kind === part.kind ? " is-active" : "")
								+ (hovered && hovered !== part.key ? " is-dim" : ""),
							"aria-pressed": kind === part.kind,
							onClick: () => toggleKind(part),
							...hoverProps(part),
						}, swatch, label, chars)));
			}));

		return h("div", { className: "lm-browser-usage-wrap" + (open ? " is-open" : "") },
			h("div", {
				className: "lm-usage-summary",
				role: "button",
				tabIndex: 0,
				"aria-expanded": open,
				onClick: () => setOpen(!open),
				onKeyDown: event => {
					if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(!open); }
				},
			},
				h("div", { className: "lm-usage-ring-wrap" },
					h("svg", { className: "lm-usage-ring", viewBox: "0 0 36 36" },
						h("path", { className: "lm-usage-ring-bg", d: RING_PATH }),
						h("path", { className: "lm-usage-ring-fill" + (over ? " is-over" : percent > 90 ? " is-near" : ""), strokeDasharray: `${Math.min(100, percent)}, 100`, d: RING_PATH }))),
				h("span", { className: "lm-usage-percent" + (over ? " is-over" : "") }, percent + "%"),
				bar,
				h("span", { className: "lm-usage-figures" }, "~" + t("usage.total", { used: compactChars(used), budget: compactChars(budget) })),
				h(IconChevronDownOutlineRegular, { size: 12, className: "lm-usage-chevron" })),
			h("div", { className: "lm-usage-detail" },
				h("div", { className: "lm-usage-detail-inner" },
					legend)));
	}

	function DiffViewer({ oldText, newText }) {
		const oldLines = String(oldText || "").split("\n");
		const newLines = String(newText || "").split("\n");
		const max = Math.max(oldLines.length, newLines.length);
		const rows = [];
		for (let index = 0; index < max; index++) {
			const before = oldLines[index];
			const after = newLines[index];
			if (before === after) {
				rows.push(h("div", { key: index, className: "lm-diff-line" }, h("span", { style: { opacity: .4 } }, " "), before));
			} else {
				if (before !== undefined) rows.push(h("div", { key: index + "-del", className: "lm-diff-line lm-diff-del" }, "- ", before));
				if (after !== undefined) rows.push(h("div", { key: index + "-add", className: "lm-diff-line lm-diff-add" }, "+ ", after));
			}
		}
		return h("div", { className: "lm-diff-view" }, rows);
	}

	function splitPromptNames(text) {
		return String(text || "")
			.split("|")
			.map(name => name.trim())
			.filter(name => name && name !== "（空）" && name !== "（暂无事实）" && name !== "（暂无经验）");
	}

	// 把注入提示词拆成可读分组：头部说明、规则正文、事实/经验目录 token、省略说明。
	function parsePromptGroups(sections, ruleCount) {
		const groups = [];
		for (const section of sections || []) {
			const text = String(section.text || "");
			const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
			const hasRuleMarker = text.includes("[RULES]");
			const group = { namespace: section.namespace, intro: null, head: [], preamble: [], rules: [], facts: [], sops: [], notices: [], overLimit: Boolean(section.overLimit) };
			const ruleLines = [];
			let collectingRules = false;
			for (const line of lines) {
				if (line.startsWith("记忆空间 [") || /^记忆 \[[^\]]+\]：/.test(line)) {
					group.intro = line;
					collectingRules = !hasRuleMarker;
					continue;
				}
				if (line.startsWith("[L2]")) {
					splitPromptNames(line.slice(4)).forEach(name => group.facts.push(name));
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[L3]")) {
					splitPromptNames(line.slice(4)).forEach(name => group.sops.push(name.replace(/^sops\//, "").replace(/\.md$/, "")));
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[RULES]")) {
					collectingRules = true;
					continue;
				}
				if (line.startsWith("[fact] ")) {
					group.facts.push(line.slice(7).trim());
					collectingRules = false;
					continue;
				}
				if (line.startsWith("[sop] ")) {
					group.sops.push(line.slice(6).trim());
					collectingRules = false;
					continue;
				}
				if (/^（[^）]*(已省略|过长)[^）]*）$/.test(line)) {
					group.notices.push(line);
					continue;
				}
				if (collectingRules) {
					ruleLines.push(line);
					continue;
				}
				group.head.push(line);
			}
			let bodies = ruleLines;
			if (ruleCount > 0 && ruleLines.length >= ruleCount) bodies = ruleLines.slice(ruleLines.length - ruleCount);
			else bodies = ruleLines.filter(line => line.length <= 100);
			group.rules = bodies;
			group.preamble = ruleLines.slice(0, Math.max(0, ruleLines.length - bodies.length));
			groups.push(group);
		}
		return groups;
	}

	function InjectionView({ controls, namespace, kind, onKindChange, onOpenEntry, t }) {
		const [data, setData] = React.useState(null);
		const [loading, setLoading] = React.useState(true);
		const [error, setError] = React.useState(null);
		const [tab, setTab] = React.useState("grouped");
		const [focusedId, setFocusedId] = React.useState(null);
		const [copyState, setCopyState] = React.useState(null);
		const [recallInput, setRecallInput] = React.useState("");
		const [recallQuery, setRecallQuery] = React.useState("");
		const [showSource, setShowSource] = React.useState(false);
		const [mobilePane, setMobilePane] = React.useState("list");
		const requestRef = React.useRef(0);
		const itemRefs = React.useRef(new Map());
		const chipRefs = React.useRef(new Map());

		const load = React.useCallback(() => {
			if (!namespace) return;
			const token = ++requestRef.current;
			setLoading(true);
			setError(null);
			controls.getInjectionState({ namespace, query: recallQuery || undefined })
				.then(result => {
					if (token !== requestRef.current) return;
					setData(result);
					setLoading(false);
				})
				.catch(failure => {
					if (token !== requestRef.current) return;
					setData(null);
					setError(String(failure?.message || failure));
					setLoading(false);
				});
		}, [controls, namespace]);

		React.useEffect(() => { load(); }, [load]);

		React.useEffect(() => {
			if (!focusedId) return;
			const chip = chipRefs.current.get(focusedId);
			if (chip?.scrollIntoView) chip.scrollIntoView({ block: "nearest" });
			const row = itemRefs.current.get(focusedId);
			if (row?.scrollIntoView) row.scrollIntoView({ block: "nearest" });
		}, [focusedId, tab]);

		if (loading) return h("div", { className: "lm-injection-view" }, h("p", { className: "lm-injection-state" }, t("loading")));
		if (error || !data) {
			return h("div", { className: "lm-injection-view" },
				h(ErrorNotice, { title: t("loadFailed"), message: error, onRetry: load, t }));
		}

		const items = data.items || [];
		const ruleItems = items.filter(item => item.kind === "rule");
		const itemId = item => item.kind + ":" + item.key;
		const findItem = (entryKind, name) => items.find(item => item.kind === entryKind && item.promptToken === name)
			|| items.find(item => item.kind === entryKind && (item.key === name || item.title === name));
		const groups = parsePromptGroups(data.sections, ruleItems.length);
		const visibleItems = kind ? items.filter(item => item.kind === kind) : items;
		const focusedItem = items.find(item => itemId(item) === focusedId) || null;

		const rawLines = String(data.combinedText || "").split("\n");
		const sectionOffsets = new Map();
		let offset = 0;
		for (const section of data.sections || []) {
			sectionOffsets.set(section.namespace, offset);
			offset += String(section.text || "").split("\n").length + 2;
		}
		const itemByLine = new Map();
		const lineByItem = new Map();
		for (const item of items) {
			if (item.promptNamespace == null || item.promptLine == null) continue;
			const base = sectionOffsets.get(item.promptNamespace);
			if (base === undefined) continue;
			const line = base + item.promptLine;
			itemByLine.set(line, item);
			lineByItem.set(itemId(item), line);
		}
		const rawHit = new Set(focusedItem && lineByItem.has(focusedId) ? [lineByItem.get(focusedId)] : []);

		const copyRaw = async () => {
			const text = String(data.combinedText || "");
			try {
				if (!navigator?.clipboard?.writeText) throw new Error("clipboard unavailable");
				await navigator.clipboard.writeText(text);
				setCopyState("copied");
			} catch {
				setCopyState("failed");
			}
		};

		const filterChips = [["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => {
			const count = value ? items.filter(item => item.kind === value).length : items.length;
			return h("button", {
				key: value || "all",
				type: "button",
				className: "lm-injection-filter" + (kind === value ? " is-active" : ""),
				"aria-pressed": kind === value,
				onClick: () => onKindChange && onKindChange(value),
			}, label, h("span", { className: "lm-injection-filter-count" }, count));
		});

		const listPane = h("div", { className: "lm-injection-table-pane" },
			h("div", { className: "lm-injection-pane-head" },
				h("h3", null, "注入取舍名单"),
				h("span", { className: "lm-injection-pane-meta" }, `${visibleItems.length} / ${items.length}`)),
			visibleItems.length
				? h("div", { className: "lm-injection-items" },
					visibleItems.map(item => {
						const id = itemId(item);
						return h("div", {
							key: id,
							className: "lm-injection-item" + (focusedId === id ? " is-active" : ""),
							ref: element => { if (element) itemRefs.current.set(id, element); else itemRefs.current.delete(id); },
							onClick: () => { setFocusedId(id); setMobilePane("preview"); },
							tabIndex: 0,
							onKeyDown: event => { if (event.key === "Enter") { setFocusedId(id); setMobilePane("preview"); } },
						},
							h("span", { className: "lm-injection-item-title", title: item.title }, item.title),
							h("span", { className: "lm-injection-item-kind lm-browser-kind lm-browser-kind-" + item.kind }, kindText(item.kind, t)));
					}))
				: h("p", { className: "lm-injection-empty" }, t("injectionEmpty")));

		const chip = (entryKind, name, index) => {
			const item = findItem(entryKind, name);
			const id = item ? itemId(item) : entryKind + ":" + name;
			return h("button", {
				key: id + ":" + index,
				type: "button",
				className: "lm-prompt-chip lm-prompt-chip-" + entryKind + (focusedId === id ? " is-active" : ""),
				title: item ? item.title : name,
				ref: element => { if (element) chipRefs.current.set(id, element); else chipRefs.current.delete(id); },
				onClick: () => setFocusedId(id),
			}, name);
		};

		const groupedPane = h("div", { className: "lm-prompt-groups" },
			groups.length
				? groups.map((group, groupIndex) => h("section", { key: group.namespace + ":" + groupIndex, className: "lm-prompt-group" },
					h("h4", { className: "lm-prompt-group-title" }, group.namespace || namespace),
					group.intro ? h("p", { className: "lm-prompt-intro" }, group.intro) : null,
					group.head.length ? h("div", { className: "lm-prompt-head" }, renderMarkdown(group.head.join("\n"))) : null,
					group.preamble.length ? h("div", { className: "lm-prompt-preamble" }, group.preamble.map((line, index) => h("p", { key: "p" + index }, line))) : null,
					group.rules.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupRules")} (${group.rules.length})`),
						h("div", { className: "lm-prompt-rules" }, group.rules.map((body, index) => {
							const item = ruleItems[index];
							const id = item ? itemId(item) : "rule:" + index;
							return h("article", {
								key: id + ":" + index,
								className: "lm-prompt-rule" + (focusedId === id ? " is-active" : ""),
								ref: element => { if (element) chipRefs.current.set(id, element); else chipRefs.current.delete(id); },
								onClick: () => setFocusedId(id),
							}, renderMarkdown(body));
						}))) : null,
					group.facts.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupFacts")} (${group.facts.length})`),
						h("div", { className: "lm-prompt-chips" }, group.facts.map((name, index) => chip("fact", name, index)))) : null,
					group.sops.length ? h("div", { className: "lm-prompt-block" },
						h("h5", null, `${t("groupSops")} (${group.sops.length})`),
						h("div", { className: "lm-prompt-chips" }, group.sops.map((name, index) => chip("sop", name, index)))) : null,
					group.notices.length ? h("div", { className: "lm-prompt-notices" }, group.notices.map((line, index) => h("p", { key: "n" + index }, line))) : null))
				: h("p", { className: "lm-injection-empty" }, t("noPreview")));

		const rawPane = h("div", { className: "lm-prompt-raw" },
			rawLines.map((line, index) => {
				const item = itemByLine.get(index);
				return h("div", {
					key: index,
					className: "lm-prompt-raw-line" + (rawHit.has(index) ? " is-hit" : "") + (item ? " is-linked" : ""),
					onClick: item ? () => setFocusedId(itemId(item)) : undefined,
					title: item ? item.title : undefined,
				}, line === "" ? " " : line);
			}));

		const focusedHeader = focusedItem
			? h("div", { className: "lm-injection-focused" },
				h("span", { className: "lm-injection-focused-title", title: focusedItem.title }, focusedItem.title),
				h("button", {
					type: "button",
					className: "lm-capsule-tag",
					onClick: () => onOpenEntry && onOpenEntry({ namespace, kind: focusedItem.kind, key: focusedItem.key }),
				}, t("openEntry")))
			: null;

		const textPane = h("div", { className: "lm-injection-text-pane" },
			h("div", { className: "lm-injection-pane-head" },
				focusedHeader,
				h("div", { className: "lm-injection-tabs", role: "tablist" },
					h("button", { type: "button", role: "tab", "aria-selected": tab === "grouped", className: "lm-injection-tab" + (tab === "grouped" ? " is-active" : ""), onClick: () => setTab("grouped") }, t("groupedPrompt")),
					h("button", { type: "button", role: "tab", "aria-selected": tab === "raw", className: "lm-injection-tab" + (tab === "raw" ? " is-active" : ""), onClick: () => setTab("raw") }, t("rawPrompt"))),
				h(Button, { variant: "outline", size: "sm", className: "lm-copy-btn", onClick: copyRaw }, copyState === "copied" ? t("copied") : t("copyPrompt"))),
			copyState === "failed" ? h("p", { className: "lm-inline-error", role: "alert" }, t("copyFailed")) : null,
			tab === "grouped" ? groupedPane : rawPane);

		const advancedPanel = h("div", { className: "lm-injection-advanced-body" },
			h("div", { className: "lm-injection-recall" },
				h(Input, { type: "search", value: recallInput, placeholder: t("recallPlaceholder"), onChange: event => setRecallInput(event.target.value), onKeyDown: event => { if (event.key === "Enter") setRecallQuery(recallInput); } }),
				h(Button, { variant: "outline", size: "sm", className: "lm-recall-btn", onClick: () => setRecallQuery(recallInput) }, t("recallQuery")),
				recallQuery ? h(Button, { variant: "ghost", size: "sm", onClick: () => { setRecallInput(""); setRecallQuery(""); } }, t("clearFilter")) : null),
			h("dl", { className: "lm-injection-source" },
				h("div", null, h("dt", null, t("space")), h("dd", null, namespace || "-")),
				h("div", null, h("dt", null, t("sourceBudget")), h("dd", null, `${compactChars(data.indexChars)} / ${compactChars(data.budgetChars)}`)),
				h("div", null, h("dt", null, t("sourceTarget")), h("dd", null, compactChars(data.targetChars))),
				h("div", null, h("dt", null, t("sourceColdRatio")), h("dd", null, `${Math.round((Number(data.basis?.coldRatio) || 0) * 100)}%`)),
				h("div", null, h("dt", null, t("coldCandidateTitle")), h("dd", null, String(data.coldCount || 0))),
				h("div", null, h("dt", null, t("sourceRecall")), h("dd", null, data.basis?.recallQuery || "-"))));

		const paneSwitch = SegmentedControl
			? h("div", { className: "lm-injection-mobile-switch" },
				h(SegmentedControl, {
					value: mobilePane,
					onChange: setMobilePane,
					label: t("injectionPaneLabel"),
					options: [
						{ value: "list", label: t("injectionListPane") },
						{ value: "preview", label: t("injectionPreviewPane") },
					],
				}))
			: null;

		return h("div", { className: "lm-injection-view" },
			h("div", { className: "lm-injection-toolbar" },
				h("div", { className: "lm-injection-toolbar-row" },
					h("span", { className: "lm-injection-namespace" }, `${t("space")}: ${namespace || "-"}`),
					h("span", { className: "lm-injection-scope" }, t("previewScope")),
					paneSwitch),
				h("div", { className: "lm-injection-toolbar-row" },
					h("div", { className: "lm-injection-filters" }, filterChips),
					ToolbarPopover
					? h(ToolbarPopover, {
						title: t("advancedTitle"),
						open: showSource,
						onOpenChange: setShowSource,
						children: advancedPanel,
						ariaLabel: t("advancedTitle"),
						align: "end",
						side: "bottom",
						className: "lm-injection-advanced",
						panelClassName: "lm-injection-advanced-panel",
					})
					: h(Disclosure, { title: t("advancedTitle"), open: showSource, onOpenChange: setShowSource, className: "lm-injection-advanced" }, advancedPanel))),
			h("div", { className: "lm-injection-split" + (SegmentedControl ? " lm-injection-split-" + mobilePane : "") }, listPane, textPane));
	}

	// 维护驾驶舱：真实数据绑定
	function MemoryBrowserPage({ controls, t }) {
		const [currentTab, setCurrentTab] = React.useState("entries");
		const [namespaces, setNamespaces] = React.useState([]);
		const [namespace, setNamespace] = React.useState(null);
		const [namespaceBusy, setNamespaceBusy] = React.useState(true);
		const [query, setQuery] = React.useState("");
		const [kind, setKind] = React.useState("");
		const [includeArchived, setIncludeArchived] = React.useState(false);
		const [entries, setEntries] = React.useState([]);
		const [facets, setFacets] = React.useState(null);
		const [matched, setMatched] = React.useState(0);
		const [truncated, setTruncated] = React.useState(false);
		const pageSize = 200;
		const [usage, setUsage] = React.useState(null);
		const [listBusy, setListBusy] = React.useState(false);
		const [selectedEntry, setSelectedEntry] = React.useState(null);
		const [detail, setDetail] = React.useState(null);
		const [detailBusy, setDetailBusy] = React.useState(false);
		const [content, setContent] = React.useState("");
		const [evidence, setEvidence] = React.useState("");
		const [history, setHistory] = React.useState([]);
		const [historyBusy, setHistoryBusy] = React.useState(false);
		const [sortField, setSortField] = React.useState("updatedAt");
		const [sortAsc, setSortAsc] = React.useState(false);
		const [expandedRows, setExpandedRows] = React.useState(new Set());
		const [mobileTab, setMobileTab] = React.useState("list");
		const [createOpen, setCreateOpen] = React.useState(false);
		const [createForm, setCreateForm] = React.useState({ namespace: "", kind: "fact", topic: "", content: "", evidence: "" });
		const [createError, setCreateError] = React.useState(null);
		const [previewSnapshotId, setPreviewSnapshotId] = React.useState(null);
		const [detailMode, setDetailMode] = React.useState("read");
		const [openSource, setOpenSource] = React.useState(false);
		const [openRelated, setOpenRelated] = React.useState(false);
		const [openHistory, setOpenHistory] = React.useState(false);
		const [moreOpen, setMoreOpen] = React.useState(false);
		const [filtersOpen, setFiltersOpen] = React.useState(false);
		const [spaceOpen, setSpaceOpen] = React.useState(false);
		const [showReference, setShowReference] = React.useState(false);
		const [busy, setBusy] = React.useState(null);
		const [notice, setNotice] = React.useState(null);
		const [listError, setListError] = React.useState(null);
		const [usageError, setUsageError] = React.useState(null);
		const [detailError, setDetailError] = React.useState(null);
		const [confirmState, setConfirmState] = React.useState(null);
		const listRequestRef = React.useRef(0);
		const statsRequestRef = React.useRef(0);
		const detailRequestRef = React.useRef(0);

		const detailScrollRef = React.useRef(null);
		const listPaneRef = React.useRef(null);
		const draftRef = React.useRef(false);
		const [paneWidth, setPaneWidth] = React.useState(0);
		React.useEffect(() => {
			const element = listPaneRef.current;
			if (!element) return undefined;
			const measure = () => {
				const style = window.getComputedStyle(element);
				const inner = element.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
				if (inner > 0) setPaneWidth(Math.round(inner));
			};
			measure();
			if (typeof ResizeObserver === "undefined") return undefined;
			const observer = new ResizeObserver(measure);
			observer.observe(element);
			return () => observer.disconnect();
		}, []);
		const selectedKey = selectedEntry ? identity(selectedEntry) : "";

		React.useEffect(() => {
			controls.listNamespaces()
				.then(rows => {
					setNamespaces(rows);
					setNamespaceBusy(false);
					setNamespace(current => current || rows[0]?.namespace || "default");
				})
				.catch(() => setNamespaceBusy(false));
		}, [controls]);

		const loadEntries = React.useCallback((offset = 0, append = false) => {
			if (!namespace) return;
			const token = ++listRequestRef.current;
			setListBusy(true);
			setListError(null);
			controls.listEntriesPage({ namespace, kind: kind || undefined, query: query || undefined, includeArchived, offset, limit: pageSize })
				.then(page => {
					if (token !== listRequestRef.current) return;
					const rows = page?.entries || [];
					setEntries(current => append ? [...current, ...rows] : rows);
					setFacets(page?.facets || null);
					setMatched(Number(page?.matched) || 0);
					setTruncated(Boolean(page?.truncated));
					setListBusy(false);
					setSelectedEntry(current => {
						if (!current) return rows[0] ? rows[0].entry : null;
						if (rows.some(row => identity(row.entry) === identity(current))) return current;
						if (draftRef.current) return current;
						return rows[0] ? rows[0].entry : null;
					});
				})
				.catch(failure => {
					if (token !== listRequestRef.current) return;
					if (!append) setEntries([]);
					setListBusy(false);
					setListError(String(failure?.message || failure));
				});
		}, [controls, namespace, kind, query, includeArchived, pageSize]);

		const loadStats = React.useCallback(() => {
			if (!namespace) return;
			const token = ++statsRequestRef.current;
			controls.namespaceStats({ namespace })
				.then(stats => {
					if (token !== statsRequestRef.current) return;
					setUsage(stats);
					setUsageError(null);
				})
				.catch(failure => {
					if (token !== statsRequestRef.current) return;
					setUsage(null);
					setUsageError(String(failure?.message || failure));
				});
		}, [controls, namespace]);

		React.useEffect(() => { loadEntries(); }, [loadEntries]);
		React.useEffect(() => { loadStats(); }, [loadStats]);

		React.useEffect(() => {
			setDetailMode("read");
			setOpenSource(false);
			setOpenRelated(false);
			setOpenHistory(false);
			setMoreOpen(false);
		}, [selectedKey]);

		React.useEffect(() => {
			if (!selectedEntry) {
				setDetail(null);
				setHistory([]);
				return;
			}
			const token = ++detailRequestRef.current;
			setDetailBusy(true);
			setDetailError(null);
			controls.readEntry({ entry: selectedEntry })
				.then(value => {
					if (token !== detailRequestRef.current) return;
					setDetail(value);
					setContent(value.content);
					setEvidence(value.evidence);
					setDetailBusy(false);
				})
				.catch(failure => {
					if (token !== detailRequestRef.current) return;
					setDetailBusy(false);
					setDetail(null);
					setDetailError(String(failure?.message || failure));
				});
			setHistoryBusy(true);
			controls.entryHistory({ entry: selectedEntry })
				.then(rows => {
					if (token !== detailRequestRef.current) return;
					setHistory(rows);
					setHistoryBusy(false);
				})
				.catch(failure => {
					if (token !== detailRequestRef.current) return;
					setHistory([]);
					setHistoryBusy(false);
					setDetailError(String(failure?.message || failure));
				});
		}, [controls, selectedKey]);

		const toggleRowExpand = (id, event) => {
			event.stopPropagation();
			const next = new Set(expandedRows);
			if (next.has(id)) next.delete(id); else next.add(id);
			setExpandedRows(next);
		};

		const handleSort = field => {
			if (sortField === field) setSortAsc(!sortAsc);
			else { setSortField(field); setSortAsc(false); }
		};

		const sortedEntries = [...entries].sort((a, b) => {
			let valueA = a[sortField];
			let valueB = b[sortField];
			if (sortField === "heat") { valueA = a.heat || 0; valueB = b.heat || 0; }
			if (sortField === "updatedAt") { valueA = new Date(valueA || 0).getTime(); valueB = new Date(valueB || 0).getTime(); }
			if (valueA < valueB) return sortAsc ? -1 : 1;
			if (valueA > valueB) return sortAsc ? 1 : -1;
			return 0;
		});

		const refreshEntries = () => loadEntries(0, false);

		const ruleOverLimitNow = detail ? ruleContentOverLimit(detail.entry.kind, content) : false;
		const detailDirty = Boolean(detail) && (content !== detail.content || evidence !== detail.evidence);
		const hasDraft = detailDirty;
		React.useEffect(() => { draftRef.current = detailDirty; }, [detailDirty]);

		const reference = detail ? `${detail.entry.namespace}/${detail.entry.kind}/${detail.entry.key}` : "";

		const discardDraft = () => {
			if (detail) {
				setContent(detail.content);
				setEvidence(detail.evidence);
			}
			setDetailMode("read");
			draftRef.current = false;
		};

		const requestArchive = () => {
			if (!detail) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); toggleArchived(); },
				});
				return;
			}
			toggleArchived();
		};

		const selectTab = next => {
			if (next === currentTab || !["entries", "injection", "graph"].includes(next)) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setCurrentTab(next); },
				});
				return;
			}
			setCurrentTab(next);
		};

		const switchNamespace = next => {
			if (!next || next === namespace) return;
			const apply = () => {
				discardDraft();
				setNamespace(next);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
		};

		const enterEdit = () => {
			if (!detail) return;
			setDetailMode("edit");
		};

		const cancelEdit = () => {
			if (!detail) return;
			const restore = () => {
				discardDraft();
				setNotice(null);
			};
			if (detailDirty) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: restore,
				});
				return;
			}
			restore();
		};

		const copyReference = async () => {
			if (!detail) return;
			try {
				await navigator?.clipboard?.writeText(reference);
				setNotice(t("referenceCopied"));
			} catch {
				setShowReference(true);
				setOpenSource(true);
				setNotice(t("copyReferenceFailed"));
			}
		};

		const saveEntry = async () => {
			if (!detail) return;
			if (ruleOverLimitNow) {
				setDetailError(t("ruleOverLimit"));
				return;
			}
			setBusy("save");
			setDetailError(null);
			try {
				await controls.updateEntry({ entry: detail.entry, content, evidence, ifRevision: detail.revision });
				setNotice(t("saved"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				setContent(updated.content);
				setEvidence(updated.evidence);
				setDetailMode("read");
			} catch (error) {
				const message = String(error?.message || error);
				setDetailError(message.includes("revision_conflict") ? t("conflict") : message);
			} finally {
				setBusy(null);
			}
		};

		const reloadDetail = async () => {
			if (!selectedEntry) return;
			try {
				const value = await controls.readEntry({ entry: selectedEntry });
				setDetail(value);
				setContent(value.content);
				setEvidence(value.evidence);
				setDetailError(null);
			} catch (error) {
				setDetailError(String(error?.message || error));
			}
		};

		const toggleArchived = async () => {
			if (!detail) return;
			setBusy("archive");
			try {
				await controls.setArchived({ entry: detail.entry, archived: !detail.archived });
				setNotice(t("archivedDone"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				await refreshEntries();
			} catch (error) {
				setDetailError(String(error?.message || error));
			} finally {
				setBusy(null);
			}
		};

		const rollback = async snapshotId => {
			if (!detail) return;
			setBusy("rollback");
			try {
				await controls.rollbackEntry({ entry: detail.entry, snapshotId });
				setNotice(t("rolledBack"));
				const updated = await controls.readEntry({ entry: detail.entry });
				setDetail(updated);
				setContent(updated.content);
			} catch (error) {
				setDetailError(String(error?.message || error));
			} finally {
				setBusy(null);
			}
		};

		const requestRollback = snapshotId => {
			setConfirmState({
				title: t("confirmTitle"),
				message: t("rollbackWarning"),
				confirmLabel: t("rollbackConfirm"),
				onConfirm: () => rollback(snapshotId),
			});
		};

		const selectEntry = entry => {
			if (!entry) return;
			const apply = () => {
				discardDraft();
				setSelectedEntry(entry);
				setMobileTab("detail");
				setDetailError(null);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
		};

		// 类型筛选是跨视图共享状态；切换会重排列表并可能丢掉当前条目的草稿，所以先过草稿守卫。
		const changeKind = next => {
			if (next === kind) return;
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setKind(next); },
				});
				return;
			}
			setKind(next);
		};

		const clearFilters = () => {
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: () => { discardDraft(); setKind(""); setQuery(""); setIncludeArchived(false); },
				});
				return;
			}
			setKind("");
			setQuery("");
			setIncludeArchived(false);
		};

		const jumpToEntry = target => {
			if (!target) return;
			const entry = { namespace: target.namespace || namespace, kind: target.kind, key: target.key };
			const apply = () => {
				discardDraft();
				setNamespace(entry.namespace);
				setQuery("");
				setKind("");
				setCurrentTab("entries");
				setMobileTab("detail");
				setSelectedEntry(entry);
			};
			if (hasDraft) {
				setConfirmState({
					title: t("confirmTitle"),
					message: t("draftSwitchWarning"),
					confirmLabel: t("confirm"),
					onConfirm: apply,
				});
				return;
			}
			apply();
		};

		const handleCreate = async () => {
			setCreateError(null);
			if (!createForm.namespace || !createForm.topic.trim() || !createForm.content.trim() || !createForm.evidence.trim()) {
				setCreateError(t("requiredFields"));
				return;
			}
			setBusy("create");
			try {
				const created = await controls.createEntry(createForm);
				setCreateOpen(false);
				setCreateForm(current => ({ ...current, topic: "", content: "", evidence: "" }));
				setSelectedEntry(created.entry);
				setNotice(t("created"));
			} catch (error) {
				console.error(error);
				setCreateError(String(error?.message || error));
			} finally {
				setBusy(null);
			}
		};

		const renderRow = row => {
			const rowId = identity(row.entry);
			const isExpanded = expandedRows.has(rowId);
			const isSelected = selectedKey === rowId;
			return h("li", { key: rowId, className: "lm-browser-row-wrap" + (isSelected ? " is-selected" : "") + (row.archived ? " is-archived" : "") },
				h("div", { className: "lm-table-row-main", onClick: () => selectEntry(row.entry) },
					h("button", { type: "button", className: "lm-row-expand-btn" + (isExpanded ? " is-open" : ""), onClick: event => toggleRowExpand(rowId, event) }, "›"),
					h("div", { className: "lm-col-title lm-row-title-cell" },
						h("span", { className: "lm-row-title-text" }, highlightText(row.title, query))),
					h("span", { className: "lm-col-kind" }, h("span", { className: "lm-browser-kind lm-browser-kind-" + row.entry.kind }, kindText(row.entry.kind, t))),
					h("span", { className: "lm-col-time lm-time-cell" }, time(row.updatedAt))),
				isExpanded ? h("div", { className: "lm-row-expanded-pane" },
					h("div", { className: "lm-row-summary-box" }, highlightText(row.summary || "暂无摘要", query)),
					row.related && row.related.length ? h("div", { className: "lm-row-capsules" },
						h("span", { style: { fontSize: 11, opacity: .6 } }, "关联条目:"),
						row.related.map((rel, index) => h("button", {
							key: index,
							type: "button",
							className: "lm-capsule-tag",
							onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
						}, `🔗 ${rel.key}`))) : null,
					h("div", { className: "lm-row-evidence-preview" }, "证据: " + (row.evidence || "无最新依据"))) : null);
		};

		const renderExpandedRow = row => h("div", { className: "lm-row-expanded-pane" },
			h("div", { className: "lm-row-summary-box" }, highlightText(row.summary || "暂无摘要", query)),
			row.related && row.related.length ? h("div", { className: "lm-row-capsules" },
				h("span", { style: { fontSize: 11, opacity: .6 } }, "关联条目:"),
				row.related.map((rel, index) => h("button", {
					key: index,
					type: "button",
					className: "lm-capsule-tag",
					onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
				}, `🔗 ${rel.key}`))) : null,
			h("div", { className: "lm-row-evidence-preview" }, "证据: " + (row.evidence || "无最新依据")));

		const rowData = row => (row && row.original) || row;

		// 表格列宽按左侧列表面板的实际宽度分配（不是窗口宽），窄面板也保证类型/热度/流态可见。
		const TABLE_COLUMN_WIDTH = { expand: 28, kind: 56, updatedAt: 80 };
		const tableFixedWidth = TABLE_COLUMN_WIDTH.expand + TABLE_COLUMN_WIDTH.kind + TABLE_COLUMN_WIDTH.heat
			+ TABLE_COLUMN_WIDTH.status + TABLE_COLUMN_WIDTH.chars + TABLE_COLUMN_WIDTH.updatedAt;
		const tableTitleWidth = Math.max(140, (paneWidth || 520) - tableFixedWidth);
		const tableMinWidth = tableTitleWidth + tableFixedWidth;

		// 列定义适配 DataTable（EasyUI MIT land 改编，组件由 build 注入时启用）。
		const tableContentProps = {
			emptyTitle: t("emptyEntries"),
			emptyDescription: null,
			emptyActionLabel: t("clearFilter"),
			onClearFilters: clearFilters,
			errorTitle: t("loadFailed"),
			errorDetailLabel: t("details"),
		};

		const tableColumns = [
			{
				id: "title",
				header: "标题 / 摘要",
				accessorKey: "title",
				sortable: true,
				width: tableTitleWidth + "px",
				cell: ({ row }) => {
					const item = rowData(row);
					const active = selectedKey === identity(item.entry);
					return h("button", {
						type: "button",
						className: "lm-table-title-btn" + (active ? " is-selected" : ""),
						onClick: () => selectEntry(item.entry),
					},
						h("span", { className: "lm-row-title-text" }, highlightText(item.title, query)));
				},
			},
			{
				id: "kind",
				header: "类型",
				accessorFn: row => row.entry.kind,
				width: TABLE_COLUMN_WIDTH.kind + "px",
				cell: ({ row }) => {
					const item = rowData(row);
					return h("span", { className: "lm-browser-kind lm-browser-kind-" + item.entry.kind }, kindText(item.entry.kind, t));
				},
			},
			{
				id: "updatedAt",
				header: "更新",
				accessorFn: row => row.updatedAt || "",
				sortable: true,
				width: TABLE_COLUMN_WIDTH.updatedAt + "px",
				cell: ({ row }) => time(rowData(row).updatedAt),
			},
		];

		const detailPane = detail
			? h(React.Fragment, null,
				h(Button, { variant: "outline", size: "sm", className: "lm-detail-back-btn", onClick: () => setMobileTab("list") }, t("backToList")),
				detailError ? h(ErrorNotice, { title: t("detailFailed"), message: detailError, onRetry: reloadDetail, t }) : null,
				h("div", { className: "lm-detail-head" },
					h("h2", { className: "lm-detail-title" }, detail.title),
					h("span", { className: "lm-browser-kind lm-browser-kind-" + detail.entry.kind }, kindText(detail.entry.kind, t)),
					detail.archived ? h("span", { className: "lm-browser-kind" }, t("archived")) : null,
					detailMode === "read"
						? h(Button, { variant: "outline", size: "sm", className: "lm-detail-edit-btn", onClick: enterEdit }, t("editMode"))
						: null,
					h(Menu, {
						open: moreOpen,
						onClose: () => setMoreOpen(false),
						align: "end",
						portal: true,
						autoFocus: true,
						anchor: h(Button, {
							variant: "ghost",
							size: "sm",
							className: "lm-detail-more-btn",
							"aria-label": t("moreActions"),
							"aria-haspopup": "menu",
							"aria-expanded": moreOpen,
							disabled: Boolean(busy),
							onClick: () => setMoreOpen(value => !value),
						}, "⋯"),
					},
						h(MenuItemButton, { disabled: Boolean(busy), onSelect: () => { setMoreOpen(false); requestArchive(); } }, detail.archived ? t("restore") : t("archive")),
						h(MenuItemButton, { disabled: Boolean(busy), onSelect: () => { setMoreOpen(false); copyReference(); } }, t("copyReference")))),
				notice ? h("p", { className: "lm-detail-notice" }, notice) : null,
				detailMode === "read"
					? h("div", { className: "lm-browser-md-preview lm-detail-body" }, renderMarkdown(content))
					: h("div", { className: "lm-detail-edit" },
						h(Field, { label: t("content") },
							h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, onChange: event => setContent(event.target.value) })),
						h(Field, { label: t("evidence") },
							h("textarea", { className: "lm-browser-textarea lm-browser-evidence-textarea", value: evidence, onChange: event => setEvidence(event.target.value) })),
						detail.entry.kind === "rule" ? h("div", { className: "lm-browser-rule-meter" + (ruleOverLimitNow ? " is-over" : ruleContentLength(content) > 90 ? " is-near" : "") },
							h("div", { className: "lm-browser-rule-meter-track" },
								h("div", { className: "lm-browser-rule-meter-fill", style: { width: Math.min(100, ruleContentLength(content)) + "%" } })),
							h("span", { className: "lm-browser-rule-length" }, `${ruleContentLength(content)} / 100 字符`)) : null,
						h("div", { className: "lm-detail-actions" },
							h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: cancelEdit }, t("cancel")),
							h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy) || ruleOverLimitNow || !detailDirty, onClick: saveEntry }, busy === "save" ? t("saving") : t("save")))),
				h(Disclosure, { title: t("sourceTitle"), open: openSource, onOpenChange: setOpenSource, className: "lm-detail-disclosure" },
					h("div", { className: "lm-detail-meta-list" },
						h("pre", { className: "lm-detail-evidence" }, evidence || t("noEvidence")),
						showReference ? h("div", null,
							h("span", { className: "lm-detail-meta-label" }, t("entryKey")),
							h("code", { className: "lm-detail-reference" }, reference)) : null)),
				detail.related && detail.related.length
					? h(Disclosure, { title: t("relatedTitle"), count: detail.related.length, open: openRelated, onOpenChange: setOpenRelated, className: "lm-detail-disclosure" },
						h("div", { className: "lm-row-capsules" },
							detail.related.map((rel, index) => h("button", {
								key: index,
								type: "button",
								className: "lm-capsule-tag",
								onClick: () => jumpToEntry({ namespace: rel.namespace || namespace, kind: rel.kind, key: rel.key }),
							}, `🔗 ${rel.key}`))))
					: null,
				h(Disclosure, { title: t("historyTitle"), count: history.length, open: openHistory, onOpenChange: setOpenHistory, className: "lm-detail-disclosure" },
					historyBusy ? h("p", { className: "lm-detail-hint" }, t("loading")) : null,
					history.length
						? h("ol", { className: "lm-history-timeline" },
							history.map(snap => h("li", { key: snap.snapshotId, className: "lm-history-node" },
								h("span", { className: "lm-history-dot" }),
								h("div", { className: "lm-history-card" },
									h("div", { className: "lm-history-head" },
										h("div", { className: "lm-history-meta" },
											h("span", null, time(snap.createdAt)),
											h("span", { className: "lm-history-delta " + ((snap.change?.contentDelta || 0) >= 0 ? "lm-delta-pos" : "lm-delta-neg") }, `${(snap.change?.contentDelta || 0) >= 0 ? "+" : ""}${snap.change?.contentDelta || 0}`)),
										h("div", { style: { display: "flex", gap: 6 } },
											h(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewSnapshotId(previewSnapshotId === snap.snapshotId ? null : snap.snapshotId) }, t("preview")),
											h(Button, { variant: "ghost", size: "sm", onClick: () => requestRollback(snap.snapshotId) }, t("rollback")))),
									snap.summary ? h("div", { className: "lm-history-summary" }, snap.summary) : null,
									h("details", { className: "lm-history-detail" },
										h("summary", null, t("details")),
										h("code", null, String(snap.revision || "").slice(0, 12))),
									previewSnapshotId === snap.snapshotId ? h(DiffViewer, { oldText: snap.preview || snap.content, newText: content }) : null))))
						: h("p", { className: "lm-detail-hint" }, t("noHistory"))))
			: h("p", { style: { padding: 40, textAlign: "center", opacity: .5 } }, detailBusy ? t("loading") : t("emptyDetail"));

		const facetActive = value => {
			if (!facets) return null;
			const active = facets.active || {};
			if (value === "rule") return Number(active.rule) || 0;
			if (value === "fact") return Number(active.fact) || 0;
			if (value === "sop") return Number(active.sop) || 0;
			return Number(active.total) || 0;
		};
		const facetArchivedOf = value => {
			if (!facets) return null;
			const archived = facets.archived || {};
			if (value === "rule") return Number(archived.rule) || 0;
			if (value === "fact") return Number(archived.fact) || 0;
			if (value === "sop") return Number(archived.sop) || 0;
			return Number(archived.total) || 0;
		};
		const filterActive = Boolean(kind) || Boolean(query) || includeArchived;

		const entriesPane = h("div", { style: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0 } },
			h("div", { className: "lm-browser-entries-toolbar" + (mobileTab === "detail" ? " is-detail" : "") },
				h("div", { className: "lm-browser-search" },
					h(Input, { type: "search", className: "lm-search-input", icon: h(IconSearchOutlineRegular, { size: 14 }), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) })),
				h("div", { className: "lm-browser-filter-tabs" },
					[["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => {
						const active = facetActive(value);
						const archived = facetArchivedOf(value);
						const chipTitle = active === null ? t("inventoryLabel") : t("inventoryChipTitle", { active, archived });
						return h("button", {
							key: value || "all",
							type: "button",
							className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""),
							"aria-pressed": kind === value,
							title: chipTitle,
							"aria-label": `${label} ${chipTitle}`,
							onClick: () => changeKind(value),
						}, label, h("span", { className: "lm-browser-tab-count" }, active === null ? "—" : `(${active})`));
					})),
				h("span", { className: "lm-browser-result-count" }, t("resultCount", { count: entries.length })),
				h(Button, {
					variant: "ghost",
					size: "sm",
					className: "lm-browser-filters-toggle",
					"aria-expanded": filtersOpen,
					onClick: () => setFiltersOpen(value => !value),
				}, t("filters")),
				filtersOpen ? h("div", { className: "lm-browser-filters-panel" },
					h("label", { className: "lm-browser-archived-toggle" },
						h(Switch, { checked: includeArchived, onChange: setIncludeArchived }),
						h("span", null, t("showArchived"))),
					filterActive ? h(Button, { variant: "ghost", size: "sm", onClick: clearFilters }, t("clearFilter")) : null) : null),
			h("div", { className: "lm-browser-body" + (mobileTab === "detail" ? " show-detail" : " show-list") },
				h("section", { className: "lm-browser-list-pane", ref: listPaneRef },
					DataTable ? null : h("div", { className: "lm-table-header" },
						h("span", { className: "lm-col-expand" }),
						h("span", { className: "lm-col-title" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("title") }, "标题 / 摘要")),
						h("span", { className: "lm-col-kind" }, "类型"),
						h("span", { className: "lm-col-time" }, h("button", { type: "button", className: "lm-th-btn", onClick: () => handleSort("updatedAt") }, "更新"))),
					listError ? h(ErrorNotice, { title: t("listFailed"), message: listError, onRetry: loadEntries, t }) : null,
					listBusy && !DataTable ? h("p", { style: { padding: 20, textAlign: "center", opacity: .6 } }, t("loading")) : null,
					listError ? null : DataTable
						? h("div", { className: "lm-browser-advanced-table", style: { "--lm-table-min-width": tableMinWidth + "px" } },
							h(DataTable, {
								data: sortedEntries,
								columns: tableColumns,
								getRowId: row => identity(row.entry),
								renderSubComponent: row => renderExpandedRow(rowData(row)),
								hidePagination: true,
								isLoading: listBusy,
								contentProps: tableContentProps,
								className: "lm-eui-dt-host",
							},
								DataTableContent ? h(DataTableContent, tableContentProps) : null))
						: h("ul", { className: "lm-browser-table" }, sortedEntries.map(renderRow)),
					truncated ? h("div", { className: "lm-browser-load-more" },
						h(Button, { variant: "outline", size: "sm", disabled: listBusy, onClick: () => loadEntries(entries.length, true) }, t("loadMore")),
						h("span", { className: "lm-browser-load-more-meta" }, `${entries.length} / ${matched}`)) : null),
				h("article", { className: "lm-browser-detail" },
					h("div", { ref: detailScrollRef, className: "lm-browser-detail-scroll" }, detailPane))));

		return h("section", { className: "lm-browser-page", "data-memory-browser": true },
			h("style", null, styles),
			/* 页面公用顶部：四个 Tab 共用标题、命名空间、导航与预算仪表 */
			h("header", { className: "lm-browser-header-sticky" },
				h("div", { className: "lm-browser-top-row" },
					h("div", { className: "lm-browser-top-left" },
						h("h1", null, t("title")),
						h(Menu, {
							open: spaceOpen,
							onClose: () => setSpaceOpen(false),
							align: "start",
							portal: true,
							autoFocus: true,
							anchor: h(Button, {
								variant: "outline",
								size: "sm",
								className: "lm-space-button",
								"aria-label": t("space"),
								"aria-haspopup": "menu",
								"aria-expanded": spaceOpen,
								disabled: namespaceBusy,
								onClick: () => setSpaceOpen(value => !value),
							}, t("space")),
						}, namespaces.map(row => h(MenuItemButton, {
							key: row.namespace,
							icon: row.namespace === namespace ? h(IconCheckOutlineRegular, { size: 14 }) : undefined,
							onSelect: () => { setSpaceOpen(false); switchNamespace(row.namespace); },
						}, row.namespace)))),
					h("div", { className: "lm-browser-top-actions" },
						h(Button, { variant: "primary", size: "sm", className: "lm-new-button", "aria-label": t("newEntry"), icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: () => { setCreateError(null); setCreateForm(current => ({ ...current, namespace: namespace || current.namespace })); setCreateOpen(true); } }, t("newEntry")))),
				h("div", { className: "lm-bounce-nav-bar" },
					h(BounceNav, { currentTab, onSelect: selectTab, t })),
				h(IndexUsage, { stats: usage, t, kind, onKindChange: changeKind }),
				usageError ? h("div", { className: "lm-inline-error lm-usage-error", role: "alert" },
					h("strong", null, t("loadFailed")),
					h("span", null, usageError),
					h(Button, { variant: "outline", size: "sm", onClick: loadStats }, t("retry"))) : null),
			/* 工作台主体 */
			h("div", { className: "lm-browser-content-area" },
				currentTab === "injection" ? h(InjectionView, { controls, namespace, kind, onKindChange: changeKind, onOpenEntry: jumpToEntry, t }) : null,
				currentTab === "graph"
					? (runtime && runtime.graphView
						? h(runtime.graphView, { controls, namespace, onJumpEntry: jumpToEntry, t, kind, onKindChange: changeKind })
						: h("div", { className: "lm-graph-view" },
							h(ErrorNotice, { title: t("loadFailed"), message: t("loadFailedHint"), t })))
					: null,
				currentTab === "entries" ? entriesPane : null),
			h(CreateDialog, {
				open: createOpen,
				form: createForm,
				setForm: setCreateForm,
				namespaces,
				busy: busy === "create",
				error: createError,
				onClose: () => setCreateOpen(false),
				onSubmit: handleCreate,
				t,
			}),
			h(ConfirmDialog, {
				open: Boolean(confirmState),
				title: confirmState?.title || t("confirmTitle"),
				message: confirmState?.message || "",
				confirmLabel: confirmState?.confirmLabel || t("confirm"),
				cancelLabel: t("cancel"),
				onConfirm: () => { const action = confirmState?.onConfirm; setConfirmState(null); if (action) action(); },
				onCancel: () => setConfirmState(null),
			}));
	}

	return {
		inject: ["remote"],
		async apply(ctx) {
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-browser: locale");
				const controls = {
					listNamespaces: () => resultValue(scope.remote.layeredMemoryStatus.listNamespaces()),
					namespaceStats: req => resultValue(scope.remote.layeredMemoryStatus.namespaceStats(req)),
					listEntries: req => resultValue(scope.remote.layeredMemoryStatus.listEntries(req)),
					listEntriesPage: req => resultValue(scope.remote.layeredMemoryStatus.listEntriesPage(req)),
					readEntry: req => resultValue(scope.remote.layeredMemoryStatus.readEntry(req)),
					createEntry: req => resultValue(scope.remote.layeredMemoryStatus.createEntry(req)),
					updateEntry: req => resultValue(scope.remote.layeredMemoryStatus.updateEntry(req)),
					setArchived: req => resultValue(scope.remote.layeredMemoryStatus.setArchived(req)),
					entryHistory: req => resultValue(scope.remote.layeredMemoryStatus.entryHistory(req)),
					rollbackEntry: req => resultValue(scope.remote.layeredMemoryStatus.rollbackEntry(req)),
					getInjectionState: req => resultValue(scope.remote.layeredMemoryStatus.getInjectionState(req)),
					getMaintenanceReport: req => resultValue(scope.remote.layeredMemoryStatus.getMaintenanceReport(req)),
				};
				scope.slots.inject("main", () => scope.slots.register({ name: "main", key: "layered-memory", locale, inject: () => ({ controls }) }, MemoryBrowserPage));
				scope.slots.inject("sidebar.panellist", () => scope.slots.register({ name: "sidebar.panellist", id: "layered-memory", order: 20, locale, label: () => scope.locale.translate(locale, "sidebarTitle") }, MemoryBrowserIcon));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); throw error; }
			return async () => { await ui.dispose(); };
		},
	};
}

const runtime = __LM_UI__.createMemoryUiRuntime(require, { d3: typeof __DSH_LMD_D3__ === "undefined" ? undefined : __DSH_LMD_D3__ });
runtime.styles = typeof GRAPH_VIEW_CSS === "undefined" ? "" : GRAPH_VIEW_CSS;
runtime.graphViewStyles = runtime.styles;
if (typeof createMemoryGraphView === "function") runtime.graphView = createMemoryGraphView(require, runtime);
const statusClient = createStatusClient(require, "/* Match ui-chat's StatsPills and stat-dialog; controls come from ui-primitives. */\n.lm-status-seat {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tflex: 0 1 auto;\n\tmin-width: 0;\n\tmax-width: min(240px, 35vw);\n\tfont-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);\n\tline-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));\n}\n.lm-status-line {\n\tdisplay: inline-flex;\n\talign-items: center;\n\tgap: 6px;\n\tbox-sizing: border-box;\n\tmin-width: 0;\n\tmax-width: 100%;\n\tpadding: 1px 8px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-sm);\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-tertiary);\n\tfont: inherit;\n\tfont-variant-numeric: tabular-nums;\n\tline-height: inherit;\n\twhite-space: nowrap;\n\ttext-align: left;\n}\nbutton.lm-status-line { cursor: pointer; }\nbutton.lm-status-line:hover,\nbutton.lm-status-line[aria-expanded=\"true\"] {\n\tbackground: var(--dsw-alias-interactive-bg-hover);\n\tcolor: var(--dsw-alias-label-secondary);\n}\nbutton.lm-status-line:focus-visible,\n.lm-activity-panel summary:focus-visible {\n\toutline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n\toutline-offset: -2px;\n}\n.lm-status-glyph { width: 14px; height: 14px; flex: none; }\n.lm-status-text {\n\tmin-width: 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\tbackground: linear-gradient(105deg, #b78535, #aa79bd);\n\tbackground-clip: text;\n\t-webkit-background-clip: text;\n\tcolor: transparent;\n}\n.lm-status-seat:is([data-memory-status=\"idle\"], [data-memory-status=\"loading\"], [data-memory-status=\"stopped\"]) .lm-status-text,\n.lm-status-line.is-failed .lm-status-text { background: none; color: inherit; }\n.lm-status-failure { flex: none; color: var(--dsw-alias-state-error-primary); }\n.lm-status-line.is-running .lm-status-glyph { animation: lm-status-pulse 1.8s ease-in-out infinite; }\n@keyframes lm-status-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }\n@media (prefers-reduced-motion: reduce) { .lm-status-line.is-running .lm-status-glyph { animation: none; } }\n\n.lm-activity-panel {\n\tposition: fixed;\n\tz-index: 1100;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: max-content;\n\tmin-width: min(300px, calc(100vw - 24px));\n\tmax-width: min(440px, calc(100vw - 24px));\n\tmax-height: min(560px, calc(100dvh - 72px));\n\tmargin: 0;\n\tpadding: 16px;\n\tborder: 0;\n\tborder-radius: var(--dsw-radius-lg);\n\tbackground: var(--dsw-specific-menu);\n\tbackdrop-filter: var(--dsw-menu-backdrop-filter);\n\t--dsw-elevation-stroke-color: var(--dsw-alias-border-l1);\n\tbox-shadow: var(--dsw-elevation-prominent);\n\tfont: inherit;\n\tfont-size: 12px;\n\tline-height: 18px;\n\tcolor: var(--dsw-alias-label-secondary);\n\ttext-align: left;\n\tcursor: default;\n\toverflow: hidden;\n}\n.lm-activity-heading {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tflex: none;\n\tgap: 16px;\n\tmin-height: 20px;\n\tmargin-bottom: 8px;\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-weight: 500;\n}\n.lm-activity-title { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }\n.lm-activity-rule { flex: none; margin-bottom: 10px; border-top: .5px solid var(--dsw-alias-border-l2); }\n.lm-activity-tabs { flex: none; align-self: stretch; margin-bottom: 12px; }\n.lm-activity-body { display: flex; flex-direction: column; min-height: 0; }\n.lm-activity-content { min-height: 0; overflow: auto; overscroll-behavior: contain; }\n.lm-activity-content h3 { margin: 0 0 8px; font: inherit; font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-current-runs { margin-bottom: 16px; }\n.lm-current-run { padding: 10px; border: .5px solid var(--dsw-alias-border-l2); border-radius: var(--dsw-radius-md); }\n.lm-current-run + .lm-current-run { margin-top: 8px; }\n.lm-run-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }\n.lm-run-heading strong { font-weight: 500; color: var(--dsw-alias-label-primary); }\n.lm-run-state { color: var(--dsw-alias-label-tertiary); }\n.lm-run-state[data-state=\"failed\"],\n.lm-run-state[data-state=\"deferred\"] { color: var(--dsw-alias-state-error-primary); }\n.lm-stop { margin-left: auto; }\n.lm-run-counts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 8px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-run-summary { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }\n.lm-finished-run { padding: 10px 0; border-bottom: .5px solid var(--dsw-alias-border-l2); }\n.lm-finished-run:first-child { padding-top: 0; }\n.lm-finished-run:last-child { border-bottom: 0; padding-bottom: 0; }\n.lm-finished-run > summary { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; cursor: pointer; list-style: none; }\n.lm-finished-run > summary::before { content: \"›\"; color: var(--dsw-alias-label-tertiary); }\n.lm-finished-run[open] > summary::before { transform: rotate(90deg); }\n.lm-finished-run time,\n.lm-history time { margin-left: auto; font-size: 11px; line-height: 16px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-tertiary); }\n.lm-legacy { padding: 0 4px; border-radius: var(--dsw-radius-xs); background: var(--dsw-alias-interactive-bg-hover); font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading { display: flex; align-items: center; gap: 8px; flex: none; margin-bottom: 8px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-heading button:not(.lm-stop) { margin-left: auto; }\n.lm-activity-panel .lm-history-older { display: block; margin: 0 auto 10px; }\n.lm-history-message { margin-bottom: 16px; }\n.lm-history-label,\n.lm-history-event > summary { display: flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-event { margin: 8px 0; padding: 8px; border-radius: var(--dsw-radius-sm); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-history-event > summary { cursor: pointer; }\n.lm-history-body { margin: 6px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; }\n.lm-activity-empty { margin: 4px 0; color: var(--dsw-alias-label-tertiary); }\n.lm-activity-error { margin: 8px 0; color: var(--dsw-alias-state-error-primary); white-space: pre-wrap; overflow-wrap: anywhere; }\n");
const memoryBrowserClient = createMemoryBrowserClient(require, ".lm-browser-page {\n\tbox-sizing: border-box;\n\twidth: 100%;\n\theight: 100%;\n\tmin-width: 0;\n\tmin-height: 0;\n\tdisplay: flex;\n\tflex-direction: column;\n\toverflow: hidden;\n\tcolor: var(--dsw-alias-label-primary);\n\tbackground: var(--dsw-alias-bg-base);\n\tfont-size: 14px;\n\tline-height: 1.6;\n}\n.lm-browser-page *, .lm-browser-page *::before, .lm-browser-page *::after { box-sizing: border-box; }\n\n/* 页面公用顶部：标题 + 命名空间 + 新建 + BounceNav */\n.lm-browser-header-sticky {\n\tflex: none;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbackground: var(--dsw-alias-bg-base);\n\tborder-bottom: .5px solid var(--dsw-alias-border-l3);\n\tz-index: 20;\n}\n.lm-browser-top-row {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\tgap: 16px;\n\tpadding: 16px clamp(16px, 3vw, 36px) 10px;\n}\n.lm-browser-top-left {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 14px;\n\tmin-width: 0;\n\tflex: 1;\n}\n.lm-browser-top-left h1 {\n\tmargin: 0;\n\tfont-size: 19px;\n\tfont-weight: 600;\n\tline-height: 26px;\n\twhite-space: nowrap;\n}\n.lm-browser-top-actions {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n\tflex: none;\n}\n\n/* BounceNav 弹性导航栏：高对比度修复 (Bug 1) */\n.lm-bounce-nav-bar {\n\tdisplay: flex;\n\talign-items: center;\n\tpadding: 0 clamp(16px, 3vw, 36px) 10px;\n}\n.lm-bounce-tabs {\n\tposition: relative;\n\tdisplay: flex;\n\talign-items: center;\n\twidth: 100%;\n\tmax-width: 460px;\n\tbackground: var(--dsw-alias-bg-layer-1);\n\tborder: .5px solid var(--dsw-alias-border-l3);\n\tborder-radius: 20px;\n\tpadding: 3px;\n\tgap: 2px;\n}\n.lm-bounce-pill {\n\tposition: absolute;\n\ttop: 3px;\n\tbottom: 3px;\n\tleft: 3px;\n\tborder-radius: 16px;\n\tbackground: var(--dsw-alias-state-business-primary, var(--dsw-static-blue-450, #2563eb));\n\tbox-shadow: 0 2px 6px rgba(0,0,0,.2);\n\ttransition: transform .32s cubic-bezier(0.34, 1.56, 0.64, 1), width .2s ease;\n\tpointer-events: none;\n\tz-index: 1;\n}\n.lm-bounce-tab {\n\tposition: relative;\n\tz-index: 2;\n\tdisplay: inline-flex;\n\talign-items: center;\n\tjustify-content: center;\n\tmin-width: 0;\n\tpadding: 6px 16px;\n\tborder: 0;\n\tborder-radius: 16px;\n\tbackground: transparent;\n\tcolor: var(--dsw-alias-label-secondary);\n\tfont: inherit;\n\tfont-size: 13px;\n\tfont-weight: 500;\n\tcursor: pointer;\n\ttransition: color .2s ease;\n\twhite-space: nowrap;\n}\n.lm-bounce-tab-label { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-bounce-tab:hover { color: var(--dsw-alias-label-primary); }\n.lm-bounce-tab.is-active { color: #ffffff !important; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,.25); }\n\n/* 公用预算水位仪表 (Bug 2: 全 Tab 共享) */\n.lm-browser-usage-wrap {\n\tflex: none;\n\tpadding: 0 clamp(16px, 3vw, 36px) 10px;\n}\n.lm-usage-summary {\n\tbox-sizing: border-box;\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n\twidth: 100%;\n\tpadding: 6px 12px;\n\tbackground: var(--dsw-alias-bg-layer-1);\n\tborder: .5px solid var(--dsw-alias-border-l3);\n\tborder-radius: 10px;\n\tcolor: inherit;\n\tfont: inherit;\n\ttext-align: left;\n\tcursor: pointer;\n}\n.lm-usage-summary:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-ring-wrap { width: 22px; height: 22px; flex: none; display: flex; align-items: center; justify-content: center; }\n.lm-usage-ring { width: 100%; height: 100%; transform: rotate(-90deg); }\n.lm-usage-ring-bg { fill: none; stroke: var(--dsw-alias-border-l3); stroke-width: 4; }\n.lm-usage-ring-fill { fill: none; stroke: var(--dsw-static-blue-450, #3b82f6); stroke-width: 4; stroke-linecap: round; transition: stroke-dasharray .3s ease; }\n.lm-usage-ring-fill.is-near { stroke: var(--dsw-alias-state-warn-primary, #eab308); }\n.lm-usage-ring-fill.is-over { stroke: var(--dsw-alias-state-error-primary, #ef4444); }\n.lm-usage-percent { flex: none; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.lm-usage-percent.is-over { color: var(--dsw-alias-state-error-primary); }\n.lm-usage-bar { flex: 1 1 auto; display: flex; gap: 1px; height: 5px; min-width: 80px; overflow: hidden; border-radius: 999px; background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-segment { flex: none; min-width: 2px; height: 100%; border-radius: 1px; background: var(--meter-tint, var(--dsw-alias-label-tertiary)); transition: opacity .12s ease; }\n.lm-usage-segment.is-dim { opacity: .28; }\n.lm-usage-figures { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 12px; font-variant-numeric: tabular-nums; }\n.lm-usage-chevron { flex: none; color: var(--dsw-alias-label-tertiary); transition: transform .16s ease; }\n.lm-browser-usage-wrap.is-open .lm-usage-chevron { transform: rotate(180deg); }\n.lm-usage-detail { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .18s ease; }\n.lm-browser-usage-wrap.is-open .lm-usage-detail { grid-template-rows: 1fr; }\n.lm-usage-detail-inner { min-height: 0; overflow: hidden; }\n.lm-usage-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 18px; padding-top: 6px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\n.lm-usage-legend-wrap { display: inline-flex; }\n.lm-usage-legend-item { display: inline-flex; align-items: center; gap: 5px; cursor: default; }\n.lm-usage-swatch { display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: var(--meter-tint); }\n.lm-usage-legend-label { color: var(--dsw-alias-label-secondary); }\n.lm-usage-legend-chars { color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-usage-legend-item.is-clickable { appearance: none; padding: 2px 8px; border: 0; border-radius: 10px; background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }\n.lm-usage-legend-item.is-clickable:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-usage-legend-item.is-clickable.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }\n.lm-usage-color-head { --meter-tint: var(--dsw-static-neutral-bluish-400, #94a3b8); }\n.lm-usage-color-rules { --meter-tint: var(--dsw-static-violet-400, #a855f7); }\n.lm-usage-color-facts { --meter-tint: var(--dsw-static-blue-450, #3b82f6); }\n.lm-usage-color-sops { --meter-tint: #b78535; }\n\n/* 条目表格工具栏（仅在 entries 视图） */\n.lm-browser-entries-toolbar {\n\tflex: none;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\talign-items: center;\n\tgap: 8px 12px;\n\tpadding: 8px clamp(16px, 3vw, 36px) 12px;\n\tbackground: var(--dsw-alias-bg-base);\n}\n.lm-browser-search { display: flex; align-items: center; flex: 1 1 200px; min-width: 150px; height: 34px; padding: 0 10px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 10px; color: var(--dsw-alias-label-tertiary); transition: border-color .15s; }\n.lm-browser-search:hover { border-color: var(--dsw-alias-border-l2); }\n.lm-browser-search:focus-within { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-search > :first-child { flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; background: transparent; }\n.lm-browser-search input::placeholder { color: var(--dsw-alias-label-caption); }\n.lm-browser-search input:focus-visible { outline: none; }\n.lm-browser-filter-tabs { display: flex; flex: none; flex-wrap: wrap; align-items: center; gap: 4px; }\n.lm-browser-filter-tab { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px; border: 0; border-radius: 14px; color: var(--dsw-alias-label-tertiary); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }\n.lm-browser-filter-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-filter-tab.is-active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); font-weight: 600; }\n.lm-browser-tab-count { font-size: 11px; opacity: .75; font-variant-numeric: tabular-nums; }\n.lm-browser-archived-toggle { display: inline-flex; align-items: center; gap: 6px; flex: none; color: var(--dsw-alias-label-secondary); font-size: 13px; cursor: pointer; }\n\n/* 页面内容区与表格分栏 */\n.lm-browser-content-area { flex: 1; min-width: 0; min-height: 0; display: flex; overflow: hidden; }\n.lm-browser-body { display: flex; flex: 1; min-width: 0; min-height: 0; }\n.lm-browser-list-pane { flex: 0 0 52%; min-width: 320px; min-height: 0; overflow: auto; padding: 10px clamp(12px, 2vw, 24px) 32px; scrollbar-gutter: stable; }\n\n/* Advanced Data Table */\n.lm-table-header { display: flex; align-items: center; padding: 8px 10px; border-bottom: 1.5px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-tertiary); font-size: 12px; font-weight: 600; }\n.lm-th-btn { display: inline-flex; align-items: center; gap: 4px; border: 0; background: transparent; color: inherit; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; padding: 2px 4px; border-radius: 4px; }\n.lm-th-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.lm-col-expand { width: 28px; flex: none; }\n.lm-col-title { flex: 1 1 180px; min-width: 120px; }\n.lm-col-kind { width: 68px; flex: none; text-align: center; }\n.lm-col-time { width: 75px; flex: none; text-align: right; }\n\n.lm-browser-table { display: flex; flex-direction: column; gap: 3px; margin: 4px 0 0; padding: 0; list-style: none; }\n.lm-browser-row-wrap { display: flex; flex-direction: column; border-radius: 10px; border: .5px solid transparent; transition: background .12s; }\n.lm-browser-row-wrap:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-browser-row-wrap.is-selected { background: var(--dsw-alias-interactive-bg-active); border-color: var(--dsw-alias-border-l3); }\n.lm-browser-row-wrap.is-archived { opacity: .65; }\n\n.lm-table-row-main { display: flex; align-items: center; width: 100%; padding: 8px 10px; cursor: pointer; text-align: left; background: transparent; border: 0; font: inherit; color: inherit; }\n.lm-row-expand-btn { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); border-radius: 4px; cursor: pointer; transition: transform .16s; font-size: 14px; }\n.lm-row-expand-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.lm-row-expand-btn.is-open { transform: rotate(90deg); }\n\n.lm-row-title-cell { display: flex; align-items: center; gap: 6px; overflow: hidden; min-width: 0; }\n.lm-row-title-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; font-size: 13px; }\n.lm-highlight-match { background: rgba(234, 179, 8, 0.35); color: inherit; padding: 0 1px; border-radius: 2px; }\n\n/* 类型色点与徽标 */\n.lm-browser-kind-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; flex: none; }\n.lm-browser-kind { display: inline-flex; align-items: center; justify-content: center; height: 20px; padding: 0 6px; border-radius: 10px; font-size: 11px; font-weight: 500; white-space: nowrap; }\n.lm-browser-kind-rule { background: rgba(168, 85, 247, 0.14); color: var(--dsw-static-violet-400, #a855f7); border: .5px solid rgba(168, 85, 247, 0.3); }\n.lm-browser-kind-fact { background: rgba(59, 130, 246, 0.14); color: var(--dsw-static-blue-450, #3b82f6); border: .5px solid rgba(59, 130, 246, 0.3); }\n.lm-browser-kind-sop { background: rgba(183, 133, 53, 0.14); color: #b78535; border: .5px solid rgba(183, 133, 53, 0.3); }\n\n/* 热度微条与流态 */\n\n/* 行内展开详情 */\n.lm-row-expanded-pane { padding: 10px 14px 14px 38px; border-top: .5px solid var(--dsw-alias-border-l3); font-size: 13px; background: var(--dsw-alias-bg-layer-1); border-radius: 0 0 10px 10px; }\n.lm-row-summary-box { color: var(--dsw-alias-label-secondary); margin-bottom: 8px; line-height: 1.5; font-size: 12.5px; }\n.lm-row-capsules { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }\n.lm-capsule-tag { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: var(--dsw-alias-bg-base); border: .5px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-secondary); cursor: pointer; }\n.lm-capsule-tag:hover { border-color: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-state-business-primary); }\n.lm-row-evidence-preview { font-size: 11.5px; color: var(--dsw-alias-label-caption); font-family: var(--dsh-font-family-mono, monospace); white-space: pre-wrap; overflow-wrap: anywhere; max-height: 80px; overflow: auto; padding: 6px 8px; background: var(--dsw-alias-bg-base); border-radius: 6px; }\n\n/* 右侧详情栏 */\n.lm-browser-detail { display: flex; flex: 1; flex-direction: column; min-width: 0; min-height: 0; border-left: .5px solid var(--dsw-alias-border-l3); position: relative; }\n.lm-browser-detail-scroll { flex: 1; min-height: 0; overflow: auto; padding: 20px clamp(16px, 2.5vw, 32px) 36px; scrollbar-gutter: stable; }\n.lm-detail-back-btn { display: none; align-items: center; gap: 4px; margin-bottom: 12px; }\n\n\n\n/* Markdown 预览与段落切换 */\n.lm-browser-md-preview { min-height: 180px; max-height: 480px; overflow: auto; padding: 12px 14px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 13.5px; line-height: 1.7; }\n.lm-browser-md-preview h1, .lm-browser-md-preview h2, .lm-browser-md-preview h3 { margin: 12px 0 6px; font-weight: 600; }\n.lm-browser-md-preview p { margin: 6px 0; }\n.lm-browser-md-preview code { padding: 1px 4px; border-radius: 4px; background: var(--dsw-alias-bg-layer-1); font-family: var(--dsh-font-family-mono, monospace); font-size: 12.5px; }\n\n.lm-browser-field { display: flex; flex-direction: column; gap: 7px; min-width: 0; margin-bottom: 16px; }\n.lm-browser-field-label { color: var(--dsw-alias-label-secondary); font-size: 13px; font-weight: 500; }\n.lm-browser-textarea { display: block; width: 100%; max-width: 100%; min-height: 112px; margin: 0; padding: 10px 12px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; outline: 0; resize: vertical; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); font: inherit; font-size: 13px; line-height: 22px; transition: border-color .15s; }\n.lm-browser-textarea:focus { border-color: var(--dsw-alias-state-business-primary); }\n.lm-browser-content { min-height: 220px; font-family: var(--dsh-font-family-mono, monospace); }\n.lm-browser-evidence-textarea { min-height: 72px; max-height: 160px; font-family: var(--dsh-font-family-mono, monospace); font-size: 12.5px; }\n\n/* 规则 100 字符动态计量条 */\n.lm-browser-rule-meter { display: flex; flex-direction: column; gap: 4px; width: 100%; margin-top: 4px; }\n.lm-browser-rule-meter-track { width: 100%; height: 4px; background: var(--dsw-alias-bg-layer-1); border-radius: 2px; overflow: hidden; }\n.lm-browser-rule-meter-fill { height: 100%; background: var(--dsw-static-violet-400, #a855f7); transition: width .2s ease; }\n.lm-browser-rule-meter.is-near .lm-browser-rule-meter-fill { background: var(--dsw-alias-state-warn-primary, #eab308); }\n.lm-browser-rule-meter.is-over .lm-browser-rule-meter-fill { background: var(--dsw-alias-state-error-primary, #ef4444); }\n.lm-browser-rule-length { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }\n\n/* Scroll Progress Pill (Component Hunt 形态三) */\n\n/* 历史快照 Timeline + 行级 Diff (Bug 3 修复) */\n.lm-history-timeline { display: flex; flex-direction: column; margin: 0; padding: 0 0 0 16px; list-style: none; position: relative; border-left: 2px solid var(--dsw-alias-border-l3); }\n.lm-history-node { position: relative; margin-bottom: 16px; }\n.lm-history-dot { position: absolute; left: -21px; top: 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-border-l2); border: 2px solid var(--dsw-alias-bg-base); }\n.lm-history-card { padding: 10px 12px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); border: .5px solid var(--dsw-alias-border-l3); }\n.lm-history-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }\n.lm-history-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }\n.lm-history-delta { font-size: 11px; padding: 1px 6px; border-radius: 4px; font-weight: 500; }\n.lm-delta-pos { background: rgba(34, 197, 94, 0.12); color: #16a34a; }\n.lm-delta-neg { background: rgba(239, 68, 68, 0.12); color: #dc2626; }\n.lm-history-summary { font-size: 12px; color: var(--dsw-alias-label-caption); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-diff-view { margin-top: 8px; padding: 8px 10px; border-radius: 6px; background: var(--dsw-alias-bg-base); font-family: var(--dsh-font-family-mono, monospace); font-size: 12px; max-height: 240px; overflow: auto; }\n.lm-diff-line { display: flex; gap: 8px; padding: 1px 4px; border-radius: 2px; }\n.lm-diff-add { background: rgba(34, 197, 94, 0.15); color: #15803d; }\n.lm-diff-del { background: rgba(239, 68, 68, 0.15); color: #b91c1c; text-decoration: line-through; }\n\n/* 注入透视视图 (Injection View) */\n.lm-injection-view { display: flex; flex-direction: column; flex: 1; height: 100%; overflow: auto; padding: 16px clamp(16px, 3vw, 36px); }\n.lm-injection-split { display: flex; flex: 1; gap: 16px; min-height: 440px; }\n.lm-injection-table-pane { flex: 1; overflow: auto; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; padding: 12px; background: var(--dsw-alias-bg-base); }\n.lm-injection-text-pane { flex: 1; display: flex; flex-direction: column; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; padding: 12px; background: var(--dsw-alias-bg-base); }\n\n/* 弹层样式 */\n.lm-browser-modal-backdrop { position: fixed; z-index: 1000; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--dsw-alias-mask, rgb(0 0 0 / 40%)); }\n.lm-browser-modal { display: flex; flex-direction: column; width: min(580px, 100%); max-height: calc(100dvh - 48px); overflow: hidden; border: .5px solid var(--dsw-alias-border-l3); border-radius: 16px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); box-shadow: 0 16px 48px rgb(0 0 0 / 24%); }\n.lm-browser-modal form { display: flex; flex-direction: column; min-height: 0; overflow: auto; padding: 0 24px 20px; }\n.lm-browser-modal-heading { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; padding: 20px 24px 0; }\n.lm-browser-modal-heading h2 { margin: 0; font-size: 19px; font-weight: 600; }\n\n/* 移动端与窄屏响应式 (<700px) */\n\n\n\n\n\n\n\n/* 尊重系统的减少动效偏好 */\n\n\n\n/* 交互错误与重试 */\n.lm-inline-error {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\talign-items: center;\n\tgap: 6px 12px;\n\tmargin: 8px 0;\n\tpadding: 8px 12px;\n\tborder-radius: 10px;\n\tborder: .5px solid var(--dsw-alias-state-error-primary, #ef4444);\n\tbackground: rgba(239, 68, 68, .08);\n\tcolor: var(--dsw-alias-label-primary);\n\tfont-size: 12.5px;\n}\n.lm-inline-error strong { color: var(--dsw-alias-state-error-primary, #ef4444); }\n.lm-inline-error > span { flex: 1 1 160px; min-width: 0; overflow-wrap: anywhere; }\n.lm-usage-error { margin: 0 clamp(16px, 3vw, 36px) 10px; }\n\n/* 预算条与图例联动（分段可点、hover 降亮） */\n.lm-usage-summary { user-select: none; }\n.lm-usage-summary:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #2563eb); outline-offset: 2px; }\n.lm-usage-segment { border: 0; padding: 0; cursor: pointer; }\n.lm-usage-segment:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #2563eb); outline-offset: 1px; }\n.lm-usage-segment.is-active { opacity: 1; box-shadow: 0 0 0 1px var(--dsw-alias-label-primary) inset; }\n.lm-usage-segment.is-dim { opacity: .28; }\n.lm-usage-legend-item.is-dim { opacity: .4; }\n\n/* 条目表：结果数、库存与分页 */\n.lm-browser-load-more { display: flex; align-items: center; gap: 10px; padding: 12px 4px; font-size: 12px; color: var(--dsw-alias-label-tertiary); }\n.lm-table-title-btn { display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }\n.lm-table-title-btn.is-selected { font-weight: 600; }\n.lm-browser-advanced-table { min-width: 0; }\n\n/* 注入透视 */\n.lm-injection-state { padding: 24px; text-align: center; opacity: .6; }\n.lm-injection-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin-bottom: 12px; }\n.lm-injection-toolbar-row { display: contents; }\n.lm-injection-mobile-switch { display: none; }\n.lm-injection-namespace { font-size: 12px; color: var(--dsw-alias-label-secondary); }\n.lm-injection-scope { padding: 1px 8px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); font-size: 11px; color: var(--dsw-alias-label-tertiary); }\n.lm-injection-filters { display: flex; flex-wrap: wrap; gap: 4px; }\n.lm-injection-filter { display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 10px; border: 0; border-radius: 13px; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 12.5px; cursor: pointer; }\n.lm-injection-filter:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-injection-filter.is-active { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); font-weight: 600; }\n.lm-injection-filter-count { font-size: 11px; opacity: .75; font-variant-numeric: tabular-nums; }\n.lm-injection-recall { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; flex: 1 1 240px; min-width: 0; }\n.lm-injection-recall > :first-child { flex: 1 1 160px; min-width: 0; }\n.lm-injection-pane-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }\n.lm-injection-pane-head h3 { margin: 0; font-size: 14px; }\n.lm-injection-pane-meta { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-injection-items { display: flex; flex-direction: column; gap: 4px; }\n.lm-injection-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 12px; cursor: pointer; min-width: 0; }\n.lm-injection-item:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-injection-item.is-active { outline: 1px solid var(--dsw-alias-state-business-primary, #2563eb); background: var(--dsw-alias-interactive-bg-hover); }\n.lm-injection-item:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #2563eb); }\n.lm-injection-item-title { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-injection-empty { padding: 16px; font-size: 12.5px; color: var(--dsw-alias-label-caption); }\n.lm-injection-tabs { display: inline-flex; overflow: hidden; border: .5px solid var(--dsw-alias-border-l3); border-radius: 8px; }\n.lm-injection-tab { height: 26px; padding: 0 12px; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); font: inherit; font-size: 12px; cursor: pointer; }\n.lm-injection-tab:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-injection-tab.is-active { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); font-weight: 600; }\n\n/* 提示词分组与原文 */\n.lm-prompt-groups { flex: 1; min-height: 0; overflow: auto; padding: 4px 2px; }\n.lm-prompt-group { margin-bottom: 18px; }\n.lm-prompt-group-title { margin: 0 0 6px; font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-tertiary); }\n.lm-prompt-intro, .lm-prompt-head p, .lm-prompt-preamble p { margin: 0 0 4px; font-size: 12px; color: var(--dsw-alias-label-secondary); line-height: 1.6; }\n.lm-prompt-head h1, .lm-prompt-head h2, .lm-prompt-head h3 { margin: 0 0 4px; font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }\n.lm-prompt-head code { padding: 1px 4px; border-radius: 4px; background: var(--dsw-alias-bg-layer-1); font-family: var(--dsh-font-family-mono, monospace); font-size: 11.5px; }\n.lm-prompt-preamble { padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }\n.lm-prompt-block { margin-top: 12px; }\n.lm-prompt-block h5 { margin: 0 0 6px; font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-secondary); }\n.lm-prompt-rules { display: flex; flex-direction: column; gap: 6px; }\n.lm-prompt-rule { padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-size: 12.5px; line-height: 1.6; cursor: pointer; }\n.lm-prompt-rule:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-prompt-rule.is-active { outline: 1px solid var(--dsw-alias-state-business-primary, #2563eb); }\n.lm-prompt-chips { display: flex; flex-wrap: wrap; gap: 6px; }\n.lm-prompt-chip { max-width: 100%; padding: 3px 9px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 12px; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11.5px; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-prompt-chip:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-prompt-chip.is-active { border-color: var(--dsw-alias-state-business-primary, #2563eb); color: var(--dsw-alias-label-primary); font-weight: 600; }\n.lm-prompt-chip-fact { border-left: 3px solid var(--dsw-static-blue-450, #3b82f6); }\n.lm-prompt-chip-sop { border-left: 3px solid #b78535; }\n.lm-prompt-chip-rule { border-left: 3px solid var(--dsw-static-violet-400, #a855f7); }\n.lm-prompt-notices { margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); }\n.lm-prompt-notices p { margin: 0; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }\n.lm-prompt-raw { flex: 1; min-height: 0; overflow: auto; padding: 10px; border-radius: 8px; background: var(--dsw-alias-bg-layer-1); font-family: var(--dsh-font-family-mono, monospace); font-size: 11.5px; line-height: 1.7; }\n.lm-prompt-raw-line { white-space: pre-wrap; overflow-wrap: anywhere; border-radius: 3px; }\n.lm-prompt-raw-line.is-linked { cursor: pointer; }\n.lm-prompt-raw-line.is-linked:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.lm-prompt-raw-line.is-hit { background: rgba(234, 179, 8, .28); box-shadow: inset 2px 0 0 #eab308; }\n\n/* 注入状态徽标补充 */\n\n/* 确认弹层 */\n.lm-confirm-modal { width: min(420px, 100%); }\n.lm-confirm-body { padding: 0 24px; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }\n\n/* 注入环形仪表与滚动导航容器 */\n\n/* 桌面双栏：数据表按左侧面板实际宽度分配列宽（EasyUI 组件结构，样式只在本插件容器内覆盖） */\n.lm-browser-advanced-table { min-width: 0; width: 100%; }\n.lm-browser-advanced-table .lm-eui-dt-table { table-layout: fixed; min-width: var(--lm-table-min-width, 560px); }\n.lm-browser-advanced-table .lm-eui-dt-th, .lm-browser-advanced-table .lm-eui-dt-td { padding: 8px 8px; }\n.lm-browser-advanced-table .lm-eui-dt-th-expand, .lm-browser-advanced-table .lm-eui-dt-td-expand { width: 28px; }\n/* 选择列当前没有批量动作，占用首屏宽度；行内详情仍可从标题进入 */\n.lm-browser-advanced-table .lm-eui-dt-th-check, .lm-browser-advanced-table .lm-eui-dt-td-check, .lm-browser-advanced-table .lm-eui-dt-check { display: none; }\n.lm-browser-advanced-table .lm-eui-dt-table-wrap { overflow-x: auto; }\n.lm-browser-advanced-table .lm-table-title-btn { display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 100%; }\n.lm-browser-advanced-table .lm-row-title-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n/* 状态图表与紧凑信息块 */\n.lm-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex: none; }\n.lm-dot-active { background: #16a34a; }\n.lm-dot-archived { background: #94a3b8; }\n.lm-injection-source { margin-bottom: 12px; padding: 10px 12px; border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }\n.lm-injection-source dl { display: flex; flex-wrap: wrap; gap: 6px 24px; margin: 0; }\n.lm-injection-source dt { font-size: 11px; color: var(--dsw-alias-label-tertiary); }\n.lm-injection-source dd { margin: 0; font-size: 12px; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }\n.lm-empty-inline { display: flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 12.5px; color: var(--dsw-alias-label-caption); }\n.lm-empty-icon { font-size: 14px; }\n.lm-error-details { flex: 1 1 100%; }\n.lm-error-details summary { cursor: pointer; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }\n.lm-error-details pre { margin: 4px 0 0; padding: 6px 8px; border-radius: 6px; background: var(--dsw-alias-bg-base); font-size: 11.5px; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 160px; overflow: auto; }\n.lm-kind-option { display: inline-flex; align-items: center; gap: 6px; }\n.lm-browser-rule-error { color: var(--dsw-alias-state-error-primary, #ef4444); font-size: 11.5px; }\n\n/* 详情页：标题 + 类型 + 操作，下面直接是正文；辅助信息收进 Disclosure */\n.lm-detail-head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin-bottom: 14px; }\n.lm-detail-title { flex: 1 1 240px; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }\n.lm-detail-head .lm-browser-kind { flex: none; }\n.lm-detail-notice { margin: 0 0 12px; font-size: 12px; color: #16a34a; }\n.lm-detail-body { min-height: 0; max-height: none; overflow: visible; padding: 0; border: 0; border-radius: 0; background: transparent; }\n.lm-detail-edit { display: flex; flex-direction: column; gap: 12px; }\n.lm-detail-actions { display: flex; justify-content: flex-end; gap: 8px; }\n.lm-detail-meta-list { display: flex; flex-direction: column; gap: 10px; }\n.lm-detail-meta-label { display: block; margin-bottom: 3px; font-size: 11px; color: var(--dsw-alias-label-tertiary); }\n.lm-detail-evidence { margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-bg-base); font-family: var(--dsh-font-family-mono, monospace); font-size: 12px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; max-height: 200px; overflow: auto; }\n.lm-detail-hint { margin: 0; padding: 6px 0; font-size: 12px; color: var(--dsw-alias-label-caption); }\n.lm-history-detail { margin-top: 6px; font-size: 11px; color: var(--dsw-alias-label-tertiary); }\n.lm-history-detail summary { cursor: pointer; }\n.lm-history-detail code { font-family: var(--dsh-font-family-mono, monospace); }\n\n/* 本地 Disclosure 兜底（runtime 注入 Disclosure 后由组件自带样式接管） */\n.lm-disclosure { border-top: .5px solid var(--dsw-alias-border-l3); }\n.lm-disclosure-head { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 44px; padding: 8px 2px; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }\n.lm-disclosure-head:hover { color: var(--dsw-alias-label-primary); }\n.lm-disclosure-caret { flex: none; font-size: 11px; color: var(--dsw-alias-label-tertiary); }\n.lm-disclosure-title { flex: 1 1 auto; min-width: 0; font-weight: 500; overflow-wrap: anywhere; }\n.lm-disclosure-count { flex: none; padding: 0 7px; border-radius: 9px; background: var(--dsw-alias-bg-layer-1); font-size: 11px; color: var(--dsw-alias-label-tertiary); font-variant-numeric: tabular-nums; }\n.lm-disclosure-body { padding-bottom: 12px; }\n\n/* 列表工具栏：搜索 + 类型 + 一项结果数，低频条件收进筛选 */\n.lm-browser-filters-toggle { flex: none; }\n.lm-browser-filters-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; flex: 1 1 100%; padding: 2px 0 4px; }\n\n/* 注入页：当前条目与高级设置 */\n.lm-injection-focused { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1 1 auto; }\n.lm-injection-focused-title { flex: 1 1 auto; min-width: 0; font-size: 12.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.lm-injection-advanced-body { display: flex; flex-direction: column; gap: 10px; min-width: 240px; max-width: 320px; }\n.lm-injection-advanced-body .lm-injection-recall { flex: 1 1 100%; min-width: 0; }\n.lm-injection-advanced-body .lm-injection-source { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; margin: 0; padding: 0; background: transparent; }\n\n/* 驾驶舱卡片头 */\n\n/* 新建弹层：空间跟随当前选择 */\n.lm-create-namespace { padding: 8px 10px; border: .5px solid var(--dsw-alias-border-l3); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); font-size: 13px; color: var(--dsw-alias-label-primary); }\n\n/* 响应式覆盖放在基础规则之后，避免同权重时被基础规则覆盖 */\n\n@media (width <= 980px) {\n\t.lm-browser-list-pane { flex-basis: 48%; }\n}\n\n@media (width <= 700px) {\n\t.lm-browser-page, .lm-browser-page * { min-width: 0; }\n\t.lm-browser-top-row, .lm-bounce-nav-bar, .lm-browser-usage-wrap, .lm-browser-entries-toolbar { padding-left: 12px; padding-right: 12px; }\n\t.lm-browser-top-row { flex-wrap: wrap; gap: 8px; padding-top: 10px; padding-bottom: 8px; }\n\t.lm-browser-top-left { flex: 1 1 auto; gap: 8px 10px; width: auto; min-width: 0; flex-wrap: nowrap; }\n\t.lm-browser-top-left h1 { flex: 1 1 auto; min-width: 0; font-size: 16px; line-height: 22px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\t.lm-browser-top-actions { flex: none; width: auto; justify-content: flex-end; }\n\t.lm-bounce-nav-bar { padding-bottom: 8px; overflow: hidden; }\n\t.lm-bounce-tabs { max-width: 100%; }\n\t.lm-bounce-tab { padding: 6px 4px; font-size: 12px; }\n\t.lm-browser-usage-wrap { padding-bottom: 8px; }\n\t.lm-usage-summary { flex-wrap: wrap; gap: 8px; }\n\t.lm-usage-bar { min-width: 60px; }\n\t.lm-usage-figures { font-size: 11px; }\n\t.lm-usage-detail-inner { overflow-x: auto; }\n\t.lm-browser-entries-toolbar { padding: 8px 12px 10px; }\n\t.lm-browser-search { flex: 1 1 100%; }\n\t.lm-browser-filter-tabs { flex: 1 1 100%; }\n\t.lm-browser-body.show-list .lm-browser-detail { display: none; }\n\t.lm-browser-body.show-detail .lm-browser-list-pane { display: none; }\n\t.lm-browser-list-pane { flex: 1; width: 100%; min-width: 0; padding: 8px 10px 24px; }\n\t.lm-browser-detail { border-left: 0; width: 100%; min-width: 0; }\n\t.lm-detail-back-btn { display: inline-flex; }\n\t.lm-table-row-main { flex-wrap: wrap; row-gap: 4px; }\n\t.lm-col-title { flex: 1 1 100%; }\n\t.lm-row-title-text { white-space: normal; overflow-wrap: anywhere; }\n\t.lm-browser-detail-scroll { padding: 12px 12px 28px; }\n\t.lm-detail-title { font-size: 16px; }\n\t.lm-row-capsules { max-height: 92px; overflow-y: auto; }\n\t.lm-injection-mobile-switch { display: flex; justify-content: flex-end; padding: 8px 12px 0; }\n\t.lm-browser-entries-toolbar.is-detail { display: none; }\n\t.lm-injection-split { flex: 1 1 auto; flex-direction: column; min-height: 0; gap: 10px; }\n\t.lm-injection-split-list .lm-injection-table-pane, .lm-injection-split-preview .lm-injection-text-pane { flex: 1 1 auto; min-height: 0; max-height: none; overflow: auto; }\n\t.lm-injection-split-list .lm-injection-text-pane, .lm-injection-split-preview .lm-injection-table-pane { display: none; }\n\t.lm-injection-toolbar { gap: 6px 8px; }\n\t.lm-injection-toolbar-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; flex: 1 1 100%; }\n\t.lm-injection-namespace { display: none; }\n\t/* 类型组可收缩并在组内换行，高级入口始终与它同排 */\n\t.lm-injection-filters { flex: 1 1 auto; min-width: 0; gap: 2px; }\n\t.lm-injection-advanced { flex: none; }\n\t.lm-injection-recall { flex: 1 1 100%; }\n\t.lm-space-button, .lm-new-button, .lm-detail-edit-btn, .lm-detail-more-btn, .lm-detail-back-btn,\n\t.lm-detail-actions button, .lm-injection-filter, .lm-bounce-tab, .lm-browser-filter-tab,\n\t.lm-row-expand-btn, .lm-capsule-tag, .lm-browser-filters-toggle, .lm-copy-btn, .lm-recall-btn,\n\t.lm-search-input, .lm-injection-tab, .lm-injection-item { min-height: 44px; }\n\t.lm-injection-filter { height: auto; padding: 0 8px; gap: 4px; }\n\t.lm-prompt-groups { max-height: none; }\n}\n\n@media (width <= 420px) {\n\t.lm-browser-top-left h1 { font-size: 15px; }\n\t.lm-bounce-tab { font-size: 11.5px; padding: 6px 2px; }\n\t.lm-usage-percent { font-size: 12px; }\n\t.lm-injection-item { flex-wrap: wrap; row-gap: 4px; }\n\t.lm-injection-item-title { flex: 1 1 100%; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n\t.lm-browser-page *, .lm-browser-page *::before, .lm-browser-page *::after {\n\t\tanimation-duration: .001ms !important;\n\t\tanimation-iteration-count: 1 !important;\n\t\ttransition-duration: .001ms !important;\n\t\tscroll-behavior: auto !important;\n\t}\n}\n", runtime);
return {
	inject: statusClient.inject,
	async apply(ctx) {
		const disposeStatus = await statusClient.apply(ctx);
		let disposeBrowser;
		try { disposeBrowser = await memoryBrowserClient.apply(ctx); }
		catch (error) { await disposeStatus(); throw error; }
		return async () => { await disposeBrowser(); await disposeStatus(); };
	},
};
}});
