import type {TextareaHTMLAttributes } from "react";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>{
    placeholder: string;
    hasError?: boolean;
}

const textStyle = "font-merriweather"

export function TextArea({
    className = "",
    hasError = false,
    ...restOfProps
} : TextAreaProps){
    return(
       <textarea
      className={`w-full rounded-lg border p-3 text-sm outline-none transition-colors 
        ${hasError ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-600"}
        ${textStyle} 
        ${className}`}
      {...restOfProps}
    />
    )
}

