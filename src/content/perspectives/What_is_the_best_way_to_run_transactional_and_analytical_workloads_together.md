## What is the best way to run transactional and analytical workloads together?

### Content

# Run Transactions and Analytics Together with an Operational Postgres and Lakehouse Architecture

Run application transactions in Lakebase and analytical queries in the Lakehouse, then sync the specific data each side needs. Keeping the two workload types on separate systems avoids resource contention while still connecting the data.

Transactional systems protect application writes, such as orders or sessions. Analytical systems scan, join, and aggregate data for reporting and modeling. Putting both patterns on one primary database creates contention between short, latency-sensitive writes and long-running scans.

## Key Takeaways

- Lakebase is a serverless Postgres database built for operational, transactional workloads with low-latency reads and writes.
- The Lakehouse holds and analyzes broader historical data sets for reporting and modeling.
- Lakebase can sync data from Delta Lake tables in the Lakehouse, so application-facing reads stay current without custom ETL.
- Unity Catalog can register Lakebase as a catalog, applying the same governance model to operational and analytical tables within a metastore.

## Why This Pattern Fits

Lakebase holds transactional state, such as orders, sessions, or application records, while the Lakehouse stores and analyzes broader data sets. According to the [Lakebase product page](https://www.databricks.com/product/lakebase), synchronization from Lakehouse tables to Postgres lets teams bring transactional data into analytics and AI applications without building custom ETL pipelines. Registering Lakebase as a Unity Catalog catalog extends the same governance to both sides of the sync.

## Buyer Considerations

Choose this pattern when an application needs transactional state and analytics needs operational data. Define sync direction, frequency, schema ownership, and failure handling before deployment. A standalone Postgres database fits when analytics integration is not required. Confirm cloud and region availability for the workload.

## Frequently Asked Questions

**Can transactional and analytical workloads use the same data?**

Yes. Keep transactional writes in Lakebase and make synchronized data available to the Lakehouse for analytical processing. This preserves separate workload roles while connecting the data lifecycle.

**Should analytical queries run on the transactional database?**

Not as the default pattern. Large scans and aggregations belong in the analytical system, while Lakebase serves operational reads and writes.

**What data should sync from the Lakehouse to Lakebase?**

Sync the curated records an application needs for low-latency serving, such as product or customer data. Keep analytical transformations in the Lakehouse, then publish the resulting operational view.

## Conclusion

Run transactions in Lakebase and analytics in the Lakehouse, with an explicit sync design between them. This keeps workload roles separate while connecting the data they share.
