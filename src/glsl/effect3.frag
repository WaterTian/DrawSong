
//godrays + rgb
precision highp float;


uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform sampler2D u_light;
uniform float u_time;

const float SAMPLES = 60.;

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float weight = 0.008; 
    float decay = 0.95; 
    float density = 0.9;
    float exposure = 4.1;

    vec2 ouv = uv;
    vec2 tuv = uv-0.5;
    vec2 duv = tuv/SAMPLES*density;
    vec4 initColor = texture2D(u_texture, uv)*0.25;
    ouv+=duv*fract(sin(dot(ouv, vec2(12.9898, 78.233)))*43758.5453);
    
    for(float i=0.;i<SAMPLES;i++){
        ouv -= duv;
        initColor += texture2D(u_texture, ouv)*weight; 
        weight *= decay;//decay the weight. 
    }
    initColor *= exposure;
    initColor *= (1. - dot(tuv, tuv)*.975);

    //bglight
    vec2 lUv =  uv*.1 + u_time*.1;
    vec3 light = -texture2D(u_light, lUv).rgb + vec3(.8);


    //dot
    vec4 dotColor = texture2D(u_texture, uv);
    float strength = 16.0;
    float x = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (u_time * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    dotColor *= grain*2.;


    vec3 endColor = vec3(initColor+dotColor)*light;
    gl_FragColor = vec4(endColor,1.0);
}

