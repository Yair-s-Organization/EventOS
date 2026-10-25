import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Spinner } from "../Spinner/Spinner";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline" | "danger"|"success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-eventos-primary text-white hover:bg-eventos-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  outline: "border-2 border-eventos-primary bg-white text-eventos-primary hover:bg-eventos-primary-light",
  success: "bg-eventos-success text-white hover:bg-eventos-success/90",
  danger: "bg-eventos-error text-white hover:bg-eventos-error/90",
};

const sizeStyles = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function Button({
  text,
  icon,
  loading = false,
  loadingText,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  className = "",
  ...restOfProps
}: ButtonProps) {
  return (
    <button
      {...restOfProps}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-merriweather font-semibold
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-eventos-primary
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `}
    >
      {loading ? (
        <Spinner size="sm" aria-hidden="true" />
      ) : (
        icon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {icon}
          </span>
        )
      )}

      <span>
        {loading ? (loadingText ?? text) : text}
      </span>
    </button>
  );
}

export default Button;