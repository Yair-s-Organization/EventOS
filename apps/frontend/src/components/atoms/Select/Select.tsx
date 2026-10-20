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
  value,
  hasError = false,
  className = "",
  disabled = false,
  ...restOfProps
}: SelectProps) {
  return (
    <select
      className={`bg-white rounded-lg border-2 p-3 border-secondary font-merriweather ${
        value === "" ? "text-gray-400 text-sm" : "text-gray-900"
      } ${hasError ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-2 focus:border-blue-700"} ${className}`}
      value={value}
      disabled={disabled}
      {...restOfProps}>
      {placeholder && (
        <option value="" disabled hidden className="text-gray">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-900">
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
