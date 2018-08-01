import * as THREE from 'three';
import TweenMax from "gsap";
import Stats from 'stats.js';
import dat from 'dat-gui';
import VConsole from 'vconsole';
import OrbitContructor from 'three-orbit-controls';



import TyAudio from './TyAudio';

import TyMeshLine from './TyMeshLine';

import TyRecognizer from './TyRecognizer';



const OrbitControls = OrbitContructor(THREE);
const glslify = require('glslify');
const Recognizer = new TyRecognizer();



const isMobile = require('./isMobile.min.js');
window.floatType = isMobile.any ? THREE.HalfFloatType : THREE.FloatType;


var That;
var time = 0;
var zoom = 0;

var cw = window.innerWidth;
var ch = window.innerHeight;


var _isDown = false;
var maxPoints = 128;

var firstTimeEver = true;


var euler = new THREE.Euler();
var q0 = new THREE.Quaternion();
var orientationScale = {
	value: 1
};


var colors = [
	0xed6a5a,
	0xf4f1bb,
	0x9bc1bc,
	0x5ca4a9,
	0xe6ebe0,
	0xf0b67f,
	0xfe5f55,
	0xd6d1b1,
	0xc7efcf,
	0xeef5db,
	0x50514f,
	0xf25f5c,
	0xffe066,
	0x247ba0,
	0x70c1b3
];

function Point(x, y) // constructor
{
	this.X = x;
	this.Y = y;
}



class linesScene {

	constructor() {
		That = this;

		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.container = document.getElementById('webglContainer');

		this.start();

		this.tyAudio = new TyAudio();

		this.initUI();
	}

	initUI() {
		let playBtn = document.getElementById('PlayBtn');
		playBtn.addEventListener('touchmove', EventPreventDefault);
		playBtn.addEventListener('mousemove', EventPreventDefault);


		function EventPreventDefault(event) {
			event.preventDefault();
		}

		playBtn.addEventListener('click', this.playMuisc);
	}

	playMuisc() {
		console.log("playMuisc");

		That.lines.forEach(function(l, i) {
			if (l.order) {
				console.log(l.order);
				setTimeout(function() {
					That.tyAudio.play(l.audioName, l.detune);
					console.log(l.audioName);
				}, l.order * 3000)
			}
		});
	}

	start() {

		this.camera;
		this.scene;
		this.groundMaterial;
		this.mesh;


		this.scene = new THREE.Scene();

		this.camera0 = new THREE.PerspectiveCamera(60, cw / ch, 1, 20000);
		this.camera0.position.set(0, 0, 1000);
		this.scene.add(this.camera0);


		this.camera1 = new THREE.PerspectiveCamera(40.5, cw / ch, 1, 1500);
		this.camera1.position.set(0, 0, 1000);
		this.scene.add(this.camera1);
		var helper1 = new THREE.CameraHelper(this.camera1);
		this.scene.add(helper1);


		// this.camera2 = new THREE.OrthographicCamera( cw / - 2, cw / 2, ch / 2, ch / - 2, 1, 2000 );
		// this.camera2.position.set(0, 0, 1000);
		// this.scene.add(this.camera2);
		// var helper2 = new THREE.CameraHelper(this.camera2);
		// this.scene.add(helper2);



		this.camera = this.camera1;


		// init renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		console.log(window.devicePixelRatio);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(cw, ch);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		this.container.appendChild(this.renderer.domElement);


		//
		this.raycaster = new THREE.Raycaster();
		this.raycasterPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000), new THREE.MeshNormalMaterial({
			side: THREE.DoubleSide,
			wireframe: true,
		}));
		// this.raycasterPlane.material.visible = false;
		this.scene.add(this.raycasterPlane);


		// // controls
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.update();



		window.addEventListener('resize', this.onWindowResized);
		this.onWindowResized();
		if (window.DeviceOrientationEvent) window.addEventListener("deviceorientation", this.onOrientation);


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



		this.lines = [];
		this.curPoints = [];
		this.curLine = null;

		this.linesObj = new THREE.Object3D();
		this.scene.add(this.linesObj);



		// this.curPoints = [0, 0, 0, -cw / 2, 0, 0, -cw / 2, ch / 2, 0, 0, ch / 2, 0, 0, 0, 0];
		// this.addLine();



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


	down(e) {
		if (firstTimeEver && isMobile.any) {
			That.tyAudio.play('o');
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

			// if (That.curPoints.length > maxPoints) {
			// 	That.curPoints.shift();
			// 	That.curPoints.shift();
			// 	That.curPoints.shift();
			// }

			var mouse = new THREE.Vector2(x, y);

			That.raycaster.setFromCamera(mouse, That.camera);

			var intersects = That.raycaster.intersectObject(That.raycasterPlane);

			if (intersects.length > 0) {
				// console.log(intersects[0].point);
				That.curPoints.push(intersects[0].point.x, intersects[0].point.y, 0);
				That.addPoint();
			}

		}
	}


	addLine() {

		let line = new TyMeshLine(60);
		this.linesObj.add(line);
		this.lines.push(line);
		this.curLine = line;

		line.uniforms.color.value = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

		var texture = new THREE.TextureLoader().load('assets/stroke.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		line.uniforms.useMap.value = 1;
		line.uniforms.map.value = texture;
		line.uniforms.sizeAttenuation.value = 1;


		// line.uniforms.repeat.value = new THREE.Vector2(1, 1);
	}

	addPoint() {

		// console.log(this.curLine);
		// console.log(this.curPoints);

		this.curLine.setPoints(this.curPoints, "parabolic");

	}

	drawEnd() {
		_isDown = false;
		console.log("drawEnd");

		if (That.curPoints.length == 0) return;


		var linePs = [];
		for (var i = 0; i < That.curPoints.length; i += 3) {
			linePs.push(That.curPoints[i]);
			linePs.push(That.curPoints[i + 1]);
		}
		// console.log(linePs);
		var result = Recognizer.Recognize(linePs, true);
		console.log(result);

		if (result.Score > 1) {

			That.curLine.audioName = result.Name;
			That.curLine.detune = That.curPoints[1] / ch;
			That.curLine.order = That.curPoints[0] / cw +0.5;

			console.log("paly " + result.Name);
			That.tyAudio.play(That.curLine.audioName, That.curLine.detune);

		}

		if (That.lines.length > 12) {

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



		this.lines.forEach(function(l, i) {
			l.updateWidth(time);
		});

		if (this.tyAudio) this.tyAudio.update();


		this.renderer.render(this.scene, this.camera);

		if (this.composer) {
			this.composer.render();

		}
	}
}

export default linesScene;