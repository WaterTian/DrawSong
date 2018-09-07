import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');
import TyCard from './TyCard';
import TyLine from './TyLine';
import fireworks from './fireworks';


let That;
class introObject extends THREE.Object3D {

	constructor() {
		super();
		That = this;

		//要学的字母
		this.TS = [];
		//字母对应识别编号
		this.RecognizerNums = [];


		this.hand = new TyCard(handTexture);
		this.hand.scale.x = this.hand.scale.y = 0.5;
		this.hand.position.y = 1.5;
		this.hand.renderOrder = 7;


		this.add(this.hand);


		this.fw = new fireworks();
		this.add(this.fw);

	}

	moveHand(_x, _y) {
		That.hand.position.x = _x + 5;
		That.hand.position.y = _y - 20;

	}

	drawT(_ps, callback) {
		let _num = 0;

		let _color = colors[Math.floor(Math.random() * colors.length)];
		let line = new TyLine(_color, lineTexture, "parabolic");
		this.add(line);
		this.curLine = line;

		That.hand.show();

		draw();

		function draw() {
			if (_num >= _ps._Points.length) {
				callback();
				
				line.smoothPoints();
				line.shake();
				That.hand.hide();
				///
				line.addEmoji();
				return;
			}

			let _p = new THREE.Vector3(_ps._Points[_num], _ps._Points[_num + 1], 0)
			line.addPoint(_p);

			That.moveHand(_p.x, _p.y);
			_num += 2;
			setTimeout(draw, 20);
		}
	}

	clearT(callback) {

		if (!That.curLine) {
			if (callback) callback();
			return;
		}
		That.curLine.removeThis(function(_that) {
			That.remove(_that);
			if (callback) callback();
		});

	}



	update(dt) {

	}



	removeThis() {
		if (this.hand) this.remove(this.hand);
		if (this.fw) {
			this.fw.removeThis(function() {
				That.remove(That.fw);
			})
		}
	}

}

export default introObject;