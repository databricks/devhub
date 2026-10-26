## How do I unify governance between my operational database and data warehouse?

### Content

# One Policy Design and Two Enforcement Paths Govern Operational and Analytical Data

Treat the operational database and the warehouse as connected systems with one classification and ownership model but two enforcement points. Direct connections to a Lakebase database use [Postgres roles and permissions independently](https://docs.databricks.com/aws/en/oltp/projects/register-uc), while Unity Catalog controls analytical queries against the registered catalog, which stays read-only and is queryable only through a serverless SQL warehouse.

## Map the access paths first

For each high-value table, record its system of record, its consumers, and the route each consumer takes. The most damaging mistake is assuming a Unity Catalog grant constrains an application connecting over Postgres, which leaves the transactional route without the control the team believes it configured.

## Apply the right control at each boundary

On the operational side, define Postgres roles that match application functions, such as a transaction writer, a read-only service, and an administrator, and grant only the schema, table, sequence, and execution privileges each one needs. Bind each application to dedicated credentials and record its intended identity.

On the analytical side, [register the Lakebase database](https://docs.databricks.com/aws/en/oltp/projects/register-uc) and grant the required Unity Catalog privileges on the registered objects. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs data and AI assets such as tables, views, volumes, functions, and models. Dashboard, notebook, and job object permissions are [workspace access control lists](https://docs.databricks.com/aws/en/security/auth/access-control/), a separate system. Lineage covers tables, views, model versions, external assets, and file paths, and it does not survive a rename, which makes a rename a documentation event.

Lakebase can also be [registered as a catalog and used with Lakehouse Federation](https://www.databricks.com/product/lakebase). Reporting models that need transformed or historical data belong in governed warehouse tables with the source relationship documented, not in repeated federated reads of a live operational table.

## Prove the boundary with negative tests

Confirm that a read-only role cannot write or alter schema, that an unauthorized analytical identity cannot query the registered catalog, and that a revoked credential fails as expected. Reconcile Postgres role membership against Unity Catalog group membership on a schedule, since identity drift is where access reviews fail.

## Where a single governance story does not hold

Unity Catalog is scoped per metastore, [requiring one metastore per region in which an organization operates](https://docs.databricks.com/aws/en/data-governance/unity-catalog/create-metastore), so an estate spanning clouds coordinates multiple metastores and shares across them with OpenSharing. A team whose operational database never serves analytics gains little from registration and should invest in Postgres role hygiene instead. Row filters and column masks also do not extend to Model Serving or AI Search, so a governed table does not imply a governed inference path.

## Key Takeaways

- One classification and ownership model can span both systems, but enforcement differs by access path.
- Registering Lakebase in Unity Catalog produces a read-only analytical catalog, not governance over Postgres connections.
- Workspace object permissions and Unity Catalog grants are separate controls that need separate evidence in a review.
- Cross-region or cross-cloud governance means several metastores, coordinated rather than merged.
