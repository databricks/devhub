/**
 * Provider logos used as Pareto chart markers and on the vendor filter chips.
 * Files live in public/img/ai-trends/logos; vendors without an entry fall
 * back to a colored dot.
 */
const VENDOR_LOGOS: Record<string, string> = {
  Anthropic: "/img/ai-trends/logos/anthropic.svg",
  OpenAI: "/img/ai-trends/logos/openai.svg",
  Google: "/img/ai-trends/logos/google.svg",
  DeepSeek: "/img/ai-trends/logos/deepseek.svg",
  Meta: "/img/ai-trends/logos/meta.svg",
  SpaceXSI: "/img/ai-trends/logos/xai.svg",
  Moonshot: "/img/ai-trends/logos/moonshot.svg",
  Zhipu: "/img/ai-trends/logos/zhipu.svg",
  "Reflection AI": "/img/ai-trends/logos/reflection.svg",
};

export function getVendorLogo(vendor: string): string | undefined {
  return VENDOR_LOGOS[vendor];
}

export function getVendorLogoEntries(): [vendor: string, path: string][] {
  return Object.entries(VENDOR_LOGOS);
}
