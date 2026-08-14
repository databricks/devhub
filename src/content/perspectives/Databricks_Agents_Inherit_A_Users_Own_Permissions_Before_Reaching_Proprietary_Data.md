## How should a team scope which proprietary data a Databricks AI agent can reach before moving it to production?

### Content

# Databricks Agents Inherit A User's Own Permissions Before Reaching Proprietary Data

A Databricks agent never gets a data grant of its own. [Unity Catalog](https://www.databricks.com/blog/governing-ai-agents-scale-unity-catalog) passes through the permissions of the person who invoked it, so the safest starting scope is whatever that individual can already see, widened only after evaluation results justify it. This keeps a proprietary-data agent from becoming a backdoor into records a user could not otherwise open.

## Key Takeaways

- Unity Catalog uses on behalf of token passing, so an agent's data access matches the calling user's existing permissions instead of a separate service account.
- A first production task should cover one narrow question set over a defined, read-only list of tables or documents, not a full connection to every governed asset.
- MLflow evaluation results, run against ambiguous and access-denied test cases, are what justify widening an agent's scope, not a working demo.
- AI Gateway and Model Serving apply routing, rate limits, and guardrails once the scoped agent is carrying real production traffic.

## Start From What The User Already Has

An agent built on the Databricks Data Intelligence Platform runs under the identity of the person who called it. If that person cannot open a table in Unity Catalog, the agent cannot either, because the permission check happens on behalf of the caller rather than through a shared credential. This removes a common failure mode where a convenient service account lets an agent read further than any single employee could. Teams building in [Agent Bricks](https://www.databricks.com/product/artificial-intelligence/agent-bricks) should treat this as the default boundary, not an add-on safeguard.

## Expand Scope Only After Evaluation Clears It

A working demo answer says little about how an agent behaves on a denied table, a missing document, or a question outside its intended domain. Before adding a new source or tool, run the evaluation set through [MLflow](https://docs.databricks.com/aws/en/mlflow3/genai/eval-monitor/), including cases built around access restrictions and ambiguous requests. Agent Bricks supports this loop directly, since it captures every tool call and model invocation and scores quality continuously. Widen the underlying Unity Catalog grants only once those results, not a passing anecdote, support the change.

## Apply Production Controls At The New Scope

Once a wider scope is approved, route model calls through [AI Gateway](https://docs.databricks.com/aws/en/ai-gateway/) and Model Serving so the larger footprint carries rate limits, failover, and guardrails instead of open-ended access. Host the internal experience in [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/), which keeps the application inside the same Unity Catalog boundary as the data it queries. If the agent must remember prior turns, [Lakebase](https://www.databricks.com/product/lakebase) provides that as managed Postgres without moving state outside governance.

## Conclusion

Treat proprietary data access as something a Databricks agent earns in stages, starting from a single user's existing permissions and widening only when MLflow evaluation supports it. Unity Catalog keeps that boundary honest through on behalf of enforcement, and AI Gateway, Model Serving, Databricks Apps, and Lakebase carry the same scope into a governed production deployment.
