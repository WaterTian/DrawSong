import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');
import TyLineMesh from './TyLineMesh';
import TyEmoji from './TyEmoji';



let That;
class TyLine extends THREE.Object3D {

	constructor(_color = 0x000000, _lineTexture = null, _type = 'none') {
		super();
		That = this;

		this.lineColor = _color;
		this.type = _type; //_type :none / linear / parabolic / wavy 

		this.order = null; //播放顺序
		this.detune = 0; //音高
		this.audioName = null; //字母
		this.center = []; //中心点

		this.points = []; //构成线的点们
		this.maxPoints = 256; //点上限数


		this.lineMesh = new TyLineMesh();
		this.lineMesh.uniforms.color.value = new THREE.Color(this.lineColor);
		this.lineMesh.uniforms.useMap.value = 1;
		this.lineMesh.uniforms.map.value = _lineTexture;
		// this.lineMesh.uniforms.repeat.value = new THREE.Vector2(1, 1);
		this.add(this.lineMesh);
	}

	///////////
	addEmoji() {
		this.emoji = new TyEmoji(this.lineColor);
		this.add(this.emoji);
		this.emoji.position.x = this.center[0];
		this.emoji.position.y = this.center[1];
	}

	//////////////
	addPoint(_v3) {
		if (this.points.length > this.maxPoints) this.points.shift();
		this.points.push(_v3);
		this.setPoints(this.points);
	}


	setPoints(_points) {
		this.lineMesh.positions = [];
		this.lineMesh.counters = [];

		let minX, minY, maxX, maxY;
		for (let j = 0; j < _points.length; j++) {

			let c = j / _points.length;
			let _x = _points[j].x;
			let _y = _points[j].y;
			let _z = _points[j].z;

			this.lineMesh.positions.push(_x, _y, _z);
			this.lineMesh.positions.push(_x, _y, _z);
			this.lineMesh.counters.push(c);
			this.lineMesh.counters.push(c);

			//tyadd  get min/max point
			if (j == 0) {
				minX = maxX = _x;
				minY = maxY = _y;
			} else {
				if (_x < minX) minX = _x;
				if (_y < minY) minY = _y;
				if (_x > maxX) maxX = _x;
				if (_y > maxY) maxY = _y;
			}
		}

		let cx = minX + (maxX - minX) / 2;
		let cy = minY + (maxY - minY) / 2;
		this.center = [cx, cy];
		this.lineMesh.processGeometry(this.lineMesh.getTaperFunction(this.type));
	}

	smoothPoints() {
		let _curve = new THREE.CatmullRomCurve3(this.points);
		this.points = _curve.getPoints(this.maxPoints); //250
		this.setPoints(this.points);
	}


	shake() {
		let That = this;

		TweenMax.to(That.position, .5, {
			x: -That.center[0] / 5,
			y: -That.center[1] / 5,
			z: 200,
			ease: Elastic.easeOut
		});
		TweenMax.to(That.position, 1, {
			x: 0,
			y: 0,
			z: 0,
			delay: .5,
			ease: Linear.easeNone
		});
		// TweenMax.to(That.scale, .5, {
		// 	x: 1.25,
		// 	y: 1.25,
		// 	ease: Elastic.easeOut
		// });
		// TweenMax.to(That.scale, 1, {
		// 	x: 1,
		// 	y: 1,
		// 	delay: .5,
		// 	ease: Linear.easeNone
		// });


		TweenMax.to(That.lineMesh.uniforms.wobble, 0.5, {
			value: 20,
			ease: Strong.easeOut
		});
		TweenMax.to(That.lineMesh.uniforms.wobble, 1.5, {
			value: 0,
			delay: .5,
			ease: Linear.easeNone
		});


		TweenMax.to(That.lineMesh.uniforms.colorAdd, .5, {
			value: 1.36,
			ease: Elastic.easeOut
		});
		TweenMax.to(That.lineMesh.uniforms.colorAdd, .5, {
			value: 1.1,
			delay: .5,
		});


		///emoji sing
		if (That.emoji) That.emoji.sing();
	}


	update(_time) {
		this.lineMesh.uniforms.time.value++;
	}


	removeThis(callback) {
		TweenMax.to(this.lineMesh.uniforms.visibility, .4, {
			value: 0,
			onComplete: function() {
				callback(That);
			}
		});

		///remove emoji
		if (this.emoji) this.remove(this.emoji);
	}
}

export default TyLine;