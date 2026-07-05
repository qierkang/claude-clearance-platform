/**
 * Client-side entry point. Runs an animated "scan": each signal lights up in
 * turn, the gauge climbs as contributions add up, and once every signal has
 * been checked it shows a verdict plus the list of matched signals.
 * Everything runs locally in the browser.
 */
import { SIGNALS, riskBand, signalVerdict, type SignalDef } from '../config/signals';
import { CN_MODELS } from '../config/cn-models';
import { useTranslations, type Lang } from '../i18n/ui';

/** High-risk consolation links. URLs come from CN_MODELS (utm-tagged). */
const BAND_HIGH_LINKS = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'glm', label: 'GLM' },
].flatMap((link) => {
  const model = CN_MODELS.find((m) => m.id === link.id);
  return model ? [{ ...link, url: model.url }] : [];
});

const SCAN_STEP_MS = 460;
const SETTLE_MS = 150;

function currentLang(): Lang {
  return document.documentElement.lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
const t = useTranslations(currentLang());
const scanLogCopy = currentLang() === 'zh'
  ? {
      checking: '正在检测',
      hit: '命中',
      miss: '未命中',
      done: '检测完成',
    }
  : {
      checking: 'Checking',
      hit: 'Hit',
      miss: 'Clear',
      done: 'Scan complete',
    };

function q<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;
let scanLogTimer = 0;

interface Hit {
  signal: SignalDef;
  contribution: number;
}

type MascotState = 'doze' | 'search' | 'low' | 'medium' | 'high';
function setMascot(state: MascotState) {
  q('#mascot')?.setAttribute('data-state', state);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
let highRiskImpactTimers: number[] = [];
let highRiskImpactRun = 0;
let highRiskImpactHistory: Array<{ x: number; y: number }> = [];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function viewportRect() {
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

function jaggedPoints(x1: number, y1: number, x2: number, y2: number, segments: number, jitter: number) {
  const points: string[] = [`${x1},${y1}`];
  for (let i = 1; i < segments; i += 1) {
    const t = i / segments;
    const bx = x1 + (x2 - x1) * t;
    const by = y1 + (y2 - y1) * t;
    points.push(`${bx + rand(-jitter, jitter)},${by + rand(-jitter, jitter)}`);
  }
  points.push(`${x2},${y2}`);
  return points.join(' ');
}

function addSvgEl<K extends keyof SVGElementTagNameMap>(
  svg: SVGSVGElement,
  tag: K,
  attrs: Record<string, string | number>,
) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  svg.appendChild(el);
  return el;
}

function drawShatter(svg: SVGSVGElement, cx: number, cy: number, bounds: DOMRect) {
  svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

  addSvgEl(svg, 'circle', {
    class: 'shatter-hole',
    cx,
    cy,
    r: 7,
  });

  const inset = 18;
  const left = bounds.left + inset;
  const right = bounds.right - inset;
  const top = bounds.top + inset;
  const bottom = bounds.bottom - inset;
  const maxLen = clamp(Math.min(bounds.width, bounds.height) * 0.36, 145, 245);

  for (let i = 0; i < 15; i += 1) {
    const angle = (i / 15) * Math.PI * 2 + rand(-0.18, 0.18);
    const len = rand(maxLen * 0.45, maxLen);
    const ex = clamp(cx + Math.cos(angle) * len, left, right);
    const ey = clamp(cy + Math.sin(angle) * len, top, bottom);
    const points = jaggedPoints(cx, cy, ex, ey, 5, 8);

    addSvgEl(svg, 'polyline', { class: 'shatter-ray', points });
    addSvgEl(svg, 'polyline', { class: 'shatter-ray shatter-ray--bright', points });

    if (Math.random() > 0.34) {
      const midT = rand(0.34, 0.68);
      const mx = cx + (ex - cx) * midT;
      const my = cy + (ey - cy) * midT;
      const branchAngle = angle + rand(-0.95, 0.95);
      const branchLen = rand(34, 86);
      const bx = clamp(mx + Math.cos(branchAngle) * branchLen, left, right);
      const by = clamp(my + Math.sin(branchAngle) * branchLen, top, bottom);
      addSvgEl(svg, 'polyline', {
        class: 'shatter-branch',
        points: jaggedPoints(mx, my, bx, by, 3, 7),
      });
    }
  }

  [26, 52, 86, 124].forEach((radius, index) => {
    const points: string[] = [];
    const segs = 28;
    for (let i = 0; i <= segs; i += 1) {
      const angle = (i / segs) * Math.PI * 2;
      const rr = radius + rand(-5, 5);
      const x = clamp(cx + Math.cos(angle) * rr, left, right);
      const y = clamp(cy + Math.sin(angle) * rr, top, bottom);
      points.push(`${x},${y}`);
    }
    const ring = addSvgEl(svg, 'polygon', {
      class: 'shatter-ring',
      points: points.join(' '),
    });
    ring.setAttribute('opacity', String(0.62 - index * 0.1));
  });
}

function clearHighRiskImpact() {
  highRiskImpactRun += 1;
  for (const timer of highRiskImpactTimers) {
    window.clearTimeout(timer);
  }
  highRiskImpactTimers = [];
  highRiskImpactHistory = [];
  q('#impact-fx')?.classList.remove('is-active');
  const scene = q<SVGSVGElement>('#impact-crack-scene');
  if (scene) scene.innerHTML = '';
  document.documentElement.classList.remove('impact-shake');
}

function resetScanLog() {
  window.clearTimeout(scanLogTimer);
  scanLogTimer = 0;
  const log = q<HTMLElement>('#scan-log');
  if (!log) return;
  log.hidden = true;
  log.innerHTML = '';
  log.classList.remove('is-visible', 'is-exiting');
}

function showScanLog() {
  const log = q<HTMLElement>('#scan-log');
  if (!log) return;
  log.hidden = false;
  log.classList.remove('is-exiting');
  void log.offsetWidth;
  log.classList.add('is-visible');
}

function appendScanLog(signal: SignalDef) {
  const log = q<HTMLElement>('#scan-log');
  if (!log) return null;
  showScanLog();

  const row = document.createElement('article');
  row.className = 'scan-log__row';
  row.dataset.status = 'checking';
  row.dataset.logSignal = signal.id;

  const dot = document.createElement('span');
  dot.className = 'scan-log__dot';
  dot.setAttribute('aria-hidden', 'true');

  const main = document.createElement('span');
  main.className = 'scan-log__main';

  const name = document.createElement('span');
  name.className = 'scan-log__name';
  name.textContent = t(`signal.${signal.id}.name`);

  const value = document.createElement('span');
  value.className = 'scan-log__value';
  value.textContent = '...';

  const state = document.createElement('span');
  state.className = 'scan-log__state';
  state.textContent = scanLogCopy.checking;

  main.append(name, value);
  row.append(dot, main, state);
  log.appendChild(row);
  return row;
}

function updateScanLog(row: HTMLElement | null, verdict: string, raw: string, contribution: number) {
  if (!row) return;
  const isHit = verdict !== 'low';
  row.dataset.status = isHit ? 'hit' : 'miss';
  const value = q<HTMLElement>('.scan-log__value', row);
  const state = q<HTMLElement>('.scan-log__state', row);
  if (value) value.textContent = String(raw || '-');
  if (state) state.textContent = isHit ? `${scanLogCopy.hit} +${contribution}` : scanLogCopy.miss;
}

function hideScanLogSoon() {
  const log = q<HTMLElement>('#scan-log');
  if (!log) return;
  window.clearTimeout(scanLogTimer);
  scanLogTimer = window.setTimeout(() => {
    log.classList.add('is-exiting');
    log.classList.remove('is-visible');
    scanLogTimer = window.setTimeout(resetScanLog, 520);
  }, 1800);
}

function triggerHighRiskImpact(shotIndex: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fx = q<HTMLElement>('#impact-fx');
  const mascot = q<HTMLElement>('#mascot');
  const scene = q<SVGSVGElement>('#impact-crack-scene');
  if (!fx || !mascot || !scene) return;

  const mascotRect = mascot.getBoundingClientRect();
  const pageRect = viewportRect();
  const shotX = mascotRect.left + mascotRect.width * 0.24;
  const shotY = mascotRect.top + mascotRect.height * 0.44;
  const marginX = clamp(window.innerWidth * 0.07, 72, 150);
  const marginTop = clamp(window.innerHeight * 0.12, 96, 170);
  const marginBottom = clamp(window.innerHeight * 0.08, 74, 135);
  const minGap = clamp(Math.min(window.innerWidth, window.innerHeight) * 0.34, 210, 390);
  let impactX = rand(marginX, window.innerWidth - marginX);
  let impactY = rand(marginTop, window.innerHeight - marginBottom);

  for (let i = 0; i < 32; i += 1) {
    const candidateX = rand(marginX, window.innerWidth - marginX);
    const candidateY = rand(marginTop, window.innerHeight - marginBottom);
    const farEnoughFromHits = highRiskImpactHistory.every((hit) => Math.hypot(candidateX - hit.x, candidateY - hit.y) >= minGap);
    const farEnoughFromGun = Math.hypot(candidateX - shotX, candidateY - shotY) >= minGap * 0.76;
    impactX = candidateX;
    impactY = candidateY;
    if (farEnoughFromHits && farEnoughFromGun) break;
  }

  impactX = clamp(impactX, marginX, window.innerWidth - marginX);
  impactY = clamp(impactY, marginTop, window.innerHeight - marginBottom);
  const dx = impactX - shotX;
  const dy = impactY - shotY;
  const dist = Math.max(160, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);

  fx.style.setProperty('--shot-x', `${shotX}px`);
  fx.style.setProperty('--shot-y', `${shotY}px`);
  fx.style.setProperty('--impact-x', `${impactX}px`);
  fx.style.setProperty('--impact-y', `${impactY}px`);
  fx.style.setProperty('--shot-dist', `${dist}px`);
  fx.style.setProperty('--shot-angle', `${angle}rad`);

  fx.classList.remove('is-active');
  document.documentElement.classList.remove('impact-shake');
  scene.innerHTML = '';
  drawShatter(scene, impactX, impactY, pageRect);
  highRiskImpactHistory.push({ x: impactX, y: impactY });
  highRiskImpactHistory = highRiskImpactHistory.slice(-6);
  void fx.offsetWidth;
  fx.classList.add('is-active');
  document.documentElement.classList.add('impact-shake');
}

function triggerHighRiskImpactSequence() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  clearHighRiskImpact();
  const runId = highRiskImpactRun;
  [0, 1, 2, 3, 4].forEach((shotIndex) => {
    const timer = window.setTimeout(() => {
      if (runId === highRiskImpactRun) triggerHighRiskImpact(shotIndex);
    }, shotIndex * 760);
    highRiskImpactTimers.push(timer);
  });

  const cleanupTimer = window.setTimeout(() => {
    if (runId !== highRiskImpactRun) return;
    q('#impact-fx')?.classList.remove('is-active');
    document.documentElement.classList.remove('impact-shake');
  }, 5000);
  highRiskImpactTimers.push(cleanupTimer);
}

function setRing(total: number) {
  const ring = q<SVGCircleElement>('#score-ring');
  const valueEl = q('#score-value');
  if (ring) {
    ring.style.strokeDasharray = `${RING_C}px`;
    ring.style.strokeDashoffset = `${RING_C * (1 - total / 100)}px`;
  }
  if (valueEl) valueEl.textContent = String(total);
}

function resetUI() {
  clearHighRiskImpact();
  resetScanLog();
  setRing(0);
  const gauge = q('#score-gauge');
  gauge?.removeAttribute('data-band');
  gauge?.setAttribute('data-scanning', 'true');

  const badge = q('#risk-badge');
  if (badge) {
    badge.textContent = t('scan.detecting') + '…';
    badge.removeAttribute('data-band');
  }
  const desc = q('#risk-desc');
  if (desc) desc.textContent = '';

  const result = q('#result');
  if (result) result.hidden = true;

  for (const s of SIGNALS) {
    const row = q(`[data-signal="${s.id}"]`);
    if (!row) continue;
    row.classList.remove('is-active', 'is-done');
    row.classList.add('is-pending');
    row.removeAttribute('data-verdict');
    const val = q('[data-field="value"]', row);
    const contrib = q('[data-field="contribution"]', row);
    const dot = q('[data-field="dot"]', row);
    if (val) val.textContent = '';
    if (contrib) contrib.textContent = '';
    if (dot) dot.className = 'dot';
  }
}

function finalize(total: number, hits: Hit[]) {
  const band = riskBand(total);
  setMascot(band);
  if (band === 'high') {
    window.setTimeout(triggerHighRiskImpactSequence, 260);
  }
  q('#score-gauge')?.removeAttribute('data-scanning');
  q('#score-gauge')?.setAttribute('data-band', band);

  const badge = q('#risk-badge');
  if (badge) {
    badge.textContent = t(`band.${band}.title`);
    badge.setAttribute('data-band', band);
  }
  const desc = q('#risk-desc');
  if (desc) {
    desc.textContent = t(`band.${band}.desc`);
    // High risk gets a consolation plug.
    if (band === 'high') {
      desc.append(` ${t('band.high.extra')} `);
      BAND_HIGH_LINKS.forEach((link, i) => {
        if (i > 0) {
          desc.append(i === BAND_HIGH_LINKS.length - 1 ? t('band.high.extraSepLast') : t('band.high.extraSep'));
        }
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = link.label;
        a.setAttribute('data-ga-event', 'cn_model_click');
        a.setAttribute('data-ga-id', `${link.id}-band-high`);
        desc.appendChild(a);
      });
    }
  }

  const titleEl = q('#result-title');
  const hitsBox = q('#result-hits');
  if (hitsBox) hitsBox.innerHTML = '';

  if (hits.length === 0) {
    if (titleEl) titleEl.textContent = t('result.noHits');
  } else {
    if (titleEl) titleEl.textContent = t('result.hitsTitle');
    for (const { signal, contribution } of hits) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.setAttribute('data-verdict', signalVerdict(contribution / signal.weight));
      chip.innerHTML =
        `<span class="chip__icon">${signal.icon}</span>` +
        `<span>${t(`signal.${signal.id}.name`)}</span>` +
        `<b>+${contribution}</b>`;
      hitsBox?.appendChild(chip);
    }
  }

  const result = q('#result');
  if (result) result.hidden = false;
}

function fallbackCopy(textToCopy: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = textToCopy;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the execCommand fallback */
  }
  return fallbackCopy(text);
}

/** Flash a button into its confirmed state, then restore the idle label. */
function flashCopied(btn: HTMLElement, label: Element | null, idle: string, flashText = t('share.copied')) {
  btn.classList.add('is-copied');
  if (label) label.textContent = flashText;
  setTimeout(() => {
    btn.classList.remove('is-copied');
    if (label) label.textContent = idle;
  }, 1600);
}

/** Remember an explicit language choice so the homepage auto-detect respects it. */
function initLangMemory() {
  for (const a of document.querySelectorAll<HTMLAnchorElement>('.lang-toggle a[data-lang]')) {
    a.addEventListener('click', () => {
      try {
        localStorage.setItem('fc-lang', a.dataset.lang || '');
      } catch {
        /* localStorage unavailable (private mode) — auto-detect still works */
      }
    });
  }
}

/** Copy-to-clipboard for the default curl command shown in the API section. */
function initApiCopy() {
  const btn = q<HTMLButtonElement>('#api-copy');
  const label = q('#api-copy-label');
  const idle = label?.textContent ?? t('share.copy');
  btn?.addEventListener('click', async () => {
    const text = btn.dataset.copy?.trim() ?? '';
    if (text && (await copyText(text))) flashCopied(btn, label, idle);
  });
}

let running = false;

async function run() {
  if (running) return;
  running = true;
  const btn = q<HTMLButtonElement>('#retest');
  if (btn) btn.disabled = true;

  setMascot('search');
  resetUI();
  await delay(SETTLE_MS);

  let total = 0;
  const hits: Hit[] = [];

  for (const signal of SIGNALS) {
    const row = q(`[data-signal="${signal.id}"]`);
    row?.classList.remove('is-pending');
    row?.classList.add('is-active');
    const logRow = appendScanLog(signal);
    await delay(SCAN_STEP_MS);

    let outcome;
    try {
      outcome = signal.detect();
    } catch {
      outcome = { raw: '—', score: 0 };
    }
    const contribution = Math.round(outcome.score * signal.weight);
    const verdict = signalVerdict(outcome.score);
    total += contribution;
    updateScanLog(logRow, verdict, outcome.raw, contribution);

    if (row) {
      const val = q('[data-field="value"]', row);
      const contrib = q('[data-field="contribution"]', row);
      const dot = q('[data-field="dot"]', row);
      if (val) val.textContent = outcome.raw;
      if (contrib) contrib.textContent = `+${contribution}`;
      if (dot) dot.className = `dot dot--${verdict}`;
      row.classList.remove('is-active');
      row.classList.add('is-done');
      row.setAttribute('data-verdict', verdict);
    }

    setRing(Math.min(100, total));
    if (verdict !== 'low') hits.push({ signal, contribution });
    await delay(SETTLE_MS);
  }

  finalize(Math.min(100, total), hits);
  hideScanLogSoon();
  const label = q('#retest-label');
  if (label) label.textContent = t('ui.retest');
  if (btn) btn.disabled = false;
  running = false;
}

/**
 * No auto-run: the mascot dozes until the user hits "Start scan",
 * then it wakes up and hunts for signals.
 */
function init() {
  q('#retest')?.addEventListener('click', () => run());
  initApiCopy();
  initLangMemory();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
