import * as THREE from 'three';
const glslify = require('glslify');


let That;
class TyMeshLine extends THREE.Mesh {

	///_type :none / linear / parabolic / wavy 
	constructor(_points = [], _type = 'none') {
		super();
		That = this;


		this.positions = [];

		this.previous = [];
		this.next = [];
		this.side = [];
		this.width = [];
		this.indices_array = [];
		this.uvs = [];
		this.counters = [];
		this.geometry = new THREE.BufferGeometry();


		if (_points instanceof Float32Array || _points instanceof Array) {
			for (var j = 0; j < _points.length; j += 3) {
				var c = j / _points.length;
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.counters.push(c);
				this.counters.push(c);
			}
		} else {
			console.log("input points with Float32Array or Array");
		}

		this.processGeometry(this.getTaperFunction(_type));



		//shader

		this.uniforms = {
			lineWidth: {
				type: 'f',
				value: 1
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
				value: new THREE.Color(0xffffff)
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
				value: 1
			},
			dashArray: {
				type: 'f',
				value: 0
			},
			dashOffset: {
				type: 'f',
				value: 0
			},
			dashRatio: {
				type: 'f',
				value: 0.5
			},
			useDash: {
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
			}
		}


		this.material = new THREE.RawShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: glslify('./glsl/line.vert'),
			fragmentShader: glslify('./glsl/line.frag'),

			transparent: true,
			// side: THREE.DoubleSide,
			// wireframe: true,
			depthWrite: false,
			// blending: THREE.AdditiveBlending,
		});
	}


	setPoints(_points = [], _type = 'none'){

		this.positions = [];
		this.counters = [];


		if (_points instanceof Float32Array || _points instanceof Array) {
			for (var j = 0; j < _points.length; j += 3) {
				var c = j / _points.length;
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.counters.push(c);
				this.counters.push(c);
			}
		} else {
			console.log("input points with Float32Array or Array");
		}

		this.processGeometry(this.getTaperFunction(_type));

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
					return 1 * Maf.parabola(p, 1)
				};
				break;
			case 'wavy':
				return function(p) {
					return 2 + Math.sin(50 * p)
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

}

export default TyMeshLine;