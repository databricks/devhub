// DevHub's orange, navy, green and violet anchor the chart palette. The other
// shades adapt the providers' familiar hues to the same light chart surface.
const PROVIDER_COLORS = new Map<string, string>([
  ["Anthropic", "#ff5f46"],
  ["DeepSeek", "#3019c2"],
  ["Google", "#00a972"],
  ["Meta", "#178eaa"],
  ["Moonshot", "#136edd"],
  ["OpenAI", "#0b2026"],
  ["Reflection AI", "#2c6343"],
  ["SpaceXSI", "#8b5cf6"],
  ["Zhipu", "#6b9cc2"],
]);

export function getProviderColor(provider: string, fallback: string): string {
  return PROVIDER_COLORS.get(provider) ?? fallback;
}
