CREATE OR REFRESH STREAMING TABLE silver.users
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW users_cdc AS AUTO CDC INTO silver.users
FROM STREAM(lakebase.lb_users_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
