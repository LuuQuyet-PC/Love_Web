// =========================================================
// THIÊN HÀ XOẮN ỐC — DÙNG HẠT
// =========================================================
import * as THREE from 'three';

export function createGalaxy(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     THIÊN HÀ CHÍNH — XOẮN ỐC 2 TAY
     ========================================================= */
  const COUNT = 12000;
  const RADIUS = 80;          // bán kính thiên hà
  const ARMS = 2;             // 2 tay xoắn
  const SPIN = 1.5;           // độ xoắn

  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const siz = new Float32Array(COUNT);
  const rad = new Float32Array(COUNT);   // bán kính gốc
  const ang = new Float32Array(COUNT);   // góc gốc

  const cCore  = new THREE.Color(0xffdd88);   // vàng nhạt (lõi)
  const cInner = new THREE.Color(0xffaa66);   // cam (gần lõi)
  const cMid   = new THREE.Color(0x88aaff);   // xanh nhạt
  const cOuter = new THREE.Color(0x4466cc);   // xanh đậm (rìa)

  for (let i = 0; i < COUNT; i++) {
    // Bán kính — tập trung gần tâm
    const r = Math.pow(Math.random(), 0.7) * RADIUS;

    // Góc — xoắn theo bán kính
    const armIndex = Math.floor(Math.random() * ARMS);
    const armAngle = (armIndex / ARMS) * Math.PI * 2;
    const spinAngle = (r / RADIUS) * SPIN * Math.PI;

    // Độ lệch ngẫu nhiên
    const spread = Math.pow(Math.random(), 3) * 0.5 * (Math.random() < 0.5 ? 1 : -1);
    const angle = armAngle + spinAngle + spread;

    // Vị trí
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    // Độ dày — mỏng ở rìa
    const thickness = (1 - r / RADIUS) * 6 + 1;
    const y = (Math.random() - 0.5) * thickness;

    pos[i*3]     = x;
    pos[i*3 + 1] = y;
    pos[i*3 + 2] = z;

    rad[i] = r;
    ang[i] = angle;

    // Màu theo bán kính
    let c;
    const t = r / RADIUS;
    if (t < 0.15) c = cCore.clone().lerp(cInner, t / 0.15);
    else if (t < 0.5) c = cInner.clone().lerp(cMid, (t - 0.15) / 0.35);
    else c = cMid.clone().lerp(cOuter, (t - 0.5) / 0.5);

    // Hơi ngẫu nhiên
    c.offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.1);

    col[i*3]     = c.r;
    col[i*3 + 1] = c.g;
    col[i*3 + 2] = c.b;

    siz[i] = 0.4 + Math.random() * 1.2;
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

        // 🎯 Xoay — gần tâm nhanh hơn
        float r = aRadius;
        float angle = aAngle;
        float speed = 0.5 / pow(r * 0.1 + 1.0, 0.5);
        angle += uTime * speed * 0.3;

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.z = sin(angle) * r;
        pos.y = position.y;

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
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const galaxy = new THREE.Points(geo, mat);

  // 🎯 Nghiêng thiên hà để nhìn thấy xoắn ốc
  galaxy.rotation.x = -0.5;
  galaxy.rotation.z = 0.3;

  group.add(galaxy);

  /* =========================================================
     LÕI SÁNG — QUẦNG SÁNG VÀNG Ở TRUNG TÂM
     ========================================================= */
  const coreCount = 800;
  const corePos = new Float32Array(coreCount * 3);
  const coreCol = new Float32Array(coreCount * 3);
  const coreSiz = new Float32Array(coreCount);

  for (let i = 0; i < coreCount; i++) {
    const r = Math.pow(Math.random(), 2) * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    corePos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
    corePos[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    corePos[i*3 + 2] = r * Math.cos(phi);

    const c = cCore.clone().lerp(cInner, Math.random());
    coreCol[i*3]     = c.r;
    coreCol[i*3 + 1] = c.g;
    coreCol[i*3 + 2] = c.b;

    coreSiz[i] = 1.5 + Math.random() * 2.5;
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
        gl_FragColor = vec4(vColor, a * 0.8);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const core = new THREE.Points(coreGeo, coreMat);
  galaxy.add(core);

  /* =========================================================
     VỊ TRÍ — BÊN TRÁI, RẤT XA
     ========================================================= */
  group.position.set(-180, 0, 0);
  group.scale.setScalar(1.5);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      mat.uniforms.uTime.value = time;
      // Xoay nhẹ cả thiên hà
      group.rotation.y = time * 0.02;
    },
  };
}