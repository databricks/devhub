export const MVP_NOMINATION_URL =
  "https://surveys.training.databricks.com/jfe/form/SV_6Ed034QOD4pcQFU";

/**
 * Copy for the /mvps page. Strings may contain inline Markdown links
 * (`[label](href)`): the page renders them as anchors and /mvps.md emits them
 * verbatim. Titles use `\n` for the desktop line break.
 */
export const mvpProgram = {
  title: "Databricks MVPs",
  description:
    "How Databricks recognizes and supports experts in the Data + AI community. Explore program benefits, meet the MVPs, and nominate a peer.",
  hero: {
    badge: { src: "/img/community/mvp-badge.svg", alt: "Databricks MVP" },
    highlightedTitle: "Databricks MVPs.",
    title:
      "How Databricks recognizes and supports experts in the Data + AI community.",
    tagline: "Recognizing those who share knowledge and grow the community.",
    primaryAction: { label: "Nominate a Peer", href: MVP_NOMINATION_URL },
    secondaryAction: {
      label: "Browse MVP profiles",
      href: "/mvps/directory",
    },
  },
  benefitsIntro: {
    kicker: "Program Benefits",
    title: "See what MVPs get from the program.",
    description: "Connect, contribute, and grow your impact.",
  },
  benefits: [
    {
      title: "Join the MVP\nCommunity",
      description:
        "Connect with other Databricks MVPs through a dedicated private community.",
    },
    {
      title: "Connect With\nExperts",
      description:
        "Connect directly with Databricks and open source product managers and engineers.",
    },
    {
      title: "Get Early\nAccess",
      description:
        "Try out new features and products before they are released and early roadmap access.",
    },
    {
      title: "Receive monthly\ncredits",
      description: "Get monthly credits to develop content and create demos.",
    },
    {
      title: "Attend Data + AI\nSummit",
      description:
        "Attend the annual Databricks Data + AI Summit with complimentary passes.",
    },
    {
      title: "Share Your\nExpertise",
      description:
        "Get opportunities to share your expertise at events, like [Data + AI Summit](https://www.databricks.com/dataaisummit).",
    },
    {
      title: "Showcase Your\nMVP Status",
      description:
        "Showcase your MVP status with an official badge across your social profiles and website.",
    },
    {
      title: "Earn Community\nRecognition",
      description:
        "Get featured across Databricks’ website and social media channels.",
    },
  ],
  requirementsIntro: {
    kicker: "Membership Requirements",
    title: "How Databricks MVPs contribute to the community.",
    description: "MVPs share knowledge and grow the ecosystem.",
  },
  requirements: [
    {
      label: "Share knowledge",
      title: "Create and share technical content.",
      items: [
        "Write thought-leadership blogs and technical guides",
        "Publish video demonstrations and tutorials",
        "Post product breakdowns and tips on social media",
      ],
    },
    {
      label: "Build community",
      title: "Help create an active, welcoming, and connected community.",
      items: [
        "Speak at industry conferences and data meetups",
        "Answer questions and share experiences on Reddit",
        "Engage actively in the official [Databricks Community forum](https://community.databricks.com/)",
      ],
    },
    {
      label: "Grow the ecosystem",
      title: "Help grow the Databricks developer community.",
      items: [
        "Organize local or virtual Databricks meetups",
        "Develop courses and webinars to educate users",
        "Expand the global developer footprint",
      ],
    },
    {
      label: "Shape the future",
      title: "Support and help shape the Databricks and the MVP program.",
      items: [
        "Champion new products and feature releases",
        "Provide candid feedback on what is and isn't working",
        "Collaborate with fellow MVPs to refine and publish content",
      ],
    },
  ],
} as const;

const INLINE_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export type InlineTextPart =
  { kind: "text"; text: string } | { kind: "link"; text: string; href: string };

export function parseInlineLinks(text: string): InlineTextPart[] {
  const parts: InlineTextPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    if (match.index > cursor) {
      parts.push({ kind: "text", text: text.slice(cursor, match.index) });
    }
    parts.push({ kind: "link", text: match[1], href: match[2] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    parts.push({ kind: "text", text: text.slice(cursor) });
  }
  return parts;
}

function singleLine(text: string): string {
  return text.replace(/\s*\n\s*/g, " ");
}

export function renderMvpProgramMarkdown(): string {
  const { hero, benefitsIntro, requirementsIntro } = mvpProgram;

  return [
    `# ${hero.highlightedTitle} ${hero.title}`,
    "",
    `![${hero.badge.alt}](${hero.badge.src})`,
    "",
    hero.tagline,
    "",
    `- [${hero.primaryAction.label}](${hero.primaryAction.href})`,
    `- [${hero.secondaryAction.label}](${hero.secondaryAction.href})`,
    "",
    `## ${benefitsIntro.title}`,
    "",
    benefitsIntro.description,
    "",
    ...mvpProgram.benefits.flatMap((benefit) => [
      `### ${singleLine(benefit.title)}`,
      "",
      benefit.description,
      "",
    ]),
    `## ${requirementsIntro.title}`,
    "",
    requirementsIntro.description,
    "",
    ...mvpProgram.requirements.flatMap((requirement) => [
      `### ${requirement.label}: ${requirement.title}`,
      "",
      ...requirement.items.map((item) => `- ${item}`),
      "",
    ]),
  ].join("\n");
}
