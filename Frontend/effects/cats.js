// =========================================================
// MÈO HOẠT HÌNH — NÉT MƯỢT, HẠT NHỎ, MÀU HỒNG ĐỔI MÀU
// =========================================================
import * as THREE from 'three';

export function createCats(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const pos = [];
  const phase = [];

  function addPoint(x, y) {
    pos.push(x, y, 0);
    phase.push(Math.random() * Math.PI * 2);
  }

  /* =========================================================
     HÀM VẼ ĐƯỜNG CONG MƯỢT
     ========================================================= */
  // Quadratic bezier: 3 điểm
  function qBezier(p0, p1, p2, steps = 20) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0];
      const y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1];
      addPoint(x, y);
    }
  }

  // Cubic bezier: 4 điểm
  function cBezier(p0, p1, p2, p3, steps = 30) {
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;
      const x = mt2 * mt * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t2 * t * p3[0];
      const y = mt2 * mt * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t2 * t * p3[1];
      addPoint(x, y);
    }
  }

  // Ellipse mượt
  function ellipse(cx, cy, rx, ry, steps = 60) {
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      addPoint(cx + rx * Math.cos(theta), cy + ry * Math.sin(theta));
    }
  }

  /* =========================================================
     VẼ MÈO
     ========================================================= */

  // ===== 1. ĐẦU — oval mượt =====
  ellipse(0, 1.4, 1.25, 1.05, 80);

  // ===== 2. TAI TRÁI =====
  // Cạnh ngoài (trái)
  qBezier([-1.15, 2.05], [-1.45, 2.6], [-1.1, 3.1], 20);
  // Đỉnh → cạnh trong
  qBezier([-1.1, 3.1], [-0.85, 2.85], [-0.55, 2.25], 20);
  // Đáy tai (đóng lại)
  qBezier([-0.55, 2.25], [-0.85, 2.15], [-1.15, 2.05], 12);

  // ===== 3. TAI PHẢI =====
  qBezier([1.15, 2.05], [1.45, 2.6], [1.1, 3.1], 20);
  qBezier([1.1, 3.1], [0.85, 2.85], [0.55, 2.25], 20);
  qBezier([0.55, 2.25], [0.85, 2.15], [1.15, 2.05], 12);

  // ===== 4. MẮT TRÁI — oval đứng =====
  ellipse(-0.5, 1.5, 0.28, 0.38, 50);

  // Đốm sáng mắt trái (3 chấm)
  ellipse(-0.58, 1.62, 0.07, 0.09, 20);
  ellipse(-0.42, 1.55, 0.04, 0.05, 15);
  ellipse(-0.45, 1.38, 0.03, 0.04, 12);

  // ===== 5. MẮT PHẢI =====
  ellipse(0.5, 1.5, 0.28, 0.38, 50);

  ellipse(0.42, 1.62, 0.07, 0.09, 20);
  ellipse(0.58, 1.55, 0.04, 0.05, 15);
  ellipse(0.55, 1.38, 0.03, 0.04, 12);

  // ===== 6. MŨI — tam giác hồng =====
  qBezier([-0.08, 1.12], [0, 1.02], [0.08, 1.12], 10);
  qBezier([0.08, 1.12], [0, 1.08], [-0.08, 1.12], 8);

  // ===== 7. MIỆNG — 2 cung =====
  qBezier([-0.16, 0.98], [-0.08, 0.88], [0, 0.95], 12);
  qBezier([0, 0.95], [0.08, 0.88], [0.16, 0.98], 12);

  // ===== 8. RÂU =====
  // Trái — 3 sợi
  qBezier([-0.9, 1.25], [-1.3, 1.2], [-1.7, 1.3], 10);
  qBezier([-0.9, 1.4], [-1.35, 1.4], [-1.75, 1.42], 10);
  qBezier([-0.9, 1.55], [-1.3, 1.6], [-1.7, 1.55], 10);
  // Phải — 3 sợi
  qBezier([0.9, 1.25], [1.3, 1.2], [1.7, 1.3], 10);
  qBezier([0.9, 1.4], [1.35, 1.4], [1.75, 1.42], 10);
  qBezier([0.9, 1.55], [1.3, 1.6], [1.7, 1.55], 10);

  // ===== 9. THÂN — oval =====
  ellipse(0, -0.4, 0.9, 0.85, 80);

  // ===== 10. CHÂN TRƯỚC TRÁI =====
  ellipse(-0.4, -1.1, 0.28, 0.22, 30);
  // 3 khe móng
  qBezier([-0.5, -1.2], [-0.5, -1.1], [-0.5, -1.0], 6);
  qBezier([-0.4, -1.25], [-0.4, -1.15], [-0.4, -1.05], 6);
  qBezier([-0.3, -1.2], [-0.3, -1.1], [-0.3, -1.0], 6);

  // ===== 11. CHÂN TRƯỚC PHẢI =====
  ellipse(0.4, -1.1, 0.28, 0.22, 30);
  qBezier([0.3, -1.2], [0.3, -1.1], [0.3, -1.0], 6);
  qBezier([0.4, -1.25], [0.4, -1.15], [0.4, -1.05], 6);
  qBezier([0.5, -1.2], [0.5, -1.1], [0.5, -1.0], 6);

  // ===== 12. ĐUÔI — cong lên =====
  cBezier(
    [0.85, -0.5],
    [1.2, -0.55],
    [1.5, -0.85],
    [1.5, -1.25],
    25
  );
  cBezier(
    [1.5, -1.25],
    [1.5, -1.55],
    [1.35, -1.7],
    [1.15, -1.7],
    18
  );

  /* =========================================================
     TẠO GEOMETRY
     ========================================================= */
  const positions = new Float32Array(pos);
  const phases = new Float32Array(phase);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1));

  /* =========================================================
     SHADER — HẠT NHỎ, ĐỔI MÀU HỒNG-TÍM
     ========================================================= */
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float aPhase;
      varying float vHue;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vHue = 0.88 + sin(uTime * 0.5 + aPhase) * 0.08;

        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 3.0 * uPixelRatio * (100.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vHue;

      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
      }

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = pow(a, 2.0);

        // Hồng đậm
        vec3 col = hsl2rgb(vec3(vHue, 0.9, 0.7));
        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  /* =========================================================
     VỊ TRÍ
     ========================================================= */
  group.position.set(-120, -50, 40);
  group.scale.setScalar(15.0);

  return {
    group,
    update(time) {
      mat.uniforms.uTime.value = time;
      group.position.y = -35 + Math.sin(time * 1.5) * 1.5;
    },
  };
}