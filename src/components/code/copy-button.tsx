import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  timeout?: number;
  label?: string;
  className?: string;
  variant?: "default" | "plain" | "segment";
};

export function CopyButton({
  text,
  timeout = 2000,
  label,
  className,
  variant = "default",
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    } catch {
      // Silently fail
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;
  const ariaLabel = isCopied ? "Copied!" : (label ?? "Copy to clipboard");
  const variantClassName =
    variant === "plain"
      ? "size-6 bg-transparent p-0 shadow-none hover:bg-transparent"
      : variant === "segment"
        ? "h-full w-11 rounded-none rounded-r-full shadow-none"
        : "size-6";

  return (
    <Button
      className={cn(variantClassName, className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      aria-label={ariaLabel}
    >
      <Icon size={12} />
    </Button>
  );
}
