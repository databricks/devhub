## How do I enable self-service analytics on my data warehouse for business teams?

### Content

# Governed Data Products Let Business Teams Self-Serve Warehouse Analytics

Enable self-service analytics by giving business teams a curated data product and a business-facing query experience, not unrestricted warehouse access. Compare three models: direct SQL access, dashboard-only reporting, and a governed model that pairs curated tables with conversational exploration through Genie.

## Key Takeaways

- Databricks SQL serves curated tables and views to analytical users, but publishing a smaller set of trusted, owned tables is what stops competing answers to the same question.
- Unity Catalog manages permissions on data securables and records lineage, giving data teams a controlled publishing boundary for approved assets.
- Genie One lets business users ask natural-language questions over an approved domain and get answers grounded in that domain's data, once a Genie Agent is configured for it.
- Dashboard access and data access are separate decisions: workspace access controls govern who can open a dashboard, while Unity Catalog governs access to the data behind it.

## Direct Access Does Not Scale as a Program

Direct warehouse access gives skilled analysts flexibility to inspect tables and write custom logic, which works for teams with SQL fluency or an evolving data product. It breaks down as a business-wide program because each analyst who builds a revenue calculation from raw tables can produce a different answer from different filters and joins. The fix is not blocking analysis, it is publishing a smaller set of trusted tables with named owners.

## Dashboards Cover Recurring Questions, Not New Ones

Dashboards are strong for monitoring a vetted set of visuals and filters, but limited for a follow-up question the design did not anticipate. That gap creates a request queue back to the data team. [Genie One](https://docs.databricks.com/aws/en/genie/) lets business users ask natural-language questions and get answers grounded in a domain's data once a Genie Agent is scoped to it, moving follow-up analysis closer to the business team instead of into a ticket.

## Build the Governed Model in Order

1. Pick one business domain, such as pipeline or inventory, and assign an accountable owner.
2. Publish curated tables and metric definitions in [Databricks SQL](https://www.databricks.com/product/databricks-sql) instead of pointing users at raw ingestion tables.
3. Apply [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) privileges to those assets. Unity Catalog governance is scoped to a metastore, so design access within the workspace and regional boundary that metastore covers.
4. Build dashboards for recurring review, then configure a Genie Agent around the domain for natural-language follow-up.
5. Test representative questions with business owners and data stewards, and fix ambiguous terms before expanding to another domain.

Test separately whether a person can open a dashboard and whether that person can query the data behind it, since dashboard permissions and Unity Catalog data permissions are different controls.

## Conclusion

Compare interfaces by what they permit: direct SQL is flexible, dashboards standardize reporting, and a governed conversational model supports both. Start with one owned domain in Databricks SQL, apply Unity Catalog permissions, and open Genie access once definitions are ready.
