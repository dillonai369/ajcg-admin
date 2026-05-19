import { ReactNode } from "react";

export type PillVariant = "green" | "amber" | "blue" | "gray" | "red" | "purple";

export default function Pill({
  variant = "gray",
  children,
  className = "",
}: {
  variant?: PillVariant;
  children: ReactNode;
  className?: string;
}) {
  return <span className={`pill pill-${variant} ${className}`}>{children}</span>;
}
