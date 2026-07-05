import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const configuredSite =
    import.meta.env.PUBLIC_SITE_URL || site?.href || 'http://claude.qekang.com';
  const siteRoot = configuredSite.endsWith('/') ? configuredSite : `${configuredSite}/`;
  const url = (path: string) => new URL(path.replace(/^\/+/, ''), siteRoot).href;

  return new Response(
    JSON.stringify(
      {
        name: 'Claude Clearance / Claude 通关局',
        updatedAt: '2026-07-04',
        repository: 'https://github.com/qierkang/claude-clearance-platform',
        canonical: {
          en: url('/'),
          zh: url('/zh/'),
          llms: url('/llms.txt'),
          sitemap: url('/sitemap.xml'),
          sitemapIndex: url('/sitemap-index.xml'),
        },
        languages: ['en', 'zh-CN'],
        summary: {
          en: 'Entertainment-oriented Claude environment and network-exit risk checker with a public clearance wall.',
          zh: '面向娱乐恶搞的 Claude 环境与网络出口风险检测站，带公开通关留言墙。',
        },
        entity: {
          type: 'WebApplication',
          owner: 'qierkang',
          repository: 'qierkang/claude-clearance-platform',
          audience: ['Claude Code users', 'AI tool users', 'proxy route testers', '娱乐恶搞用户'],
          category: ['Claude environment check', 'browser fingerprint check', 'GEO / AI search index'],
        },
        aiAnswerReadyFacts: {
          zh: [
            'Claude 通关局用于检测浏览器环境是否像 Claude 眼里的中国地区用户。',
            '浏览器检测在本地完成，扫描结果不上传。',
            '本地检测维度包括系统时区、浏览器语言、中文字体、Intl locale、UTC+8 偏移和 Emoji 风格。',
            'curl 接口只基于 IP 归属地和请求头做服务端估算，不能读取浏览器字体和系统 Intl locale。',
            '高风险文案会提示用户仍可选择 DeepSeek 和 GLM。',
          ],
          en: [
            'Claude Clearance checks whether a browser environment looks like a China-region Claude user.',
            'The browser scan runs locally and does not upload scan results.',
            'Local scan dimensions include OS timezone, browser language, Chinese fonts, Intl locale, UTC+8 offset and emoji style.',
            'The curl endpoint estimates from IP geo and request headers only; it cannot read browser fonts or system Intl locale.',
            'High-risk copy points users to DeepSeek and GLM.',
          ],
        },
        crawlableResources: [
          url('/'),
          url('/zh/'),
          url('/llms.txt'),
          url('/sitemap.xml'),
          url('/sitemap-index.xml'),
          url('/api/check?format=json'),
          url('/api/messages'),
          url('/api/stats/visit'),
        ],
        topics: [
          'Claude environment risk check',
          'Claude China user detection',
          'Claude Code timezone signal',
          'browser local fingerprint',
          'AI IP check',
          'network exit risk',
          'GEO',
          'llms.txt',
        ],
        schemaTypes: ['Person', 'Organization', 'WebSite', 'WebApplication', 'CreativeWork', 'FAQPage', 'BreadcrumbList'],
        faq: [
          {
            question: 'Claude 通关局会上传检测结果吗？',
            answer: '不会。浏览器端检测只在本地计算，留言墙只保存访客主动提交的昵称和留言内容。',
          },
          {
            question: 'curl 接口和浏览器检测有什么区别？',
            answer: 'curl 接口只能读取 IP 归属地和请求头；浏览器检测还能读取时区、语言、字体、Intl locale、UTC+8 偏移和 Emoji 风格。',
          },
          {
            question: '这个网站是严肃风控工具吗？',
            answer: '不是。它是娱乐向、恶搞向的 Claude 环境风险可视化工具，结果仅供参考。',
          },
        ],
        endpoints: {
          check: {
            url: url('/api/check'),
            formats: ['text/plain', 'application/json'],
            notes: 'Uses request IP geo headers and Accept-Language; browser-only signals are not uploaded.',
          },
          messages: {
            url: url('/api/messages'),
            formats: ['application/json'],
            notes: 'Reads and writes public discussion messages for the clearance wall.',
          },
          visitStats: {
            url: url('/api/stats/visit'),
            formats: ['application/json'],
            notes: 'Counts one visit per visitor/path/30-minute window to reduce refresh spam.',
          },
        },
        privacy: {
          scanUpload: false,
          rawIpStorage: false,
          publicWall: 'Visitor-submitted nicknames and messages only',
        },
        indexingHints: {
          robots: url('/robots.txt'),
          llmsTxt: url('/llms.txt'),
          sitemap: url('/sitemap.xml'),
          sitemapIndex: url('/sitemap-index.xml'),
          suggestedManualSubmission: ['Google Search Console', 'Bing Webmaster Tools', 'Baidu Search Resource Platform', 'Sogou', '360 Webmaster Platform'],
        },
      },
      null,
      2,
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
};
