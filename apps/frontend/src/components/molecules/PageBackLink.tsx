import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

type PageBackLinkProps = {
  to: string;
  label: string;
};

export function PageBackLink({ to, label }: PageBackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-2 font-semibold text-eventos-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}