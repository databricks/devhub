import Link from "next/link";

import { Button } from "@/components/ui/button";
import CTA from "@/components/home/cta";

export const MVP_NOMINATION_URL =
  "https://surveys.training.databricks.com/jfe/form/SV_6Ed034QOD4pcQFU";
export const STUDENT_APPLICATION_URL =
  "https://airtable.com/appasC90KmqZ5x1t5/pag6tvR9VUG4Kf1iM/form";

export function CommunityCTA({
  variant,
  theme = "filled",
}: {
  variant: "mvp" | "student" | "student-profile";
  theme?: "filled" | "outline";
}) {
  const mvp = variant === "mvp";
  const application = variant === "student-profile";
  const href = mvp
    ? MVP_NOMINATION_URL
    : application
      ? STUDENT_APPLICATION_URL
      : "/student-fellows/fellows";
  const title = mvp
    ? "Know someone who is making an impact?"
    : application
      ? "Could you be the next Student Fellow?"
      : "What will\nthe future look like?";
  const action = mvp
    ? "Nominate a peer"
    : application
      ? "Become a student fellow"
      : "Browse fellow profiles";
  return (
    <CTA
      theme={theme}
      title={title}
      highlightedText={
        mvp ? "an impact?" : application ? "Student Fellow?" : "the future"
      }
      label={mvp ? "Nominate an MVP" : "Student fellows"}
      className="mx-auto mt-28 max-w-432 pb-16 md:mt-36 lg:mt-40 lg:pb-22 [&_h2]:max-w-232 [&_h2]:grow [&_h2]:whitespace-pre-line"
      actions={
        <Button
          asChild
          variant="orange"
          size="xl"
          className="w-full shrink-0 font-mono text-sm uppercase sm:w-auto sm:self-start sm:text-base lg:ml-auto lg:self-end"
        >
          <Link href={href}>{action}</Link>
        </Button>
      }
    />
  );
}
