
// #ifdef GL_ES
// precision mediump float;
// #endif
precision highp float;


uniform vec2 u_resolution;
uniform sampler2D u_texture;

const float SAMPLES = 25.;

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    float weight = 0.008; //weighting factor to get a weighted of each sample
    //orback to 0.08
                        
    float decay = 0.95; //used to decrease the weighting fact so each step adds less to the sum,
                        //to model scattering and absortion
    
    float density = 0.9;//0.3 //used to scale the step size of the samples and step size(or totaal distance)
                        //determines how far in each ray direction calulations and bluring is done for
                        //higher density means longer streaks of light and also more blur
    float exposure = 4.1;  //or back to 1.1
            
    //we subtract 0.5 to shift it to -0.5 to +0.5 so 0.0, 0.0 is center of screen
    //so the blur goes out in all directions
    vec2 tuv = uv-0.5; //also we use a new vec2 because we still need uv for sampling and "jitter"
    
    vec2 duv = tuv/SAMPLES*density;
    
    vec4 initColor = texture2D(u_texture, uv.xy)*0.25;//portion of total color to start with.
    //color in this case comes from channel0 which is a buffer that returns the scene color
    
    //this is added as an offset to uv.  uv which will be used to sample each texture in the alg loop.
    //so we add a random percentage of duv to uv.
    //random is key because the issue is banding is you get these weird lines or waves
    //so to smooth them out you can offset each point by a random amount.
    uv+=duv*fract(sin(dot(uv, vec2(12.9898, 78.233)))*43758.5453);
    
    for(float i=0.;i<SAMPLES;i++)
    {
        //for each step move along the ray towards the center(uv - stepsize for all steps
        //where step is fraction of uv, will result in 0, 0 the middle
        uv-=duv;
        //add weighted percentage of scene color
        
        initColor+=texture2D(u_texture, uv)*weight; 
        weight*=decay;//decay the weight. 
    }
    
    initColor*=exposure;
    initColor*= (1. - dot(tuv, tuv)*.975);
    gl_FragColor = vec4(vec3(initColor),1.0);
}


