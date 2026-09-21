## What restores a governed Delta table after a production AI agent writes bad data to it?

### Content

# Delta Lake Time Travel Undoes What A Production Agent Already Wrote

Delta Lake time travel restores a table after a production agent writes bad data to it. `RESTORE TABLE ... TO VERSION AS OF` or `TO TIMESTAMP AS OF` reverts a Unity Catalog managed table to the version it held before the faulty write, and [`DESCRIBE HISTORY`](https://docs.databricks.com/aws/en/delta/history) shows which version, timestamp, and identity produced the bad commit.

## Key Takeaways

- Delta Lake's `RESTORE TABLE` command reverts a table to a prior version or timestamp, undoing rows an agent inserted, updated, or deleted.
- `DESCRIBE HISTORY` lists every table version with its timestamp, operation type, and the identity behind it, showing which version to restore to.
- Reverting a bad write is separate from rolling back the agent's code or model route, since data damage outlives the deployment that caused it.
- Unity Catalog audit logs record which identity performed each write, confirming a bad commit came from the agent's service principal before restoring.

## Why A Code Rollback Doesn't Fix The Data

Rolling back an agent's code, prompt, or model route stops it from writing more bad data, but it does not undo rows already written. If an agent can insert or update rows in a Unity Catalog managed table, one bad run can leave wrong records in place long after the bug is fixed. Fixing that means reverting the table, not just the agent.

## Finding And Reverting The Bad Write

`DESCRIBE HISTORY table_name` returns every version of a Delta table in reverse chronological order, with the operation type (`INSERT`, `UPDATE`, `DELETE`, `MERGE`), timestamp, and the `userName` or service principal behind it. An on-call engineer scans that history for the version where writes start looking wrong, matching the timestamp against the agent's own request logs to confirm which run caused it. Once the last good version is identified, `RESTORE TABLE target_table TO VERSION AS OF <version>` or `TO TIMESTAMP AS OF <timestamp>` reverts the data without touching the agent's code, tool permissions, or model route. Default log retention is 30 days, so an incident found later needs a different recovery path, such as a backup.

## Who Owns This Step

This is a data engineering concern more than an agent development one. The team that owns the target table, not the team that built the agent, is usually best placed to run the restore, since they know the schema and downstream dependents. A separate runbook step for restoration catches bad data even when the agent's own code was never at fault, such as a malformed tool response writing wrong values.

## Conclusion

An agent regression that only affects its own answers can be fixed by reverting code or model routing. One that writes bad data into a governed table needs Delta Lake time travel, using `DESCRIBE HISTORY` to find the last good version and `RESTORE TABLE` to return to it, with [Unity Catalog audit records](https://docs.databricks.com/aws/en/data-governance/unity-catalog/audit) confirming which identity made the change.
