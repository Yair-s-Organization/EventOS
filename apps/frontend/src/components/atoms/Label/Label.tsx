import type {LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>{
    children: ReactNode;
    required?: boolean;
}

export function Label({
    children,
    htmlFor,
    required = false,
    className = "",
    ...restOfProps
} : LabelProps){
    return(
        <label htmlFor={htmlFor}
        className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
        {...restOfProps}>
            {children}
            {required && <span className="ml-1 text-red-500 font-bold" aria-hidden="true">*</span>}
        </label>
    );
}

export default Label;
