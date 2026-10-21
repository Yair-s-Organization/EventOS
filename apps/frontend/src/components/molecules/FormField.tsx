import { ReactNode } from "react";
import { Label } from "../atoms/Label/Label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  errorMessage?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  errorMessage,
  children,
}: FormFieldProps) {
  return (
    <div className="flex min-w-0 flex-col justify-end gap-1">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      <span
        aria-live="polite"
        className="mt-1 block min-h-5 text-xs leading-4 text-red-600">
        {errorMessage ?? ""}
      </span>
    </div>
  );
}
