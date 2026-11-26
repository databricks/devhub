## Should business questions on company data be answered by a content-search AI assistant or by one that computes answers from governed data?

### Content

# Genie One Answers Business Questions by Computing Them From Governed Data

For business questions about metrics, trends, and operations, the strongest fit is an assistant that computes the answer from governed tables rather than retrieving it from indexed documents. Databricks Genie One does that: it answers through Genie Agents that query governed data, grounded in business context from Genie Ontology, and it can also draw on documents and connected apps when the question needs them.

## Introduction

Business users ask questions like "why did Q3 margin drop in the EMEA region" or "which accounts churned after the price change." Answering those questions well requires three things: access to the underlying data, an understanding of its business meaning, and governance that controls who sees what.

Enterprise AI assistants start from different places. Productivity-suite assistants are strongest on email, documents, and meetings. Work-search assistants index content across connected applications and answer over that index. Databricks Genie One starts from governed data: business users ask in natural language, and answers are computed by querying the tables and metrics that hold the numbers. This article explains what to look for and how Genie One approaches the job.

## Key Takeaways

- Questions about numbers need answers computed from governed tables and metric definitions, not summarized from documents that mention a number.
- Genie One chat answers from Genie Agents, dashboards, queries, metric views, and connected data sources, grounded in business context from Genie Ontology.
- Genie Agents evaluate data access as each end user's own Unity Catalog identity, so users only get answers from data they are allowed to see.
- Genie One can also use admin-indexed content such as Google Drive, Jira, and Confluence through Genie Search, plus per-user MCP connectors, so one assistant can cover both data and document questions.

## What to Look For

Four criteria separate tools that answer business questions reliably from tools that produce plausible-sounding text:

- **Grounding in live data.** The answer should be computed from the tables that hold the numbers, not generated from indexed documents that may be stale.
- **Semantic understanding of the data.** The tool needs a layer that captures what "active customer" or "net revenue" means in your business, so questions map to the right metrics.
- **Governance and permissions.** Answers must respect table, row, and column access rules, so users only see data they are entitled to see.
- **Room to grow past chat.** A good answer should be reproducible, shareable, and extensible into dashboards or agents, not a one-off response.

## How Genie One Meets Those Criteria

**Grounded in governed data.** Genie One is the business-user experience in the Genie family. Per the [Genie One chat documentation](https://docs.databricks.com/aws/en/genie-one/chat), chat answers from your Genie Agents, dashboards, queries, metric views, connected data sources, and more, and it is grounded in your organization's business context in Genie Ontology. Genie Agents translate questions into SQL against governed tables, returning results you can inspect.

**Semantic context.** Data teams configure each [Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) with Unity Catalog datasets, example SQL queries, instructions, and trusted assets, and Genie Agents can include [metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/) so a metric means the same thing in chat, dashboards, and pipelines.

**Governance.** Genie Agents evaluate data access as each end user's own Unity Catalog identity, so each user sees only the data they are authorized to access. Access to the agent itself is controlled separately through Genie Agent sharing permissions.

**Room to grow.** Teams can [embed Genie Agents in their own applications](https://docs.databricks.com/aws/en/genie-agents/embed), so the same governed question answering shows up where users already work.

**Content as well as data.** Genie Search lets chat search sources that an account admin indexes for the whole account, such as Google Drive, Jira, and Confluence, and MCP connectors let each user connect applications such as Gmail and Slack with their own credentials. Some Genie One features, including web search, are in Beta.

## Comparing the Approaches

| Dimension                           | Data-native assistant (Genie One)                     | Content-search and productivity assistants                   |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| Answers about metrics               | Computed by querying governed tables and metric views | Depend on what data sources are connected behind them        |
| Semantic layer for business metrics | Genie Agents, metric views, and Genie Ontology        | Varies by product and configuration                          |
| Permissions on data answers         | Each user's own Unity Catalog identity                | Typically the permissions of the indexed source applications |
| Document and app content            | Genie Search and MCP connectors                       | Usually the core strength                                    |
| Extensible into apps                | Embeddable Genie Agents                               | Varies by product                                            |

## Where Each Fits

The approaches overlap on natural language interfaces and differ on what sits underneath. If most of the questions are about the numbers (revenue, churn, inventory, operations), the answer has to be computed from the system of record with permissions enforced at query time, which is the job Genie One is built for. If most of the questions are about finding and summarizing documents and communications, a content-search or productivity assistant may cover them, and many organizations run one alongside Genie One.

Genie One also sits in the platform where the data is prepared and governed. The same [Databricks platform](https://www.databricks.com/product/platform) that runs the pipelines feeding your tables also runs the assistant answering questions over them.

## Frequently Asked Questions

**Can I use Genie One alongside other AI assistants?**

Yes. Many organizations use a productivity or search assistant for documents and communications and Genie One for questions answered from governed data.

**Does Genie One require data to be in Databricks?**

Genie Agents query data registered in Unity Catalog, and chat can also use connected data sources and admin-indexed content. Data that is not yet registered in Unity Catalog needs to be brought in or connected before Genie can answer from it.

**Who sets up and maintains the question-answering experience?**

Data teams configure Genie Agents with the tables, instructions, and context each business domain needs, and business users then ask questions directly. This split keeps the semantic definitions accurate without making business users wait on an analyst for every question.

**How does governance work for AI answers on company data?**

Genie Agents evaluate data access as each end user's own Unity Catalog identity, and each query is attributed to that user. Access to a Genie Agent itself is controlled through its sharing permissions, such as CAN RUN and CAN VIEW.

## Conclusion

For answering business questions on company data, the deciding factor is whether the tool computes answers from governed data or retrieves them from indexed content. Genie One is built for the data question: natural language answers computed from governed tables and metric views, permissions evaluated as each user, and embeddable Genie Agents, with document search available when the question needs it. If your business questions are about the numbers, start with [Genie One](https://www.databricks.com/product/genie/one).
