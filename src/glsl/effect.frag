// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;




void main()
{
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float amount = 0.0;
  
  amount = (1.0 + sin(u_time*6.0)) * 0.5;
  amount *= 1.0 + sin(u_time*16.0) * 0.5;
  amount *= 1.0 + sin(u_time*19.0) * 0.5;
  amount *= 1.0 + sin(u_time*27.0) * 0.5;
  amount = pow(amount, 3.0);

  amount *= 0.05;
  
  vec3 col;
  col.r = texture2D( u_texture, vec2(uv.x+amount,uv.y) ).r;
  col.g = texture2D( u_texture, uv ).g;
  col.b = texture2D( u_texture, vec2(uv.x-amount,uv.y) ).b;

  col *= (1.0 - amount * 0.5);
  gl_FragColor = vec4(col,1.0);
}

