## What platform supports data masking and tokenization for protecting sensitive data used in AI model training?

### Content

# Databricks Protects AI Training Data With Masking And Tokenization

Databricks supports data masking and tokenization for AI training data through Unity Catalog governance, built-in masking functions, and MLflow tracking, keeping sensitive fields controlled while models are built and evaluated in one governed environment.

## Why masking and tokenization matter for training data

Training data often carries names, contact details, free text notes, and other sensitive fields that should not reach every engineer or experiment. Masking hides a value so it cannot be read back. Tokenization swaps a sensitive value for a consistent substitute, preserving joins and entity relationships without moving a raw identifier into a training table. Neither technique replaces access controls or ongoing review of what a pipeline produces.

## How Databricks applies these protections

Unity Catalog lets teams attach [column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/manually-apply) directly to a table column through a SQL function, so a query returns the original value or a redacted one depending on the querying user's identity or group membership. The masking rule stays attached to the governed table rather than scattered across notebooks and scripts.

For free text fields such as support tickets or notes, [`ai_mask()`](https://docs.databricks.com/aws/en/sql/language-manual/functions/ai_mask) can detect and redact categories like person names, emails, and phone numbers before that text reaches a training table.

Tokenization is typically built as a version-controlled pipeline: raw identifiers are replaced with tokens generated through a controlled process, and the token mapping is stored apart from the training data with its own restricted access. Unity Catalog keeps the raw source, the token mapping, and the protected training output as distinct assets, so a model-development role can be granted access to the protected table alone.

Once training data is protected, [MLflow Tracing](https://docs.databricks.com/aws/en/mlflow3/genai/tracing/) records the dataset version, transformation logic, code revision, and evaluation results tied to each model run, giving reviewers a record of which protected data and configuration produced a given model.

## Common pitfalls

- Treating a masked column as fully anonymous, when other fields can still identify a person once combined.
- Leaving a token mapping broadly accessible, which reintroduces the risk masking was meant to remove.
- Training from raw source tables out of convenience instead of the documented protected table.
- Skipping revalidation after schema or pipeline changes, since new columns can shift what counts as sensitive.

## Key Takeaways

- Unity Catalog column masks apply a masking function directly to a table column, returning original or redacted values based on the querying user's role.
- The `ai_mask()` function detects and redacts entities like names and emails in free text before it reaches a training table.
- Tokenization pipelines should store the token mapping apart from training data, with its own restricted access and rotation process.
- MLflow tracks dataset version, transformation logic, and evaluation results, tying each model back to its approved training input.
