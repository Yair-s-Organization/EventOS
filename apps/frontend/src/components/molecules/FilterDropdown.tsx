import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
};

type FilterDropdownProps = {
  label: string;
  allLabel: string;
  allValue?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export function FilterDropdown({
                                 label,
                                 allLabel,
                                 allValue = "",
                                 value,
                                 options,
                                 onChange,
                               }: FilterDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  const selectedOption = options.find(
    (option) => option.value === value,
  );

  const selectedLabel =
    value === allValue
      ? allLabel
      : selectedOption?.label ?? allLabel;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        detailsRef.current.open = false;
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <details
      ref={detailsRef}
      className="relative min-w-0"
      onKeyDown={(event) => {
        if (event.key === "Escape" && detailsRef.current?.open) {
          event.preventDefault();
          detailsRef.current.open = false;
          summaryRef.current?.focus();
        }
      }}
    >
      <summary
        ref={summaryRef}
        aria-label={`${label}: ${selectedLabel}`}
        className="flex h-11 w-full cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-eventos-panel-border bg-eventos-surface px-3 text-sm text-eventos-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary [&::-webkit-details-marker]:hidden"
      >
        <span className="min-w-0 truncate">
          {selectedLabel}
        </span>

        <ChevronDown
          size={18}
          aria-hidden="true"
          className="shrink-0"
        />
      </summary>

      <div
        role="group"
        aria-label={label}
        className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-eventos-panel-border bg-eventos-surface p-1 shadow-lg"
      >
        {[{ value: allValue, label: allLabel }, ...options].map(
          (option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={value === option.value}
              onClick={() => {
                onChange(option.value);

                if (detailsRef.current) {
                  detailsRef.current.open = false;
                }

                summaryRef.current?.focus();
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm break-words text-eventos-ink hover:bg-eventos-primary-light focus-visible:outline-2 focus-visible:outline-eventos-primary aria-pressed:bg-eventos-primary-light"
            >
              {option.label}
            </button>
          ),
        )}
      </div>
    </details>
  );
}