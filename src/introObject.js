import * as THREE from 'three';
import TweenMax from "gsap";

const glslify = require('glslify');

import TyMeshLine from './TyMeshLine';


var colors = [
	0x4cb151,
	0x45b4a1,
	0x4598b6,
	0x4e61d9,
	0x8065c6,
	0xa541b1,
	0xed3983,
	0xf7583a,
	0xf7933d,
	0xf6be37,
	0xf6be37,
	0xd1c12e,
	0x95c531
];


let That;
class introObject extends THREE.Object3D {

	constructor() {
		super();
		That = this;


		this.hand = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(50, 50),
			new THREE.RawShaderMaterial({
				uniforms: {
					map: {
						value: new THREE.TextureLoader().load('./assets/hand.png')
					},
					opacity: {
						value: 1
					}
				},
				vertexShader: glslify('./glsl/card.vert'),
				fragmentShader: glslify('./glsl/card.frag'),
				side: THREE.DoubleSide,
				depthWrite: false,
				depthTest: false,
				transparent: true,
			})
		);

		// this.hand.rotation.y = Math.PI / 2;
		this.hand.position.y = 1.5;
		this.hand.renderOrder = 7;
		this.add(this.hand);

	}

	moveHand(_x, _y) {
		That.hand.position.x = _x+5;
		That.hand.position.y = _y-20;

	}


	drawT(_ps) {

		let curPoints = [];
		let _num = 0;

		let line = new TyMeshLine(64);
		this.add(line);

		line.uniforms.color.value = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
		var texture = new THREE.TextureLoader().load('assets/s.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		line.uniforms.useMap.value = 1;
		line.uniforms.map.value = texture;
		line.uniforms.sizeAttenuation.value = 1;



		draw();

		function draw() {
			if (_num >= _ps._Points.length) return;

			let _x = _ps._Points[_num];
			let _y = _ps._Points[_num + 1];

			curPoints.push(_x, _y, 0);
			line.setPoints(curPoints, "parabolic");

			That.moveHand(_x, _y);


			_num += 2;
			setTimeout(draw, 30);
		}

	}



	removeThis(callback) {}

}

export default introObject;