// =========================================================
// THIÊN THẠCH — DÙNG SPRITE VỆT SÁNG
// =========================================================
import * as THREE from 'three';

export function createNebula(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // 🎯 Tạo texture vệt sáng (dài, mờ 2 đầu)
  function makeTrailTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Gradient dọc theo chiều dài
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.9, 'rgba(255,255,255,1)');
    grad.addColorStop(1.0, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 32);

    // Gradient dọc (làm mờ 2 bên)
    const gradV = ctx.createLinearGradient(0, 0, 0, 32);
    gradV.addColorStop(0, 'rgba(0,0,0,1)');
    gradV.addColorStop(0.5, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, 256, 32);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  const trailTexture = makeTrailTexture();

  // Màu pastel
  const colors = [0xaaffdd, 0xffccee, 0xaaccff, 0xddbbff, 0xffeecc];

  // 🎯 Tạo sẵn 6 vệt — dùng lại
  const trails = [];

  for (let i = 0; i < 6; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const mat = new THREE.SpriteMaterial({
      map: trailTexture,
      color: color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(40, 3, 1);   // 🎯 vệt dài 40, cao 3
    scene.add(sprite);

    trails.push({
      sprite, mat,
      active: false,
      age: 0,
      life: 2.0,
      x: 0, y: 0,
      dx: 0, dy: 0,
      speed: 0,
    });
  }

  // Kích hoạt 1 vệt
  function spawn(trail) {
    const fromLeft = Math.random() < 0.5;
    trail.x = fromLeft ? -120 : 120;
    trail.y = 20 + Math.random() * 40;

    const angle = fromLeft ? -0.15 : Math.PI + 0.15;
    trail.dx = Math.cos(angle);
    trail.dy = Math.sin(angle);
    trail.speed = 40 + Math.random() * 30;

    // Đổi màu ngẫu nhiên
    const color = colors[Math.floor(Math.random() * colors.length)];
    trail.mat.color.setHex(color);

    // Kích thước vệt
    const w = 30 + Math.random() * 30;
    trail.sprite.scale.set(w, 2 + Math.random() * 2, 1);

    // Xoay sprite theo hướng bay
    trail.sprite.material.rotation = angle;

    trail.active = true;
    trail.age = 0;
  }

  let spawnTimer = 0;

  return {
    group,
    update(time, dt) {
      // Spawn mỗi 0.5s
      spawnTimer += dt;
      if (spawnTimer > 0.5) {
        spawnTimer = 0;
        const free = trails.find(t => !t.active);
        if (free) spawn(free);
      }

      // Update từng vệt
      for (const trail of trails) {
        if (!trail.active) continue;

        trail.age += dt;
        const t = trail.age / trail.life;

        if (t >= 1) {
          trail.active = false;
          trail.mat.opacity = 0;
          continue;
        }

        // Vị trí
        trail.x += trail.dx * trail.speed * dt;
        trail.y += trail.dy * trail.speed * dt;
        trail.sprite.position.set(trail.x, trail.y, -50);

        // Fade in/out
        let alpha = 1;
        if (t < 0.1) alpha = t / 0.1;
        else if (t > 0.7) alpha = (1 - t) / 0.3;
        trail.mat.opacity = alpha;
      }
    },
  };
}