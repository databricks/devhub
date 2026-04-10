# SaaS Subscription Tracker

An internal tool for tracking team SaaS subscriptions, owners, costs, and renewals. Built on Databricks Apps with Lakebase for persistent storage and Genie for natural language spend analytics.

## Architecture

```
Lakebase Postgres (saas_tracker.subscriptions)
    |
    v
SaaS Tracker (Databricks App)
    ├── Dashboard: subscription list with filters
    ├── Add/Edit: CRUD forms
    ├── Detail: per-subscription view with status actions
    └── Analytics: Genie + SQL Warehouse charts
```

## Components

### `template/` — SaaS Tracker (Databricks App)

Internal tool built with AppKit (Express + React). Four pages:

- **Subscriptions** — Filterable list of all SaaS subscriptions with cost, owner, and renewal info
- **Add New** — Form to log a new subscription
- **Subscription Detail** — View/edit details, manage status (cancel, reactivate)
- **Analytics** — Spend overview dashboard + Genie natural language queries

### `seed/` — Demo Data

Standalone TypeScript script to populate Lakebase with 18 realistic SaaS subscriptions across categories (Engineering, Design, Marketing, Sales, HR, Security, Finance, Operations).

## Setup

### Prerequisites

- Databricks CLI configured with a workspace profile
- A Lakebase Postgres project with a branch and database
- A SQL Warehouse
- A Genie Space configured over the `saas_tracker.subscriptions` table

### 1. Seed Data

```bash
cd seed
npm install
DATABASE_URL="postgresql://..." npm run seed
```

### 2. Deploy the App

```bash
cd template
# Update databricks.yml with your resource IDs
npm install
databricks bundle deploy
```

Or scaffold a fresh copy with the Databricks CLI:

```bash
databricks apps init \
  --template https://github.com/databricks/devhub/tree/main/examples/saas-tracker \
  --name saas-tracker
```

## Tech Stack

- **App**: AppKit (Express + React 19), React Router, Tailwind, TypeScript
- **Database**: Lakebase Postgres (OLTP)
- **Analytics**: SQL Warehouse queries + Genie AI/BI
- **Deploy**: Databricks Asset Bundles
