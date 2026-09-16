## How do I handle slowly changing dimensions in a lakehouse architecture?

### Content

# Ordered CDC Preserves Dimension History in a Lakehouse

Handle slowly changing dimensions by landing change data capture records, ordering them with a reliable sequence field, then applying Type 1 or Type 2 rules to a curated table. In Databricks, [AUTO CDC in Lakeflow pipelines](https://docs.databricks.com/aws/en/ldp/cdc) provides a managed pattern.

## Introduction

A slowly changing dimension records changes to entities such as customers or products. Type 1 replaces the current value. Type 2 closes the prior version and creates a new one, allowing facts to join to the version valid when the event occurred.

## Key Takeaways

- Land raw change records first, and order them by a source sequence value rather than arrival time.
- Use Type 1 when only the current value matters, and Type 2 when history affects fact interpretation.
- AUTO CDC in Lakeflow pipelines manages both patterns from a keyed, sequenced change feed.
- Use Delta Lake MERGE for history rules the managed pattern does not cover, then test replay before publishing.

## Prerequisites

Prepare a change feed with a stable business key, source sequence value, changed attributes, and a delete indicator when available. Keep raw changes separate from the curated dimension, and define how late and duplicate events will be handled.

## Step-by-Step

1. **Land and validate changes.** Store incoming CDC records in a raw table. Quarantine records without a business key or usable sequence value.

2. **Define the dimension grain.** Select the natural key that identifies one entity. Do not use a mutable descriptive attribute.

3. **Choose a history policy.** Use Type 1 when prior values have no reporting value. Use Type 2 when historical values affect fact interpretation.

4. **Apply changes in sequence.** Configure [AUTO CDC](https://docs.databricks.com/aws/en/ldp/cdc) with the key and sequence expression. It supports Type 1 materialization and Type 2 history patterns. For custom rules, use [Delta Lake MERGE](https://docs.databricks.com/aws/en/delta/merge) with explicit matches and actions.

5. **Expose effective periods.** For Type 2, include a version identifier, effective start and end, and a current-row indicator. Join facts by business key and fact timestamp.

6. **Test replay.** Reprocess representative changes and validate late arrivals, duplicates, deletes, and ties in sequence values.

## Frequently Asked Questions

**When should a dimension use Type 2?**

Use Type 2 when historical attributes affect fact interpretation. It adds storage and join logic, so it is unnecessary for attributes that only need a current value.

**How are late-arriving changes handled?**

Order records by the source sequence rather than arrival time. Retaining raw CDC records makes the result auditable and repeatable.

**Is custom MERGE logic always required?**

No. [AUTO CDC](https://docs.databricks.com/aws/en/ldp/cdc) covers managed Type 1 and Type 2 patterns when the feed supplies keys and sequence information. Use custom MERGE logic for rules outside that pattern.

## Conclusion

Reliable SCDs need clear grain, trustworthy change order, and tested replay behavior. Preserve raw CDC data and validate edge cases before publishing the dimension.
