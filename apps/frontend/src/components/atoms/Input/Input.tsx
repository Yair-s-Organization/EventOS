import type { InputHTMLAttributes } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: "text" | "email" | "password" | "number" | "date" | "time";
  hasError?: boolean;
}

export function Input({
  type = "text",
  hasError = false,
  disabled = false,
  className = "",
  ...restOfProps
}: InputProps) {
  return (
    <input
      type={type}
      disabled={disabled}
      aria-invalid={hasError}
      className={`w-full rounded-lg border p-3 text-sm transition-colors outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
        hasError
          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
          : "border-gray-300 focus:border-blue-600 focus:ring-blue-100"
      } ${className}`}
      {...restOfProps}
    />
  );
}

export default Input;