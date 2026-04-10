# Content Moderator

An internal content moderation tool built on Databricks. Authors submit content (blog posts, social media drafts, press releases), moderators maintain per-target guidelines, and an AI scoring pipeline evaluates each submission against the active guidelines before a human reviewer approves or rejects it.

## Architecture

```
Author submits content
        |
        v
  ┌─────────────────────┐
  │  Lakebase Postgres   │  submissions, guidelines, reviews, AI analyses
  └─────────┬───────────┘
            |
            v
  ┌─────────────────────┐
  │  Serving Endpoint    │  LLM scores content against guidelines
  │  (AI Gateway)        │
  └─────────┬───────────┘
            |
            v
  ┌─────────────────────┐
  │  Databricks App      │  Review queue, guidelines editor, analytics
  │  (AppKit)            │
  └─────────┬───────────┘
            |
            v
  ┌─────────────────────┐
  │  SQL Warehouse       │  Analytics dashboard queries
  │  + Genie Space       │  Natural language analytics
  └─────────────────────┘
```

## Data Model

All tables live in the `content_moderation` schema:

- **guidelines** - Per-target content rules (blog, LinkedIn, Twitter, newsletter, press release). Moderators create, edit, and toggle these. Active guidelines are sent to the LLM for scoring.
- **submissions** - Content submitted by authors with title, body, and target. Status tracks the review lifecycle (pending_review, approved, rejected, revision_requested).
- **ai_analyses** - LLM compliance scores, issues, and suggestions per submission. Triggered on submission and available for re-analysis when guidelines change.
- **reviews** - Moderator decisions with optional feedback.

## Setup

### Prerequisites

- Databricks CLI >= v0.294.0
- A Databricks workspace with Lakebase, SQL Warehouse, and optionally a Model Serving endpoint
- Node.js >= 20

### 1. Copy the template

```bash
databricks apps init --template https://github.com/databricks/devhub/tree/main/examples/content-moderator --name content-moderator
cd content-moderator
```

### 2. Configure workspace resources

Edit `databricks.yml` and replace all `REPLACE_ME` values:

- `workspace.host` - Your workspace URL
- `sql_warehouse_id` - SQL Warehouse ID (`databricks warehouses list`)
- `genie_space_id` - Genie Space ID (create one over the content_moderation tables)
- `postgres_branch` - Lakebase branch (`databricks postgres list-branches projects/{id}`)
- `postgres_database` - Lakebase database (`databricks postgres list-databases {branch}`)
- `serving_endpoint` - Model serving endpoint name (e.g. `databricks-claude-sonnet-4`)

### 3. Seed demo data

```bash
cd seed
npm install
DATABASE_URL="postgresql://..." npm run seed
```

### 4. Install and build

```bash
npm install
npm run build
```

### 5. Deploy

```bash
databricks bundle deploy --profile <PROFILE>
databricks apps get content-moderator --profile <PROFILE>
```

## SQL Queries

Analytics queries in `config/queries/` run against the SQL Warehouse (Spark SQL dialect). They reference tables through Lakehouse Sync or direct Lakebase reads depending on your setup. Update the catalog/schema prefix in each `.sql` file to match your Unity Catalog configuration.

## AI Scoring

When a serving endpoint is configured, each submission is automatically analyzed against the active guidelines for its content target. The server:

1. Fetches active guidelines for the submission's target (blog, LinkedIn, etc.)
2. Constructs a prompt with the content and all applicable guidelines
3. Calls the serving endpoint via AI Gateway
4. Parses the response into a compliance score (0-100), specific issues, and improvement suggestions
5. Stores the analysis for the moderator to review

Moderators can re-analyze a submission at any time (useful after updating guidelines).
