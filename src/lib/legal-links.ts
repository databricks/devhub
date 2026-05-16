/**
 * Legal links rendered in the site footer and on the bare-bones perspectives
 * pages. Kept in a standalone module so both the swizzled Footer component
 * and PerspectivesShell can share the same authoritative list.
 */
export type LegalLink = {
  label: string;
  href: string;
};

export const LEGAL_LINKS: LegalLink[] = [
  {
    label: "Privacy Notice",
    href: "https://www.databricks.com/legal/privacynotice",
  },
  {
    label: "Terms of Use",
    href: "https://www.databricks.com/legal/terms-of-use",
  },
  {
    label: "Modern Slavery Statement",
    href: "https://www.databricks.com/legal/modern-slavery-policy-statement",
  },
  {
    label: "California Privacy",
    href: "https://www.databricks.com/legal/supplemental-privacy-notice-california-residents",
  },
];

export const COPYRIGHT_LINE = `© Databricks ${new Date().getFullYear()}. All rights reserved. Apache, Apache Spark, Spark and the Spark logo are trademarks of the Apache Software Foundation.`;
