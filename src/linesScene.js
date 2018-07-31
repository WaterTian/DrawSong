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
var prevX = 0;
var prevY = 0;

var lineWidth = 50;

var firstTimeEver = true;


var euler = new THREE.Euler();
var q0 = new THREE.Quaternion();
var orientationScale = {
	value: 1
};


var colors = [
	0x79b90a,
	0xfae301,
	0x00a4ad,
	0x96cdad,
	0xdd0165,
	0x79418c,
	0xf9f8c2,

	0xec8681,
	0xde535a
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


		this.camera1 = new THREE.PerspectiveCamera(40.5, cw / ch, 1, 1000);
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


		// init renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			autoClearColor: true
		});
		this.renderer.setClearColor(0xffffff);
		// this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(cw, ch);

		console.log(window.devicePixelRatio);

		this.container.appendChild(this.renderer.domElement);

		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;


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
			this.renderer.domElement.addEventListener("mouseup", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.drawEnd();
			}, false);

			this.renderer.domElement.addEventListener("mousedown", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
				That.down(e);
			}, false);

			this.renderer.domElement.addEventListener("mousemove", function(e) {
				e.preventDefault();
				if (e.stopPropagation) e.stopPropagation();
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

		var r = e.target.getClientRects()[0];
		var x = e.offsetX || (e.clientX - (r.x || r.left));
		var y = e.offsetY || (e.clientY - (r.y || r.top));
		_isDown = true;

		That.curPoints.push(x - cw / 2, ch / 2 - y, 0);

		That.addLine();



	}

	move(e) {
		if (_isDown) {
			var r = e.target.getClientRects()[0];
			var x = e.offsetX || (e.clientX - (r.x || r.left));
			var y = e.offsetY || (e.clientY - (r.y || r.top));

			var difx = x - prevX,
				dify = y - prevY;

			var d = Math.sqrt(difx * difx + dify * dify);
			if (d > 10) {
				// if (That.curPoints.length > maxPoints) {
				// 	That.curPoints.shift();
				// }

				That.curPoints.push(x - cw / 2, ch / 2 - y, 0);
				prevX = x;
				prevY = y;
			}
			That.addPoint();
		}
	}


	addLine() {

		let line = new TyMeshLine(That.curPoints);
		this.linesObj.add(line);
		this.lines.push(line);

		this.curLine = line;

		line.uniforms.color.value = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

		var texture = new THREE.TextureLoader().load('assets/stroke.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		line.uniforms.useMap.value = 1;
		line.uniforms.map.value = texture;
		line.uniforms.lineWidth.value = lineWidth;

		// line.uniforms.repeat.value = new THREE.Vector2(1, 1);
	}

	addPoint() {

		// console.log(this.curLine);
		// console.log(this.curPoints);
		this.curLine.setPoints(this.curPoints);
	}

	drawEnd() {
		_isDown = false;
		console.log("drawEnd");
		var line = [];
		for (var i = 0; i < That.curPoints.length; i += 3) {
			line.push(That.curPoints[i]);
			line.push(That.curPoints[i + 1]);
		}
		// console.log(line);
		var result = Recognizer.Recognize(line, true);

		console.log(result);

		if (result.Score > 1) {
			console.log("paly " + result.Name);
			That.tyAudio.play(result.Name, That.curPoints[1] / ch);
		}

		if (That.lines.length > 15) {
			That.linesObj.remove(That.lines[0]);
			That.lines.shift();
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
			l.uniforms.lineWidth.value = lineWidth * (1 + .15 * Math.sin(.002 * time + i));
		});

		if (this.tyAudio) this.tyAudio.update();


		this.renderer.render(this.scene, this.camera);

		if (this.composer) {
			this.composer.render();

		}
	}
}

export default linesScene;