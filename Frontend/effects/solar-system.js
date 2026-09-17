// =========================================================
// HỆ MẶT TRỜI BẰNG HẠT — MẶT TRỜI + TRÁI ĐẤT + MẶT TRĂNG
// =========================================================
import * as THREE from 'three';

export function createSolarSystem(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     HÀM TẠO HẠT CẦU — TÁI SỬ DỤNG
     ========================================================= */
  function makeSphereParticles(radius, count, color, sizeRange = [0.3, 0.8]) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      // Phân bố đều trên bề mặt cầu (không phải trong lòng)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const r = radius * (0.95 + Math.random() * 0.1);  // hơi nhấp nhô
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Màu hơi ngẫu nhiên để sinh động
      const cc = c.clone();
      cc.offsetHSL((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.15);
      colors[i * 3]     = cc.r;
      colors[i * 3 + 1] = cc.g;
      colors[i * 3 + 2] = cc.b;

      sizes[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

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
          gl_PointSize = size * uPixelRatio * (200.0 / -mv.z);
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

    return new THREE.Points(geo, mat);
  }

  /* =========================================================
     1. MẶT TRỜI — hạt vàng cam
     ========================================================= */
  const sun = makeSphereParticles(3, 3000, 0xffaa00, [0.4, 1.2]);
  group.add(sun);

  // Hào quang mặt trời
  const sunGlow = makeSphereParticles(4.5, 1500, 0xff6600, [0.2, 0.6]);
  group.add(sunGlow);

  /* =========================================================
     2. VÀNH ĐAI MẶT TRỜI — TO, trái đất chạy trên đó
     ========================================================= */
  const SUN_ORBIT_RADIUS = 15;   // 🎯 vành đai to

  // Vẽ vành đai bằng hạt
  const sunOrbitCount = 600;
  const sunOrbitPos = new Float32Array(sunOrbitCount * 3);
  const sunOrbitCol = new Float32Array(sunOrbitCount * 3);
  const sunOrbitSize = new Float32Array(sunOrbitCount);

  const ringColorA = new THREE.Color(0xffaa00);
  const ringColorB = new THREE.Color(0xff6600);

  for (let i = 0; i < sunOrbitCount; i++) {
    const angle = (i / sunOrbitCount) * Math.PI * 2;
    const r = SUN_ORBIT_RADIUS + (Math.random() - 0.5) * 0.3;
    sunOrbitPos[i * 3]     = Math.cos(angle) * r;
    sunOrbitPos[i * 3 + 1] = (Math.random() - 0.5) * 0.2;   // mỏng
    sunOrbitPos[i * 3 + 2] = Math.sin(angle) * r;

    const c = ringColorA.clone().lerp(ringColorB, Math.random());
    sunOrbitCol[i * 3]     = c.r;
    sunOrbitCol[i * 3 + 1] = c.g;
    sunOrbitCol[i * 3 + 2] = c.b;

    sunOrbitSize[i] = 0.3 + Math.random() * 0.5;
  }

  const sunOrbitGeo = new THREE.BufferGeometry();
  sunOrbitGeo.setAttribute('position', new THREE.BufferAttribute(sunOrbitPos, 3));
  sunOrbitGeo.setAttribute('color', new THREE.BufferAttribute(sunOrbitCol, 3));
  sunOrbitGeo.setAttribute('size', new THREE.BufferAttribute(sunOrbitSize, 1));

  const sunOrbitMat = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (200.0 / -mv.z);
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

  const sunOrbit = new THREE.Points(sunOrbitGeo, sunOrbitMat);
  group.add(sunOrbit);

  /* =========================================================
     3. TRÁI ĐẤT — hạt xanh dương + lục địa xanh lá
     ========================================================= */
  const earthOrbitGroup = new THREE.Group();   // 🎯 quay quanh mặt trời
  group.add(earthOrbitGroup);

  const earthGroup = new THREE.Group();
  earthGroup.position.x = SUN_ORBIT_RADIUS;    // 🎯 trên vành đai mặt trời
  earthOrbitGroup.add(earthGroup);

  // Quả cầu đất — hạt xanh dương
  const earth = makeSphereParticles(1.2, 1200, 0x3399ff, [0.25, 0.6]);
  earthGroup.add(earth);

  // Lục địa — hạt xanh lá
  const landGeo = new THREE.SphereGeometry(1.25, 16, 16);
  const landPositions = [];
  for (let i = 0; i < 8; i++) {
    // Rải cụm hạt xanh lá lên bề mặt
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const center = new THREE.Vector3().setFromSphericalCoords(1.25, phi, theta);
    for (let j = 0; j < 30; j++) {
      const p = center.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        )
      );
      landPositions.push(p.x, p.y, p.z);
    }
  }

  const landParticleGeo = new THREE.BufferGeometry();
  landParticleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(landPositions), 3));
  const landParticleMat = new THREE.PointsMaterial({
    color: 0x22cc66,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const landParticles = new THREE.Points(landParticleGeo, landParticleMat);
  earthGroup.add(landParticles);

  /* =========================================================
     4. VÀNH ĐAI TRÁI ĐẤT — mặt trăng chạy trên đó
     ========================================================= */
  const EARTH_ORBIT_RADIUS = 4;

  const earthOrbitCount = 200;
  const earthOrbitPos = new Float32Array(earthOrbitCount * 3);
  const earthOrbitCol = new Float32Array(earthOrbitCount * 3);
  const earthOrbitSize = new Float32Array(earthOrbitCount);

  const eRingColor = new THREE.Color(0x66ccff);

  for (let i = 0; i < earthOrbitCount; i++) {
    const angle = (i / earthOrbitCount) * Math.PI * 2;
    const r = EARTH_ORBIT_RADIUS + (Math.random() - 0.5) * 0.15;
    earthOrbitPos[i * 3]     = Math.cos(angle) * r;
    earthOrbitPos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    earthOrbitPos[i * 3 + 2] = Math.sin(angle) * r;

    const c = eRingColor.clone();
    earthOrbitCol[i * 3]     = c.r;
    earthOrbitCol[i * 3 + 1] = c.g;
    earthOrbitCol[i * 3 + 2] = c.b;

    earthOrbitSize[i] = 0.2 + Math.random() * 0.3;
  }

  const earthOrbitGeo = new THREE.BufferGeometry();
  earthOrbitGeo.setAttribute('position', new THREE.BufferAttribute(earthOrbitPos, 3));
  earthOrbitGeo.setAttribute('color', new THREE.BufferAttribute(earthOrbitCol, 3));
  earthOrbitGeo.setAttribute('size', new THREE.BufferAttribute(earthOrbitSize, 1));

  const earthOrbit = new THREE.Points(earthOrbitGeo, sunOrbitMat.clone());
  earthGroup.add(earthOrbit);   // 🎯 vành đai gắn vào trái đất

  /* =========================================================
     5. MẶT TRĂNG — hạt trắng, chạy trên vành đai trái đất
     ========================================================= */
  const moonGroup = new THREE.Group();
  earthGroup.add(moonGroup);    // 🎯 gắn vào trái đất

  // Quả cầu mặt trăng — hạt trắng
  const moon = makeSphereParticles(0.4, 400, 0xdddddd, [0.2, 0.5]);
  moonGroup.add(moon);

  /* =========================================================
     VỊ TRÍ TỔNG — BÊN TRÁI
     ========================================================= */
  group.position.set(-60, 10, -60);   // 🎯 bên trái
  group.scale.setScalar(2.0);

  /* =========================================================
     ANIMATE
     ========================================================= */
  return {
    group,
    update(time) {
      // 🎯 Mặt trời tự xoay
      sun.rotation.y = time * 0.3;
      sunGlow.rotation.y = -time * 0.15;

      // Vành đai mặt trời xoay
      sunOrbit.rotation.y = time * 0.2;

      // 🎯 Trái đất quay quanh mặt trời — TRÊN vành đai
      earthOrbitGroup.rotation.y = time * 0.4;

      // Trái đất tự xoay
      earth.rotation.y = time * 1.5;
      landParticles.rotation.y = time * 1.5;

      // Vành đai trái đất xoay nhẹ (không cần, vì gắn vào earthGroup)
      earthOrbit.rotation.y = time * 0.3;

      // 🎯 Mặt trăng quay quanh trái đất — TRÊN vành đai trái đất
      moonGroup.position.x = Math.cos(time * 1.2) * EARTH_ORBIT_RADIUS;
      moonGroup.position.z = Math.sin(time * 1.2) * EARTH_ORBIT_RADIUS;

      // Mặt trăng tự xoay
      moon.rotation.y = time * 2;

      // 🎯 Cả hệ thống nghiêng nhẹ
      group.rotation.y = Math.sin(time * 0.1) * 0.2;
    },
  };
}