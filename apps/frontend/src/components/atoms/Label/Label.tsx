import type {LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>{
    children: ReactNode;
    required?: boolean;
    readOnly?: boolean;
}

export function Label({
    children,
    htmlFor,
    required = false,
    className = "",
    readOnly,
    ...restOfProps
} : LabelProps){
    return(
        <label htmlFor={htmlFor}
        className={`font-merriweather font-medium text-[16px] text-gray-700 mb-1 ${className}`}
        {...restOfProps}>
            {children}
            {required && !readOnly &&(<span className="ml-1 text-red-500 font-bold" aria-hidden="true">*</span>)}
        </label>
    );
}

export default Label;
