// =========================================================
// TÀU VŨ TRỤ — DÙNG HẠT
// =========================================================
import * as THREE from 'three';

export function createSpaceship(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     THÂN TÀU — HÌNH TRỤ DÀI, HẠT XANH BẠC
     ========================================================= */
  function makeBody() {
    const COUNT = 1500;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);

    const cBody = new THREE.Color(0xaaccff);
    const cLight = new THREE.Color(0xffffff);

    for (let i = 0; i < COUNT; i++) {
      // Trụ dài 8, bán kính 0.8
      const t = Math.random();
      const y = (t - 0.5) * 8;
      const r = 0.8 * (1 - Math.abs(t - 0.5) * 0.3);   // hơi thon 2 đầu
      const angle = Math.random() * Math.PI * 2;

      pos[i*3]     = Math.cos(angle) * r;
      pos[i*3 + 1] = y;
      pos[i*3 + 2] = Math.sin(angle) * r;

      // Màu — sáng ở giữa
      const c = cBody.clone().lerp(cLight, Math.abs(t - 0.5) * 0.5);
      col[i*3]     = c.r;
      col[i*3 + 1] = c.g;
      col[i*3 + 2] = c.b;

      siz[i] = 0.4 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(siz, 1));

    const mat = new THREE.ShaderMaterial({
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

    return new THREE.Points(geo, mat);
  }

  /* =========================================================
     MŨI TÀU — HÌNH NÓN, HẠT ĐỎ CAM PHÁT SÁNG
     ========================================================= */
  function makeNose() {
    const COUNT = 400;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);

    const cNose = new THREE.Color(0xff6633);
    const cHot = new THREE.Color(0xffaa66);

    for (let i = 0; i < COUNT; i++) {
      const t = Math.random();
      const y = 4 + t * 2;                        // từ 4 → 6
      const r = (1 - t) * 0.8;                    // thu nhỏ về đỉnh
      const angle = Math.random() * Math.PI * 2;

      pos[i*3]     = Math.cos(angle) * r;
      pos[i*3 + 1] = y;
      pos[i*3 + 2] = Math.sin(angle) * r;

      const c = cNose.clone().lerp(cHot, t);
      col[i*3]     = c.r;
      col[i*3 + 1] = c.g;
      col[i*3 + 2] = c.b;

      siz[i] = 0.5 + Math.random() * 0.7;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(siz, 1));

    const mat = new THREE.ShaderMaterial({
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

    return new THREE.Points(geo, mat);
  }

  /* =========================================================
     CÁNH TÀU — 2 TẤM NGANG 2 BÊN
     ========================================================= */
  function makeWing(side) {
    const COUNT = 600;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const siz = new Float32Array(COUNT);

    const cWing = new THREE.Color(0x6699ff);

    for (let i = 0; i < COUNT; i++) {
      // Tấm phẳng dài
      const t = Math.random();
      const xLocal = t * 3;                        // dài 3
      const zLocal = (Math.random() - 0.5) * 1.5;  // rộng 1.5

      pos[i*3]     = side * (0.8 + xLocal);
      pos[i*3 + 1] = (Math.random() - 0.5) * 0.1;  // mỏng
      pos[i*3 + 2] = zLocal;

      const c = cWing.clone().multiplyScalar(0.6 + Math.random() * 0.4);
      col[i*3]     = c.r;
      col[i*3 + 1] = c.g;
      col[i*3 + 2] = c.b;

      siz[i] = 0.4 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(siz, 1));

    const mat = new THREE.ShaderMaterial({
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

    return new THREE.Points(geo, mat);
  }

  /* =========================================================
     ĐUÔI LỬA — HẠT PHỤT RA SAU
     ========================================================= */
  const flameCount = 800;
  const flamePos = new Float32Array(flameCount * 3);
  const flameCol = new Float32Array(flameCount * 3);
  const flameSiz = new Float32Array(flameCount);
  const flamePhase = new Float32Array(flameCount);

  const cFlameHot = new THREE.Color(0xffffff);
  const cFlameMid = new THREE.Color(0xffaa33);
  const cFlameCold = new THREE.Color(0xff3300);

  for (let i = 0; i < flameCount; i++) {
    // Hạt phụt dọc theo trục y âm
    const t = Math.random();
    const y = -4 - t * 4;
    const r = Math.random() * (0.3 + t * 0.8);
    const angle = Math.random() * Math.PI * 2;

    flamePos[i*3]     = Math.cos(angle) * r;
    flamePos[i*3 + 1] = y;
    flamePos[i*3 + 2] = Math.sin(angle) * r;

    // Màu — nóng ở gần, nguội ở xa
    let c;
    if (t < 0.3) c = cFlameHot.clone().lerp(cFlameMid, t / 0.3);
    else c = cFlameMid.clone().lerp(cFlameCold, (t - 0.3) / 0.7);

    flameCol[i*3]     = c.r;
    flameCol[i*3 + 1] = c.g;
    flameCol[i*3 + 2] = c.b;

    flameSiz[i] = 0.6 + Math.random() * 1.0;
    flamePhase[i] = Math.random() * Math.PI * 2;
  }

  const flameGeo = new THREE.BufferGeometry();
  flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));
  flameGeo.setAttribute('color',    new THREE.BufferAttribute(flameCol, 3));
  flameGeo.setAttribute('size',     new THREE.BufferAttribute(flameSiz, 1));
  flameGeo.setAttribute('aPhase',   new THREE.BufferAttribute(flamePhase, 1));

  const flameMat = new THREE.ShaderMaterial({
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
        // Nhấp nhô lửa
        pos.y += sin(uTime * 5.0 + aPhase) * 0.2;
        pos.x += cos(uTime * 4.0 + aPhase) * 0.15;
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
        a = pow(a, 1.8);
        gl_FragColor = vec4(vColor, a);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const flame = new THREE.Points(flameGeo, flameMat);

  /* =========================================================
     LẮP RÁP TÀU
     ========================================================= */
  const body = makeBody();
  const nose = makeNose();
  const wingL = makeWing(-1);
  const wingR = makeWing(1);

  group.add(body);
  group.add(nose);
  group.add(wingL);
  group.add(wingR);
  group.add(flame);

  /* =========================================================
     VỊ TRÍ
     ========================================================= */
  group.position.set(180, 0, 0);
  group.scale.setScalar(5.0);

  // 🎯 Nghiêng tàu cho sinh động
  group.rotation.z = -0.3;
  group.rotation.x = 0.2;

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      flameMat.uniforms.uTime.value = time;

      // 🎯 Tàu bay lên xuống nhẹ
      group.position.y = 0 + Math.sin(time * 0.8) * 1.5;
      group.position.x = 180 + Math.cos(time * 0.5) * 2;

      // 🎯 Tàu nghiêng qua lại
      group.rotation.z = -0.3 + Math.sin(time * 1.2) * 0.1;
    },
  };
}