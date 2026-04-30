import { useAnalyticsQuery, Skeleton } from "@databricks/appkit-ui/react";
import { sql } from "@databricks/appkit-ui/js";
import { useMemo } from "react";

export function RevenueByDestination() {
  const params = useMemo(() => ({ limit: sql.number(10) }), []);
  const { data, loading, error } = useAnalyticsQuery(
    "revenue_by_destination",
    params,
  );

  if (loading) return <Skeleton className="h-48 w-full" />;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!data?.length)
    return <p className="text-muted-foreground">No data found.</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="p-2">Destination</th>
          <th className="p-2">Country</th>
          <th className="p-2">Bookings</th>
          <th className="p-2">Revenue</th>
          <th className="p-2">Avg Rating</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.destination} className="border-b">
            <td className="p-2">{row.destination}</td>
            <td className="p-2">{row.country}</td>
            <td className="p-2">{row.total_bookings.toLocaleString()}</td>
            <td className="p-2">${row.total_revenue.toLocaleString()}</td>
            <td className="p-2">{row.avg_rating}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
