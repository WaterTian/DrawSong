#pragma glslify: sNoise = require(./sNoise)

varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_time;

void main()
{
	vUv = uv;
	vUv.x *=2.;
	vUv.y += sNoise(vec2(vUv.y,u_time*0.00001))*2.;

	float h = texture2D( u_texture, vUv ).g * 60.;

	vec3 p = vec3(position.x,h,position.z);

	vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
}