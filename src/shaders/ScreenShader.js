import * as THREE from 'three';

var glslify = require('glslify');

THREE.ScreenShader = {
	uniforms: {
		u_time: {
			value: 0.0
		},
		u_resolution: {
			value: new THREE.Vector2(window.innerWidth, window.innerHeight)
		},
		u_mouse: {
			value: new THREE.Vector3(0.5, 0.5, 0.0)
		},
		u_texture: {
			value: null
		}
	},
	vertexShader: glslify('../glsl/quad.vert'),
	fragmentShader: glslify('../glsl/effect4.frag')
	// fragmentShader: glslify('../glsl/water2.frag')
};