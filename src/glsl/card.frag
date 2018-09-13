#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D map;
uniform float opacity;

uniform float useColor;
uniform vec3 color;

varying vec2 vUv;

void main() {
	vec4 c = texture2D(map,vUv);

	gl_FragColor = c;
	if (useColor == 1.) gl_FragColor.rgb *=color;
	gl_FragColor.a *= opacity;
}