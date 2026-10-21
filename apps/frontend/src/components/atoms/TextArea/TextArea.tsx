import type { TextareaHTMLAttributes } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder: string;
  hasError?: boolean;
}

const textStyle = "font-merriweather";

export function TextArea({
  className = "",
  hasError = false,
  ...restOfProps
}: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors focus:ring-2 ${
        hasError 
            ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
            : "border-2 border-secondary focus:border-blue-700 focus:ring-blue-100"}
        ${textStyle} 
        ${className}`}
      {...restOfProps}
    />
  );
}
