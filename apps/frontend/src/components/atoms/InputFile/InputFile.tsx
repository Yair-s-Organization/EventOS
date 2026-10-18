import type { InputHTMLAttributes } from "react";

export interface InputFileProps extends InputHTMLAttributes<HTMLInputElement>{
    type: string;
}

export function inputFile({
    type,
    ...restOfProps
} : InputFileProps){
    return (
        <input></input>
    )
}