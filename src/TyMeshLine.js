import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');

import TyEmoji from './TyEmoji';

let That;
class TyMeshLine extends THREE.Mesh {

	///_type :none / linear / parabolic / wavy 
	constructor(_width = 10, _color = 0x000000) {
		super();
		That = this;

		this.lineWidth = _width;
		this.lineColor = _color;
		this.random = Math.random();
		this.order = null; //播放顺序
		this.detune = 0; //音高
		this.audioName = null; //字母

		this.positions = [];

		this.previous = [];
		this.next = [];
		this.side = [];
		this.width = [];
		this.indices_array = [];
		this.uvs = [];
		this.counters = [];
		this.geometry = new THREE.BufferGeometry();

		this.center = [];



		//shader

		this.uniforms = {
			lineWidth: {
				type: 'f',
				value: this.lineWidth
			},
			map: {
				type: 't',
				value: null
			},
			useMap: {
				type: 'f',
				value: 0
			},
			alphaMap: {
				type: 't',
				value: null
			},
			useAlphaMap: {
				type: 'f',
				value: 0
			},
			color: {
				type: 'c',
				value: new THREE.Color(this.lineColor)
			},
			opacity: {
				type: 'f',
				value: 1
			},
			resolution: {
				type: 'v2',
				value: new THREE.Vector2(1, 1)
			},
			sizeAttenuation: {
				type: 'f',
				value: 0
			},
			visibility: {
				type: 'f',
				value: 1
			},
			alphaTest: {
				type: 'f',
				value: 0.001
			},
			repeat: {
				type: 'v2',
				value: new THREE.Vector2(1, 1)
			},
			colorAdd: {
				type: 'f',
				value: 1.1
			}
		}



		this.material = new THREE.RawShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: glslify('./glsl/line.vert'),
			fragmentShader: glslify('./glsl/line.frag'),
			transparent: true,
			side: THREE.DoubleSide,
			// wireframe: true,
			depthWrite: false,
			// blending: THREE.AdditiveBlending,
		});
	}


	setPoints(_points = [], _type = 'none') {

		this.positions = [];
		this.counters = [];

		var minX, minY, maxX, maxY;

		if (_points instanceof Float32Array || _points instanceof Array) {
			for (var j = 0; j < _points.length; j += 3) {

				var c = j / _points.length;
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.counters.push(c);
				this.counters.push(c);

				//tyadd
				if (j == 0) {
					minX = maxX = _points[j];
					minY = maxY = _points[j + 1];
				} else {
					if (_points[j] < minX) minX = _points[j];
					if (_points[j + 1] < minY) minY = _points[j + 1];

					if (_points[j] > maxX) maxX = _points[j];
					if (_points[j + 1] > maxY) maxY = _points[j + 1];
				}
			}

			var cx = minX + (maxX - minX) / 2;
			var cy = minY + (maxY - minY) / 2;
			this.center = [cx, cy];

		} else {
			console.log("input points with Float32Array or Array");
		}

		this.processGeometry(this.getTaperFunction(_type));

	}

	///////////
	///
	addEmoji() {
		this.emoji = new TyEmoji(That.lineColor);
		this.add(this.emoji);
		this.emoji.position.x = That.center[0];
		this.emoji.position.y = That.center[1];

	}


	removeThis(callback) {
		TweenMax.to(this.uniforms.visibility, .3, {
			value: 0,
			onComplete: function() {
				callback(That);
			}
		});
		TweenMax.to(this.position, .3, {
			z: -300
		});

		///remove emoji
		if (this.emoji) this.remove(this.emoji);
	}

	shake() {
		TweenMax.to(this.position, .5, {
			z: 50,
			ease: Elastic.easeOut
		});
		TweenMax.to(this.position, 1, {
			z: 0,
			delay: .6,
			ease: Linear.easeNone
		});

		TweenMax.to(this.uniforms.colorAdd, .5, {
			value: 1.36,
			ease: Elastic.easeOut
		});
		TweenMax.to(this.uniforms.colorAdd, .5, {
			value: 1.1,
			delay: .5,
		});

		///emoji sing
		if (this.emoji) this.emoji.sing();

	}

	updateWidth(_time) {
		this.uniforms.lineWidth.value = this.lineWidth * (1 + .15 * Math.sin(.002 * _time + this.random * 10));
	}



	///////
	smoothLine(oldVerts) {
		var newVerts = [];
		oldVerts.every(function(v, i) {
			newVerts.push(v);
			if (i == oldVerts.length - 1) {
				return true;
			}
			var point0 = oldVerts[i === 0 ? i : i - 1];
			var point1 = v;
			var point2 = oldVerts[i > oldVerts.length - 2 ? oldVerts.length - 1 : i + 1];
			var point3 = oldVerts[i > oldVerts.length - 3 ? oldVerts.length - 1 : i + 2];
			var distance = distancePoint(point1, point2);
			var segments = Math.floor(distance / _smoothDistance);
			for (var i = 1; i < segments; i++) {
				var weight = i / segments;
				newVerts.push(new THREE.Vector3(THREE.CurveUtils.interpolate(point0.x, point1.x, point2.x, point3.x, weight), THREE.CurveUtils.interpolate(point0.y, point1.y, point2.y, point3.y, weight), 0));
				newVerts[newVerts.length - 1].velocity = point1.velocity * (1 - weight) + point2.velocity * weight
			}
			return true;
		});
		return newVerts
	}
	distancePoint(v1, v2, noSq) {
		var dx = v1.x - v2.x;
		var dy = v1.y - v2.y;
		var dz = v1.z - v2.z;
		if (!noSq) {
			return Math.sqrt(dx * dx + dy * dy + dz * dz)
		}
		return dx * dx + dy * dy + dz * dz
	}


	processGeometry(_Taper) {

		var l = this.positions.length / 6;

		this.previous = [];
		this.next = [];
		this.side = [];
		this.width = [];
		this.indices_array = [];
		this.uvs = [];

		for (var j = 0; j < l; j++) {
			this.side.push(1);
			this.side.push(-1);
		}

		var w;
		for (var j = 0; j < l; j++) {
			if (_Taper) w = _Taper(j / (l - 1));
			else w = 1;
			this.width.push(w);
			this.width.push(w);
		}

		for (var j = 0; j < l; j++) {
			this.uvs.push(j / (l - 1), 0);
			this.uvs.push(j / (l - 1), 1);
		}

		var v;

		if (this.compareV3(0, l - 1)) {
			v = this.copyV3(l - 2);
		} else {
			v = this.copyV3(0);
		}
		this.previous.push(v[0], v[1], v[2]);
		this.previous.push(v[0], v[1], v[2]);
		for (var j = 0; j < l - 1; j++) {
			v = this.copyV3(j);
			this.previous.push(v[0], v[1], v[2]);
			this.previous.push(v[0], v[1], v[2]);
		}

		for (var j = 1; j < l; j++) {
			v = this.copyV3(j);
			this.next.push(v[0], v[1], v[2]);
			this.next.push(v[0], v[1], v[2]);
		}

		if (this.compareV3(l - 1, 0)) {
			v = this.copyV3(1);
		} else {
			v = this.copyV3(l - 1);
		}
		this.next.push(v[0], v[1], v[2]);
		this.next.push(v[0], v[1], v[2]);


		// index Of Face
		for (var j = 0; j < l - 1; j++) {
			var n = j * 2;
			this.indices_array.push(n, n + 1, n + 2);
			this.indices_array.push(n + 2, n + 1, n + 3);
		}



		this.attributes = {
			position: new THREE.BufferAttribute(new Float32Array(this.positions), 3),
			previous: new THREE.BufferAttribute(new Float32Array(this.previous), 3),
			next: new THREE.BufferAttribute(new Float32Array(this.next), 3),
			side: new THREE.BufferAttribute(new Float32Array(this.side), 1),
			width: new THREE.BufferAttribute(new Float32Array(this.width), 1),
			uv: new THREE.BufferAttribute(new Float32Array(this.uvs), 2),
			index: new THREE.BufferAttribute(new Uint16Array(this.indices_array), 1),
			counters: new THREE.BufferAttribute(new Float32Array(this.counters), 1)
		}

		this.geometry.addAttribute('position', this.attributes.position);
		this.geometry.addAttribute('previous', this.attributes.previous);
		this.geometry.addAttribute('next', this.attributes.next);
		this.geometry.addAttribute('side', this.attributes.side);
		this.geometry.addAttribute('width', this.attributes.width);
		this.geometry.addAttribute('uv', this.attributes.uv);
		this.geometry.addAttribute('counters', this.attributes.counters);

		this.geometry.setIndex(this.attributes.index);
	}

	getTaperFunction(_type) {
		switch (_type) {
			case 'none':
				return null;
				break;
			case 'linear':
				return function(p) {
					return 1 - p;
				};
				break;
			case 'parabolic':
				return function(p) {
					return 1 * That.parabola(p, 1)
				};
				break;
			case 'wavy':
				return function(p) {
					return 2 + Math.sin(p)
				};
				break;
		}
	}


	compareV3(a, b) {
		var aa = a * 6;
		var ab = b * 6;
		return (this.positions[aa] === this.positions[ab]) && (this.positions[aa + 1] === this.positions[ab + 1]) && (this.positions[aa + 2] === this.positions[ab + 2]);
	}

	copyV3(a) {
		var aa = a * 6;
		return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];
	}
	parabola(x, k) {
		return Math.pow(4 * x * (1 - x), k);
	}
}

export default TyMeshLine;