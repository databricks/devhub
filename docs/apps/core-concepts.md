---
title: Core Concepts
---

# Apps Core Concepts

Databricks Apps packages, deploys, and runs your application as a managed workspace resource.

## App resource

An app is a workspace object with identity, URL, permissions, and deployment history.

## Source path and deployment

You deploy from workspace source code paths. Each deployment produces a tracked runtime version.

In practice:

- local files are synced to a workspace source path
- deploy uses that workspace path as input
- the running version can be validated from app deployment history and logs

## Runtime configuration

`app.yaml` defines command and environment overrides for execution behavior.

## Security model

- workspace identity and permissions govern app operations
- app-level authorization settings control runtime request handling
- deployment and access activity are auditable

## Integration model

Apps can integrate with Databricks services such as SQL, Unity Catalog resources, and AI/agent endpoints.
