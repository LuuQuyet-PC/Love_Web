// =========================================================
// CỔNG XOÁY — XOÁY ỐC NHƯ GALAXY, NẰM NGANG, TO
// =========================================================
import * as THREE from 'three';

export function createPortalVortex(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     XOÁY ỐC — CẤU TRÚC GIỐNG GALAXY
     ========================================================= */
  const COUNT = 8000;
  const RADIUS = 60;           // 🎯 bán kính TO — bao phủ vùng rơi
  const ARMS = 2;              // 2 tay xoắn
  const SPIN = 1.8;            // độ xoắn

  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const siz = new Float32Array(COUNT);
  const rad = new Float32Array(COUNT);
  const ang = new Float32Array(COUNT);

  const cInner = new THREE.Color(0xffffff);   // trắng (lõi)
  const cMid   = new THREE.Color(0xa8e6ff);   // xanh nhạt
  const cOuter = new THREE.Color(0x4466ff);   // xanh đậm (rìa)
  const cWarm  = new THREE.Color(0xffaa66);   // vài hạt vàng cam

  for (let i = 0; i < COUNT; i++) {
    // Bán kính — tập trung gần tâm
    const r = Math.pow(Math.random(), 0.6) * RADIUS;

    // Góc xoáy 2 tay
    const armIndex = Math.floor(Math.random() * ARMS);
    const armAngle = (armIndex / ARMS) * Math.PI * 2;
    const spinAngle = (r / RADIUS) * SPIN * Math.PI;

    // Nhiễu nhỏ
    const spread = Math.pow(Math.random(), 3) * 0.6 * (Math.random() < 0.5 ? 1 : -1);
    const angle = armAngle + spinAngle + spread;

    // Vị trí — mặt phẳng XZ (nằm ngang)
    pos[i*3]     = Math.cos(angle) * r;
    pos[i*3 + 1] = (Math.random() - 0.5) * 0.5;   // 🎯 mỏng — nằm ngang
    pos[i*3 + 2] = Math.sin(angle) * r;

    rad[i] = r;
    ang[i] = angle;

    // Màu — theo bán kính
    let c;
    if (Math.random() < 0.04) c = cWarm.clone();
    else {
      const t = r / RADIUS;
      if (t < 0.2) c = cInner.clone().lerp(cMid, t / 0.2);
      else c = cMid.clone().lerp(cOuter, (t - 0.2) / 0.8);
    }
    c.offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.1);

    col[i*3]     = c.r;
    col[i*3 + 1] = c.g;
    col[i*3 + 2] = c.b;

    siz[i] = 0.5 + Math.random() * 1.2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(siz, 1));
  geo.setAttribute('aRadius',  new THREE.BufferAttribute(rad, 1));
  geo.setAttribute('aAngle',   new THREE.BufferAttribute(ang, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute float aRadius;
      attribute float aAngle;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        float r = aRadius;
        // Xoáy — gần tâm nhanh
        float speed = 0.3 / pow(r * 0.05 + 1.0, 0.7);
        float angle = aAngle + uTime * speed;

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.y = position.y;
        pos.z = sin(angle) * r;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (250.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = pow(a, 2.0);
        gl_FragColor = vec4(vColor, a);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const vortex = new THREE.Points(geo, mat);
  // 🎯 Nằm ngang — không nghiêng
  group.add(vortex);

  /* =========================================================
     LÕI SÁNG — TRẮNG Ở TÂM
     ========================================================= */
  const coreCount = 1000;
  const corePos = new Float32Array(coreCount * 3);
  const coreCol = new Float32Array(coreCount * 3);
  const coreSiz = new Float32Array(coreCount);

  for (let i = 0; i < coreCount; i++) {
    const r = Math.pow(Math.random(), 2) * 8;
    const theta = Math.random() * Math.PI * 2;

    corePos[i*3]     = Math.cos(theta) * r;
    corePos[i*3 + 1] = (Math.random() - 0.5) * 0.5;
    corePos[i*3 + 2] = Math.sin(theta) * r;

    const c = cInner.clone().lerp(cMid, Math.random() * 0.6);
    coreCol[i*3]     = c.r;
    coreCol[i*3 + 1] = c.g;
    coreCol[i*3 + 2] = c.b;

    coreSiz[i] = 1.2 + Math.random() * 2.0;
  }

  const coreGeo = new THREE.BufferGeometry();
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
  coreGeo.setAttribute('color',    new THREE.BufferAttribute(coreCol, 3));
  coreGeo.setAttribute('size',     new THREE.BufferAttribute(coreSiz, 1));

  const coreMat = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (250.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = pow(a, 2.5);
        gl_FragColor = vec4(vColor, a * 0.9);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const core = new THREE.Points(coreGeo, coreMat);
  group.add(core);

  /* =========================================================
     VỊ TRÍ — TRÊN ĐỈNH VÙNG RƠI, NẰM NGANG
     ========================================================= */
  // Vùng rơi có areaX = 100, areaY = 90 → TOP_Y = 55
  // Portal ở y = 55, nằm ngang
  group.position.set(0, 75, 30);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      mat.uniforms.uTime.value = time;
    },
  };
}