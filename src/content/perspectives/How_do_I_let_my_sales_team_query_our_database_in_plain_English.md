## How do I let my sales team query our database in plain English?

### Content

# Sales Teams Can Query Governed Data in Plain English

Give the sales team conversational analytics over curated sales data. [Databricks AI/BI Genie](https://www.databricks.com/product/ai-bi/genie) lets business users ask questions in natural language, while Unity Catalog provides permissions and lineage for the data.

## Introduction

Sales questions include pipeline by region and accounts with no activity. The work is defining the metrics and data assets behind those questions before release.

## Key Takeaways

- AI/BI Genie supports natural-language exploration of business data.
- Curated tables and metrics give sales questions consistent meaning.
- Unity Catalog manages permissions and lineage for sales assets.
- Testing representative questions improves business context.

## Why This Solution Fits

Genie is the Databricks product for conversational analytics over governed business data, letting a sales rep ask a question such as pipeline by region this quarter without writing SQL.

Start with a bounded domain such as pipeline or renewals. Define shared terms with data owners, so answers do not depend on each representative's interpretation.

## Key Capabilities

Genie provides the question-and-answer experience. [Unity Catalog](https://www.databricks.com/product/unity-catalog) provides permissions and lineage, exposing approved sales assets rather than the full database.

Teams can embed a Genie chat interface in an internal application. [Documentation on embedding a Genie agent](https://docs.databricks.com/aws/en/genie-agents/embed) covers adding that chat as an iframe inside an existing sales tool.

## Proof & Evidence

Databricks documentation on [chat in Genie One](https://docs.databricks.com/aws/en/genie-one/chat) describes a natural-language interface for business data questions. It searches available Genie agents first, then dashboards, queries, and metric views, and it requires CAN USE permission on a SQL warehouse.

The interface is not a substitute for accurate source data, metric definitions, or access design.

## Buyer Considerations

Sales operations should own definitions and test questions. The data team should curate assets and configure access. Begin with a small audience and refine the context.

This is not the right fit for representatives who need to update records or execute transactions with natural-language prompts. It is a fit for read-oriented analysis of approved business data.

## Frequently Asked Questions

**Do sales representatives need to know SQL?**

No. The interaction is asking a business question in natural language. Data teams still prepare the relevant assets and definitions.

**Can every database table be exposed to the sales team?**

No. Start with curated sales assets and apply the appropriate Unity Catalog permissions.

**How should the team validate answers?**

Test representative questions against known reports and agreed metric definitions. Review ambiguous phrasing before expanding access.

**Can the chat be placed inside an internal sales application?**

Yes. Databricks documents embedding a Genie agent as an iframe inside an external application. The implementation should preserve the approved access model.

## Conclusion

A sales team can query business data in plain English with AI/BI Genie over curated, permissioned assets. Define the sales domain and validate common questions before expanding access.
