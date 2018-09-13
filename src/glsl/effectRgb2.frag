#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_range;
uniform float u_time;
uniform sampler2D u_texture;


void main()
{
    float ChromaticAberration = u_range;
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 texel = 1.0 / u_resolution.xy;
    
    vec2 coords = (uv - 0.5) * 2.0;
    float coordDot = dot (coords, coords);
    
    vec2 precompute = ChromaticAberration * coordDot * coords;
    vec2 uvR = uv - texel.xy * precompute;
    vec2 uvB = uv + texel.xy * precompute;
    
    vec4 color;
    color.r = texture2D(u_texture, uvR).r;
    color.g = texture2D(u_texture, uv).g;
    color.b = texture2D(u_texture, uvB).b;
    
    gl_FragColor = color;
}

