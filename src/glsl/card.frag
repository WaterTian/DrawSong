precision highp float;

uniform sampler2D map;
uniform float opacity;

varying vec2 vUv;

void main() {
	vec4 c = texture2D(map,vUv);

	gl_FragColor = c;
	gl_FragColor.a *= opacity;
}