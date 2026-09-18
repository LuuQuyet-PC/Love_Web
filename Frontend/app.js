import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { startLedBorder } from './effects/led-border.js';
import { createHeartParticles } from './effects/heart-particles.js';
import { createSolarSystem } from './effects/solar-system.js';
import { createBlackHole } from './effects/black-hole.js';
import { createPlanets } from './effects/planets.js';
import { createNebula } from './effects/nebula.js';
import { createGalaxy } from './effects/galaxy.js';
import { createAlienMushrooms } from './effects/alien-mushrooms.js';
import { createSpaceship } from './effects/spaceship.js';
import { createPortalVortex } from './effects/portal-vortex.js';
import { createPortalVortexBottom } from './effects/portal-vortex-bottom.js';
import { createCats } from './effects/cats.js';
import { createEnergySphere } from './effects/energy-sphere.js';

const CFG = window.CONFIG;
if (!CFG) throw new Error('CONFIG missing');

let globalHue = 0.5;

/* =========================================================
   RENDERER / SCENE / CAMERA
   ========================================================= */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 400
);

/* ÁNH SÁNG */
const l1 = new THREE.PointLight(0xa8e6ff, 1.2, 250);
l1.position.set(20, 20, 30);
scene.add(l1);

/* SAO NỀN */
{
  const g = new THREE.BufferGeometry();
  const N = 1200;
  const arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    arr[i * 3]     = (Math.random() - 0.5) * 260;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 260;
    arr[i * 3 + 2] = -Math.random() * 200;
  }
  g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.35,
    transparent: true, opacity: 0.7, toneMapped: false,
  })));
}

/* =========================================================
   HIỆU ỨNG
   ========================================================= */
const heartParticles = createHeartParticles(scene);
const solarSystem   = createSolarSystem(scene);
const blackHole     = createBlackHole(scene);
const planets       = createPlanets(scene);
const nebula        = createNebula(scene);
const galaxy        = createGalaxy(scene);
// 🎯 Nấm ngoài hành tinh — đối diện thiên hà
const alienMushrooms = createAlienMushrooms(scene);
// 🎯 Tàu vũ trụ
const spaceship = createSpaceship(scene);
// 🎯 Lốc xoáy trên đỉnh
const portalVortex = createPortalVortex(scene);
// 🎯 Cổng xoáy dưới đáy
const portalVortexBottom = createPortalVortexBottom(scene);
// 🎯 3 con mèo — góc dưới trái
const cats = createCats(scene);
// 🎯 Quả cầu năng lượng bao trùm
const energySphere = createEnergySphere(scene);
/* =========================================================
   ẢNH SPRITE
   ========================================================= */
const texLoader = new THREE.TextureLoader();
texLoader.crossOrigin = 'anonymous';

function roundImageTexture(img, radiusRatio = 0.08) {
  const w = img.width, h = img.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const r = Math.min(w, h) * radiusRatio;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeImageSprite(src) {
  const mat = new THREE.SpriteMaterial({
    transparent: true, depthWrite: false, depthTest: false,
    toneMapped: false, color: 0xdddddd,
  });
  const sp = new THREE.Sprite(mat);
  sp.userData.ratio = 0.75;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const tex = roundImageTexture(img, 0.08);
    mat.map = tex;
    mat.needsUpdate = true;
    sp.userData.ratio = img.width / img.height;
  };
  img.onerror = () => {};
  img.src = src;
  return sp;
}

/* =========================================================
   CHỮ
   ========================================================= */
function makeTextSharp(text) {
  const t = new Text();
  t.text = text;
  t.fontSize = 1;
  t.fontWeight = '700';
  t.color = '#ffffff';
  t.anchorX = 'center';
  t.anchorY = 'middle';
  t.outlineWidth = '4%';
  t.outlineColor = '#ff5fa2';
  t.outlineBlur = '0%';
  t.sdfGlyphSize = 512;
  t.material.transparent = true;
  t.material.depthWrite = false;
  t.material.opacity = 1;
  t.material.toneMapped = false;
  t.sync();
  t.userData.baseSize = CFG.wordSizeMin + Math.random() * (CFG.wordSizeMax - CFG.wordSizeMin);
  return t;
}

/* =========================================================
   VÙNG RƠI
   ========================================================= */
const TOP_Y = CFG.areaY / 2 + 10;
const BOT_Y = -CFG.areaY / 2 - 10;
const FADE_ZONE = 5;

function zToT(z) {
  const t = (z - CFG.zFar) / (CFG.zNear - CFG.zFar);
  return Math.max(0, Math.min(1, t));
}
function fadeByY(y) {
  const fadeIn  = Math.min(1, (TOP_Y - y) / FADE_ZONE);
  const fadeOut = Math.min(1, (y - BOT_Y) / FADE_ZONE);
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

/* =========================================================
   RẢI PHẦN TỬ
   ========================================================= */
const items = [];

// ẢNH
const imgColWidth = CFG.areaX / CFG.imageCols;
for (let i = 0; i < CFG.imageCount; i++) {
  const col = i % CFG.imageCols;
  const colCenterX = -CFG.areaX / 2 + imgColWidth * (col + 0.5);
  const jitterX = (Math.random() - 0.5) * imgColWidth * 0.5;
  const src = CFG.images[i % CFG.images.length];
  const sp = makeImageSprite(src);
  const phase = (i / CFG.imageCount) * CFG.areaY;
  sp.position.set(
    colCenterX + jitterX,
    TOP_Y - phase,
    CFG.zFar + Math.random() * (CFG.zNear - CFG.zFar)
  );
  scene.add(sp);
  items.push({ obj: sp, type: 'img', speed: 0.28 + Math.random() * 0.15 });
}

// CHỮ
const wordColWidth = CFG.areaX / CFG.wordCols;
for (let i = 0; i < CFG.wordCount; i++) {
  const col = i % CFG.wordCols;
  const colCenterX = -CFG.areaX / 2 + wordColWidth * (col + 0.5);
  const jitterX = (Math.random() - 0.5) * wordColWidth * 0.5;
  const text = CFG.words[Math.floor(Math.random() * CFG.words.length)];
  const t = makeTextSharp(text);
  const phase = (i / CFG.wordCount) * CFG.areaY;
  t.position.set(
    colCenterX + jitterX,
    TOP_Y - phase,
    CFG.zFar + Math.random() * (CFG.zNear - CFG.zFar)
  );
  scene.add(t);
  items.push({ obj: t, type: 'word', speed: 0.1 + Math.random() * 0.12 });
}

/* =========================================================
   CAMERA
   ========================================================= */
const cam = {
  yaw: CFG.camYaw, pitch: CFG.camPitch,
  tyaw: CFG.camYaw, tpitch: CFG.camPitch,
  dist: 800, tdist: 50,
  dragging: false, lx: 0, ly: 0,
  inside: false,
  introDone: false,
};

canvas.addEventListener('pointerdown', (e) => {
  if (!cam.inside) return;
  cam.dragging = true;
  cam.lx = e.clientX;
  cam.ly = e.clientY;
});
window.addEventListener('pointerup', () => (cam.dragging = false));
window.addEventListener('pointermove', (e) => {
  if (!cam.dragging || !cam.inside) return;
  const dx = e.clientX - cam.lx;
  const dy = e.clientY - cam.ly;
  cam.lx = e.clientX;
  cam.ly = e.clientY;
  cam.tyaw -= dx * 0.006;
  cam.tpitch += dy * 0.004;
});
window.addEventListener('wheel', (e) => {
  if (!cam.inside) return;
  cam.introDone = true;
  cam.tdist += e.deltaY * 0.05;
  cam.tdist = Math.max(7, Math.min(1000, cam.tdist));
}, { passive: true });

/* =========================================================
   ANIMATE
   ========================================================= */
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  globalHue = (globalHue + dt * 0.08) % 1;

  // 🎯 Camera chỉ di chuyển khi đã bấm "Mở thiệp"
  if (cam.inside) {
    cam.yaw   += (cam.tyaw   - cam.yaw)   * 0.18;
    cam.pitch += (cam.tpitch - cam.pitch) * 0.18;

    const distSpeed = cam.introDone ? 0.2 : 0.001;
    cam.dist += (cam.tdist - cam.dist) * distSpeed;

    if (!cam.introDone && Math.abs(cam.dist - cam.tdist) < 1) {
      cam.introDone = true;
    }
  }

  const yaw = cam.yaw;
  const pitch = cam.pitch;
  const r = cam.dist;
  camera.position.x = Math.sin(yaw) * r * Math.cos(pitch);
  camera.position.y = Math.sin(pitch) * r;
  camera.position.z = Math.cos(yaw) * r * Math.cos(pitch);
  camera.lookAt(0, 0, 0);

  for (const it of items) {
    const o = it.obj;
    const t = zToT(o.position.z);
    const y = o.position.y;
    const fade = fadeByY(y);

    o.position.y -= it.speed;
    if (o.position.y < BOT_Y) {
      o.position.y = TOP_Y;
      o.position.z = CFG.zFar + Math.random() * (CFG.zNear - CFG.zFar);
    }

    if (it.type === 'img') {
      const h = CFG.imgHeightFar + t * (CFG.imgHeightNear - CFG.imgHeightFar);
      const ratio = o.userData.ratio || 0.75;
      o.scale.set(h * ratio, h, 1);
      o.material.opacity = fade * (0.85 + t * 0.15);
    } else if (it.type === 'word') {
      const base = o.userData.baseSize;
      const k = 0.5 + t * 0.7;
      o.scale.set(base * k, base * k, 1);
      o.material.opacity = fade * (0.95 + t * 0.05);
      const c = new THREE.Color().setHSL(globalHue, 0.85, 0.65);
      o.outlineColor = '#' + c.getHexString();
      o.sync();
    }
  }

  heartParticles.update(now * 0.001);
  solarSystem.update(now * 0.001);
  blackHole.update(now * 0.001);
  planets.update(now * 0.001);
  nebula.update(now * 0.001, dt);
  galaxy.update(now * 0.001);
  alienMushrooms.update(now * 0.001);
  spaceship.update(now * 0.001);
  portalVortex.update(now * 0.001);
  portalVortexBottom.update(now * 0.001);
  cats.update(now * 0.001);
  energySphere.update(now * 0.001, dt);

  

 

  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================================
   UI
   ========================================================= */
document.getElementById('landingTitle').textContent = CFG.name;
document.getElementById('insideTitle').textContent  = CFG.insideTitle;
document.getElementById('insideMsg').textContent    = CFG.insideMsg;

const landing = document.getElementById('landing');
const uiEl = document.getElementById('ui');

/* =========================================================
   NHẠC
   ========================================================= */
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
bgMusic.volume = CFG.musicVolume || 0.4;
let musicPlaying = false;

function updateMusicBtn() {
  musicBtn.textContent = musicPlaying ? '🔊' : '🔇';
  musicBtn.classList.toggle('playing', musicPlaying);
}

musicBtn.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
  } else {
    bgMusic.play().catch(err => console.warn('Không phát được nhạc:', err));
    musicPlaying = true;
  }
  updateMusicBtn();
});

/* =========================================================
   NÚT MỞ THIỆP — 1 LISTENER DUY NHẤT
   ========================================================= */
document.getElementById('enterBtn').addEventListener('click', () => {
  landing.classList.add('hide');
  cam.inside = true;
  setTimeout(() => uiEl.classList.add('show'), 1200);

  bgMusic.play().then(() => {
    musicPlaying = true;
    updateMusicBtn();
  }).catch(() => {
    musicPlaying = false;
    updateMusicBtn();
  });

  setTimeout(() => musicBtn.classList.add('show'), 1500);
  setTimeout(() => startLedBorder(), 800);
});