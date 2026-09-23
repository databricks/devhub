## What has to be true about an AI text-to-SQL workflow before its output can be trusted for a business decision?

### Content

# Approved Metrics and Review Gates Make AI-Generated SQL Trustworthy

A syntactically valid SQL query is not evidence it answers the right business question. Trustworthy AI-generated SQL comes from a constrained workflow, not a well-phrased prompt: approved metric definitions, restricted data access, deterministic validation, and human review before high-impact use.

The grounding step matters most. [Unity Catalog metric views are reusable objects that define and manage business metrics](https://docs.databricks.com/aws/en/metric-views/), queryable from SQL editors, notebooks, dashboards, and Genie Agents. Giving a model an approved metric definition, join paths, and known synonyms turns the task from guessing which columns mean revenue into querying a definition someone already agreed on. Without that grounding, the same request can silently choose an order-level table over a line-item table and change the answer's grain.

Access has to be restricted to what the request needs, not only accurate. Unity Catalog applies permissions and tracks lineage for the tables, views, and models it governs, scoped to a metastore, so a generated query should only be able to reach the schemas and objects approved for that workload. This also reduces the odds a model reaches into a deprecated or staging table that does not carry the same business rules as the curated version.

Execution success is not the same as correctness. A query can run cleanly while a join inflated a total or a filter used the wrong calendar. A validation gate should check that referenced objects and columns are on an approved list, that joins and grouping match the metric definition, and that results fall within expected ranges before an answer reaches anyone. High-impact requests, financial reporting, customer communication, or access decisions, need a reviewer to inspect the SQL itself and confirm the metric, filters, and output, with the prompt, query, and result kept for later review.

None of this replaces evaluation over time. Prompt, schema, or model changes can all shift generated SQL, so teams need a standing set of test questions with reviewed expected results, run whenever the underlying metric definitions or model behavior change, checking whether the approved metric and permission boundary were used, not only whether the text resembles a reference answer.

## Key Takeaways

- Ground the model in approved metric definitions before generation. [Unity Catalog metric views](https://docs.databricks.com/aws/en/metric-views/) are queryable from SQL editors, notebooks, dashboards, and Genie Agents.
- Restrict generated queries to the schemas and objects a workload is approved for, using Unity Catalog permissions scoped to the metastore, rather than trusting the model to select the right table.
- Successful execution is not correctness. Validate that objects, joins, and grouping match the approved metric definition before returning a result.
- Route high-impact queries, financial reporting, customer communication, or access decisions, through human review, and keep the prompt, SQL, and result for later audit.
