## Volume File Manager

Add file upload, browsing, download, delete, file type validation, and CSV row preview to your Databricks app using Unity Catalog Volumes. The `files` plugin registers all file management HTTP routes automatically. No custom server routes needed.

### 1. Create a Unity Catalog Volume

Create a managed Volume to store uploaded files:

```bash
databricks volumes create <catalog> <schema> <volume-name> MANAGED \
  --profile <PROFILE>
```

Note the full Volume path: `/Volumes/<catalog>/<schema>/<volume-name>`.

### 2. New app: scaffold with the Files feature

```bash
databricks apps init \
  --name <app-name> \
  --version latest \
  --features=files \
  --set 'files.files.path=/Volumes/<catalog>/<schema>/<volume-name>' \
  --run none --profile <PROFILE>
```

The CLI maps `files.files.path` to `DATABRICKS_VOLUME_FILES` and configures a volume named `files`. It also scaffolds `client/src/pages/files/FilesPage.tsx` and wires the route in `App.tsx` automatically. No manual page creation needed.

After init, install dependencies:

```bash
cd <app-name>
npm install
```

Skip to step 5.

### 3. Existing app: add Files manually

Apply the following changes to an existing scaffolded AppKit app.

#### Add `files` to server plugins

In `server/server.ts`, add `files` to the import and plugins array:

```typescript
import { createApp, server, files } from "@databricks/appkit";

createApp({
  plugins: [server(), files()],
}).catch(console.error);
```

The `files()` plugin auto-discovers all `DATABRICKS_VOLUME_*` environment variables and registers each as a named volume. The env var suffix (lowercased) becomes the volume key used in all API routes: `DATABRICKS_VOLUME_FILES` → volume key `files`.

To limit upload size, pass a config:

```typescript
files({
  volumes: {
    files: { maxUploadSize: 100_000_000 }, // 100 MB
  },
});
```

#### Add environment variable

Add to `.env` for local development:

```bash
DATABRICKS_VOLUME_FILES=/Volumes/<catalog>/<schema>/<volume-name>
```

#### Update `databricks.yml`

Add the volume variables, resource, and target values. The resource uses `uc_securable`. Note that `securable_full_name` is the Unity Catalog three-part name (`<catalog>.<schema>.<volume-name>`), not the `/Volumes/...` path. `user_api_scopes` is required for on-behalf-of (OBO) token access to work in production.

```yaml
variables:
  files_path:
    description: Volume path for file storage (e.g. /Volumes/catalog/schema/volume_name)
  files_id:
    description: Unity Catalog Volume securable full name (e.g. catalog.schema.volume_name)

resources:
  apps:
    app:
      # Add under existing app config
      user_api_scopes:
        - files.files
      resources:
        - name: files
          uc_securable:
            securable_full_name: ${var.files_id}
            securable_type: VOLUME
            permission: WRITE_VOLUME

targets:
  default:
    variables:
      files_path: /Volumes/<catalog>/<schema>/<volume-name>
      files_id: <catalog>.<schema>.<volume-name>
```

#### Update `app.yaml`

Expose the volume path to the running app:

```yaml
command: ["npm", "run", "start"]
env:
  - name: DATABRICKS_VOLUME_FILES
    valueFrom: files
```

### 4. Create the file manager page

The `files` plugin auto-registers HTTP routes at `/api/files/files/...` for the volume key `files`:

| Method   | Path                                    | Description                    |
| -------- | --------------------------------------- | ------------------------------ |
| `GET`    | `/api/files/files/list?path=<dir>`      | List directory entries         |
| `GET`    | `/api/files/files/preview?path=<file>`  | File metadata + text preview   |
| `GET`    | `/api/files/files/download?path=<file>` | Download (attachment)          |
| `GET`    | `/api/files/files/raw?path=<file>`      | Serve inline (safe types only) |
| `POST`   | `/api/files/files/upload?path=<file>`   | Upload raw body                |
| `DELETE` | `/api/files/files?path=<file>`          | Delete file                    |

#### Create `client/src/pages/files/FilesPage.tsx`

File browser with upload, folder creation, download, delete, and file preview. Uses `AbortController` to cancel stale list and preview requests. Entries are sorted directories-first, then alphabetically. `resolveEntryPath` constructs the full path from `currentPath + entry.name`. Do not use `entry.path` directly, as it may not be set by the API.

```tsx
import type { DirectoryEntry, FilePreview } from "@databricks/appkit-ui/react";
import {
  Button,
  DirectoryList,
  FileBreadcrumb,
  FilePreviewPanel,
  NewFolderInput,
} from "@databricks/appkit-ui/react";
import { FolderPlus, Loader2, Upload } from "lucide-react";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function useAbortController(): RefObject<AbortController | null> {
  const ref = useRef<AbortController | null>(null);
  return ref;
}

function nextSignal(ref: RefObject<AbortController | null>): AbortSignal {
  ref.current?.abort();
  ref.current = new AbortController();
  return ref.current.signal;
}

export function FilesPage() {
  const [volumes, setVolumes] = useState<string[]>([]);
  const [volumeKey, setVolumeKey] = useState<string>(
    () => localStorage.getItem("appkit:files:volumeKey") ?? "",
  );
  const [currentPath, setCurrentPath] = useState<string>("");
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingDir, setCreatingDir] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [showNewDirInput, setShowNewDirInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listAbort = useAbortController();
  const previewAbort = useAbortController();

  const normalize = (p: string) => p.replace(/\/+$/, "");
  const isAtRoot = !currentPath;

  const apiUrl = useCallback(
    (action: string, params?: Record<string, string>) => {
      const base = `/api/files/${volumeKey}/${action}`;
      if (!params) return base;
      const qs = new URLSearchParams(params).toString();
      return `${base}?${qs}`;
    },
    [volumeKey],
  );

  const loadDirectory = useCallback(
    async (path?: string) => {
      if (!volumeKey) return;
      setLoading(true);
      setError(null);
      setSelectedFile(null);
      setPreview(null);

      try {
        const signal = nextSignal(listAbort);
        const url = path ? apiUrl("list", { path }) : apiUrl("list");
        const response = await fetch(url, { signal });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error ?? `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        const data: DirectoryEntry[] = await response.json();
        data.sort((a, b) => {
          if (a.is_directory && !b.is_directory) return -1;
          if (!a.is_directory && b.is_directory) return 1;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
        setEntries(data);
        setCurrentPath(path ?? "");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : String(err));
        setEntries([]);
      } finally {
        setLoading(false);
      }
    },
    [volumeKey, apiUrl, listAbort],
  );

  const loadPreview = useCallback(
    async (filePath: string) => {
      setPreviewLoading(true);
      setPreview(null);

      try {
        const signal = nextSignal(previewAbort);
        const response = await fetch(apiUrl("preview", { path: filePath }), {
          signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${response.status}`);
        }

        const data = await response.json();
        setPreview(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    },
    [apiUrl, previewAbort],
  );

  useEffect(() => {
    fetch("/api/files/volumes")
      .then((res) => res.json())
      .then((data: { volumes: string[] }) => {
        const list = data.volumes ?? [];
        setVolumes(list);
        if (!volumeKey || !list.includes(volumeKey)) {
          const first = list[0];
          if (first) {
            setVolumeKey(first);
            localStorage.setItem("appkit:files:volumeKey", first);
          }
        }
      })
      .catch(() => {});
  }, [volumeKey]);

  useEffect(() => {
    if (volumeKey) {
      loadDirectory();
    }
  }, [volumeKey, loadDirectory]);

  const resolveEntryPath = (entry: DirectoryEntry) => {
    const name = entry.name ?? "";
    return currentPath ? `${currentPath}/${name}` : name;
  };

  const handleEntryClick = (entry: DirectoryEntry) => {
    const entryPath = resolveEntryPath(entry);
    if (entry.is_directory) {
      loadDirectory(entryPath);
    } else {
      setSelectedFile(entryPath);
      loadPreview(entryPath);
    }
  };

  const navigateToParent = () => {
    if (isAtRoot) return;
    const segments = currentPath.split("/").filter(Boolean);
    segments.pop();
    const parentPath = segments.join("/");
    loadDirectory(parentPath || undefined);
  };

  const allSegments = normalize(currentPath).split("/").filter(Boolean);

  const navigateToBreadcrumb = (index: number) => {
    const targetPath = allSegments.slice(0, index + 1).join("/");
    loadDirectory(targetPath);
  };

  const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE) {
      setError(
        `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum upload size is ${MAX_UPLOAD_SIZE / 1024 / 1024 / 1024} GB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadPath = currentPath
        ? `${currentPath}/${file.name}`
        : file.name;
      const response = await fetch(apiUrl("upload", { path: uploadPath }), {
        method: "POST",
        body: file,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Upload failed (${response.status})`);
      }

      await loadDirectory(currentPath || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    const fileName = selectedFile.split("/").pop();
    if (!window.confirm(`Delete "${fileName}"?`)) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/files/${volumeKey}?path=${encodeURIComponent(selectedFile)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Delete failed (${response.status})`);
      }

      setSelectedFile(null);
      setPreview(null);
      await loadDirectory(currentPath || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateDirectory = async () => {
    const name = newDirName.trim();
    if (!name) return;

    setCreatingDir(true);
    try {
      const dirPath = currentPath ? `${currentPath}/${name}` : name;
      const response = await fetch(apiUrl("mkdir"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: dirPath }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ?? `Create directory failed (${response.status})`,
        );
      }

      setShowNewDirInput(false);
      setNewDirName("");
      await loadDirectory(currentPath || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreatingDir(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Files</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and manage files in Databricks Volumes.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {volumes.length > 1 && (
            <select
              value={volumeKey}
              onChange={(e) => {
                const v = e.target.value;
                setVolumeKey(v);
                localStorage.setItem("appkit:files:volumeKey", v);
                setCurrentPath("");
                setEntries([]);
                setSelectedFile(null);
                setPreview(null);
              }}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              {volumes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
          <FileBreadcrumb
            rootLabel={volumeKey || "Root"}
            segments={allSegments}
            onNavigateToRoot={() => loadDirectory()}
            onNavigateToSegment={navigateToBreadcrumb}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewDirInput(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <DirectoryList
          className="flex-2 min-w-0"
          entries={entries}
          loading={loading}
          error={error}
          onEntryClick={handleEntryClick}
          onNavigateToParent={navigateToParent}
          onRetry={() => loadDirectory(currentPath || undefined)}
          isAtRoot={isAtRoot}
          selectedPath={selectedFile}
          resolveEntryPath={resolveEntryPath}
          hasCurrentPath={!!currentPath}
          headerContent={
            showNewDirInput ? (
              <NewFolderInput
                value={newDirName}
                onChange={setNewDirName}
                onCreate={handleCreateDirectory}
                onCancel={() => {
                  setShowNewDirInput(false);
                  setNewDirName("");
                }}
                creating={creatingDir}
              />
            ) : undefined
          }
        />

        <FilePreviewPanel
          className="flex-1 min-w-0"
          selectedFile={selectedFile}
          preview={preview}
          previewLoading={previewLoading}
          onDownload={(path) =>
            window.open(apiUrl("download", { path }), "_blank")
          }
          onDelete={handleDelete}
          deleting={deleting}
          imagePreviewSrc={(p) => apiUrl("raw", { path: p })}
        />
      </div>
    </div>
  );
}
```

#### Update `client/src/App.tsx`

Add the import, nav link, and route:

```tsx
// Add import at top
import { FilesPage } from './pages/files/FilesPage';

// Add nav link inside the <nav> element
<NavLink to="/files" className={navLinkClass}>
  Files
</NavLink>

// Add route in the router children array
{ path: '/files', element: <FilesPage /> },
```

### 5. Deploy and test

Validate before deploying to catch type errors and run smoke tests:

```bash
databricks apps validate --profile <PROFILE>
databricks apps deploy --profile <PROFILE>
```

Open the app URL while signed in to Databricks, navigate to the Files page, and verify:

1. Upload a `.csv` file. It appears in the directory list.
2. Click the file. The preview panel shows metadata and the CSV row table renders below it.
3. Upload a file with a disallowed extension. The error message appears without uploading.
4. Download and delete a file. The list refreshes correctly.

Check status and logs if the app does not start:

```bash
databricks apps get <app-name> --profile <PROFILE>
databricks apps logs <app-name> --profile <PROFILE>
```

#### References

- [Files plugin docs](https://databricks.github.io/appkit/docs/plugins/files)
- [Unity Catalog Volumes](https://docs.databricks.com/en/connect/unity-catalog/volumes.html)
- [DirectoryList component](https://databricks.github.io/appkit/docs/api/appkit-ui/files/DirectoryList)
- [FilePreviewPanel component](https://databricks.github.io/appkit/docs/api/appkit-ui/files/FilePreviewPanel)
