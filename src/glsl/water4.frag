#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;




void main()
{
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 raintex = texture2D(u_texture2,vec2(uv.x*2.0,uv.y*0.1+u_time*0.125)).rgb/8.0;
  vec2 where = (uv.xy-raintex.xy);
  vec3 texchur1 = texture2D(u_texture,vec2(where.x,where.y)).rgb;
  
  gl_FragColor = vec4(texchur1,1.0);
}

