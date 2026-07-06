interface PublicStats {
  totalVisits: number;
  totalUniqueVisitors: number;
  visits24h: number;
  messageCount: number;
}

interface PublicMessage {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  source: string;
}

interface MessagesResponse {
  ok: boolean;
  message?: PublicMessage;
  messages?: PublicMessage[];
  stats?: PublicStats;
  error?: string;
}

let currentMessages: PublicMessage[] = [];
let loopTimer = 0;
let scrollFrame = 0;
let lastScrollTs = 0;
let userPausedUntil = 0;
let programmaticScrollUntil = 0;
let scrollGuard = false;

const root = document.querySelector<HTMLElement>('[data-community]');
const lang = root?.dataset.lang || (document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');
const isZh = lang === 'zh';

const copy = isZh
  ? {
      ready: '留言墙已就绪',
      unavailable: '留言墙暂时开小差了',
      posting: '正在发布...',
      posted: '已发布',
      rateLimited: '5 秒内最多发布 2 条留言',
      invalid: '留言不能为空',
      failed: '发布失败，稍后再试',
      empty: '还没有留言，抢第一条。',
    }
  : {
      ready: 'Message wall is ready',
      unavailable: 'Message wall is taking a short break',
      posting: 'Posting...',
      posted: 'Posted',
      rateLimited: 'Up to 2 messages every 5 seconds',
      invalid: 'Message cannot be empty',
      failed: 'Post failed. Please try again later',
      empty: 'No messages yet.',
    };

function setStatus(text: string) {
  const el = document.querySelector<HTMLElement>('[data-community-status]');
  if (el) el.textContent = text;
}

function setFormStatus(text: string, tone: 'normal' | 'error' = 'normal') {
  const el = document.querySelector<HTMLElement>('[data-form-status]');
  if (!el) return;
  el.textContent = text;
  el.dataset.tone = tone;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(isZh ? 'zh-CN' : 'en-US').format(value || 0);
}

function updateStats(stats?: PublicStats) {
  if (!stats) return;
  for (const [key, value] of Object.entries(stats)) {
    const el = document.querySelector<HTMLElement>(`[data-stat="${key}"]`);
    if (el) el.textContent = formatNumber(Number(value));
  }
}

function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function stopTickerLoop() {
  window.clearTimeout(loopTimer);
  window.cancelAnimationFrame(scrollFrame);
  loopTimer = 0;
  scrollFrame = 0;
  lastScrollTs = 0;
}

function bindTickerControls(ticker: HTMLElement, list: HTMLElement) {
  if (ticker.dataset.bound === 'true') return;
  ticker.dataset.bound = 'true';

  const pauseForManualScroll = () => {
    userPausedUntil = performance.now() + 1400;
  };

  ticker.addEventListener('wheel', pauseForManualScroll, { passive: true });
  ticker.addEventListener('touchstart', pauseForManualScroll, { passive: true });
  ticker.addEventListener('pointerdown', pauseForManualScroll, { passive: true });
  ticker.addEventListener('scroll', () => {
    if (scrollGuard) return;
    if (performance.now() < programmaticScrollUntil) return;
    pauseForManualScroll();
    const loopDistance = list.scrollHeight / 2;
    if (loopDistance <= ticker.clientHeight) return;
    if (ticker.scrollTop >= loopDistance) {
      scrollGuard = true;
      ticker.scrollTop -= loopDistance;
      scrollGuard = false;
    }
  }, { passive: true });
}

function startTickerLoop(list: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ticker = list.closest<HTMLElement>('.community__ticker');
  if (!ticker) return;

  bindTickerControls(ticker, list);
  ticker.scrollTop = 0;
  lastScrollTs = 0;

  const tick = (ts: number) => {
    const loopDistance = list.scrollHeight / 2;
    if (loopDistance <= ticker.clientHeight + 8) {
      scrollFrame = window.requestAnimationFrame(tick);
      return;
    }

    if (!lastScrollTs) lastScrollTs = ts;
    const delta = Math.min(48, ts - lastScrollTs);
    lastScrollTs = ts;

    if (ts >= userPausedUntil) {
      const pxPerSecond = 70;
      programmaticScrollUntil = performance.now() + 80;
      scrollGuard = true;
      ticker.scrollTop += (pxPerSecond * delta) / 1000;
      if (ticker.scrollTop >= loopDistance) {
        ticker.scrollTop -= loopDistance;
      }
      scrollGuard = false;
    }

    scrollFrame = window.requestAnimationFrame(tick);
  };

  scrollFrame = window.requestAnimationFrame(tick);
}

function renderMessages(messages: PublicMessage[] = [], newestId?: number) {
  const list = document.querySelector<HTMLElement>('#community-list');
  if (!list) return;
  currentMessages = messages;
  stopTickerLoop();
  list.innerHTML = '';
  if (!messages.length) {
    const empty = document.createElement('p');
    empty.className = 'community__empty';
    empty.textContent = copy.empty;
    list.appendChild(empty);
    return;
  }

  const renderItem = (message: PublicMessage, duplicate = false) => {
    const item = document.createElement('article');
    item.className = 'community-message';
    if (!duplicate && message.id === newestId) item.classList.add('is-new');
    if (duplicate) item.setAttribute('aria-hidden', 'true');

    const meta = document.createElement('div');
    meta.className = 'community-message__meta';

    const author = document.createElement('span');
    author.className = 'community-message__author';
    author.textContent = message.authorName;

    const time = document.createElement('time');
    time.className = 'community-message__time';
    time.dateTime = message.createdAt;
    time.textContent = timeLabel(message.createdAt);

    const body = document.createElement('p');
    body.className = 'community-message__body';
    body.textContent = message.content;

    meta.append(author, time);
    item.append(meta, body);
    list.appendChild(item);
  };

  for (const message of messages) {
    renderItem(message);
  }
  if (messages.length > 3) {
    for (const message of messages) {
      renderItem(message, true);
    }
    const startLoop = () => startTickerLoop(list);
    if (newestId !== undefined) {
      loopTimer = window.setTimeout(startLoop, 1300);
    } else {
      startLoop();
    }
  }
}

const ZH_NAMES = [
  '摸鱼的老张', '隔壁陈同学', '熬夜的李工', '低调周老板', '南方小透明',
  '赛博王师傅', '路过的阿强', '认真赵师傅', '上海小宁', '广州阿杰',
  '北方老许', '杭州小林', '成都刘同学', '深圳打工人', '佛系吴老师',
  '热心王大哥', '清醒的老孙', '苏州小顾', '武汉陈师傅', '重庆周同学',
];

const EN_NAMES = ['Night Shift Lee', 'Passing Visitor', 'Route Watcher', 'Quiet Builder', 'Proxy Traveler'];

function randomName(): string {
  const names = isZh ? ZH_NAMES : EN_NAMES;
  return names[Math.floor(Math.random() * names.length)] || names[0];
}

function initComposer() {
  const author = document.querySelector<HTMLInputElement>('#community-author');
  const content = document.querySelector<HTMLTextAreaElement>('#community-content');
  const counter = document.querySelector<HTMLElement>('[data-message-count]');
  const shuffle = document.querySelector<HTMLButtonElement>('[data-random-name]');
  if (!author || !content) return;

  const storedName = sessionStorage.getItem('community-random-name') || randomName();
  author.value = storedName;
  sessionStorage.setItem('community-random-name', storedName);

  shuffle?.addEventListener('click', () => {
    const nextName = randomName();
    author.value = nextName;
    sessionStorage.setItem('community-random-name', nextName);
    author.animate(
      [{ opacity: 0.35, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
  });

  const updateCount = () => {
    if (counter) counter.textContent = String(content.value.length);
  };
  content.addEventListener('input', updateCount);
  document.querySelectorAll<HTMLButtonElement>('[data-emoji]').forEach((button) => {
    button.addEventListener('click', () => {
      const emoji = button.dataset.emoji || '';
      const start = content.selectionStart;
      content.setRangeText(emoji, start, content.selectionEnd, 'end');
      content.focus();
      updateCount();
    });
  });
}

async function recordVisit() {
  try {
    const response = await fetch('/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname, lang }),
      keepalive: true,
    });
    const data = (await response.json()) as { ok: boolean; stats?: PublicStats };
    if (data.ok) updateStats(data.stats);
  } catch {
    /* Stats should never block the page. */
  }
}

async function loadMessages() {
  try {
    const response = await fetch('/api/messages?limit=10', {
      headers: { Accept: 'application/json' },
    });
    const data = (await response.json()) as MessagesResponse;
    if (!response.ok || !data.ok) throw new Error(data.error || 'load_failed');
    updateStats(data.stats);
    renderMessages(data.messages || []);
    setStatus(copy.ready);
  } catch {
    renderMessages([]);
    setStatus(copy.unavailable);
  }
}

function initForm() {
  const form = document.querySelector<HTMLFormElement>('#community-form');
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !submit) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      authorName: String(formData.get('authorName') || '').trim(),
      content: String(formData.get('content') || '').trim(),
    };
    if (!payload.content) {
      setStatus(copy.invalid);
      return;
    }

    submit.disabled = true;
    setStatus(copy.posting);
    setFormStatus(copy.posting);
    const previousMessages = [...currentMessages];
    const optimisticMessage: PublicMessage = {
      id: -Date.now(),
      authorName: payload.authorName || (isZh ? '匿名访客' : 'Anonymous'),
      content: payload.content,
      createdAt: new Date().toISOString(),
      source: 'web',
    };
    renderMessages([optimisticMessage, ...previousMessages], optimisticMessage.id);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as MessagesResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || 'post_failed');
      form.reset();
      const author = form.querySelector<HTMLInputElement>('#community-author');
      if (author) author.value = sessionStorage.getItem('community-random-name') || randomName();
      const counter = document.querySelector<HTMLElement>('[data-message-count]');
      if (counter) counter.textContent = '0';
      updateStats(data.stats);
      renderMessages(data.messages || [data.message || optimisticMessage, ...previousMessages], data.message?.id);
      setStatus(copy.posted);
      setFormStatus(copy.posted);
    } catch (error) {
      const code = (error as Error).message;
      const message = code === 'message_rate_limited' ? copy.rateLimited : copy.failed;
      renderMessages(previousMessages);
      setStatus(message);
      setFormStatus(message, 'error');
    } finally {
      submit.disabled = false;
    }
  });
}

function init() {
  if (!root) return;
  void recordVisit().finally(loadMessages);
  initForm();
  initComposer();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
