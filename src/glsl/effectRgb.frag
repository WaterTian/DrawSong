
precision highp float;


uniform vec2 u_resolution;
uniform sampler2D u_texture;



// Given a vec2 in [-1,+1], generate a texture coord in [0,+1]
vec2 barrelDistortion( vec2 p, vec2 amt )
{
    p = 2.0 * p - 1.0;
    // much faster version
    //const float maxBarrelPower = 5.0;
    //float radius = length(p);
    float maxBarrelPower = sqrt(5.0);
    float radius = dot(p,p); //faster but doesn't match above accurately
    p *= pow(vec2(radius), maxBarrelPower * amt);

    return p * 0.5 + 0.5;
}

vec2 brownConradyDistortion(vec2 uv, float scalar)
{
// AH!!!    uv = uv * 2.0 - 1.0;
    uv = (uv - 0.5 ) * 2.0;
    
    if( true )
    {
        // positive values of K1 give barrel distortion, negative give pincushion
        float barrelDistortion1 = -0.02 * scalar; // K1 in text books
        float barrelDistortion2 = 0.0 * scalar; // K2 in text books

        float r2 = dot(uv,uv);
        uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;
        //uv *= 1.0 + barrelDistortion1 * r2;
    }
    
   return (uv / 2.0) + 0.5;
}


void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    
    float maxDistort = 4.0;

    float scalar = 1.0 * maxDistort;
//    vec4 colourScalar = vec4(2.0, 1.5, 1.0, 1.0);
    vec4 colourScalar = vec4(700.0, 560.0, 490.0, 1.0); // Based on the true wavelengths of red, green, blue light.
    colourScalar /= max(max(colourScalar.x, colourScalar.y), colourScalar.z);
    colourScalar *= 2.0;
    
    colourScalar *= scalar;
    
    vec4 sourceCol = texture2D(u_texture, uv); 

    const float numTaps = 8.0;
    
    
    vec3 rgbColor = vec3( 0.0 );
    for( float tap = 0.0; tap < numTaps; tap += 1.0 )
    {
        rgbColor.r += texture2D(u_texture, brownConradyDistortion(uv, colourScalar.r)).r;
        rgbColor.g += texture2D(u_texture, brownConradyDistortion(uv, colourScalar.g)).g;
        rgbColor.b += texture2D(u_texture, brownConradyDistortion(uv, colourScalar.b)).b;
        
        colourScalar *= 0.99;
    }
    
    rgbColor /= numTaps;
  
    gl_FragColor = vec4(rgbColor,1.0);
}
