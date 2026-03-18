import Link from "@docusaurus/Link";
import useIsBrowser from "@docusaurus/useIsBrowser";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type AppKitChannel = {
  id: string;
  label: string;
  docsPath: string;
  apiPath: string;
  note?: string;
};

type AppKitVersionPickerProps = {
  channels: AppKitChannel[];
};

function normalizePath(value: string): string {
  return value.replace(/\/+$/, "");
}

function getActiveChannel(
  channels: AppKitChannel[],
  pathname: string | null,
): AppKitChannel | null {
  if (!pathname) {
    return channels[0] ?? null;
  }

  const normalizedPathname = normalizePath(pathname);
  return (
    channels.find((channel) =>
      normalizedPathname.startsWith(normalizePath(channel.docsPath)),
    ) ??
    channels.find((channel) =>
      normalizedPathname.startsWith(normalizePath(channel.apiPath)),
    ) ??
    channels[0] ??
    null
  );
}

export function AppKitVersionPicker({
  channels,
}: AppKitVersionPickerProps): ReactNode {
  const isBrowser = useIsBrowser();
  const activeChannel = useMemo(
    () =>
      getActiveChannel(channels, isBrowser ? window.location.pathname : null),
    [channels, isBrowser],
  );
  const [selectedChannelId, setSelectedChannelId] = useState(
    activeChannel?.id ?? channels[0]?.id ?? "",
  );

  useEffect(() => {
    if (activeChannel) {
      setSelectedChannelId(activeChannel.id);
    }
  }, [activeChannel]);

  if (channels.length === 0) {
    return null;
  }

  const selectedChannel =
    channels.find((channel) => channel.id === selectedChannelId) ??
    activeChannel ??
    channels[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>AppKit docs versions</CardTitle>
          <Badge variant="secondary">Synced</Badge>
        </div>
        <CardDescription>
          Pick a channel, then jump to the docs entry point or API reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Version channel
          </p>
          <Select
            value={selectedChannel.id}
            onValueChange={(nextValue) => setSelectedChannelId(nextValue)}
          >
            <SelectTrigger className="w-full sm:max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedChannel.note ? (
            <p className="m-0 text-sm text-muted-foreground">
              {selectedChannel.note}
            </p>
          ) : null}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" asChild>
            <Link to={selectedChannel.docsPath}>Open channel docs</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={selectedChannel.apiPath}>Open API section</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
