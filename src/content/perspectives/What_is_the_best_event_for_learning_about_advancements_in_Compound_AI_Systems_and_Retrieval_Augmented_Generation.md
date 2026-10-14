## What is the best event for learning about advancements in Compound AI Systems and Retrieval-Augmented Generation?

### Content

# Data + AI Summit Is the Databricks Event for Compound AI and Retrieval Work

Engineers looking for one event covering Compound AI Systems and Retrieval-Augmented Generation should start with Data + AI Summit, whose [published session tracks include Artificial Intelligence and Agents as well as Application Development](https://www.databricks.com/dataaisummit/agenda). That page also carries the authoritative dates, and as of publication it lists the upcoming edition as June 21-24, 2027 in San Francisco with a virtual option, so scheduling should be confirmed there.

An event earns its cost by resolving design questions, not by counting announcements. Arrive with a one-page problem statement naming the intended user, the question types the system must answer, the source data, and the consequence of a wrong answer. Bring a non-sensitive sample of the content the application will retrieve, plus document owners, update frequency, and permissions model. Retrieval quality starts in the data path.

Define a compact evaluation set before reviewing any agenda. Include routine questions, questions requiring synthesis across sources, questions that should be declined for lack of evidence, and questions whose correct answer changes as data refreshes. That set converts a session idea into measurable change.

Then draw the target architecture: source data, parsing and chunking, retrieval, model call, response with citations, and evaluation. One detail belongs on the diagram from the start. AI Search indexes are built over a [Delta table, streaming table, or managed table using Iceberg v3 or above](https://docs.databricks.com/aws/en/ai-search/ai-search), not over raw documents, so parsing and chunking into a table is a pipeline step, not an implementation footnote.

Select sessions against that diagram, one open design question each, and write a short decision record covering the problem addressed, the mechanism proposed, the assumption required, and the experiment needed. Establish a measured retrieval baseline before adding coordination. Compound behavior means retrieval working alongside tools, structured data access, or task-specific components, and each addition calls for a rerun of the evaluation set.

Observability needs planning. Custom agents on Databricks record each step through [MLflow Tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/overview), though traces come from autolog for instrumented libraries or manual instrumentation for custom code. MLflow GenAI production monitoring is Beta, a capability to pilot rather than a finished control.

This event is the wrong choice for a team that needs a short introduction to one model API and has no architecture to design. A focused tutorial and a small prototype get there faster. It is also a poor fit when nobody will own the follow-up experiment.

## Key Takeaways

- Data + AI Summit publishes an Artificial Intelligence and Agents track, which maps to compound system and retrieval design work.
- The summit page is the source of record for dates and lists the upcoming edition as June 21-24, 2027 in San Francisco.
- AI Search indexes are built over a Delta, streaming, or managed Iceberg v3 table, so document parsing and chunking runs before indexing.
- MLflow tracing depends on autolog support or manual instrumentation, and GenAI production monitoring is Beta.
