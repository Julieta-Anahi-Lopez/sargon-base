type Variant = "brand" | "neutral" | "success" | "warning" | "danger";

const cls: Record<Variant, string> = {
  brand:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  neutral: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface Props {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls[variant]} ${className}`}>
      {children}
    </span>
  );
}
