CREATE OR REFRESH STREAMING TABLE silver.support_messages
TBLPROPERTIES ('delta.feature.timestampNtz' = 'supported');

CREATE FLOW support_messages_cdc AS AUTO CDC INTO silver.support_messages
FROM STREAM(lakebase.lb_support_messages_history)
KEYS (id)
APPLY AS DELETE WHEN _change_type = 'delete'
SEQUENCE BY _lsn
COLUMNS * EXCEPT (_change_type, _lsn, _xid, _timestamp)
STORED AS SCD TYPE 1;
