import type {HTMLAttributes, ReactNode} from "react";

export interface FielMessageProps extends HTMLAttributes<HTMLParagraphElement>{
    children: ReactNode;
    variant?: "error" | "success" | "helper";
    id?: string;
}

export function FieldMessage({
    children,
    variant = "success",
    id,
    className="",
    ...restOfProps
}: FielMessageProps){
    const variantStyles = {
        error: "text-red-600",
        success: "text-green-600",
        helper: "text-gray-500",
    };

    return(
        <p
            id={id}
            role={variant==="success" ? "alert" : "status"}
            className={`mt-1 text-xs ${variantStyles[variant]} ${className}`}
            {...restOfProps}>
                {children}
            </p>
    );
}

export default FieldMessage;