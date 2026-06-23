import { useEffect, useRef } from 'react';

export default function NebulaBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vs = `
        attribute vec2 position;
        varying vec2 v_texCoord;
        void main() {
            v_texCoord = (position + 1.0) / 2.0;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fs = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;

        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
            for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p = rot * p * 2.0 + 100.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = v_texCoord;
            vec2 p = uv * 3.0;
            float n = fbm(p + u_time * 0.05);
            
            vec3 color1 = vec3(0.04, 0.05, 0.11); 
            vec3 color2 = vec3(0.0, 1.0, 0.78);   
            vec3 color3 = vec3(0.22, 0.22, 0.27); 
            
            vec3 finalColor = mix(color1, color3, n);
            finalColor = mix(finalColor, color2, pow(n, 4.0) * 0.3);
            
            float stars = pow(hash(uv * 1000.0), 50.0) * (1.0 - n * 0.5);
            finalColor += stars;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    let animId;
    function render(time) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} id="nebula-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -10, pointerEvents: 'none' }} />;
}
