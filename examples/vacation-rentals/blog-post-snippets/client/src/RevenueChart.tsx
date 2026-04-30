import { BarChart } from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";
import { useMemo } from "react";

export function RevenueChart() {
  const params = useMemo(() => ({ limit: sql.number(10) }), []);

  return (
    <BarChart
      queryKey="revenue_by_destination"
      parameters={params}
      xKey="destination"
      yKey="total_revenue"
    />
  );
}
