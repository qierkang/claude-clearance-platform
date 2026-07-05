# Claude Clearance

<!-- Keywords: Claude detection, Claude Code risk check, Claude AI IP check, browser fingerprint, network exit risk, Astro TypeScript, local-first diagnostics, AI handoff, AGENTS.md, platform-project-skill -->

<div align="center">
  <img src="../assets/social-preview-en.png?v=2" alt="Claude Clearance — playful local-first Claude environment check and community wall" width="100%">
</div>

<div align="center">
  <strong>Local-first Claude environment and network-exit risk checks</strong>
  <br>
  <em>An upgraded FuckClaude fork that separates local browser signals, network exit checks, evidence, and fix guidance.</em>
  <br><br>
  <code>Astro</code> · <code>TypeScript</code> · <code>Vercel Function</code> · <code>AGENTS.md</code> — ready for open-source diagnostics and AI handoff
  <br>
  <p>Explain risk first, then show what to inspect.</p>
  <br>
  <p>If this project is useful, a Star helps other developers find it.</p>
</div>

<div align="center">

<a href="#快速开始--quick-start">Quick Start</a> · <a href="../README.md">简体中文</a> · <a href="#工作流总览--workflow-overview">Workflow</a> · <a href="#系统架构--architecture">Architecture</a> · <a href="#常见问题--faq">FAQ</a>

</div>

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](../LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-informational.svg?style=for-the-badge)](#版本说明--version-notes)
[![Status](https://img.shields.io/badge/status-validation_done-success.svg?style=for-the-badge)](#项目状态--project-status)
[![Astro](https://img.shields.io/badge/Astro-7.x-FF5D01.svg?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-local--first-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](#技术栈--tech-stack)
[![AI Handoff](https://img.shields.io/badge/AI_Handoff-AGENTS.md-orange.svg?style=for-the-badge)](../AGENTS.md)

</div>

---

![Claude Clearance architecture](../assets/platform/architecture/en/claude-clearance-architecture.png)

---

## 为什么需要 Claude Clearance？ · Why This Exists

Claude-related diagnostic tools often mix three different layers: what the browser can see locally, what an IP check service can see from the network, and what public reverse-engineering reports describe for Claude Code. When these are collapsed into one opaque score, users cannot tell whether they should review OS settings, browser language, proxy routes, DNS, or ASN exposure.

- FuckClaude is strong at local browser signals and privacy boundaries, but network-exit checks are lighter.
- Claude AI IP check tools focus on exit IP, ASN, WebRTC, DNS, and route consistency, but local browser evidence is usually less explicit.
- Many tools only show low/medium/high risk, without source, confidence, contribution, or fix direction.
- Forked projects are hard for AI agents to continue without `AGENTS.md`, graph reports, upgrade notes, and reusable assets.
- Chinese and English README/image parity matters for both local teams and public open-source release.

**Claude Clearance turns these checks into an explainable and AI-handoff-friendly workflow.**

```bash
pnpm install
pnpm dev
```

| Capability | Outcome |
|---|---|
| Local browser scan | Timezone, language, fonts, Intl, and UA style stay in-browser |
| Network-exit model | IP, ASN, WebRTC, and DNS are separated as network checks |
| Evidence-first scoring | Every hit can show source, confidence, contribution, and fix guidance |
| AI handoff | `AGENTS.md`, `CLAUDE.md`, `START-HERE.md`, graphify, and upgrade report are present |
| Bilingual assets | Chinese README uses `zh-CN` images, English README uses `en` images |

## 项目概述 · Overview

`Claude Clearance` is an upgraded fork of the upstream open-source project `LinXiaoTao/FuckClaude`. It preserves the original browser-local scoring baseline and adds a productized clearance matrix inspired by Claude AI IP check tools such as `ipinfo.cv/claude-ai-check`: local environment, network exit, risk score, evidence, and fix guidance.

> 中文摘要：Claude 通关局保留 FuckClaude 的浏览器本地检测逻辑，并把出口 IP、ASN、WebRTC、DNS、分流一致性独立为网络出口层，避免把本地信号和服务端可见信号混成一个黑盒判断。
>
> If this saves you time, a Star helps others find it.

## 核心特色 · Features

- **Local-first scan**: OS timezone, browser language, Chinese fonts, Intl locale, timezone offset, and UA/emoji style are computed in the browser.
- **Separated network layer**: Exit IP, country, ASN, WebRTC leak, DNS leak, and split-route consistency are treated as network checks, not browser-only signals.
- **Evidence-based scoring**: The project keeps the 100-point weighted model and requires source, confidence, contribution, and fix guidance for future signals.
- **Bilingual visual assets**: The Chinese root README references `zh-CN` assets, while this English README references `en` assets.
- **AI-agent ready**: `platform-project-skill` added handoff files, upgrade report, graphify output, and asset manifest.

## 与同类方案对比 · Comparison

| Option | Local browser signals | Network exit layer | Evidence explanation | Bilingual README/images | AI handoff |
|---|:---:|:---:|:---:|:---:|:---:|
| **Claude Clearance** | Yes | Planned as a separate layer | Yes | Yes | Yes |
| Original FuckClaude | Yes | Light server estimate | Partial | EN/ZH in one README | No |
| Claude AI IP check sites | Partial | Yes | Site-dependent | Unknown | No |
| Manual timezone/proxy checks | Scattered | Scattered | No | No | No |

## 工作流总览 · Workflow Overview

| Stage | Input | Output |
|---|---|---|
| Local scan | Browser-visible environment | Six local signals, contributions, risk band |
| Server estimate | Request headers and deployment geo headers | Normalized 70/100 IP/header estimate |
| Network deep checks | Exit IP, ASN, WebRTC, DNS | Future opt-in evidence for route consistency |
| Evidence explanation | Hits and weights | Source, confidence, contribution, fix guidance |
| AI handoff | Source code and docs | README, AGENTS, CLAUDE, graphify, upgrade report |

When unsure where a check belongs, ask whether it needs server-side or third-party visibility. If it does, it must not be labelled as local-only.

## 快速开始 · Quick Start

### 前置条件 · Prerequisites

- Node.js and pnpm
- Docker for the project-local PostgreSQL service, mapped to `127.0.0.1:55432`
- Local Astro development environment
- Optional Vercel deployment for `/api/check` geo headers

### Run locally

```bash
pnpm install
pnpm db:setup
pnpm dev
```

Open:

```text
http://localhost:4321
http://localhost:4321/zh/
```

### Build

```bash
pnpm build
```

<details>
<summary>Core structure</summary>

```text
claude-clearance-platform/
├── README.md
├── docs/README_en.md
├── AGENTS.md
├── CLAUDE.md
├── START-HERE.md
├── assets/
│   ├── social-preview.png
│   ├── social-preview-en.png
│   └── platform/
│       ├── architecture/{zh-CN,en}/
│       ├── design/{zh-CN,en}/
│       └── flow/{zh-CN,en}/
├── src/
│   ├── config/signals.ts
│   ├── scripts/detect.ts
│   ├── pages/api/check.ts
│   └── components/Detector.astro
└── graphify-out/GRAPH_REPORT.md
```

</details>

![Claude Clearance check flow](../assets/platform/flow/en/claude-clearance-check-flow.png)

## 功能模块 · Modules

### Local browser scan

- `src/config/signals.ts` defines the six local signals and weights.
- OS timezone is the signal closest to the public Claude Code reverse-engineering reports.
- Chinese fonts are estimated through Canvas width probing.
- `src/scripts/detect.ts` handles scan animation, score accumulation, risk bands, and sharing.

### curl/API server estimate

- `src/pages/api/check.ts` exposes `/api/check`.
- It reads `x-vercel-ip-timezone`, `x-vercel-ip-country`, `Accept-Language`, and `User-Agent`.
- Because fonts and Intl locale are browser-only, API scoring is normalized over visible weight.
- Local and non-Vercel deployments naturally degrade when geo headers are absent.

### Clearance matrix UI

- `src/components/Detector.astro` renders the scan list and matrix.
- The matrix separates local environment, network exit, evidence, and fixes.
- Network-exit checks are currently a productized design layer; real checks should be explicit opt-in.

### AI handoff and assets

- `AGENTS.md` and `CLAUDE.md` define safe editing boundaries.
- `docs/ai-upgrade/report-老项目AI能力升级.md` records scope, changes, risks, and recommendations.
- `assets/asset-manifest.json` registers README images.
- `graphify-out/GRAPH_REPORT.md` documents code structure.

## 技术栈 · Tech Stack

| Layer | Technology or asset | Notes |
|---|---|---|
| Frontend | Astro 7 | Static pages plus Vercel Function |
| Language | TypeScript | Detection logic, API estimate, share card |
| Deployment adapter | `@astrojs/vercel` | `/api/check` as on-demand function |
| Local scan | Browser APIs | `Intl`, `navigator`, Canvas, UA |
| Graph | graphify | Generates `graphify-out/GRAPH_REPORT.md` |
| Visual assets | image_gen | Social preview, architecture, UI, flow |
| Upgrade workflow | platform-project-skill | Non-invasive AI handoff upgrade |
| README gate | `readme-gate.py` | Validates Chinese and English README structure |

## 系统架构 · Architecture

### 工作流设计 · Workflow Design

```text
User opens page
    ↓
Browser local scan
    ├─ OS timezone
    ├─ Browser language
    ├─ Chinese fonts
    ├─ Intl locale
    ├─ Timezone offset
    └─ UA / Emoji style
    ↓
Risk scoring engine
    ├─ 0..1 similarity
    ├─ Weighted contribution
    └─ low / medium / high band
    ↓
Clearance matrix output
    ├─ Local environment
    ├─ Network exit
    └─ Evidence and fixes
```

### 架构说明 · Notes

Browser-local and server-visible signals must stay separate. Local signals can be checked inside the page; network-exit signals require server-side or third-party visibility. The current project implements local scan and API estimate, while deeper network checks remain future opt-in extensions.

![Claude Clearance UI design](../assets/platform/design/en/claude-clearance-ui-design.png)

## 目录结构 · Directory

```text
src/config/signals.ts          signal definitions, weights, pure scoring functions
src/scripts/detect.ts          client scan flow, score accumulation, sharing
src/pages/api/check.ts         curl/API server estimate
src/components/Detector.astro  main UI and clearance matrix
src/i18n/ui.ts                 bilingual copy
assets/platform/               bilingual README image assets
docs/documents/                detection logic analysis
docs/ai-upgrade/               existing-project AI upgrade report
graphify-out/                  code graph report
```

## 命令参考 · Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm db:setup` | Start project-local PostgreSQL, run migrations, and seed demo messages |
| `pnpm db:migrate` | Run PostgreSQL schema migration only |
| `pnpm db:seed` | Seed 10-50 random demo messages, default 32 |
| `pnpm dev` | Start local dev server |
| `pnpm build` | Build Astro/Vercel output |
| `curl http://localhost:4321/api/check` | Text server-side estimate |
| `curl "http://localhost:4321/api/check?format=json"` | JSON server-side estimate |
| `curl "http://localhost:4321/api/messages?limit=10"` | Read PostgreSQL-backed messages |
| `curl -X POST http://localhost:4321/api/stats/visit` | Record one anti-refresh counted visit |
| `platform-project-skill/scripts/verify-assets.sh .` | Validate asset manifest |
| `platform-project-skill/scripts/check-project-baseline.sh --existing .` | Validate existing-project baseline |

## 开发指南 · Development Guide

### Change detection weights

Modify `src/config/signals.ts` first. Keep total weight and `riskBand()` behavior coherent. New signals require UI copy, API visibility notes, and README updates.

### Add network-exit checks

Network checks must be explicit opt-in and must disclose server-side or third-party API usage. Do not present WebRTC, DNS, or ASN results as local-only browser checks.

### Update README images

Chinese images live under `assets/.../zh-CN/`; English images live under `assets/.../en/`. Register every new image in `assets/asset-manifest.json`.

### Safety boundaries

Keep the upstream MIT attribution and links. Do not write real secrets, proxy endpoints, internal IPs, or private routes into README examples.

## 开发与验证 · Validation

Run:

```bash
pnpm build
platform-project-skill/scripts/verify-assets.sh .
platform-project-skill/scripts/check-project-baseline.sh --existing .
~/.claude/scripts/readme-gate.py --readme README.md
~/.claude/scripts/readme-gate.py --readme docs/README_en.md
```

Pass criteria:

- Build exits with code 0.
- `verify-assets.sh` prints `STATE=asset_done`.
- `check-project-baseline.sh --existing` prints `STATE=validation_done`.
- Both README gates return `pass=true`.
- README image paths exist and are not wrapped in fenced code blocks.

## 项目状态 · Project Status

| Item | Status |
|---|---|
| Project stage | `0.1.0` upgraded fork |
| scaffold | Non-invasive upgrade via `platform-project-skill` |
| assets | `STATE=asset_done` |
| validation | `STATE=validation_done` |
| graphify | `72 nodes / 126 edges / 13 communities` |
| local database | PostgreSQL Docker baseline is wired; `pnpm db:setup` initializes it |
| SEO/GEO | `llms.txt`, `geo-index.json`, sitemap, JSON-LD, and FAQ are present |
| known risk | WebRTC/DNS/ASN deep checks are not wired at runtime yet |

## 常见问题 · FAQ

<details>
<summary>Is this an official Claude check?</summary>

No. It is a risk estimate based on public reverse-engineering reports and browser/IP-visible signals.

</details>

<details>
<summary>Which checks are truly local?</summary>

OS timezone, browser language, Chinese fonts, Intl locale, timezone offset, and UA/emoji style are browser-local signals.

</details>

<details>
<summary>Why are network-exit checks not included in the current score?</summary>

Exit IP, ASN, WebRTC, and DNS require server-side or third-party visibility. They are separated to avoid misleading local-only claims.

</details>

<details>
<summary>How should an AI agent inspect this project?</summary>

Read `graphify-out/GRAPH_REPORT.md`, then inspect `src/config/signals.ts`, `src/scripts/detect.ts`, and `src/pages/api/check.ts`.

</details>

## 参与贡献 · Contributing

- For bugs or false positives, include browser, OS timezone, language list, run mode, and expected result.
- For new signals, state whether they are browser-local or server-visible.
- For README or image changes, update both Chinese and English docs and register assets.
- 中文贡献者可从 [`README.md`](../README.md) 开始。

## 版本说明 · Version Notes

| Version | Date | Notes |
|---|---|---|
| `0.1.0` | 2026-07-04 | Forked from FuckClaude; added Claude Clearance branding, clearance matrix UI, AI handoff layer, bilingual image assets, and template-style README structure |

See [CHANGELOG.md](../CHANGELOG.md) for future updates.

## 致谢 · Acknowledgements

- `LinXiaoTao/FuckClaude`: upstream browser-local detection and scoring baseline.
- [Astro](https://astro.build): static site and Vercel Function build support.
- `platform-project-skill`: AI handoff workflow, README rules, and asset validation.

## Star History · Star 历史

<a href="https://star-history.com/#qierkang/claude-clearance-platform&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=qierkang/claude-clearance-platform&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=qierkang/claude-clearance-platform&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=qierkang/claude-clearance-platform&type=Date" />
  </picture>
</a>

## 许可证 · License

This project inherits the upstream MIT License. Redistributions must preserve the copyright and license notice of the upstream project `LinXiaoTao/FuckClaude`.

## 作者 · Author

- Upgrade and handoff: `xyqierkang@gmail.com`
- GitHub: <https://github.com/qierkang>
- Upstream author: [`LinXiaoTao`](https://github.com/LinXiaoTao)
