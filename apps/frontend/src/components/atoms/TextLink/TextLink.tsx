import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router";

export interface TextLinkProps extends LinkProps {
  children: ReactNode;
}

export function TextLink({
  children,
  to,
  className = "",
  ...restOfProps
}: TextLinkProps) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ri ng-2 focus:ring-blue-400 rounded transition-colors ${className}`}
      {...restOfProps}
    >
      {children}
    </Link>
  );
}

export default TextLink;