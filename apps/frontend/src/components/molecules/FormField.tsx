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
    <div className="flex flex-col gap-2 flex-1">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {errorMessage && (
        <span className="text-xs text-red-500 mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
