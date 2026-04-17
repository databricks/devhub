---
title: What is Databricks Apps?
sidebar_label: Overview
description: Databricks Apps hosts web applications inside your workspace with built-in auth, managed compute, and direct access to your data.
---

# What is Databricks Apps?

Databricks Apps is a hosting service for web applications that runs inside your Databricks workspace. You deploy with a single CLI command and the app gets a fixed URL, built-in OAuth, and a dedicated service principal. No external hosting service. No separate auth layer.

Apps run as managed workspace resources. The platform handles compute, TLS, and authentication.

## What problem it solves

Normally, an app that reads or writes Databricks data requires a separate server, manual credential management, and cross-network configuration. Apps removes this: your app lives inside the workspace, authenticates through it, and connects to your data the same way your notebooks do.

## When to use it

- You're building a web app, internal tool, or API that reads or writes Databricks data.
- You want auth handled by the platform, without building login flows, token rotation, or session management.
- You're deploying an AI agent (agents run as Apps).

## When not to use it

- Your app is a static site with no Databricks data access.
- You're serving external users who won't have workspace access.

## How it fits together

- **AppKit** is the TypeScript SDK built for Databricks Apps. It provides UI components, a plugin system (Lakebase, analytics, Genie, files, and more), and type-safe data access.
- **Lakebase** is the Postgres database layer you connect to from an App for persistent OLTP storage.
- **Agents** are LLM-driven applications deployed as Databricks Apps using the same CLI and bundle workflow.

## Next steps

To get started, see the [Quickstart](/docs/apps/quickstart), where you scaffold and deploy a working app to your workspace.
