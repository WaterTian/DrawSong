import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');


class TyLineMesh extends THREE.Mesh {

	///_type :none / linear / parabolic / wavy 
	constructor() {
		super();

		this.positions = [];
		this.previous = [];
		this.next = [];
		this.side = [];
		this.width = [];
		this.indices_array = [];
		this.uvs = [];
		this.counters = [];
		this.geometry = new THREE.BufferGeometry();


		//shader
		this.uniforms = {
			time: {
				type: 'f',
				value: 0.0
			},
			wobble: {
				type: 'f',
				value: 0.0
			},
			map: {
				type: 't',
				value: null
			},
			useMap: {
				type: 'f',
				value: 0.0
			},
			alphaMap: {
				type: 't',
				value: null
			},
			useAlphaMap: {
				type: 'f',
				value: 0.0
			},
			color: {
				type: 'c',
				value: new THREE.Color(0x000000)
			},
			opacity: {
				type: 'f',
				value: 1.0
			},
			resolution: {
				type: 'v2',
				value: new THREE.Vector2(1, 1)
			},
			visibility: {
				type: 'f',
				value: 1.0
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
			// depthWrite: false,
			// blending: THREE.AdditiveBlending,
		});
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
		let That = this;

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

export default TyLineMesh;