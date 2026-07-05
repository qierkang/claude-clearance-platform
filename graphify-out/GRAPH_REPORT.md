# Graph Report - /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform  (2026-07-04)

## Corpus Check
- 10 files · ~180,529 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 72 nodes · 126 edges · 13 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `q()` - 11 edges
2. `analyze()` - 10 edges
3. `finalize()` - 8 edges
4. `run()` - 8 edges
5. `renderResultCard()` - 8 edges
6. `GET()` - 8 edges
7. `buildCard()` - 6 edges
8. `resetUI()` - 5 edges
9. `init()` - 5 edges
10. `setMascot()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `analyze()` --calls--> `scoreTimezone()`  [INFERRED]
  /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/pages/api/check.ts → /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/config/signals.ts
- `analyze()` --calls--> `scoreLanguages()`  [INFERRED]
  /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/pages/api/check.ts → /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/config/signals.ts
- `analyze()` --calls--> `scoreEmojiVendor()`  [INFERRED]
  /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/pages/api/check.ts → /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/config/signals.ts
- `analyze()` --calls--> `riskBand()`  [INFERRED]
  /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/pages/api/check.ts → /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/config/signals.ts
- `run()` --calls--> `signalVerdict()`  [INFERRED]
  /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/scripts/detect.ts → /Users/qierkang/.codex/codex-workspace/ai-workspace/ai-projects/solutionsWorkSpace/claude-clearance-platform/src/config/signals.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (8): detectEmoji(), detectLanguage(), detectTimezone(), getTimezone(), normLangs(), scoreEmojiVendor(), scoreLanguages(), scoreTimezone()

### Community 1 - "Community 1"
Cohesion: 0.31
Nodes (11): analyze(), fmtOffset(), GET(), jsonBody(), parseAcceptLanguage(), pickLang(), textBody(), tzOffsetEastMinutes() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.32
Nodes (4): cardFile(), copyText(), fallbackCopy(), nativeShare()

### Community 3 - "Community 3"
Cohesion: 0.54
Nodes (7): bandColor(), drawChips(), loadImage(), mascotSrc(), renderResultCard(), roundRect(), wrapText()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (7): buildCard(), currentLang(), finalize(), pageShareUrl(), updateShare(), riskBand(), signalVerdict()

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (6): delay(), resetCard(), resetUI(), run(), setMascot(), setRing()

### Community 6 - "Community 6"
Cohesion: 0.6
Nodes (5): init(), initApiCopy(), initLangMemory(), initShare(), q()

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (2): hand(), tileSvg()

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 9`** (2 nodes): `onClick()`, `track.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `astro.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `cn-models.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `sponsors.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `finalize()` connect `Community 4` to `Community 2`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.261) - this node is a cross-community bridge._
- **Why does `analyze()` connect `Community 1` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.252) - this node is a cross-community bridge._
- **Why does `riskBand()` connect `Community 4` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `analyze()` (e.g. with `useTranslations()` and `scoreEmojiVendor()`) actually correct?**
  _`analyze()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `finalize()` (e.g. with `riskBand()` and `signalVerdict()`) actually correct?**
  _`finalize()` has 2 INFERRED edges - model-reasoned connections that need verification._