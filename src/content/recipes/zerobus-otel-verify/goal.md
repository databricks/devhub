When done, you will have:

- A row count and latest timestamp for each signal the tool sends, read from that signal's table.
- Rows that grow between two checks, or a named next step for each signal that has no rows.

Wait a few seconds after the tool's first export. Then run this query for each signal, replacing `<signal>` with `spans`, `logs`, or `metrics`:

```sql
SELECT count(*) AS row_count, max(time) AS latest
FROM <catalog>.<schema>.<prefix>_otel_<signal>
```

Run it again after another export. `row_count` should grow, and `latest` should show a recent time. If the count doesn't grow, check the tool's logs for export errors, then the grants, then the token. The skill's `references/troubleshooting.md` lists the common causes, including error 4024 for missing table-level grants.
