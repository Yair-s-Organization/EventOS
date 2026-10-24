import type { InputHTMLAttributes } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: "text" | "email" | "password" | "number" | "date" | "time" | "file";
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
      className={`font-merriweather text-[16px] bg-white w-full rounded-lg border p-3 text-sm transition-colors outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
        hasError
          ? "border-eventos-error focus:border-eventos-error focus:ring-red-200"
          : "border-secondary focus:ring-blue-100"
      } ${className}`}
      {...restOfProps}
    />
  );
}

export default Input;