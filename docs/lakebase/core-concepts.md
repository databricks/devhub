---
title: Core Concepts
---

# Lakebase Core Concepts

Lakebase is managed PostgreSQL with Databricks-native operations and governance integration.

## Project model

Lakebase Autoscaling organizes resources as projects with branches and computes.

## Branching model

Branches enable isolated development and testing workflows for database changes.

Use branches for schema and migration validation before promoting to shared/production environments.

## Compute model

Compute supports autoscaling and scale-to-zero capabilities for cost/performance balance.

Choose scaling behavior based on workload profile: steady transactional load vs bursty development/test traffic.

## Data integration model

Lakebase supports integration workflows between operational Postgres workloads and Lakehouse data services.

## Access and governance

Access is controlled through project/database permissions and platform governance controls.
