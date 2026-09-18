// =========================================================
// QUẢ CẦU NĂNG LƯỢNG — XANH NHẠT, MỎNG, KHÔNG ĐÈ CẢNH
// =========================================================
import * as THREE from 'three';

export function createEnergySphere(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const RADIUS = 200;
  const COLOR = 0x88ccdd;   // 🎯 xanh nhạt như Trái Đất

  /* =========================================================
     1. LƯỚI CẦU — KINH TUYẾN + VĨ TUYẾN, THƯA
     ========================================================= */
  function makeLatLongSphere(radius, latCount, longCount, segments) {
    const points = [];

    // Vĩ tuyến — thưa (8 đường)
    for (let i = 1; i < latCount; i++) {
      const phi = (i / latCount) * Math.PI;
      const r = radius * Math.sin(phi);
      const y = radius * Math.cos(phi);

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        points.push(r * Math.cos(theta), y, r * Math.sin(theta));
      }
    }

    // Kinh tuyến — thưa (12 đường)
    for (let i = 0; i < longCount; i++) {
      const theta = (i / longCount) * Math.PI * 2;
      for (let j = 0; j <= segments; j++) {
        const phi = (j / segments) * Math.PI;
        points.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));

    const mat = new THREE.PointsMaterial({
      color: COLOR,
      size: 1.0,                  // 🎯 hạt nhỏ
      transparent: true,
      opacity: 0.25,              // 🎯 rất nhạt
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      sizeAttenuation: true,
      toneMapped: false,
    });

    return new THREE.Points(geo, mat);
  }

  // 🎯 Lưới cầu — chỉ 1 lớp
  const sphere = makeLatLongSphere(RADIUS, 10, 16, 80);
  group.add(sphere);

  /* =========================================================
     2. HẠT BAY CHẬM TRÊN MẶT CẦU — ÍT, NHẠT
     ========================================================= */
  const COUNT = 400;   // 🎯 ít hạt
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const rad = new Float32Array(COUNT);
  const ang = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const spd = new Float32Array(COUNT);

  const cBase = new THREE.Color(COLOR);
  const cLight = new THREE.Color(0xaaeeff);   // sáng hơn chút

  for (let i = 0; i < COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    // Trên mặt cầu
    const r = RADIUS;
    pos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3 + 1] = r * Math.cos(phi);
    pos[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    rad[i] = r;
    ang[i] = theta;
    phase[i] = Math.random() * Math.PI * 2;
    spd[i] = 0.02 + Math.random() * 0.02;   // 🎯 chậm

    // Màu xanh nhạt
    const c = Math.random() < 0.5 ? cBase.clone() : cLight.clone();
    col[i*3]     = c.r;
    col[i*3 + 1] = c.g;
    col[i*3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const pMat = new THREE.PointsMaterial({
    size: 2.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,              // 🎯 nhạt
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    toneMapped: false,
  });

  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time, dt) {
      // Xoay lưới cầu chậm
      sphere.rotation.y = time * 0.02;

      // Hạt bay trên mặt cầu — xoay quanh trục y
      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        const theta = ang[i] + time * spd[i];
        const phi = Math.acos(2 * ((i * 0.618) % 1) - 1);   // golden ratio
        const r = rad[i];

        positions[i*3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3 + 1] = r * Math.cos(phi);
        positions[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      pGeo.attributes.position.needsUpdate = true;

      // Nhấp nháy nhẹ opacity
      pMat.opacity = 0.4 + Math.sin(time * 1.5) * 0.1;
    },
  };
}