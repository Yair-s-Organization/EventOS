import { PageBackLink } from "../../../components/molecules/PageBackLink";
import { ModalidadAcceso, esModalidadConRegistro } from "@eventos/shared";
import { Link, Navigate, useLocation, useParams } from "react-router";
import { EventDetailsRequestState } from "../../event-details/components/molecules/EventDetailsRequestState";
import { useSubEventDetails } from "../../event-details/hooks/useSubEventDetails";
import { getAuthPathWithReturnUrl } from "../../event-details/utils/eventReturnUrl";
import { useReservationAvailability } from "../hooks/useReservationAvailability";
import {
  reservationsService,
  toSeatMapItems,
} from "../services/reservations.service";
import { ReservationPage } from "./ReservationPage";
import { PageContainer } from "../../../components/templates/PageContainer";

function parseId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) ? parsed : null;
}

const allowedRoles = new Set([
  "Asistente",
  "Usuario Interno",
  "Usuario Externo",
]);

const AVAILABILITY_REFRESH_INTERVAL_MS = 30_000;

export function ReservationRoute() {
  const { idEvento, idSubEvento } = useParams();
  const location = useLocation();

  const eventId = parseId(idEvento);
  const activityId = parseId(idSubEvento);

  const detailPath =
    `/eventos/${idEvento ?? ""}/actividades/${idSubEvento ?? ""}`;

  const validIds = eventId !== null && activityId !== null;

  const {
    event,
    activity,
    status,
    error,
    retry,
  } = useSubEventDetails(eventId, activityId);

  const returnPathState = (location.state as { returnPath?: string } | null)?.returnPath;
  const isSingleActivityEvent = event?.subEventos?.length === 1;
  const isFromEvent = returnPathState === `/eventos/${eventId}` || (!returnPathState && isSingleActivityEvent);

  const backPath = isFromEvent ? `/eventos/${eventId}` : detailPath;
  const backLabel = isFromEvent ? "Volver al evento" : "Volver a la actividad";

  const {
    availability,
    isLoading,
    isRefreshing,
    error: availabilityError,
    refresh,
  } = useReservationAvailability(
    validIds ? activityId : null,
    AVAILABILITY_REFRESH_INTERVAL_MS,
  );

  const token = localStorage.getItem("token");

  let role: unknown = null;

  try {
    role = JSON.parse(
      localStorage.getItem("usuario") || "{}",
    ).tipoCuenta;
  } catch {
    role = null;
  }

  if (!validIds) {
    return (
      <EventDetailsRequestState
        status="invalid"
        error="Los identificadores del evento o la actividad no son válidos."
        onRetry={retry}
      />
    );
  }

  if (!token) {
    return (
      <Navigate
        to={getAuthPathWithReturnUrl("/login", detailPath)}
        replace
      />
    );
  }

  if (typeof role !== "string" || !allowedRoles.has(role)) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 p-6 text-eventos-body-text">
        <h1 className="text-2xl font-bold text-eventos-ink">
          Reservación no disponible para tu cuenta
        </h1>

        <p>Solo las cuentas de asistentes pueden realizar reservaciones.</p>

        <Link
          to={backPath}
          className="font-semibold text-eventos-primary underline"
        >
          {backLabel}
        </Link>
      </section>
    );
  }

  if (status !== "success" || !activity || !event) {
    return (
      <EventDetailsRequestState
        status={status === "success" ? "error" : status}
        error={error}
        onRetry={retry}
      />
    );
  }

  if (
    !esModalidadConRegistro(activity.idModalidadAcceso) ||
    activity.idModalidadAcceso === ModalidadAcceso.ACCESO_LIBRE
  ) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 p-6 text-eventos-body-text">
        <h1 className="text-2xl font-bold text-eventos-ink">
          Actividad de entrada libre
        </h1>

        <p>
          Esta actividad es de acceso libre y no requiere reservación previa.
        </p>

        <Link
          to={backPath}
          className="font-semibold text-eventos-primary underline"
        >
          {backLabel}
        </Link>
      </section>
    );
  }

  if (isLoading && !availability) {
    return (
      <p
        role="status"
        className="mx-auto max-w-6xl px-4 py-8 text-eventos-body-text"
      >
        Consultando disponibilidad...
      </p>
    );
  }

  if (
    !availability ||
    availability.idSubEvento !== activity.idSubEvento
  ) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 p-6 text-eventos-body-text">
        <h1 className="text-2xl font-bold text-eventos-ink">
          No se pudo consultar la disponibilidad
        </h1>

        <p role="alert">
          {availabilityError ||
            "La disponibilidad no corresponde a esta actividad."}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={refresh}
            className="rounded-md bg-eventos-primary px-4 py-2 font-semibold text-eventos-on-primary"
          >
            Reintentar
          </button>

          <Link
            to={backPath}
            className="font-semibold text-eventos-primary underline"
          >
            {backLabel}
          </Link>
        </div>
      </section>
    );
  }

  const canReserve =
    !isLoading &&
    !availabilityError &&
    availability.permiteReservar === true &&
    availability.lugaresDisponibles > 0;

  const mustChooseSeat =
    availability.requiereSeleccionAsiento === true;

  const venue =
    activity.recinto?.nombre ?? availability.recinto.nombre;

  const date = activity.fecha?.fecha ?? "";
  const startTime = activity.fecha?.horaInicio.slice(0, 5) ?? "";
  const endTime = activity.fecha?.horaFin.slice(0, 5) ?? "";

  const submitReservation = async () => {
    try {
      const result = await reservationsService.createReservation({
        idSubEvento: activity.idSubEvento,
      });

      refresh();

      return result;
    } catch (cause: unknown) {
      refresh();
      throw cause;
    }
  };

  return (
    <PageContainer>
      <div className="px-4 pb-4 pt-0 sm:px-6 lg:px-0">
        <PageBackLink
          to={backPath}
          label={backLabel}
        />

      {availabilityError ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-eventos-warning bg-eventos-warning/20 p-4 text-sm text-eventos-body-text"
        >
          {mustChooseSeat
            ? "No se pudo actualizar el mapa de asientos. El sistema intentará actualizarlo automáticamente."
            : "No se pudo actualizar la disponibilidad. Las reservaciones permanecerán deshabilitadas hasta obtener información reciente."}
        </p>
      ) : (
        !canReserve && !mustChooseSeat && (
          <p
            role="status"
            className="mt-5 rounded-lg border border-eventos-warning bg-eventos-warning/20 p-4 font-semibold text-eventos-body-text"
          >
            No hay reservaciones disponibles para esta actividad en este
            momento.
          </p>
        )
      )}

      {mustChooseSeat ? (
        <ReservationPage
          key={activity.idSubEvento}
          mode="manual"
          idSubEvento={activity.idSubEvento}
          eventName={activity.nombre}
          parentEventName={event.nombre}
          date={date}
          startTime={startTime}
          endTime={endTime}
          venue={venue}
          idModalidadAcceso={activity.idModalidadAcceso}
          availableSeats={availability.lugaresDisponibles}
          capacity={availability.cupoEfectivo ?? availability.recinto.aforo}
          isRefreshing={isRefreshing}
          seats={toSeatMapItems(availability.asientos)}
          aisleAfter={[6, 17]}
          canReserve={canReserve}
          onAvailabilityChange={refresh}
        />
      ) : (
        <ReservationPage
          key={activity.idSubEvento}
          mode="automatic"
          eventName={activity.nombre}
          parentEventName={event.nombre}
          date={date}
          startTime={startTime}
          endTime={endTime}
          venue={venue}
          idModalidadAcceso={activity.idModalidadAcceso}
          availableSeats={availability.lugaresDisponibles}
          capacity={availability.cupoEfectivo ?? availability.recinto.aforo}
          isRefreshing={isRefreshing}
          canReserve={canReserve}
          onReserve={() => submitReservation()}
        />
      )}
    </div>
    </PageContainer>
  );
}
