Install the Databricks CLI, authenticate a profile, and verify the handshake. Every other DevHub template assumes this has already passed.

When done, you will have:

- Databricks CLI `0.296+` installed and on `PATH`
- An authenticated CLI profile (`databricks auth profiles` shows `Valid: YES`)
- A successful smoke test (`databricks current-user me` returns your identity)
