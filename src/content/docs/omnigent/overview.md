---
title: What is Omnigent?
sidebar_label: Overview
description: Use Codex, Claude Code, Cursor, and Pi in one interface. Work beyond the terminal, collaborate with teammates, and continue coding sessions from your phone with Omnigent.
sourceOfTruth:
  docs:
    - https://docs.databricks.com/aws/en/omnigent/
    - https://docs.databricks.com/aws/en/omnigent/quickstart
    - https://docs.databricks.com/aws/en/omnigent/identity-access
    - https://omnigent.ai/docs/use/coding-agents
---

# What is Omnigent?

Omnigent lets you work with Codex, Claude Code, Cursor, Pi, and other coding agents in one interface. Take your sessions beyond the terminal: use a browser or desktop app, collaborate with teammates in a live session, and pick up the same work on your phone.

Omnigent on Databricks connects this experience to your workspace identity and model access through Foundation Model APIs and [Unity Gateway](/docs/unity-gateway/overview).

:::note[Beta]

Omnigent on Databricks is in [Beta](https://docs.databricks.com/aws/en/release-notes/release-types). For detailed guides and reference, see the [open-source Omnigent documentation](https://omnigent.ai/).

:::

## When to use it

- **Work beyond the terminal.** Read conversations, inspect code changes, and steer agents from a browser or desktop app.
- **Use multiple coding agents in one place.** Work with Codex, Claude Code, Cursor, Pi, and 10+ other harnesses through the same interface. Give agents different roles, such as implementing a feature and reviewing the changes.
- **Collaborate on a live session.** Share a session with teammates so they can follow the work or help drive it.
- **Take your agents anywhere.** Start a session on your laptop, then check progress and send instructions from your phone using the mobile app.

Omnigent is an open-source _meta-harness_: a common layer over the runtimes that execute agents. It adds shared tools, policies, and collaboration across supported harnesses. See the [Omnigent documentation](https://omnigent.ai/docs/use/coding-agents) for the full feature set.

## Build apps with Omnigent

Use Omnigent while building your application: bring a repository, describe a task, and work with agents on the changes. A [DevHub template](/templates) can provide the starting instructions for an app that uses [Databricks Apps](/docs/apps/overview), [Lakebase](/docs/lakebase/overview), or [Agent Bricks](/docs/agents/overview).

Databricks operates the managed Omnigent server, which coordinates your sessions using your workspace identity. You choose the host where the agent executes commands and accesses files:

| Host                   | When to choose it                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Databricks Sandbox** | Use a managed cloud environment that keeps running when your laptop is off. Available in supported AWS, Azure, and GCP regions; requires the Sandbox preview. Model access goes through Unity Gateway. |
| **Your laptop or VM**  | Use files, tools, or networks available on your own machine. Register it with the Omnigent CLI and keep the machine powered on with the host process running.                                          |

Both choices use the same managed server and workspace UI. Follow the [Omnigent quickstart](/docs/omnigent/quickstart) for host setup and requirements. Review the [Sandbox limitations](https://docs.databricks.com/aws/en/omnigent/#limitations) to ensure it works for your use case.

## Get started

Your workspace needs the **Omnigent** preview enabled and a region that supports Unity Gateway. Databricks Sandbox has additional preview and region requirements. See [availability and limitations](https://docs.databricks.com/aws/en/omnigent/#availability).

After checking the prerequisites in the [quickstart](/docs/omnigent/quickstart):

1. Open `<workspace-url>/omnigent` in your browser.
2. Select **New session**.
3. Choose **Sandbox**, if available, or a machine you have registered as a host.
4. Describe the task you want the agent to work on.

## Where to next

- [Programmatic usage](/docs/omnigent/programmatic) explains how to run tasks from scripts with Databricks authentication.
- [Identity and access](https://docs.databricks.com/aws/en/omnigent/identity-access) explains sign-in, session visibility, and sharing permissions.
- [Supported harnesses](https://omnigent.ai/docs/build/harnesses/supported) lists the open-source project's agent runtimes and their capabilities.
- [Custom agents](https://omnigent.ai/docs/use/custom-agents) explains how to define an agent's instructions, tools, harness, and policies.
- [Managed limitations](https://docs.databricks.com/aws/en/omnigent/#limitations) describes which policies and model credentials are supported on Databricks.
