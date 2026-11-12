import { useMemo, useState } from "react";
import { useMatch } from "react-router";
import { CatalogEventCard } from "../components/CatalogEventCard";
import { useEventCatalog } from "../hooks/useEventCatalog";
import { PageHeader } from "../../../components/organisms/PageHeader/PageHeader";
import { visibleEvents, type DateFilter } from "../utils/catalogFilters";
import { PageContainer } from "../../../components/templates/PageContainer";
import { SearchField } from "../../../components/molecules/SearchField";
import { FilterDropdown, type FilterOption } from "../../../components/molecules/FilterDropdown";
import { DateRangeFields } from "../../../components/molecules/DateRangeFields";
import { ClearFiltersButton } from "../../../components/molecules/ClearFiltersButton";
import { FeedbackNotice } from "../../../components/molecules/FeedbackNotice";
import { PageState } from "../../../components/organisms/PageState/PageState";

const dateOptions: FilterOption[] = [
  { value: "proximos", label: "Próximos 7 días" },
  { value: "mes_actual", label: "Este mes" },
  { value: "mes_siguiente", label: "Próximo mes" },
  { value: "personalizado", label: "Rango personalizado" },
];

export function EventCatalogPage() {
  const { events, status, error, retry, failedCount } = useEventCatalog();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("todas");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [venue, setVenue] = useState("");

  const venues = useMemo(() =>
    [...new Set(events.flatMap((event) =>
      (event.subEventos ?? []).map((activity) => activity.recinto?.nombre).filter((name): name is string => Boolean(name)),
    ))].sort((a, b) => a.localeCompare(b, "es")),
    [events],
  );

  const filteredEvents = useMemo(
    () =>
      visibleEvents(
        events,
        search,
        dateFilter,
        venue,
        rangeStart,
        rangeEnd,
      ),
    [events, search, dateFilter, venue, rangeStart, rangeEnd],
  );

  const hasFilters = search.trim() !== "" || dateFilter !== "todas" || venue !== "";
  const resetFilters = () => {
    setSearch("");
    setDateFilter("todas");
    setVenue("");
    setRangeStart("");
    setRangeEnd("");
  };

  const isAssistantCatalog = useMatch("/asistente/cartelera") !== null;

  return (
    <PageContainer>
      <div
        className={
          dateFilter === "personalizado"
            ? "mb-4 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between"
            : "mb-6 flex flex-col gap-6 lg:mb-8 xl:flex-row xl:items-start xl:justify-between"
        }
      >
      <div className="min-w-0 xl:max-w-sm xl:shrink-0">
          <PageHeader
            title="Cartelera de Eventos"
            description="Explora los próximos eventos y actividades."
            back={
              isAssistantCatalog
                ? {
                  to: "/menu-asistente",
                  label: "Volver al menú principal",
                }
                : undefined
            }
          />
        </div>

        <div className="w-full min-w-0 space-y-3 xl:max-w-5xl">
          <SearchField
            value={search}
            onChange={setSearch}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <FilterDropdown
                label="Fecha"
                allLabel="Todas las fechas"
                allValue="todas"
                value={dateFilter}
                options={dateOptions}
                onChange={(value) => setDateFilter(value as DateFilter)}
              />
            </div>

            <div className="min-w-0">
              <FilterDropdown
                label="Espacio"
                allLabel="Todos los espacios"
                value={venue}
                options={venues.map((name) => ({
                  value: name,
                  label: name,
                }))}
                onChange={setVenue}
              />
            </div>
          </div>
        </div>
      </div>

      {dateFilter === "personalizado" && (
        <DateRangeFields
          startDate={rangeStart}
          endDate={rangeEnd}
          onStartDateChange={setRangeStart}
          onEndDateChange={setRangeEnd}
          className="mb-3"
        />
      )}

      {hasFilters && (
        <div className="mb-6 flex justify-end">
          <ClearFiltersButton onClick={resetFilters} />
        </div>
      )}

      {status === "loading" && (
        <PageState
          variant="loading"
          title="Cargando eventos próximos..."
        />
      )}

      {status === "error" && (
        <PageState
          variant="error"
          title="No se pudo cargar la cartelera"
          description={error}
          action={
            <button
              type="button"
              onClick={retry}
              className="inline-flex cursor-pointer items-center justify-center rounded-md bg-eventos-primary px-5 py-2 font-semibold text-eventos-on-primary hover:bg-eventos-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
            >
              Reintentar
            </button>
          }
        />
      )}

      {status === "success" && failedCount > 0 && (
        <div className="mb-6">
          <FeedbackNotice
            variant="warning"
            title="No se pudieron cargar todos los eventos"
            action={
              <button
                type="button"
                onClick={retry}
                className="inline-flex cursor-pointer items-center justify-center rounded-md bg-eventos-primary px-4 py-2 text-sm font-semibold text-eventos-on-primary hover:bg-eventos-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
              >
                Reintentar carga
              </button>
            }
          >
            <p>
              {failedCount === 1
                ? "No se pudo recuperar la información de un evento."
                : `No se pudo recuperar la información de ${failedCount} eventos.`}{" "}
              Puedes consultar los eventos disponibles o intentar cargar nuevamente.
            </p>
          </FeedbackNotice>
        </div>
      )}

      {status === "success" &&
        filteredEvents.length === 0 &&
        (events.length > 0 || failedCount === 0) && (
          <PageState
            variant="empty"
            title={
              events.length === 0
                ? "No hay eventos próximos"
                : failedCount > 0
                  ? "No hay coincidencias entre los eventos cargados"
                  : "No encontramos eventos con esos filtros"
            }
          />
        )}

      {status === "success" && filteredEvents.length > 0 && (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            {filteredEvents.length} eventos encontrados
          </p>
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <CatalogEventCard key={event.idEvento} event={event} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
