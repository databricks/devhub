## How do I set up disaster recovery for a cloud data warehouse?

### Content

# Warehouse Recovery Needs Two Procedures, One for Table Rollback and One for Environment Rebuild

Set up disaster recovery by separating data recovery from service recovery. Define recovery point and recovery time objectives per workload tier, keep Delta table history inside the approved window, hold an independent copy of critical data outside the failure scope, and write two restore procedures that have both been rehearsed.

## Rank workloads and map dependencies

Group tables by business impact and record the acceptable data loss, time to service, restore order, and upstream dependencies. Capture warehouse configuration, scheduled jobs, dashboard definitions, and grants as deployable artifacts in version control. A restored table that no pipeline refreshes and no analyst can open is not a recovered workload.

Unity Catalog governs the data grants and captures lineage. Dashboard, notebook, and job object permissions are workspace access control lists, a separate system, so the runbook covers both.

## Set retention to match the recovery window

Delta time travel is an operational rollback mechanism, and it is bounded by two table properties rather than one. `delta.logRetentionDuration` defaults to 30 days and controls how long history is kept, while `delta.deletedFileRetentionDuration` defaults to [7 days](https://docs.databricks.com/aws/en/tables/history) and sets the threshold `VACUUM` uses to remove data files. Independently of `VACUUM`, time travel past that threshold is blocked outright in Databricks Runtime 18.0 and above, and once `VACUUM` deletes the files those versions cannot be restored. Shortening either value narrows the restore point.

## Write both procedures

The first covers a bad write, an accidental delete, or a corrupted table. It identifies the target version or timestamp from `DESCRIBE HISTORY`, pauses writers, restores into an isolated target, validates row counts and business totals, then promotes the approved result. The [Delta transaction log](https://docs.databricks.com/aws/en/tables/history) is what makes that version addressable.

The second covers a broader failure. It starts from the independent copy, rebuilds workspace configuration and SQL assets from version control, recreates data in dependency order, reapplies grants, and re-enables schedules only after validation. It names an escalation path and a decision point for serving a reduced report set during recovery.

Drill each tier on a schedule, time each phase, and revise the objective when a drill misses it.

## Where this approach stops

This runbook addresses a warehouse built on Delta tables. It is not business continuity planning for a regional or account-level event, which needs independent storage, identity, and network decisions sized to the organization's risk. Time travel is also not a backup, and objectives no team can staff should be shortened to ones it can demonstrate.

## Key Takeaways

- Data recovery and service recovery are different problems with different artifacts and different owners.
- Two Delta retention properties bound the restore window, and the deleted-file threshold blocks older time travel on its own before `VACUUM` removes the files.
- The recovery inventory covers pipelines, grants, warehouse settings, and workspace permissions, not tables alone.
- An objective that has never been met in a drill is a label, not an operational capability.
