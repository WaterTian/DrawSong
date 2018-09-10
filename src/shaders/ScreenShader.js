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
		u_range: {
			value: 1.0
		},
		u_texture: {
			value: null
		}
	},
	vertexShader: glslify('../glsl/quad.vert'),
	fragmentShader: glslify('../glsl/effectRgb2.frag')
	// fragmentShader: glslify('../glsl/water2.frag')
};