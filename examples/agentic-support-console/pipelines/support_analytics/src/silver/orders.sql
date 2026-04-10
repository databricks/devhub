CREATE OR REFRESH STREAMING TABLE silver.orders
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW orders_cdc AS AUTO CDC INTO silver.orders
FROM STREAM(lakebase.lb_orders_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
