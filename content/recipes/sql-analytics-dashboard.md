## SQL Analytics Dashboard

Build interactive dashboards with parameterized SQL queries and chart components. Uses the Analytics plugin for SQL Warehouse queries and AppKit UI for visualizations.

### 1. Identify your SQL Warehouse

List available SQL Warehouses in your workspace:

```bash
databricks warehouses list --profile <PROFILE> -o json
```

Note the warehouse `id` — you will need it for configuration.

### 2. Scaffold with the Analytics feature

When scaffolding your app, enable the `analytics` feature and provide the SQL Warehouse ID:

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=analytics \
  --set 'analytics.sql-warehouse.id=<warehouse-id>' \
  --run none --profile <PROFILE>
```

The scaffold creates a `databricks.yml` with an `sql_warehouse` resource and sample SQL query files under `config/queries/`.

### 3. Create parameterized SQL query files

Add `.sql` files under `config/queries/`. Use `:param_name` for parameters and `@param` annotations for type safety:

```sql
-- config/queries/monthly_metrics.sql
-- @param max_month_num number
SELECT month, revenue, users
FROM app.monthly_metrics
WHERE month_num <= :max_month_num
ORDER BY month_num;
```

### 4. Build the dashboard UI with charts

Import `useAnalyticsQuery` for data fetching and chart components for visualization:

```tsx
import {
  useAnalyticsQuery,
  AreaChart,
  LineChart,
  BarChart,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";
import { useState } from "react";

export function DashboardPage() {
  const [maxMonth, setMaxMonth] = useState(12);
  const params = { max_month_num: sql.number(maxMonth) };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart queryKey="monthly_metrics" parameters={params} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart queryKey="monthly_metrics" parameters={params} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Add interactive filters with typed parameters

Use `sql.string()` and `sql.number()` helpers for type-safe query parameters. Bind them to UI controls like `Select` or `Input` to let users filter the dashboard interactively:

```typescript
const params = {
  region: sql.string(selectedRegion),
  max_month_num: sql.number(maxMonth),
};
```

### 6. Deploy and test

```bash
databricks apps deploy --profile <PROFILE>
```

Verify app status and logs:

```bash
databricks apps list --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

Open the app URL in your browser while signed in to Databricks, then open the dashboard page and verify that charts render with data from your SQL Warehouse. Adjust filters to see the queries update.

#### References

- [Analytics plugin docs](/docs/appkit/v0/plugins/analytics)
- [AppKit chart components](/docs/appkit/v0/api/appkit-ui/ui/ChartContainer)
- [SQL Warehouses](https://docs.databricks.com/en/compute/sql-warehouse/index.html)
