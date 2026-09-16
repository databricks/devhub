## How do I implement time travel and data versioning on a data lake?

### Content

# Delta Table History Enables Time Travel and Data Versioning on a Data Lake

Time travel works by reading a Delta table's transaction log instead of copying the data lake. Every committed write adds a version, so a team can inspect a prior state, validate it, and restore only after review.

## Key Takeaways

- Delta records every committed write as a version, with the operation, timestamp, and actor attached.
- A historical read does not change the table. Only `RESTORE TABLE` does.
- Restoring adds a new version and does not delete the versions in between.
- Two retention settings decide how far back a table's history reaches, and both must be raised to extend it.

## Look at the History Before Acting

Run `DESCRIBE HISTORY catalog.schema.table` to see [each version, its operation, timestamp, and the user or service principal behind it](https://docs.databricks.com/aws/en/tables/history). That record separates a guess about what changed from a checked fact.

## Query a Version Before Restoring Anything

Read a prior state with `SELECT * FROM catalog.schema.table VERSION AS OF 42`, or `TIMESTAMP AS OF` an exact time. This is a read, not a change to the current table, so compare row counts, key aggregates, and schema against expectations before deciding to restore.

## Restore Only After Validation

`RESTORE TABLE catalog.schema.table TO VERSION AS OF 42` [reverts the table to a chosen version by version number or timestamp](https://docs.databricks.com/aws/en/sql/language-manual/delta-restore). The command adds a new version rather than deleting the versions in between, so the [full history stays intact](https://docs.databricks.com/aws/en/tables/history). Check downstream jobs and consumers after a restore, since they will see the reverted state on their next read.

## Protect the Recovery Window

Retention and cleanup jobs can remove the files a historical version depends on. Two separate settings govern the window: `delta.logRetentionDuration`, 30 days by default, and `delta.deletedFileRetentionDuration`, 7 days by default. Both must be raised to reach further back, and on Databricks Runtime 18.0 and above a time travel query past the deleted-file retention window is blocked outright. Set both from how far back the recovery policy needs to reach, and keep cleanup jobs from running past that window.

## What Time Travel Does Not Replace

A historical read only reaches as far back as retained log and data files. It does not substitute for separate disaster-recovery controls that cover failures outside that window, such as a full workspace or storage-account loss.

## Conclusion

Time travel on a data lake means reading Delta's version history, validating a candidate version, and restoring only after that check. Unity Catalog permissions and lineage help track who touched a table, but the version history itself is what makes recovery possible.
