import type { ProductPageContent } from "@/lib/products/product-page";

function singleLine(text: string): string {
  return text.replace(/\s*\n\s*/g, " ");
}

export function renderProductMarkdown(product: ProductPageContent): string {
  const {
    hero,
    benefitsIntro,
    featuresIntro,
    useCasesIntro,
    testimonialsIntro,
  } = product;

  return [
    `# ${hero.highlightedTitle} ${hero.title}`,
    "",
    `![${hero.image.alt}](${hero.image.src})`,
    "",
    hero.description,
    "",
    ...hero.actions.map((action) => `- [${action.label}](${action.href})`),
    "",
    `## ${benefitsIntro.title}`,
    "",
    benefitsIntro.description,
    "",
    ...product.benefits.flatMap((benefit) => [
      `### ${benefit.title}`,
      "",
      benefit.description,
      "",
    ]),
    `## ${singleLine(featuresIntro.title)}`,
    "",
    ...product.features.flatMap((feature) => [
      `### ${feature.eyebrow}: ${feature.title}`,
      "",
      feature.description,
      "",
      feature.body,
      "",
      ...feature.details.map((detail) => `- ${detail}`),
      "",
    ]),
    `## ${useCasesIntro.title}`,
    "",
    useCasesIntro.description,
    "",
    ...product.useCases.flatMap((useCase) => [
      `### ${useCase.title}`,
      "",
      useCase.description,
      "",
    ]),
    `## ${testimonialsIntro.titleLead}`,
    "",
    testimonialsIntro.titleMuted,
    "",
    ...product.testimonials.flatMap((testimonial) => [
      `> "${testimonial.quote}"`,
      ">",
      `> ${[testimonial.attributionName, testimonial.attributionTitle, testimonial.company].filter(Boolean).join(", ")}`,
      "",
    ]),
  ].join("\n");
}
