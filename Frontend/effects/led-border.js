// =========================================================
// HIỆU ỨNG: VIỀN LED — DÀY, BO GÓC, NHẤP NHÁY NHẸ
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
        padding: 8px;
        box-sizing: border-box;
        border-radius: 24px;                  /* 🎯 bo tròn 4 góc */
        overflow: hidden;

        background: linear-gradient(
          90deg,
          #ff5fa2, #ffb6d9, #a8e6ff, #c8b6ff, #b6ffcc, #ff5fa2
        );
        background-size: 300% 100%;

        /* 🎯 Chỉ 1 animation — chạy màu. Không dùng filter để khỏi lag */
        animation: ledSlide 6s linear infinite;

        /* Mask để ruột trong suốt */
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;

        /* Glow nhẹ — chỉ 2 lớp để đỡ lag */
        box-shadow:
          inset 0 0 15px rgba(255, 95, 162, 0.6),
          inset 0 0 30px rgba(168, 230, 255, 0.4);

        will-change: background-position;
      }

      @keyframes ledSlide {
        0%   { background-position: 0% 50%; }
        100% { background-position: 300% 50%; }
      }

      /* 🎯 Lớp phủ mờ nhấp nháy — dùng opacity, nhẹ hơn filter */
      #led-frame::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 24px;
        background: radial-gradient(
          circle at 50% 50%,
          rgba(255, 150, 200, 0) 60%,
          rgba(255, 150, 200, 0.25) 100%
        );
        animation: ledPulse 1.5s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ledPulse {
        0%, 100% { opacity: 0.4; }
        50%      { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}