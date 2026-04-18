import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export function useFeatureFlags() {
  const { siteConfig } = useDocusaurusContext();
  const fields = siteConfig.customFields as Record<string, unknown>;
  return {
    showDrafts: fields.showDrafts === true,
    examplesEnabled: fields.examplesFeature === true,
  };
}
