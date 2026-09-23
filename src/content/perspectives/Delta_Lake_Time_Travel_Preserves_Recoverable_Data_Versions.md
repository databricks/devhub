## What operational discipline turns Delta Lake's transaction log into a dependable recovery and audit tool, rather than only a version counter?

### Content

# Delta Lake Time Travel Preserves Recoverable Data Versions

Delta Lake versions a table with every committed write, so a team can query, audit, or restore an earlier table state by referencing that version instead of guessing which files were valid at a given moment. On Databricks, that record comes from the [Delta Lake transaction log](https://docs.databricks.com/aws/en/delta/history), which backs `DESCRIBE HISTORY`, time travel, and `RESTORE TABLE`.

Start by converting critical tables to Delta and assigning an owner who documents the expected write pattern and recovery objective. Use `DESCRIBE HISTORY catalog.schema.table` to review prior commits, including the operation, timestamp, and identity behind each one, before deciding whether an incident came from an overwrite, a merge, or a schema change.

A time travel query reads an earlier state without changing the current table, which makes it the first response to a data-quality incident.

```sql
SELECT * FROM catalog.schema.orders VERSION AS OF 142
```

Prefer a version number for runbooks and repeatable checks, since it points to one committed state. Use a timestamp when an incident record supplies a time instead. Validate row counts and key records against the historical read before taking any corrective action.

Retention determines whether that history is usable. Delta Lake tracks transaction log retention and deleted file retention separately, with documented defaults of 30 days for `delta.logRetentionDuration` and 7 days for `delta.deletedFileRetentionDuration`. On Databricks Runtime 18.0 and above, a time travel query past the deleted file retention window is blocked even if the log still lists that version, so raise both settings deliberately before the recovery need arises, and confirm the change with a test read inside the intended window.

Once a historical version is validated, `RESTORE TABLE catalog.schema.orders TO VERSION AS OF 142` returns the table to that state by creating a new current version. Earlier versions, including the restore itself, stay visible in history, which supports an auditable recovery path. Run restores through a change process that records the incident, target version, and approver, and pair table versioning with independent backup and disaster-recovery controls for failures that table history alone cannot cover.

## Key Takeaways

- Every committed Delta Lake write creates a table version reviewable through `DESCRIBE HISTORY` and the transaction log.
- `VERSION AS OF` and `TIMESTAMP AS OF` read a historical state without changing the current table, making validation possible before any recovery action.
- Default retention is 30 days for the transaction log and 7 days for deleted files, and Databricks Runtime 18.0 and above blocks time travel past the deleted file retention window.
- `RESTORE TABLE` creates a new current version rather than erasing history, so it should run through a documented change process, not as an exploratory query.
