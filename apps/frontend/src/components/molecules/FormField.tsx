import { ReactNode } from "react";
import { Label } from "../atoms/Label/Label";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  errorMessage?: string;
  children: ReactNode;
  mensajeAyuda?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  errorMessage,
  children,
  mensajeAyuda,
}: FormFieldProps) {
  return (
    <div className="flex min-w-0 flex-col justify-end gap-1">
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      <span
        aria-live="polite"
        className={`mt-0 block min-h-1 text-xs leading-4 ${
          errorMessage ? "text-red-600" : "text-gray-500"
        }`}>
        {errorMessage ?? mensajeAyuda}
      </span>
    </div>
  );
}
