// =========================================================
// HIỆU ỨNG: VIỀN LED — DÀY, NHẤP NHÁY MẠNH
// =========================================================
export function startLedBorder() {
  const frame = document.createElement('div');
  frame.id = 'led-frame';
  document.body.appendChild(frame);

  if (!document.getElementById('led-style')) {
    const style = document.createElement('style');
    style.id = 'led-style';
    style.textContent = `
      #led-frame {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99;
        padding: 16px;                        /* 🎯 viền dày 16px */
        box-sizing: border-box;
        border-radius: 20px;

        background: linear-gradient(
          90deg,
          #ff5fa2, #ffb6d9, #a8e6ff, #c8b6ff, #b6ffcc, #ffeb3b, #ff5fa2
        );
        background-size: 400% 100%;

        /* 🎯 2 animation: chạy màu + nhấp nháy */
        animation:
          ledSlide 4s linear infinite,
          ledBlink 0.8s ease-in-out infinite;

        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;

        /* 🎯 Glow mạnh */
        box-shadow:
          inset 0 0 25px rgba(255, 95, 162, 0.8),
          inset 0 0 50px rgba(168, 230, 255, 0.6),
          inset 0 0 80px rgba(200, 182, 255, 0.4);

        will-change: background-position, opacity;
      }

      @keyframes ledSlide {
        0%   { background-position: 0% 50%; }
        100% { background-position: 400% 50%; }
      }

      /* 🎯 Nhấp nháy mạnh kiểu LED */
      @keyframes ledBlink {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.65;
        }
      }
    `;
    document.head.appendChild(style);
  }
}