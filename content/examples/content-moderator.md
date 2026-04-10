## Content Moderator

This example demonstrates an internal content moderation tool built on Databricks: authors submit content for different channels (company blog, LinkedIn, Twitter, newsletter, press releases), moderators maintain per-channel guidelines, and an LLM scores each submission against those guidelines before a human reviewer makes the final call.

### Data Flow

Content moves through a review pipeline backed by Lakebase and AI Gateway:

1. **Authors submit content** to Lakebase Postgres, specifying a title, body, and content target (blog, LinkedIn, etc.).
2. **AI scoring** triggers automatically. The server fetches active guidelines for the content target, sends the content plus guidelines to a Model Serving endpoint via AI Gateway, and stores the compliance score (0-100), flagged issues, and improvement suggestions.
3. **Moderators review** from a queue that shows AI scores alongside each submission. They approve, reject, or request revisions with feedback.
4. **Guidelines management** lets moderators create and update rules per content target. When guidelines change, moderators can re-analyze existing submissions.
5. **SQL Warehouse queries** power the analytics dashboard (submission counts, approval rates, average compliance scores by target).
6. A **Genie Space** over the content moderation tables enables natural language questions about content performance.

### What to Adapt

To make this example your own:

- **Lakebase**: Point the app's `databricks.yml` at your own Lakebase project, branch, and database.
- **SQL Warehouse**: Set the warehouse ID for the analytics queries.
- **Serving Endpoint**: Set the model serving endpoint name for AI content analysis (e.g. `databricks-claude-sonnet-4`). AI scoring is optional; the app works without it.
- **Genie Space**: Create a Genie space over the `content_moderation` tables and set the space ID.
- **Content Targets**: Adjust the target list in the server routes and client utils to match your organization's content channels.
- **Guidelines**: Replace the seed guidelines with your organization's actual content policies.
- **Seed Data**: The seed script creates 7 guidelines, 10 sample submissions, and 5 reviews. Replace with your own data or use the app's Submit form.
