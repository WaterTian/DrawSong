import * as THREE from 'three';
import TweenMax from "gsap";
import Stats from 'stats.js';
import dat from 'dat-gui';
import VConsole from 'vconsole';
import OrbitContructor from 'three-orbit-controls';
import Tone from 'Tone';


import TyAudio from './TyAudio';

import TyMeshLine from './TyMeshLine';

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


var isPlaying = false;
var curPlayNum = 0;


var isIntro = true;


function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}



class linesScene {

	constructor() {
		That = this;

		// this.vconsole = new VConsole();
		// this.stats = new Stats();
		// document.body.appendChild(this.stats.dom);

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
				setTimeout(That.initIntro, 1000);
			});
		} else {

			setTimeout(That.initIntro, 1000);
		}


		this.tyAudio = new TyAudio();

		// That.initUI();


	}

	init() {

		this.camera;
		this.scene;
		this.groundMaterial;
		this.mesh;


		this.scene = new THREE.Scene();

		this.camera0 = new THREE.PerspectiveCamera(60, cw / ch, 1, 20000);
		this.camera0.position.set(0, 0, 1000);
		this.scene.add(this.camera0);


		this.camera1 = new THREE.PerspectiveCamera(40, cw / ch, 1, 1500);
		this.camera1.position.set(0, 0, 1000);
		this.scene.add(this.camera1);
		var helper1 = new THREE.CameraHelper(this.camera1);
		// this.scene.add(helper1);


		// this.camera2 = new THREE.OrthographicCamera( cw / - 2, cw / 2, ch / 2, ch / - 2, 1, 2000 );
		// this.camera2.position.set(0, 0, 1000);
		// this.scene.add(this.camera2);
		// var helper2 = new THREE.CameraHelper(this.camera2);
		// this.scene.add(helper2);


		this.camera = this.camera1;


		/*		this.scene.add(new THREE.AmbientLight(0xf0f0f0));
				var light = new THREE.SpotLight(0xffffff, 1.5);
				light.position.set(0, 1500, 200);
				light.castShadow = true;
				light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000));
				light.shadow.bias = -0.000222;
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
				this.scene.add(light);

				var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
				planeGeometry.rotateX( - Math.PI / 2 );
				var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );
				var plane = new THREE.Mesh( planeGeometry, planeMaterial );
				plane.position.y = -200;
				plane.receiveShadow = true;
				this.scene.add( plane );

				var helper = new THREE.GridHelper( 2000, 100 );
				helper.position.y = - 199;
				helper.material.opacity = 0.25;
				helper.material.transparent = true;
				this.scene.add( helper );

				var geometry = new THREE.BoxGeometry( 100, 100, 100 );
				var material = new THREE.MeshNormalMaterial();
				var cube = new THREE.Mesh( geometry, material );
				this.scene.add( cube );
				cube.castShadow = true;
		*/


		// init renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true
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


	initIntro() {

		isIntro = true;

		That.initLines();

		That.intro = new introObject();
		That.scene.add(That.intro);

		That.introT = '';

		That.initIntroA();
	}

	initIntroA() {
		That.clearMuisc();
		let _ps = Recognizer.Unistrokes[0];
		let _nt = 'a';

		That.intro.drawT(_ps, function() {
			That.tyAudio.play(_nt, 2);
			That.introT = 'a';
		});
	}
	initIntroB() {
		That.clearMuisc();
		let _ps = Recognizer.Unistrokes[2];
		let _nt = 'b';

		That.intro.clearT(function() {
			That.intro.drawT(_ps, function() {
				That.tyAudio.play(_nt, 2);
				That.introT = 'b';
			});
		});
	}
	initIntroC() {
		That.clearMuisc();
		let _ps = Recognizer.Unistrokes[4];
		let _nt = 'c';

		That.intro.clearT(function() {
			That.intro.drawT(_ps, function() {
				That.tyAudio.play(_nt, 2);
				That.introT = 'c';
			});
		});
	}
	removeIntro() {
		isIntro = false;
		That.clearMuisc();
		That.intro.clearT(function() {
			That.intro.removeThis();
		});


		That.initUI();
	}


	initLines() {


		this.lines = [];
		this.curPoints = [];
		this.curLine = null;

		this.linesObj = new THREE.Object3D();
		this.scene.add(this.linesObj);



		// this.curPoints = [0, 0, 0, -cw / 2, 0, 0, -cw / 2, ch / 2, 0, 0, ch / 2, 0, 0, 0, 0];
		// this.addLine();
		// this.addPoint();



		if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
			this.renderer.domElement.addEventListener("touchstart", (e) => {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				e = e.targetTouches[0];
				That.down(e);
			}, false);
			this.renderer.domElement.addEventListener("touchmove", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.move(e.changedTouches[0]);
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
				That.down(e);
			}, false);
			document.addEventListener("mousemove", function(e) {
				e.preventDefault();
				That.move(e);
			}, false);
		}
	}



	down(e) {
		if (firstTimeEver) {
			// console.log("play 0");
			// That.tyAudio.play('o');
			firstTimeEver = false;
		}

		That.curPoints = [];
		That.addLine();

		_isDown = true;
	}

	move(e) {
		if (_isDown) {
			var x = e.clientX / cw * 2 - 1;
			var y = -e.clientY / ch * 2 + 1;

			if (That.curPoints.length > maxPoints) {
				That.curPoints.shift();
				That.curPoints.shift();
				That.curPoints.shift();
			}

			var mouse = new THREE.Vector2(x, y);

			That.raycaster.setFromCamera(mouse, That.camera);

			var intersects = That.raycaster.intersectObject(That.raycasterPlane);

			if (intersects.length > 0) {
				// console.log(intersects[0].point);
				That.curPoints.push(intersects[0].point.x, intersects[0].point.y, 0);
				That.addPoint(That.curPoints);
			}

		}
	}


	addLine() {

		let line = new TyMeshLine(64);


		That.linesObj.add(line);
		That.lines.push(line);
		That.curLine = line;

		line.uniforms.color.value = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

		var texture = new THREE.TextureLoader().load('assets/s.jpg');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		line.uniforms.useMap.value = 1;
		line.uniforms.map.value = texture;



		line.uniforms.sizeAttenuation.value = 1;

		// line.uniforms.repeat.value = new THREE.Vector2(1, 1);
	}

	addPoint(_curPoints) {

		// console.log(this.curLine);
		// console.log(_curPoints);

		That.curLine.setPoints(_curPoints, "parabolic");

	}


	//////////////////////
	///
	///
	///
	drawEnd() {
		_isDown = false;
		console.log("drawEnd");

		if (That.curPoints.length == 0) return;


		var linePs = [];
		for (var i = 0; i < That.curPoints.length; i += 3) {

			// linePs.push(That.curPoints[i].toFixed(2));
			// linePs.push(That.curPoints[i + 1].toFixed(2));

			linePs.push(That.curPoints[i]);
			linePs.push(That.curPoints[i + 1]);
		}

		//.toFixed(2);
		// console.log(linePs.toString());

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

		// console.log("detune " + That.curLine.detune);
		console.log("order " + That.curLine.order);


		let useT = !document.getElementById('useT').checked

		if (useT) {
			if (result.Score > 2) {
				That.curLine.audioName = result.Name;
				console.log("paly " + result.Name + "_" + That.curLine.detune);
				That.tyAudio.play(That.curLine.audioName, That.curLine.detune);

				////
				if (isIntro) {
					if (That.introT == 'a' && result.Name == 'a') {
						That.intro.fw.open();
						setTimeout(That.initIntroB, 1200);
					}
					if (That.introT == 'b' && result.Name == 'b') {
						That.intro.fw.open();
						setTimeout(That.initIntroC, 1200);
					}
					if (That.introT == 'c' && result.Name == 'c') {
						That.intro.fw.open();
						setTimeout(That.removeIntro, 1200);
					}

				}

			} else {
				That.tyAudio.playBase(That.curLine.detune);
			}
		}else{
			That.tyAudio.playMarimba(That.curLine.detune);
		}

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


	}


	// main animation loop
	render(dt) {
		if (this.stats) this.stats.update();


		if (this.lines) {
			this.lines.forEach(function(l, i) {
				l.updateWidth(time);
			});
		}


		if (this.intro) this.intro.update(dt);
		if (this.tyAudio) this.tyAudio.update();


		this.renderer.render(this.scene, this.camera);

		if (this.composer) {
			this.composer.render();

		}
	}



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
		undoBtn.addEventListener('click', this.clearMuisc);



		function EventPreventDefault(event) {
			event.preventDefault();
		}
	}

	clearMuisc() {

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

		let useT = !document.getElementById('useT').checked

		That.lines.forEach(function(l, i) {

			if (l.order == curPlayNum) {

				if(useT){
					if (l.audioName) That.tyAudio.play(l.audioName, l.detune);
					else That.tyAudio.playBase(l.detune);
				}else{
					That.tyAudio.playMarimba(l.detune);
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