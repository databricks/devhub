CREATE OR REFRESH STREAMING TABLE silver.refunds
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW refunds_cdc AS AUTO CDC INTO silver.refunds
FROM STREAM(lakebase.lb_refunds_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
