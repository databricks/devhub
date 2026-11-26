## What are the best tools for enforcing guardrails and PII filtering on every LLM call across a company?

### Content

# Unity Gateway Service Policies Put Guardrails and PII Filtering on Governed AI Traffic

Databricks enforces guardrails and PII filtering centrally through Unity Gateway, which registers models and MCP servers as Unity Catalog securables and applies guardrails to them as service policies. Service policies, currently in Beta, can deny a model response that contains personally identifiable information, block unsafe content or prompt injection, and enforce partner guardrails, for Databricks-hosted models and models from other providers alike. Pairing that with Unity Catalog data controls and MLflow tracing gives you enforcement, evidence, and auditability in one platform.

## Introduction

Most companies do not have one LLM call. They have dozens of apps, agents, and notebooks calling models, and each one is a chance for a customer's name, an address, or a credit card number to leak into a prompt or a response. Point fixes inside individual applications do not scale, because every new app reintroduces the risk.

The fix is to put the controls where model traffic is governed, not where the apps are written. On Databricks, that place is [Unity Gateway](https://docs.databricks.com/aws/en/ai-gateway/), which routes requests to model and MCP services from a central control plane. Unity Catalog grants decide whether a principal can call a service, and service policies govern the content of each request and response. This article explains how the pieces fit, what each one does, and where the limits are.

## Key Takeaways

- Unity Gateway registers model services, model provider services for external providers, and MCP services as Unity Catalog securables, so access is granted and revoked like any other securable.
- [Service policies](https://docs.databricks.com/aws/en/data-governance/unity-catalog/service-policies/) implement guardrails, including built-in checks for structured sensitive data (such as credit card and Social Security numbers), jailbreaks, and unsafe content, custom policies for broader PII rules, and partner guardrails. They are in Beta and enabled through the Unity Gateway Service Policies preview.
- Inference tables and MLflow tracing capture what was sent and returned for supported traffic, giving security teams an evidence trail with documented limits.
- Unity Catalog row filters and column masks restrict sensitive data at SQL query time, which reduces how much PII reaches a prompt in the first place.

## Why This Solution Fits

The problem in the title has three parts: enforcement on every call, PII specifically, and coverage across a whole company. Databricks addresses each part with a specific mechanism.

For enforcement, guardrails attach to the AI service itself. Because Unity Gateway governs model services and MCP services registered in Unity Catalog, a service policy applies to supported requests (chat completions, Anthropic Messages, OpenAI Responses, and Gemini generateContent, plus embedding inputs) that reach that service through the gateway, from a production app to an analyst's notebook. Legacy text completion requests are not checked, and some request types, such as unmanaged passthrough requests, are rejected with HTTP 400 while a policy is attached, so test existing clients.

For PII specifically, the service policies documentation describes denying a model response that contains personally identifiable information and blocking sensitive data, unsafe content, or prompt injection. On model services and model provider services, output policies can check a streaming response as it is generated.

For company-wide coverage, the same Unity Catalog that governs tables also governs AI services. Grants decide who can call which model or MCP service, and service policies decide what content is allowed through, so the permission model and the guardrails live in one place.

## Key Capabilities

**Service policies as guardrails.** Service policies are the mechanism for guardrails on AI services registered in Unity Catalog. Databricks provides built-in guardrails for common risks, you can write custom policies for rules specific to your organization, and you can enforce a third-party partner guardrail. See the [tutorial for adding service policy guardrails to a model service](https://docs.databricks.com/aws/en/ai-gateway/moderate-tutorial).

**Coverage beyond Databricks-hosted models.** Service policies govern interactions with AI services registered in Unity Catalog, including external MCP servers and models from external providers through supported chat-style APIs, not only Databricks-hosted ones.

**Inference logging.** [Inference tables](https://docs.databricks.com/aws/en/ai-gateway/inference-tables) capture request and response payloads for model services. They deliver logs through Zerobus with at-least-once delivery, requests and responses larger than 10 MiB are not logged, and requests that return 401, 403, 429, or 500 errors may not be logged.

**MLflow tracing for agents.** For agent workloads, MLflow tracing records each step of an instrumented agent run, including model calls and tool use. Tracing covers what autologging captures for supported libraries plus manual instrumentation for custom logic, so plan instrumentation deliberately rather than assume full coverage.

**Data-level controls with Unity Catalog.** Row filters control which rows a caller sees and column masks transform column values at query time, based on the caller's identity. This is a complementary control: it limits the PII that enters a prompt from governed tables, while service policies screen the AI traffic itself.

## Proof & Evidence

The guardrail mechanism comes from Databricks' own documentation. The [Unity Gateway overview](https://docs.databricks.com/aws/en/ai-gateway/) describes controlling which AI services teams can use, routing traffic, setting guardrails with service policies, and monitoring usage from one control plane. The [service policies documentation](https://docs.databricks.com/aws/en/data-governance/unity-catalog/service-policies/) describes the built-in, custom, and partner guardrail options and the PII, prompt injection, and unsafe content examples.

The [inference tables documentation](https://docs.databricks.com/aws/en/ai-gateway/inference-tables) documents payload logging, including the 10 MiB limit and the error codes that may not be logged. For agent workloads, the [MLflow tracing documentation](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/overview) covers how traces are captured through instrumentation.

## Buyer Considerations

Confirm release status. Unity Gateway is generally available, but service policies are in Beta and are turned on separately by workspace admins through the Unity Gateway Service Policies preview.

Route traffic through governed services. Service policies apply to AI services registered in Unity Catalog and reached through Unity Gateway. Calls made directly from third-party SDKs to external providers, with no Databricks service in the path, are outside that enforcement point. Some workspace MCP endpoints, including the Genie Agent MCP, use permissions on the underlying resources without Unity Gateway governance.

Check traffic types. Not every path gets every gateway feature. For example, `ai_query` batch inference requests get usage tracking, budgets, and permission checks, but service policy guardrails are not applied to them, per the [ai_query documentation](https://docs.databricks.com/aws/en/large-language-models/ai-query).

Legacy endpoints differ. Standalone Model Serving endpoints configured with AI Gateway (legacy) have their own guardrail settings, which are in Public Preview, cover safety and PII detection, and support OpenAI-compatible Chat Completions and Completions requests with non-streaming responses. Plan new deployments on Unity Gateway.

Layer the controls. Service policies screen traffic, but they do not replace data-level access control. Row filters and column masks are SQL-query-time controls evaluated against the calling identity, and they do not automatically extend to Model Serving inference or AI Search indexes.

## Frequently Asked Questions

**Do guardrails apply to calls made directly to external model providers?**

They apply when the external provider is registered as a model provider service in Unity Catalog and traffic flows through Unity Gateway. Calls that bypass the gateway, such as direct SDK calls to a provider, are outside the guardrail path. Standardizing model access through governed services is what makes company-wide enforcement possible.

**What PII protection is available?**

Service policies include built-in guardrails for sensitive data, and the documentation gives denying a model response that contains PII as an example. Test detection against your own data categories before relying on it, and use custom policies for organization-specific rules.

**Can we log every prompt and response for audit purposes?**

Inference tables capture request and response payloads for model services, but payloads over 10 MiB are not logged and some error responses may not be captured. Treat the logs as strong evidence for review and investigation, and design any hard compliance requirement around the documented limits.

**How do we cover agents, not only single model calls?**

Govern the models and MCP services the agent calls through Unity Gateway so service policies apply to that traffic, and use MLflow tracing to record each step of an instrumented agent run.

## Conclusion

Enforcing guardrails and PII filtering on every LLM call across a company is an architecture problem before it is a tooling problem. The controls have to sit where model traffic is governed. Databricks puts them there: Unity Gateway registers models and MCP servers as Unity Catalog securables, service policies screen their content for PII, unsafe content, and prompt injection, inference tables and MLflow tracing provide the evidence trail, and Unity Catalog limits the sensitive data that reaches prompts in the first place. Service policies are in Beta, so confirm availability for your workspace and route traffic through governed services. Start with the [Unity Gateway documentation](https://docs.databricks.com/aws/en/ai-gateway/).
