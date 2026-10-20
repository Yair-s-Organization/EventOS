import { useState } from "react";
import type { InputHTMLAttributes, ChangeEvent } from "react";

export interface InputFileProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder"
> {
  accept: "image/*" | ".pdf" | ".docx";
  placeholder?: string;
  hasError?: boolean;
}

export function InputFile({
  accept,
  placeholder = "Sube tu archivo aquí",
  hasError = false,
  disabled = false,
  multiple,
  className = "",
  onChange,
  ...restOfProps
}: InputFileProps) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setFileName("");
    } else if (files.length === 1) {
      setFileName(files[0].name);
    } else {
      setFileName(`${files.length} archivos seleccionados`);
    }
    onChange?.(e);
  };

  return (
    <label
      className={`flex w-full items-center rounded-lg border-2 p-3 text-sm transition-colors focus-within:ring-2 ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "cursor-pointer bg-white"
      } ${
        hasError
          ? "border-red-500 bg-red-50 focus-within:border-red-500 focus-within:ring-red-200"
          : "border-secondary focus-within:border-blue-700 focus-within:ring-blue-100"
      } ${className}`}
    >
      <span
        className={`truncate ${
          fileName && !disabled ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {fileName || placeholder}
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={hasError}
        className="sr-only"
        onChange={handleChange}
        {...restOfProps}
      />
    </label>
  );
}

export default InputFile;