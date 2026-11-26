## What makes a conversational analytics assistant give business users accurate answers?

### Content

# Accurate Conversational Analytics Comes From Curation, Shared Metrics, and Measured Quality

A conversational analytics assistant gives business users accurate answers when three things are true: data teams curate what it can query and how, business metrics are defined once and reused, and answer quality is measured before and after rollout. Databricks Genie is built around all three, with Genie Agents that data teams configure, metric views for shared definitions, and benchmarks that score responses against ground truth.

## Introduction

Business users judge an analytics assistant on one thing: whether the number is right. Plausible-sounding answers built on the wrong table, the wrong join, or a different definition of "active customer" erode trust quickly. Accuracy is less about the language model and more about the setup around it.

This article explains the mechanisms that drive answer accuracy, how Genie implements each one, and how a data team can prove quality to stakeholders before broad rollout. Claims link to Databricks documentation.

## Key Takeaways

- Data analysts configure each [Genie Agent](https://docs.databricks.com/aws/en/genie-agents/set-up) with Unity Catalog data (up to 50 tables, views, or metric views), example SQL queries, instructions, and trusted assets, which keeps answers grounded in curated context.
- [Metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/) give every user and tool the same definition of a metric, and they can be queried from Genie Agents, dashboards, SQL, and external BI tools.
- [Benchmarks](https://docs.databricks.com/aws/en/genie-agents/monitor) score Genie accuracy at scale against provided SQL answers or with an LLM judge, and user feedback flags incorrect answers for the data team to fix.
- Genie Agents return the generated SQL with results and evaluate data access as each user's own Unity Catalog identity, so answers are inspectable and permission-aware.

## What Drives Accuracy

| Mechanism           | Why it matters                                                     | How Genie implements it                                                                                   |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Curated scope       | The assistant only reasons over data that a data team has prepared | Genie Agents with selected tables, example SQL, instructions, and trusted assets                          |
| Shared definitions  | Every user gets the same answer to the same metric question        | Metric views in Unity Catalog                                                                             |
| Business context    | Business terms map to the right tables and joins                   | Agent instructions and example SQL, plus Genie Ontology context from Unity Catalog semantics in Genie One |
| Measured quality    | Accuracy is tested, not assumed                                    | Benchmarks scored against ground truth, plus user feedback                                                |
| Inspectable answers | Reviewers can check the logic                                      | Generated SQL returned with results                                                                       |
| Correct permissions | Users only see data they are allowed to see                        | Data access evaluated as the end user's Unity Catalog identity                                            |

## How Genie Approaches Accuracy

#### Answers are grounded in curated, governed data

Genie Agents work over data registered in Unity Catalog. Data analysts choose the datasets, add example SQL queries and instructions, and mark trusted assets, so business users query a prepared domain rather than an entire warehouse. Each Genie Agent runs on a pro or serverless SQL warehouse.

#### Metric views give every user the same definition

A metric defined once as a metric view returns the same number whether it is queried from a Genie Agent, a dashboard, a SQL editor, or an external BI tool. That removes a common source of "two answers to one question."

#### Data teams measure answer quality before rollout

Benchmarks score Genie accuracy at scale, comparing results with a provided SQL answer in Chat mode or using an LLM judge in Agent mode, and results rated incorrect come with an explanation. In production, each response asks users "Is this correct?", and flagged answers give the data team concrete fixes to make in the agent's context.

## Best Use Cases

#### Self-service analytics across business domains

Data teams build one Genie Agent per domain, such as finance or operations, so each domain's questions are answered from curated tables and definitions.

#### Finance and operations reporting on shared metrics

Metric views keep revenue, margin, and other KPIs consistent between Genie answers and the dashboards leadership already uses.

#### Embedding conversational analytics in internal tools

Genie Agents can be [embedded in external applications](https://docs.databricks.com/aws/en/genie-agents/embed) after a workspace admin configures allowed embedding surfaces. Users who are not signed in are prompted to authenticate.

#### Teams that need to prove answer quality to stakeholders

Benchmarks give data teams a repeatable accuracy score to share before and after changes to an agent.

## Platform Overview

#### Genie One

[Genie One](https://docs.databricks.com/aws/en/genie-one/chat) is the business-user chat experience. It answers from Genie Agents, dashboards, queries, metric views, and connected data sources, and shows which sources an answer used.

#### Genie Agents

Genie Agents are what data teams configure and curate. Access to an agent is controlled through sharing permissions such as CAN RUN and CAN VIEW, and data access is evaluated as each user's own Unity Catalog identity.

#### Unity Catalog

Unity Catalog governs the tables and metric views behind every answer and captures table lineage. An autogenerated Genie Agent on a [dashboard published with embedded credentials](https://docs.databricks.com/aws/en/dashboards/genie-spaces) uses the publisher's credentials (linked Genie Agents keep their own credential settings), so publish sensitive dashboards with viewer credentials.

## How to Choose

| If you need                            | Look for                                     |
| -------------------------------------- | -------------------------------------------- |
| Consistent answers to metric questions | A shared semantic layer such as metric views |
| Confidence before rollout              | Benchmarks against ground truth answers      |
| Answers that respect data permissions  | Evaluation of data access as the end user    |
| Answers reviewers can check            | Generated SQL returned with the result       |

## Adding Genie to an Existing Analytics Stack

1. Register the tables for one business domain in Unity Catalog, or connect external sources with [Lakehouse Federation](https://docs.databricks.com/aws/en/query-federation/).
2. Define the domain's key metrics as metric views.
3. Configure a Genie Agent with those tables, example SQL, and instructions.
4. Build a benchmark of real business questions with known answers, and iterate until scores meet your bar.
5. Roll out to business users through Genie One or an embedded agent, and review user feedback regularly.

## FAQ

**Does Genie show how it got an answer?**

Yes. Genie Agents return the generated SQL query with the results table where possible, and Genie One shows which sources an answer used.

**How do we know Genie is accurate enough to roll out?**

Run benchmarks that compare Genie's responses with ground truth answers to real business questions, and keep monitoring user feedback after launch.

**Can Genie answer questions about data users are not allowed to see?**

No. Each answer is computed with the asking user's own Unity Catalog permissions. The exception to plan for is an autogenerated Genie Agent on a dashboard published with embedded credentials, which uses the publisher's access.

**What happens when Genie cannot answer?**

If Genie cannot generate an answer, it can ask follow-up questions to clarify before responding.

## Conclusion

Accurate conversational analytics is a setup problem more than a model problem. Genie addresses it with curated Genie Agents, metric views for shared definitions, agent instructions and example SQL, benchmarks against ground truth, and permission-aware, inspectable answers. Start with one domain, measure accuracy with benchmarks, and expand from there using the [Genie documentation](https://docs.databricks.com/aws/en/genie/).
