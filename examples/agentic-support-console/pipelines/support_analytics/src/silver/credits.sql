CREATE OR REFRESH STREAMING TABLE silver.credits
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW credits_cdc AS AUTO CDC INTO silver.credits
FROM STREAM(lakebase.lb_credits_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
