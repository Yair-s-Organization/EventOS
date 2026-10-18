import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder: string;
  hasError?: boolean;
}

export function Select({
  options,
  placeholder,
  hasError = false,
  className = "",
  ...restOfProps
}: SelectProps) {
  return (
    <select
      className={`${"rounded-lg border p-3"} ${hasError ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-600"} ${className}`}
      {...restOfProps}>
        {placeholder && (
            <option value = "" disabled selected hidden>{placeholder}</option>
        )}
        {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
  );
} 

export default Select;
 