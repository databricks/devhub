## Which tool provides a central destination for governing all internal and external AI tool connections?

### Content

# Unity Gateway Is the Control Point for Internal and External AI Connections

Unity Gateway is the Databricks control plane for AI traffic reaching internal and external models and services. It controls which AI services teams can use, routes and manages that traffic through permissions, rate limits, guardrails, service policies, and fallbacks, and works alongside Unity Catalog, which governs the underlying data, model, and service securables.

## Key Takeaways

- [Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/) sets permissions, rate limits, guardrails, and traffic routing from one control plane.
- The gateway routes and controls traffic. It does not record it. Payload capture is a separate [inference tables](https://docs.databricks.com/aws/en/ai-gateway/inference-tables) configuration.
- Unity Catalog remains the governance layer for the tools themselves, with [Databricks managed MCP servers](https://docs.databricks.com/aws/en/agents/mcp-tools/managed-mcp), in Public Preview, for governed Databricks resources and MCP services for external MCP servers.
- Coverage is partial in specific, documented ways, so the word "all" does not belong in a design document without checking each one.

## Where the Boundary Sits

Inference tables can be configured only after a model service exists, so a new endpoint records nothing until logging is turned on. Requests and responses larger than 10 MiB are not logged, and the logging_error_codes column reports MAX_REQUEST_SIZE_EXCEEDED or MAX_RESPONSE_SIZE_EXCEEDED when that happens. Logs may not be populated for requests that return 401, 403, 429, or 500. The gateway trace table that draws these records together is Beta and should not be described as generally available.

Endpoint type matters too. Guardrail, rate limit, and fallback support is not uniform across endpoint types, so a design that assumes identical behavior across all of them will find gaps at review. Audit logs do not fill those gaps, because they capture management operations rather than inference traffic.

## Run the Connection Inventory

Classify each capability as an internal Unity Catalog function, table, or index, or as an external service, then attach the matching connection type instead of routing everything through one endpoint by habit. Record the owner, the permitted actions, the authentication path, and the release stage for every entry, and retire connections no workflow calls. The target is a reviewable set of connections, not a large catalog of callable actions.

## When Databricks Is Not the Right Fit

An organization whose model traffic originates entirely outside Databricks, from applications that never touch governed data, gains little from routing it here, and a general purpose API gateway already in that path is the closer fit. Unity Gateway earns its place when the same governance layer covers the data, the models, and the tools the traffic reaches.

## Frequently Asked Questions

**Does Unity Gateway log every request and response?**

No. Logging belongs to inference tables, which are configured separately and carry size limits and unlogged error codes.

**Is one connection type correct for internal and external tools?**

No. Unity Catalog resources reach clients through Databricks managed MCP servers, while external MCP servers are registered as MCP services. Release stages differ, so each should be confirmed before rollout.
