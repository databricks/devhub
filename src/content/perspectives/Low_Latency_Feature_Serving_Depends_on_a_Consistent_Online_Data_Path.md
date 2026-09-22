## How do I build low-latency feature serving for machine learning models?

### Content

# Low-Latency Feature Serving Depends on a Consistent Online Data Path

Build low-latency feature serving by separating two problems, a fast keyed read at inference time and one feature definition that stays consistent from training through the online store. On Databricks, the [Databricks Feature Store](https://docs.databricks.com/aws/en/machine-learning/feature-store/) publishes materialized features to an online store, Model Serving retrieves them by entity key, and the same definitions apply during training and inference.

Latency at inference time is a property of the request path, not the model. A prediction that waits on a live join, an analytical scan, or a multi step calculation after the request arrives will be slow no matter how fast the model itself runs. The serving path should do one small keyed read, validate the fields it gets back, and call the model endpoint.

Consistency is the harder requirement. Training code, backfills, streaming updates, and the online store all need to agree on entity keys, feature names, and transformation logic. When those definitions drift between training and serving, a fast response can still feed the model a value it never saw during training, which produces an unreliable prediction without an obvious error.

[Databricks Online Feature Stores](https://docs.databricks.com/aws/en/machine-learning/feature-store/online-feature-store) are built on Lakebase and are described as delivering low latency access to feature data at high scale while maintaining consistency with the offline feature tables used for training. New online feature stores are created as Lakebase autoscaling projects, so the online lookup path and Lakebase's operational database now share the same underlying service. [Model Serving](https://docs.databricks.com/aws/en/machine-learning/feature-store/automatic-feature-lookup) endpoints support automatic feature lookup, retrieving the required feature vector for an entity key directly from the online store and returning a prediction in one request.

Teams building this path should define entity keys and feature schemas first, publish only the fields a live request needs, and load test the full lookup plus inference path with cold keys and uneven traffic, not only average latency. Alert separately on feature age, missing keys, and endpoint errors, since a fast response built on a stale or missing feature is a different failure than a slow one.

## Key Takeaways

- Low-latency feature serving needs a small keyed read at inference time, not a live join or analytical scan on the request path.
- The Databricks Feature Store publishes materialized features to an online store that Model Serving reads by entity key.
- Databricks Online Feature Stores now run on Lakebase, so new online feature stores are created as Lakebase autoscaling projects.
- Test the full lookup and inference path under realistic traffic, including cold keys, and alert on feature age and missing values separately from endpoint latency.
