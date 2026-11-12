import type { ReactNode } from "react";
import { AlertCircle, CalendarX2, LoaderCircle } from "lucide-react";

type PageStateVariant = "loading" | "error" | "empty";

type PageStateProps = {
  variant: PageStateVariant;
  title: string;
  description?: string | null;
  action?: ReactNode;
};

const icons = {
  loading: LoaderCircle,
  error: AlertCircle,
  empty: CalendarX2,
};

export function PageState({
                            variant,
                            title,
                            description,
                            action,
                          }: PageStateProps) {
  const Icon = icons[variant];

  const iconClassName =
    variant === "error"
      ? "text-eventos-error-strong"
      : "text-eventos-muted-text";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex flex-col items-center justify-center gap-4 rounded-lg px-6 py-10 text-center ${
        variant === "loading"
          ? "min-h-72"
          : "min-h-64 border border-eventos-divider"
      }`}
    >
      <Icon
        size={36}
        className={`${iconClassName} ${
          variant === "loading" ? "animate-spin" : ""
        }`}
        aria-hidden="true"
      />

      <div className="max-w-lg space-y-2">
        <h2 className="text-lg font-semibold text-eventos-ink">
          {title}
        </h2>

        {description && (
          <p className="break-words text-sm text-eventos-muted-text">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}