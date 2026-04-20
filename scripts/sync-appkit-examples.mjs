// Downloads the latest appkit-ui example files from databricks/appkit (main branch)
// into src/components/doc-examples, rewriting their @databricks/appkit-ui/react
// imports to our local @/components/ui/* modules, and builds a typed registry
// with { Component, source } pairs. The `source` field preserves the upstream
// user-facing code so docs display the API surface users will actually use.
//
// Usage: node scripts/sync-appkit-examples.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const OUT_DIR = path.join(repoRoot, "src", "components", "doc-examples");

// Map exported symbol -> UI module file (relative to @/components/ui) or other alias.
// "cn" is special: imported from @/lib/utils.
const UI_SYMBOL_MAP = {
  // accordion
  Accordion: "accordion",
  AccordionItem: "accordion",
  AccordionTrigger: "accordion",
  AccordionContent: "accordion",
  // alert-dialog
  AlertDialog: "alert-dialog",
  AlertDialogAction: "alert-dialog",
  AlertDialogCancel: "alert-dialog",
  AlertDialogContent: "alert-dialog",
  AlertDialogDescription: "alert-dialog",
  AlertDialogFooter: "alert-dialog",
  AlertDialogHeader: "alert-dialog",
  AlertDialogOverlay: "alert-dialog",
  AlertDialogPortal: "alert-dialog",
  AlertDialogTitle: "alert-dialog",
  AlertDialogTrigger: "alert-dialog",
  // alert
  Alert: "alert",
  AlertTitle: "alert",
  AlertDescription: "alert",
  // aspect-ratio
  AspectRatio: "aspect-ratio",
  // avatar
  Avatar: "avatar",
  AvatarImage: "avatar",
  AvatarFallback: "avatar",
  // badge
  Badge: "badge",
  badgeVariants: "badge",
  // breadcrumb
  Breadcrumb: "breadcrumb",
  BreadcrumbEllipsis: "breadcrumb",
  BreadcrumbItem: "breadcrumb",
  BreadcrumbLink: "breadcrumb",
  BreadcrumbList: "breadcrumb",
  BreadcrumbPage: "breadcrumb",
  BreadcrumbSeparator: "breadcrumb",
  // button
  Button: "button",
  buttonVariants: "button",
  // calendar
  Calendar: "calendar",
  CalendarDayButton: "calendar",
  // card
  Card: "card",
  CardAction: "card",
  CardContent: "card",
  CardDescription: "card",
  CardFooter: "card",
  CardHeader: "card",
  CardTitle: "card",
  // carousel
  Carousel: "carousel",
  CarouselContent: "carousel",
  CarouselItem: "carousel",
  CarouselNext: "carousel",
  CarouselPrevious: "carousel",
  // checkbox
  Checkbox: "checkbox",
  // collapsible
  Collapsible: "collapsible",
  CollapsibleContent: "collapsible",
  CollapsibleTrigger: "collapsible",
  // command
  Command: "command",
  CommandDialog: "command",
  CommandEmpty: "command",
  CommandGroup: "command",
  CommandInput: "command",
  CommandItem: "command",
  CommandList: "command",
  CommandSeparator: "command",
  CommandShortcut: "command",
  // context-menu
  ContextMenu: "context-menu",
  ContextMenuCheckboxItem: "context-menu",
  ContextMenuContent: "context-menu",
  ContextMenuGroup: "context-menu",
  ContextMenuItem: "context-menu",
  ContextMenuLabel: "context-menu",
  ContextMenuPortal: "context-menu",
  ContextMenuRadioGroup: "context-menu",
  ContextMenuRadioItem: "context-menu",
  ContextMenuSeparator: "context-menu",
  ContextMenuShortcut: "context-menu",
  ContextMenuSub: "context-menu",
  ContextMenuSubContent: "context-menu",
  ContextMenuSubTrigger: "context-menu",
  ContextMenuTrigger: "context-menu",
  // dialog
  Dialog: "dialog",
  DialogClose: "dialog",
  DialogContent: "dialog",
  DialogDescription: "dialog",
  DialogFooter: "dialog",
  DialogHeader: "dialog",
  DialogOverlay: "dialog",
  DialogPortal: "dialog",
  DialogTitle: "dialog",
  DialogTrigger: "dialog",
  // drawer
  Drawer: "drawer",
  DrawerClose: "drawer",
  DrawerContent: "drawer",
  DrawerDescription: "drawer",
  DrawerFooter: "drawer",
  DrawerHeader: "drawer",
  DrawerOverlay: "drawer",
  DrawerPortal: "drawer",
  DrawerTitle: "drawer",
  DrawerTrigger: "drawer",
  // dropdown-menu
  DropdownMenu: "dropdown-menu",
  DropdownMenuCheckboxItem: "dropdown-menu",
  DropdownMenuContent: "dropdown-menu",
  DropdownMenuGroup: "dropdown-menu",
  DropdownMenuItem: "dropdown-menu",
  DropdownMenuLabel: "dropdown-menu",
  DropdownMenuPortal: "dropdown-menu",
  DropdownMenuRadioGroup: "dropdown-menu",
  DropdownMenuRadioItem: "dropdown-menu",
  DropdownMenuSeparator: "dropdown-menu",
  DropdownMenuShortcut: "dropdown-menu",
  DropdownMenuSub: "dropdown-menu",
  DropdownMenuSubContent: "dropdown-menu",
  DropdownMenuSubTrigger: "dropdown-menu",
  DropdownMenuTrigger: "dropdown-menu",
  // empty
  Empty: "empty",
  EmptyContent: "empty",
  EmptyDescription: "empty",
  EmptyHeader: "empty",
  EmptyMedia: "empty",
  EmptyTitle: "empty",
  // field
  Field: "field",
  FieldContent: "field",
  FieldDescription: "field",
  FieldError: "field",
  FieldGroup: "field",
  FieldLabel: "field",
  FieldLegend: "field",
  FieldSeparator: "field",
  FieldSet: "field",
  FieldTitle: "field",
  // hover-card
  HoverCard: "hover-card",
  HoverCardContent: "hover-card",
  HoverCardTrigger: "hover-card",
  // input
  Input: "input",
  // input-group
  InputGroup: "input-group",
  InputGroupAddon: "input-group",
  InputGroupButton: "input-group",
  InputGroupInput: "input-group",
  InputGroupText: "input-group",
  InputGroupTextarea: "input-group",
  // input-otp
  InputOTP: "input-otp",
  InputOTPGroup: "input-otp",
  InputOTPSeparator: "input-otp",
  InputOTPSlot: "input-otp",
  // item
  Item: "item",
  ItemActions: "item",
  ItemContent: "item",
  ItemDescription: "item",
  ItemFooter: "item",
  ItemGroup: "item",
  ItemHeader: "item",
  ItemMedia: "item",
  ItemSeparator: "item",
  ItemTitle: "item",
  // kbd
  Kbd: "kbd",
  KbdGroup: "kbd",
  // label
  Label: "label",
  // menubar
  Menubar: "menubar",
  MenubarCheckboxItem: "menubar",
  MenubarContent: "menubar",
  MenubarGroup: "menubar",
  MenubarItem: "menubar",
  MenubarLabel: "menubar",
  MenubarMenu: "menubar",
  MenubarPortal: "menubar",
  MenubarRadioGroup: "menubar",
  MenubarRadioItem: "menubar",
  MenubarSeparator: "menubar",
  MenubarShortcut: "menubar",
  MenubarSub: "menubar",
  MenubarSubContent: "menubar",
  MenubarSubTrigger: "menubar",
  MenubarTrigger: "menubar",
  // navigation-menu
  NavigationMenu: "navigation-menu",
  NavigationMenuContent: "navigation-menu",
  NavigationMenuIndicator: "navigation-menu",
  NavigationMenuItem: "navigation-menu",
  NavigationMenuLink: "navigation-menu",
  NavigationMenuList: "navigation-menu",
  NavigationMenuTrigger: "navigation-menu",
  NavigationMenuViewport: "navigation-menu",
  navigationMenuTriggerStyle: "navigation-menu",
  // pagination
  Pagination: "pagination",
  PaginationContent: "pagination",
  PaginationEllipsis: "pagination",
  PaginationItem: "pagination",
  PaginationLink: "pagination",
  PaginationNext: "pagination",
  PaginationPrevious: "pagination",
  // popover
  Popover: "popover",
  PopoverAnchor: "popover",
  PopoverContent: "popover",
  PopoverTrigger: "popover",
  // progress
  Progress: "progress",
  // radio-group
  RadioGroup: "radio-group",
  RadioGroupItem: "radio-group",
  // resizable
  ResizableHandle: "resizable",
  ResizablePanel: "resizable",
  ResizablePanelGroup: "resizable",
  // scroll-area
  ScrollArea: "scroll-area",
  ScrollBar: "scroll-area",
  // select
  Select: "select",
  SelectContent: "select",
  SelectGroup: "select",
  SelectItem: "select",
  SelectLabel: "select",
  SelectScrollDownButton: "select",
  SelectScrollUpButton: "select",
  SelectSeparator: "select",
  SelectTrigger: "select",
  SelectValue: "select",
  // separator
  Separator: "separator",
  // sheet
  Sheet: "sheet",
  SheetClose: "sheet",
  SheetContent: "sheet",
  SheetDescription: "sheet",
  SheetFooter: "sheet",
  SheetHeader: "sheet",
  SheetTitle: "sheet",
  SheetTrigger: "sheet",
  // sidebar
  Sidebar: "sidebar",
  SidebarContent: "sidebar",
  SidebarFooter: "sidebar",
  SidebarGroup: "sidebar",
  SidebarGroupAction: "sidebar",
  SidebarGroupContent: "sidebar",
  SidebarGroupLabel: "sidebar",
  SidebarHeader: "sidebar",
  SidebarInput: "sidebar",
  SidebarInset: "sidebar",
  SidebarMenu: "sidebar",
  SidebarMenuAction: "sidebar",
  SidebarMenuBadge: "sidebar",
  SidebarMenuButton: "sidebar",
  SidebarMenuItem: "sidebar",
  SidebarMenuSkeleton: "sidebar",
  SidebarMenuSub: "sidebar",
  SidebarMenuSubButton: "sidebar",
  SidebarMenuSubItem: "sidebar",
  SidebarProvider: "sidebar",
  SidebarRail: "sidebar",
  SidebarSeparator: "sidebar",
  SidebarTrigger: "sidebar",
  useSidebar: "sidebar",
  // skeleton
  Skeleton: "skeleton",
  // slider
  Slider: "slider",
  // sonner
  Toaster: "sonner",
  // switch
  Switch: "switch",
  // table
  Table: "table",
  TableBody: "table",
  TableCaption: "table",
  TableCell: "table",
  TableFooter: "table",
  TableHead: "table",
  TableHeader: "table",
  TableRow: "table",
  // tabs
  Tabs: "tabs",
  TabsContent: "tabs",
  TabsList: "tabs",
  TabsTrigger: "tabs",
  // textarea
  Textarea: "textarea",
  // toggle-group
  ToggleGroup: "toggle-group",
  ToggleGroupItem: "toggle-group",
  // toggle
  Toggle: "toggle",
  toggleVariants: "toggle",
  // tooltip
  Tooltip: "tooltip",
  TooltipContent: "tooltip",
  TooltipProvider: "tooltip",
  TooltipTrigger: "tooltip",
};

// We need to replace only blocks that import from "@databricks/appkit-ui/react".
function rewriteSource(src) {
  const importRe =
    /import\s*\{([^}]+)\}\s*from\s*["']@databricks\/appkit-ui\/react["'];?/g;
  return src.replace(importRe, (_m, inner) => {
    const symbols = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const byModule = new Map();
    const unknown = [];
    let hasCn = false;

    for (const sym of symbols) {
      if (sym === "cn") {
        hasCn = true;
        continue;
      }
      const mod = UI_SYMBOL_MAP[sym];
      if (!mod) {
        unknown.push(sym);
        continue;
      }
      if (!byModule.has(mod)) byModule.set(mod, []);
      byModule.get(mod).push(sym);
    }

    if (unknown.length > 0) {
      throw new Error(
        `Unknown symbols in appkit-ui import: ${unknown.join(", ")}`,
      );
    }

    const out = [];
    if (hasCn) out.push(`import { cn } from "@/lib/utils";`);
    const mods = [...byModule.keys()].sort();
    for (const mod of mods) {
      const syms = byModule.get(mod).sort().join(", ");
      out.push(`import { ${syms} } from "@/components/ui/${mod}";`);
    }
    return out.join("\n");
  });
}

function toPascal(name) {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function downloadTarball(url, outputFile) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }
  await pipeline(
    Readable.fromWeb(response.body),
    fs.createWriteStream(outputFile),
  );
}

async function fetchUpstreamExamples() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "devhub-appkit-examples-"),
  );
  const archive = path.join(tempDir, "appkit.tar.gz");
  const url =
    "https://codeload.github.com/databricks/appkit/tar.gz/refs/heads/main";
  console.log(`Downloading ${url}...`);
  await downloadTarball(url, archive);
  run("tar", ["-xzf", archive], tempDir);

  const extracted = fs
    .readdirSync(tempDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(tempDir, entry.name))
    .find((fullPath) =>
      fs.existsSync(
        path.join(fullPath, "packages/appkit-ui/src/react/ui/examples"),
      ),
    );
  if (!extracted) {
    throw new Error("Could not find appkit-ui examples in downloaded source.");
  }
  return {
    srcDir: path.join(extracted, "packages/appkit-ui/src/react/ui/examples"),
    tempDir,
  };
}

async function main() {
  const { srcDir, tempDir } = await fetchUpstreamExamples();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".example.tsx"))
    .sort();

  const registryEntries = [];

  for (const file of files) {
    const src = fs.readFileSync(path.join(srcDir, file), "utf-8");
    const rewritten = rewriteSource(src);

    const outPath = path.join(OUT_DIR, file);
    fs.writeFileSync(outPath, rewritten, "utf-8");

    const key = file.replace(/\.example\.tsx$/, "");
    const compName = `${toPascal(key)}Example`;
    registryEntries.push({
      key,
      compName,
      file: `./${file.replace(/\.tsx$/, "")}`,
      source: src,
    });
  }

  // Registry file: imports each Example as default, exposes { Component, source }.
  const importLines = registryEntries
    .map((e) => `import ${e.compName} from "${e.file}";`)
    .join("\n");

  const entriesObj = registryEntries
    .map((e) => {
      const escaped = e.source
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "\\${");
      return `  ${JSON.stringify(e.key)}: {\n    Component: ${e.compName},\n    source: \`${escaped}\`,\n  },`;
    })
    .join("\n");

  const registry = `// Auto-generated by scripts/sync-appkit-examples.mjs. Do not edit by hand.\nimport type { ComponentType } from "react";\n${importLines}\n\nexport type DocExampleEntry = { Component: ComponentType; source: string };\n\nexport const docExamples = {\n${entriesObj}\n} as const satisfies Record<string, DocExampleEntry>;\n\nexport type DocExampleKey = keyof typeof docExamples;\n`;

  fs.writeFileSync(path.join(OUT_DIR, "registry.ts"), registry, "utf-8");

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`Wrote ${files.length} examples and registry.`);
}

main().catch((error) => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : String(error),
  );
  process.exit(1);
});
