// =========================================================
// NẤM NGOÀI HÀNH TINH — PHÁT SÁNG BẰNG HẠT
// =========================================================
import * as THREE from 'three';

export function createAlienMushrooms(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     HÀM TẠO 1 CÂY NẤM
     ========================================================= */
  function makeMushroom(x, z, height, capRadius, colorCap, colorStem) {
    const mGroup = new THREE.Group();
    mGroup.position.set(x, 0, z);

    // 🎯 Thân nấm — hạt dọc theo trục y
    const stemCount = 120;
    const stemPos = new Float32Array(stemCount * 3);
    const stemCol = new Float32Array(stemCount * 3);
    const stemSiz = new Float32Array(stemCount);
    const cStem = new THREE.Color(colorStem);

    for (let i = 0; i < stemCount; i++) {
      const t = Math.random();               // 0 (dưới) → 1 (trên)
      const y = t * height;
      const r = 0.15 + Math.random() * 0.1;  // thân mỏng
      const angle = Math.random() * Math.PI * 2;

      stemPos[i*3]     = Math.cos(angle) * r;
      stemPos[i*3 + 1] = y;
      stemPos[i*3 + 2] = Math.sin(angle) * r;

      // Màu thân — sáng dần lên trên
      const c = cStem.clone().multiplyScalar(0.5 + t * 0.5);
      stemCol[i*3]     = c.r;
      stemCol[i*3 + 1] = c.g;
      stemCol[i*3 + 2] = c.b;

      stemSiz[i] = 0.4 + Math.random() * 0.3;
    }

    // 🎯 Mũ nấm — vòm cầu trên đỉnh
    const capCount = 350;
    const capPos = new Float32Array(capCount * 3);
    const capCol = new Float32Array(capCount * 3);
    const capSiz = new Float32Array(capCount);
    const capPhase = new Float32Array(capCount);
    const cCap1 = new THREE.Color(colorCap);
    const cCap2 = cCap1.clone().offsetHSL(0.05, 0, 0.15);   // sáng hơn
    const cCap3 = cCap1.clone().offsetHSL(-0.05, 0, -0.1);  // tối hơn

    for (let i = 0; i < capCount; i++) {
      // Vòm cầu — chỉ lấy nửa trên
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;   // 0 → π/2
      const r = capRadius * (0.9 + Math.random() * 0.1);

      const px = r * Math.sin(phi) * Math.cos(theta);
      const py = height + r * Math.cos(phi);      // vòm hướng lên
      const pz = r * Math.sin(phi) * Math.sin(theta);

      capPos[i*3]     = px;
      capPos[i*3 + 1] = py;
      capPos[i*3 + 2] = pz;

      // Màu — ngẫu nhiên giữa 3 tông
      const rnd = Math.random();
      let c;
      if (rnd < 0.33) c = cCap1.clone();
      else if (rnd < 0.66) c = cCap2.clone();
      else c = cCap3.clone();
      c.offsetHSL((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.05);

      capCol[i*3]     = c.r;
      capCol[i*3 + 1] = c.g;
      capCol[i*3 + 2] = c.b;

      capSiz[i] = 0.6 + Math.random() * 1.0;
      capPhase[i] = Math.random() * Math.PI * 2;
    }

    // Geometry + Material cho thân
    const stemGeo = new THREE.BufferGeometry();
    stemGeo.setAttribute('position', new THREE.BufferAttribute(stemPos, 3));
    stemGeo.setAttribute('color',    new THREE.BufferAttribute(stemCol, 3));
    stemGeo.setAttribute('size',     new THREE.BufferAttribute(stemSiz, 1));

    const stemMat = new THREE.ShaderMaterial({
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
          a = pow(a, 2.0);
          gl_FragColor = vec4(vColor, a);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stem = new THREE.Points(stemGeo, stemMat);
    mGroup.add(stem);

    // Geometry + Material cho mũ
    const capGeo = new THREE.BufferGeometry();
    capGeo.setAttribute('position', new THREE.BufferAttribute(capPos, 3));
    capGeo.setAttribute('color',    new THREE.BufferAttribute(capCol, 3));
    capGeo.setAttribute('size',     new THREE.BufferAttribute(capSiz, 1));
    capGeo.setAttribute('aPhase',   new THREE.BufferAttribute(capPhase, 1));

    const capMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float aPhase;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          // Nhấp nháy nhẹ
          pos.y += sin(uTime * 1.5 + aPhase) * 0.05;
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

    const cap = new THREE.Points(capGeo, capMat);
    mGroup.add(cap);

    return { group: mGroup, capMat, stemMat };
  }

  /* =========================================================
     TẠO CỤM NẤM — NHIỀU CÂY
     ========================================================= */
  const mushrooms = [];

  // Màu pastel phát sáng
  const colorSets = [
    { cap: 0xff88dd, stem: 0xcc66ff },   // hồng-tím
    { cap: 0x66ddff, stem: 0x3399ff },   // xanh biển
    { cap: 0xffaa66, stem: 0xff6633 },   // cam
    { cap: 0x88ffaa, stem: 0x33cc66 },   // mint
    { cap: 0xdd88ff, stem: 0x9933cc },   // tím
  ];

  // Cây to ở giữa
  mushrooms.push(makeMushroom(0, 0, 4, 2.2, 0xff88dd, 0xcc66ff));

  // Cây vừa xung quanh
    const positions = [
    { x: -9, z: -4, h: 4, r: 2.0 },
    { x: 9, z: -4, h: 4.5, r: 2.2 },
    { x: -7, z: 6, h: 3.5, r: 1.8 },
    { x: 7, z: 6, h: 3.8, r: 1.9 },
    { x: 0, z: -8, h: 4.2, r: 2.0 },
    { x: -11, z: 2, h: 3.2, r: 1.6 },
    { x: 11, z: 2, h: 3.0, r: 1.5 },
    { x: -5, z: -6, h: 3.8, r: 1.7 },
    { x: 5, z: -6, h: 3.6, r: 1.7 },
  ];

  positions.forEach((p, i) => {
    const cs = colorSets[(i + 1) % colorSets.length];
    mushrooms.push(makeMushroom(p.x, p.z, p.h, p.r, cs.cap, cs.stem));
  });

  mushrooms.forEach(m => group.add(m.group));

  /* =========================================================
     VỊ TRÍ — ĐỐI DIỆN THIÊN HÀ
     ========================================================= */
  group.position.set(180, 0, 100);   // 🎯 đối diện thiên hà
  group.scale.setScalar(4);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      mushrooms.forEach(m => {
        m.capMat.uniforms.uTime.value = time;
      });
    },
  };
}