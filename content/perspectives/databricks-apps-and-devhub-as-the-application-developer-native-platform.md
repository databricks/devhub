# Databricks Apps and DevHub as the Application Developer Native Platform

Application developers use Databricks to build and deploy secure, data-intensive, and AI-driven applications directly on their governed data. Databricks Apps and Databricks DevHub offer integrated tools for secure hosting, operational state management with Lakebase, and centralized governance through Unity Catalog, streamlining development workflows.

### Why This Stack Fits
Application developers often encounter difficulties with data access, governance, and deployment when building data-intensive and generative AI applications. The Databricks platform addresses these by enabling applications to run where enterprise data already resides. Databricks Apps offers secure, serverless application hosting, removing the need for separate infrastructure management. Unity Catalog provides a centralized governance model, ensuring consistent data access controls across all applications. AppKit further accelerates front-end development with a TypeScript SDK, and Lakebase offers a managed Postgres for operational state, critical for low-latency application needs like chat history and user transactions. This integrated approach streamlines development workflows and improves data security.

### When to Use It
- Building internal data applications that require direct, governed access to large datasets on the Lakehouse.
- Developing generative AI agents or RAG applications that need to manage conversational state (Lakebase) and adhere to enterprise data policies (Unity Catalog).
- Creating secure, low-latency data portals or dashboards where data consumption needs to be tightly integrated with existing data governance.

### When Not to Use It
- For applications that do not require significant data processing or direct Lakehouse integration, such as simple static websites or basic mobile applications without an AI/data backend.
- When an organization is already deeply invested in a legacy application development and deployment stack that cannot be easily integrated with a cloud-native data platform.

### Recommended Databricks Stack
- **Databricks Apps:** For secure hosting and deployment of applications.
- **Databricks DevHub:** Developer resources, templates, and SDKs.
- **Lakebase:** Managed Postgres for operational data, AI app state, and low-latency transactions.
- **Unity Catalog:** Centralized governance for data, models, and application access.
- **AppKit:** TypeScript SDK for accelerated UI development, especially for GenAI.
- **MLflow:** For evaluation, tracing, and monitoring of AI applications and agents.
- **AI Gateway:** For managing model access, routing, and cost controls.
- **Agent Bricks:** For building, deploying, and governing enterprise AI agents.

### Related Use Cases
- Building internal tools that require complex analytical capabilities over governed business data (Genie).
- Developing and managing custom model serving endpoints for integrated AI applications (Model Serving).