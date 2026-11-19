When done, you will have:

- A Databricks service principal with the **Workspace access** entitlement, which Zerobus Ingest requires
- Grants on the catalog, the schema, and the table, given directly to the service principal
- A client secret stored as environment variables, and a token probe that confirms the table-scoped token works

Zerobus Ingest authenticates producers with OAuth tokens for a service principal. It doesn't document personal access tokens, so every producer uses a service principal. Zerobus Ingest doesn't run grants for you, so set them before you give a producer the credentials. Set the grants on the table even when you created the table yourself.

1. Create the service principal. Ask the user before you create it. Create it without a secret for now, with `databricks service-principals create --display-name "zerobus-producer"`. Note the numeric `id` and the `applicationId` in the output. The `applicationId` is the application ID that the grants use.
2. Enable the entitlement. In the workspace, go to **Settings** > **Identity and Access** > **Service principals**, open the service principal, and on the **Configurations** tab, make sure **Workspace access** is selected.
3. Grant privileges on the table. Run these statements, with the application ID from step 1 and your catalog, schema, and table names:

   ```sql
   GRANT USE CATALOG ON CATALOG <catalog> TO `<application-id>`;
   GRANT USE SCHEMA ON SCHEMA <catalog>.<schema> TO `<application-id>`;
   GRANT MODIFY, SELECT ON TABLE <catalog>.<schema>.<table> TO `<application-id>`;
   ```

   `ALL PRIVILEGES` isn't enough. Grant these four privileges explicitly, even if the service principal already has `ALL PRIVILEGES`.

4. Check the grants. Run `SHOW GRANTS ON TABLE <catalog>.<schema>.<table>`. Expected: the application ID appears with `MODIFY` and `SELECT` on the table.
5. Create the client secret. Only after the grants pass, run `databricks service-principal-secrets-proxy create <id>` with the numeric `id` from step 1. Store the secret when the command returns it. The secret isn't shown again.
6. Set the environment variables. Keep the secret out of code and source control. Set these values:
   - `ZEROBUS_SERVER_ENDPOINT` is `https://<workspace-id>.zerobus.<region>.<cloud-domain>`. Get the endpoint from [Get your workspace URL and Zerobus Ingest endpoint](https://docs.databricks.com/ingestion/zerobus-ingest#get-your-workspace-url-and-zerobus-ingest-endpoint).
   - `DATABRICKS_WORKSPACE_URL` is `https://<workspace-url>`, the workspace URL without the `/?o=` part.
   - `DATABRICKS_WORKSPACE_ID` is `<workspace-id>`.
   - `ZEROBUS_TABLE_NAME` is `<catalog>.<schema>.<table>`.
   - `DATABRICKS_CLIENT_ID` is the application ID.
   - `DATABRICKS_CLIENT_SECRET` is the client secret.
7. Run the token probe. Request a table-scoped OAuth token from `<workspace-url>/oidc/v1/token` with the client credentials grant. Pass an `authorization_details` parameter that requests `USE CATALOG` on the catalog, `USE SCHEMA` on the schema, and `SELECT` and `MODIFY` on the table. The request format is in the token section of the [`databricks-zerobus-ingest` skill](https://github.com/databricks/databricks-agent-skills/tree/main/skills/databricks-zerobus-ingest). Expected: the response contains an `access_token`. If it doesn't, check the client ID, the client secret, the workspace ID, and the grants. Error 4024 means a grant is missing on the table itself.
