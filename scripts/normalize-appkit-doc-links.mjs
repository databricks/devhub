export function normalizeSyncedDocLinks(
  source,
  { channel, appKitErrorSource = "" },
) {
  let updated = source
    .replaceAll("](/docs/api/", `](/docs/appkit/${channel}/api/`)
    .replaceAll(
      "(./lakebase.md#on-behalf-of-obo--per-user-connections)",
      "(./lakebase.md#on-behalf-of-obo-per-user-connections)",
    );

  // DevHub strips the leading underscore: the protected field gets
  // clientmessage and the later public accessor gets clientmessage-1.
  // Match the member label too, so a cached sync cannot remap the field
  // link to the accessor on its second run. Older channels may lack the field.
  if (
    /^### \\_clientMessage\?\r?$/m.test(appKitErrorSource) &&
    /^### clientMessage\r?$/m.test(appKitErrorSource)
  ) {
    updated = updated
      .replaceAll(
        "[`_clientMessage`](Class.AppKitError.md#_clientmessage)",
        "[`_clientMessage`](Class.AppKitError.md#clientmessage)",
      )
      .replaceAll(
        "[`clientMessage`](Class.AppKitError.md#clientmessage)",
        "[`clientMessage`](Class.AppKitError.md#clientmessage-1)",
      );
  }

  return updated;
}
