import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');
import TyCard from './TyCard';


let That;
class TyEmoji extends THREE.Object3D {

	constructor(initCallback = null) {
		super();
		That = this;

		this.initCallback = initCallback;


		var startAssets = ['./assets/eye_l0.png', './assets/eye_r0.png'];
		var startTex = [];

		this.loadedTexs(startAssets, startTex, () => {

			That.eyeLTexs = [startTex[0]];
			That.eyeL = new TyCard(startTex[0],0xff00ff);
			That.eyeL.scale.x = That.eyeL.scale.y = 0.5;
			That.eyeL.position.x = -50;
			// That.eyeL.position.y = 1.5;
			That.eyeL.renderOrder = 7;
			That.add(That.eyeL);

			That.eyeRTexs = [startTex[1]];
			That.eyeR = new TyCard(startTex[1],0xff00ff);
			That.eyeR.scale.x = That.eyeR.scale.y = 0.5;
			That.eyeR.position.x = 50;
			// That.eyeR.position.y = 1.5;
			That.eyeR.renderOrder = 7;
			That.add(That.eyeR);


			if (That.initCallback) That.initCallback();

			That.loadMotions();
			That.updateFrame();

		});
	}


	loadMotions() {
		this.eyeLNum = 0;
		this.loadedTexFrames('eye_l', 3, this.eyeLTexs);

		this.eyeRNum = 0;
		this.loadedTexFrames('eye_r', 3, this.eyeRTexs);
	}


	updateFrame() {
		if (!That) return;

		setTimeout(That.updateFrame, 100);

		if (That.eyeLNum >= That.eyeLTexs.length) That.eyeLNum = 0;
		That.eyeL.setMap(That.eyeLTexs[That.eyeLNum]);
		That.eyeLNum++;

		if (That.eyeRNum >= That.eyeRTexs.length) That.eyeRNum = 0;
		That.eyeR.setMap(That.eyeRTexs[That.eyeRNum]);
		That.eyeRNum++;

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
					console.log("intro_completeLoad");
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
					console.log("completeLoad " + name);
				}
			})
		}
	}



}

export default TyEmoji;