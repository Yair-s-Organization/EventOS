import { Children, ReactNode } from "react";

export interface CardMetrcasProps {
  titulo: string;
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "neutral";
}

const variantStyles = {
  primary: "border-eventos-primary-light",

  secondary: "border-eventos-secondary-light",

  success: "border-eventos-success/15",

  error: "border-eventos-error/15",

  warning: "border-eventos-warning/40",

  neutral: "border-eventos-neutral",
};

export function CardMetricas({
  titulo,
  children,
  variant = "neutral",
}: CardMetrcasProps) {
  return (
    <div id="contenedorCard border" className={`grid grid-cols-1 gap-5 justify-items-center border w-fit p-5 ${variantStyles[variant]}`}>
    <span className="text-merriweather font-medium text-2xl">{titulo}</span>
      {children}
    </div>
  );
}
