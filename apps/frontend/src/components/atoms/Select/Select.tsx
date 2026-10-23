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
      className={`bg-white rounded-lg border p-3 font-merriweather text-[16px] ${
        hasError
          ? "border-eventos-error focus:border-eventos-error"
          : "border-secondary focus:ring-blue-100"
      } ${value === "" ? "text-gray-400 text-sm" : "text-gray-900"} ${className}`}
      value={value}
      disabled={disabled}
      {...restOfProps}>
      {placeholder && (
        <option value="" disabled hidden className="text-gray text-[16px]">
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
