! function(t, e) {
	"object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.Waveform = e() : t.Waveform = e()
}(this, function() {
	return function(t) {
		function e(r) {
			if (n[r]) return n[r].exports;
			var o = n[r] = {
				i: r,
				l: !1,
				exports: {}
			};
			return t[r].call(o.exports, o, o.exports, e), o.l = !0, o.exports
		}
		var n = {};
		return e.m = t, e.c = n, e.d = function(t, n, r) {
			e.o(t, n) || Object.defineProperty(t, n, {
				configurable: !1,
				enumerable: !0,
				get: r
			})
		}, e.n = function(t) {
			var n = t && t.__esModule ? function() {
				return t.default
			} : function() {
				return t
			};
			return e.d(n, "a", n), n
		}, e.o = function(t, e) {
			return Object.prototype.hasOwnProperty.call(t, e)
		}, e.p = "", e(e.s = 11)
	}([function(t, e) {
		function n(t, e) {
			var n = t[1] || "",
				o = t[3];
			if (!o) return n;
			if (e && "function" == typeof btoa) {
				var i = r(o);
				return [n].concat(o.sources.map(function(t) {
					return "/*# sourceURL=" + o.sourceRoot + t + " */"
				})).concat([i]).join("\n")
			}
			return [n].join("\n")
		}

		function r(t) {
			return "/*# sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(t)))) + " */"
		}
		t.exports = function(t) {
			var e = [];
			return e.toString = function() {
				return this.map(function(e) {
					var r = n(e, t);
					return e[2] ? "@media " + e[2] + "{" + r + "}" : r
				}).join("")
			}, e.i = function(t, n) {
				"string" == typeof t && (t = [
					[null, t, ""]
				]);
				for (var r = {}, o = 0; o < this.length; o++) {
					var i = this[o][0];
					"number" == typeof i && (r[i] = !0)
				}
				for (o = 0; o < t.length; o++) {
					var s = t[o];
					"number" == typeof s[0] && r[s[0]] || (n && !s[2] ? s[2] = n : n && (s[2] = "(" + s[2] + ") and (" + n + ")"), e.push(s))
				}
			}, e
		}
	}, function(t, e, n) {
		function r(t, e) {
			for (var n = 0; n < t.length; n++) {
				var r = t[n],
					o = d[r.id];
				if (o) {
					o.refs++;
					for (var i = 0; i < o.parts.length; i++) o.parts[i](r.parts[i]);
					for (; i < r.parts.length; i++) o.parts.push(c(r.parts[i], e))
				} else {
					for (var s = [], i = 0; i < r.parts.length; i++) s.push(c(r.parts[i], e));
					d[r.id] = {
						id: r.id,
						refs: 1,
						parts: s
					}
				}
			}
		}

		function o(t, e) {
			for (var n = [], r = {}, o = 0; o < t.length; o++) {
				var i = t[o],
					s = e.base ? i[0] + e.base : i[0],
					a = i[1],
					u = i[2],
					f = i[3],
					c = {
						css: a,
						media: u,
						sourceMap: f
					};
				r[s] ? r[s].parts.push(c) : n.push(r[s] = {
					id: s,
					parts: [c]
				})
			}
			return n
		}

		function i(t, e) {
			var n = m(t.insertInto);
			if (!n) throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
			var r = g[g.length - 1];
			if ("top" === t.insertAt) r ? r.nextSibling ? n.insertBefore(e, r.nextSibling) : n.appendChild(e) : n.insertBefore(e, n.firstChild), g.push(e);
			else {
				if ("bottom" !== t.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
				n.appendChild(e)
			}
		}

		function s(t) {
			if (null === t.parentNode) return !1;
			t.parentNode.removeChild(t);
			var e = g.indexOf(t);
			e >= 0 && g.splice(e, 1)
		}

		function a(t) {
			var e = document.createElement("style");
			return t.attrs.type = "text/css", f(e, t.attrs), i(t, e), e
		}

		function u(t) {
			var e = document.createElement("link");
			return t.attrs.type = "text/css", t.attrs.rel = "stylesheet", f(e, t.attrs), i(t, e), e
		}

		function f(t, e) {
			Object.keys(e).forEach(function(n) {
				t.setAttribute(n, e[n])
			})
		}

		function c(t, e) {
			var n, r, o, i;
			if (e.transform && t.css) {
				if (!(i = e.transform(t.css))) return function() {};
				t.css = i
			}
			if (e.singleton) {
				var f = b++;
				n = y || (y = a(e)), r = l.bind(null, n, f, !1), o = l.bind(null, n, f, !0)
			} else t.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (n = u(e), r = h.bind(null, n, e), o = function() {
				s(n), n.href && URL.revokeObjectURL(n.href)
			}) : (n = a(e), r = p.bind(null, n), o = function() {
				s(n)
			});
			return r(t),
				function(e) {
					if (e) {
						if (e.css === t.css && e.media === t.media && e.sourceMap === t.sourceMap) return;
						r(t = e)
					} else o()
				}
		}

		function l(t, e, n, r) {
			var o = n ? "" : r.css;
			if (t.styleSheet) t.styleSheet.cssText = w(e, o);
			else {
				var i = document.createTextNode(o),
					s = t.childNodes;
				s[e] && t.removeChild(s[e]), s.length ? t.insertBefore(i, s[e]) : t.appendChild(i)
			}
		}

		function p(t, e) {
			var n = e.css,
				r = e.media;
			if (r && t.setAttribute("media", r), t.styleSheet) t.styleSheet.cssText = n;
			else {
				for (; t.firstChild;) t.removeChild(t.firstChild);
				t.appendChild(document.createTextNode(n))
			}
		}

		function h(t, e, n) {
			var r = n.css,
				o = n.sourceMap,
				i = void 0 === e.convertToAbsoluteUrls && o;
			(e.convertToAbsoluteUrls || i) && (r = _(r)), o && (r += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(o)))) + " */");
			var s = new Blob([r], {
					type: "text/css"
				}),
				a = t.href;
			t.href = URL.createObjectURL(s), a && URL.revokeObjectURL(a)
		}
		var d = {},
			v = function(t) {
				var e;
				return function() {
					return void 0 === e && (e = t.apply(this, arguments)), e
				}
			}(function() {
				return window && document && document.all && !window.atob
			}),
			m = function(t) {
				var e = {};
				return function(n) {
					return void 0 === e[n] && (e[n] = t.call(this, n)), e[n]
				}
			}(function(t) {
				return document.querySelector(t)
			}),
			y = null,
			b = 0,
			g = [],
			_ = n(2);
		t.exports = function(t, e) {
			if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
			e = e || {}, e.attrs = "object" == typeof e.attrs ? e.attrs : {}, e.singleton || (e.singleton = v()), e.insertInto || (e.insertInto = "head"), e.insertAt || (e.insertAt = "bottom");
			var n = o(t, e);
			return r(n, e),
				function(t) {
					for (var i = [], s = 0; s < n.length; s++) {
						var a = n[s],
							u = d[a.id];
						u.refs--, i.push(u)
					}
					if (t) {
						r(o(t, e), e)
					}
					for (var s = 0; s < i.length; s++) {
						var u = i[s];
						if (0 === u.refs) {
							for (var f = 0; f < u.parts.length; f++) u.parts[f]();
							delete d[u.id]
						}
					}
				}
		};
		var w = function() {
			var t = [];
			return function(e, n) {
				return t[e] = n, t.filter(Boolean).join("\n")
			}
		}()
	}, function(t, e) {
		t.exports = function(t) {
			var e = "undefined" != typeof window && window.location;
			if (!e) throw new Error("fixUrls requires window.location");
			if (!t || "string" != typeof t) return t;
			var n = e.protocol + "//" + e.host,
				r = n + e.pathname.replace(/\/[^\/]*$/, "/");
			return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(t, e) {
				var o = e.trim().replace(/^"(.*)"$/, function(t, e) {
					return e
				}).replace(/^'(.*)'$/, function(t, e) {
					return e
				});
				if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(o)) return t;
				var i;
				return i = 0 === o.indexOf("//") ? o : 0 === o.indexOf("/") ? n + o : r + o.replace(/^\.\//, ""), "url(" + JSON.stringify(i) + ")"
			})
		}
	}, function(t, e, n) {
		var r, o;
		r = [n(4)], void 0 !== (o = function(t) {
			function e() {
				return "function" == typeof window.Tone
			}
			var n = t(256).random,
				r = function(t) {
					this._silentThresh = .001, this._rms = 0, this._container = t, this._element = document.createElement("canvas"), this._element.id = "Canvas", t.appendChild(this._element), this._context = this._element.getContext("2d"), e() && (this._analyser = new Tone.Waveform(256), this._signal = (new Tone.Zero).connect(this._analyser), Tone.Master.connect(this._analyser)), e() && (this._boundLoop = this._loop.bind(this), this._loop()), this.resize()
				};
			return r.prototype.resize = function(t, r) {
				t = t || this._container.offsetWidth, r = r || this._container.offsetHeight, this._context.canvas.width = 2 * t, this._context.canvas.height = 2 * r, e() || this._drawBuffer(n, !0)
			}, r.prototype._loop = function() {
				requestAnimationFrame(this._boundLoop);
				var t = this._analyser.getValue();
				this._isSilent(t) ? this._drawBuffer(n, !0) : this._drawBuffer(t, !1)
			}, r.prototype._drawBuffer = function(t, e) {
				var n = this._context,
					r = this._context.canvas.width,
					o = this._context.canvas.height;
				margin = e ? this._scale(this._rms, 0, this._silentThresh, .2 * o, .5 * o) : .2 * o, n.clearRect(0, 0, r, o), n.beginPath();
				for (var i, s = 0, a = t.length; s < a; s++) {
					var u = this._scale(s, 0, a - 1, 0, r),
						f = this._scale(t[s], -1, 1, o - margin, margin);
					0 === s ? (i = f, n.moveTo(u, f)) : n.lineTo(u, f)
				}
				n.lineTo(r, o), n.lineTo(0, o), n.lineTo(0, i), n.lineCap = "round", n.fillStyle = "#22DBC0", n.fill()
			}, r.prototype._isSilent = function(t) {
				for (var e = 0, n = 0; n < t.length; n++) e += Math.pow(t[n], 2);
				var r = Math.sqrt(e / t.length);
				return this._rms = Math.max(r, .9 * this._rms), this._rms < this._silentThresh
			}, r.prototype._scale = function(t, e, n, r, o) {
				return (t - e) / (n - e) * (o - r) + r
			}, r
		}.apply(e, r)) && (t.exports = o)
	}, function(t, e, n) {
		var r;
		void 0 !== (r = function() {
			return function(t) {
				var e, n = new Array(t),
					r = new Array(t),
					o = new Array(t),
					i = new Array(t),
					s = [n, o, i, r];
				for (e = 0; e < t; e++) n[e] = Math.sin(2 * Math.PI * e / t);
				for (e = 0; e < t; e++) o[e] = (e + t / 2) % t / t * 2 - 1;
				for (e = 0; e < t; e++) i[e] = e < t / 3 ? e / (t / 3) * 2 - 1 : e < 2 * t / 3 ? 2 * (1 - (e - t / 3) / (t / 3)) - 1 : (e - 2 * t / 3) / (t / 3) * 2 - 1;
				for (e = 0; e < t; e++) {
					var a = t / 16;
					r[e] = e < a ? -1 : e < t / 2 ? 1 : e < t - a ? -1 : 1
				}
				return {
					sawtooth: o,
					sine: n,
					triangle: i,
					square: r,
					random: s[Math.floor(Math.random() * s.length)]
				}
			}
		}.call(e, n, e, t)) && (t.exports = r)
	}, , , , , , , function(t, e, n) {
		var r, o;
		r = [n(3), n(12)], void 0 !== (o = function(t, e) {
			document.addEventListener("DOMContentLoaded", function(e) {
				var n = new t(document.body);
				window.addEventListener("resize", function() {
					n.resize()
				})
			})
		}.apply(e, r)) && (t.exports = o)
	}, function(t, e, n) {
		var r = n(13);
		"string" == typeof r && (r = [
			[t.i, r, ""]
		]);
		var o = {};
		o.transform = void 0;
		n(1)(r, o);
		r.locals && (t.exports = r.locals)
	}, function(t, e, n) {
		e = t.exports = n(0)(void 0), e.push([t.i, "body,canvas{width:50%;height:100%;position:absolute;top:0;left:0;margin:0;background-color:#f734d7}", ""])
	}])
});