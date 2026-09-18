// =========================================================
// CỔNG XOÁY DƯỚI ĐÁY — HÚT VÀO + XOÁY LỐC TRÊN
// =========================================================
import * as THREE from 'three';

export function createPortalVortexBottom(scene) {
  const group = new THREE.Group();
  scene.add(group);

  /* =========================================================
     XOÁY ỐC DẸT — HÚT VÀO
     ========================================================= */
  const COUNT = 10000;
  const RADIUS = 60.0;

  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const siz = new Float32Array(COUNT);
  const rad = new Float32Array(COUNT);
  const ang = new Float32Array(COUNT);
  const spd = new Float32Array(COUNT);
  const lay = new Float32Array(COUNT);

  const cInner = new THREE.Color(0xffffff);
  const cMid   = new THREE.Color(0xa8e6ff);
  const cOuter = new THREE.Color(0x2244aa);
  const cWarm  = new THREE.Color(0xffcc88);

  for (let i = 0; i < COUNT; i++) {
    const r = Math.pow(Math.random(), 0.5) * RADIUS;
    const angle = Math.random() * Math.PI * 2.0;

    const thickness = Math.max(0.2, (1.0 - r / RADIUS) * 2.0);

    pos[i*3]     = Math.cos(angle) * r;
    pos[i*3 + 1] = (Math.random() - 0.5) * thickness;
    pos[i*3 + 2] = Math.sin(angle) * r;

    rad[i] = r;
    ang[i] = angle;
    spd[i] = -(0.8 / Math.pow(r * 0.05 + 1.0, 0.6));
    lay[i] = r / RADIUS;

    let c;
    if (Math.random() < 0.06) c = cWarm.clone();
    else {
      const t = r / RADIUS;
      if (t < 0.25) c = cInner.clone().lerp(cMid, t / 0.25);
      else c = cMid.clone().lerp(cOuter, (t - 0.25) / 0.75);
    }
    c.offsetHSL((Math.random() - 0.5) * 0.03, 0.0, (Math.random() - 0.5) * 0.1);

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
  geo.setAttribute('aSpeed',   new THREE.BufferAttribute(spd, 1));
  geo.setAttribute('aLayer',   new THREE.BufferAttribute(lay, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) },
    },
    vertexShader: `
      attribute float size;
      attribute float aRadius;
      attribute float aAngle;
      attribute float aSpeed;
      attribute float aLayer;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        float r = aRadius;
        float angle = aAngle + uTime * aSpeed;

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.y = position.y;
        pos.z = sin(angle) * r;

        vAlpha = 1.0 - aLayer * 0.7;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (250.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = pow(a, 2.0);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const vortex = new THREE.Points(geo, mat);
  group.add(vortex);

  /* =========================================================
     XOÁY LỐC TRÊN ĐẦU — HẠT XOẮN ỐC PHỤT LÊN
     ========================================================= */
  const JET_COUNT = 4000;
  const jetPos = new Float32Array(JET_COUNT * 3);
  const jetCol = new Float32Array(JET_COUNT * 3);
  const jetSiz = new Float32Array(JET_COUNT);
  const jetR   = new Float32Array(JET_COUNT);
  const jetY0  = new Float32Array(JET_COUNT);
  const jetAng = new Float32Array(JET_COUNT);
  const jetSpd = new Float32Array(JET_COUNT);

  const cJetWhite = new THREE.Color(0xffffff);
  const cJetBlue  = new THREE.Color(0x88ccff);
  const cJetWarm  = new THREE.Color(0xffccaa);

  for (let i = 0; i < JET_COUNT; i++) {
    const t = Math.pow(Math.random(), 0.5);
    const height = t * 60.0;
    const radius = 0.5 + t * 15.0;
    const angle = Math.random() * Math.PI * 2.0;

    jetPos[i*3]     = Math.cos(angle) * radius;
    jetPos[i*3 + 1] = height;
    jetPos[i*3 + 2] = Math.sin(angle) * radius;

    jetR[i]   = radius;
    jetY0[i]  = height;
    jetAng[i] = angle;
    jetSpd[i] = 1.0 + t * 1.5;

    let c;
    if (Math.random() < 0.1) c = cJetWarm.clone();
    else c = cJetWhite.clone().lerp(cJetBlue, t);

    jetCol[i*3]     = c.r;
    jetCol[i*3 + 1] = c.g;
    jetCol[i*3 + 2] = c.b;

    jetSiz[i] = 0.6 + Math.random() * 1.5;
  }

  const jetGeo = new THREE.BufferGeometry();
  jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
  jetGeo.setAttribute('color',    new THREE.BufferAttribute(jetCol, 3));
  jetGeo.setAttribute('size',     new THREE.BufferAttribute(jetSiz, 1));
  jetGeo.setAttribute('aRadius',  new THREE.BufferAttribute(jetR, 1));
  jetGeo.setAttribute('aY0',      new THREE.BufferAttribute(jetY0, 1));
  jetGeo.setAttribute('aAngle',   new THREE.BufferAttribute(jetAng, 1));
  jetGeo.setAttribute('aSpeed',   new THREE.BufferAttribute(jetSpd, 1));

  const jetMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0.0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) },
    },
    vertexShader: `
      attribute float size;
      attribute float aRadius;
      attribute float aY0;
      attribute float aAngle;
      attribute float aSpeed;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;

        float angle = aAngle + uTime * aSpeed;

        float cycle = 5.0;
        float yT = mod(uTime * 1.2 + aY0 * 0.1, cycle) / cycle;
        float y = yT * 60.0;

        float r = aRadius * (0.3 + yT * 1.2);

        vec3 pos;
        pos.x = cos(angle) * r;
        pos.y = y;
        pos.z = sin(angle) * r;

        vAlpha = 1.0 - abs(yT - 0.5) * 2.0;
        vAlpha = pow(vAlpha, 0.7);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (250.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = 1.0 - smoothstep(0.0, 0.5, d);
        a = pow(a, 2.0);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const jet = new THREE.Points(jetGeo, jetMat);
  group.add(jet);

  /* =========================================================
     LÕI TRẮNG
     ========================================================= */
  const coreCount = 800;
  const corePos = new Float32Array(coreCount * 3);
  const coreCol = new Float32Array(coreCount * 3);
  const coreSiz = new Float32Array(coreCount);

  for (let i = 0; i < coreCount; i++) {
    const r = Math.pow(Math.random(), 2.0) * 6.0;
    const theta = Math.random() * Math.PI * 2.0;
    const phi = Math.acos(2.0 * Math.random() - 1.0);

    corePos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
    corePos[i*3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    corePos[i*3 + 2] = r * Math.cos(phi);

    const c = cInner.clone().lerp(cMid, Math.random() * 0.5);
    coreCol[i*3]     = c.r;
    coreCol[i*3 + 1] = c.g;
    coreCol[i*3 + 2] = c.b;

    coreSiz[i] = 1.0 + Math.random() * 2.0;
  }

  const coreGeo = new THREE.BufferGeometry();
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
  coreGeo.setAttribute('color',    new THREE.BufferAttribute(coreCol, 3));
  coreGeo.setAttribute('size',     new THREE.BufferAttribute(coreSiz, 1));

  const coreMat = new THREE.ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2.0) },
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

  group.position.set(0.0, -100.0, 30.0);

  return {
    group,
    update(time) {
      mat.uniforms.uTime.value = time;
      jetMat.uniforms.uTime.value = time;
    },
  };
}