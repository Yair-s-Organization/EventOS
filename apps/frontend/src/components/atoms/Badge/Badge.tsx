import type {
  HTMLAttributes,
  ReactNode
} from "react";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "neutral";
  size?: "sm" | "md";
}

const variantStyles = {
  primary:
    "bg-eventos-primary-light text-eventos-primary",

  secondary:
    "bg-eventos-secondary-light text-secondary",

  success:
    "bg-eventos-success/15 text-eventos-success",

  error:
    "bg-eventos-error/15 text-eventos-error",

  warning:
    "bg-eventos-warning/40 text-yellow-950",

  neutral:
    "bg-eventos-neutral text-gray-800",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  ...restOfProps
}: BadgeProps) {
  return (
    <span
      {...restOfProps}
      className={`
        inline-flex items-center justify-center
        rounded-full font-merriweather font-semibold
        whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;