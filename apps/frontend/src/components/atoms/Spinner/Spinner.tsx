import { HTMLAttributes } from "react";


export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    size?: "sm" | "md" | "lg";
    label?: string;
}

const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]"
};

export function Spinner({
    size = "md",
    label = "Loading...",
    className = "",
    ...resOfProps
}: SpinnerProps) {
    return (
        <span
            role="status"
            className={`inline-flex items-center justify-center ${className}`}
            {...resOfProps}
        >
            <span
                aria-hidden="true"
                className={`
                    inline-block shrink-0
                    animate-spin rounded-full
                    border-current border-r-transparent
                    ${sizeStyles[size]}
                `}
            />

            <span className="sr-only">{label}</span>
        </span>
    );
}

export default Spinner;