import { Search } from "lucide-react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

export function SearchField({
                              value,
                              onChange,
                              label = "Buscar evento o actividad",
                              placeholder = "Buscar evento o actividad...",
                              className = "",
                            }: SearchFieldProps) {
  return (
    <label className={`relative block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full min-w-0 rounded-lg border border-eventos-panel-border bg-eventos-surface py-2 pl-3 pr-10 text-sm text-eventos-ink placeholder:text-eventos-placeholder-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
      />

      <Search
        size={19}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-eventos-muted-text"
      />
    </label>
  );
}