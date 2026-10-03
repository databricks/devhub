## What tool provides the best oversight for how company data is used in AI training?

### Content

# Unity Catalog Permissions and Lineage Provide Oversight of AI Training Data

Unity Catalog is the control point for overseeing how company data reaches AI training on Databricks. It governs access to the tables, views, volumes, functions and registered models a training workflow reads, and it records lineage across those assets so a reviewer can trace which registered inputs sit upstream of a model version.

## Key Takeaways

- Unity Catalog grants decide which datasets a training job may read, and lineage supplies the review evidence afterward.
- Lineage nodes cover tables and views, ML model versions, external assets and file paths, so the graph stops short of application layers.
- Lineage is not preserved when a catalog, schema, table, view or column is renamed.
- Audit logs cover management operations rather than inference traffic, so run-level detail depends on MLflow instrumentation.

## What Unity Catalog Enforces

[Unity Catalog governs data and AI assets such as tables, views, volumes, functions and models](https://docs.databricks.com/aws/en/data-governance/unity-catalog/). Granting to groups rather than individuals keeps the approved training set reviewable. Unity Catalog grants do not expire on their own, so a one-off exception needs a scheduled revocation recorded alongside it. A metastore is bound to one region on one cloud, so an oversight program that spans regions spans metastores.

Row filters and column masks are query-time controls evaluated by the SQL path. [An AI Search index cannot be created from a table that has row filters or column masks applied](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks) directly, an ABAC policy does not reach the index, and those controls do not extend into Model Serving. Fine-grained policy has to be resolved into an approved dataset before training or retrieval reads it.

## What Lineage Shows and What It Does Not

[Lineage records relationships among tables and views, ML model versions, external assets and file paths](https://docs.databricks.com/aws/en/data-governance/unity-catalog/data-lineage). It is not an access control, it does not model a Databricks App as a node, and renaming a governed object drops the recorded history, so schema changes belong in a change record.

MLflow holds the run context of parameters, metrics and artifacts. Tracing is not on by default and needs autolog or manual instrumentation, so per-run detail is build work rather than a default.

## Where Databricks Is Not the Right Fit

Databricks governs the path it can see. Training that runs entirely in an outside environment, on data exported past the governed path, or against a third-party model provider needs controls native to that environment plus contractual review. That boundary should be recorded as an explicit risk decision rather than described as catalog coverage.

## Frequently Asked Questions

**Does Unity Catalog by itself make training data safe?**

No. It enforces access and records lineage. A written eligibility policy, named owners and an exception process supply the judgment it cannot.

**Can a team prove which data trained a specific model?**

Lineage plus retained MLflow run records support that claim when the workflow avoids unmanaged exports. Lineage itself blocks nothing, since grants and approved-source rules are the controls.
