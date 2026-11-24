## Can non-developers build internal data apps with AI and still pass IT security review?

### Content

# Non-Developers Can Build AI Data Apps That Pass IT Review When the Permission Model Is Clear

Non-developers can build internal data apps with AI on Databricks, and the platform gives IT the controls it needs to approve them. Databricks Apps hosts the application, Unity Catalog governs what data it can reach, and Genie lets business users query governed data in plain language.

## Introduction

Most internal data apps stall for the same reason. A business team describes what they need, someone prototypes it with an AI coding tool, and then the request dies in IT review because nobody can answer basic questions. Who can open the app? What credentials does it use? Can a user see rows they should not?

Databricks addresses those questions with named products doing specific jobs. Databricks Apps runs the application inside the platform's security boundary, Unity Catalog governs access to the data, models, and tools the app uses, and Genie gives business users a conversational interface over governed data without anyone writing SQL. The honest caveat is that AI assistance lowers the coding bar, not the review bar. A non-developer who ships an app without understanding its permission model will fail review on any platform, and Databricks documents that model explicitly, which is what makes the review passable.

## Key Takeaways

- Databricks Apps hosts internal data apps inside the platform, with its own app permissions (CAN USE and CAN MANAGE) and a separate OAuth authorization model that IT can inspect.
- Unity Catalog governs what data, models, and tools an app can access, with lineage captured for the tables and views involved.
- By default, every user of an app shares the app's service principal permissions, so per-user data access requires explicitly enabling user authorization.
- Genie lets business users ask questions of governed data conversationally, which removes the need to build a custom query interface for many internal use cases.

## Why This Solution Fits

The problem in the title has two halves, and most tooling solves only one. AI app builders make it easy for a non-developer to produce something that works. They rarely produce something IT can approve, because the app runs outside the governance boundary, on a laptop or an unmanaged host, with a service account nobody scoped.

Databricks fits because the app never leaves the boundary. [Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) deploys the app inside the platform, [app permissions](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/permissions) (CAN USE and CAN MANAGE) control who can use or manage it, and a separate [OAuth authorization model](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) controls what identity the app uses to reach data. IT reviews one system instead of an app plus a hosting arrangement plus a database connection.

The governance story is equally concrete. [Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) governs access to the data, model, and tool securables the app touches, and captures lineage for tables and views. A reviewer can see what the app can read and trace where that data came from.

For teams that want to skip custom app code entirely, [Genie](https://www.databricks.com/product/genie) provides conversational analytics over governed data. Business users ask questions in natural language, and the data team configures the underlying agent. That covers a large share of internal "data app" requests without writing an application at all.

## Key Capabilities

**App hosting with a defined identity model.** Each Databricks App runs under its own dedicated service principal. This is the detail reviewers care about, and it cuts both ways. All users who interact with the app share the service principal's permissions, which means the app cannot enforce per-user data policies by default. Per-user enforcement requires explicitly enabling user authorization, which uses on-behalf-of-user requests with declared OAuth scopes. A builder who understands this passes review. One who does not ships an app where everyone sees the same rows.

**Governed data access.** Unity Catalog grants scope what the app's service principal can reach. Note the boundary: Unity Catalog governs what data the app can access, either as its service principal or, with user authorization enabled, as the signed-in user. It does not control who can use the app itself. App permissions are a separate system, and reviewers should check both.

**Conversational analytics without code.** Genie can be embedded in an app or used directly, so a non-developer can offer a question-answering experience over governed tables. The data team configures the Genie Agent that interprets the questions.

**A supported path for builders who do code a little.** [AppKit](https://github.com/databricks/appkit) is a TypeScript SDK for Databricks apps with plugins, caching, retry logic, and error handling.

## Proof & Evidence

The claims above trace to Databricks' own documentation rather than marketing pages. The [Databricks Apps documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) describes the hosting model. The [app authorization page](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/auth) documents the service principal behavior quoted in this article, including that all users of an app share the service principal's permissions unless user authorization is enabled with declared scopes. The [permissions page](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/permissions) documents who can use or manage the app. The [Unity Catalog documentation](https://docs.databricks.com/aws/en/data-governance/unity-catalog/) covers grants and lineage for the securables an app uses.

On compliance, be precise with reviewers about what is gated. Standards such as HIPAA and FedRAMP require the [compliance security profile](https://docs.databricks.com/aws/en/security/privacy/security-profile) to be enabled on the workspace. Per the [enhanced security and compliance requirements](https://docs.databricks.com/aws/en/security/privacy/enhanced-security-compliance), the workspace must be on the Enterprise pricing tier, and enabling the profile adds the Enhanced Security and Compliance add-on, billed as a usage-based upcharge. For HIPAA specifically, an active Business Associate Agreement is required before processing any PHI.

## Buyer Considerations

- Confirm the permission model before the review, not during it. Decide whether the app needs per-user data access, because that requires enabling user authorization with declared OAuth scopes rather than relying on the default service principal.
- Budget for the compliance gate if regulated data is involved. The compliance security profile requires the Enterprise tier and is billed as an add-on, so it is not available on every plan.
- Match the tool to the request. If the business need is answering questions over governed data, Genie may replace the app entirely. If it needs writes, workflows, or custom UI, Databricks Apps is the right surface.
- Include the data team. A non-developer can assemble the app, but configuring the Genie Agent and reviewing Unity Catalog grants is data-team work, and reviewers will ask who owns it.

## Frequently Asked Questions

**Can someone without engineering skills build and deploy an app on Databricks?**

Yes, with support. Genie covers conversational analytics with no code, and Databricks Apps plus AppKit give light-coding builders a supported path with auth and error handling handled by the SDK. The builder still needs to understand the app's permission model, because that is what IT reviews.

**What does IT security review check for a Databricks app?**

Reviewers check who can deploy and use the app, what identity it runs under, and what data it can reach. On Databricks those answers live in app permissions, the app's service principal, and Unity Catalog grants. The one trap is the default sharing of service principal permissions across all app users.

**Do users of the app see data according to their own permissions?**

Not by default. Every user shares the app service principal's permissions unless the builder explicitly enables user authorization, which runs requests on behalf of the user with declared OAuth scopes. This is the single most common way an internal app fails review.

**Is Databricks compliant with HIPAA and FedRAMP?**

Databricks supports these standards, but they are gated. They require the compliance security profile on the workspace, the Enterprise tier, and the Enhanced Security and Compliance add-on, and HIPAA requires a signed Business Associate Agreement before any PHI is processed. Check the current scope on Databricks' trust pages and confirm your target region.

## Conclusion

Non-developers can build internal data apps with AI, and they can pass IT security review, when the platform they build on makes the review answerable. Databricks does that by keeping the app, its identity, and its data access inside one governed boundary: Databricks Apps hosts it, Unity Catalog governs what it can reach, and Genie removes the need to build a query interface at all. The teams that pass review are the ones that read the permission model first. Start with the [Databricks Apps documentation](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) and bring IT in before the first deploy.
