// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;





// Params = (wave frequency in Hz, number of waves per unit distance)
//
vec2 params = vec2(2.5, 10.0);
    
// Simple circular wave function
float wave(vec2 pos, float t, float freq, float numWaves, vec2 center) {
    float d = length(pos - center);
    d = log(1.0 + exp(d));
    return 1.0/(1.0+20.0*d*d) *
           sin(2.0*3.1415*(-numWaves*d + t*freq));
}

// This height map combines a couple of waves
float height(vec2 pos, float t) {
    float w;
    w =  wave(pos, t, params.x, params.y, vec2(0.5, -0.5));
    w += wave(pos, t, params.x, params.y, -vec2(0.5, -0.5));
    return w;
}

// Discrete differentiation
vec2 normal(vec2 pos, float t) {
    return  vec2(height(pos - vec2(0.01, 0), t) - height(pos, t), 
                 height(pos - vec2(0, 0.01), t) - height(pos, t));
}

void main() {
    params = vec2(2.5, 10.0);

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 uvn = 2.0*uv - vec2(1.0);  
    uv += normal(uvn, u_time);
    gl_FragColor = texture2D(u_texture, vec2(1.0-uv.x, uv.y));

    
}
