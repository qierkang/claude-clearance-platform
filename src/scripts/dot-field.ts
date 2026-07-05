const canvas = document.querySelector<HTMLCanvasElement>('[data-dot-field]');

if (canvas) {
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pointer = { x: -1000, y: -1000, active: false };
  let width = 0;
  let height = 0;
  let frame = 0;
  let startTime = performance.now();

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (now = performance.now()) => {
    if (!context) return;
    context.clearRect(0, 0, width, height);

    const spacing = width < 640 ? 30 : 36;
    const elapsed = reducedMotion.matches ? 0 : (now - startTime) * 0.00045;
    const influence = 116;

    for (let y = spacing / 2; y < height + spacing; y += spacing) {
      for (let x = spacing / 2; x < width + spacing; x += spacing) {
        const waveX = reducedMotion.matches ? 0 : Math.sin(y * 0.018 + elapsed * 2.4) * 2.2;
        const waveY = reducedMotion.matches ? 0 : Math.cos(x * 0.016 + elapsed * 2) * 1.8;
        let drawX = x + waveX;
        let drawY = y + waveY;
        let proximity = 0;

        if (pointer.active && !reducedMotion.matches) {
          const dx = drawX - pointer.x;
          const dy = drawY - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < influence && distance > 0) {
            proximity = 1 - distance / influence;
            const force = proximity * proximity * 15;
            drawX += (dx / distance) * force;
            drawY += (dy / distance) * force;
          }
        }

        const pulse = reducedMotion.matches ? 0 : (Math.sin(x * 0.025 + y * 0.021 + elapsed * 3) + 1) / 2;
        const radius = 0.9 + pulse * 0.35 + proximity * 0.85;
        const alpha = 0.14 + pulse * 0.08 + proximity * 0.35;

        context.beginPath();
        context.arc(drawX, drawY, radius, 0, Math.PI * 2);
        context.fillStyle = proximity > 0.04
          ? `rgba(217, 119, 87, ${alpha})`
          : `rgba(76, 94, 105, ${alpha})`;
        context.fill();
      }
    }
  };

  const loop = (now: number) => {
    draw(now);
    frame = requestAnimationFrame(loop);
  };

  const syncAnimation = () => {
    cancelAnimationFrame(frame);
    startTime = performance.now();
    if (reducedMotion.matches || document.hidden) {
      draw();
    } else {
      frame = requestAnimationFrame(loop);
    }
  };

  resize();
  syncAnimation();

  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion.matches) draw();
  }, { passive: true });
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', syncAnimation);

  if (finePointer) {
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => {
      pointer.active = false;
    });
  }
}
