import * as THREE from 'three';
import TweenMax from "gsap";
import Stats from 'stats.js';
import dat from 'dat-gui';
import VConsole from 'vconsole';
import OrbitContructor from 'three-orbit-controls';
import Tone from 'Tone';


import TyAudio from './TyAudio';
import TyLine from './TyLine';
import TyRecognizer from './TyRecognizer';
import introObject from './introObject';


const OrbitControls = OrbitContructor(THREE);
const glslify = require('glslify');
const Recognizer = new TyRecognizer();

const StartAudioContext = require('./StartAudioContext.js');

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
window.floatType = isMobile ? THREE.HalfFloatType : THREE.FloatType;


var That;
var time = 0;
var zoom = 0;

var cw = window.innerWidth;
var ch = window.innerHeight;

var _isDown = false;
var maxPoints = 256;

var maxLinesNum = isMobile ? 21 : 24;

var firstTimeEver = true;

var euler = new THREE.Euler();
var q0 = new THREE.Quaternion();
var orientationScale = {
	value: 1
};


var isPlaying = false;
var curPlayNum = 0;
var isIntro = false;



window.colors = [
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

window.lineTexture = new THREE.TextureLoader().load('assets/s.jpg');
lineTexture.wrapS = THREE.RepeatWrapping;
lineTexture.wrapT = THREE.RepeatWrapping;

window.handTexture = new THREE.TextureLoader().load('assets/hand.png');


class linesScene {

	constructor() {
		That = this;

		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.container = document.getElementById('webglContainer');
		this.init();


		//mobile start
		if (isMobile) {
			var element = $("<div>", {
				"id": "MobileStart"
			}).appendTo("body");
			var button = $("<div>").attr("id", "Button").text("Enter").appendTo(element);

			StartAudioContext(Tone.context, element, function() {
				element.remove();
				That.initUnit();
			});
		} else {

			That.initUnit();
		}
	}


	initUnit() {

		let btn1 = document.getElementById('unitBtn1');
		btn1.addEventListener('click', function() {
			console.log("unit1");

			document.querySelector(".unit").style.display = "none";

			That.tyAudio = new TyAudio('abc');
			That.initIntro('abc', [0, 2, 4]);

		});

		let btn2 = document.getElementById('unitBtn2');
		btn2.addEventListener('click', function() {
			console.log("unit2");

			document.querySelector(".unit").style.display = "none";

			That.tyAudio = new TyAudio('ovs');
			That.initIntro('ovs', [9, 10, 11]);
		});

	}



	init() {
		this.camera;
		this.scene;
		this.groundMaterial;
		this.mesh;


		this.scene = new THREE.Scene();


		// init renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
			preserveDrawingBuffer: true,
		});

		console.log(window.devicePixelRatio);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(cw, ch);
		this.renderer.setClearColor(0xffffff);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.shadowMap.enabled = true;
		this.container.appendChild(this.renderer.domElement);


		//
		this.raycaster = new THREE.Raycaster();
		this.raycasterPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(cw * 2, ch * 2, 3, 3), new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide,
			wireframe: true,
		}));
		this.raycasterPlane.material.visible = false;
		this.scene.add(this.raycasterPlane);



		this.camera1 = new THREE.PerspectiveCamera(40, cw / ch, 1, 1500);
		this.camera1.position.set(0, 0, 1000);
		this.scene.add(this.camera1);
		this.camera = this.camera1;
		

		// var helper1 = new THREE.CameraHelper(this.camera1);
		// this.scene.add(helper1);

		// this.camera0 = new THREE.PerspectiveCamera(60, cw / ch, 1, 20000);
		// this.camera0.position.set(0, 0, 1000);
		// this.scene.add(this.camera0);
		// this.camera = this.camera0;
		// // controls
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.update();


		window.addEventListener('resize', this.onWindowResized);
		this.onWindowResized();
		// if (window.DeviceOrientationEvent) window.addEventListener("deviceorientation", this.onOrientation);


		time = Date.now();
		this.animate();

	}

	onWindowResized() {
		cw = That.container.clientWidth;
		ch = That.container.clientHeight;

		That.renderer.setSize(cw, ch);

		That.camera.aspect = cw / ch;
		That.camera.updateProjectionMatrix();

		// var dPR = window.devicePixelRatio;
		// if (this.effect) this.effect.uniforms['u_resolution'].value.set(w * dPR, h * dPR);
	}
	onOrientation(event) {
		var alpha = event.alpha ? THREE.Math.degToRad(event.alpha) : 0; // Z
		var beta = event.beta ? THREE.Math.degToRad(event.beta) : 0; // X'
		var gamma = event.gamma ? THREE.Math.degToRad(event.gamma) : 0; // Y''
		var orient = event.screenOrientation ? THREE.Math.degToRad(event.screenOrientation) : 0; // O


		if (event.gamma < 0) {
			euler.set((-gamma - Math.PI * 0.2) * 0.5 * orientationScale.value, beta * 0.4 * orientationScale.value, 0, 'YXZ');
		}

		// q0.setFromEuler(euler);
		// if (That.linesObj) That.linesObj.quaternion.slerp(q0, 0.3);
	}



	/////////////////////////////init

	initIntro(_ts, _rNs) {

		isIntro = true;

		That.intro = new introObject();
		That.scene.add(That.intro);

		That.introT = '';

		That.intro.TS = _ts.split("");
		That.intro.RecognizerNums = _rNs;


		That.initLine();
		/////////////////////////////////// skip
		// That.initIntro1();
		That.removeIntro();
	}

	initIntro1() {
		That.clearAllMuisc();
		let _ps = Recognizer.Unistrokes[That.intro.RecognizerNums[0]];
		let _nt = That.intro.TS[0];

		That.intro.clearT(function() {
			That.intro.drawT(_ps, function() {
				That.tyAudio.play(_nt, 2);
				That.introT = _nt;
			});
		});

	}
	initIntro2() {
		That.clearAllMuisc();
		let _ps = Recognizer.Unistrokes[That.intro.RecognizerNums[1]];
		let _nt = That.intro.TS[1];

		That.intro.clearT(function() {
			That.intro.drawT(_ps, function() {
				That.tyAudio.play(_nt, 2);
				That.introT = _nt;
			});
		});
	}
	initIntro3() {
		That.clearAllMuisc();
		let _ps = Recognizer.Unistrokes[That.intro.RecognizerNums[2]];
		let _nt = That.intro.TS[2];

		That.intro.clearT(function() {
			That.intro.drawT(_ps, function() {
				That.tyAudio.play(_nt, 2);
				That.introT = _nt;
			});
		});
	}
	removeIntro() {
		isIntro = false;
		That.clearAllMuisc();
		That.intro.clearT(function() {
			That.intro.removeThis();
		});


		That.initUI();
	}


	initLine() {

		this.lines = [];
		this.curLine = null;
		this.linesObj = new THREE.Object3D();
		this.scene.add(this.linesObj);

		// let curPoints = [0, 0, 0, -cw / 2, 0, 0, -cw / 2, ch / 2, 0, 0, ch / 2, 0, 0, 0, 0];
		// this.addLine();
		// this.curLine.setPoints(curPoints);
		if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
			this.renderer.domElement.addEventListener("touchstart", (e) => {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				e = e.targetTouches[0];
				That.drawStart(e);
			}, false);
			this.renderer.domElement.addEventListener("touchmove", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.drawMove(e.changedTouches[0]);
			}, false);
			this.renderer.domElement.addEventListener("touchend", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.drawEnd();
			}, false);
			this.renderer.domElement.addEventListener("touchcancel", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				_isDown = false;
			}, false);
		} else {
			document.addEventListener("mouseup", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.drawEnd();
			}, false);
			document.addEventListener("mousedown", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.drawStart(e);
			}, false);
			document.addEventListener("mousemove", function(e) {
				e.preventDefault();
				That.drawMove(e);
			}, false);
		}
	}


	drawStart(e) {
		if (firstTimeEver) {
			firstTimeEver = false;
		}

		let _color = colors[Math.floor(Math.random() * colors.length)];
		//////
		let line = new TyLine(_color, lineTexture, "parabolic");
		That.linesObj.add(line);
		That.lines.push(line);
		That.curLine = line;

		_isDown = true;
	}

	drawMove(e) {
		if (_isDown) {
			var x = e.clientX / cw * 2 - 1;
			var y = -e.clientY / ch * 2 + 1;
			var mouse = new THREE.Vector2(x, y);
			That.raycaster.setFromCamera(mouse, That.camera);

			var intersects = That.raycaster.intersectObject(That.raycasterPlane);
			if (intersects.length > 0) {
				// console.log(intersects[0].point);
				// addPoint
				That.curLine.addPoint(intersects[0].point);
			}
		}
	}

	//////////////////////
	///
	///
	//////////////////////
	drawEnd() {
		_isDown = false;
		console.log("drawEnd");

		if (That.curLine.points.length == 0) return;

		var linePs = [];
		for (var i = 0; i < That.curLine.points.length; i += 3) {
			linePs.push(That.curLine.points[i].x);
			linePs.push(That.curLine.points[i].y);
		}

		var result = Recognizer.Recognize(linePs, true);
		console.log(result);

		That.curLine.detune = Math.floor((That.curLine.center[1] / ch + 0.5) * 10);
		That.curLine.order = Math.floor((That.curLine.center[0] / cw + 0.5) * 14);

		if (That.curLine.detune < 1) That.curLine.detune = 1;
		if (That.curLine.detune > 8) That.curLine.detune = 8;
		That.curLine.detune--;

		if (That.curLine.order < 1) That.curLine.order = 1;
		if (That.curLine.order > 12) That.curLine.order = 12;
		That.curLine.order--;

		console.log("order " + That.curLine.order);

		let useT = !document.getElementById('useT').checked;

		/////
		That.curLine.smoothPoints();


		// Intro 
		if (isIntro) {
			// 识别出
			if (result.Score > 2) {
				That.curLine.audioName = result.Name;

				if (That.introT == That.intro.TS[0] && result.Name == That.intro.TS[0]) {
					That.tyAudio.play(That.curLine.audioName, That.curLine.detune);
					That.intro.fw.open();
					That.tyAudio.playWin();
					setTimeout(That.initIntro2, 1200);

				} else if (That.introT == That.intro.TS[1] && result.Name == That.intro.TS[1]) {
					That.tyAudio.play(That.curLine.audioName, That.curLine.detune);
					That.intro.fw.open();
					That.tyAudio.playWin();
					setTimeout(That.initIntro3, 1200);

				} else if (That.introT == That.intro.TS[2] && result.Name == That.intro.TS[2]) {
					That.tyAudio.play(That.curLine.audioName, That.curLine.detune);
					That.intro.fw.open();
					That.tyAudio.playWin();
					setTimeout(That.removeIntro, 1200);

				} else {

					//识别出 ABC 以外的字母
					That.tyAudio.playBase(That.curLine.detune);

					if (That.introT == That.intro.TS[0]) That.initIntro1();
					if (That.introT == That.intro.TS[1]) That.initIntro2();
					if (That.introT == That.intro.TS[2]) That.initIntro3();

				}
			}
			// 未识别出
			else {
				That.tyAudio.playBase(That.curLine.detune);

				if (That.introT == That.intro.TS[0]) That.initIntro1();
				if (That.introT == That.intro.TS[1]) That.initIntro2();
				if (That.introT == That.intro.TS[2]) That.initIntro3();

			}

		}
		// Scene
		else {
			// 识别字母
			if (useT) {
				// 识别出
				if (result.Score > 2) {
					That.curLine.audioName = result.Name;

					/// 是否当节课的字母 否则播base 不添加表情
					let _playAble = That.tyAudio.play(That.curLine.audioName, That.curLine.detune);
					if (_playAble) That.curLine.addEmoji();
				}
				// 未识别出
				else {
					That.tyAudio.playBase(That.curLine.detune);
				}
			}
			// 不识别字母 
			else {
				// 不识别字母直接播放木琴
				That.tyAudio.playMarimba(That.curLine.detune);
			}
		}


		// 抖动
		That.curLine.shake();

		if (That.lines.length > maxLinesNum) {

			That.lines[0].removeThis(function() {
				That.linesObj.remove(That.lines[0]);
				That.lines.shift();
			});
		}

	}



	animate() {
		let newTime = Date.now();
		requestAnimationFrame(this.animate.bind(this));
		this.render(newTime - time);
		time = newTime;

		if (That.intro) {
			// That.intro.rotation.y+=0.03;
		}

	}


	// main animation loop
	render(dt) {
		if (this.stats) this.stats.update();


		if (this.lines) {
			this.lines.forEach(function(l, i) {
				l.update(time);
			});
		}


		if (this.intro) this.intro.update(dt);
		if (this.tyAudio) this.tyAudio.update();

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);

		if (this.composer) {
			this.composer.render();

		}
	}


	/////////// UI Bar
	///
	initUI() {

		let BtnContainer = document.getElementById('BtnContainer');
		BtnContainer.style.display = "block";
		TweenMax.from(BtnContainer, .8, {
			opacity: 0,
			scale: 0.1,
			ease: Back.easeOut,
		});



		let playBtn = document.getElementById('PlayBtn');
		playBtn.addEventListener('touchmove', EventPreventDefault);
		playBtn.addEventListener('mousemove', EventPreventDefault);
		playBtn.addEventListener('click', this.controlMuisc);


		let undoBtn = document.getElementById('UndoBtn');
		undoBtn.addEventListener('touchmove', EventPreventDefault);
		undoBtn.addEventListener('mousemove', EventPreventDefault);
		undoBtn.addEventListener('click', this.undoMuisc);



		function EventPreventDefault(event) {
			event.preventDefault();
		}
	}

	undoMuisc() {
		isPlaying = false
		document.getElementById('play').style.display = "block";
		document.getElementById('pause').style.display = "none";

		if (That.lines.length < 1) return;
		That.lines[That.lines.length - 1].removeThis(function(_that) {
			That.linesObj.remove(_that);
		});
		That.lines.pop();
		curPlayNum = 0;
	}

	clearAllMuisc() {
		isPlaying = false
		document.getElementById('play').style.display = "block";
		document.getElementById('pause').style.display = "none";

		That.lines.forEach(function(l) {
			l.removeThis(function(_that) {
				That.linesObj.remove(_that);
			});
		});
		That.lines = [];
		curPlayNum = 0;
	}

	controlMuisc() {
		isPlaying = !isPlaying;
		if (isPlaying) {
			console.log("playMuisc");

			document.getElementById('play').style.display = "none";
			document.getElementById('pause').style.display = "block";
			That.musicLoop();
		} else {
			console.log("pauseMuisc");

			document.getElementById('play').style.display = "block";
			document.getElementById('pause').style.display = "none";
		}
	}

	musicLoop() {
		if (!isPlaying) return;
		console.log("musicLoop " + curPlayNum);
		let useT = !document.getElementById('useT').checked;

		That.lines.forEach(function(l, i) {
			if (l.order == curPlayNum) {
				if (useT) {
					if (l.audioName) That.tyAudio.play(l.audioName, l.detune);
					else That.tyAudio.playBase(l.detune);
				} else {
					if (l.audioName) That.tyAudio.playMarimba(l.detune);
					else That.tyAudio.playBase(l.detune);
				}
				l.shake();
			}
		});
		curPlayNum++;
		if (curPlayNum > 11) curPlayNum = 0;

		setTimeout(function() {
			That.musicLoop();
		}, 200);
	}

}

export default linesScene;