import { useState } from "react";
import type { InputHTMLAttributes, ChangeEvent } from "react";

export interface InputFileProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder"
> {
  accept: "image/*" | ".pdf" | ".docx" | ".jpg";
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
      className={`font-merriweather border-2 text-[16px] flex w-full items-center rounded-lg p-3 text-sm transition-colors focus-within:ring-2 ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : "cursor-pointer bg-white"
      } ${
        hasError
          ? "border-eventos-error focus:border-eventos-error focus:ring-red-200"
          : "border-secondary focus-within:ring-blue-100"
      } ${className}`}>
      <div className="flex w-full min-w-0 items-center justify-between gap-3">
        <span
          className={`min-w-0 truncate ${
            fileName && !disabled ? "text-gray-900" : "text-gray-400"
          }`}>
          {fileName || placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0">
          <circle cx="12" cy="12" r="10" />
          <path d="m16 12-4-4-4 4" />
          <path d="M12 16V8" />
        </svg>
      </div>
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
