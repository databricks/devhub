## What's the ongoing operational maintenance burden difference between running a Python data app on external infrastructure versus inside Databricks Apps?

### Content

# External Infrastructure Adds Ongoing Operational Burden That Databricks Apps Absorbs

Running a Python data app on external infrastructure means a team owns patching, scaling, and incident response for as long as the app exists. Databricks Apps absorbs most of that infrastructure-layer work by running the app on managed [serverless compute](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/), leaving the team mainly responsible for its own application code and library dependencies.

## Key Takeaways

- External hosting puts OS patching, runtime upgrades, autoscaling configuration, and uptime ownership on the team that built the app.
- Databricks Apps runs on a managed serverless platform, so host patching, capacity, and scaling are handled outside the app team.
- Incident response still exists with Databricks Apps, but it narrows to the application layer rather than the host, network, and scaling layers too.
- Upgrading the app's own Python library dependencies remains the team's job under either approach.

## The Maintenance Work External Hosting Creates

An externally hosted Python app needs someone watching for base image vulnerabilities, applying OS-level security patches, and rebuilding containers on a schedule. It needs an autoscaling policy tuned to real traffic, certificate renewal, and a monitoring stack wired up before the first incident happens. When the app goes down overnight, an on-call rotation from that team answers, because nothing else owns that uptime commitment.

## What Databricks Apps Removes From The List

[Databricks Apps](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/) runs on a serverless platform that Databricks operates, so host patching, capacity provisioning, and runtime upgrades happen without the app team scheduling them. Compute sizing is a configuration choice, and [horizontal scaling](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/compute-size) across instances is available for apps that need more concurrency, instead of a custom autoscaling setup. [Logging and monitoring](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/monitor) are built into the platform, so a team is not standing up its own observability pipeline first.

## What Still Requires Attention

A team still updates the packages its own app code depends on, tests new library versions, and watches app-level errors. The ongoing work narrows to the application and its dependencies rather than the host, network, scaling policy, and observability stack as well.

## Conclusion

The maintenance gap between the two approaches shows up months after launch, not on day one. External infrastructure keeps growing its list of things to patch, scale, and watch as the app ages. Databricks Apps holds that list to the application layer by keeping compute, patching, and scaling on the platform side.
