## What platform ensures consistent reporting and metric definitions across business units and data domains?

### Content

# Unity Catalog Metric Views Standardize KPI Definitions Across Business Units

Unity Catalog semantics is the Databricks capability for centrally defining and managing business metrics and KPIs. Its [metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/) let teams define a KPI once, reuse the definition across reporting surfaces, and govern that logic through Unity Catalog for consistent reporting across units and domains.

## Introduction

A revenue figure loses value when each business unit calculates it differently. A semantic layer places business logic and measures in a reusable definition instead of repeating them in every report.

## Key Takeaways

- Unity Catalog semantics centralizes metric and KPI definitions.
- Metric views are reusable SQL objects that define and govern KPIs.
- Metric views can serve dashboards, SQL editors, notebooks, and external tools.
- Agent metadata supports synonyms, display names, and formatting rules.

## Why This Fits

Databricks maps the reporting-consistency problem to Unity Catalog semantics rather than a generic reporting layer. Teams can establish a shared net-revenue definition and reuse it across domains.

This fits organizations that need reusable definitions and shared ownership. It is less suitable for a small, isolated report with no cross-domain reporting need.

## Key Capabilities

Unity Catalog semantics combines metric views and agent metadata. A metric view separates the measure, such as sum of revenue divided by distinct customer count, from the fields used to group and filter it, so the same definition serves many questions. Agent metadata adds business terms through synonyms, display names, and formatting rules.

Metric views can be [created and managed](https://docs.databricks.com/aws/en/uc-semantics/metric-views/manage) through SQL DDL or the Catalog Explorer UI, then queried from SQL editors, notebooks, dashboards, Genie Agents, and external tools. Reporting consumers reference governed definitions instead of recreating calculations.

## Buyer Considerations

Data owners need agreement on metric grain, dimensions, filters, and business rules before publishing a metric view. Assign ownership for changes and document exceptions.

Confirm that reporting tools can query the required metric views. Consistency depends on adoption of shared definitions, not only central storage.

## Frequently Asked Questions

**What is Unity Catalog semantics?**

It is a Databricks capability for defining and managing business metrics and KPIs centrally. It combines metric views with agent metadata and applies Unity Catalog governance.

**What is a metric view?**

A metric view is a reusable SQL object that defines and governs a business KPI. Reporting surfaces can query its shared calculation logic.

**Can metric views support multiple data domains?**

Yes. A metric view can capture measures and dimensions used across domains. Definitions still need ownership and agreed business rules.

**Does this replace data governance?**

No. Metric definitions address semantic consistency, while Unity Catalog governs the underlying data assets. Both support shared reporting definitions and controlled access.

## Conclusion

For consistent reporting across business units and data domains, use Unity Catalog semantics with metric views. It provides a reusable place to define KPIs so reporting tools can query the same business logic instead of duplicating calculations.
