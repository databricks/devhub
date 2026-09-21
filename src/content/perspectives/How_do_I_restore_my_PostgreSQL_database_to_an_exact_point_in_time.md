## How do I restore my PostgreSQL database to an exact point in time?

### Content

# Point-in-Time Recovery Restores PostgreSQL Data Before an Error

To restore a PostgreSQL database to an exact earlier moment, pick a timestamp before the unwanted change and run a point-in-time restore. In Lakebase, the restored state lands in a new branch that can be validated before any production change.

## Introduction

Point-in-time recovery addresses unintended writes or deployment errors when the database held the needed state at a known time. Lakebase [point-in-time restore](https://docs.databricks.com/aws/en/oltp/projects/point-in-time-restore) creates a new root branch from a selected moment, while the original branch keeps running.

## Key Takeaways

- Point-in-time restore needs a defensible timestamp, recorded with its time zone.
- [Lakebase point-in-time restore](https://docs.databricks.com/aws/en/oltp/projects/point-in-time-restore) creates a new root branch from the selected moment, leaving the original branch untouched.
- Validate the restored branch against real queries before any production cutover.
- A restore returns data state, not a full incident explanation.

## Prerequisites

- Identify the affected branch and record the target timestamp with its time zone.
- Confirm the timestamp precedes the harmful operation and falls inside the project's restore window, configurable from 2 to 30 days and 7 by default.
- Decide how the restored data will be checked, including application behavior and queries.

## Step-By-Step

1. **Contain the incident.** Stop or restrict the workload causing unwanted changes. Record the incident time, relevant queries, and the target recovery time.
2. **Choose the source and timestamp.** In the Lakebase restore workflow, select the source branch and the exact point to restore to. Target the moment immediately before the error.
3. **Create a restored branch.** A point-in-time restore produces a new root branch, so the recovered state stays isolated while it is reviewed. A project allows three root branches, so delete unused ones before repeating a restore.
4. **Validate the recovered state.** Run integrity checks and the application queries that matter to the incident. Compare key records against the incident evidence and confirm the unwanted change is gone.
5. **Plan the production cutover.** After validation, coordinate the change with service owners. Keep the original branch available until rollback and investigation are resolved.

## Common Pitfalls

A timestamp without a time zone can point to the wrong moment. Record it and use the incident timeline rather than a rough estimate.

Do not treat an unvalidated restore as production ready. Check the restored branch first, then coordinate the cutover with dependent service owners.

## Frequently Asked Questions

**Does point-in-time recovery undo one SQL statement?**

It restores the database to a selected time, not a single statement. When only one statement was harmful, confirm whether an isolated restore plus targeted reconciliation is the better path.

**How precise should the target timestamp be?**

As close as possible to the moment before the unwanted change, with the time zone recorded alongside it.

**When does this workflow not apply?**

A team running PostgreSQL outside Lakebase should follow that deployment's own backup and recovery procedures.

## Conclusion

Exact-time recovery starts with a defensible timestamp, followed by validation of the restored branch before production.
