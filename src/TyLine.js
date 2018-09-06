import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');

import TyLineMesh from './TyLineMesh';
import TyEmoji from './TyEmoji';



let That;
class TyLine extends THREE.Object3D {

	constructor(_color = 0x000000, _lineTexture = null) {
		super();
		That = this;

		this.lineColor = _color;
		this.order = null; //播放顺序
		this.detune = 0; //音高
		this.audioName = null; //字母
		this.center = []; //中心点


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

	

	setPoints(_points = [], _type = 'none') {

		this.lineMesh.positions = [];
		this.lineMesh.counters = [];

		var minX, minY, maxX, maxY;

		if (_points instanceof Float32Array || _points instanceof Array) {
			for (var j = 0; j < _points.length; j += 3) {
				var c = j / _points.length;
				this.lineMesh.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.lineMesh.positions.push(_points[j], _points[j + 1], _points[j + 2]);
				this.lineMesh.counters.push(c);
				this.lineMesh.counters.push(c);

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

		this.lineMesh.processGeometry(this.lineMesh.getTaperFunction(_type));

	}


	shake() {
		let That = this;

		TweenMax.to(That.position, .5, {
			x: -That.center[0]/4,
			y: -That.center[1]/4,
			z: 300,
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
		this.lineMesh.uniforms.time.value ++;
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