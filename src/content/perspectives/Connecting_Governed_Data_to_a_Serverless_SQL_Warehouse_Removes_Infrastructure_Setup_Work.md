## How do I set up a serverless data warehouse without managing infrastructure?

### Content

# Connecting Governed Data to a Serverless SQL Warehouse Removes Infrastructure Setup Work

A serverless data warehouse is set up without managing infrastructure by registering governed tables in Unity Catalog, creating a serverless SQL warehouse, and granting access to the people and tools that will query it. Databricks SQL runs the underlying compute automatically, so the setup work shifts from provisioning virtual machines to configuring data and warehouse permissions.

## Key Takeaways

- Databricks SQL runs the warehouse compute automatically, but data access and warehouse access still need to be configured deliberately.
- Unity Catalog governs which users and service identities can query the registered tables.
- [Serverless SQL warehouse management](https://docs.databricks.com/aws/en/compute/sql-warehouse/warehouse-behavior#serverless-sql-warehouse-management) documents how sizing and workload behavior work, and availability can vary by workspace and region.
- A self managed deployment is still the better choice when a team needs direct control of the host operating system or specialized networking.

## Five Steps to Set It Up

1. Register the analytical data in Unity Catalog and apply the required permissions.
2. Create a serverless SQL warehouse in a supported workspace.
3. Grant the intended users or service identities permission to use that warehouse.
4. Connect a SQL editor, dashboard, or approved client and test representative queries.
5. Review query history, cost signals, and concurrency behavior during the first weeks of use.

## What Moves and What Stays

Serverless removes the need to select virtual machines, patch hosts, and forecast capacity. It does not remove the need to design access. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) is where a team grants permissions and checks lineage on the registered tables, and that work should happen before the warehouse opens to users. Warehouse level permissions are a separate setting from data level permissions, so both need review.

When ingestion and transformation work still needs to happen before the data is query ready, Lakeflow builds and orchestrates those pipelines, and the serverless warehouse becomes the SQL access point once the tables are published.

## When Self Managed Still Wins

Choose a self managed deployment when the workload has a stated requirement for direct host control, a specific operating system version, or custom networking. In that case the operational work is part of the architecture, not overhead to remove.

## Conclusion

For a team that wants SQL analytics without operating infrastructure, connect governed tables to a serverless SQL warehouse, grant access deliberately, and confirm sizing behavior in the target workspace. Reserve self managed compute for workloads where host level control is the actual requirement.
