import * as THREE from 'three';


/**
 * @author WaterTian
 */

THREE.ShaderPass = function(shader, textureID) {

	THREE.Pass.call( this );

	this.textureID = (textureID !== undefined) ? textureID : "u_texture";

	if (shader instanceof THREE.ShaderMaterial) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if (shader) {

		this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);

		this.material = new THREE.ShaderMaterial({

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		});

	}

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

};

THREE.ShaderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if (this.uniforms[this.textureID]) {
			this.uniforms[this.textureID].value = readBuffer;
		}
		if (this.uniforms.u_time) {
			this.uniforms.u_time.value += 0.01;
		}

		this.quad.material = this.material;

		if (this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		}

	}

});