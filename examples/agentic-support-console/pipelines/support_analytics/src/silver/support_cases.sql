CREATE OR REFRESH STREAMING TABLE silver.support_cases
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW support_cases_cdc AS AUTO CDC INTO silver.support_cases
FROM STREAM(lakebase.lb_support_cases_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
