import * as THREE from 'three';
import TweenMax from "gsap";
const glslify = require('glslify');


class TyCard extends THREE.Mesh {

  constructor(texture) {
    super();

    this.w = texture.image.width;
    this.h = texture.image.height;

    this.uniforms = {
      map: {
        value: texture
      },
      opacity: {
        value: 0
      }
    };

    this.geometry = new THREE.PlaneBufferGeometry(this.w, this.h, 3, 3);
    this.material = new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('./glsl/card.vert'),
      fragmentShader: glslify('./glsl/card.frag'),
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      transparent: true,
    })

    this.show();
  }

  show(time = 1, delay = 0) {
    TweenMax.to(this.uniforms.opacity, time, {
      value: 1,
      ease: Cubic.easeOut,
      delay: delay
    });
  }

  hide(time = 1, delay = 0) {
    TweenMax.to(this.uniforms.opacity, time, {
      value: 0,
      ease: Cubic.easeOut,
      delay: delay
    });
  }

  setMap(texture) {
    this.uniforms.map.value = texture;
  }

}


export default TyCard;