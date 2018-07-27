uniform vec2 resolution;
uniform sampler2D u_texture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = texture2D( u_texture, uv );
}
