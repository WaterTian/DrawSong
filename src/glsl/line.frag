#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D map;
uniform sampler2D alphaMap;
uniform float useMap;
uniform float useAlphaMap;
uniform float visibility;
uniform float alphaTest;
uniform vec2 repeat;

uniform float colorAdd;

varying vec2 vUV;
varying vec4 vColor;
varying float vCounters;

void main() {

    vec4 c = vColor;
    if( useMap == 1. ) c *= texture2D( map, vUV * repeat ) * colorAdd; //tyadd 1.1
    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;
    if( c.a < alphaTest ) discard;
    
    gl_FragColor = c;
    gl_FragColor.a *= step(vCounters, visibility);
} 
