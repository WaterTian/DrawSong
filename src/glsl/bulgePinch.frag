// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;



float radius=200.;
float strength=1.;
vec2 center=vec2(.5,.5);
// uniform sampler2D uSampler;
// varying vec2 vTextureCoord;

// uniform vec4 filterArea;
uniform vec4 filterClamp;
vec2 dimensions=vec2(1.,1.);



// void main() {
//     params = vec2(2.5, 10.0);

//     vec2 uv = gl_FragCoord.xy / u_resolution.xy;
//     vec2 uvn = 2.0*uv - vec2(1.0);  
//     uv += normal(uvn, u_time);
//     gl_FragColor = texture2D(u_texture, vec2(1.0-uv.x, uv.y));
// }


void main()
{
     vec2 vTextureCoord = gl_FragCoord.xy / u_resolution.xy;


    vec2 coord = vTextureCoord;
    coord -= center * dimensions.xy;
    float distance = length(coord);
    if (distance < radius) {
        float percent = distance / radius;
        if (strength > 0.0) {
            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
        } else {
            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
        }
    }
    coord += center * dimensions.xy;
    // coord /= vTextureCoord.xy;
    // vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);
    vec4 color = texture2D(u_texture, coord);
    // if (coord != clampedCoord) {
    //     color *= max(0.0, 1.0 - length(coord - clampedCoord));
    // }

    gl_FragColor = color;
}