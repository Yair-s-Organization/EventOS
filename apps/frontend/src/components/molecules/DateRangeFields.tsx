type DateRangeFieldsProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  className?: string;
};

export function DateRangeFields({
                                  startDate,
                                  endDate,
                                  onStartDateChange,
                                  onEndDateChange,
                                  className = "",
                                }: DateRangeFieldsProps) {
  const inputClassName =
    "h-11 w-full min-w-0 rounded-lg border border-eventos-panel-border bg-eventos-on-primary px-3 text-sm text-eventos-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary";

  return (
    <div
      className={`grid w-full min-w-0 grid-cols-1 gap-3 rounded-lg border border-eventos-panel-border bg-eventos-surface p-4 sm:grid-cols-2 ${className}`}
    >
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-eventos-ink">
          Desde
        </span>

        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(event) =>
            onStartDateChange(event.target.value)
          }
          className={inputClassName}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-eventos-ink">
          Hasta
        </span>

        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(event) =>
            onEndDateChange(event.target.value)
          }
          className={inputClassName}
        />
      </label>
    </div>
  );
}