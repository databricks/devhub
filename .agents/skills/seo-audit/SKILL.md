---
name: seo-audit
description: "Use when the user wants to audit, review, or diagnose SEO issues on their site. Triggers on 'SEO audit', 'technical SEO', 'why am I not ranking', 'SEO issues', 'on-page SEO', 'meta tags review', 'SEO health check', 'my traffic dropped', 'lost rankings', 'not showing up in Google', 'core web vitals', 'crawl errors', or 'indexing issues'. For building pages at scale, see programmatic-seo. For structured data, see schema-markup. For AI search optimization, see ai-seo."
metadata:
  version: 1.1.0
---

# SEO Audit

## Initial Assessment

**Check for product marketing context first:** If `.agents/product-marketing-context.md` exists, read it before asking questions.

Gather before auditing:

1. **Site type** (SaaS, e-commerce, blog, local) and primary business goal
2. **Known issues**, recent changes/migrations, current traffic level
3. **Scope** -- full site or specific pages; technical + on-page or one focus area; Search Console access available?

## Schema Markup Detection Limitation

`web_fetch` and `curl` cannot detect JS-injected JSON-LD. Use one of:

1. **Browser tool**: `document.querySelectorAll('script[type="application/ld+json"]')`
2. **Google Rich Results Test**: https://search.google.com/test/rich-results
3. **Screaming Frog export** (if available)

Never report "no schema found" based solely on `web_fetch`.

## Audit Checklist

Audit in priority order. For each issue found, record: Issue, Impact (High/Medium/Low), Evidence, Fix, Priority.

### 1. Crawlability and Indexation

- `robots.txt`: no unintentional blocks, sitemap referenced
- XML sitemap: accessible, canonical/indexable URLs only, regularly updated
- Important pages reachable within 3 clicks
- No orphan pages; logical internal linking
- Large sites: parameterized URLs controlled, faceted navigation handled
- Index status: `site:domain.com` count matches expected; check Search Console coverage
- No noindex on important pages, no misdirected canonicals, no redirect chains
- Canonical consistency: self-referencing, HTTPS, www/non-www, trailing slash

### 2. Technical Foundations

- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1
- TTFB, image compression, JS/CSS delivery, caching headers, CDN, font loading
- HTTPS everywhere, valid SSL, no mixed content, HTTP-to-HTTPS redirects
- Mobile: responsive, proper viewport, adequate tap targets, no horizontal scroll
- URLs: readable, lowercase, hyphenated, no unnecessary parameters

### 3. On-Page Optimization

- **Titles**: unique per page, primary keyword near start, 50-60 chars, brand at end
- **Meta descriptions**: unique per page, 150-160 chars, includes keyword, has CTA
- **Headings**: one H1 per page with keyword, logical H1-H2-H3 hierarchy
- **Content**: keyword in first 100 words, sufficient depth, answers search intent
- **Images**: descriptive filenames, alt text, compressed, WebP, lazy loaded
- **Internal links**: important pages well-linked, descriptive anchor text, no broken links
- **Keyword mapping**: clear target per page, no cannibalization, topical clusters

### 4. Content Quality (E-E-A-T)

- First-hand experience demonstrated, original insights/data
- Author credentials visible, properly sourced claims
- Comprehensive topic coverage, answers follow-up questions, current/updated
- Contact info, privacy policy, terms available

## Output Format

**Executive Summary**: Overall health, top 3-5 priorities, quick wins.

**Findings** (per section): Issue, Impact, Evidence, Fix, Priority.

**Prioritized Action Plan**:
1. Critical (blocking indexation/ranking)
2. High-impact improvements
3. Quick wins (easy, immediate benefit)
4. Long-term recommendations

## References

- [AI Writing Detection](references/ai-writing-detection.md): Common AI writing patterns to avoid
- For AI search optimization, see **ai-seo**
- For structured data, see **schema-markup**
- For building SEO pages at scale, see **programmatic-seo**

## Tools

- **Free**: Google Search Console, PageSpeed Insights, Rich Results Test (renders JS -- use for schema), Bing Webmaster Tools
- **Paid** (if available): Screaming Frog, Ahrefs/Semrush, Sitebulb, ContentKing
