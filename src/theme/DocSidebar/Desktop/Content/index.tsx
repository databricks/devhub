import { useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { ThemeClassNames } from "@docusaurus/theme-common";
import {
	useAnnouncementBar,
	useScrollPosition,
} from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import useIsBrowser from "@docusaurus/useIsBrowser";
import DocSidebarItems from "@theme/DocSidebarItems";
import type { Props } from "@theme/DocSidebar/Desktop/Content";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

function useShowAnnouncementBar() {
	const { isActive } = useAnnouncementBar();
	const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive);
	useScrollPosition(
		({ scrollY }) => {
			if (isActive) {
				setShowAnnouncementBar(scrollY === 0);
			}
		},
		[isActive],
	);
	return isActive && showAnnouncementBar;
}

type SidebarLikeItem = {
	type?: string;
	label?: string;
	href?: string;
	items?: SidebarLikeItem[];
};

type AppKitChannelOption = {
	label: string;
	href: string;
};

function normalizePath(value: string): string {
	return value.replace(/\/+$/, "");
}

function isSidebarCategory(item: SidebarLikeItem): item is SidebarLikeItem & {
	items: SidebarLikeItem[];
} {
	return item.type === "category" && Array.isArray(item.items);
}

function findCategoryByLabel(
	items: SidebarLikeItem[],
	label: string,
): SidebarLikeItem | null {
	return (
		items.find(
			(item) =>
				isSidebarCategory(item) &&
				item.label?.toLocaleLowerCase() === label.toLocaleLowerCase(),
		) ?? null
	);
}

function isAppKitDocsPath(path: string): boolean {
	const normalizedPath = normalizePath(path);
	return normalizedPath.startsWith("/docs/appkit/");
}

function getAppKitSidebarItems(sidebar: SidebarLikeItem[]): SidebarLikeItem[] {
	const referencesCategory = findCategoryByLabel(sidebar, "reference");
	if (!referencesCategory || !isSidebarCategory(referencesCategory)) {
		return [];
	}

	const appKitCategory = findCategoryByLabel(
		referencesCategory.items,
		"appkit",
	);
	if (!appKitCategory || !isSidebarCategory(appKitCategory)) {
		return [];
	}

	return appKitCategory.items;
}

function extractChannel(href: string): string | null {
	const match = href.match(/^\/docs\/appkit\/([^/]+)/);
	return match ? match[1] : null;
}

function getAppKitChannelOptions(
	items: SidebarLikeItem[],
): AppKitChannelOption[] {
	const channels = new Map<string, AppKitChannelOption>();

	function collect(list: SidebarLikeItem[]) {
		for (const item of list) {
			if (item.href) {
				const channel = extractChannel(item.href);
				if (channel && !channels.has(channel)) {
					channels.set(channel, {
						label: channel,
						href: `/docs/appkit/${channel}`,
					});
				}
			}
			if (isSidebarCategory(item)) {
				collect(item.items);
			}
		}
	}

	collect(items);
	return Array.from(channels.values());
}

function getActiveChannelHref(
	path: string,
	channels: AppKitChannelOption[],
): string {
	const normalizedPath = normalizePath(path);

	return (
		channels.find((channel) => normalizedPath.startsWith(channel.href))?.href ??
		channels[0]?.href ??
		""
	);
}

export default function DocSidebarDesktopContent({
	path,
	sidebar,
	className,
}: Props): ReactNode {
	const showAnnouncementBar = useShowAnnouncementBar();
	const isBrowser = useIsBrowser();

	const appKitSidebarItems = useMemo(
		() => getAppKitSidebarItems(sidebar as SidebarLikeItem[]),
		[sidebar],
	);
	const appKitChannels = useMemo(
		() => getAppKitChannelOptions(appKitSidebarItems),
		[appKitSidebarItems],
	);
	const showAppKitReferenceShell =
		isAppKitDocsPath(path) && appKitSidebarItems.length > 0;
	const activeChannelHref = getActiveChannelHref(path, appKitChannels);

	return (
		<nav
			aria-label={translate({
				id: "theme.docs.sidebar.navAriaLabel",
				message: "Docs sidebar",
				description: "The ARIA label for the sidebar navigation",
			})}
			className={clsx(
				"menu thin-scrollbar",
				"grow overflow-y-auto border-r border-border px-3 pt-4 pb-6 [scrollbar-gutter:stable]",
				showAnnouncementBar && "mb-[var(--docusaurus-announcement-bar-height)]",
				className,
			)}
		>
			<ul
				className={clsx(
					ThemeClassNames.docs.docSidebarMenu,
					"menu__list space-y-1",
				)}
			>
				{showAppKitReferenceShell ? (
					<>
						<li className="menu__list-item mb-3 border-b border-border pb-3">
							<p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
								AppKit Reference
							</p>
							<div className="mt-2 flex flex-col gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="justify-start px-2"
									asChild
								>
									<Link to="/docs/start-here">
										<ChevronLeft className="size-4" />
										Back to main docs
									</Link>
								</Button>
								{appKitChannels.length > 0 ? (
									<div className="px-2">
										<p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
											Version
										</p>
										<Select
											value={activeChannelHref}
											onValueChange={(nextHref) => {
												if (!isBrowser || !nextHref) {
													return;
												}

												if (normalizePath(nextHref) !== normalizePath(path)) {
													window.location.assign(nextHref);
												}
											}}
										>
											<SelectTrigger className="h-8 w-full text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{appKitChannels.map((channel) => (
													<SelectItem key={channel.href} value={channel.href}>
														{channel.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								) : null}
							</div>
						</li>
						<DocSidebarItems
							items={appKitSidebarItems as Props["sidebar"]}
							activePath={path}
							level={1}
						/>
					</>
				) : (
					<DocSidebarItems items={sidebar} activePath={path} level={1} />
				)}
			</ul>
		</nav>
	);
}
