import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');
import TyCard from './TyCard';


let That;
class TyEmoji extends THREE.Object3D {

	constructor(_color = 0xcdcdcd) {
		super();
		That = this;

		this.eyeColor = new THREE.Color(_color).multiplyScalar(0.6);

		this.eyeLTexs = [];
		this.eyeRTexs = [];
		this.mouthTexs = [];

		this.isSing = false;
		this.isLoadComplete= false;


		var startAssets = ['./assets/eye_l0.png', './assets/eye_r0.png', './assets/mouth0.png'];
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

			That.mouthTexs = [startTex[2]];
			That.mouth = new TyCard(startTex[2], That.eyeColor);
			That.mouth.scale.x = That.mouth.scale.y = 0.15;
			That.mouth.position.y = -15;
			That.mouth.renderOrder = 7;


			That.loadMotions(() => {
				That.isLoadComplete= true;
				That.blink();
				That.sing();
			});

		});
	}


	loadMotions(onComplete = null) {
		let That = this;
		That.eyeLNum = 0;
		That.eyeRNum = 0;
		That.loadedTexFrames('eye_l', 6, That.eyeLTexs, () => {
			That.loadedTexFrames('eye_r', 6, That.eyeRTexs, () => {
				That.loadedTexFrames('mouth', 12, That.mouthTexs, () => {
					if (onComplete) onComplete();
				});
			});
		});


	}


	sing() {
		let That = this;
		let _part = Math.floor(Math.random() * 4);
		let _frameNum = _part * 3;

		if(!That.isLoadComplete) return;

		That.add(That.mouth);
		That.mouth.setMap(That.mouthTexs[_frameNum]);

		setTimeout(()=>{
			That.mouth.setMap(That.mouthTexs[_frameNum+1]);
		}, 260);
		setTimeout(()=>{
			That.mouth.setMap(That.mouthTexs[_frameNum+2]);
		}, 320);
		setTimeout(() => {
			That.remove(That.mouth);
		}, 380);


		That.isSing = true;
		let _eyeCloseNum = 2 + Math.floor(Math.random() * 2)*3;
		That.eyeL.setMap(That.eyeLTexs[_eyeCloseNum]);
		That.eyeR.setMap(That.eyeRTexs[_eyeCloseNum]);
		setTimeout(() => {
			That.isSing = false;
			That.eyeL.setMap(That.eyeLTexs[0]);
			That.eyeR.setMap(That.eyeRTexs[0]);
		}, 300);
	}


	blink() {
		let That = this;

		That.blinkId = setTimeout(function() {
			That.blink(That);
		}, 4000 + Math.random() * 6000);

		let _part = Math.floor(Math.random() * 2) + 1;

		updateFrame();

		function updateFrame() {
			if (That.eyeLNum == _part * 3) That.eyeLNum = That.eyeRNum = (_part - 1) * 3;
			else setTimeout(updateFrame, 70);

			if (That.eyeLNum >= That.eyeLTexs.length) That.eyeLNum = 0;
			if(!That.isSing)That.eyeL.setMap(That.eyeLTexs[That.eyeLNum]);
			That.eyeLNum++;

			if (That.eyeRNum >= That.eyeRTexs.length) That.eyeRNum = 0;
			if(!That.isSing)That.eyeR.setMap(That.eyeRTexs[That.eyeRNum]);
			That.eyeRNum++;
		}
	}



	loadedTexs(assets, textureArr, callBack) {
		let loader = new THREE.TextureLoader();
		let _num = 0;
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

	loadedTexFrames(name, frames, pics, callBack) {
		let loader = new THREE.TextureLoader();
		let _num = 0;
		loadAssets();

		function loadAssets() {
			loader.load('./assets/' + name + _num + '.png', (texture) => {
				pics[_num] = texture;
				_num++;
				if (_num < frames) loadAssets();
				else {
					// console.log("completeLoad " + name);
					if (callBack) callBack();
				}
			})
		}
	}

}

export default TyEmoji;