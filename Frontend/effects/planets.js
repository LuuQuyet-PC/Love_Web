// =========================================================
// HÀNH TINH CÓ VÀNH ĐAI — DÙNG HẠT
// =========================================================
import * as THREE from 'three';

export function createPlanets(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     HÀM TẠO HÀNH TINH — cầu hạt + vành đai hạt
     ========================================================= */
  function makePlanet(radius, ringRadius, colorMain, colorRing, planetSeed) {
    const planetGroup = new THREE.Group();

    /* --- Quả cầu hạt --- */
    const SPHERE_COUNT = 800;
    const spherePos = new Float32Array(SPHERE_COUNT * 3);
    const sphereCol = new Float32Array(SPHERE_COUNT * 3);
    const sphereSize = new Float32Array(SPHERE_COUNT);

    const cMain = new THREE.Color(colorMain);
    const cLight = cMain.clone().offsetHSL(0, -0.1, 0.2);   // sáng hơn
    const cDark = cMain.clone().offsetHSL(0, 0.1, -0.15);   // tối hơn

    for (let i = 0; i < SPHERE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const r = radius * (0.9 + Math.random() * 0.1);
      spherePos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      spherePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      spherePos[i * 3 + 2] = r * Math.cos(phi);

      // Màu gradient theo vĩ độ
      const lat = Math.abs(spherePos[i * 3 + 1] / radius);   // 0 = xích đạo, 1 = cực
      let c;
      if (lat > 0.5) c = cLight.clone();
      else c = cMain.clone().lerp(cDark, Math.random() * 0.5);
      sphereCol[i * 3]     = c.r;
      sphereCol[i * 3 + 1] = c.g;
      sphereCol[i * 3 + 2] = c.b;

      sphereSize[i] = 0.3 + Math.random() * 0.6;
    }

    const sphereGeo = new THREE.BufferGeometry();
    sphereGeo.setAttribute('position', new THREE.BufferAttribute(spherePos, 3));
    sphereGeo.setAttribute('color',    new THREE.BufferAttribute(sphereCol, 3));
    sphereGeo.setAttribute('size',     new THREE.BufferAttribute(sphereSize, 1));

    const sphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSeed: { value: planetSeed },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uSeed;

        void main() {
          vColor = color;
          vec3 pos = position;

          // Nhấp nhô nhẹ
          pos *= 1.0 + sin(uTime * 2.0 + uSeed * 6.28) * 0.03;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (220.0 / -mv.z);
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

    const sphere = new THREE.Points(sphereGeo, sphereMat);
    planetGroup.add(sphere);

    /* --- Vành đai hạt --- */
    const RING_COUNT = 600;
    const ringPos = new Float32Array(RING_COUNT * 3);
    const ringCol = new Float32Array(RING_COUNT * 3);
    const ringSize = new Float32Array(RING_COUNT);
    const ringA = new Float32Array(RING_COUNT);

    const cRing = new THREE.Color(colorRing);
    const cRingLight = cRing.clone().offsetHSL(0, -0.1, 0.15);

    for (let i = 0; i < RING_COUNT; i++) {
      const r = ringRadius * (0.95 + Math.random() * 0.15);
      const angle = Math.random() * Math.PI * 2;

      ringPos[i * 3]     = Math.cos(angle) * r;
      ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;   // rất mỏng
      ringPos[i * 3 + 2] = Math.sin(angle) * r;

      ringA[i] = angle;

      const c = cRing.clone().lerp(cRingLight, Math.random());
      ringCol[i * 3]     = c.r;
      ringCol[i * 3 + 1] = c.g;
      ringCol[i * 3 + 2] = c.b;

      ringSize[i] = 0.25 + Math.random() * 0.5;
    }

    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    ringGeo.setAttribute('color',    new THREE.BufferAttribute(ringCol, 3));
    ringGeo.setAttribute('size',     new THREE.BufferAttribute(ringSize, 1));
    ringGeo.setAttribute('aAngle',   new THREE.BufferAttribute(ringA, 1));

    const ringMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float aAngle;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          float r = length(position.xz);
          float angle = aAngle + uTime * 0.5;

          vec3 pos;
          pos.x = cos(angle) * r;
          pos.z = sin(angle) * r;
          pos.y = position.y;

          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (220.0 / -mv.z);
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
          gl_FragColor = vec4(vColor, a);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const ring = new THREE.Points(ringGeo, ringMat);
    // 🎯 Nghiêng vành đai
    ring.rotation.x = Math.PI / 2.5;
    ring.rotation.z = 0.2;
    planetGroup.add(ring);

    // Trả về cả group + material để animate
    return {
      group: planetGroup,
      sphereMat,
      ringMat,
    };
  }

  /* =========================================================
     TẠO NHIỀU HÀNH TINH — RẢI RÁC
     ========================================================= */
  const planets = [];

  const planetConfigs = [
    // x, y, z, radius, ringRadius, màu cầu, màu vành
    { x: -18, y: -10, z: -20, r: 3.5, rr: 5.5, c: 0xffdd66, cr: 0xffffff },   // vàng
    { x: -25, y: -22, z: -25, r: 2.5, rr: 4.0, c: 0x66e0ff, cr: 0xffaa44 },   // xanh
    { x: 8,   y: -15, z: -22, r: 2.0, rr: 3.2, c: 0xff88cc, cr: 0xffffff },   // hồng
    { x: -8,  y: -28, z: -30, r: 3.0, rr: 5.0, c: 0xffaa44, cr: 0xffee88 },   // cam
    { x: 18,  y: -25, z: -28, r: 1.8, rr: 2.8, c: 0x99ddff, cr: 0x66ccff },   // xanh nhạt
    { x: 0,   y: -12, z: -18, r: 4.0, rr: 6.5, c: 0xffee88, cr: 0xffaa44 },   // vàng to
  ];

  planetConfigs.forEach((cfg, idx) => {
    const p = makePlanet(
      cfg.r,
      cfg.rr,
      cfg.c,
      cfg.cr,
      Math.random()
    );
    p.group.position.set(cfg.x, cfg.y, cfg.z);
    group.add(p.group);
    planets.push(p);
  });

  /* =========================================================
     SAO LẤP LÁNH XUNG QUANH
     ========================================================= */
  const STAR_COUNT = 400;
  const starPos = new Float32Array(STAR_COUNT * 3);
  const starCol = new Float32Array(STAR_COUNT * 3);
  const starSize = new Float32Array(STAR_COUNT);
  const starSeed = new Float32Array(STAR_COUNT);

  const cStar = new THREE.Color(0xffffff);

  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 80;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 60 - 15;
    starPos[i * 3 + 2] = -10 - Math.random() * 40;

    const c = cStar.clone();
    if (Math.random() < 0.3) c.setHSL(Math.random(), 0.8, 0.85);
    starCol[i * 3]     = c.r;
    starCol[i * 3 + 1] = c.g;
    starCol[i * 3 + 2] = c.b;

    starSize[i] = 0.3 + Math.random() * 1.5;
    starSeed[i] = Math.random() * Math.PI * 2;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(starCol, 3));
  starGeo.setAttribute('size',     new THREE.BufferAttribute(starSize, 1));
  starGeo.setAttribute('aSeed',    new THREE.BufferAttribute(starSeed, 1));

  const starMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute float aSeed;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        // Nhấp nháy
        float flicker = 0.5 + 0.5 * sin(uTime * 3.0 + aSeed);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * flicker * uPixelRatio * (220.0 / -mv.z);
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
        gl_FragColor = vec4(vColor, a);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeo, starMat);
  group.add(stars);

  /* =========================================================
     VỊ TRÍ TỔNG — DƯỚI TRÁI TIM
     ========================================================= */
  group.position.set(80, -10, -20);   // 🎯 dưới tim
  group.scale.setScalar(2.0);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      // Cập nhật shader
      planets.forEach(p => {
        p.sphereMat.uniforms.uTime.value = time;
        p.ringMat.uniforms.uTime.value = time;

        // Xoay nhẹ hành tinh
        p.group.rotation.y = time * 0.3 + p.group.position.x;
      });

      starMat.uniforms.uTime.value = time;

      // Cả nhóm xoay nhẹ
      group.rotation.y = Math.sin(time * 0.05) * 0.1;
    },
  };
}