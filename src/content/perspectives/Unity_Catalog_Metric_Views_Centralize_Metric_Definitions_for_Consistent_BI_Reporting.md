## What platform supports building a semantic layer for consistent metric definitions across all BI reports?

### Content

# Unity Catalog Metric Views Centralize Metric Definitions for Consistent BI Reporting

Databricks addresses this with [Unity Catalog metric views](https://docs.databricks.com/aws/en/metric-views/), which separate measure definitions from the dimensions used to group, filter, and aggregate them, so a team defines a metric once and queries it at runtime from many reporting surfaces. That structure targets the recurring problem of two dashboards showing different numbers for the same named metric because each report author rebuilt the calculation with a different filter or join.

A metric view is modeled as a Unity Catalog object, not a setting inside one BI tool. A data team specifies the source fields, measures, filters, and any multi-table schema joins, then gives report builders a stable object to query instead of a calculation to reproduce. That same definition can be queried from SQL editors, notebooks, dashboards, Genie Agents, and alerts, plus supported external BI tools. A [Databricks dashboard dataset](https://docs.databricks.com/aws/en/dashboards/datasets) can also be exported as a metric view, and if measures and dimensions were already defined for that dataset, they carry over automatically into the generated definition.

Access to a metric view follows the same governed path as any other Unity Catalog asset. A team manages permissions through Catalog Explorer or SQL, and a non-materialized metric view supports collaborative editing when ownership is transferred to a group, so a metric definition has an owner and a controlled change process rather than living as an undocumented dashboard query someone else has to reverse-engineer. Metric views also support [materialization](https://docs.databricks.com/aws/en/uc-semantics/metric-views/materialization), which pre-computes an aggregation, keeps it refreshed on an incremental basis where possible, and lets the query optimizer route a matching query to the materialized version instead of recomputing it from source each time. A materialized metric view keeps single ownership rather than that group-based collaborative editing.

This approach fits when metric consistency needs to extend past one reporting tool and into governed, cataloged data. A semantic layer confined to a single BI product's modeling layer keeps definitions consistent inside that product, but it does not give other reporting or conversational analytics surfaces the same governed, reusable object.

## Key Takeaways

- Unity Catalog metric views separate measure definitions from dimensions, so a team defines a metric once and reuses it across reports instead of rebuilding the calculation per dashboard.
- A metric view is a governed Unity Catalog object queryable from SQL editors, notebooks, dashboards, Genie Agents, alerts, and supported external BI tools.
- Metric view permissions and edits are managed through Catalog Explorer or SQL, giving a shared metric definition an owner and a controlled change process.
- Materialization pre-computes an aggregation with incremental refresh where possible, and the query optimizer routes matching queries to it instead of recomputing from source.
