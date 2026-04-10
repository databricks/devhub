# Agentic Support Console

An end-to-end example of an AI-powered support console built on the Databricks platform. This example demonstrates how to combine Lakebase (OLTP), Lakehouse Sync (CDC), Lakeflow Declarative Pipelines (medallion architecture), a Lakeflow Job (AI agent), reverse sync, and a Databricks App into a single operational data application.

## Architecture

```
OLTP (Lakebase Postgres)
    |  Lakehouse Sync (CDC)
    v
Bronze (lakebase.lb_*_history)
    |  Lakeflow Declarative Pipeline
    v
Silver (current-state SCD Type 1 tables)
    |  Materialized Views
    v
Gold (analytics + support context)
    |  Lakeflow Job (LLM via AI Gateway)
    v
gold.support_agent_responses (Delta)
    |  Reverse Sync (Sync Tables)
    v
Lakebase (gold.*_sync tables)
    |
    v
Support Console (Databricks App)
```

## Components

### `template/` — Support Console (Databricks App)

Internal admin UI built with AppKit (Express + React). Three pages:

- **Cases** — List of support cases with AI-suggested actions
- **Case Detail** — Message thread, AI summary, decision form (refund/credit/resolve/escalate)
- **Analytics** — KPI dashboard + Genie natural language queries

### `pipelines/support_analytics/` — Medallion Pipeline

Lakeflow Declarative Pipeline (serverless, continuous) that transforms CDC history tables into:

- **Silver**: 9 current-state streaming tables (users, orders, support_cases, etc.)
- **Gold**: Materialized views (daily_revenue, support_overview, user_support_profile, support_case_context)

### `pipelines/support_agent/` — AI Support Agent

Lakeflow Job that runs every minute:

1. Finds unanswered customer messages in open cases
2. Builds context from gold tables (case history, user profile, recent orders)
3. Calls an LLM via AI Gateway for a suggested response and action
4. Merges results into `gold.support_agent_responses`

### `seed/` — Local Seed Script

Standalone TypeScript script to populate Lakebase with demo data (users, orders, support cases, messages).

## Setup

### Prerequisites

- Databricks CLI configured with a workspace profile
- A Lakebase Postgres project with a branch and database
- A Unity Catalog catalog
- A SQL Warehouse
- A Genie Space (for the analytics tab)

### 1. Seed Data

```bash
cd seed
npm install
DATABASE_URL="postgresql://..." npm run seed
```

### 2. Set Up Lakehouse Sync

Manually configure Lakehouse Sync from your Lakebase Postgres `public` schema to Unity Catalog. This creates the bronze `lb_*_history` tables.

### 3. Deploy the Medallion Pipeline

```bash
cd pipelines/support_analytics
# Update databricks.yml targets with your workspace host and catalog
databricks bundle deploy --target dev
```

### 4. Deploy the Support Agent Job

```bash
cd pipelines/support_agent
# Update databricks.yml targets with your workspace host, catalog, and AI Gateway endpoint
databricks bundle deploy --target dev
```

### 5. Set Up Reverse Sync (Sync Tables)

Manually configure Sync Tables to replicate gold tables back to Lakebase:

| Source                         | Target                              | Mode       |
| ------------------------------ | ----------------------------------- | ---------- |
| `gold.support_agent_responses` | `gold.support_agent_responses_sync` | CONTINUOUS |
| `gold.support_case_context`    | `gold.support_case_context_sync`    | SNAPSHOT   |
| `gold.user_support_profile`    | `gold.user_support_profile_sync`    | SNAPSHOT   |
| `gold.support_overview`        | `gold.support_overview_sync`        | SNAPSHOT   |

### 6. Deploy the Support Console App

```bash
cd template
# Update databricks.yml with your resource IDs
npm install
databricks bundle deploy
```

Or scaffold a fresh copy with the Databricks CLI:

```bash
databricks apps init \
  --template https://github.com/databricks/devhub/tree/main/examples/agentic-support-console \
  --name support-console
```

## Tech Stack

- **App**: AppKit (Express + React 19), React Router, Tailwind, TypeScript
- **Database**: Lakebase Postgres (OLTP) + Unity Catalog (lakehouse)
- **Pipelines**: SQL (Lakeflow Declarative Pipelines), Python + PySpark + Delta
- **AI**: MLflow AI Gateway, structured LLM output
- **Deploy**: Databricks Asset Bundles
