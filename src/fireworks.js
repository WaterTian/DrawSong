import * as THREE from 'three';
import TweenMax from "gsap";

const glslify = require('glslify');



let That;
class fireworks extends THREE.Object3D {

	constructor() {
		super();
		That = this;



		// geometry
		let vector = new THREE.Vector4();
		let triangles = 1;
		let instances = 3000;
		let positions = [];
		let offsets = [];
		let colors = [];
		let orientationsStart = [];
		let orientationsEnd = [];
		positions.push(0.25, -0.25, 0);
		positions.push(-0.25, 0.25, 0);
		positions.push(0, 0, 0.25);
		// instanced attributes
		for (let i = 0; i < instances; i++) {
			// offsets
			offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
			// colors
			colors.push(Math.random(), Math.random(), Math.random(), Math.random());
			// orientation start
			vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			vector.normalize();
			orientationsStart.push(vector.x, vector.y, vector.z, vector.w);
			// orientation end
			vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			vector.normalize();
			orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);
		}
		let geometry = new THREE.InstancedBufferGeometry();
		geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
		geometry.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
		geometry.addAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4));
		geometry.addAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4));


		this.uniforms = {
			opacity: {
				value: 0
			},
			sineTime: {
				value: 0.0
			}
		}

		this.obj = new THREE.Mesh(
			geometry,
			new THREE.RawShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: glslify('./glsl/fireworks.vert'),
				fragmentShader: glslify('./glsl/fireworks.frag'),
				side: THREE.DoubleSide,
				// depthWrite: false,
				// depthTest: false,
				transparent: true,
				// wireframe: true,
			})
		);
		this.add(this.obj);

		this.obj.position.z = -100;

	}

	open() {

		this.obj.position.z = 0;
		this.uniforms.opacity.value = 0;
		this.uniforms.sineTime.value = 0;

		TweenMax.to(this.obj.position, 1, {
			z: 950,
			ease: Strong.easeOut,
		});

		TweenMax.to(this.uniforms.opacity, 2, {
			value: 1,
			ease: Strong.easeOut,
		});
		TweenMax.to(this.uniforms.opacity, 2, {
			value: 0,
			delay: 2,
			ease: Linear.easeNone,
		});

		TweenMax.to(this.uniforms.sineTime, 4, {
			value: 100,
			ease: Strong.easeOut,
			delay: .3,
		});


	}



	update(dt) {

	}



	removeThis(callback) {
		TweenMax.to(this.uniforms.opacity, 1, {
			value: 0,
			onComplete:callback,
		});
	}

}

export default fireworks;