import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

type FeedbackVariant = "error" | "warning" | "success";

type FeedbackNoticeProps = {
  variant: FeedbackVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
};

const variants = {
  error: {
    icon: AlertCircle,
    border: "border-eventos-error",
    color: "text-eventos-error",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-eventos-panel-border",
    color: "text-eventos-ink",
  },
  success: {
    icon: CheckCircle2,
    border: "border-eventos-success",
    color: "text-eventos-success",
  },
};

export function FeedbackNotice({
                                 variant,
                                 title,
                                 children,
                                 action,
                               }: FeedbackNoticeProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={variant === "success" ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-lg border bg-eventos-surface p-4 ${config.border}`}
    >
      <Icon
        size={20}
        className={`mt-0.5 shrink-0 ${config.color}`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 space-y-2">
        {title && (
          <p className="font-semibold text-eventos-ink">
            {title}
          </p>
        )}

        <div className="break-words text-sm text-eventos-ink">
          {children}
        </div>

        {action && (
          <div className="pt-1">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}