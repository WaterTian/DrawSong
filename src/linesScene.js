import * as THREE from 'three';
import TweenMax from "gsap";
import Stats from 'stats.js';
import dat from 'dat-gui';
import VConsole from 'vconsole';
import OrbitContructor from 'three-orbit-controls';


import TyMeshLine from './TyMeshLine';

const OrbitControls = OrbitContructor(THREE);
const glslify = require('glslify');





var That;
var time = 0;
var zoom = 0;

var _isDown = false;
var prevX = 0;
var prevY = 0;


var euler = new THREE.Euler();
var q0 = new THREE.Quaternion();
var orientationScale = {
	value: 1
};

class linesScene {

	constructor() {
		That = this;

		this.vconsole = new VConsole();
		this.stats = new Stats();
		document.body.appendChild(this.stats.dom);

		this.container = document.getElementById('webglContainer');

		this.start();
	}

	start() {

		this.camera;
		this.scene;
		this.groundMaterial;
		this.mesh;

		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 50000);
		this.camera.position.set(0, 0, 1000);
		this.scene = new THREE.Scene();
		this.scene.add(this.camera);


		// init renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			autoClearColor: true
		});
		this.renderer.setClearColor(0x000000);
		// this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		this.container.appendChild(this.renderer.domElement);

		// this.renderer.gammaInput = true;
		// this.renderer.gammaOutput = true;


		// // controls
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.update();
		// 
		window.addEventListener('resize', this.onWindowResized);
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
				_isDown = false;
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
				_isDown = false;
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

		this.linesObj =new THREE.Object3D();
		this.scene.add(this.linesObj);


		time = Date.now();
		this.animate();
	}

	onWindowResized() {
		var w = That.container.clientWidth;
		var h = That.container.clientHeight;

		That.renderer.setSize(w, h);

		That.camera.aspect = w / h;
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

		q0.setFromEuler(euler);
		if (That.linesObj) That.linesObj.quaternion.slerp(q0, 0.3);
	}


	down(e) {
		// if (firstTimeEver) {
		// 	points = [];
		// 	lineWidth = 20;
		// }
		// 
		That.curPoints = [];

		var r = e.target.getClientRects()[0];
		var x = e.offsetX || (e.clientX - (r.x || r.left));
		var y = e.offsetY || (e.clientY - (r.y || r.top));
		_isDown = true;

		That.curPoints.push(x - window.innerWidth / 2, window.innerHeight / 2 - y, 0);

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
			if (d > 6) {
				// if (That.curPoints.length > maxPoints) {
				// 	That.curPoints.shift();
				// }

				That.curPoints.push(x - window.innerWidth / 2, window.innerHeight / 2 - y, 0);
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

		line.uniforms.color.value = new THREE.Color(0xffffff * Math.random());

		var texture = new THREE.TextureLoader().load('assets/stroke.png');
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		line.uniforms.useMap.value = 1;
		line.uniforms.map.value = texture;
		line.uniforms.lineWidth.value = 60;

		// line.uniforms.repeat.value = new THREE.Vector2(1, 1);
	}

	addPoint() {

		// console.log(this.curLine);
		// console.log(this.curPoints);

		this.curLine.setPoints(this.curPoints);
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


		this.renderer.render(this.scene, this.camera);

		if (this.composer) {
			this.composer.render();

		}
	}
}

export default linesScene;