import { DateInput } from "../atoms/DateInput/DateInput";

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
  return (
    <div
      className={`grid w-full min-w-0 grid-cols-1 gap-3 rounded-lg border border-eventos-panel-border bg-eventos-surface p-4 sm:grid-cols-2 ${className}`}
    >
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-eventos-ink">
          Desde
        </span>

        <DateInput
          variant="filter"
          value={startDate}
          max={endDate || undefined}
          onValueChange={onStartDateChange}
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-eventos-ink">
          Hasta
        </span>

        <DateInput
          variant="filter"
          value={endDate}
          min={startDate || undefined}
          onValueChange={onEndDateChange}
        />
      </label>
    </div>
  );
}