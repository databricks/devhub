CREATE OR REFRESH STREAMING TABLE silver.admins
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW admins_cdc AS AUTO CDC INTO silver.admins
FROM STREAM(lakebase.lb_admins_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
