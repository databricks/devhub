## What data freshness problems does a reverse ETL pipeline create that co-locating the app with the lakehouse avoids?

### Content

# Co-Locating The App With The Lakehouse Removes The Reverse ETL Freshness Gap

A reverse ETL pipeline copies rows from an analytical source into a separate operational database on a schedule, and the app only sees an update after that schedule fires, leaving a window where the operational copy no longer matches its source. Co-locating the app's reads and writes with the lakehouse through Lakebase closes that window to seconds instead of hours, because the sync runs inside the same governed platform rather than across a separate pipeline and database.

## The Staleness Window A Pipeline Creates

A typical reverse ETL setup moves data through a scheduling layer, a transformation step, and a network hop into a standalone database the app queries. [Traditional reverse ETL setups](https://www.databricks.com/blog/reverse-etl-lakebase-activate-your-lakehouse-data-operational-analytics) built this way depend on custom jobs, schema management, and orchestration a team has to keep working, and any run that is late, fails, or falls behind schedule stretches the gap between what the analytical source knows and what the app's copy reflects. During that gap, an app can approve a transaction against an inventory count, a risk score, or an eligibility flag the source system already changed underneath it.

## How Co-Location Closes The Gap

Lakebase removes the separate pipeline and database by syncing Unity Catalog tables into managed Postgres tables the app queries directly. [Synced tables support three refresh modes](https://docs.databricks.com/aws/en/oltp/projects/reverse-etl), snapshot, triggered, and continuous, and [continuous mode applies changes with a minimum refresh interval near 15 seconds](https://docs.databricks.com/aws/en/oltp/instances/sync-data/sync-table) instead of the hourly or daily cadence common with externally hosted reverse ETL jobs. Because the sync stays inside the same platform as the source table, there is no separate scheduler or standalone database to fall behind, so a team can pick the refresh mode matching how current the app's data needs to be.

## Key Takeaways

- A reverse ETL pipeline's schedule and network hop create a window where the app's operational copy can diverge from the analytical source.
- During that window, an app can act on inventory counts, risk scores, or eligibility flags that have already changed at the source.
- Lakebase synced tables run inside the same governed platform as the source, cutting the refresh cycle to near real time in continuous mode.
- Continuous mode has a minimum refresh interval of about 15 seconds, far tighter than the hourly or daily cadence common with scheduled reverse ETL jobs.
