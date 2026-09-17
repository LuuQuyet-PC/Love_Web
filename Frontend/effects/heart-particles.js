// =========================================================
// TRÁI TIM 3D THẬT — PARAMETRIC SURFACE
// =========================================================
import * as THREE from 'three';
import { Text } from 'troika-three-text';

export function createHeartParticles(scene) {
  /* =========================================================
     CÔNG THỨC TIM 3D PARAMETRIC
     u, v ∈ [0, 2π] — tạo bề mặt khối 3D thật
     ========================================================= */
  function heart3D(u, v) {
    // x: dùng sin(u)^3 — tạo 2 bầu tim
    const x = 16 * Math.pow(Math.sin(u), 3);

    // y: 4 hàm cos cộng lại — tạo hình tim
    const y = 13 * Math.cos(u)
            - 5 * Math.cos(2 * u)
            - 2 * Math.cos(3 * u)
            - Math.cos(4 * u);

    // z: nhân với sin(v) — tạo chiều sâu (khối 3D)
    const z = x * Math.sin(v) * 0.6;

    // x cũng nhân cos(v) để tạo mặt cầu
    const xFinal = x * Math.cos(v);

    return { x: xFinal, y: y, z: z };
  }

  const COUNT = 12000;
  const SCALE = 0.7;    // scale tim (từ 16 → ~5.6 đơn vị)

  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  const phases = new Float32Array(COUNT);

  const colorA = new THREE.Color(0x00e5ff);   // cyan
  const colorB = new THREE.Color(0xff5fa2);   // hồng
  const colorC = new THREE.Color(0xffffff);   // trắng

  for (let i = 0; i < COUNT; i++) {
    // u: vòng quanh tim [0, 2π]
    const u = Math.random() * Math.PI * 2;
    // v: từ -π/2 → π/2 (tạo bề mặt cầu)
    const v = (Math.random() - 0.5) * Math.PI;

    const p = heart3D(u, v);

    // Thêm nhiễu nhỏ để hạt không nằm chính xác trên bề mặt
    const jitter = 0.15;
    positions[i * 3]     = (p.x + (Math.random() - 0.5) * jitter) * SCALE;
    positions[i * 3 + 1] = (p.y + (Math.random() - 0.5) * jitter) * SCALE;
    positions[i * 3 + 2] = (p.z + (Math.random() - 0.5) * jitter) * SCALE;

    // Màu — dựa vào z (hạt gần camera sáng hơn)
    const t = Math.random();
    let c;
    if (Math.random() < 0.08) c = colorC.clone();
    else c = colorA.clone().lerp(colorB, t);

    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i]  = 0.5 + Math.random() * 1.0;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('phase',    new THREE.BufferAttribute(phases, 1));

  /* =========================================================
     SHADER — ĐỔI MÀU HUE + NHỊP ĐẬP
     ========================================================= */
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uHue: { value: 0.5 },
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uHue;

      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
      }

      void main() {
        vec3 newColor = hsl2rgb(vec3(uHue, 0.85, 0.7));
        vColor = mix(color, newColor, 0.8);

        vec3 pos = position;

        // Nhịp đập
        float pulse = 1.0 + sin(uTime * 2.0) * 0.08;
        pos *= pulse;

        // Dao động nhẹ
        pos.x += sin(uTime * 1.5 + phase) * 0.2;
        pos.y += cos(uTime * 1.3 + phase) * 0.2;
        pos.z += sin(uTime * 1.8 + phase) * 0.3;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 2.0);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const heart = new THREE.Points(geo, mat);
  heart.position.set(60, 10, -20);   // 🎯 vị trí của bạn
  scene.add(heart);

  /* =========================================================
     CHỮ I LOVE YOU — cùng vị trí, cao hơn
     ========================================================= */
  const titleText = new Text();
  titleText.text = 'I Love You';
  titleText.fontSize = 5;
  titleText.fontWeight = '700';
  titleText.color = '#a8e6ff';
  titleText.anchorX = 'center';
  titleText.anchorY = 'middle';
  titleText.outlineWidth = '10%';
  titleText.outlineColor = '#00e5ff';
  titleText.outlineBlur = '25%';
  titleText.material.transparent = true;
  titleText.material.depthWrite = false;
  titleText.material.toneMapped = false;
  titleText.material.blending = THREE.AdditiveBlending;
  titleText.sdfGlyphSize = 512;
  titleText.sync();

  // Chữ ở trên tim — cùng x, z, cao hơn y
  titleText.position.set(60, 0, -18);
  scene.add(titleText);

  return {
    heart,
    titleText,
    update(time) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uHue.value = (time * 0.12) % 1.0;

      // Xoay 2 trục → thấy rõ 3D
      heart.rotation.y = Math.sin(time * 0.3) * 0.4;
      heart.rotation.x = Math.cos(time * 0.2) * 0.15;

      titleText.material.opacity = 0.85 + Math.sin(time * 1.5) * 0.15;
      titleText.position.y = 32 + Math.sin(time * 0.8) * 0.6;
    },
  };
}