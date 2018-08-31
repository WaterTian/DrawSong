import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');
import TyCard from './TyCard';


let That;
class TyEmoji extends THREE.Object3D {

	constructor(_color = 0xcdcdcd) {
		super();
		That = this;

		this.eyeColor =  new THREE.Color(_color).multiplyScalar(0.6);


		var startAssets = ['./assets/eye_l0.png', './assets/eye_r0.png'];
		var startTex = [];

		this.loadedTexs(startAssets, startTex, () => {

			That.eyeLTexs = [startTex[0]];
			That.eyeL = new TyCard(startTex[0], That.eyeColor);
			That.eyeL.scale.x = That.eyeL.scale.y = 0.1;
			That.eyeL.position.x = -15;
			That.eyeL.position.y = 15;
			That.eyeL.renderOrder = 7;
			That.add(That.eyeL);

			That.eyeRTexs = [startTex[1]];
			That.eyeR = new TyCard(startTex[1], That.eyeColor);
			That.eyeR.scale.x = That.eyeR.scale.y = 0.1;
			That.eyeR.position.x = 15;
			That.eyeR.position.y = 15;
			That.eyeR.renderOrder = 7;
			That.add(That.eyeR);



			That.loadMotions();
			That.blink(That);

		});
	}


	loadMotions() {
		this.eyeLNum = 0;
		this.loadedTexFrames('eye_l', 6, this.eyeLTexs);

		this.eyeRNum = 0;
		this.loadedTexFrames('eye_r', 6, this.eyeRTexs);
	}


	blink(_this) {
		let That = _this;

		That.blinkId = setTimeout(function(){
			That.blink(That);
		}, 2000 + Math.random() * 2000);
		let _part = Math.floor(Math.random() * 2) + 1;

		// console.log("blink " + _part);

		updateFrame();
		function updateFrame() {
			if (That.eyeLNum == _part * 3) That.eyeLNum = That.eyeRNum = (_part - 1) * 3;
			else setTimeout(updateFrame, 80);

			if (That.eyeLNum >= That.eyeLTexs.length) That.eyeLNum = 0;
			That.eyeL.setMap(That.eyeLTexs[That.eyeLNum]);
			That.eyeLNum++;

			if (That.eyeRNum >= That.eyeRTexs.length) That.eyeRNum = 0;
			That.eyeR.setMap(That.eyeRTexs[That.eyeRNum]);
			That.eyeRNum++;
		}

	}



	loadedTexs(assets, textureArr, callBack) {
		var loader = new THREE.TextureLoader();
		var _num = 0;
		loadAssets();

		function loadAssets() {
			loader.load(assets[_num], (texture) => {
				textureArr[_num] = texture;
				_num++;
				if (_num < assets.length) loadAssets();
				else {
					console.log("emoji_completeLoad");
					callBack();
				}
			})
		}
	}

	loadedTexFrames(name, frames, pics) {
		var loader = new THREE.TextureLoader();
		var _num = 0;
		loadAssets();

		function loadAssets() {
			loader.load('./assets/' + name + _num + '.png', (texture) => {
				pics[_num] = texture;
				_num++;
				if (_num < frames) loadAssets();
				else {
					// console.log("completeLoad " + name);
				}
			})
		}
	}

}

export default TyEmoji;