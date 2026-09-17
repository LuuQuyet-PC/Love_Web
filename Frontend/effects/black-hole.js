// =========================================================
// HỐ ĐEN GARGANTUA — LÕI ĐEN + ĐĨA BỒI TỤ + VÒNG PHOTON
// =========================================================
import * as THREE from 'three';

export function createBlackHole(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     1. ĐĨA BỒI TỤ — NHIỀU VÒNG HẠT XẾP LỚP
     ========================================================= */
  const DISK_COUNT = 6000;

  const diskPos   = new Float32Array(DISK_COUNT * 3);
  const diskCol   = new Float32Array(DISK_COUNT * 3);
  const diskSize  = new Float32Array(DISK_COUNT);
  const diskR     = new Float32Array(DISK_COUNT);
  const diskLayer = new Float32Array(DISK_COUNT);   // 🎯 lớp đĩa (0-1)

  const cWhite = new THREE.Color(0xffffff);
  const cCyan  = new THREE.Color(0x66e0ff);
  const cBlue  = new THREE.Color(0x3366ff);

  for (let i = 0; i < DISK_COUNT; i++) {
    // 🎯 Bán kính từ 1.3 → 6.5 (sát lõi → rìa)
    const r = 1.3 + Math.pow(Math.random(), 0.7) * 5.2;
    const angle = Math.random() * Math.PI * 2;

    // Độ dày rất mỏng — đĩa mảnh như phim
    const thickness = (Math.random() - 0.5) * 0.08;

    diskPos[i * 3]     = Math.cos(angle) * r;
    diskPos[i * 3 + 1] = thickness;
    diskPos[i * 3 + 2] = Math.sin(angle) * r;

    diskR[i] = r;
    // Lớp: 0 = mỏng gần tâm, 1 = dày ra xa
    diskLayer[i] = (r - 1.3) / 5.2;

    // Màu — gần lõi sáng trắng xanh, xa hơn xanh đậm
    let c;
    if (r < 3) {
      c = cWhite.clone().lerp(cCyan, (r - 1.3) / 1.7);
    } else {
      c = cCyan.clone().lerp(cBlue, (r - 3) / 3.5);
    }
    diskCol[i * 3]     = c.r;
    diskCol[i * 3 + 1] = c.g;
    diskCol[i * 3 + 2] = c.b;

    diskSize[i] = 0.2 + Math.random() * 0.4;
  }

  const diskGeo = new THREE.BufferGeometry();
  diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPos, 3));
  diskGeo.setAttribute('color',    new THREE.BufferAttribute(diskCol, 3));
  diskGeo.setAttribute('size',     new THREE.BufferAttribute(diskSize, 1));
  diskGeo.setAttribute('aRadius',  new THREE.BufferAttribute(diskR, 1));
  diskGeo.setAttribute('aLayer',   new THREE.BufferAttribute(diskLayer, 1));

  const diskMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute float aRadius;
      attribute float aLayer;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;

        float r = aRadius;
        float angle = atan(position.z, position.x);

        // 🎯 Xoáy Kepler — gần tâm quay nhanh
        float speed = 1.8 / pow(r, 1.4);
        angle += uTime * speed;

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.z = sin(angle) * r;
        pos.y = position.y;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (280.0 / -mv.z);
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
        gl_FragColor = vec4(vColor, a);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const disk = new THREE.Points(diskGeo, diskMat);
  group.add(disk);

  /* =========================================================
     2. ĐĨA ẢO — PHẦN TRÊN + DƯỚI (do hấp dẫn uốn cong)
     ========================================================= */
  // 🎯 Tạo hiệu ứng gravitational lensing — đĩa "cong" lên trên + xuống dưới
  const ARC_COUNT = 3000;
  const arcPos = new Float32Array(ARC_COUNT * 3);
  const arcCol = new Float32Array(ARC_COUNT * 3);
  const arcSize = new Float32Array(ARC_COUNT);
  const arcR = new Float32Array(ARC_COUNT);
  const arcAngle = new Float32Array(ARC_COUNT);
  const arcType = new Float32Array(ARC_COUNT);   // 0 = trên, 1 = dưới

  for (let i = 0; i < ARC_COUNT; i++) {
    const isTop = Math.random() < 0.5;
    const r = 1.5 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;

    // 🎯 Vị trí: trên đỉnh hoặc dưới đáy, uốn theo cung
    // Hạt nằm trên đường cong — y phụ thuộc vào góc
    const arcHeight = 2.5 + Math.random() * 1.5;

    arcPos[i * 3]     = Math.cos(angle) * r;
    arcPos[i * 3 + 1] = isTop ? arcHeight : -arcHeight;
    arcPos[i * 3 + 2] = Math.sin(angle) * r;

    arcR[i] = r;
    arcAngle[i] = angle;
    arcType[i] = isTop ? 0 : 1;

    const c = cCyan.clone().lerp(cWhite, Math.random() * 0.5);
    arcCol[i * 3]     = c.r;
    arcCol[i * 3 + 1] = c.g;
    arcCol[i * 3 + 2] = c.b;

    arcSize[i] = 0.2 + Math.random() * 0.5;
  }

  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
  arcGeo.setAttribute('color',    new THREE.BufferAttribute(arcCol, 3));
  arcGeo.setAttribute('size',     new THREE.BufferAttribute(arcSize, 1));
  arcGeo.setAttribute('aRadius',  new THREE.BufferAttribute(arcR, 1));
  arcGeo.setAttribute('aAngle',   new THREE.BufferAttribute(arcAngle, 1));
  arcGeo.setAttribute('aType',    new THREE.BufferAttribute(arcType, 1));

  const arcMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      attribute float aRadius;
      attribute float aAngle;
      attribute float aType;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;

        float r = aRadius;
        float angle = aAngle;

        // Xoáy chậm hơn
        float speed = 0.8 / pow(r, 0.8);
        angle += uTime * speed;

        // 🎯 Cung uốn — hạt di chuyển dọc theo cung ellipse
        float arcHeight = 2.5 + sin(aAngle * 3.0) * 1.2;
        float yPos = aType > 0.5 ? -arcHeight : arcHeight;

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.z = sin(angle) * r;
        pos.y = yPos;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (280.0 / -mv.z);
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
        gl_FragColor = vec4(vColor, a * 0.6);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const arc = new THREE.Points(arcGeo, arcMat);
  group.add(arc);

  /* =========================================================
     3. LÕI ĐEN — HÌNH CẦU ĐEN TUYỆT ĐỐI
     ========================================================= */
  const coreGeo = new THREE.SphereGeometry(1.15, 64, 64);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    fog: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  /* =========================================================
     4. VÒNG PHOTON — VÀNH SÁNG MẢNH BAO QUANH LÕI
     ========================================================= */
  const photonRingGeo = new THREE.TorusGeometry(1.25, 0.04, 16, 120);
  const photonRingMat = new THREE.MeshBasicMaterial({
    color: 0xaae0ff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
  // 🎯 Nghiêng nhẹ để khớp với đĩa
  photonRing.rotation.x = Math.PI / 2;
  group.add(photonRing);

  // Vòng photon ngoài
  const outerRingGeo = new THREE.TorusGeometry(1.4, 0.02, 16, 120);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRing.rotation.x = Math.PI / 2;
  group.add(outerRing);

  /* =========================================================
     VỊ TRÍ TỔNG
     ========================================================= */
  group.position.set(-60, -20, -30);
  group.scale.setScalar(2.5);

  // 🎯 Nghiêng nhẹ để nhìn 3D
  group.rotation.x = 0.15;
  group.rotation.z = -0.1;

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      diskMat.uniforms.uTime.value = time;
      arcMat.uniforms.uTime.value = time;

      // Vòng photon nhấp nháy
      photonRingMat.opacity = 0.85 + Math.sin(time * 2) * 0.15;
      outerRingMat.opacity = 0.5 + Math.sin(time * 1.5) * 0.2;

      // Cả nhóm quay nhẹ
      group.rotation.y = Math.sin(time * 0.1) * 0.1;
    },
  };
}