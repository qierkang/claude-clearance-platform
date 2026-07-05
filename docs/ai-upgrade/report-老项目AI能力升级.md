# 老项目 AI 能力升级报告

## Project

- Project name: `claude-clearance-platform`
- Project path: `~/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform`
- Project lang: `node`
- Project type: `existing`
- Upgrade date: `2026-07-04`

## Scanned Scope

- README: `1`
- AGENTS: `1`
- CLAUDE: `1`
- assets: `1`
- docs: `1`
- graphify report: `1`
- Docker entry: `0`
- 关键源码：`src/config/signals.ts`、`src/scripts/detect.ts`、`src/pages/api/check.ts`、`src/components/Detector.astro`
- 外部参考：`https://ipinfo.cv/claude-ai-check` 公开定位为 Claude AI 可用性/IP 风险检测；普通抓取被 Cloudflare challenge 拦截，因此只采用可验证的公开检查维度，不复刻其内部实现。

## Upgrade Actions

- AGENTS.md: preserved (already existed)
- CLAUDE.md: preserved (already existed)
- START-HERE.md: preserved (already existed)
- docs/ai-upgrade/report-老项目AI能力升级.md: added or refreshed
- assets/platform/{architecture,design,flow}/
- docs/{requirements,design,architecture,testing,deployment,api}/
- README.md: added Claude Clearance upgrade section and direct image references
- README.md: rewritten into Simplified Chinese platform-project-skill open-source README structure
- docs/README_en.md: rewritten as a full English counterpart with equivalent structure
- docs/documents/report-检测逻辑分析.md: added logic analysis
- src/components/Detector.astro: added clearance matrix UI
- src/i18n/ui.ts: added Claude Clearance bilingual copy
- src/layouts/BaseLayout.astro: adjusted product palette
- src/pages/api/check.ts: updated response app name
- package.json: updated fork project name and description
- graphify-out/GRAPH_REPORT.md: generated code graph report

## Assets Added

- Architecture image: `assets/platform/architecture/claude-clearance-architecture.png`
- UI design image: `assets/platform/design/claude-clearance-ui-design.png`
- Flow image: `assets/platform/flow/claude-clearance-check-flow.png`
- Chinese social preview: `assets/social-preview.png`
- English social preview: `assets/social-preview-en.png`
- Chinese architecture image: `assets/platform/architecture/zh-CN/claude-clearance-architecture.png`
- English architecture image: `assets/platform/architecture/en/claude-clearance-architecture.png`
- Chinese UI design image: `assets/platform/design/zh-CN/claude-clearance-ui-design.png`
- English UI design image: `assets/platform/design/en/claude-clearance-ui-design.png`
- Chinese flow image: `assets/platform/flow/zh-CN/claude-clearance-check-flow.png`
- English flow image: `assets/platform/flow/en/claude-clearance-check-flow.png`
- Manifest: `assets/asset-manifest.json`

## Intentionally Unchanged

- 源码目录结构
- 构建/打包/部署系统
- 业务模块命名
- 现有 README 业务段落（仅在缺失时新建）

## Risks

- 当前升级版 UI 已纳入网络出口检查维度，但真实 WebRTC/DNS/ASN 检测尚未接入执行逻辑；后续实现时必须明确提示会访问服务端或第三方 IP API。
- `/api/check` 依赖 Vercel geo headers，本地或非 Vercel 部署只能得到降级估算。
- 原项目 README 中保留了原作者、原域名和赞助信息，后续公开发布前应确认是否继续保留这些外链。

## Next Recommendations

- 将网络出口检测拆成显式 opt-in：出口 IP/ASN、WebRTC 泄漏、DNS 泄漏、分流一致性。
- 将服务端估算接口的站点域名从原上游部署域名切换为新仓库对应的临时站点地址。
- 发布前运行 README gate、构建、截图和端到端冒烟。
