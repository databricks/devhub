## How do I create an instant copy of my production database for testing?

### Content

# A Lakebase Branch Gives Testing Production-Shaped Data Without Production Writes

Create a Lakebase branch from the production branch and point only the test deployment at it. A new branch inherits both the schema and data from its parent but shares the underlying storage through pointers to the same data, and [branches appear instantly](https://docs.databricks.com/aws/en/oltp/projects/branches) regardless of database size, so the copy costs storage only for bytes that change.

## Pick the starting state

For current feature work, branch from the active production branch. For a defect that needs an older state, use point-in-time restore. The restore window is configurable from 2 days up to 30 days with a default of 7 days, and a restore creates a new root branch containing the data from that moment. Projects allow a maximum of [3 root branches](https://docs.databricks.com/aws/en/oltp/projects/point-in-time-restore), so unused root branches may need deleting before another restore runs. Snapshots are a separate mechanism with their own retention rather than this continuous window, and a snapshot restore also creates a root branch.

## Wire access and configuration deliberately

Grant only the Postgres roles the test application, test runner, and reviewers require. Direct connections to a Lakebase database use [Postgres roles and permissions independently](https://docs.databricks.com/aws/en/oltp/projects/register-uc) of Unity Catalog, so registering the database as a catalog for analytics does not govern the application path.

Put the branch host, database, and credentials into the test environment configuration and leave the production configuration untouched. Add a startup check that logs the branch endpoint and fails the suite when it detects the production target. A branch protects nothing from a job still holding production credentials.

## Run, reset, retire

Changes made on a child branch do not affect its parent, so migrations, destructive tests, and rollback checks can all run on the branch. When a run leaves the branch unusable, reset it to match the parent state rather than reasoning about a drifted copy.

A branch opened for a pull request goes away when the pull request closes, which also bounds how long production-shaped data sits in a test environment. Production data can carry sensitive records, so access limits and masking follow organizational policy.

## Where this does not apply

Branching applies only to a Lakebase Postgres database, so a team standardized on another operational engine needs its own approach. Lakebase is generally available on AWS and Azure and in Beta on Google Cloud in three regions, which matters for a regulated or single-region deployment. Branching is also not a backup plan. Production recovery uses the documented restore path, not a reset of a developer branch.

## Key Takeaways

- A Lakebase branch is a copy-on-write database with its own endpoint, not a second connection to production.
- Point-in-time restore is bounded by a configured window and consumes one of three root branch slots.
- Direct application access is authorized by Postgres roles, separate from Unity Catalog grants on a registered catalog.
- An endpoint assertion in the test harness prevents the failure mode that branching alone cannot prevent.
