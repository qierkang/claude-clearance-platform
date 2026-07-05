const lang = document.documentElement.lang || 'en';
const isZh = lang.toLowerCase().startsWith('zh');

const badge = [
  'background:#d97757',
  'color:#fff',
  'border-radius:6px',
  'padding:4px 8px',
  'font-weight:700',
].join(';');
const muted = 'color:#5d6973;font-weight:600';
const ok = 'color:#228a6f;font-weight:700';
const warn = 'color:#b58121;font-weight:700';

const info = {
  app: isZh ? 'Claude 通关局' : 'Claude Clearance',
  mode: isZh ? '娱乐检测 + 通关留言墙' : 'Fun scan + clearance wall',
  lang,
  path: location.pathname,
  repo: 'https://github.com/qierkang/claude-clearance-platform',
  api: `${location.origin}/api/check`,
  messages: `${location.origin}/api/messages`,
  geo: `${location.origin}/geo-index.json`,
  llms: `${location.origin}/llms.txt`,
};

console.groupCollapsed('%c Claude Clearance Platform ', badge);
console.log(
  `%c${isZh ? '启动信息' : 'Boot info'}%c ${info.app}`,
  ok,
  muted,
);
console.table(info);
console.log(
  `%cSEO/GEO%c sitemap + JSON-LD + llms.txt + geo-index.json`,
  ok,
  muted,
);
console.log(
  `%c${isZh ? '隐私边界' : 'Privacy'}%c ${
    isZh
      ? '检测结果只在浏览器本地计算；留言墙只展示你主动发布的内容。'
      : 'Scan results stay in browser; the wall only shows what visitors choose to post.'
  }`,
  warn,
  muted,
);
console.groupEnd();

export {};
