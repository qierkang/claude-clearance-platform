const CARD_SELECTOR = [
  '.panel',
  '.scan-row',
  '.matrix-card',
  '.prose',
  '.api-cmd',
  '.faq details',
  '.privacy',
  '.community__panel',
  '.community__stats span',
  '.community__form',
  '.community-message',
].join(',');

const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canTrackPointer) {
  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>(CARD_SELECTOR);
      if (!card) return;

      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
    },
    { passive: true },
  );
}
