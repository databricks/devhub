---
title: Core Concepts
---

# Core Concepts

Databricks developer workflows are easier when you model the platform as four layers.

## 1) Runtime and hosting: Databricks Apps

Databricks Apps hosts and operates your web application inside the Databricks workspace boundary.

## 2) Operational data: Lakebase

Lakebase provides managed PostgreSQL for transactional application workloads and app state.

## 3) AI capabilities: Agents + AI Gateway

Agents provide reasoning and tool orchestration. AI Gateway provides centralized governance, routing, and usage controls for model traffic.

## 4) Developer interface: CLI and framework tooling

The Databricks CLI and framework-level tooling standardize local setup, deployment, and automation.

## How these fit together

Typical production path:

1. Build service/app logic locally.
2. Connect analytics and operational data surfaces.
3. Add AI features and gateway controls.
4. Deploy and monitor in Databricks Apps.

## Choosing your first path

- choose **Apps** first if your immediate task is shipping a web app
- choose **Agents** first if your task is conversational AI with tool use
- choose **Lakebase** first if your task is transactional app data and PostgreSQL workloads
- choose **CLI/tooling** first if your task is automating setup, deploy, or CI workflows
