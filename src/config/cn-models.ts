/**
 * Domestic (Chinese) LLM picks rendered by `src/components/CnModels.astro`
 * as a strip of name-only outbound links below the "How the check works"
 * section. Every link keeps the public campaign tag used by the site.
 */

export interface CnModel {
  id: string;
  name: string;
  /** Outbound link. */
  url: string;
}

export const CN_MODELS: CnModel[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://www.deepseek.com/?utm_source=fuck-claude',
  },
  {
    id: 'glm',
    name: 'GLM',
    url: 'https://bigmodel.cn/?utm_source=fuck-claude',
  },
];
