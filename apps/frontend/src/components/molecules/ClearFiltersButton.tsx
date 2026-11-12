import { RotateCcw } from "lucide-react";

type ClearFiltersButtonProps = {
  onClick: () => void;
};

export function ClearFiltersButton({
                                     onClick,
                                   }: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md text-sm font-semibold text-eventos-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
    >
      <RotateCcw size={16} aria-hidden="true" />
      Limpiar filtros
    </button>
  );
}