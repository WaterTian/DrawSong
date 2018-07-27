
precision highp float;


uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform float u_time;


void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    vec4 color = texture2D(u_texture, uv);
    
    float strength = 16.0;
    
    float x = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (u_time * 10.0);
    vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    
    // if(abs(uv.x - 0.5) < 0.002)
    //     color = vec4(0.0);
    
    // if(uv.x > 0.5)
    // {
    //     grain = 1.0 - grain;
    //     gl_FragColor = color * grain;
    // }
    // else
    // {
    //     gl_FragColor = color + grain;
    // }

    gl_FragColor = color + grain;

}

