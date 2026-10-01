---
title: Use Omnigent programmatically
sidebar_label: Programmatic usage
description: Run Omnigent from scripts with Databricks authentication. Choose a host, create a session, send a task, wait for its result, and continue in your workspace.
sourceOfTruth:
  docs:
    - https://omnigent.ai/docs/programmatic
    - https://docs.databricks.com/aws/en/omnigent/quickstart
    - https://docs.databricks.com/aws/en/omnigent/identity-access
    - https://docs.databricks.com/aws/en/dev-tools/auth/oauth-u2m
---

# Use Omnigent programmatically

Use Omnigent from a script to start an agent, give it a task, and collect the result. Sessions live in your Databricks workspace, so you can open the same conversation in the browser or mobile app to review progress and continue the work.

:::note[Beta]

Omnigent on Databricks is in [Beta](https://docs.databricks.com/aws/en/release-notes/release-types). For detailed guides and reference, see the [open-source Omnigent documentation](https://omnigent.ai/docs/programmatic).

:::

## Choose an interface

| Interface  | Use it for                                                                        | Where tools run                                                                      |
| ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| CLI        | Run a task from a terminal or shell script and print the response.                | On the machine invoking `omni run`, including when you use `--server`.               |
| Python SDK | Send tasks, consume session events, and retrieve results in a Python application. | On the host assigned to the session. The SDK alone does not start a local host.      |
| REST API   | Integrate from another language or choose a host when creating a session.         | On a connected host you select, or a Databricks Sandbox provisioned for the session. |

A **Databricks Sandbox** uses models through **Unity Gateway**, with token usage governed and billed through Databricks. A **connected laptop or VM** uses its configured model credentials and provider billing; it can also use Unity Gateway. Signing in to the managed server does not change that host's model configuration.

## Before you start

Complete the [quickstart](/docs/omnigent/quickstart), including its preview, region, and model-access requirements. Verify a working session with the coding agent and host you plan to automate.

For a connected host, keep the machine and its Omnigent host process running. Its repository path, tools, credentials, and network access must be available on that machine. For Sandbox, enable its separate preview and check the [managed limitations](https://docs.databricks.com/aws/en/omnigent/#limitations).

The examples below use your **Databricks user identity** and a workspace URL such as `https://my-workspace.cloud.databricks.com`. On the machine running your script, install the [Databricks CLI](/docs/tools/databricks-cli#install-or-upgrade) and, for Python, [uv](https://docs.astral.sh/uv/getting-started/installation/). The CLI examples also require the Omnigent CLI from the [host setup instructions](/docs/omnigent/quickstart#2-install-omnigent).

## Authenticate to Databricks

Omnigent on Databricks uses workspace authentication. The open-source server's username/password endpoint and Omnigent-issued machine tokens do not apply to this deployment.

For Omnigent CLI commands, sign in with:

```bash
omni login "<workspace-url>"
```

For the Python and REST examples, create a named Databricks CLI OAuth profile. Replace the example host with your workspace's HTTPS origin, without `/omnigent` or an API path:

```bash
export DATABRICKS_HOST="https://my-workspace.cloud.databricks.com"
export DATABRICKS_CONFIG_PROFILE="omnigent-dev"
databricks auth login --host "$DATABRICKS_HOST" --profile "$DATABRICKS_CONFIG_PROFILE"
```

Complete browser sign-in as the same user who registered your host. The Python example explicitly uses `databricks-cli` authentication and asks the Databricks SDK for fresh headers on each request, so it can refresh expiring OAuth tokens.

These URLs serve different purposes:

| Purpose                                 | URL                                       |
| --------------------------------------- | ----------------------------------------- |
| Omnigent CLI `--server`                 | `<workspace-url>`                         |
| Python SDK `base_url` and REST API base | `<workspace-url>/api/2.0/omnigent`        |
| Browser UI                              | `<workspace-url>/omnigent`                |
| Saved session                           | `<workspace-url>/omnigent/c/<session-id>` |

The Python SDK expects the full API base; it does not convert a workspace URL for you.

If your workspace URL includes `?o=<workspace-id>`, preserve that selector when using `omni login` and `--server`. For the raw API examples, use the HTTPS origin as `DATABRICKS_HOST` and also set:

```bash
export OMNIGENT_WORKSPACE_ID="<workspace-id>"
```

With a current Databricks CLI, sign in to that specific workspace by including the selector in the login URL:

```bash
databricks auth login --host "${DATABRICKS_HOST}/?o=${OMNIGENT_WORKSPACE_ID}" \
  --profile "$DATABRICKS_CONFIG_PROFILE"
```

Keep `DATABRICKS_HOST` as the HTTPS origin. The examples send the selector as `X-Databricks-Org-Id` on API requests and include `?o=` in browser links.

## Run a task with the CLI

From your project directory, run a [custom agent configuration](https://omnigent.ai/docs/use/custom-agents) with a prompt. Replace `./my-agent/` with your agent directory or YAML file:

```bash
omni run ./my-agent/ --server "<workspace-url>" \
  -p "Review the latest commit. Summarize the changes and missing tests without modifying files."
```

The CLI prints the session URL to stderr and the collected assistant response to stdout. Open the URL to inspect the conversation. Tools execute on the machine running this command, and that machine must have the agent's harness and model credentials configured.

To continue the same conversation, use the ID from its URL:

```bash
omni run ./my-agent/ --server "<workspace-url>" \
  --resume "<session-id>" -p "Explain your highest-priority finding."
```

For automation that handles several sessions, save each session ID and use `--resume` explicitly.

## Create a session and wait for a result with Python

This example selects a connected host, creates a session, waits for its runner to come online, sends a task, and polls for the saved reply and tool output. It also prints the workspace session URL so you can review tool output or answer approval prompts.

Use Python 3.12 or later. In a new directory, create an environment and install the clients:

```bash
uv venv --python 3.12
uv pip install "omnigent-client==0.16.0" databricks-sdk httpx
```

The example uses the Omnigent 0.16.0 client API. Managed server updates can change client compatibility; use a client version supported by your deployment.

Save this as `omnigent_task.py`:

```python
import asyncio
import json
import os
from urllib.parse import urlencode

import httpx
from databricks.sdk.core import Config
from omnigent.cli_auth import OMNIGENT_SLICE_KEY_HEADER, databricks_request_headers
from omnigent_client import OmnigentClient


class WorkspaceAuth(httpx.Auth):
    requires_request_body = True

    def __init__(self, config, api_base, workspace_id, host_id):
        self.config = config
        self.api_base = api_base
        self.workspace_id = workspace_id
        self.host_id = host_id
        self.unkeyed_hosts = set()

    async def async_auth_flow(self, request):
        headers = await asyncio.to_thread(self.config.authenticate)
        request.headers.update(headers)
        request.headers.update(databricks_request_headers(
            self.api_base, org_id=self.workspace_id, host_id=self.host_id
        ))
        if self.host_id is None or self.host_id in self.unkeyed_hosts:
            request.headers.pop(OMNIGENT_SLICE_KEY_HEADER, None)
        response = yield request
        if response.status_code == 400 and OMNIGENT_SLICE_KEY_HEADER in request.headers:
            await response.aread()
            try:
                error_code = response.json().get("error", {}).get("code")
            except ValueError:
                return
            if error_code == "wrong_replica":
                request.headers.pop(OMNIGENT_SLICE_KEY_HEADER, None)
                response = yield request
                if response.is_success:
                    self.unkeyed_hosts.add(self.host_id)


async def main():
    config = Config(
        profile=os.environ["DATABRICKS_CONFIG_PROFILE"],
        auth_type="databricks-cli",
    )
    origin = config.host.rstrip("/")
    api_base = f"{origin}/api/2.0/omnigent"
    workspace_id = os.environ.get("OMNIGENT_WORKSPACE_ID")
    host_id = os.environ.get("OMNIGENT_HOST_ID")
    auth = WorkspaceAuth(config, api_base, workspace_id, host_id)

    async with (
        httpx.AsyncClient(base_url=f"{api_base}/", auth=auth, timeout=30) as api,
        OmnigentClient(base_url=api_base, auth=auth) as client,
    ):
        use_sandbox = os.environ.get("OMNIGENT_HOST_TYPE") == "managed"
        if not host_id and not use_sandbox:
            response = await api.get("v1/hosts")
            response.raise_for_status()
            for host in response.json()["hosts"]:
                print(host["host_id"], host["name"], host["status"])
            print("Choose a host, set OMNIGENT_HOST_ID and OMNIGENT_PROJECT_DIR, then rerun.")
            return
        if host_id and use_sandbox:
            raise ValueError("Choose a connected host or a Sandbox.")

        agent = await client.sessions.resolve_agent(
            os.environ.get("OMNIGENT_AGENT", "claude-native-ui")
        )
        body = {"agent_id": agent.id, "title": "Programmatic first task"}
        if use_sandbox:
            body["host_type"] = "managed"
        else:
            body.update(host_id=host_id, workspace=os.environ["OMNIGENT_PROJECT_DIR"])
        response = await api.post("v1/sessions", json=body)
        response.raise_for_status()
        session_id = response.json()["id"]
        session_url = f"{origin}/omnigent/c/{session_id}"
        if workspace_id:
            session_url += "?" + urlencode({"o": workspace_id})
        print(f"Session: {session_id}\n{session_url}", flush=True)

        print("Waiting up to 3 minutes for the runner to start...", flush=True)
        async with asyncio.timeout(180):
            while True:
                response = await api.get(f"v1/sessions/{session_id}")
                response.raise_for_status()
                snapshot = response.json()
                if snapshot.get("host_id"):
                    auth.host_id = snapshot["host_id"]
                if snapshot["status"] == "failed" or snapshot.get("last_task_error"):
                    raise RuntimeError(f"Session startup failed. Inspect {session_url}")
                if snapshot.get("runner_online") is True:
                    break
                await asyncio.sleep(2)

        prompt = (
            "Run Python to calculate the sum of integers from 1 through 10. "
            "Print OMNIGENT_READY: 55 and show the command output. "
            "Do not modify files."
        )
        await client.sessions.post_event(session_id, {
            "type": "message",
            "data": {
                "role": "user",
                "content": [{"type": "input_text", "text": prompt}],
            },
        })

        # Acceptance of the message does not mean the task has finished.
        approval_notice_shown = False
        try:
            async with asyncio.timeout(600):
                while True:
                    response = await api.get(f"v1/sessions/{session_id}")
                    response.raise_for_status()
                    result = response.json()
                    if result["status"] == "failed" or result.get("last_task_error"):
                        raise RuntimeError(f"Task failed. Inspect {session_url}")
                    if result.get("pending_elicitations") and not approval_notice_shown:
                        print(f"Review the pending request in {session_url}", flush=True)
                        approval_notice_shown = True
                    items = result.get("items", [])
                    has_reply = any(
                        item.get("type") == "message"
                        and item.get("data", {}).get("role") == "assistant"
                        for item in items
                    )
                    has_tool_result = any(
                        item.get("type") == "function_call_output"
                        and item.get("status") == "completed"
                        and "OMNIGENT_READY: 55" in str(item.get("data", {}).get("output", ""))
                        for item in items
                    )
                    if result["status"] == "idle" and has_reply and has_tool_result:
                        break
                    await asyncio.sleep(2)
        except TimeoutError:
            raise RuntimeError(
                f"Timed out waiting for the saved result. Inspect {session_url} "
                "before retrying; the agent may still be running."
            ) from None
        print(json.dumps(items, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
```

Run it once to list your hosts:

```bash
uv run python omnigent_task.py
```

Choose an **online** host that supports your agent. Set its exact ID and the absolute project directory on that host, then rerun:

```bash
export OMNIGENT_HOST_ID="<host-id-from-the-list>"
export OMNIGENT_PROJECT_DIR="/absolute/path/on/that/host"
uv run python omnigent_task.py
```

The default agent is native Claude Code (`claude-native-ui`). Set `OMNIGENT_AGENT` to another registered agent name to use it; the selected host must support its harness and have its model credentials configured. If the name is unavailable, the SDK reports the registered names it found.

The authentication adapter also uses Omnigent's `databricks_request_headers` helper to route requests to the selected host. It handles the server's `wrong_replica` response with a single retry using default routing, matching the browser client's behavior for hosts that require it. Other API errors propagate to the caller.

To use Databricks Sandbox instead, unset the connected host and select the managed host type:

```bash
unset OMNIGENT_HOST_ID
export OMNIGENT_HOST_TYPE="managed"
uv run python omnigent_task.py
```

The server chooses the Sandbox host and directory. Do not pass a local directory for this creation mode. The sample task needs no repository; clone or upload your project into the Sandbox before sending repository-specific work.

The script waits up to three minutes for the runner and ten minutes for the task. Open the printed URL if the agent needs approval or input. It prints the saved conversation only after the session is idle and its history contains both an assistant reply and a completed tool result containing `OMNIGENT_READY: 55`. For your own tasks, replace this output check with one that verifies the result you need.

This polling example assumes one task in a new session with one writer. Saved history can lag behind execution, so an idle status alone is not enough to declare success. For shared or reused sessions, coordinate writers and identify the new items belonging to your task. A timeout or network error does not cancel the task: inspect the existing session before retrying, since creating another session or sending the same task again can duplicate work.

### Continue or stop the work

Save the session ID printed by the script. You can reopen its URL to continue the conversation in the workspace UI. To inspect it from Python, use an authenticated `client` as above and route requests with the session's host ID:

```python
session = await client.sessions.get("<session-id>")
print(session.status)
print(json.dumps(session.items, indent=2))
```

Send another task with `client.sessions.post_event` using the same message structure as the example. Confirm the host is online and no other turn is active first. When waiting for the follow-up, check newly added history; the first task's reply and output are already present.

To request an interruption of active work:

```python
await client.sessions.interrupt("<session-id>")
```

An interrupt requests that the current turn stop; verify the resulting session status. It retains the session history and does not shut down a connected host. You can also continue or interrupt from the workspace UI.

## Call the REST API

REST requests use the same workspace authentication and API base. With the OAuth profile above, obtain a token for a short shell session. This example requires `jq`:

```bash
export OMNIGENT_API_BASE="${DATABRICKS_HOST%/}/api/2.0/omnigent"
ACCESS_TOKEN="$(databricks auth token --profile "$DATABRICKS_CONFIG_PROFILE" | jq -er '.access_token')"
curl_headers=(-H "Authorization: Bearer $ACCESS_TOKEN")
if [ -n "${OMNIGENT_WORKSPACE_ID:-}" ]; then
  curl_headers+=(-H "X-Databricks-Org-Id: $OMNIGENT_WORKSPACE_ID")
fi
curl --fail-with-body "${curl_headers[@]}" "$OMNIGENT_API_BASE/v1/agents" | jq
```

Keep the token out of source files and logs. This shell variable is a snapshot of an expiring token; acquire another when needed. Use the refreshable authentication pattern above for longer-running applications.

| Action                            | Method and path, relative to the API base                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Find registered agents            | `GET /v1/agents`                                                                               |
| Find your connected hosts         | `GET /v1/hosts`                                                                                |
| Create a session on a chosen host | `POST /v1/sessions` with `agent_id`, `host_id`, `workspace`, and an optional `title`           |
| Create a Sandbox session          | `POST /v1/sessions` with `agent_id` and `host_type: "managed"`; omit `host_id` and `workspace` |
| Send a task                       | `POST /v1/sessions/{id}/events`                                                                |
| Follow execution                  | `GET /v1/sessions/{id}/stream` (server-sent events)                                            |
| Read current state and history    | `GET /v1/sessions/{id}` and `GET /v1/sessions/{id}/items`                                      |
| Interrupt active work             | `POST /v1/sessions/{id}/events` with `{"type":"interrupt","data":{}}`                          |

Session requests also need host routing, as handled by the Python authentication adapter above. For live event streaming, subscribe before posting a message; the stream does not replay past events. Reconcile a dropped connection with the session snapshot and history. See the [open-source programmatic guide](https://omnigent.ai/docs/programmatic) for message payloads, pagination, and additional session operations, using the Databricks authentication and URL conventions above.

## Databricks-specific behavior

- **Access follows your workspace identity.** Use a host owned by the signed-in user and a session that identity can access. Session sharing follows the managed [Read and Edit permissions](https://docs.databricks.com/aws/en/omnigent/identity-access).
- **Model access follows the execution host.** Sandbox uses Unity Gateway; connected hosts use their configured credentials. Workspace API authentication and model-provider authentication are separate.
- **Network requirements apply to scripts too.** The caller must meet your workspace's network access requirements, and the host needs access to the repository and services used by the agent.
- **Policies still apply.** A programmatic request does not bypass approval prompts or managed limitations. Open the printed session URL to respond to a request for input.
- **Built-in recurring schedules are unavailable in the managed deployment.** The open-source guide's scheduled-task API and tools are not part of this workflow.

## Where to next

- [Omnigent quickstart](/docs/omnigent/quickstart) for connecting hosts and configuring model access.
- [Identity and access](https://docs.databricks.com/aws/en/omnigent/identity-access) for workspace sign-in and session sharing.
- [Open-source programmatic guide](https://omnigent.ai/docs/programmatic) for more CLI and API operations.
