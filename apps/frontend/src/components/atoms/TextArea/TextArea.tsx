import type { TextareaHTMLAttributes } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder: string;
  hasError?: boolean;
}

const textStyle = "font-merriweather text-[16px]";

export function TextArea({
  className = "",
  hasError = false,
  ...restOfProps
}: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors focus:ring-2 ${
        hasError 
            ? "border-eventos-error focus:border-eventos-error focus:ring-red-200" 
            : "border-secondary focus:ring-blue-100"}
        ${textStyle} 
        ${className}`}
      {...restOfProps}
    />
  );
}
