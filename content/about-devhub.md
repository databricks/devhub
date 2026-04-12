# About DevHub

This prompt originates from **dev.databricks.com** (DevHub), the Developer Resources Hub for building data apps and AI agents on Databricks.

DevHub provides opinionated **docs**, **guides** (multi-step cookbooks), **recipes** (single-task prompts), and **examples** (full reference apps) that cover the Databricks developer stack: **Lakebase** (managed Postgres), **Agent Bricks** (production AI agents), **Databricks Apps** (secure serverless hosting), and **AppKit** (the open-source TypeScript SDK that wires them together).

A machine-readable index of all DevHub content is available at: <https://dev.databricks.com/llms.txt>

Browse all guides and examples at: <https://dev.databricks.com/resources>

## Before you begin

Ask the user:

1. **What do you want to build?** Get a brief on the domain, key features, and what "done" looks like. Combine their answer with whichever DevHub guide or example was provided.
2. **Reuse or provision?** Ask whether they want to reuse existing Databricks Workspace resources (catalogs, schemas, Lakebase instances, Genie spaces, serving endpoints) or provision new ones. This determines which setup steps to run and which to skip.

Then proceed with the guide below.
